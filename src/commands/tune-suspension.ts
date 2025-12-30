import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

// Helper function for calculations
function calculateSuspensionTune(
  drivetrain: string,
  weight: number,
  balance: number,
  tire: string,
  downforce: number
) {
  
  // Base multipliers
  const gripFactor = {
    ch: 0.82, cm: 0.90, cs: 0.99,
    sh: 1.05, sm: 1.09, ss: 1.16,
    rh: 1.25, rm: 1.29, rs: 1.33, 
  
    // Tire grip scaling
  }[tire] || 1.0; 
  
  // Aero contribution to grip
  const dfFactor = downforce / weight; 

  // Ride height (mm) - Lower for grip, higher for compliance
  const frontHeight = 100 - (weight * 0.02 * gripFactor) + (balance * 0.1);
  const rearHeight = frontHeight - (drivetrain === 'FR' || drivetrain === 'MR' || drivetrain === 'RR' ? 5 : 0) + (dfFactor * 10);

  // Spring rate (Hz) - Stiffer for nimble, balanced for grip
  const frontFreq = 1.8 + (weight / 3000 * 0.8 * gripFactor) + (balance / 50 - 1) * 0.2 + (dfFactor * 0.3);
  const rearFreq = 1.8 + (weight / 3000 * 0.75 * gripFactor) + ((100 - balance) / 50 - 1) * 0.2 + (dfFactor * 0.25);

  // Dampers (compression/rebound) - % of spring rate
  const frontComp = frontFreq * 0.6;
  const rearComp = rearFreq * 0.6;
  const frontRebound = frontFreq * 0.8;
  const rearRebound = rearFreq * 0.8;

  // Anti-roll bars (kgf/mm) - Balance rotation
  const frontARB = (balance > 50 ? frontFreq * 0.4 : frontFreq * 0.3) + (drivetrain === 'FF' ? 2 : 0);
  const rearARB = (balance < 50 ? rearFreq * 0.4 : rearFreq * 0.3) + (drivetrain === 'RR' ? 2 : 0);

  // Camber (degrees negative) & Toe (degrees)
  const frontCamber = 1.5 + (gripFactor * 0.5) + (dfFactor * 0.2);
  const rearCamber = frontCamber + (drivetrain === 'FR' ? 0.5 : 0);
  const frontToe = -0.05; // Slight toe-out for nimble entry
  const rearToe = 0.05; // Toe-in for stability

  return {
    frontHeight: Math.round(frontHeight),
    rearHeight: Math.round(rearHeight),
    frontSpring: frontFreq.toFixed(2),
    rearSpring: rearFreq.toFixed(2),
    frontComp: Math.round(frontComp),
    rearComp: Math.round(rearComp),
    frontRebound: Math.round(frontRebound),
    rearRebound: Math.round(rearRebound),
    frontARB: Math.round(frontARB),
    rearARB: Math.round(rearARB),
    frontCamber: frontCamber.toFixed(1),
    rearCamber: rearCamber.toFixed(1),
    frontToe: frontToe.toFixed(2),
    rearToe: rearToe.toFixed(2),
  };
}

export default {
  data: new SlashCommandBuilder()
    .setName('tune-suspension')
    .setDescription('Calculate sturdy, nimble suspension tune for GT7 (good grip, high G-force).')
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
          { name: 'SH (Sports Hard)', value: 'SH' },
          { name: 'SM (Sports Medium)', value: 'SM' },
          { name: 'SS (Sports Soft)', value: 'SS' },
          { name: 'RH (Racing Hard)', value: 'RH' },
          { name: 'RM (Racing Medium)', value: 'RM' },
          { name: 'RS (Racing Soft)', value: 'RS' }
        ))
    .addIntegerOption(option =>
      option.setName('downforce')
        .setDescription('Total downforce in lbs')
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
      const downforce = interaction.options.getInteger('downforce', true);

      const tune = calculateSuspensionTune(drivetrain, weight, balance, tire, downforce);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(`Suspension Tune for ${drivetrain} (Weight ${weight} lbs, Balance ${balance}/${
          100 - balance
        }, ${tire} Tires, ${downforce} lbs DF)`)
        .setDescription('Sturdy yet nimble setup for max grip and G-forces. Test and adjust in-game.')
        .addFields(
          { name: 'Ride Height (mm)', value: `Front: ${tune.frontHeight}\nRear: ${tune.rearHeight}`, inline: true },
          { name: 'Spring Rate (Hz)', value: `Front: ${tune.frontSpring}\nRear: ${tune.rearSpring}`, inline: true },
          { name: 'Compression', value: `Front: ${tune.frontComp}\nRear: ${tune.rearComp}`, inline: true },
          { name: 'Rebound', value: `Front: ${tune.frontRebound}\nRear: ${tune.rearRebound}`, inline: true },
          { name: 'Anti-Roll Bars (kgf/mm)', value: `Front: ${tune.frontARB}\nRear: ${tune.rearARB}`, inline: true },
          { name: 'Camber (degrees)', value: `Front: -${tune.frontCamber}\nRear: -${tune.rearCamber}`, inline: true },
          { name: 'Toe (degrees)', value: `Front: ${tune.frontToe}\nRear: ${tune.rearToe}`, inline: true }
        )
        .setFooter({ text: 'Generated by Stiggy | Tune and test on track' });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Command failed:', error);
      await interaction.editReply({ content: 'Error calculating suspension tune — try again or check inputs!' });
    }
  },
};