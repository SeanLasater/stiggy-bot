import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, AutocompleteInteraction, Colors } from 'discord.js';

// Type for individual gears
type Gear = '1st' | '2nd' | '3rd' | '4th' | '5th' | '6th';

// Type for a full transmission tune
type TransmissionTune = {
  finalDrive: number;
  gears: Record<Gear, number>;
};

// Database of tunes by track name (lowercase for matching)
const transmissionTunes: Record<string, TransmissionTune> = {
  '24 heures du mans racing circuit': {
    finalDrive: 2.800,
    gears: {
      '1st': 3.800,
      '2nd': 2.600,
      '3rd': 1.900,
      '4th': 1.400,
      '5th': 1.100,
      '6th': 0.900,
    },
  },
  'alsace': {
    finalDrive: 3.500,
    gears: {
      '1st': 4.000,
      '2nd': 2.800,
      '3rd': 2.000,
      '4th': 1.500,
      '5th': 1.200,
      '6th': 0.950,
    },
  },
  'autodrome lago maggiore': {
        finalDrive: 3.200,
        gears: {
            '1st': 3.900,
            '2nd': 2.700,
            '3rd': 1.950,
            '4th': 1.450,
            '5th': 1.150,
            '6th': 0.850
        }
    },
    'autódromo de interlagos': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    },
    'autodromo nazionale monza': {
        finalDrive: 3.000,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'autopolis international racing course': {
        finalDrive: 3.300,
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'blue moon bay speedway': {
        finalDrive: 3.600,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'brands hatch': {
        finalDrive: 3.700,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'broad bean raceway': {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'circuit de barcelona-catalunya': {
        finalDrive: 3.200,
        gears: {
            '1st': 3.900,
            '2nd': 2.700,
            '3rd': 1.950,
            '4th': 1.450,
            '5th': 1.150,
            '6th': 0.850,
        }
    },
    'circuit de sainte-croix': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    },
    'circuit de spa-francorchamps': {
        finalDrive: 3.100,
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    "colorado springs": {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'daytona international speedway': {
        finalDrive: 2.900,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'deep forest raceway': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    },
    'dragon trail': {
        finalDrive: 3.600,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'eiger nordwand': {
        finalDrive: 3.800,
        gears: {
            '1st': 4.300,
            '2nd': 3.000,
            '3rd': 2.200,
            '4th': 1.700,
            '5th': 1.400,
            '6th': 1.100,
        }
    },
    'fisherman’s ranch': {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'fuji international speedway': {
        finalDrive: 3.100,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'goodwood motor circuit': {
        finalDrive: 3.800,
        gears: {
            '1st': 4.300,
            '2nd': 3.000,
            '3rd': 2.200,
            '4th': 1.700,
            '5th': 1.400,
            '6th': 1.100,
        }
    },
    'grand valley': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    },
    'high speed ring': {
        finalDrive: 3.000,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'kyoto driving park': {
        finalDrive: 4.000,
        gears: {
            '1st': 4.500,
            '2nd': 3.100,
            '3rd': 2.300,
            '4th': 1.800,
            '5th': 1.500,
            '6th': 1.200,
        }
    },
    'lake louise': {
        finalDrive: 3.600,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'michelin raceway road atlanta': {
        finalDrive: 3.300,
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'mount panorama circuit': {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'northern isle speedway': {
        finalDrive: 3.700,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'nürburgring': {
        finalDrive: 3.200,
        gears: {
            '1st': 3.900,
            '2nd': 2.700,
            '3rd': 1.950,
            '4th': 1.450,
            '5th': 1.150,
            '6th': 0.850,
        }
    },
    'red bull ring': {
        finalDrive: 3.300,
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'sardegna - road track': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    },
    'sardegna - windmills': {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'special stage route x': {
        finalDrive: 2.800,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'suzuka circuit': {
        finalDrive: 3.100,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'tokyo expressway': {
        finalDrive: 3.000,  
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'trial mountain circuit': {
        finalDrive: 3.600,
        gears: {
            '1st': 4.200,
            '2nd': 2.900,
            '3rd': 2.100,
            '4th': 1.600,
            '5th': 1.300,
            '6th': 1.000,
        }
    },
    'tsukuba circuit': {
        finalDrive: 4.200,
        gears: {
            '1st': 4.800,
            '2nd': 3.300,
            '3rd': 2.400,
            '4th': 1.900,
            '5th': 1.600,
            '6th': 1.300,
        }
    },
    'watkins glen international': {
        finalDrive: 3.300,
        gears: {
            '1st': 3.800,
            '2nd': 2.600,
            '3rd': 1.900,
            '4th': 1.400,
            '5th': 1.100,
            '6th': 0.900,
        }
    },
    'weathertech raceway laguna seca': {
        finalDrive: 3.500,
        gears: {
            '1st': 4.000,
            '2nd': 2.800,
            '3rd': 2.000,
            '4th': 1.500,
            '5th': 1.200,
            '6th': 0.950,
        }
    },
    'willow springs international raceway': {
        finalDrive: 3.400,
        gears: {
            '1st': 3.700,
            '2nd': 2.500,
            '3rd': 1.850,
            '4th': 1.350,
            '5th': 1.050,
            '6th': 0.850,
        }
    }
};

// The slash command definition
export const data = new SlashCommandBuilder()
  .setName('tune-transmission')
  .setDescription('Get optimal transmission ratios for a specific track')
  .addStringOption(option =>
    option
      .setName('track') 
      .setDescription('The name of the track')
      .setRequired(true)
      .setAutocomplete(true) // We'll add autocomplete later for ease of use
  );

  // Execute function for the command
  export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply(); // Tells Discord "I'm working on it"

  const rawTrack = interaction.options.getString('track', true); // Get track input from user
  const track = rawTrack.toLowerCase().trim(); // Normalize for matching

  const tune = transmissionTunes[track]; // Lookup the tune

  if (!tune) {
    // No match — helpful error
    await interaction.editReply({
      content: `❌ Sorry, I don't have transmission data for "**${rawTrack}**" yet.\n\nAvailable tracks:\n${Object.keys(transmissionTunes)
        .map(t => `• ${capitalizeTrack(t)}`)
        .join('\n')}`,
    });
    return;
  }


  // Build the pretty response
  const embed = new EmbedBuilder()
    .setColor(Colors.Blurple)
    .setTitle(`Transmission Tune: ${capitalizeTrack(track)}`)
    .setDescription('Optimal ratios for acceleration and top speed balance.')
    .addFields(
      { name: 'Final Drive', value: tune.finalDrive.toFixed(3), inline: true },
      { name: '1st', value: tune.gears['1st'].toFixed(3), inline: true },
      { name: '2nd', value: tune.gears['2nd'].toFixed(3), inline: true },
      { name: '3rd', value: tune.gears['3rd'].toFixed(3), inline: true },
      { name: '4th', value: tune.gears['4th'].toFixed(3), inline: true },
      { name: '5th', value: tune.gears['5th'].toFixed(3), inline: true },
      { name: '6th', value: tune.gears['6th'].toFixed(3), inline: true },
      // ... all other gears
    )
    .setFooter({ text: 'Generated by Stiggy | Test in-game' });

  await interaction.editReply({ embeds: [embed] });
}

// Autocomplete handler for track names
export async function autocomplete(interaction: AutocompleteInteraction) {
  const focused = interaction.options.getFocused(true); // Get what they're typing

  // Only handle the 'track' option
  if (focused.name !== 'track') return;

  const input = focused.value.toLowerCase().trim();

  // Get all track names and filter by what they've typed
  const allTracks = Object.keys(transmissionTunes);
  const filtered = allTracks.filter(track => track.includes(input));

  // Sort by how well it matches (starts with > contains)
  filtered.sort((a, b) => {
    const aStarts = a.startsWith(input);
    const bStarts = b.startsWith(input);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;
    return a.length - b.length; // shorter first
  });

  // Limit to 25 (Discord max)
  const choices = filtered.slice(0, 25).map(track => ({
    name: capitalizeTrack(track),
    value: track,
  }));

  await interaction.respond(choices);
}

// Helper to capitalize track names nicely
function capitalizeTrack(track: string): string {
  return track
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Export default for command registration
export default { data, execute, autocomplete, };