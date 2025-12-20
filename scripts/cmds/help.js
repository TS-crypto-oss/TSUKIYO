const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.18",
    author: "NTKhang | modified Sanjida Snigdha",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command list" },
    category: "info",
    guide: { en: "help <command>" }
  },

  onStart: async function ({ message, args, event, role }) {
    const prefix = getPrefix(event.threadID);
    const img = "https://i.imgur.com/8XIHCo9.jpeg";

    if (!args[0]) {
      let msg = "";

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;
        msg += `• ${name}\n`;
      }

      const sent = await message.reply({
        body:
          `📌 Prefix: ${prefix}\n\n` +
          msg +
          `\nTotal commands: ${commands.size}`,
        attachment: await global.utils.getStreamFromURL(img)
      });

      setTimeout(() => message.unsend(sent.messageID), 60000);
    } else {
      const name = args[0].toLowerCase();
      const cmd = commands.get(name) || commands.get(aliases.get(name));
      if (!cmd) return message.reply("Command not found");

      const c = cmd.config;
      const usage = (c.guide?.en || "")
        .replace(/{he}/g, prefix)
        .replace(/{lp}/g, c.name);

      const sent = await message.reply({
        body:
          `📛 Name: ${c.name}\n` +
          `📃 Description: ${c.longDescription?.en || "N/A"}\n` +
          `📚 Guide: ${usage}`,
        attachment: await global.utils.getStreamFromURL(img)
      });

      setTimeout(() => message.unsend(sent.messageID), 60000);
    }
  }
};
