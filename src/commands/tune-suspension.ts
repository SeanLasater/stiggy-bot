// src/commands/tune-suspension.ts
import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

function calculateSuspensionTune(
  drivetrain: string,
  weight: number,
  balance: number,
  tire: string,
  frontDownforce: number,
  rearDownforce: number
) {
  const gripFactor = { 
    CH: 0.82, CM: 0.90, CS: 0.99,
    SH: 1.05, SM: 1.09, SS: 1.16,
    RH: 1.25, RM: 1.29, RS: 1.33 }[tire] || 1.0;
  const totalDownforce = frontDownforce + rearDownforce;
  const dfFactor = Math.min(totalDownforce / weight, 0.5);
  const frontDfRatio = frontDownforce / Math.max(totalDownforce, 1);
  const rearDfRatio = rearDownforce / Math.max(totalDownforce, 1);

  // Natural Frequency (Hz)
  const baseFreq = 2.2;
  const frontFreq = baseFreq + 
    (weight / 3000 * 0.6 * gripFactor) + 
    ((balance - 50) / 50 * 0.15) + 
    (frontDfRatio * dfFactor * 0.5);
  const rearFreq = baseFreq * 0.58 + 
    (weight / 3000 * 0.5 * gripFactor) + 
    ((50 - balance) / 50 * 0.15) + 
    (rearDfRatio * dfFactor * 0.4);

  // Compression & Rebound (20–50 / 30–60)
  const frontComp = Math.round(30 + (frontFreq * 5) + (gripFactor * 5) + (frontDfRatio * 5));
  const rearComp = Math.round(28 + (rearFreq * 5) + (gripFactor * 5) + (rearDfRatio * 5));
  const frontRebound = Math.round(40 + (frontFreq * 6) + (gripFactor * 4) + (frontDfRatio * 4));
  const rearRebound = Math.round(38 + (rearFreq * 6) + (gripFactor * 4) + (rearDfRatio * 6));

  // Anti-Roll Bars (1–10)
  const frontARB = Math.round(4 + (frontFreq / 3) + (drivetrain === 'FF' ? 1 : 0) + (frontDfRatio * 1.5));
  const rearARB = Math.round(3 + (rearFreq / 3) + (['FR', 'MR', 'RR'].includes(drivetrain) ? 1 : 0) + (rearDfRatio * 1.2));

  // Ride Height (mm)
  const frontHeight = Math.round(95 - (frontDfRatio * dfFactor * 20) - (gripFactor * 5));
  const rearHeight = Math.round(frontHeight - (drivetrain === 'FR' || drivetrain === 'MR' || drivetrain === 'RR' ? 3 : 0) + (rearDfRatio * dfFactor * 10));

  // Camber & Toe
  const frontCamber = (2.0 + gripFactor * 0.5 + frontDfRatio * dfFactor * 0.4).toFixed(1);
  const rearCamber = (parseFloat(frontCamber) + 0.3 + rearDfRatio * dfFactor * 0.2).toFixed(1);
  const frontToe = -0.08;
  const rearToe = 0.10;

  return {
    frontHeight,
    rearHeight,
    frontSpring: frontFreq.toFixed(2),
    rearSpring: rearFreq.toFixed(2),
    frontComp: Math.min(50, Math.max(20, frontComp)),
    rearComp: Math.min(50, Math.max(20, rearComp)),
    frontRebound: Math.min(60, Math.max(30, frontRebound)),
    rearRebound: Math.min(60, Math.max(30, rearRebound)),
    frontARB: Math.min(10, Math.max(1, frontARB)),
    rearARB: Math.min(10, Math.max(1, rearARB)),
    frontCamber,
    rearCamber,
    frontToe: frontToe.toFixed(2),
    rearToe: rearToe.toFixed(2),
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName('tune-suspension')
    .setDescription('Calculate competitive suspension tune for GT7 (stability + lap times).')
    .addStringOption(option =>
      option.setName('drivetrain')
        .setDescription('Drivetrain type')
        .setRequired(true)
        .addChoices(
          { name: 'FF (Front-Wheel Drive)', value: 'FF' },
          { name: 'FR (Front-Engine Rear-Drive)', value: 'FR' },
          { name: 'MR (Mid-Engine Rear-Drive)', value: 'MR' },
          { name: 'RR (Rear-Engine Rear-Drive)', value: 'RR' }
        ))
    .addIntegerOption(option =>
      option.setName('weight')
        .setDescription('Car weight in lbs')
        .setRequired(true)
        .setMinValue(1000)
        .setMaxValue(5000))
    .addIntegerOption(option =>
      option.setName('balance')
        .setDescription('Front weight balance % (e.g., 55 for 55/45)')
        .setRequired(true)
        .setMinValue(40)
        .setMaxValue(60))
    .addStringOption(option =>
      option.setName('tire')
        .setDescription('Tire compound')
        .setRequired(true)
        .addChoices(
          { name: 'CH (Comfort Hard)', value: 'CH' },
          { name: 'CS (Comfort Hard)', value: 'CM' },
          { name: 'CH (Comfort Hard)', value: 'CS' },
          { name: 'SH (Sports Hard)', value: 'SH' },
          { name: 'SM (Sports Medium)', value: 'SM' },
          { name: 'SS (Sports Soft)', value: 'SS' },
          { name: 'RH (Racing Hard)', value: 'RH' },
          { name: 'RM (Racing Medium)', value: 'RM' },
          { name: 'RS (Racing Soft)', value: 'RS' }
        ))
    .addIntegerOption(option =>
      option.setName('front-downforce')
        .setDescription('Front downforce in lbs')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(1000))
    .addIntegerOption(option =>
      option.setName('rear-downforce')
        .setDescription('Rear downforce in lbs')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(1000)),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const drivetrain = interaction.options.getString('drivetrain', true);
      const weight = interaction.options.getInteger('weight', true);
      const balance = interaction.options.getInteger('balance', true);
      const tire = interaction.options.getString('tire', true);
      const frontDownforce = interaction.options.getInteger('front-downforce', true);
      const rearDownforce = interaction.options.getInteger('rear-downforce', true);

      const tune = calculateSuspensionTune(drivetrain, weight, balance, tire, frontDownforce, rearDownforce);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Suspension Tune: ${drivetrain} | ${weight} lbs | ${balance}/${100-balance} | ${tire} | DF ${frontDownforce}/${rearDownforce}`)
        .setDescription('Competitive setup: stability + lap times. Test and adjust on track.')
        .addFields(
          { name: 'Natural Frequency (Hz)', value: `Front: ${tune.frontSpring}\nRear: ${tune.rearSpring}`, inline: true },
          { name: 'Anti-Roll Bars (1–10)', value: `Front: ${tune.frontARB}\nRear: ${tune.rearARB}`, inline: true },
          { name: 'Compression (20–50)', value: `Front: ${tune.frontComp}\nRear: ${tune.rearComp}`, inline: true },
          { name: 'Rebound (30–60)', value: `Front: ${tune.frontRebound}\nRear: ${tune.rearRebound}`, inline: true },
          { name: 'Ride Height (mm)', value: `Front: ${tune.frontHeight}\nRear: ${tune.rearHeight}`, inline: true },
          { name: 'Camber (degrees)', value: `Front: -${tune.frontCamber}\nRear: -${tune.rearCamber}`, inline: true },
          { name: 'Toe (degrees)', value: `Front: ${tune.frontToe}\nRear: ${tune.rearToe}`, inline: true }
        )
        .setFooter({ text: 'Generated by Stiggy | Tune and test on track' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Suspension command failed:', error);
      await interaction.editReply({ content: 'Error calculating suspension tune — check inputs!' });
    }
  },
};