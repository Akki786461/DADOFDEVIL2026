const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { Jimp } = require("jimp");

module.exports.config = {
  name: "friendpair",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "KASHIF RAZA",
  description: "Create a friendship edit with circular profile pics",
  commandCategory: "Fun",
  usages: "[@mention optional]",
  cooldowns: 5,
};

const cacheDir = path.join(__dirname, "cache", "canvas");
const templateUrl = "https://i.ibb.co/1YsJrRFX/57732e61064a.jpg";
const templatePath = path.join(cacheDir, "friendpair_template.png");

const friendshipMessages = [
  "𝐁𝐞𝐬𝐭 𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐅𝐨𝐫𝐞𝐯𝐞𝐫 👫",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 𝐆𝐨𝐚𝐥𝐬 🎯",
  "𝐌𝐲 𝐑𝐢𝐝𝐞 𝐨𝐫 𝐃𝐢𝐞 🔥",
  "𝐅𝐫𝐢𝐞𝐧𝐝𝐬 𝐓𝐢𝐥𝐥 𝐓𝐡𝐞 𝐄𝐧𝐝 ✨",
  "𝐁𝐞𝐬𝐭𝐢𝐞𝐬 𝐅𝐨𝐫 𝐋𝐢𝐟𝐞 💫",
  "𝐔𝐧𝐛𝐫𝐞𝐚𝐤𝐚𝐛𝐥𝐞 𝐁𝐨𝐧𝐝 💪",
  "𝐓𝐫𝐮𝐞 𝐅𝐫𝐢𝐞𝐧𝐝𝐬𝐡𝐢𝐩 🌟",
  "𝐏𝐚𝐫𝐭𝐧𝐞𝐫 𝐢𝐧 𝐂𝐫𝐢𝐦𝐞 😎"
];

async function downloadTemplate() {
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(templatePath)) {
    const response = await axios.get(templateUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(templatePath, Buffer.from(response.data));
  }
}

async function getAvatar(uid) {
  const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
}

async function makeCircularImage(buffer, size) {
  const image = await Jimp.read(buffer);
  image.resize({ w: size, h: size });
  
  const mask = new Jimp({ width: size, height: size, color: 0x00000000 });
  const center = size / 2;
  const radius = size / 2;
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
      if (dist <= radius) {
        mask.setPixelColor(0xFFFFFFFF, x, y);
      }
    }
  }
  
  image.mask(mask, 0, 0);
  return image;
}

async function getThreadMembers(api, threadID) {
  return new Promise((resolve) => {
    api.getThreadInfo(threadID, (err, info) => {
      if (err) return resolve([]);
      resolve(info.participantIDs || []);
    });
  });
}

async function getUserInfo(api, uid) {
  return new Promise((resolve) => {
    api.getUserInfo(uid, (err, info) => {
      if (err) return resolve({});
      resolve(info[uid] || {});
    });
  });
}

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  try {
    await downloadTemplate();

    let one = senderID;
    let two;

    if (mention[0]) {
      two = mention[0];
    } else {
      const members = await getThreadMembers(api, threadID);
      const filteredMembers = members.filter(m => m !== senderID);

      if (filteredMembers.length === 0) {
        return api.sendMessage("≿━━━━༺❀༻━━━━≾\n❌ 𝐍𝐨 𝐦𝐞𝐦𝐛𝐞𝐫𝐬 𝐟𝐨𝐮𝐧𝐝!\n≿━━━━༺❀༻━━━━≾", threadID, messageID);
      }

      two = filteredMembers[Math.floor(Math.random() * filteredMembers.length)];
    }

    const avatarOne = await getAvatar(one);
    const avatarTwo = await getAvatar(two);

    const circleOne = await makeCircularImage(avatarOne, 125);
    const circleTwo = await makeCircularImage(avatarTwo, 125);

    const template = await Jimp.read(templatePath);

    template.composite(circleOne, 60, 95);
    template.composite(circleTwo, 285, 95);

    const outputPath = path.join(cacheDir, `friendpair_${one}_${two}_${Date.now()}.png`);
    await template.write(outputPath);

    const userOneInfo = await getUserInfo(api, one);
    const userTwoInfo = await getUserInfo(api, two);
    const nameOne = userOneInfo.name || "User 1";
    const nameTwo = userTwoInfo.name || "User 2";
    const randomMsg = friendshipMessages[Math.floor(Math.random() * friendshipMessages.length)];

    api.sendMessage(
      {
        body: `≿━━━━༺🤝༻━━━━≾\n\n${randomMsg}\n\n👤 ${nameOne}\n🤝 𝐁𝐄𝐒𝐓 𝐅𝐑𝐈𝐄𝐍𝐃𝐒 𝐖𝐈𝐓𝐇 🤝\n👤 ${nameTwo}\n\n≿━━━━༺🤝༻━━━━≾`,
        attachment: fs.createReadStream(outputPath),
        mentions: [
          { tag: nameOne, id: one },
          { tag: nameTwo, id: two }
        ]
      },
      threadID,
      () => fs.unlinkSync(outputPath),
      messageID
    );

  } catch (error) {
    console.error("FriendPair command error:", error);
    api.sendMessage("≿━━━━༺❀༻━━━━≾\n❌ 𝐄𝐫𝐫𝐨𝐫 𝐜𝐫𝐞𝐚𝐭𝐢𝐧𝐠 𝐢𝐦𝐚𝐠𝐞!\n≿━━━━༺❀༻━━━━≾", threadID, messageID);
  }
};
