const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'setprofile',
    aliases: ['setavatar', 'setpfp', 'setdp'],
    description: 'Change bot profile picture (reply to image)',
    usage: 'setprofile (reply to image)',
    category: 'Profile',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, config }) {
    const { senderID, messageReply } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply('Only bot admins can use this command.');
    }
    
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return send.reply('Please reply to an image with this command.');
    }
    
    const attachment = messageReply.attachments[0];
    
    if (attachment.type !== 'photo') {
      return send.reply('Please reply to an image (not video, file, etc).');
    }
    
    const imageUrl = attachment.url;
    
    await send.reply('Setting profile picture...');
    
    try {
      const cacheDir = path.join(__dirname, 'cache');
      fs.ensureDirSync(cacheDir);
      
      const imagePath = path.join(cacheDir, `profile_${Date.now()}.jpg`);
      
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(imagePath, Buffer.from(response.data));
      
      await api.changeAvatar(fs.createReadStream(imagePath));
      
      setTimeout(() => {
        try { fs.unlinkSync(imagePath); } catch {}
      }, 5000);
      
      return send.reply('Profile picture updated successfully!');
      
    } catch (error) {
      return send.reply('Failed to change profile picture: ' + error.message);
    }
  }
};
