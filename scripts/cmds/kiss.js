const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kiss",
    version: "2.0",
    author: "TXc Muzan",
    countDown: 5,
    role: 0,
    shortDescription: "Send a kiss image with avatars",
    longDescription: "Generate a kiss image between two users using Canvas",
    category: "fun",
    guide: {
      en: "{p}kiss (mention / reply / uid)\n{p}kiss (mention mention)\n{p}kiss (uid uid)\n{p}kiss (no args) – random opposite gender"
    }
  },

  onStart: async function ({ event, api, usersData, args }) {
    try {
      const baseUrl = "https://i.postimg.cc/4xNF6v1r/image-(3).jpg";
      const base = await loadImage(baseUrl);

      // Helper to get avatar buffer
      async function getAvatar(uid) {
        try {
          const avatarUrl = await usersData.getAvatarUrl(uid);
          const res = await axios.get(avatarUrl, { responseType: "arraybuffer" });
          return await loadImage(Buffer.from(res.data, "binary"));
        } catch {
          const fallback = "https://i.ibb.co/ZYW3VTp/broken-image.jpg";
          const res = await axios.get(fallback, { responseType: "arraybuffer" });
          return await loadImage(Buffer.from(res.data, "binary"));
        }
      }

      const mention = Object.keys(event.mentions);
      const senderID = event.senderID;
      let uid1, uid2;

      // ---- CASE 1: *kiss @mention / reply / uid
      if (mention.length === 1 || event.type === "message_reply" || args.length === 1) {
        uid1 = mention[0] || (event.messageReply && event.messageReply.senderID) || args[0];
        uid2 = senderID;
      }

      // ---- CASE 2: *kiss @mention1 @mention2 / uid uid
      else if (mention.length === 2 || args.length === 2) {
        uid1 = mention[0] || args[0];
        uid2 = mention[1] || args[1];
      }

      // ---- CASE 3: *kiss (no args)
      else {
        const threadInfo = await api.getThreadInfo(event.threadID);
        const participants = threadInfo.userInfo;
        const senderGender = participants.find(u => u.id == senderID)?.gender;

        const males = participants.filter(u => u.gender === "MALE" && u.id != senderID);
        const females = participants.filter(u => u.gender === "FEMALE" && u.id != senderID);

        if (senderGender === "FEMALE" && males.length > 0) {
          uid1 = senderID;
          uid2 = males[Math.floor(Math.random() * males.length)].id;
        } else if (senderGender === "MALE" && females.length > 0) {
          uid1 = females[Math.floor(Math.random() * females.length)].id;
          uid2 = senderID;
        } else {
          return api.sendMessage("Not enough participants to create a kiss scene 💔", event.threadID);
        }
      }

      // Get avatars
      const avatar1 = await getAvatar(uid1);
      const avatar2 = await getAvatar(uid2);

      const canvas = createCanvas(base.width, base.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(base, 0, 0, base.width, base.height);

      // 🩷 Avatar 1 (Left Side)
const circleX1 = 125;   // X position
const circleY1 = 170;   // Y position
const circleSize1 = 110; // Size (Width & Height)

ctx.save();
ctx.beginPath();
ctx.arc(circleX1 + circleSize1 / 2, circleY1 + circleSize1 / 2, circleSize1 / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar1, circleX1, circleY1, circleSize1, circleSize1);
ctx.restore();

// 💙 Avatar 2 (Right Side)
const circleX2 = 235;   // X position
const circleY2 = 90;   // Y position
const circleSize2 = 110; // Size (Width & Height)

ctx.save();
ctx.beginPath();
ctx.arc(circleX2 + circleSize2 / 2, circleY2 + circleSize2 / 2, circleSize2 / 2, 0, Math.PI * 2);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar2, circleX2, circleY2, circleSize2, circleSize2);
ctx.restore();

      const tempPath = path.join(__dirname, `/cache/kiss_${Date.now()}.png`);
      fs.writeFileSync(tempPath,...
