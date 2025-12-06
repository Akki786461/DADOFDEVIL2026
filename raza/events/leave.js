module.exports = {
  config: {
    name: 'leave',
    eventType: 'log:unsubscribe',
    description: 'Goodbye messages and anti-out'
  },
  
  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const leftParticipantFbId = logMessageData.leftParticipantFbId;
    const botID = api.getCurrentUserID();
    
    if (leftParticipantFbId === botID) return;
    
    const settings = Threads.getSettings(threadID);
    
    if (settings.antiout) {
      try {
        await api.addUserToGroup(leftParticipantFbId, threadID);
        
        let name = 'Unknown';
        try {
          const info = await api.getUserInfo(leftParticipantFbId);
          name = info[leftParticipantFbId]?.name || 'Unknown';
        } catch {}
        
        send.send(`${name}, you can't leave! Anti-out is enabled. 🔒`, threadID);
        return;
      } catch {}
    }
    
    let name = 'Unknown';
    try {
      const info = await api.getUserInfo(leftParticipantFbId);
      name = info[leftParticipantFbId]?.name || 'Unknown';
    } catch {}
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { participantIDs: [] };
    }
    
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    const goodbyeMsg = `MEMBER LEFT
─────────────────
👋 ${name}
─────────────────
Remaining: ${memberCount} members`;
    
    send.send(goodbyeMsg, threadID);
  }
};
