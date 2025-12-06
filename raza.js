const ws3fca = require('ws3-fca');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment-timezone');

const logs = require('./Data/utility/logs');
const listen = require('./Data/system/listen');
const { loadCommands, loadEvents } = require('./Data/system/handle/handleRefresh');
const UsersController = require('./Data/system/controllers/users');
const ThreadsController = require('./Data/system/controllers/threads');
const CurrenciesController = require('./Data/system/controllers/currencies');

const configPath = path.join(__dirname, 'Data/config/envconfig.json');
const appstatePath = path.join(__dirname, 'appstate.json');
const islamicPath = path.join(__dirname, 'Data/config/islamic_messages.json');
const commandsPath = path.join(__dirname, 'raza/commands');
const eventsPath = path.join(__dirname, 'raza/events');

let config = {};
let islamicMessages = {};
let api = null;
let client = {
  commands: new Map(),
  events: new Map(),
  replies: new Map(),
  cooldowns: new Map()
};

function loadConfig() {
  try {
    config = fs.readJsonSync(configPath);
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to load config:', error.message);
    config = {
      BOTNAME: 'RAZA BOT',
      PREFIX: '.',
      ADMINBOT: ['61582493356125'],
      TIMEZONE: 'Asia/Karachi',
      PREFIX_ENABLED: true,
      REACT_DELETE_EMOJI: '😡',
      ADMIN_ONLY_MODE: false,
      AUTO_ISLAMIC_POST: true,
      AUTO_GROUP_MESSAGE: true
    };
    global.config = config;
  }
}

function loadIslamicMessages() {
  try {
    islamicMessages = fs.readJsonSync(islamicPath);
  } catch (error) {
    logs.error('ISLAMIC', 'Failed to load islamic messages:', error.message);
    islamicMessages = { posts: [], groupMessages: [] };
  }
}

function saveConfig() {
  try {
    fs.writeJsonSync(configPath, config, { spaces: 2 });
    global.config = config;
  } catch (error) {
    logs.error('CONFIG', 'Failed to save config:', error.message);
  }
}

async function postIslamicMessage() {
  if (!api || !config.AUTO_ISLAMIC_POST) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    const posts = islamicMessages.posts || [];
    if (posts.length === 0) return;
    
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `${randomPost.title}
${randomPost.message}
───────────────
Posted by ${config.BOTNAME}
${time} PKT`;
    
    for (const thread of approvedThreads) {
      try {
        await api.sendMessage(message, thread.id);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        logs.error('ISLAMIC_POST', `Failed to send to ${thread.id}:`, e.message);
      }
    }
    
    logs.success('ISLAMIC_POST', `Sent Islamic post to ${approvedThreads.length} groups`);
  } catch (error) {
    logs.error('ISLAMIC_POST', error.message);
  }
}

async function sendGroupMessage() {
  if (!api || !config.AUTO_GROUP_MESSAGE) return;
  
  try {
    const threads = require('./Data/system/database/models/threads').getAll();
    const approvedThreads = threads.filter(t => t.approved === 1 && t.banned !== 1);
    
    if (approvedThreads.length === 0) return;
    
    const messages = islamicMessages.groupMessages || [];
    if (messages.length === 0) return;
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const time = moment().tz('Asia/Karachi').format('hh:mm A');
    
    const message = `${randomMessage}

- ${config.BOTNAME} ${time}`;
    
    for (const thread of approvedThreads) {
      try {
        await api.sendMessage(message, thread.id);
        await new Promise(r => setTimeout(r, 2000));
      } catch (e) {
        logs.error('GROUP_MSG', `Failed to send to ${thread.id}:`, e.message);
      }
    }
    
    logs.success('GROUP_MSG', `Sent message to ${approvedThreads.length} groups`);
  } catch (error) {
    logs.error('GROUP_MSG', error.message);
  }
}

function setupSchedulers() {
  cron.schedule('0 * * * *', () => {
    logs.info('SCHEDULER', 'Hourly Islamic post triggered');
    postIslamicMessage();
  }, {
    timezone: 'Asia/Karachi'
  });
  
  cron.schedule('30 * * * *', () => {
    logs.info('SCHEDULER', 'Hourly group message triggered');
    sendGroupMessage();
  }, {
    timezone: 'Asia/Karachi'
  });
  
  logs.success('SCHEDULER', 'Auto post schedulers started');
}

async function startBot() {
  loadConfig();
  loadIslamicMessages();
  
  let appstate;
  try {
    appstate = fs.readJsonSync(appstatePath);
  } catch (error) {
    logs.error('APPSTATE', 'Failed to load appstate.json');
    logs.error('APPSTATE', 'Please provide valid appstate through the web panel');
    return;
  }
  
  logs.info('BOT', 'Starting RAZA BOT...');
  logs.info('BOT', `Timezone: ${config.TIMEZONE}`);
  logs.info('BOT', `Prefix: ${config.PREFIX}`);
  
  ws3fca.login(appstate, {
    listenEvents: true,
    selfListen: false,
    autoMarkRead: true,
    autoMarkDelivery: false,
    forceLogin: true
  }, async (err, loginApi) => {
    if (err) {
      logs.error('LOGIN', 'Failed to login:', err.message || err);
      return;
    }
    
    api = loginApi;
    global.api = api;
    
    logs.success('LOGIN', 'Successfully logged in!');
    
    const Users = new UsersController(api);
    const Threads = new ThreadsController(api);
    const Currencies = new CurrenciesController(api);
    
    global.Users = Users;
    global.Threads = Threads;
    global.Currencies = Currencies;
    
    await loadCommands(client, commandsPath);
    await loadEvents(client, eventsPath);
    
    global.client = client;
    
    setupSchedulers();
    
    const listener = listen({
      api,
      client,
      Users,
      Threads,
      Currencies,
      config
    });
    
    api.listenMqtt(listener);
    
    logs.success('BOT', 'RAZA BOT is now online!');
    logs.info('BOT', `Commands loaded: ${client.commands.size}`);
    logs.info('BOT', `Events loaded: ${client.events.size}`);
    
    const adminID = config.ADMINBOT[0];
    if (adminID) {
      try {
        await api.sendMessage(`${config.BOTNAME} is now online!
─────────────────
Commands: ${client.commands.size}
Events: ${client.events.size}
Prefix: ${config.PREFIX}
─────────────────
Type ${config.PREFIX}help for commands`, adminID);
      } catch (e) {
        logs.warn('NOTIFY', 'Could not send startup message to admin');
      }
    }
  });
}

process.on('unhandledRejection', (reason, promise) => {
  logs.warn('UNHANDLED', 'Unhandled Promise Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (error) => {
  logs.error('EXCEPTION', 'Uncaught Exception:', error.message);
});

module.exports = {
  startBot,
  getApi: () => api,
  getClient: () => client,
  getConfig: () => config,
  saveConfig,
  loadConfig,
  reloadCommands: () => loadCommands(client, commandsPath),
  reloadEvents: () => loadEvents(client, eventsPath)
};

if (require.main === module) {
  startBot();
}
