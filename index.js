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

// ---------- SLASH-COMMANDS ----------
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
      { name: 'ownerfarbe', description: 'Farbe Owner Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'headadminfarbe', description: 'Farbe Head Admin Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'adminfarbe', description: 'Farbe Admin Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'modfarbe', description: 'Farbe Moderator Rolle, Name oder Hexcode', type: 3, required: false },
      { name: 'memberfarbe', description: 'Farbe Mitglied Rolle, Name oder Hexcode', type: 3, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'reset',
    description: 'Loescht ALLE Channels und Kategorien (nicht den Server selbst)',
    options: [
      { name: 'bestaetigen', description: 'Schreibe JA um wirklich alles zu loeschen', type: 3, required: true },
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

    // Zuerst IMMER die globalen Befehle leeren, damit es keine Duplikate gibt
    // (falls vorher mal ohne GUILD_ID gestartet wurde)
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('Alte globale Befehle wurden entfernt.');

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

// ---------- FARBEN ----------
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
  gold: '#d4af37',
};

function farbeAufloesen(input, fallbackHex) {
  if (!input) return fallbackHex;
  const wert = input.trim().toLowerCase();
  if (/^#?[0-9a-f]{6}$/i.test(wert)) {
    return wert.startsWith('#') ? wert : `#${wert}`;
  }
  return farbNamen[wert] || fallbackHex;
}

// ---------- TEXTE ----------
const texte = {
  de: {
    nurAdmins: 'Nur Admins duerfen das benutzen.',
    keineBerechtigung: 'Du hast keine Berechtigung dafuer.',
    bitteErwaehnenKick: 'Bitte jemanden angeben.',
    gekickt: (u) => `${u} wurde gekickt.`,
    gebannt: (u) => `${u} wurde gebannt.`,
    verwarnt: (u, g) => `${u} wurde verwarnt. Grund: ${g}`,
    gemutet: (u) => `${u} wurde fuer 10 Minuten gemutet.`,
    setupFertig: (kat) => `Setup fertig! Kategorie "${kat}" mit Rollen und Channels wurde erstellt.`,
    resetAbgebrochen: 'Reset abgebrochen. Schreibe JA bei bestaetigen, um wirklich alles zu loeschen.',
    resetFertig: 'Alle Channels und Kategorien wurden geloescht. Benutze /setup um neu zu starten.',
    rollen: {
      owner: 'Owner',
      headadmin: 'Head Admin',
      admin: 'Admin',
      mod: 'Moderator',
      member: 'Member',
    },
    kategorien: {
      willkommen: '👋 Willkommen',
      bewerbung: '📝 Bewerbung',
    },
    channels: {
      welcome: '👋 welcome',
      rules: '📋 rules',
      apply: '📝 apply',
      admin: '🔒 admin',
      chat: '💬 chat',
      map: '🗺️ map',
      base: '🏠 base',
      team: '👥 team',
      voice: '🔊 voice-chat',
    },
    keinGrund: 'Kein Grund angegeben',
  },
  en: {
    nurAdmins: 'Only admins can use this.',
    keineBerechtigung: "You don't have permission for that.",
    bitteErwaehnenKick: 'Please specify a user.',
    gekickt: (u) => `${u} was kicked.`,
    gebannt: (u) => `${u} was banned.`,
    verwarnt: (u, g) => `${u} was warned. Reason: ${g}`,
    gemutet: (u) => `${u} was muted for 10 minutes.`,
    setupFertig: (kat) => `Setup complete! Category "${kat}" with roles and channels was created.`,
    resetAbgebrochen: 'Reset cancelled. Type JA in bestaetigen to really delete everything.',
    resetFertig: 'All channels and categories were deleted. Use /setup to start again.',
    rollen: {
      owner: 'Owner',
      headadmin: 'Head Admin',
      admin: 'Admin',
      mod: 'Moderator',
      member: 'Member',
    },
    kategorien: {
      willkommen: '👋 Welcome',
      bewerbung: '📝 Applications',
    },
    channels: {
      welcome: '👋 welcome',
      rules: '📋 rules',
      apply: '📝 apply',
      admin: '🔒 admin',
      chat: '💬 chat',
      map: '🗺️ map',
      base: '🏠 base',
      team: '👥 team',
      voice: '🔊 voice-chat',
    },
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
  const sprache = interaction.options.getString('sprache') || 'de';
  const t = texte[sprache];

  // ---------- /setup ----------
  if (commandName === 'setup') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: t.nurAdmins, ephemeral: true });
    }

    const kategorieName = interaction.options.getString('kategoriename') || (sprache === 'de' ? 'Mein Server' : 'My Server');
    const ownerFarbe = farbeAufloesen(interaction.options.getString('ownerfarbe'), '#d4af37');
    const headAdminFarbe = farbeAufloesen(interaction.options.getString('headadminfarbe'), '#e74c3c');
    const adminFarbe = farbeAufloesen(interaction.options.getString('adminfarbe'), '#ff0000');
    const modFarbe = farbeAufloesen(interaction.options.getString('modfarbe'), '#0000ff');
    const memberFarbe = farbeAufloesen(interaction.options.getString('memberfarbe'), '#00ff00');

    await interaction.deferReply();

    const guild = interaction.guild;

    // Rollen erstellen (Reihenfolge wichtig fuer Rang/Hierarchie: zuerst niedrigste, dann hoechste, da Discord neue Rollen oben einreiht)
    const memberRole = guild.roles.cache.find(r => r.name === t.rollen.member) ||
      await guild.roles.create({ name: t.rollen.member, color: memberFarbe });

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

    const adminRole = guild.roles.cache.find(r => r.name === t.rollen.admin) ||
      await guild.roles.create({
        name: t.rollen.admin,
        color: adminFarbe,
        permissions: [
          PermissionsBitField.Flags.KickMembers,
          PermissionsBitField.Flags.BanMembers,
          PermissionsBitField.Flags.ManageMessages,
          PermissionsBitField.Flags.ModerateMembers,
          PermissionsBitField.Flags.ManageChannels,
          PermissionsBitField.Flags.ManageRoles,
        ],
      });

    const headAdminRole = guild.roles.cache.find(r => r.name === t.rollen.headadmin) ||
      await guild.roles.create({
        name: t.rollen.headadmin,
        color: headAdminFarbe,
        permissions: [PermissionsBitField.Flags.Administrator],
      });

    const ownerRole = guild.roles.cache.find(r => r.name === t.rollen.owner) ||
      await guild.roles.create({
        name: t.rollen.owner,
        color: ownerFarbe,
        permissions: [PermissionsBitField.Flags.Administrator],
      });

    // Kategorie 1: Willkommen (oeffentlich, fuer jeden sichtbar)
    const willkommenKategorie = await guild.channels.create({
      name: t.kategorien.willkommen,
      type: ChannelType.GuildCategory,
    });

    await guild.channels.create({
      name: t.channels.welcome,
      type: ChannelType.GuildText,
      parent: willkommenKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await guild.channels.create({
      name: t.channels.rules,
      type: ChannelType.GuildText,
      parent: willkommenKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    // Kategorie 2: Bewerbung (eigene Kategorie, oeffentlich)
    const bewerbungKategorie = await guild.channels.create({
      name: t.kategorien.bewerbung,
      type: ChannelType.GuildCategory,
    });

    await guild.channels.create({
      name: t.channels.apply,
      type: ChannelType.GuildText,
      parent: bewerbungKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    // Kategorie 3: Hauptkategorie
    const category = await guild.channels.create({
      name: kategorieName,
      type: ChannelType.GuildCategory,
    });

    // Admin-Channel: nur Admin, Head Admin, Owner sehen ihn
    await guild.channels.create({
      name: t.channels.admin,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    // Channels fuer Member und alle drueber
    const memberChannels = [t.channels.chat, t.channels.map, t.channels.base, t.channels.team];

    for (const name of memberChannels) {
      await guild.channels.create({
        name,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
          { id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        ],
      });
    }

    // Voice-Channel fuer Member und alle drueber
    await guild.channels.create({
      name: t.channels.voice,
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: memberRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    await interaction.editReply(t.setupFertig(kategorieName));
  }

  // ---------- /reset ----------
  if (commandName === 'reset') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: t.nurAdmins, ephemeral: true });
    }

    const bestaetigung = interaction.options.getString('bestaetigen');
    if (bestaetigung.trim().toUpperCase() !== 'JA' && bestaetigung.trim().toUpperCase() !== 'YES') {
      return interaction.reply({ content: t.resetAbgebrochen, ephemeral: true });
    }

    await interaction.deferReply();

    const guild = interaction.guild;
    const alleChannels = await guild.channels.fetch();

    for (const channel of alleChannels.values()) {
      try {
        await channel.delete();
      } catch (err) {
        console.error(`Konnte Channel nicht loeschen: ${channel.name}`, err.message);
      }
    }

    await interaction.editReply(t.resetFertig);
  }

  // ---------- /kick ----------
  if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.kick();
    await interaction.reply(t.gekickt(target.user.tag));
  }

  // ---------- /ban ----------
  if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.ban();
    await interaction.reply(t.gebannt(target.user.tag));
  }

  // ---------- /warn ----------
  if (commandName === 'warn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    const grund = interaction.options.getString('grund') || t.keinGrund;
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await interaction.reply(t.verwarnt(target.user.tag, grund));
  }

  // ---------- /mute ----------
  if (commandName === 'mute') {
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
