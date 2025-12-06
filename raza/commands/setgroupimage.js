const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'setgroupimage',
    aliases: ['setgroupphoto', 'groupimage', 'setgroupicon'],
    description: 'Set group profile picture (reply to image)',
    usage: 'setgroupimage (reply to image)',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, config }) {
    const { threadID, senderID, messageReply } = event;
    
    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = threadInfo.adminIDs.map(a => a.id);
    const botID = api.getCurrentUserID();
    
    if (!adminIDs.includes(botID)) {
      return send.reply('Bot must be a group admin to change group image.');
    }
    
    const isGroupAdmin = adminIDs.includes(senderID);
    const isBotAdmin = config.ADMINBOT.includes(senderID);
    
    if (!isGroupAdmin && !isBotAdmin) {
      return send.reply('Only admins can use this command.');
    }
    
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply('Please reply to an image with this command.');
    }
    
    const attachment = messageReply.attachments[0];
    
    if (attachment.type !== 'photo') {
      return send.reply('Please reply to an image (not video, file, etc).');
    }
    
    const imageUrl = attachment.url;
    
    await send.reply('Setting group image...');
    
    try {
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);
      
      const imagePath = path.join(cacheDir, `groupimg_${Date.now()}.jpg`);
      
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data));
      
      await api.changeGroupImage(fs.createReadStream(imagePath), threadID);
      
      setTimeout(() => {
        try {
          if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        } catch {}
      }, 5000);
      
      return send.reply('Group image updated successfully!');
    } catch (error) {
      return send.reply('Failed to set group image: ' + error.message);
    }
  }
};
