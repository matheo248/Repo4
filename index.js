const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  REST,
  Routes,
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const sprachWahl = {
  name: 'sprache',
  description: 'Sprache / Language',
  type: 3,
  required: false,
  choices: [
    { name: 'Deutsch', value: 'de' },
    { name: 'English', value: 'en' },
  ],
};

const slashCommands = [
  {
    name: 'setup',
    description: 'Erstellt Rollen und Channels',
    options: [
      { name: 'kategoriename', description: 'Name der Kategorie', type: 3, required: false },
      { name: 'adminfarbe', description: 'Farbe Admin Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'modfarbe', description: 'Farbe Moderator Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'memberfarbe', description: 'Farbe Mitglied Rolle, Name oder Hexcode', type: 3, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'kick',
    description: 'Kickt einen Nutzer',
    options: [
      { name: 'user', description: 'Wen kicken', type: 6, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'ban',
    description: 'Bannt einen Nutzer',
    options: [
      { name: 'user', description: 'Wen bannen', type: 6, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'warn',
    description: 'Verwarnt einen Nutzer',
    options: [
      { name: 'user', description: 'Wen verwarnen', type: 6, required: false },
      { name: 'grund', description: 'Grund der Verwarnung', type: 3, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'mute',
    description: 'Mutet einen Nutzer fuer 10 Minuten',
    options: [
      { name: 'user', description: 'Wen muten', type: 6, required: false },
      sprachWahl,
    ],
  },
];

async function befehleRegistrieren() {
  try {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log('Slash-Befehle wurden registriert (fuer diesen Server).');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log('Slash-Befehle wurden global registriert (kann etwas dauern, bis sichtbar).');
    }
  } catch (error) {
    console.error('Fehler beim Registrieren der Befehle:', error);
  }
}

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

client.once('ready', async () => {
  console.log(`Bot ist online als ${client.user.tag}`);
  await befehleRegistrieren();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'setup') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const sprache = interaction.options.getString('sprache') || 'de';
      return interaction.reply({ content: texte[sprache].nurAdmins, ephemeral: true });
    }

    const sprache = interaction.options.getString('sprache') || 'de';
    const t = texte[sprache];

    const kategorieName = interaction.options.getString('kategoriename') || (sprache === 'de' ? 'Mein Server' : 'My Server');
    const adminFarbe = farbeAufloesen(interaction.options.getString('adminfarbe'), '#ff0000');
    const modFarbe = farbeAufloesen(interaction.options.getString('modfarbe'), '#0000ff');
    const memberFarbe = farbeAufloesen(interaction.options.getString('memberfarbe'), '#00ff00');

    await interaction.deferReply();

    const guild = interaction.guild;

    const adminRole = guild.roles.cache.find(r => r.name === t.rollen.admin) ||
      await guild.roles.create({ name: t.rollen.admin, color: adminFarbe, permissions: [PermissionsBitField.Flags.Administrator] });

    const modRole = guild.roles.cache.find(r => r.name === t.rollen.mod) ||
      await guild.roles.create({
        name: t.rollen.mod,
        color: modFarbe,
        permissions: [
          PermissionsBitField.Flags.KickMembers,
          PermissionsBitField.Flags.BanMembers,
          PermissionsBitField.Flags.ManageMessages,
          PermissionsBitField.Flags.ModerateMembers,
        ],
      });

    const memberRole = guild.roles.cache.find(r => r.name === t.rollen.member) ||
      await guild.roles.create({ name: t.rollen.member, color: memberFarbe });

    const category = await guild.channels.create({
      name: kategorieName,
      type: ChannelType.GuildCategory,
    });

    await guild.channels.create({
      name: t.channels.allgemein,
      type: ChannelType.GuildText,
      parent: category.id,
    });

    await guild.channels.create({
      name: t.channels.regeln,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await guild.channels.create({
      name: t.channels.modlog,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    await guild.channels.create({
      name: t.channels.voice,
      type: ChannelType.GuildVoice,
      parent: category.id,
    });

    await interaction.editReply(t.setupFertig(kategorieName));
  }

  if (commandName === 'kick') {
    const sprache = interaction.options.getString('sprache') || 'de';
    const t = texte[sprache];
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.kick();
    await interaction.reply(t.gekickt(target.user.tag));
  }

  if (commandName === 'ban') {
    const sprache = interaction.options.getString('sprache') || 'de';
    const t = texte[sprache];
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.ban();
    await interaction.reply(t.gebannt(target.user.tag));
  }

  if (commandName === 'warn') {
    const sprache = interaction.options.getString('sprache') || 'de';
    const t = texte[sprache];
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    const grund = interaction.options.getString('grund') || t.keinGrund;
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await interaction.reply(t.verwarnt(target.user.tag, grund));
  }

  if (commandName === 'mute') {
    const sprache = interaction.options.getString('sprache') || 'de';
    const t = texte[sprache];
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.timeout(10 * 60 * 1000, 'Gemutet per Command');
    await interaction.reply(t.gemutet(target.user.tag));
  }
});

client.login(process.env.DISCORD_TOKEN);
