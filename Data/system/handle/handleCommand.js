const fs = require('fs-extra');
const path = require('path');
const stringSimilarity = require('string-similarity');
const moment = require('moment-timezone');
const logs = require('../../utility/logs');
const Send = require('../../utility/send');

async function handleCommand({ api, event, client, Users, Threads, Currencies, config }) {
  const { threadID, senderID, body, messageID } = event;
  
  if (!body) return;
  
  const prefix = config.PREFIX || '.';
  const prefixEnabled = config.PREFIX_ENABLED !== false;
  
  let commandName = '';
  let args = [];
  let hasPrefix = false;
  
  if (body.toLowerCase().startsWith(prefix.toLowerCase())) {
    hasPrefix = true;
    const withoutPrefix = body.slice(prefix.length).trim();
    const parts = withoutPrefix.split(/\s+/);
    commandName = parts.shift()?.toLowerCase() || '';
    args = parts;
  } else {
    const parts = body.trim().split(/\s+/);
    commandName = parts.shift()?.toLowerCase() || '';
    args = parts;
  }
  
  if (!commandName) {
    if (hasPrefix) {
      return await showBotInfo(api, event, client, Users, config);
    }
    return;
  }
  
  let command = client.commands.get(commandName);
  
  if (!command) {
    for (const [name, cmd] of client.commands) {
      if (cmd.config.aliases && cmd.config.aliases.includes(commandName)) {
        command = cmd;
        commandName = name;
        break;
      }
    }
  }
  
  if (!command) {
    if (hasPrefix) {
      return await showSuggestion(api, event, client, Users, config, commandName);
    }
    return;
  }
  
  const cmdConfig = command.config;
  
  if (cmdConfig.prefix === true && !hasPrefix) {
    return;
  }
  
  if (cmdConfig.prefix === false && hasPrefix) {
    return;
  }
  
  if (prefixEnabled && cmdConfig.prefix !== false && !hasPrefix) {
    return;
  }
  
  const isAdmin = config.ADMINBOT.includes(senderID);
  
  if (config.ADMIN_ONLY_MODE && !isAdmin) {
    return api.sendMessage('Bot is in Admin Only mode. Only admins can use commands.', threadID, messageID);
  }
  
  if (cmdConfig.adminOnly && !isAdmin) {
    return api.sendMessage('This command is only for bot admins.', threadID, messageID);
  }
  
  if (cmdConfig.groupOnly && !event.isGroup) {
    return api.sendMessage('This command can only be used in groups.', threadID, messageID);
  }
  
  if (Users.isBanned(senderID)) {
    return api.sendMessage('You are banned from using this bot.', threadID, messageID);
  }
  
  if (Threads.isBanned(threadID)) {
    return api.sendMessage('This group is banned from using this bot.', threadID, messageID);
  }
  
  const send = new Send(api, event);
  const userName = await Users.getNameUser(senderID);
  
  logs.command(commandName, userName, threadID);
  
  try {
    await command.run({
      api,
      event,
      args,
      send,
      Users,
      Threads,
      Currencies,
      config,
      client,
      commandName,
      prefix
    });
  } catch (error) {
    logs.error('COMMAND', `Error in ${commandName}:`, error.message);
    api.sendMessage(`Command Error: ${error.message}`, threadID, messageID);
  }
}

async function showBotInfo(api, event, client, Users, config) {
  const { threadID, senderID, messageID } = event;
  const userName = await Users.getNameUser(senderID);
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const time = moment().tz('Asia/Karachi').format('hh:mm:ss A || DD/MM/YYYY');
  
  const commandsFolder = path.join(__dirname, '../../../raza/commands');
  let latestFile = 'None';
  
  try {
    const files = fs.readdirSync(commandsFolder);
    const allFiles = files
      .filter(file => file.endsWith('.js'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(commandsFolder, file)).mtime.getTime()
      }));
    
    if (allFiles.length > 0) {
      latestFile = allFiles.sort((a, b) => b.time - a.time)[0].name;
    }
  } catch (e) {}
  
  const message = `==[ ${time} ]==
${config.BOTNAME} Active!
─────────────────
Total Commands: ${client.commands.size}
Prefix: ${config.PREFIX}
Latest Command: ${latestFile}
Uptime: ${hours}h ${minutes}m ${seconds}s
─────────────────
Type ${config.PREFIX}help for commands`;
  
  api.shareContact(message, senderID, threadID, async (err, info) => {
    if (!err) {
      await new Promise(resolve => setTimeout(resolve, 15000));
      api.unsendMessage(info.messageID).catch(() => {});
    }
  }, messageID);
}

async function showSuggestion(api, event, client, Users, config, commandName) {
  const { threadID, senderID, messageID } = event;
  const allCommandNames = [...client.commands.keys()];
  
  if (allCommandNames.length === 0) return;
  
  const checker = stringSimilarity.findBestMatch(commandName, allCommandNames);
  
  if (checker.bestMatch.rating < 0.3) return;
  
  const userName = await Users.getNameUser(senderID);
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  const time = moment().tz('Asia/Karachi').format('hh:mm:ss A || DD/MM/YYYY');
  
  const commandsFolder = path.join(__dirname, '../../../raza/commands');
  let latestFile = 'None';
  
  try {
    const files = fs.readdirSync(commandsFolder);
    const allFiles = files
      .filter(file => file.endsWith('.js'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(commandsFolder, file)).mtime.getTime()
      }));
    
    if (allFiles.length > 0) {
      latestFile = allFiles.sort((a, b) => b.time - a.time)[0].name;
    }
  } catch (e) {}
  
  const message = `==[ ${time} ]==
${config.BOTNAME} Hello!
Did you mean: ${config.PREFIX}${checker.bestMatch.target}?
─────────────────
Command loaded: ${latestFile}
Uptime: ${hours}h ${minutes}m ${seconds}s`;
  
  api.shareContact(message, senderID, threadID, async (err, info) => {
    if (!err) {
      await new Promise(resolve => setTimeout(resolve, 15000));
      api.unsendMessage(info.messageID).catch(() => {});
    }
  }, messageID);
}

module.exports = handleCommand;
