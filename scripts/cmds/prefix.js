const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.6",
    author: "NTkhang || Modified by Xos Eren",
    countDown: 5,
    role: 0,
    description: "Change the bot prefix in your chat box or globally (admin only)",
    category: "⚙️ Configuration",
    guide: {
      en: "{pn} <prefix> | {pn} <prefix> -g | {pn} reset"
    }
  },

  langs: {
    en: {
      reset: "💠 ━━━『 **𝐏𝐑𝐄𝐅𝐈𝐗 𝐑𝐄𝐒𝐄𝐓** 』━━━ 💠\n│ 🔄 Default system prefix restored!\n│ ✅ New Prefix: %1",
      onlyAdmin: "🚫 ━━━『 **𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃** 』━━━ 🚫\n│ ⛔ Only Bot Admins can modify the global prefix!",
      confirmGlobal: "🔴 ━━━『 **𝐆𝐋𝐎𝐁𝐀𝐋 𝐂𝐎𝐍𝐅𝐈𝐑𝐌** 』━━━ 🔴\n│ ⚙️ React to confirm GLOBAL prefix update.",
      confirmThisThread: "🟡 ━━━『 **𝐏𝐑𝐄𝐅𝐈𝐗 𝐂𝐎𝐍𝐅𝐈𝐑𝐌** 』━━━ 🟡\n│ 📥 React to confirm prefix update for this chat.",
      successGlobal: "🟢 ━━━『 **𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏𝐃𝐀𝐓𝐄𝐃** 』━━━ 🟢\n│ ✅ Global prefix is now: %1",
      successThisThread: "🔵 ━━━『 **𝐏𝐑𝐄𝐅𝐈𝐗 𝐔𝐏𝐃𝐀𝐓𝐄𝐃** 』━━━ 🔵\n│ 💬 Chat prefix changed to: %1"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix,
      setGlobal: args[1] === "-g"
    };

    if (formSet.setGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

    const confirmMessage = formSet.setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

    return message.reply(confirmMessage, (err, info) => {
      formSet.messageID = info.messageID;
      global.GoatBot.onReaction.set(info.messageID, formSet);
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;

    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    }

    await threadsData.set(event.threadID, newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", newPrefix));
  },

  onChat: async function ({ event, message, threadsData }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      const globalPrefix = global.GoatBot.config.prefix;
      const threadPrefix = (await threadsData.get(event.threadID, "data.prefix")) || globalPrefix;

      return message.reply({
        body: "╭━━━━━━━ ⚡ ━━━━━━━╮\n"
            + "     ✨  **𝐁𝐎𝐓 𝐏𝐑𝐄𝐅𝐈𝐗 𝐈𝐍𝐅𝐎** ✨\n"
            + "╰━━━━━━━ ⚡ ━━━━━━━╯\n"
            + "🛰️ 𝐒𝐲𝐬𝐭𝐞𝐦   :  📡 [ " + globalPrefix + " ]\n"
            + "🌌 𝐂𝐡𝐚𝐭𝐛𝐨𝐱  :  ☄️ [ " + threadPrefix + " ]\n"
            + "━━━━━━━━━━━━━━━━━━━━\n"
            + "💡 𝐓𝐢𝐩: Type `" + threadPrefix + "help` to see commands.\n"
            + "👑 𝐎𝐰𝐧𝐞𝐫   : 🌀 『 T̸s̸u̸k̸i̸y̸o̸ 』 ✨",
        attachment: await utils.getStreamFromURL("https://files.catbox.moe/gcadng.gif")
      });
    }
  }
};
