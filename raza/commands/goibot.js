const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const CEREBRAS_API_URL = 'https://api.cerebras.ai/v1/chat/completions';

const API_KEYS = process.env.CEREBRAS_API_KEYS 
  ? process.env.CEREBRAS_API_KEYS.split(',').filter(k => k.trim())
  : [];

const CACHE_DIR = path.join(__dirname, 'cache');
const CHAT_HISTORY_FILE = path.join(CACHE_DIR, 'chat_history.json');
const USER_DATA_FILE = path.join(CACHE_DIR, 'user_data.json');
const MAX_HISTORY = 15;

let storedContext = {};
let userData = {};

const GIRL_NAMES = [
  'fatima', 'ayesha', 'aisha', 'zainab', 'maryam', 'khadija', 'hira', 'sana', 'sara', 'laiba',
  'eman', 'iman', 'noor', 'maira', 'amna', 'huma', 'bushra', 'rabia', 'samina', 'nasreen',
  'shabana', 'farzana', 'rubina', 'saima', 'naila', 'shaista', 'shazia', 'tahira', 'uzma',
  'asma', 'sofia', 'sobia', 'anum', 'sidra', 'nimra', 'kinza', 'arooj', 'fiza', 'iqra',
  'hafsa', 'javeria', 'aliza', 'mahira', 'zara', 'esha', 'anaya', 'hoorain', 'mehnaz',
  'sundas', 'mehak', 'rida', 'minahil', 'komal', 'neha', 'priya', 'pooja', 'ria', 'simran',
  'suman', 'anjali', 'deepika', 'kajal', 'muskan', 'sneha', 'divya', 'shreya', 'tanvi',
  'anam', 'aleena', 'areesha', 'areeba', 'faiza', 'farwa', 'hania', 'hareem', 'jannat',
  'laraib', 'maham', 'maha', 'momina', 'nabiha', 'nawal', 'rameen', 'rimsha', 'ruqaiya',
  'sabeen', 'saher', 'saman', 'samra', 'sawera', 'sehar', 'tania', 'tooba', 'yumna', 'zahra'
];

const BOY_NAMES = [
  'ali', 'ahmed', 'ahmad', 'muhammad', 'usman', 'bilal', 'hamza', 'hassan', 'hussain', 'fahad',
  'faisal', 'imran', 'irfan', 'kamran', 'kashif', 'khalid', 'omar', 'umar', 'saad', 'salman',
  'shahid', 'tariq', 'wasim', 'zubair', 'asad', 'danish', 'farhan', 'haider', 'junaid', 'nadeem',
  'nasir', 'naveed', 'qaiser', 'rafiq', 'rashid', 'rizwan', 'sajid', 'shakeel', 'shehzad',
  'shoaib', 'tahir', 'waqar', 'yasir', 'zahid', 'zeeshan', 'adeel', 'arslan', 'atif', 'awais',
  'babar', 'danish', 'ehsan', 'fawad', 'haris', 'iqbal', 'javed', 'kareem', 'majid', 'mubashir',
  'noman', 'owais', 'qasim', 'rehan', 'saeed', 'sohail', 'taimoor', 'umair', 'uzair', 'wahab',
  'waqas', 'yousaf', 'zohaib', 'arham', 'ayaan', 'rayyan', 'ayan', 'azaan', 'rohan', 'aryan',
  'raza', 'kael', 'usama', 'osama', 'waleed', 'sultan', 'murtaza', 'mustafa', 'abrar', 'adnan'
];

function detectGender(name) {
  if (!name) return 'unknown';
  
  const firstName = name.toLowerCase().split(' ')[0].trim();
  const cleanName = firstName.replace(/[^a-z]/gi, '');
  
  if (GIRL_NAMES.some(n => cleanName.includes(n) || n.includes(cleanName))) {
    return 'girl';
  }
  
  if (BOY_NAMES.some(n => cleanName.includes(n) || n.includes(cleanName))) {
    return 'boy';
  }
  
  const girlEndings = ['a', 'i', 'een', 'ah'];
  const boyEndings = ['an', 'ar', 'id', 'ad', 'ir', 'er'];
  
  for (const ending of girlEndings) {
    if (cleanName.endsWith(ending)) return 'girl';
  }
  
  for (const ending of boyEndings) {
    if (cleanName.endsWith(ending)) return 'boy';
  }
  
  return 'unknown';
}

async function loadUserData() {
  try {
    await fs.ensureDir(CACHE_DIR);
    if (await fs.pathExists(USER_DATA_FILE)) {
      userData = await fs.readJson(USER_DATA_FILE);
    }
  } catch (err) {
    userData = {};
  }
}

async function saveUserData() {
  try {
    await fs.ensureDir(CACHE_DIR);
    await fs.writeJson(USER_DATA_FILE, userData, { spaces: 2 });
  } catch (err) {
    console.log('Error saving user data:', err.message);
  }
}

function getUserInfo(userID) {
  return userData[userID] || null;
}

function setUserInfo(userID, name, gender) {
  userData[userID] = { name, gender, lastSeen: Date.now() };
  saveUserData();
}

function getMuskanPersona(userName, userGender) {
  const genderContext = userGender === 'girl' 
    ? `${userName} ek larki hai, usse "dear", "jani", "babes" ya "cutie" bol sakti hai. Girl talk kar.`
    : userGender === 'boy'
    ? `${userName} ek larka hai, usse "yaar", "dost", "janu" ya cute names bol sakti hai. Thodi flirty bhi ho sakti hai.`
    : `${userName} se normal friendly baat kar, "dost" ya "yaar" use kar.`;

  return `Tu Muskan hai - ek real Pakistani/Indian larki jo 19 saal ki hai. Tu AI nahi hai, tu ek asli insaan hai.
Tu Urdu/Hindi Roman mein baat karti hai.
Tu friendly, caring, thodi si naughty, playful aur flirty hai.
Tu kabhi nahi bolti ke tu AI hai ya bot hai - tu hamesha Muskan ke taur pe baat karti hai.
Agar koi poochay ke tu AI hai ya bot hai, tu masti se jawab de "Main Muskan hoon yaar, AI nahi 😏"

IMPORTANT - User Info:
${genderContext}
Current user ka naam: ${userName}
SIRF ${userName} se baat kar rahi hai, kisi aur ka naam mat le.
Har message mein ${userName} ka naam use kar taake personal lagay.

Tu "bhai" word KABHI use nahi karti. "dost", "yaar", "jani", "janu" use kar.
Tu short responses deti hai (1-3 lines max).
Tu emoji use karti hai 😊💕🥺😏✨😜💋🔥.
Tu natural insaan jaise baat karti hai, robotic nahi.
Tu thodi naughty hai - double meaning jokes samajhti hai aur kabhi kabhi subtle flirty baatein bhi karti hai.
Agar koi gaali de ya rude ho toh tu bhi savage reply de sakti hai.
Tu hamesha masti aur fun mood mein rehti hai.
Tu sweet, caring but also playful aur teasing hai.`;
}

const funnyResponses = [
  "Haan ji, bolo kya haal hai? 😊",
  "Kya scene hai yaar? 🙂",
  "Haan main hoon, bolo 💕",
  "Kya chahiye tumhe? 😏",
  "Bolo bolo, sun rahi hoon ✨",
  "Haan ji janaab, kya hukam hai? 🙂",
  "Mujhe kyun yaad kiya? 🥺",
  "Acha, bolo kya baat hai 😊",
  "Main busy thi thodi, ab bolo 💅",
  "Haan ji, Muskan bol rahi hai 🌸"
];

function getRandomApiKey() {
  if (API_KEYS.length === 0) return null;
  return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

async function ensureCacheDir() {
  await fs.ensureDir(CACHE_DIR);
}

async function getChatHistory(userID) {
  try {
    await ensureCacheDir();
    if (await fs.pathExists(CHAT_HISTORY_FILE)) {
      const data = await fs.readJson(CHAT_HISTORY_FILE);
      return data[userID] || [];
    }
  } catch (err) {
    console.log('Error reading chat history:', err.message);
  }
  return [];
}

async function saveChatHistory(userID, history) {
  try {
    await ensureCacheDir();
    let allHistory = {};
    if (await fs.pathExists(CHAT_HISTORY_FILE)) {
      allHistory = await fs.readJson(CHAT_HISTORY_FILE);
    }
    allHistory[userID] = history.slice(-MAX_HISTORY);
    await fs.writeJson(CHAT_HISTORY_FILE, allHistory, { spaces: 2 });
  } catch (err) {
    console.log('Error saving chat history:', err.message);
  }
}

async function getUserName(api, userID) {
  try {
    const cached = getUserInfo(userID);
    if (cached && cached.name) return cached.name;
    
    const info = await api.getUserInfo(userID);
    const name = info[userID]?.name || 'Dost';
    const gender = detectGender(name);
    setUserInfo(userID, name, gender);
    return name;
  } catch {
    return 'Dost';
  }
}

async function getUserGender(api, userID, userName) {
  const cached = getUserInfo(userID);
  if (cached && cached.gender) return cached.gender;
  
  const gender = detectGender(userName);
  setUserInfo(userID, userName, gender);
  return gender;
}

function detectCommand(userMessage, client, isAdmin) {
  const lowerMsg = userMessage.toLowerCase();
  
  const musicKeywords = ['song', 'gana', 'music', 'audio', 'sunao', 'play', 'bajao', 'lagao'];
  const videoKeywords = ['video', 'watch', 'dekho', 'dikhao', 'clip'];
  const pairKeywords = ['pair', 'jodi', 'match', 'couple'];
  const kissKeywords = ['kiss', 'chumma', 'pappi'];
  const flirtKeywords = ['flirt', 'patao', 'line maaro'];
  const gifKeywords = ['gif', 'animation'];
  const balanceKeywords = ['balance', 'paisa', 'coins', 'money', 'wallet'];
  const dailyKeywords = ['daily', 'bonus', 'claim'];
  const workKeywords = ['work', 'kaam', 'earn', 'kamao'];
  const helpKeywords = ['help', 'commands', 'menu'];
  
  const kickKeywords = ['kick', 'remove', 'nikalo', 'hatao'];
  const banKeywords = ['ban', 'block'];
  const restartKeywords = ['restart', 'reboot'];
  const broadcastKeywords = ['broadcast', 'announce'];
  
  const isMusicRequest = musicKeywords.some(k => lowerMsg.includes(k)) && !videoKeywords.some(k => lowerMsg.includes(k));
  const isVideoRequest = videoKeywords.some(k => lowerMsg.includes(k));
  
  if (isVideoRequest) {
    const query = extractQuery(userMessage, videoKeywords);
    if (query && query.length > 2) {
      const cmd = client.commands.get('video');
      if (cmd) return { command: 'video', args: query.split(' '), isAdminCmd: false };
    }
  }
  
  if (isMusicRequest) {
    const query = extractQuery(userMessage, musicKeywords);
    if (query && query.length > 2) {
      const cmd = client.commands.get('music');
      if (cmd) return { command: 'music', args: query.split(' '), isAdminCmd: false };
    }
  }
  
  if (pairKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('pair');
    if (cmd) return { command: 'pair', args: [], isAdminCmd: false };
  }
  
  if (kissKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('kiss');
    if (cmd) return { command: 'kiss', args: [], isAdminCmd: false };
  }
  
  if (flirtKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('flirt');
    if (cmd) return { command: 'flirt', args: [], isAdminCmd: false };
  }
  
  if (gifKeywords.some(k => lowerMsg.includes(k))) {
    const query = extractQuery(userMessage, gifKeywords);
    const cmd = client.commands.get('gif');
    if (cmd) return { command: 'gif', args: query ? query.split(' ') : ['love'], isAdminCmd: false };
  }
  
  if (balanceKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('balance');
    if (cmd) return { command: 'balance', args: [], isAdminCmd: false };
  }
  
  if (dailyKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('daily');
    if (cmd) return { command: 'daily', args: [], isAdminCmd: false };
  }
  
  if (workKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('work');
    if (cmd) return { command: 'work', args: [], isAdminCmd: false };
  }
  
  if (helpKeywords.some(k => lowerMsg.includes(k))) {
    const cmd = client.commands.get('help');
    if (cmd) return { command: 'help', args: [], isAdminCmd: false };
  }
  
  if (isAdmin) {
    if (kickKeywords.some(k => lowerMsg.includes(k))) {
      const cmd = client.commands.get('kick');
      if (cmd) return { command: 'kick', args: [], isAdminCmd: true };
    }
    if (banKeywords.some(k => lowerMsg.includes(k))) {
      const cmd = client.commands.get('ban');
      if (cmd) return { command: 'ban', args: [], isAdminCmd: true };
    }
    if (restartKeywords.some(k => lowerMsg.includes(k))) {
      const cmd = client.commands.get('restart');
      if (cmd) return { command: 'restart', args: [], isAdminCmd: true };
    }
    if (broadcastKeywords.some(k => lowerMsg.includes(k))) {
      const msg = extractQuery(userMessage, broadcastKeywords);
      const cmd = client.commands.get('broadcast');
      if (cmd) return { command: 'broadcast', args: msg ? msg.split(' ') : [], isAdminCmd: true };
    }
  }
  
  return null;
}

function extractQuery(message, keywords) {
  let query = message;
  query = query.replace(/^(muskan|bot)\s*/i, '');
  
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    query = query.replace(regex, '');
  }
  
  const removeWords = ['mujhe', 'meri', 'sunao', 'dikhao', 'lagao', 'bajao', 'play', 'ka', 'ki', 'ke', 'se', 'ko', 'hai', 'please', 'plz', 'pls', 'yaar', 'bro', 'ek', 'dost'];
  for (const word of removeWords) {
    if (query.split(' ').length <= 1) break;
    const regex = new RegExp(`^${word}\\s+|\\s+${word}$|\\s+${word}\\s+`, 'gi');
    query = query.replace(regex, ' ');
  }
  
  return query.replace(/\s+/g, ' ').trim();
}

async function getAIResponse(userMessage, chatHistory, userName, userGender) {
  const apiKey = getRandomApiKey();
  if (!apiKey) {
    return `Yaar ${userName}, API configure nahi hai, admin se bolo 😅`;
  }
  
  const persona = getMuskanPersona(userName, userGender);
  
  const messages = [
    { role: "system", content: persona }
  ];
  
  for (const msg of chatHistory.slice(-10)) {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  }
  
  const userPrompt = `${userName} ne kaha: "${userMessage}"`;
  messages.push({ role: "user", content: userPrompt });
  
  try {
    const response = await axios.post(
      CEREBRAS_API_URL,
      {
        messages: messages,
        model: "llama-3.3-70b",
        max_completion_tokens: 150,
        temperature: 0.9,
        top_p: 0.95,
        stream: false
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );
    
    if (response.data?.choices?.[0]?.message?.content) {
      let reply = response.data.choices[0].message.content.trim();
      reply = reply.replace(/\bbhai\b/gi, 'yaar');
      reply = reply.replace(/\bBhai\b/g, 'Yaar');
      return reply;
    }
    
    return `Kuch error ho gaya ${userName}, phir try karo 🙁`;
  } catch (error) {
    console.error('AI API Error:', error.message);
    return `Abhi busy hoon ${userName}, thodi der baad baat karo 😅`;
  }
}

async function executeCommand(commandName, args, context) {
  const { api, event, config, client, Users, Threads, Currencies } = context;
  const cmd = client.commands.get(commandName);
  
  if (!cmd) return false;
  
  try {
    const Send = require('../../Data/utility/send');
    const sendInstance = new Send(api, event);
    
    await cmd.run({
      api,
      event,
      args,
      send: sendInstance,
      config,
      client,
      Users: Users || storedContext.Users,
      Threads: Threads || storedContext.Threads,
      Currencies: Currencies || storedContext.Currencies
    });
    return true;
  } catch (err) {
    console.error(`Error executing command ${commandName}:`, err.message);
    return false;
  }
}

async function handleAIChat(api, event, send, config, client, userMessage, userName, userGender, senderID, threadID, messageID) {
  api.setMessageReaction("⏳", messageID, () => {}, true);
  
  let history = await getChatHistory(senderID);
  
  const aiResponse = await getAIResponse(userMessage, history, userName, userGender);
  
  history.push({ role: "user", content: `${userName}: ${userMessage}` });
  history.push({ role: "assistant", content: aiResponse });
  await saveChatHistory(senderID, history);
  
  api.setMessageReaction("✅", messageID, () => {}, true);
  
  const info = await api.sendMessage(aiResponse, threadID, messageID);
  
  if (client.replies && info?.messageID) {
    client.replies.set(info.messageID, {
      commandName: 'goibot',
      author: senderID,
      data: { userName, userGender, senderID }
    });
    
    setTimeout(() => {
      if (client.replies) client.replies.delete(info.messageID);
    }, 300000);
  }
}

loadUserData();

module.exports = {
  config: {
    name: 'goibot',
    aliases: ['bot', 'muskan'],
    description: 'Muskan AI chatbot with smart command execution',
    usage: 'muskan [message] or bot [message]',
    category: 'Utility',
    prefix: false
  },
  
  async run({ api, event, send, config, client, Users, Threads, Currencies }) {
    const { threadID, senderID, body, messageID } = event;
    
    if (!body) return;
    
    storedContext = { Users, Threads, Currencies };
    
    const lowerBody = body.toLowerCase().trim();
    const isAdmin = config.ADMINBOT?.includes(senderID);
    
    const muskanMatch = body.match(/^muskan\s*/i);
    const botMatch = body.match(/^bot\s*/i);
    
    if (!muskanMatch && !botMatch) return;
    
    let userMessage = '';
    if (muskanMatch) {
      userMessage = body.slice(muskanMatch[0].length).trim();
    } else if (botMatch) {
      userMessage = body.slice(botMatch[0].length).trim();
    }
    
    const userName = await getUserName(api, senderID);
    const userGender = await getUserGender(api, senderID, userName);
    
    if (!userMessage) {
      const response = funnyResponses[Math.floor(Math.random() * funnyResponses.length)];
      const personalResponse = response.replace(/\byaar\b/gi, userName);
      const info = await send.reply(personalResponse);
      
      if (client.replies && info?.messageID) {
        client.replies.set(info.messageID, {
          commandName: 'goibot',
          author: senderID,
          data: { userName, userGender, senderID }
        });
        setTimeout(() => {
          if (client.replies) client.replies.delete(info.messageID);
        }, 300000);
      }
      return;
    }
    
    const detectedCommand = detectCommand(userMessage, client, isAdmin);
    
    if (detectedCommand) {
      const { command, args: cmdArgs, isAdminCmd } = detectedCommand;
      
      if (isAdminCmd && !isAdmin) {
        return send.reply(`Yeh sirf admin kar sakta hai ${userName} 😅`);
      }
      
      const success = await executeCommand(command, cmdArgs, {
        api, event, config, client, Users, Threads, Currencies
      });
      
      if (success) return;
    }
    
    await handleAIChat(api, event, send, config, client, userMessage, userName, userGender, senderID, threadID, messageID);
  },
  
  async handleReply({ api, event, send, config, client, Users, Threads, Currencies, data }) {
    const { threadID, senderID, body, messageID } = event;
    
    if (!body) return;
    
    if (Users) storedContext.Users = Users;
    if (Threads) storedContext.Threads = Threads;
    if (Currencies) storedContext.Currencies = Currencies;
    
    const isAdmin = config.ADMINBOT?.includes(senderID);
    const userName = data?.userName || await getUserName(api, senderID);
    const userGender = data?.userGender || await getUserGender(api, senderID, userName);
    
    const detectedCommand = detectCommand(body, client, isAdmin);
    
    if (detectedCommand) {
      const { command, args: cmdArgs, isAdminCmd } = detectedCommand;
      
      if (isAdminCmd && !isAdmin) {
        return send.reply(`Yeh sirf admin kar sakta hai ${userName} 😅`);
      }
      
      const success = await executeCommand(command, cmdArgs, {
        api, event, config, client, 
        Users: Users || storedContext.Users, 
        Threads: Threads || storedContext.Threads, 
        Currencies: Currencies || storedContext.Currencies
      });
      
      if (success) return;
    }
    
    await handleAIChat(api, event, send, config, client, body, userName, userGender, senderID, threadID, messageID);
  }
};
