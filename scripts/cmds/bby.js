const axios = require('axios');
const baseApiUrl = async () => {
    return "https://baby-apisx.vercel.app";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    description: "update simsim api by Aryan Rayhan",
    category: "CHARTING",
    guide: {
        en: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
╭─『 TEACHING SYSTEM 』─⭓
│ • {pn} teach [message] - [reply1], [reply2]
│ • {pn} teach react [message] - [emoji1], [emoji2]
│ • {pn} teach amar [message] - [reply]
│ • {pn} remove [message]
│ • {pn} rm [message] - [index]
│ • {pn} msg [message]
│ • {pn} list
│ • {pn} list all [limit]
│ • {pn} edit [message] - [new reply]
╰─────────────────────────⭓
╭─『 USAGE EXAMPLES 』─⭓
│ • {pn} teach hello - hi, hello, hey
│ • {pn} teach react good morning - ☀️, 🌅
│ • {pn} teach amar name - Your name is beautiful
│ • {pn} remove hi
│ • {pn} rm hi - 1
│ • {pn} edit hello - greetings
│ • {pn} list all 10
╰─────────────────────────⭓`
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const aryan = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove' || args[0] === 'rm') {
            const keyword = args[0];
            const rest = aryan.replace(`${keyword} `, "").trim();
            if (!rest || rest === keyword) {
                return api.sendMessage('❌ | Format: remove [message] OR rm [message] - [index]', event.threadID, event.messageID);
            }
            
            if (rest.includes('-')) {
                const [fi, f] = rest.split(/\s*-\s*/);
                const da = (await axios.get(`${link}?remove=${encodeURIComponent(fi.trim())}&index=${f.trim()}&senderID=${uid}`)).data.message;
                return api.sendMessage(da, event.threadID, event.messageID);
            } else {
                const dat = (await axios.get(`${link}?remove=${encodeURIComponent(rest)}&senderID=${uid}`)).data.message;
                return api.sendMessage(dat, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=all`)).data;
                const limit = parseInt(args[2]) || 100;
                const limited = data?.teacher?.teacherList?.slice(0, limit)
                const teachers = await Promise.all(limited.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = await usersData.getName(number).catch(() => number) || "Not found";
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=all`)).data;
                return api.sendMessage(`❇️ | Total Teach = ${d.length || "api off"}\n♻️ | Total Response = ${d.responseLength || "api off"}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = aryan.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            if (!aryan.includes('-')) {
                return api.sendMessage('❌ | Invalid format! Use: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            }
            const parts = aryan.replace("edit ", "").split(/\s*-\s*/);
            const editKey = parts[0]?.trim();
            const newReply = parts[1]?.trim();
            if (!editKey || !newReply || newReply.length < 1) {
                return api.sendMessage('❌ | Invalid format! Use: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            }
            const dA = (await axios.get(`${link}?edit=${encodeURIComponent(editKey)}&replace=${encodeURIComponent(newReply)}&senderID=${uid}`)).data.message;
            return api.sendMessage(`${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
            const tex = re.data.message;
            let teacherName = "Unknown";
            try {
                const userData = await usersData.get(uid);
                teacherName = userData?.name || await usersData.getName(uid) || "Unknown";
            } catch (e) {
                try {
                    teacherName = await usersData.getName(uid) || "Unknown";
                } catch (e2) {
                    teacherName = "Unknown";
                }
            }
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacherName}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = aryan.split(/\s*-\s*/);
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (aryan.includes('amar name ki') || aryan.includes('amr nam ki') || aryan.includes('amar nam ki') || aryan.includes('amr name ki') || aryan.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${aryan}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        if (event.type == "message_reply") {
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message
}) => {
    try {
        const body = event.body ? event.body?.toLowerCase() : ""
        if (body.startsWith("baby") || body.startsWith("bby") || body.startsWith("bot") || body.startsWith("mikasa") || body.startsWith("babu") || body.startsWith("janu")) {
            const arr = body.replace(/^\S+\s*/, "")
            const randomReplies = [
                "𝙖𝙢𝙖𝙠𝙚 𝙙𝙖𝙠𝙡𝙖 𝙢𝙤𝙣𝙚 𝙝𝙤𝙞?🙆",
                "Bol suntechi 🐍",
                "KI ᑭᖇOᗷᒪEᗰ ᗷᗷY?🙂",
                "~𝙔𝙖𝙢𝙚𝙩𝙚 𝙆𝙪𝙙𝙖𝙨𝙖𝙞🐶",
                "𝙅𝙖 𝙗𝙤𝙡𝙗𝙞 𝙚𝙠𝙨𝙝𝙖𝙩𝙚 𝙗𝙤𝙡𝙚 𝙛𝙚𝙡🤷",
                "𝙀𝙮 𝙩𝙤 𝙖𝙢𝙞 𝙚 𝙙𝙞𝙠𝙚🙋",
                "𝙃𝙖 𝙗𝙤𝙡𝙤 𝙠𝙞 𝙗𝙤𝙡𝙗𝙖- 𝘼𝙢𝙞 𝙨𝙝𝙪𝙣𝙩𝙚𝙨𝙞👂"
            ];
            if (!arr) {
        return await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info obj not found")
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID)
            }
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
           return await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID)
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
