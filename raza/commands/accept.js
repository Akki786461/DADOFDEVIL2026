module.exports = {
  config: {
    name: 'accept',
    aliases: ['acceptfr', 'acceptrequest'],
    description: 'Accept friend requests',
    usage: 'accept [uid/all]',
    category: 'Friend',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { senderID } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply('Only bot admins can use this command.');
    }
    
    const action = args[0]?.toLowerCase();
    
    if (!action) {
      return send.reply('Usage:\n- accept all - Accept all friend requests\n- accept [uid] - Accept specific request');
    }
    
    if (action === 'all') {
      await send.reply('Accepting all friend requests...');
      
      try {
        const requests = await api.getPendingFriendRequests() || [];
        
        if (requests.length === 0) {
          return send.reply('No pending friend requests.');
        }
        
        let accepted = 0;
        let failed = 0;
        
        for (const req of requests) {
          try {
            await api.handleFriendRequest(req.userID || req, true);
            accepted++;
            await new Promise(r => setTimeout(r, 500));
          } catch {
            failed++;
          }
        }
        
        return send.reply(`Friend Requests
─────────────────
Accepted: ${accepted}
Failed: ${failed}`);
      } catch (error) {
        return send.reply('Failed to get friend requests: ' + error.message);
      }
    }
    
    const uid = action;
    
    if (!/^\d+$/.test(uid)) {
      return send.reply('Invalid UID format.');
    }
    
    try {
      await api.handleFriendRequest(uid, true);
      
      let name = 'Unknown';
      try {
        const info = await api.getUserInfo(uid);
        name = info[uid]?.name || 'Unknown';
      } catch {}
      
      return send.reply(`Friend Request Accepted
─────────────────
Name: ${name}
UID: ${uid}`);
    } catch (error) {
      return send.reply('Failed to accept friend request: ' + error.message);
    }
  }
};
