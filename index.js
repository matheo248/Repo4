const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`Bot ist online als ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;
  const args = message.content.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();

  // ---- SETUP COMMAND ----
  if (cmd === '!setup') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('Nur Admins duerfen !setup benutzen.');
    }
    const guild = message.guild;

    const adminRole = guild.roles.cache.find(r => r.name === 'Admin') ||
      await guild.roles.create({ name: 'Admin', color: 'Red', permissions: [PermissionsBitField.Flags.Administrator] });

    const modRole = guild.roles.cache.find(r => r.name === 'Moderator') ||
      await guild.roles.create({ name: 'Moderator', color: 'Blue', permissions: [PermissionsBitField.Flags.KickMembers, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.ManageMessages] });

    const memberRole = guild.roles.cache.find(r => r.name === 'Member') ||
      await guild.roles.create({ name: 'Member', color: 'Green' });

    const category = await guild.channels.create({
      name: 'Mein Server',
      type: ChannelType.GuildCategory,
    });

    await guild.channels.create({
      name: 'allgemein',
      type: ChannelType.GuildText,
      parent: category.id,
    });

    await guild.channels.create({
      name: 'regeln',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.SendMessages] },
      ],
    });

    await guild.channels.create({
      name: 'mod-log',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: modRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
        { id: adminRole.id, allow: [PermissionsBitField.Flags.ViewChannel] },
      ],
    });

    await guild.channels.create({
      name: 'voice-chat',
      type: ChannelType.GuildVoice,
      parent: category.id,
    });

    message.reply('Setup fertig! Rollen (Admin, Moderator, Member) und Channels wurden erstellt.');
  }

  // ---- MODERATION COMMANDS ----
  if (cmd === '!kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('Keine Berechtigung.');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('Bitte jemanden erwaehnen: !kick @user');
    await target.kick();
    message.reply(`${target.user.tag} wurde gekickt.`);
  }

  if (cmd === '!ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('Keine Berechtigung.');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('Bitte jemanden erwaehnen: !ban @user');
    await target.ban();
    message.reply(`${target.user.tag} wurde gebannt.`);
  }

  if (cmd === '!warn') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('Keine Berechtigung.');
    }
    const target = message.mentions.members.first();
    const reason = args.slice(2).join(' ') || 'Kein Grund angegeben';
    if (!target) return message.reply('Bitte jemanden erwaehnen: !warn @user Grund');
    message.reply(`${target.user.tag} wurde verwarnt. Grund: ${reason}`);
  }

  if (cmd === '!mute') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply('Keine Berechtigung.');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('Bitte jemanden erwaehnen: !mute @user');
    await target.timeout(10 * 60 * 1000, 'Gemutet per Command');
    message.reply(`${target.user.tag} wurde fuer 10 Minuten gemutet.`);
  }
});

client.login(process.env.DISCORD_TOKEN);
