const handleCommand = require('./handle/handleCommand');
const handleEvent = require('./handle/handleEvent');
const handleReaction = require('./handle/handleReaction');
const handleReply = require('./handle/handleReply');
const handleNotification = require('./handle/handleNotification');
const handleCreateDatabase = require('./handle/handleCreateDatabase');
const handleAutoDetect = require('./handle/handleAutoDetect');
const logs = require('../utility/logs');
const path = require('path');

let resendModule = null;
try {
  resendModule = require(path.join(__dirname, '../../raza/commands/resend.js'));
} catch (e) {
  console.log('Resend module not loaded:', e.message);
}

function listen({ api, client, Users, Threads, Currencies, config }) {
  return async (err, event) => {
    if (err) {
      logs.error('LISTEN', err.message || err);
      return;
    }
    
    if (!event) return;
    
    try {
      await handleCreateDatabase({ api, event, Users, Threads });
      
      switch (event.type) {
        case 'message':
        case 'message_reply':
          if (resendModule && resendModule.logMessage) {
            try {
              const botID = api.getCurrentUserID();
              if (event.senderID !== botID) {
                await resendModule.logMessage(
                  event.messageID,
                  event.body,
                  event.attachments,
                  event.senderID,
                  event.threadID
                );
              }
            } catch (e) {}
          }
          
          await handleCommand({
            api, event, client, Users, Threads, Currencies, config
          });
          
          await handleAutoDetect({
            api, event, client, Users, Threads, config
          });
          
          if (event.type === 'message_reply') {
            await handleReply({
              api, event, client, Users, Threads, config
            });
          }
          break;
          
        case 'message_unsend':
          if (resendModule && resendModule.handleUnsend) {
            try {
              await resendModule.handleUnsend(api, event, Users);
            } catch (e) {
              logs.error('RESEND', e.message);
            }
          }
          break;
          
        case 'event':
          await handleEvent({
            api, event, client, Users, Threads, config
          });
          
          await handleNotification({ api, event, config });
          break;
          
        case 'message_reaction':
          await handleReaction({ api, event, config });
          break;
          
        case 'typ':
        case 'read':
        case 'read_receipt':
        case 'presence':
          break;
          
        default:
          break;
      }
    } catch (error) {
      logs.error('LISTEN', error.message);
    }
  };
}

module.exports = listen;
