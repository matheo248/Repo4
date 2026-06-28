const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const sprachOption = (builder) =>
  builder.addStringOption(opt =>
    opt.setName('sprache')
      .setDescription('Sprache / Language')
      .addChoices(
        { name: 'Deutsch', value: 'de' },
        { name: 'English', value: 'en' },
      )
  );

const commands = [
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
      .setDescription('Kickt einen Nutzer / Kicks a user')
      .addUserOption(opt => opt.setName('user').setDescription('Wer? / Who?').setRequired(true))
  ),

  sprachOption(
    new SlashCommandBuilder()
      .setName('ban')
      .setDescription('Bannt einen Nutzer / Bans a user')
      .addUserOption(opt => opt.setName('user').setDescription('Wer? / Who?').setRequired(true))
  ),

  sprachOption(
    new SlashCommandBuilder()
      .setName('warn')
      .setDescription('Verwarnt einen Nutzer / Warns a user')
      .addUserOption(opt => opt.setName('user').setDescription('Wer? / Who?').setRequired(true))
      .addStringOption(opt => opt.setName('grund').setDescription('Grund / Reason'))
  ),

  sprachOption(
    new SlashCommandBuilder()
      .setName('mute')
      .setDescription('Mutet einen Nutzer fuer 10 Minuten / Mutes a user for 10 minutes')
      .addUserOption(opt => opt.setName('user').setDescription('Wer? / Who?').setRequired(true))
  ),
].map(cmd => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Registriere Slash-Commands...');
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (guildId) {
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
      console.log('Befehle wurden fuer diesen Server registriert (sofort sichtbar).');
    } else {
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands },
      );
      console.log('Befehle wurden global registriert (kann bis zu 1 Stunde dauern).');
    }
  } catch (error) {
    console.error(error);
  }
})();
</parameter>
