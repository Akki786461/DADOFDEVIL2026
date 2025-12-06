module.exports = {
  config: {
    name: 'welcome',
    eventType: 'log:subscribe',
    description: 'Welcome new members'
  },
  
  async run({ api, event, send, Users, Threads, config }) {
    const { threadID, logMessageData } = event;
    const addedParticipants = logMessageData.addedParticipants || [];
    const botID = api.getCurrentUserID();
    
    const settings = Threads.getSettings(threadID);
    
    if (settings.antijoin) {
      for (const participant of addedParticipants) {
        if (participant.userFbId === botID) continue;
        
        try {
          await api.removeUserFromGroup(participant.userFbId, threadID);
        } catch {}
      }
      return;
    }
    
    const newMembers = addedParticipants.filter(p => p.userFbId !== botID);
    
    if (newMembers.length === 0) return;
    
    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch {
      threadInfo = { threadName: 'the group' };
    }
    
    const groupName = threadInfo.threadName || 'the group';
    const memberCount = threadInfo.participantIDs?.length || 0;
    
    let welcomeMsg = `WELCOME TO ${groupName.toUpperCase()}!
─────────────────\n`;
    
    for (const member of newMembers) {
      welcomeMsg += `👋 ${member.fullName}\n`;
      Users.create(member.userFbId, member.fullName);
    }
    
    welcomeMsg += `─────────────────
Total Members: ${memberCount}
─────────────────
Type ${config.PREFIX}help for commands`;
    
    send.send(welcomeMsg, threadID);
  }
};
