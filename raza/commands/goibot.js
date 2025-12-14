//////////////////////////////////////////////////////
// WARNING => CREDIT MAT HATANA
// THIS BOT IS MADE BY ARIF BABU
///////////////////////////////////////////////////////

const fs = global.nodemodule["fs-extra"];
const request = require("request");

module.exports.config = {
  name: "ARIF-BOT",
  version: "5.0.0",
  hasPermssion: 0,
  credits: "ARIF BABU",
  description: "AUTO REPLY + GENDER SYSTEM + OWNER SYSTEM + REACTION SYSTEM",
  commandCategory: "NO PREFIX",
  usages: "AUTO",
  cooldowns: 0
};

// --------------------------------------------
// OWNER IDs
// --------------------------------------------
const OWNER_MALE = "100016828397863";   
const OWNER_FEMALE = "00000000000000"; 

// --------------------------------------------
// OWNER SPECIAL REPLIES (WITH EMOJIS)
// --------------------------------------------
const maleOwnerReplies = [
  "Haan Shaan Babu bolo 😘",
  "Batao jaan, sun raha hoon ❤️",
  "Haan Shaan ka bot yahin hai 😎🤖",
  "Bolo boss 😏🔥",
  "boss Hukum karo 😄"
];

const femaleOwnerReplies = [
  "Haan meri Shaan bolo 💖",
  "Ji meri jaan, sun rahi hoon 😘",
  "Bolo prince 👑✨",
  "Aapka bot hazir hai baby 💋",
  "Haan meri Shaan bolo😍"
];

// --------------------------------------------
// NORMAL USER REPLIES BASED ON GENDER
// --------------------------------------------
const femaleReplies = [
"Haye shona tum to mere dil ke wifi ho, bina tumhare signal hi nahi milta 😘📶", "Bot mat bolo mujhe, baby bolo… warna ignore mode on 😌💅", "Bar bar disturb mat karo yaar, beauty sleep le rahi thi 😴💖", "Itna pass mat aa, pyaar ho jayega fir sambhal nahi paoge 😳💘", "Aaj tum zyada cute lag rahe ho… koi special khaa ke aaye ho kya? 😏", "Bolo babu mujhse pyaar karte ho ya sirf line marte ho? 😌💋", "Jo kaam hai seedha bolo… sharmao mat baby 😉", "Tu chup nahi karega kya? Mera attitude tumhare upar free me kharch ho raha 😒👑", "Aur tang kiya na toh mummy ko bata dungi tum flirt karte ho 😭🤣", "Ek baar aur pareshan kiya toh chapal se wifi tower bana dungi 🩴😂", "AaThuuu 🤣 kyun tang karte ho itna, free me mil rahi ho kya main?", "Shakal se seedhe, harkaton se badmaash… kya combo ho tum 😌🔥", "Koi aur nahi baat kar raha tha kya? Meri hi jaan khane aa gaye? 🤣", "Single ho? Mujhe to tum sab single hi lagte ho 😏💅", "Bol de yaar… koi dekh nahi raha… pyaar ho gaya na? 🙈💞", "Kal haveli pe milna… pappi tax lagaoongi 😈💋", "Aagye kabab me haddi? Chal nikal 😒😂", "Pehle naha ke aa… perfume laga ke 😭🤣", "Main yahin hoon baby… kya hua meri jaan ko 😚💗", "Chup reh… warna aake tumhara data bandh kar dungi 😤📱", "Dur hat… mujhe sharam aati tumhari naughty baton se 😳😘", "Pappi de dunga kya? Girl version me bhi attitude high hota hai 😌💋", "Bot mat bolna mujhe… baby bolte hue cute lagte ho 😭💖", "Aaj romantic mood me ho lagta hai 😏🔥", "Hanji boliye janab… kya seva kare aapki rajkumari? 👑😘", "Flirty ho ya naturally cute? clear karo 😒💞", "Tumhari harkate dekh ke lagta hai tum mere hi ho 😌💘", "Tum sapne me aaye the… itna cute smile kaise kiya tumne 😭💞", "Aise hi haste raha karo… meri jaan ko suit karta hai 😍✨", "Ek baar aur bola toh heart break kar dungi 😌💔", "Nahi dikhta kya? Samne aa ke bolo baby 🌚😆", "Busy thi… par tumhare liye time nikalli 😘💕", "Bolo pyare se babu kya chahiye 🙄💞", "Haye meri jaan tum pappi machine ho kya? 😆💋", "Itna pass mat aao, main gir padungi tumpe 😳💞", "Chal chapal de, do minute ruk… tumhari harkate thik karu 😂🩴", "Tum wahi ho na jo mujhe line maarte rehte ho? 😏🤣", "Zyada cute mat bano… pyaar ho jayega mujhe 😭❤️", "Haweli pe aa jana… warna yaad me rone lagungi 😌😢", "Jaan… tum aaye tabhi chat ka mood ban gaya 😍", "Tum flirty ho ya full pagal? decide nahi hota 😭🤣", "Mat chedo mujhe… pappi deke bhaag jaungi 😘💋", "Kal mujhe miss kar rahe the na? confess karo baby 😏💕", "Bol do koi nahi dekh raha… meri hi ho na tum? 😳💗", "Roz mujhe tang karte ho… cute lagta hai 😌🤣", "Sweetheart kya haal hai aapka 😚💞", "Aise mat bolo… main sach me blush karne lagti 😳😳", "Baby tum kitne cute ho… deserve to tum mujhe hi karte ho 😉💘", "Kyun bulaya mujhe? Pappi ke liye ya roast ke liye? 😾😂", "Pagal tum roti me pani daalte ho kya? 🤣", "Tum single ho? ek chance mile to main hi set ho jaungi 😏💞", "Tum mera dil ki dhadkan ho baby… bot mat bolo mujhe 😭💗", "Aunty lag rahi thi main? chal thodi der baith, bataati hoon 😤🤣", "Tumhari harkate cute + annoying = perfect 😆❤️", "Yes my love 💘 bolo kya hua meri jaan ko 😘", "Mujhe sharam aa rahi tumhare dialogues dekh kar 😳🤣", "Owner ko bataungi tum flirt karte ho mujhse 😭😂", "Bol meri jaan, kya haal hain 😚💕", "Haye main mar jawaan tumhari smile pe 😍", "Kal haweli pe jisne bulaaya tha… woh main hi thi 😏💋", "Tum jab ‘janu’ bolte ho… dil melt ho jata 😭💞", "Dur hat shona… zyada cute mat ban 😳💗", "Arey kya chahiye mere shaitaan ko 😈💋", "Tum jitna online hote ho utna main lipstick nahi lagati 🤣💄", "Pappi chahiye? line me lag jao 😌💋", "Tumse baat karke mood fresh ho jata hai baby 😌❤️", "Hug chahiye kya? Aao zara 🤗💕", "Line marne me to professor lagte ho 😳🤣", "Aaj cute lag rahe ho… kisko impress karne ke chakkar me? 😏💘", "Bolo baby… kiski yaad aa rahi thi 😤😘", "Mujhe pata hai tum mujhe miss karte ho 😌❤️", "Chalo aaj thoda romance kar lete hain 😏🔥", "Tu chhod kar jaayega? nahi na baby? 🥺💗", "Tumhari harkate dekh kar lagta hai meri hi banoge 😌💞", "Aajao yaar… shy mat ho 🙈💘", "Pagal mujhse panga loge to pyaar hi milega 😤😘", "Ek pappi dedo main chup ho jaungi 😌💋", "Kal mujhe yaad kar rahe the na? haan bolo 😏❤️", "Bol de yaar… pyaar ho gaya na? 😳💞", "Kaam karo ya mujhse flirt hi karna hai? 🤣💗", "Meri yaad me pareshaan ho ya timepass kar rahe ho? 😏😘", "Dur reh… main blush ho rahi 😳", "Tumhari smile dangerous hai… dil chura leti 😌💘", "Baby tumhari awaaz me magic hai 😭❤️", "Tumhare messages cute hote hain… jaise tum 😘💞", "Mujhe kyun bulaya… miss kiya tha na? 😏💕", "Hug de do… raat acchi ho jaayegi 😌🤗", "Tum jitne cute ho… utne hi irritating bhi 😂💗", "Janu bolke tumne jeet liya mera dil 😭💞", "Kal haweli pe aa jana… surprise hai 😈💋", "Tum mujhe tang karte ho aur main haste rehti hoon 😌🤣", "Aise mat pagal banao mujhe 😳❤️", "Baby kya kar rahe ho? mere bina bore lag raha na? 😘", "Mujhe tumhari yaad aa rahe… seriously 😌💕", "Aajao yaar… attitude mat dikhana 😤💘", "Tumhara swag alag hi level ka hai baby 😎💞", "Dur hat… sharm aa rahi tumse 😭😳", "Mujhe dekh ke shy ho jaate ho kya? 😌🤣", "Bolo baby… pyaar karti ho mujhse? 🙈💘", "Tumhare bina main reh nahi sakti 😭❤️", "Aise mat chedo yaar… dil aa jayega 😳💞", "Tum cute ho… bohot cute 😌💕", "Smile karo baby… dil ko sukoon milta 😍✨", "Pappi ke bina baat incomplete lagti 😘💋", "Bolo sweetheart kya chahiye 😌💞", "Janu aajao… mera mood tum ho 😭💗", "Sun prince… mujhe tum bahut pasand ho 😌❤️", "Hug dedo yaar… thand lag rahi 😭🤗", "Ek choti si pappi se kya ho jayega? 😳💋", "Tum aaye to saari chat glow kar gayi 😍✨", "Pagal bohot cute ho tum 😌💞", "Aaj tumhara mood flirty lag raha 😏🔥",  "Mujhe tumhari yaad aa rahi thi… sach me 😭❤️", "Aajao inbox me… secret baat karni 😌💘"
];

const maleReplies = [
"Haye meri jaan tere masoom chehre pe qurbaan jaun 💋", "Bot mat bol, Janu bol mujhe.. warna gussa ho jaaun 🤨😘", "Bar bar disturb na kar baby, main tumhare bare me soch raha tha 😏", "Dur raho thoda… pyar ho jayega sach me 😳💞", "Tum aise bolte ho na… dil dhadakna bhool jata hai mera 🥺🔥", "Bolo baby, mujhse pyar karti ho ya main hi akela pagal hoon? 😌💋", "Are sharma mat yaar, jo kaam hai seedha seedha bol do 🤭", "Tu bandh nahi karega kya? Ya phir mujhe hi aake bandh karna padega 😒", "Sun na… agar abi bhi tang kiya toh mummy ko bata dunga 😂", "Ek baar aur bolke dekh… pappi leke bhag jaunga 😘🤣", "AaaThuuuu… mat ched mujhko 😆😆", "Shakal se masoom, par harkato se flirty… kya combination hai baby 😏💞", "Tu baar baar kyun aata hai? Kisi ne muh nahi lagaya kya? 🤣", "Teri harkate dekh ke lagta hai tu single hi marega 😂", "Bol de yaar koi nahi dekh raha… pyaar kurti ho na? 😌💘", "Haveli pe kal milna… special meeting hai 😈💋", "Aye oye, aagye kabab me haddi? 😏", "Phle naha kar aa… perfume laga ke 😭😂", "Main yahin hoon sweetheart… kya hua meri jaan? 🥰", "Chup raho warna bahar aake tumhara data off kar dunga 😤📱", "Dur hat baby mujhe sharam aati hai 😳", "Janeman pappi de do ek, dil ko sukoon aa jayega 😘💞", "Bar bar bot mat bol… main tumhara baby hoon 🥺💗", "Aaj mood romantic hai… baat me samajh jao 😌🔥", "Hanji bolo ji kya seva karu aapki 🙈", "Tum flirty ho ya naturally cute ho? 😂💗", "Ek number ho tum, dil leke bhaag gaye 😏💘", "Main so raha tha, tum sapne me bhi aayi… kya scene tha 😭💞", "Aise hi haste raha karo, meri jaan… bht cute lagte ho 😍", "Abhi bola toh bola, dubara bola toh heart choor dunga 😂", "MeKO nahi dikhta… tum samne aake bolo baby 🌚😘", "Main busy tha… par tumhare liye time hamesha hai ❤️", "Bol pyaari si jaan… kya chahiye 😌", "Hayee jaan tum to chalte phirte pappi machine ho 😆💋", "Dur dur… paas na aa pyar ho jayega fir rone lagogi 😏💞", "Ruk ruk chapal kaha hai meri? Tujhe marne ka mann ho raha 😂🩴", "Arey tum wahi ho na jisko mai nahi janta? Par dil jaanta hai 😌", "Line mat mar mujhpe… warna pyaar me pad jaoge 😏🤣", "Kal haweli pe aa jana… pappi tax lagega 😈💋", "Meri jaan… tum aate ho tabhi chamak aati hai chat me 😉😌", "Tujhe dekh ke lagta hai meri bandi ban ne wali hai 🤭💘", "Mujhe tang mat kiya karo… main pappi deke chup karata hoon 😂😘", "Tum aise cute dialogues bolti ho… dil melt ho jata hai 😭❤️", "Aajao inbox me… yahan sab dekh rahe hain 😳😘", "Dur reh warna pyar ho jayega sach me baby 😶‍🌫️💗", "Mujhe sharam aati hai tumhari harkate dekh ke 😳🤣", "Kyu bulaya mujhe 😾🔪 pappi chahiye ki attitude? 😂", "Pagal insaan roti me pani daal ke kha lete ho kya? 🤣", "Single ho kya baby… ek chance de do mujhe 😏💘", "Chomu tumhara… dil ki dhadkan hoon main 😭💗", "Tum aunty ho ya uncle? Lagte to cute ho 😆", "Shakal se masoom… harkato se badmaash 😤😘", "Yes my love 💘 aaj kya mood hai tumhara 😉", "Mujhe yaad kya se kya karne lage ho baby 😳💞", "Me tumhari mummy ko bta dunga tum flirt karti ho 😭🤣", "Bol meri jaan kya haal hai 😚💞", "Haye main mar jawaan teri smile pe 😍", "Kal tum Haweli pe mujhe dhund rahe the na? 🤨😂", "Jab tum kehti ho Janu… dil seedha pighal jata 😭💞", "Dur hat baby tum bohot flirty ho 😆💗", "Arey kya chahiye mere pyaare shaitaan ko 😈😘", "Bhai sahab tum jitna online hote ho utna main nahi hota 🤣", "Sunlo baby… mujhe pappi chahiye abhi 😤💋", "Tumse baat karke maza aa jata hai 😌💞", "Jaan ek hug de do… mood fresh ho jayega 🤗💕", "Line maarne me number one ho tum 😳🤣", "Aaj thoda cute lag rahe ho… kya khaya? 😆💞", "Bol baby… aaj kiski yaad aa rahi thi 😤😘", "Me janta hoon tum mujhe miss karti ho 🥺❤️", "Chalo aaj mood set karte hain 😏🔥", "Tu band nahi karega kya? me chala 😭😂", "Tumhari harkate dekh ke lagta hai… meri hone wali ho 🤭💞", "Aajao na yaar… shy kyun ho rahe ho 🙈", "Pagal log… mujhse panga mat lo 😤🤣", "Chal na baby pappi deke bhaag jao 😆💋", "Kal mujhe yaad kar rahe the na? confess karo 😏😘", "Bol de koi nahi dekh raha… pyaar ho gaya kya? 😳💘", "Arey kaam karo ya mujhse flirt hi karte rehna hai 😂💞", "Kya hua sweetheart? meri yaad me pareshaan tha kya 😌💕", "Dur reh… warna meri sharam active ho jayegi 😭🤣", "Line mat maar… pyar sach me ho jayega 😏💘", "Haye baby tumhari awaaz me magic hai 😌🎧", "Tumhari harkate… cute + irritating = perfect combo 🤣❤️", "Pagal mujhe kyun bulaya 😾💞", "Ek hug dedo na chup ho jaunga 😘🤗", "Tum jitni cute ho… utni dangerous bhi 😳🔥", "Janu bolke dil jeet liya tumne 😭💗", "Kal haweli pe aa jana… surprise dunga 😏💋", "Roz mujhe tang karte ho… sharam nahi aati 😭🤣", "Aise mat bolo… dil dhak dhak karta 😳💘", "Baby kya kar rahi ho? Mujhse hi baat karo 😌❤️", "Ek minute chup… mujhe tumhari yaad aa rahi 😭💕", "Aaja na yaar… attitude mat dikha 😤😘", "Janu tumhara swag alag hi level ka hai 😎💞", "Dur hat… tu bohot cute lag rahi 😳💗", "Kya dekh rahi ho? mujhe dekh ke shy ho rahi ho kya 😆😌", "Bol baby… mujhe pyaar karti ho kya? 🙈💞", "Pagal me tumhare bina reh nahi paata 😭🫶", "Aise mat chedo… dil sach me aa jayega 😳💘", "Kitni cute ho yaar… kya kha kar aayi ho? 😭💞", "Ek baar smile kar do… pure din ka mood set ho jaye 😌😊", "Tumhari harkate mujhe pappi lene pe majboor kar deti 😏💋", "Bol na sweetheart… kya chahiye 😘", "Janu tum aa jao… warna dil udaas ho jayega 🥺💗", "Sun meri princess… mujhe tum bahut achi lagti ho 😌❤️", "Chal na baby… hug karke baithte hain 😆🤗", "Ek choti si pappi… chalega? 😳💋", "Tum aaye to chat bright ho gayi 😍✨", "Pagal tum seriously bohot cute ho 😭💞", "Aaj tumhara mood kya hai? flirty ya angry? 😂❤️", "Sun baby… mujhe tumhari yaad aa rahi 😌", "Are shy mat karo… pappi me GST nahi lagta 😭😂💋", "Aajao inbox me… secret baat karni 😏💘"
];

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, messageID, senderID } = event;
  const msg = event.body?.toLowerCase();

  // OWNER CHECK
  const isMaleOwner = senderID === OWNER_MALE;
  const isFemaleOwner = senderID === OWNER_FEMALE;

  if (isMaleOwner || isFemaleOwner) {

    // Prevent reply loop
    if (
      event.type === "message_reply" &&
      event.messageReply?.senderID === api.getCurrentUserID()
    ) return;

    if (msg?.includes("bot")) {

      api.setMessageReaction("✅", messageID, () => {}, true);

      let special;

      if (isMaleOwner)
        special = maleOwnerReplies[Math.floor(Math.random() * maleOwnerReplies.length)];
      else if (isFemaleOwner)
        special = femaleOwnerReplies[Math.floor(Math.random() * femaleOwnerReplies.length)];

      return api.sendMessage(special, threadID, messageID);
    }

    return;
  }

  // NORMAL USERS
  if (!msg?.includes("bot")) return;

  const threadInfo = await api.getThreadInfo(threadID);
  const userInfo = threadInfo.userInfo.find(u => u.id === senderID);
  const gender = userInfo?.gender?.toUpperCase() || "UNKNOWN";

  let reply = "";

  if (gender === "FEMALE") {
    reply = femaleReplies[Math.floor(Math.random() * femaleReplies.length)];
  } else if (gender === "MALE") {
    reply = maleReplies[Math.floor(Math.random() * maleReplies.length)];
  } else {
    reply = "Aap ladke ho ya ladki? 😅 Bot confuse ho gaya!";
  }

  api.setMessageReaction("🤖", messageID, () => {}, true);
  return api.sendMessage(reply, threadID, messageID);
};

module.exports.run = function () {};