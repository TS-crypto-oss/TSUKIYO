const { getPrefix, getStreamFromURL } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "1.20",
    author: "Ktkhang | fixed & modified by Sanjida Snigdha",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command list and usage"
    },
    longDescription: {
      en: "View all commands or detailed usage of a specific command"
    },
    category: "info",
    guide: {
      en: "{pn}help [command name]"
    },
    priority: 1
  },

  onStart: async function ({ message, args, event, role, api }) {
    const { threadID } = event;
    const prefix = getPrefix(threadID);

    // ================= IMAGE SAFE LOAD =================
    let img = null;
    try {
      img = await getStreamFromURL(
        "https://i.ibb.co/2Y1pyyW8/image0.jpg"
      );
    } catch (e) {
      img = null;
    }

    // ================= ALL COMMAND LIST =================
    if (!args[0]) {
      const categories = {};
      let visibleCount = 0;
      let msg = "";

      for (const [name, cmd] of commands) {
        if (cmd.config.role > role) continue;

        const category = cmd.config.category || "uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
        visibleCount++;
      }

      Object.keys(categories)
        .sort((a, b) => a.localeCompare(b))
        .forEach(category => {
          msg += `\n╭─────⭓ ${category.toUpperCase()}`;

          const names = categories[category]
            .sort((a, b) => a.localeCompare(b));

          for (let i = 0; i < names.length; i += 2) {
            const row = names.slice(i, i + 2).map(n => `✧${n}`);
            msg += `\n│ ${row.join("   ")}`;
          }

          msg += `\n╰────────────⭓`;
        });

      msg += `\n\n⭔ Available commands: ${visibleCount}`;
      msg += `\n⭔ Use: ${prefix}help <command name>`;
      msg += `\n\n╭─✦ BOT ADMIN\n╰‣ Sanjida Snigdha`;

      const sent = await message.reply({
        body: msg,
        attachment: img
      });

      setTimeout(() => {
        if (message.unsend)
          message.unsend(sent.messageID).catch(() => {});
        else
          api.unsendMessage(sent.messageID);
      }, 80000);

      return;
    }

    // ================= SINGLE COMMAND INFO =================
    const input = args[0].toLowerCase();
    const realName = commands.has(input)
      ? input
      : aliases?.get(input);

    const command = commands.get(realName);
    if (!command) {
      return message.reply(`❌ Command "${input}" not found.`);
    }

    const c = command.config;

    // resolve aliases safely
    const aliasList = [];
    if (aliases && aliases instanceof Map) {
      for (const [a, cmdName] of aliases) {
        if (cmdName === c.name) aliasList.push(a);
      }
    }

    const guide = (c.guide?.en || "No guide available")
      .replace(/{pn}/g, prefix)
      .replace(/{cmd}/g, c.name);

    const res = `╭─────────⭓
│ 🎀 NAME: ${c.name}
│ 📃 Aliases: ${aliasList.length ? aliasList.join(", ") : "None"}
├──‣ INFO
│ 📝 Description: ${c.longDescription?.en || "No description"}
│ 📚 Guide: ${guide}
├──‣ SYSTEM
│ ⭐ Version: ${c.version || "1.0"}
│ ♻️ Role: ${roleToText(c.role)}
│ 📂 Category: ${c.category || "Uncategorized"}
╰────────────⭓`;

    const sent = await message.reply({
      body: res,
      attachment: img
    });

    setTimeout(() => {
      if (message.unsend)
        message.unsend(sent.messageID).catch(() => {});
      else
        api.unsendMessage(sent.messageID);
    }, 80000);
  }
};

// ================= ROLE TEXT =================
function roleToText(role) {
  switch (role) {
    case 0: return "0 (All users)";
    case 1: return "1 (Group admin)";
    case 2: return "2 (Bot admin)";
    default: return `${role} (Custom role)`;
  }
}
