const axios = require("axios");
const fs = require("fs");
const path = require("path");

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json"
  );
  return base.data.mahmud;
};

/**
* @author MahMUD
* @author: do not delete it
*/

module.exports = {
  config: {
    name: "toilet",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "fun",
    cooldown: 10,
    guide: "[mention/reply/UID]",
  },

  onStart: async function({ api, event, args }) {
    const obfuscatedAuthor = String.fromCharCode(77, 97, 104, 77, 85, 68); 
    if (module.exports.config.author !== obfuscatedAuthor) {
      return api.sendMessage(
        "You are not authorized to change the author name.\n", 
        event.threadID, 
        event.messageID
      );
    }

    const { senderID, mentions, threadID, messageID, messageReply } = event;
    let id;
    
    // Priority 1: Check if there's a reply
    if (messageReply) {
      id = messageReply.senderID;
    }
    // Priority 2: Check if there's a mention
    else if (Object.keys(mentions).length > 0) {
      id = Object.keys(mentions)[0];
    }
    // Priority 3: Check if there's a UID in args
    else if (args[0]) {
      id = args[0];
    }
    // Priority 4: Use sender ID if nothing else
    else {
      id = senderID;
    }

    try {
      const apiUrl = await baseApiUrl();
      const url = ${apiUrl}/api/toilet?user=${id};

      const response = await axios.get(url, { responseType: "arraybuffer" });
      const filePath = path.join(__dirname, toilet_${id}.png);
      fs.writeFileSync(filePath, response.data);
      
      api.sendMessage(
        { attachment: fs.createReadStream(filePath), body: "ওয়াক থু 🤮" },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );

    } catch (err) {
      api.sendMessage(🥹error, contact MahMUD., threadID, messageID);
    }
  }
};
