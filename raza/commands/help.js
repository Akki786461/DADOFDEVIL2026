module.exports = {
  config: {
    name: 'help',
    aliases: ['h', 'menu', 'cmds'],
    description: 'Show all commands',
    usage: 'help [command]',
    category: 'Utility',
    prefix: true
  },
  
  async run({ api, event, args, send, client, config }) {
    const { threadID, senderID } = event;
    
    if (args[0]) {
      const cmdName = args[0].toLowerCase();
      let command = client.commands.get(cmdName);
      
      if (!command) {
        for (const [name, cmd] of client.commands) {
          if (cmd.config.aliases && cmd.config.aliases.includes(cmdName)) {
            command = cmd;
            break;
          }
        }
      }
      
      if (!command) {
        return send.reply(`Command "${cmdName}" not found.`);
      }
      
      const cfg = command.config;
      return send.reply(`COMMAND: ${cfg.name}
─────────────────
Description: ${cfg.description || 'No description'}
Usage: ${config.PREFIX}${cfg.usage || cfg.name}
Aliases: ${cfg.aliases?.join(', ') || 'None'}
Category: ${cfg.category || 'Other'}
Admin Only: ${cfg.adminOnly ? 'Yes' : 'No'}
Group Only: ${cfg.groupOnly ? 'Yes' : 'No'}`);
    }
    
    const categories = {};
    
    for (const [name, cmd] of client.commands) {
      const cat = cmd.config.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd.config);
    }
    
    let msg = `${config.BOTNAME} COMMANDS
─────────────────
Prefix: ${config.PREFIX}
Total: ${client.commands.size} commands
─────────────────\n`;
    
    const categoryOrder = ['Admin', 'Group', 'Friend', 'Economy', 'Media', 'Fun', 'Profile', 'Utility', 'Other'];
    
    const categoryEmojis = {
      'Admin': '👑',
      'Group': '👥',
      'Friend': '🤝',
      'Economy': '💰',
      'Media': '🎵',
      'Fun': '💕',
      'Profile': '👤',
      'Utility': '🔧',
      'Other': '📋'
    };
    
    for (const cat of categoryOrder) {
      if (!categories[cat]) continue;
      
      const emoji = categoryEmojis[cat] || '📋';
      
      msg += `\n${emoji} ${cat.toUpperCase()}\n`;
      msg += categories[cat].map(c => `  • ${c.name}`).join('\n') + '\n';
    }
    
    for (const cat in categories) {
      if (!categoryOrder.includes(cat)) {
        msg += `\n📋 ${cat.toUpperCase()}\n`;
        msg += categories[cat].map(c => `  • ${c.name}`).join('\n') + '\n';
      }
    }
    
    msg += `\n─────────────────
Type ${config.PREFIX}help [command] for details`;
    
    return send.reply(msg);
  }
};
