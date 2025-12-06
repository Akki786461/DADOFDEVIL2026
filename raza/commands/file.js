const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: 'file',
    aliases: ['files', 'cmdfile'],
    description: 'Manage command files - list, read, delete',
    usage: 'file [list/read/delete] [filename]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, config }) {
    const { threadID, senderID, messageID } = event;
    
    if (!config.ADMINBOT.includes(senderID)) {
      return send.reply('Only bot admins can use this command.');
    }
    
    const commandsDir = path.join(__dirname);
    const action = args[0]?.toLowerCase();
    
    if (!action || action === 'list') {
      try {
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
        
        let msg = `COMMAND FILES (${files.length})
═══════════════════════\n\n`;
        
        for (let i = 0; i < files.length; i++) {
          const filePath = path.join(commandsDir, files[i]);
          const stats = fs.statSync(filePath);
          const size = (stats.size / 1024).toFixed(2);
          
          msg += `${i + 1}. ${files[i]}
   Size: ${size} KB
─────────────────\n`;
        }
        
        msg += `\nReply with number to select file for action.`;
        
        const sentMsg = await send.reply(msg);
        
        if (global.client && global.client.replies) {
          global.client.replies.set(sentMsg.messageID, {
            commandName: 'file',
            author: senderID,
            files: files,
            type: 'select'
          });
        }
        
        return;
      } catch (error) {
        return send.reply('Failed to list files: ' + error.message);
      }
    }
    
    if (action === 'read') {
      const filename = args[1];
      
      if (!filename) {
        return send.reply('Please provide filename.\n\nUsage: file read [filename.js]');
      }
      
      const filePath = path.join(commandsDir, filename.endsWith('.js') ? filename : filename + '.js');
      
      if (!fs.existsSync(filePath)) {
        return send.reply('File not found: ' + filename);
      }
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const preview = lines.slice(0, 50).join('\n');
        
        return send.reply(`FILE: ${filename}
═══════════════════════
Lines: ${lines.length}
═══════════════════════

${preview}${lines.length > 50 ? '\n\n... (truncated)' : ''}`);
      } catch (error) {
        return send.reply('Failed to read file: ' + error.message);
      }
    }
    
    if (action === 'delete' || action === 'remove') {
      const filename = args[1];
      
      if (!filename) {
        return send.reply('Please provide filename.\n\nUsage: file delete [filename.js]');
      }
      
      const protectedFiles = ['help.js', 'admin.js', 'reload.js', 'file.js'];
      
      if (protectedFiles.includes(filename.replace('.js', '') + '.js')) {
        return send.reply('Cannot delete protected system files.');
      }
      
      const filePath = path.join(commandsDir, filename.endsWith('.js') ? filename : filename + '.js');
      
      if (!fs.existsSync(filePath)) {
        return send.reply('File not found: ' + filename);
      }
      
      try {
        fs.unlinkSync(filePath);
        
        if (global.client && global.client.commands) {
          const cmdName = filename.replace('.js', '');
          global.client.commands.delete(cmdName);
        }
        
        return send.reply(`File deleted: ${filename}\n\nCommand will be unavailable until reload.`);
      } catch (error) {
        return send.reply('Failed to delete file: ' + error.message);
      }
    }
    
    return send.reply('Usage: file [list/read/delete] [filename]');
  },
  
  async onReply({ api, event, send, config }) {
    const { body, senderID } = event;
    const replyData = global.client.replies.get(event.messageReply.messageID);
    
    if (!replyData || replyData.commandName !== 'file') return;
    if (replyData.author !== senderID) return;
    
    const num = parseInt(body);
    
    if (isNaN(num) || num < 1 || num > replyData.files.length) {
      return send.reply(`Invalid number. Please choose between 1 and ${replyData.files.length}.`);
    }
    
    const selectedFile = replyData.files[num - 1];
    
    send.reply(`Selected: ${selectedFile}

What would you like to do?
- file read ${selectedFile}
- file delete ${selectedFile}`);
    
    global.client.replies.delete(event.messageReply.messageID);
  }
};
