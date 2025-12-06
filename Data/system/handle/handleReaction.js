const logs = require('../../utility/logs');

async function handleReaction({ api, event, config }) {
  const { threadID, messageID, userID, reaction } = event;
  
  if (!reaction) return;
  
  const deleteEmoji = config.REACT_DELETE_EMOJI || '😡';
  
  if (reaction === deleteEmoji) {
    try {
      const botID = api.getCurrentUserID();
      
      if (userID === botID) return;
      
      await api.unsendMessage(messageID);
      logs.info('REACTION', `Message deleted by reaction ${deleteEmoji} from ${userID}`);
    } catch (error) {
      logs.error('REACTION', 'Failed to delete message:', error.message);
    }
  }
}

module.exports = handleReaction;
