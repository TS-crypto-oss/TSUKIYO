module.exports = {
  config: {
    name: "slot",
    version: "1.2",
    author: "OtinXSandip (edited by Tsukiyo)",
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "❌ Enter a valid amount",
      not_enough_money: "❌ Not enough balance",

      win: 
`>🎀
• Baby, You won $%1
• Game Results: [ %2 | %3 | %4 ]`,

      lose: 
`>🎀
• Baby, You lost $%1
• Game Results: [ %2 | %3 | %4 ]`,
    },
  },

  onStart: async function ({ args, message, event, usersData, getLang }) {
    const uid = event.senderID;
    const user = await usersData.get(uid);
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0)
      return message.reply(getLang("invalid_amount"));

    if (bet > user.money)
      return message.reply(getLang("not_enough_money"));

    const slots = ["💚", "🖤", "🤎"];
    const s1 = slots[Math.floor(Math.random() * slots.length)];
    const s2 = slots[Math.floor(Math.random() * slots.length)];
    const s3 = slots[Math.floor(Math.random() * slots.length)];

    let winAmount = 0;

    if (s1 === s2 && s2 === s3) {
      winAmount = bet * 3;
      await usersData.set(uid, { money: user.money + winAmount });
      return message.reply(getLang("win", winAmount, s1, s2, s3));
    } 
    else {
      await usersData.set(uid, { money: user.money - bet });
      return message.reply(getLang("lose", bet, s1, s2, s3));
    }
  },
};
