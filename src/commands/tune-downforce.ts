// src/commands/tune-downforce.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────
const gripDict: Record<string, number> = {
  ch: 0.82, cm: 0.90, cs: 0.99,
  sh: 1.05, sm: 1.09, ss: 1.16,
  rh: 1.25, rm: 1.29, rs: 1.33,
};

const tireNames: Record<string, string> = {
  CH: 'Comfort Hard',   CM: 'Comfort Medium', CS: 'Comfort Soft',
  SH: 'Sports Hard',    SM: 'Sports Medium',  SS: 'Sports Soft',
  RH: 'Racing Hard',    RM: 'Racing Medium',  RS: 'Racing Soft',
};

// ──────────────────────────────────────────────────────────────
// Calculation
// ──────────────────────────────────────────────────────────────
type SuccessResult = {
  frontDF: string;
  rearDF: string;
  frontNF: string;
  rearNF: string;
  grip: string;
  tireDisplay: string;
};

type ErrorResult = {
  error: string;
};

type TuneResult = SuccessResult | ErrorResult;

function calculateGripTune(weightLbs: number, frontPercent: number, tire: string): TuneResult {
  const tireKey = tire.toLowerCase();
  const grip = gripDict[tireKey] ?? 1.0;

  if (frontPercent < 30 || frontPercent > 70) {
    return { error: 'Front weight % must be between 30 and 70.' };
  }

  const frontRatio = frontPercent / 100;
  const rearRatio = 1 - frontRatio;

  const frontWeight = weightLbs * frontRatio;
  const rearWeight = weightLbs * rearRatio;

  // Natural Frequency
  const baseNF = grip * 2.0;
  const frontNF = Math.max(1.40, Math.min(3.30, baseNF * 1.06));
  const rearNF = Math.max(1.40, Math.min(3.30, baseNF * 0.94));

  // Downforce
  const dfPerLb = 0.11;
  const frontDF = Math.max(0, Math.min(300, frontWeight * grip * dfPerLb));
  const rearDF = Math.max(0, Math.min(300, rearWeight * grip * dfPerLb));

  return {
    frontDF: frontDF.toFixed(1),
    rearDF: rearDF.toFixed(1),
    frontNF: frontNF.toFixed(2),
    rearNF: rearNF.toFixed(2),
    grip: grip.toFixed(2),
    tireDisplay: tireNames[tire.toUpperCase()] || tire.toUpperCase(),
  };
}

// ──────────────────────────────────────────────────────────────
// Command
// ──────────────────────────────────────────────────────────────
export default {
  data: new SlashCommandBuilder()
    .setName('tune-downforce')
    .setDescription('GT7 grip-optimized downforce & natural frequency')
    .addNumberOption(opt =>
      opt.setName('weight')
        .setDescription('Car weight in pounds (lbs)')
        .setRequired(true)
        .setMinValue(1000)
        .setMaxValue(5000)
    )
    .addNumberOption(opt =>
      opt.setName('front')
        .setDescription('Front weight distribution % (e.g. 54)')
        .setRequired(true)
        .setMinValue(30)
        .setMaxValue(70)
    )
    .addStringOption(opt =>
      opt.setName('tire')
        .setDescription('Tire compound')
        .setRequired(true)
        .addChoices(
          { name: 'Comfort Hard',   value: 'ch' },
          { name: 'Comfort Medium', value: 'cm' },
          { name: 'Comfort Soft',   value: 'cs' },
          { name: 'Sports Hard',    value: 'sh' },
          { name: 'Sports Medium',  value: 'sm' },
          { name: 'Sports Soft',    value: 'ss' },
          { name: 'Racing Hard',    value: 'rh' },
          { name: 'Racing Medium',  value: 'rm' },
          { name: 'Racing Soft',    value: 'rs' },
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const weight = interaction.options.getNumber('weight', true);
    const front  = interaction.options.getNumber('front', true);
    const tire   = interaction.options.getString('tire', true);

    const result = calculateGripTune(weight, front, tire);

    // ───── Error case ─────
    if ('error' in result) {
      const embed = new EmbedBuilder()
        .setTitle('Invalid Input')
        .setDescription(result.error)
        .setColor(0xff0000);
      return interaction.editReply({ embeds: [embed] });
    }

    // ───── Success case ─────
    const embed = new EmbedBuilder()
      .setTitle('GT7 Grip-Optimized Tuning')
      .setColor(0xffd700) // gold
      .addFields(
        { name: 'Weight', value: `${weight.toLocaleString()} lbs`, inline: false },
        { name: 'Balance', value: `${front}% Front │ ${100 - front}% Rear`, inline: false },
        { name: 'Tire', value: `${result.tireDisplay} (Grip: ${result.grip}g)`, inline: false },
        {
          name: '**FRONT**',
          value: `\`\`\`Downforce: ${result.frontDF.padStart(6)}\nNat Freq : ${result.frontNF} Hz\`\`\``,
          inline: true,
        },
        {
          name: '**REAR**',
          value: `\`\`\`Downforce: ${result.rearDF.padStart(6)}\nNat Freq : ${result.rearNF} Hz\`\`\``,
          inline: true,
        }
      )
      .setFooter({ text: 'Pure grip focus • No speed trade-off • Values in lbs' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};