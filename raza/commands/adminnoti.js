module.exports = {
  config: {
    name: 'adminnoti',
    aliases: ['notification', 'noti'],
    description: 'Send notification to all admins',
    usage: 'adminnoti [message]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config, Users }) {
    const message = args.join(' ');
    
    if (!message) {
      return send.reply('Please provide a message to send.');
    }
    
    const admins = config.ADMINBOT || [];
    
    if (admins.length === 0) {
      return send.reply('No admins configured.');
    }
    
    const senderName = await Users.getNameUser(event.senderID);
    
    const notificationMessage = `🔔 ADMIN NOTIFICATION
─────────────────
From: ${senderName}
─────────────────
${message}`;
    
    let sent = 0;
    for (const adminID of admins) {
      if (adminID === event.senderID) continue;
      try {
        await api.sendMessage(notificationMessage, adminID);
        sent++;
      } catch {}
    }
    
    return send.reply(`Notification sent to ${sent} admin(s).`);
  }
};
