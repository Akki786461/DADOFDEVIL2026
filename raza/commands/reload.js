module.exports = {
  config: {
    name: 'reload',
    aliases: ['load'],
    description: 'Reload commands or events',
    usage: 'reload [command/all]',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, args, send, client }) {
    const { loadCommands, loadEvents, reloadCommand } = require('../../Data/system/handle/handleRefresh');
    const path = require('path');
    
    const commandsPath = path.join(__dirname);
    const eventsPath = path.join(__dirname, '../events');
    
    const target = args[0]?.toLowerCase();
    
    if (!target || target === 'all') {
      await loadCommands(client, commandsPath);
      await loadEvents(client, eventsPath);
      
      return send.reply(`Reloaded All!
─────────────────
Commands: ${client.commands.size}
Events: ${client.events.size}`);
    }
    
    if (target === 'commands' || target === 'cmds') {
      await loadCommands(client, commandsPath);
      return send.reply(`Reloaded ${client.commands.size} commands.`);
    }
    
    if (target === 'events') {
      await loadEvents(client, eventsPath);
      return send.reply(`Reloaded ${client.events.size} events.`);
    }
    
    const result = await reloadCommand(client, commandsPath, target);
    
    if (result.success) {
      return send.reply(`Reloaded command: ${target}`);
    } else {
      return send.reply(`Failed to reload: ${result.error}`);
    }
  }
};
