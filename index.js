const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const farbMap = {
  rot: 'Red',
  blau: 'Blue',
  gruen: 'Green',
  gelb: 'Yellow',
  orange: 'Orange',
  pink: 'Fuchsia',
  lila: 'Purple',
  weiss: 'White',
  schwarz: 'DarkButNotBlack',
};

function farbeUebersetzen(input, fallback) {
  if (!input) return fallback;
  const gefunden = farbMap[input.toLowerCase()];
  return gefunden || fallback;
}

client.once('ready', () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const args = message.content.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();

  if (cmd === '!setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Nur Admins duerfen !setup benutzen.');
    }

    const kategorieName = args[1] || 'Mein Server';
    const adminFarbe = farbeUebersetzen(args[2], 'Red');
    const modFarbe = farbeUebersetzen(args[3], 'Blue');
    const memberFarbe = farbeUebersetzen(args[4], 'Green');

    const guild = message.guild;

    const adminRole = guild.roles.cache.find(r => r.name === 'Admin') ||
      await guild.roles.create({ name: 'Admin', color: adminFarbe, permissions: [PermissionsBitField.Flags.Administrator] });

    const modRole = guild.roles.cache.find(r => r.name === 'Moderator') ||
      await guild.roles.create({ name: 'Moderator', color: modFarbe, permissions: [PermissionsBitField.Flags.KickMembers, PermissionsBitField
