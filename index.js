const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  REST,
  Routes,
  SlashCommandBuilder,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// ---------- SLASH-COMMANDS AUTOMATISCH REGISTRIEREN ----------
const sprachOption = (builder) =>
  builder.addStringOption(opt =>
    opt.setName('sprache')
      .setDescription('Sprache / Language')
      .addChoices(
        { name: 'Deutsch', value: 'de' },
        { name: 'English', value: 'en' },
      )
  );

const slashCommands = [
  sprachOption(
    new SlashCommandBuilder()
      .setName('setup')
      .setDescription('Erstellt Rollen und Channels / Creates roles and channels')
      .addStringOption(opt => opt.setName('kategoriename').setDescription('Name der Kategorie / Category name'))
      .addStringOption(opt => opt.setName('adminfarbe').setDescription('Farbe fuer Admin-Rolle: Name oder Hexcode (z.B. rot oder #ff0000)'))
      .addStringOption(opt => opt.setName('modfarbe').setDescription('Farbe fuer Moderator-Rolle: Name oder Hexcode'))
      .addStringOption(opt => opt.setName('memberfarbe').setDescription('Farbe fuer Mitglied-Rolle: Name oder Hexcode'))
  ),
  sprachOption(
    new SlashCommandBuilder()
      .setName('kick')
      .setDescription('Kickt einen Nutzer / Kicks
