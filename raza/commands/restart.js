module.exports = {
  config: {
    name: 'restart',
    aliases: ['reboot'],
    description: 'Restart the bot',
    usage: 'restart',
    category: 'Admin',
    adminOnly: true,
    prefix: true
  },
  
  async run({ api, event, send, config }) {
    await send.reply(`${config.BOTNAME} is restarting...`);
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
};
