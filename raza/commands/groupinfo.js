module.exports = {
  config: {
    name: 'groupinfo',
    aliases: ['ginfo', 'threadinfo'],
    description: 'Get group information',
    usage: 'groupinfo',
    category: 'Group',
    groupOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, Threads }) {
    const { threadID } = event;
    
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const dbThread = Threads.get(threadID);
      
      const admins = threadInfo.adminIDs || [];
      const members = threadInfo.participantIDs || [];
      
      let adminNames = [];
      for (const admin of admins.slice(0, 5)) {
        try {
          const info = await api.getUserInfo(admin.id);
          adminNames.push(info[admin.id]?.name || admin.id);
        } catch {
          adminNames.push(admin.id);
        }
      }
      
      const approved = dbThread?.approved === 1 ? 'Yes' : 'No';
      const banned = dbThread?.banned === 1 ? 'Yes' : 'No';
      
      const msg = `GROUP INFORMATION
─────────────────
Name: ${threadInfo.threadName || 'No Name'}
Thread ID: ${threadID}
Members: ${members.length}
Admins: ${admins.length}
─────────────────
Emoji: ${threadInfo.emoji || 'Default'}
Approval Required: ${threadInfo.approvalMode ? 'Yes' : 'No'}
─────────────────
Bot Approved: ${approved}
Bot Banned: ${banned}
─────────────────
Top Admins:
${adminNames.map((n, i) => `${i + 1}. ${n}`).join('\n')}`;
      
      return send.reply(msg);
    } catch (error) {
      return send.reply('Failed to get group info: ' + error.message);
    }
  }
};
