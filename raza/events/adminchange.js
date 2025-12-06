module.exports = {
  config: {
    name: 'adminchange',
    eventType: 'log:thread-admins',
    description: 'Notify when admins change'
  },
  
  async run({ api, event, send, Users }) {
    const { threadID, logMessageData } = event;
    const { ADMIN_EVENT, TARGET_ID } = logMessageData;
    
    let name = 'Unknown';
    try {
      const info = await api.getUserInfo(TARGET_ID);
      name = info[TARGET_ID]?.name || 'Unknown';
    } catch {}
    
    if (ADMIN_EVENT === 'add_admin') {
      send.send(`👑 ADMIN ADDED
─────────────────
${name} is now a group admin!`, threadID);
    } else if (ADMIN_EVENT === 'remove_admin') {
      send.send(`👤 ADMIN REMOVED
─────────────────
${name} is no longer a group admin.`, threadID);
    }
  }
};
