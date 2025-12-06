module.exports = {
  config: {
    name: 'join',
    aliases: ['groups', 'joingroup'],
    description: 'Show groups where bot is added, join by number',
    usage: 'join [number]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, Threads, config }) {
    const { threadID, senderID, messageID } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply('Only bot admins can use this command.');
    }
    
    const allThreads = Threads.getAll();
    
    if (allThreads.length === 0) {
      return send.reply('No groups found in database.');
    }
    
    if (!args[0]) {
      let msg = `GROUPS LIST (${allThreads.length})
═══════════════════════\n\n`;
      
      for (let i = 0; i < allThreads.length; i++) {
        const thread = allThreads[i];
        let name = thread.name || 'Unknown';
        
        if (!name || name === 'Unknown') {
          try {
            const info = await api.getThreadInfo(thread.id);
            name = info.threadName || info.name || 'Unknown';
          } catch {}
        }
        
        const approved = thread.approved === 1 ? '✓' : '✗';
        const banned = thread.banned === 1 ? ' (BANNED)' : '';
        
        msg += `${i + 1}. ${name}${banned}
   Approved: ${approved}
   TID: ${thread.id}
─────────────────\n`;
      }
      
      msg += `\nReply with number to join that group.`;
      
      const sentMsg = await send.reply(msg);
      
      if (global.client && global.client.replies) {
        global.client.replies.set(sentMsg.messageID, {
          commandName: 'join',
          author: senderID,
          threads: allThreads,
          type: 'select'
        });
      }
      
      return;
    }
    
    const num = parseInt(args[0]);
    
    if (isNaN(num) || num < 1 || num > allThreads.length) {
      return send.reply(`Invalid number. Please choose between 1 and ${allThreads.length}.`);
    }
    
    const selectedThread = allThreads[num - 1];
    
    try {
      await api.sendMessage(`Bot admin joined this group.`, selectedThread.id);
      return send.reply(`Sent message to group ${num}.\nTID: ${selectedThread.id}`);
    } catch (error) {
      return send.reply('Failed to send message to group: ' + error.message);
    }
  },
  
  async onReply({ api, event, send }) {
    const { body, senderID } = event;
    const replyData = global.client.replies.get(event.messageReply.messageID);
    
    if (!replyData || replyData.commandName !== 'join') return;
    if (replyData.author !== senderID) return;
    
    const num = parseInt(body);
    
    if (isNaN(num) || num < 1 || num > replyData.threads.length) {
      return send.reply(`Invalid number. Please choose between 1 and ${replyData.threads.length}.`);
    }
    
    const selectedThread = replyData.threads[num - 1];
    
    try {
      await api.sendMessage(`Bot admin connected to this group.`, selectedThread.id);
      send.reply(`Sent message to group ${num}.\nTID: ${selectedThread.id}`);
    } catch (error) {
      send.reply('Failed to send message to group: ' + error.message);
    }
    
    global.client.replies.delete(event.messageReply.messageID);
  }
};
