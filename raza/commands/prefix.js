module.exports = {
  config: {
    name: 'prefix',
    aliases: ['px'],
    description: 'Show or set the bot prefix',
    usage: 'prefix',
    category: 'Utility',
    prefix: false
  },
  
  async run({ api, event, send, config }) {
    return send.reply(`Current prefix: ${config.PREFIX}
─────────────────
Use ${config.PREFIX}help for commands`);
  }
};
