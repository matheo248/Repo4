const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
  {
    name: 'unban',
    description: 'Hebt einen Bann auf',
    options: [
      { name: 'userid', description: 'Die User-ID der Person', type: 3, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'untimeout',
    description: 'Hebt einen Mute/Timeout vorzeitig auf',
    options: [
      { name: 'user', description: 'Wer soll entmutet werden', type: 6, required: false },
      sprachWahl,
    ],
  },
  {
    name: 'purge',
    description: 'Loescht mehrere Nachrichten in diesem Channel',
    options: [
      { name: 'anzahl', description: 'Wie viele Nachrichten loeschen (1-100)', type: 4, required: true },
      sprachWahl,
    ],
  },
  {
    name: 'ticketpanel',
    description: 'Postet einen Button zum Oeffnen von Tickets',
    options: [
      sprachWahl,
    ],
  },
  {
    name: 'rolegive',
    description: 'Vergibt eine Rolle an einen Nutzer',
    options: [
      { name: 'user', description: 'Wer soll die Rolle bekommen', type: 6, required: true },
      { name: 'rolle', description: 'Welche Rolle', type: 8, required: true },
      sprachWahl,
    ],
  },
  {
    name: 'roleremove',
    description: 'Entfernt eine Rolle von einem Nutzer',
    options: [
      { name: 'user', description: 'Wem die Rolle entfernen', type: 6, required: true },
      { name: 'rolle', description: 'Welche Rolle', type: 8, required: true },
      sprachWahl,
    ],
  },
];

async function befehleRegistrieren() {
  try {
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    console.log('CLIENT_ID ist:', clientId);
    console.log('GUILD_ID ist:', guildId);

    // Schritt 1: GLOBALE Befehle komplett leeren
    await rest.put(Routes.applicationCommands(clientId), { body: [] });
    console.log('Schritt 1: Globale Befehle wurden geleert.');

    // Schritt 2: Falls GUILD_ID gesetzt ist, auch dort erst leeren
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
      console.log('Schritt 2: Server-Befehle wurden geleert.');
    }

    // Schritt 3: Neu registrieren, NUR an einer Stelle
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands });
      console.log('Schritt 3: Slash-Befehle wurden NEU registriert (nur fuer diesen Server).');
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: slashCommands });
      console.log('Schritt 3: Slash-Befehle wurden NEU registriert (global).');
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
    resetFertig: 'Alle Channels, Kategorien und Rollen wurden geloescht. Benutze /setup um neu zu starten.',
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
      tickets: '🎫 Tickets',
    },
    channels: {
      welcome: '👋 welcome',
      rules: '📋 rules',
      apply: '📝 apply',
      admin: '🔒 admin',
      modlog: '📂 mod-log',
      adminlog: '🗂️ admin-log',
      chat: '💬 chat',
      map: '🗺️ map',
      base: '🏠 base',
      team: '👥 team',
      voice: '🔊 voice-chat',
      raids: '⚔️ raids',
      trading: '🛒 trading',
      pvpclips: '🎯 pvp-clips',
      lootruns: '🔧 loot-runs',
      wipeschedule: '📅 wipe-schedule',
      squadvoice: '🎙️ squad-voice',
      beach: '🏖️ beach',
      supply: '📦 supply',
    },
    keinGrund: 'Kein Grund angegeben',
    regelnText: '📋 **Serverregeln**\n\n1. Sei respektvoll zu allen Mitgliedern.\n2. Kein Spam, keine Werbung.\n3. Keine NSFW-Inhalte.\n4. Keine Beleidigungen oder Hassrede.\n5. Halte dich an die Discord-Richtlinien.\n6. Anweisungen vom Team sind zu befolgen.\n\nVerstoesse koennen zu Verwarnung, Timeout, Kick oder Bann fuehren.',
    willkommenText: (servername) => `👋 **Willkommen auf ${servername}!**\n\nSchoen, dass du da bist. Lies dir bitte zuerst die Regeln durch und bewirb dich anschliessend im Apply-Channel, um vollen Zugriff zu erhalten.\n\nViel Spass auf dem Server!`,
    logKick: (mod, user, grund) => `👢 **Kick**\nVon: ${mod}\nNutzer: ${user}\nGrund: ${grund}`,
    logBan: (mod, user, grund) => `🔨 **Ban**\nVon: ${mod}\nNutzer: ${user}\nGrund: ${grund}`,
    logWarn: (mod, user, grund) => `⚠️ **Verwarnung**\nVon: ${mod}\nNutzer: ${user}\nGrund: ${grund}`,
    logMute: (mod, user, grund) => `🔇 **Mute**\nVon: ${mod}\nNutzer: ${user}\nGrund: ${grund}`,
    logSetup: (mod, kat) => `⚙️ **Setup ausgefuehrt**\nVon: ${mod}\nKategorie: ${kat}`,
    logReset: (mod) => `🗑️ **Reset ausgefuehrt**\nVon: ${mod}\nAlle Channels, Kategorien und Rollen wurden geloescht.`,
    entbannt: (id) => `Bann fuer User-ID ${id} wurde aufgehoben.`,
    bitteUserId: 'Bitte eine gueltige User-ID angeben.',
    entmutet: (u) => `${u} wurde entmutet.`,
    purgeFertig: (n) => `${n} Nachrichten wurden geloescht.`,
    purgeUngueltig: 'Bitte eine Zahl zwischen 1 und 100 angeben.',
    logUnban: (mod, id) => `🔓 **Unban**\nVon: ${mod}\nUser-ID: ${id}`,
    logUntimeout: (mod, user) => `🔊 **Untimeout**\nVon: ${mod}\nNutzer: ${user}`,
    logPurge: (mod, n, kanal) => `🧹 **Purge**\nVon: ${mod}\nAnzahl: ${n}\nChannel: ${kanal}`,
    ticketPanelText: '🎫 **Support / Bewerbung**\n\nKlicke auf den Button unten, um ein privates Ticket zu oeffnen.',
    ticketButtonLabel: 'Ticket oeffnen',
    ticketCloseLabel: 'Ticket schliessen',
    ticketPanelGepostet: 'Ticket-Panel wurde gepostet.',
    ticketBegruessung: (user) => `🎫 Hallo ${user}, danke fuer dein Ticket! Ein Teammitglied wird sich bald melden.`,
    ticketSchliessenInfo: (user) => `🔒 Dieses Ticket wird von ${user} geschlossen...`,
    ticketBereitsOffen: 'Du hast bereits ein offenes Ticket.',
    logTicketErstellt: (user) => `🎫 **Ticket erstellt**\nVon: ${user}`,
    logTicketGeschlossen: (mod) => `🔒 **Ticket geschlossen**\nVon: ${mod}`,
    rolleVergeben: (u, r) => `${u} hat jetzt die Rolle ${r}.`,
    rolleEntfernt: (u, r) => `${u} hat die Rolle ${r} nicht mehr.`,
    rolleHatSchon: (u, r) => `${u} hat die Rolle ${r} bereits.`,
    rolleHatNicht: (u, r) => `${u} hat die Rolle ${r} nicht.`,
    rolleZuHoch: 'Diese Rolle ist hoeher oder gleich deiner eigenen, das ist nicht erlaubt.',
    logRoleGive: (mod, u, r) => `➕ **Rolle vergeben**\nVon: ${mod}\nNutzer: ${u}\nRolle: ${r}`,
    logRoleRemove: (mod, u, r) => `➖ **Rolle entfernt**\nVon: ${mod}\nNutzer: ${u}\nRolle: ${r}`,
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
    resetFertig: 'All channels, categories and roles were deleted. Use /setup to start again.',
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
      tickets: '🎫 Tickets',
    },
    channels: {
      welcome: '👋 welcome',
      rules: '📋 rules',
      apply: '📝 apply',
      admin: '🔒 admin',
      modlog: '📂 mod-log',
      adminlog: '🗂️ admin-log',
      chat: '💬 chat',
      map: '🗺️ map',
      base: '🏠 base',
      team: '👥 team',
      voice: '🔊 voice-chat',
      raids: '⚔️ raids',
      trading: '🛒 trading',
      pvpclips: '🎯 pvp-clips',
      lootruns: '🔧 loot-runs',
      wipeschedule: '📅 wipe-schedule',
      squadvoice: '🎙️ squad-voice',
      beach: '🏖️ beach',
      supply: '📦 supply',
    },
    keinGrund: 'No reason given',
    regelnText: '📋 **Server Rules**\n\n1. Be respectful to all members.\n2. No spam, no advertising.\n3. No NSFW content.\n4. No insults or hate speech.\n5. Follow the Discord Terms of Service.\n6. Follow staff instructions.\n\nViolations may lead to warning, timeout, kick or ban.',
    willkommenText: (servername) => `👋 **Welcome to ${servername}!**\n\nGlad to have you here. Please read the rules first and then apply in the apply channel to get full access.\n\nHave fun on the server!`,
    logKick: (mod, user, grund) => `👢 **Kick**\nBy: ${mod}\nUser: ${user}\nReason: ${grund}`,
    logBan: (mod, user, grund) => `🔨 **Ban**\nBy: ${mod}\nUser: ${user}\nReason: ${grund}`,
    logWarn: (mod, user, grund) => `⚠️ **Warning**\nBy: ${mod}\nUser: ${user}\nReason: ${grund}`,
    logMute: (mod, user, grund) => `🔇 **Mute**\nBy: ${mod}\nUser: ${user}\nReason: ${grund}`,
    logSetup: (mod, kat) => `⚙️ **Setup executed**\nBy: ${mod}\nCategory: ${kat}`,
    logReset: (mod) => `🗑️ **Reset executed**\nBy: ${mod}\nAll channels, categories and roles were deleted.`,
    entbannt: (id) => `Ban for user ID ${id} was lifted.`,
    bitteUserId: 'Please provide a valid user ID.',
    entmutet: (u) => `${u} was untimed out.`,
    purgeFertig: (n) => `${n} messages were deleted.`,
    purgeUngueltig: 'Please provide a number between 1 and 100.',
    logUnban: (mod, id) => `🔓 **Unban**\nBy: ${mod}\nUser ID: ${id}`,
    logUntimeout: (mod, user) => `🔊 **Untimeout**\nBy: ${mod}\nUser: ${user}`,
    logPurge: (mod, n, kanal) => `🧹 **Purge**\nBy: ${mod}\nCount: ${n}\nChannel: ${kanal}`,
    ticketPanelText: '🎫 **Support / Application**\n\nClick the button below to open a private ticket.',
    ticketButtonLabel: 'Open ticket',
    ticketCloseLabel: 'Close ticket',
    ticketPanelGepostet: 'Ticket panel was posted.',
    ticketBegruessung: (user) => `🎫 Hello ${user}, thanks for your ticket! A team member will be with you shortly.`,
    ticketSchliessenInfo: (user) => `🔒 This ticket is being closed by ${user}...`,
    ticketBereitsOffen: 'You already have an open ticket.',
    logTicketErstellt: (user) => `🎫 **Ticket created**\nBy: ${user}`,
    logTicketGeschlossen: (mod) => `🔒 **Ticket closed**\nBy: ${mod}`,
    rolleVergeben: (u, r) => `${u} now has the role ${r}.`,
    rolleEntfernt: (u, r) => `${u} no longer has the role ${r}.`,
    rolleHatSchon: (u, r) => `${u} already has the role ${r}.`,
    rolleHatNicht: (u, r) => `${u} doesn't have the role ${r}.`,
    rolleZuHoch: 'This role is higher than or equal to your own, that is not allowed.',
    logRoleGive: (mod, u, r) => `➕ **Role given**\nBy: ${mod}\nUser: ${u}\nRole: ${r}`,
    logRoleRemove: (mod, u, r) => `➖ **Role removed**\nBy: ${mod}\nUser: ${u}\nRole: ${r}`,
  },
};

// Hilfsfunktion: findet einen Channel per Namen im Server und sendet eine Nachricht dorthin
async function logSenden(guild, kanalName, text) {
  try {
    let kanal = guild.channels.cache.find(c => c.name === kanalName);
    if (!kanal) {
      // Cache war veraltet -- frisch vom Server laden
      const alleChannels = await guild.channels.fetch();
      kanal = alleChannels.find(c => c && c.name === kanalName);
    }
    if (kanal) {
      await kanal.send(text);
    } else {
      console.error(`Log-Channel nicht gefunden: ${kanalName}`);
    }
  } catch (err) {
    console.error(`Konnte nicht ins Log senden (${kanalName}):`, err.message);
  }
}

// Prueft ob ein Member Admin oder hoeher ist (anhand der Rollennamen Admin/Head Admin/Owner)
function istAdminOderHoeher(member, t) {
  return member.roles.cache.some(r =>
    r.name === t.rollen.admin || r.name === t.rollen.headadmin || r.name === t.rollen.owner
  );
}

// Prueft ob ein Member (nur) Moderator ist, also Mod-Rolle hat aber NICHT Admin oder hoeher
function istNurModerator(member, t) {
  const hatModRolle = member.roles.cache.some(r => r.name === t.rollen.mod);
  return hatModRolle && !istAdminOderHoeher(member, t);
}

// Bestimmt in welchen Log-Channel eine Mod-Aktion soll:
// Moderator -> mod-log, Admin/HeadAdmin/Owner -> admin-log, sonst null
function logKanal(member, t) {
  if (istNurModerator(member, t)) return t.channels.modlog;
  if (istAdminOderHoeher(member, t)) return t.channels.adminlog;
  return null;
}

// Findet einen Text/Voice-Channel per Namen, oder erstellt ihn neu falls er nicht existiert.
// So wird bei mehrfachem /setup kein Duplikat erzeugt.
async function channelOderErstellen(guild, optionen) {
  const vorhanden = guild.channels.cache.find(c => c.name === optionen.name && c.type === optionen.type);
  if (vorhanden) return vorhanden;
  return guild.channels.create(optionen);
}

// Findet eine Kategorie per Namen, oder erstellt sie neu falls sie nicht existiert.
async function kategorieOderErstellen(guild, name) {
  const vorhanden = guild.channels.cache.find(c => c.name === name && c.type === ChannelType.GuildCategory);
  if (vorhanden) return vorhanden;
  return guild.channels.create({ name, type: ChannelType.GuildCategory });
}

// Prueft ob ein Member die Owner-Rolle hat
function istOwner(member, t) {
  return member.roles.cache.some(r => r.name === t.rollen.owner);
}

// Erlaubt /setup und /reset nur fuer Owner. Ausnahme: falls die Owner-Rolle noch nicht
// existiert (allererstes Setup auf einem neuen Server), reicht Administrator.
function darfSetupOderReset(member, guild, t) {
  const ownerRolleExistiert = guild.roles.cache.some(r => r.name === t.rollen.owner);
  if (!ownerRolleExistiert) {
    return member.permissions.has(PermissionsBitField.Flags.Administrator);
  }
  return istOwner(member, t);
}

// ---------- AUTO-MOD ----------

// Bekannte Scam-Domain-Muster (Discord Nitro Fakes, Steam-Phishing, etc.)
const scamMuster = [
  /discord-?nitro/i,
  /discord-?gift/i,
  /steam-?community-?gift/i,
  /steamcommunlty/i,
  /steampowered-?gift/i,
  /dlscord/i,
  /dlscordapp/i,
  /discordapp-?gift/i,
  /steamcomrnunity/i,
  /steam-?gift\./i,
  /free-?nitro/i,
];

function enthaeltScamLink(text) {
  return scamMuster.some(muster => muster.test(text));
}

// Merkt sich die letzten Nachrichten pro User, um Spam zu erkennen
const nachrichtenVerlauf = new Map();

function istSpam(userId, inhalt) {
  const jetzt = Date.now();
  const verlauf = nachrichtenVerlauf.get(userId) || [];

  // Alte Eintraege (aelter als 6 Sekunden) entfernen
  const aktuell = verlauf.filter(eintrag => jetzt - eintrag.zeit < 6000);
  aktuell.push({ zeit: jetzt, inhalt });
  nachrichtenVerlauf.set(userId, aktuell);

  // Spam-Fall 1: 5 oder mehr Nachrichten in 6 Sekunden
  if (aktuell.length >= 5) return true;

  // Spam-Fall 2: 3 gleiche/aehnliche Nachrichten hintereinander
  const letzteDrei = aktuell.slice(-3);
  if (letzteDrei.length === 3 && letzteDrei.every(e => e.inhalt === letzteDrei[0].inhalt)) {
    return true;
  }

  return false;
}

client.once('ready', async () => {
  console.log(`Bot ist online als ${client.user.tag}`);
  await befehleRegistrieren();
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const sprache = 'de';
  const t = texte[sprache];

  // Admin/Owner/Mod sind von Auto-Mod ausgenommen
  const istAusgenommen = message.member && (
    istAdminOderHoeher(message.member, t) ||
    message.member.roles.cache.some(r => r.name === t.rollen.mod)
  );
  if (istAusgenommen) return;

  const scamGefunden = enthaeltScamLink(message.content);
  const spamGefunden = istSpam(message.author.id, message.content);

  if (scamGefunden || spamGefunden) {
    try {
      await message.delete();
    } catch (err) {
      console.error('Konnte Spam/Scam-Nachricht nicht loeschen:', err.message);
    }

    try {
      await message.member.timeout(5 * 60 * 1000, scamGefunden ? 'Scam-Link erkannt' : 'Spam erkannt');
    } catch (err) {
      console.error('Konnte Nutzer nicht automatisch timeouten:', err.message);
    }

    const grund = scamGefunden ? '🚨 Scam-Link erkannt' : '🚨 Spam erkannt';
    await logSenden(message.guild, t.channels.modlog, `${grund}\nNutzer: ${message.author.tag}\nNachricht geloescht, 5 Min Timeout vergeben.`);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;
  const sprache = interaction.options.getString('sprache') || 'de';
  const t = texte[sprache];

  // ---------- /setup ----------
  if (commandName === 'setup') {
    if (!darfSetupOderReset(interaction.member, interaction.guild, t)) {
      return interaction.reply({ content: t.nurAdmins, ephemeral: true });
    }

    const kategorieName = interaction.options.getString('kategoriename') || (sprache === 'de' ? 'Mein Server' : 'My Server');
    const ownerFarbe = farbeAufloesen(interaction.options.getString('ownerfarbe'), '#2A1048');
    const headAdminFarbe = farbeAufloesen(interaction.options.getString('headadminfarbe'), '#3A136B');
    const adminFarbe = farbeAufloesen(interaction.options.getString('adminfarbe'), '#4C1D95');
    const modFarbe = farbeAufloesen(interaction.options.getString('modfarbe'), '#6E2BFF');
    const memberFarbe = farbeAufloesen(interaction.options.getString('memberfarbe'), '#8B5CFF');

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
    const willkommenKategorie = await kategorieOderErstellen(guild, t.kategorien.willkommen);

    let welcomeChannel = guild.channels.cache.find(c => c.name === t.channels.welcome && c.type === ChannelType.GuildText);
    const welcomeExistierteSchon = !!welcomeChannel;
    if (!welcomeChannel) {
      welcomeChannel = await guild.channels.create({
        name: t.channels.welcome,
        type: ChannelType.GuildText,
        parent: willkommenKategorie.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });
    }
    if (!welcomeExistierteSchon) {
      await welcomeChannel.send(t.willkommenText(guild.name));
    }

    let rulesChannel = guild.channels.cache.find(c => c.name === t.channels.rules && c.type === ChannelType.GuildText);
    const rulesExistierteSchon = !!rulesChannel;
    if (!rulesChannel) {
      rulesChannel = await guild.channels.create({
        name: t.channels.rules,
        type: ChannelType.GuildText,
        parent: willkommenKategorie.id,
        permissionOverwrites: [
          { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
        ],
      });
    }
    if (!rulesExistierteSchon) {
      await rulesChannel.send(t.regelnText);
    }

    // beach und supply: reine Infotafeln, NIEMAND darf schreiben (auch nicht Admin/Owner)
    await channelOderErstellen(guild, {
      name: t.channels.beach,
      type: ChannelType.GuildText,
      parent: willkommenKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
        { id: adminRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
        { id: headAdminRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
        { id: ownerRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await channelOderErstellen(guild, {
      name: t.channels.supply,
      type: ChannelType.GuildText,
      parent: willkommenKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel], deny: [PermissionsBitField.Flags.SendMessages] },
        { id: adminRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
        { id: headAdminRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
        { id: ownerRole.id, deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    // Kategorie 2: Bewerbung (eigene Kategorie, oeffentlich)
    const bewerbungKategorie = await kategorieOderErstellen(guild, t.kategorien.bewerbung);

    await channelOderErstellen(guild, {
      name: t.channels.apply,
      type: ChannelType.GuildText,
      parent: bewerbungKategorie.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    // Kategorie 3: Hauptkategorie
    const category = await kategorieOderErstellen(guild, kategorieName);

    // Admin-Channel: nur Admin, Head Admin, Owner sehen ihn
    await channelOderErstellen(guild, {
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

    // mod-log: nur Owner und Head Admin sehen ihn (Bot braucht auch Zugriff zum Schreiben)
    await channelOderErstellen(guild, {
      name: t.channels.modlog,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    // admin-log: nur Owner und Head Admin sehen ihn (Bot braucht auch Zugriff zum Schreiben)
    await channelOderErstellen(guild, {
      name: t.channels.adminlog,
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ],
    });

    // Channels fuer Member und alle drueber
    const memberChannels = [
      t.channels.chat,
      t.channels.map,
      t.channels.base,
      t.channels.team,
      t.channels.raids,
      t.channels.pvpclips,
      t.channels.lootruns,
      t.channels.wipeschedule,
    ];

    for (const name of memberChannels) {
      await channelOderErstellen(guild, {
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

    // Voice-Channels fuer Member und alle drueber
    const memberVoiceChannels = [t.channels.voice, t.channels.squadvoice];
    for (const name of memberVoiceChannels) {
      await channelOderErstellen(guild, {
        name,
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
    }

    // Rollen automatisch in die richtige Reihenfolge bringen (Owner ganz oben, dann absteigend)
    try {
      const botRole = guild.members.me.roles.highest;
      const startPosition = botRole.position - 1;

      await ownerRole.setPosition(startPosition);
      await headAdminRole.setPosition(startPosition - 1);
      await adminRole.setPosition(startPosition - 2);
      await modRole.setPosition(startPosition - 3);
      await memberRole.setPosition(startPosition - 4);
    } catch (err) {
      console.error('Konnte Rollen nicht automatisch sortieren:', err.message);
    }

    // Owner-Rolle automatisch an den festen Nutzer massimomathi vergeben
    try {
      const alleMitglieder = await guild.members.fetch();
      const massimo = alleMitglieder.find(m => m.user.username.toLowerCase() === 'massimomathi');
      if (massimo && !massimo.roles.cache.has(ownerRole.id)) {
        await massimo.roles.add(ownerRole);
        console.log(`Owner-Rolle wurde automatisch an ${massimo.user.tag} vergeben.`);
      } else if (!massimo) {
        console.log('Nutzer massimomathi wurde auf diesem Server nicht gefunden.');
      }
    } catch (err) {
      console.error('Konnte Owner-Rolle nicht automatisch vergeben:', err.message);
    }

    await logSenden(guild, t.channels.adminlog, t.logSetup(interaction.user.tag, kategorieName));
    await interaction.editReply(t.setupFertig(kategorieName));
  }

  // ---------- /reset ----------
  if (commandName === 'reset') {
    if (!darfSetupOderReset(interaction.member, interaction.guild, t)) {
      return interaction.reply({ content: t.nurAdmins, ephemeral: true });
    }

    const bestaetigung = interaction.options.getString('bestaetigen');
    if (bestaetigung.trim().toUpperCase() !== 'JA' && bestaetigung.trim().toUpperCase() !== 'YES') {
      return interaction.reply({ content: t.resetAbgebrochen, ephemeral: true });
    }

    await interaction.deferReply();

    const guild = interaction.guild;

    // Channels und Kategorien loeschen
    const alleChannels = await guild.channels.fetch();
    for (const channel of alleChannels.values()) {
      try {
        await channel.delete();
      } catch (err) {
        console.error(`Konnte Channel nicht loeschen: ${channel.name}`, err.message);
      }
    }

    // Rollen loeschen (ausser @everyone und der Bot-eigenen Rolle)
    const alleRollen = await guild.roles.fetch();
    for (const rolle of alleRollen.values()) {
      if (rolle.name === '@everyone') continue;
      if (rolle.managed) continue; // von Discord/Bots verwaltete Rollen ueberspringen
      try {
        await rolle.delete();
      } catch (err) {
        console.error(`Konnte Rolle nicht loeschen: ${rolle.name}`, err.message);
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
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logKick(interaction.user.tag, target.user.tag, t.keinGrund));
    }
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
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logBan(interaction.user.tag, target.user.tag, t.keinGrund));
    }
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
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logWarn(interaction.user.tag, target.user.tag, grund));
    }
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
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logMute(interaction.user.tag, target.user.tag, t.keinGrund));
    }
    await interaction.reply(t.gemutet(target.user.tag));
  }

  // ---------- /unban ----------
  if (commandName === 'unban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const userId = interaction.options.getString('userid');
    if (!userId) return interaction.reply({ content: t.bitteUserId, ephemeral: true });
    try {
      await interaction.guild.bans.remove(userId);
    } catch (err) {
      return interaction.reply({ content: t.bitteUserId, ephemeral: true });
    }
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logUnban(interaction.user.tag, userId));
    }
    await interaction.reply(t.entbannt(userId));
  }

  // ---------- /untimeout ----------
  if (commandName === 'untimeout') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    if (!target) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });
    await target.timeout(null);
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logUntimeout(interaction.user.tag, target.user.tag));
    }
    await interaction.reply(t.entmutet(target.user.tag));
  }

  // ---------- /purge ----------
  if (commandName === 'purge') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const anzahl = interaction.options.getInteger('anzahl');
    if (!anzahl || anzahl < 1 || anzahl > 100) {
      return interaction.reply({ content: t.purgeUngueltig, ephemeral: true });
    }
    await interaction.deferReply({ ephemeral: true });
    const geloescht = await interaction.channel.bulkDelete(anzahl, true);
    const zielKanal = logKanal(interaction.member, t);
    if (zielKanal) {
      await logSenden(interaction.guild, zielKanal, t.logPurge(interaction.user.tag, geloescht.size, interaction.channel.name));
    }
    await interaction.editReply(t.purgeFertig(geloescht.size));
  }

  // ---------- /ticketpanel ----------
  if (commandName === 'ticketpanel') {
    if (!istAdminOderHoeher(interaction.member, t)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }

    const button = new ButtonBuilder()
      .setCustomId(`ticket_open_${sprache}`)
      .setLabel(t.ticketButtonLabel)
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ content: t.ticketPanelText, components: [row] });
    await interaction.reply({ content: t.ticketPanelGepostet, ephemeral: true });
  }

  // ---------- /rolegive ----------
  if (commandName === 'rolegive') {
    if (!istAdminOderHoeher(interaction.member, t)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    const rolle = interaction.options.getRole('rolle');
    if (!target || !rolle) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });

    // Sicherheitscheck: Rolle darf nicht hoeher oder gleich der eigenen hoechsten Rolle sein
    if (rolle.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: t.rolleZuHoch, ephemeral: true });
    }

    if (target.roles.cache.has(rolle.id)) {
      return interaction.reply({ content: t.rolleHatSchon(target.user.tag, rolle.name), ephemeral: true });
    }

    await target.roles.add(rolle);
    await logSenden(interaction.guild, t.channels.adminlog, t.logRoleGive(interaction.user.tag, target.user.tag, rolle.name));
    await interaction.reply(t.rolleVergeben(target.user.tag, rolle.name));
  }

  // ---------- /roleremove ----------
  if (commandName === 'roleremove') {
    if (!istAdminOderHoeher(interaction.member, t)) {
      return interaction.reply({ content: t.keineBerechtigung, ephemeral: true });
    }
    const target = interaction.options.getMember('user');
    const rolle = interaction.options.getRole('rolle');
    if (!target || !rolle) return interaction.reply({ content: t.bitteErwaehnenKick, ephemeral: true });

    if (rolle.position >= interaction.member.roles.highest.position) {
      return interaction.reply({ content: t.rolleZuHoch, ephemeral: true });
    }

    if (!target.roles.cache.has(rolle.id)) {
      return interaction.reply({ content: t.rolleHatNicht(target.user.tag, rolle.name), ephemeral: true });
    }

    await target.roles.remove(rolle);
    await logSenden(interaction.guild, t.channels.adminlog, t.logRoleRemove(interaction.user.tag, target.user.tag, rolle.name));
    await interaction.reply(t.rolleEntfernt(target.user.tag, rolle.name));
  }
});

// ---------- BUTTON-INTERAKTIONEN (Tickets) ----------
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  // Ticket oeffnen
  if (interaction.customId.startsWith('ticket_open_')) {
    const sprache = interaction.customId.replace('ticket_open_', '') || 'de';
    const t = texte[sprache] || texte.de;
    const guild = interaction.guild;

    // Pruefen ob der User schon ein offenes Ticket hat
    const ticketName = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const existiertSchon = guild.channels.cache.find(c => c.name === ticketName);
    if (existiertSchon) {
      return interaction.reply({ content: t.ticketBereitsOffen, ephemeral: true });
    }

    await interaction.deferReply({ ephemeral: true });

    // Ticket-Kategorie finden oder erstellen
    let ticketKategorie = guild.channels.cache.find(c => c.name === t.kategorien.tickets && c.type === ChannelType.GuildCategory);
    if (!ticketKategorie) {
      ticketKategorie = await guild.channels.create({
        name: t.kategorien.tickets,
        type: ChannelType.GuildCategory,
      });
    }

    const modRole = guild.roles.cache.find(r => r.name === t.rollen.mod);
    const adminRole = guild.roles.cache.find(r => r.name === t.rollen.admin);
    const headAdminRole = guild.roles.cache.find(r => r.name === t.rollen.headadmin);
    const ownerRole = guild.roles.cache.find(r => r.name === t.rollen.owner);

    const overwrites = [
      { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
    ];
    if (modRole) overwrites.push({ id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });
    if (adminRole) overwrites.push({ id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });
    if (headAdminRole) overwrites.push({ id: headAdminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });
    if (ownerRole) overwrites.push({ id: ownerRole.id, allow: [PermissionsBitField.Flags.ViewChannel] });

    const ticketChannel = await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: ticketKategorie.id,
      permissionOverwrites: overwrites,
    });

    const closeButton = new ButtonBuilder()
      .setCustomId(`ticket_close_${sprache}`)
      .setLabel(t.ticketCloseLabel)
      .setEmoji('🔒')
      .setStyle(ButtonStyle.Danger);
    const closeRow = new ActionRowBuilder().addComponents(closeButton);

    await ticketChannel.send({ content: t.ticketBegruessung(`<@${interaction.user.id}>`), components: [closeRow] });
    await logSenden(guild, t.channels.modlog, t.logTicketErstellt(interaction.user.tag));

    await interaction.editReply({ content: `${t.ticketButtonLabel}: ${ticketChannel}` });
  }

  // Ticket schliessen
  if (interaction.customId.startsWith('ticket_close_')) {
    const sprache = interaction.customId.replace('ticket_close_', '') || 'de';
    const t = texte[sprache] || texte.de;

    await interaction.reply(t.ticketSchliessenInfo(interaction.user.tag));
    await logSenden(interaction.guild, t.channels.modlog, t.logTicketGeschlossen(interaction.user.tag));

    setTimeout(async () => {
      try {
        await interaction.channel.delete();
      } catch (err) {
        console.error('Konnte Ticket-Channel nicht loeschen:', err.message);
      }
    }, 3000);
  }
});

client.login(process.env.DISCORD_TOKEN);
