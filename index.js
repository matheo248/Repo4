const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const farbNamen = {
  rot: '#ff0000', red: '#ff0000',
  blau: '#0000ff', blue: '#0000ff',
  gruen: '#00ff00', green: '#00ff00',
  gelb: '#ffff00', yellow: '#ffff00',
  orange: '#ffa500',
  pink: '#ff00ff',
  lila: '#800080', purple: '#800080',
  weiss: '#ffffff', white: '#ffffff',
  schwarz: '#2c2f33', black: '#2c2f33',
};

function farbeAufloesen(input, fallbackHex) {
  if (!input) return fallbackHex;
  const wert = input.trim().toLowerCase();
  if (/^#?[0-9a-f]{6}$/i.test(wert)) {
    return wert.startsWith('#') ? wert : `#${wert}`;
  }
  return farbNamen[wert] || fallbackHex;
}

const texte = {
  de: {
    nurAdmins: 'Nur Admins duerfen /setup benutzen.',
    keineBerechtigung: 'Du hast keine Berechtigung dafuer.',
    bitteErwaehnenKick: 'Bitte jemanden angeben.',
    gekickt: (u) => `${u} wurde gekickt.`,
    gebannt: (u) => `${u} wurde gebannt.`,
    verwarnt: (u, g) => `${u} wurde verwarnt. Grund: ${g}`,
    gemutet: (u) => `${u} wurde fuer 10 Minuten gemutet.`,
    setupFertig: (kat) => `Setup fertig! Kategorie "${kat}" mit Rollen und Channels wurde erstellt.`,
    rollen: { admin: 'Admin', mod: 'Moderator', member: 'Mitglied' },
    channels: { allgemein: 'allgemein', regeln: 'regeln', modlog: 'mod-log', voice: 'voice-chat' },
    keinGrund: 'Kein Grund angegeben',
  },
  en: {
    nurAdmins: 'Only admins can use /setup.',
    keineBerechtigung: "You don't have permission for that.",
    bitteErwaehnenKick: 'Please specify a user.',
    gekickt: (u) => `${u} was kicked.`,
    gebannt: (u) => `${u} was banned.`,
    verwarnt: (u, g) => `${u} was warned. Reason: ${g}`,
    gemutet: (u) => `${u} was muted for 10 minutes.`,
    setupFertig: (kat) => `Setup complete! Category "${kat}" with roles and channels was created.`,
    rollen: { admin: 'Admin', mod: 'Moderator', member: 'Member' },
    channels: { allgemein: 'general', regeln: 'rules', modlog: 'mod-log', voice: 'voice-chat' },
    keinGrund: 'No reason given',
  },
};

client.once('ready', () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'setup') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const sprache = interaction.options.getStri
