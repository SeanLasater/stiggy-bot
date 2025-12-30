// src/index.ts
import {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
  REST,
  Routes,
} from 'discord.js';
import { readdirSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';
import './database/firebase'; // ← initializes Firebase on startup
import http, { Server } from 'http';

const TOKEN = process.env.DISCORD_TOKEN!;
if (!TOKEN) throw new Error('DISCORD_TOKEN missing in .env');

// Dummy health check server for Cloud Run
const healthServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Stiggy is alive and tuning cars 24/7! 🚗💨');
});

const port = Number(process.env.PORT) || 8080;
healthServer.listen(port, '0.0.0.0', () => {
  console.log(`Health check server listening on port ${port}`);
});

// Extend Client so TypeScript knows about client.commands
interface ExtendedClient extends Client {
  commands: Collection<string, any>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel],
}) as ExtendedClient;

client.commands = new Collection();

// ──────────────────────────────────────────────────────
// Load commands into memory (for execution)
async function loadCommands() {
  const isDev = process.env.NODE_ENV !== 'production';
  const ext = isDev ? '.ts' : '.js';
  const commandsPath = join(__dirname, 'commands');
  const files = readdirSync(commandsPath).filter(f => f.endsWith(ext) && !f.startsWith('_'));

  for (const file of files) {
    const filePath = join(commandsPath, file);
    // Clear cache for hot-reload in dev
    if (isDev) delete require.cache[require.resolve(filePath)];

    const command = (await import(filePath)).default;
    if (command?.data?.name) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: /${command.data.name}`);
    }
  }
}

// ───────────────────────────────────────────────────────
// Register slash commands in every guild the bot is in (fast for dev/testing)
async function registerCommands() {
  const isDev = process.env.NODE_ENV !== 'production';
  const ext = isDev ? '.ts' : '.js';

  const commands = [];
  const commandsPath = join(__dirname, 'commands');
  const files = readdirSync(commandsPath).filter(f => f.endsWith(ext));

  for (const file of files) {
    const command = (await import(join(commandsPath, file))).default;
    if (command?.data) commands.push(command.data.toJSON());
  }

  if (commands.length === 0) {
    console.log('No commands found to register');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(TOKEN);

  console.log(`Registering ${commands.length} command(s) to all guilds...`);

  for (const guild of client.guilds.cache.values()) {
    try {
      await rest.put(Routes.applicationGuildCommands(client.user!.id, guild.id), {
        body: commands,
      });
      console.log(`Registered commands → ${guild.name}`);
    } catch (err) {
      console.error(`Failed in ${guild.name}:`, err);
    }
  }
}

// ──────────────────────────────────────────────────────
// Events
client.once('clientReady', (c) => {
  if (!c.user) return;
  console.log(`Logged in as ${c.user.tag}`);
  console.log(`Serving ${c.guilds.cache.size} guild(s)`);
  console.log('Stiggy is online and ready to tune cars');
  c.user.setActivity('GT7 | /help', { type: 0 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const reply = { content: 'There was an error executing that command!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

// ──────────────────────────────────────────────────────
// Start everything
(async () => {
  await loadCommands();
  await client.login(TOKEN);

  // Register commands once the bot is fully ready
  client.once('clientReady', registerCommands);
})();