import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
dotenv.config();

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_MAIN_CHANNEL_ID = process.env.TELEGRAM_MAIN_CHANNEL_ID;
const TELEGRAM_SUPPORT_CHANNEL_ID = process.env.TELEGRAM_SUPPORT_CHANNEL_ID;
const ADMINS = [1425784815];
const users = [
  'Hamed_AJ7',
  'Haj_TT',
  'none_type1',
  'Atletiaiyan',
  'iliyyaaaaaaa123',
  'yesufindme',
  'Arian_86_m',
  'Asdfghjkl12366787',
  'Siakoolak',
  'realmjavadd',
  'Shahab13131313',
  'Maximilanus',
  'm_rs0O',
  'Sinagachpazz',
  'aryasp18',
  'reza_kh_85',
  'MohammadRaza1386',
  'pr3aaaa',
  'mohammadreza_f2104',
  'Arman_fsh',
  'Ze11az',
];

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const sessions = {};
//=============================================================|
bot.onText(/\/message(?:\s+(\S+))?/, async (msg, match) => {
  const receiverId = match[1];
  if (!receiverId) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ لطفاً بعد از دستور، شناسه‌ی گیرنده را وارد کنید.\nمثال:\n/message 123456789',
    );
  }
  if (!ADMINS.includes(msg.from.id)) {
    bot.sendMessage(msg.chat.id, 'No permission');
    return;
  }

  try {
    const chat = await bot.getChat(receiverId);
    sessions[msg.from.id] = {
      command: 'message',
      step: 'waiting_for_message',
      receiver: chat,
    };
  } catch (err) {
    await bot.sendMessage(msg.chat.id, '❌ User not found');
    return;
  }

  bot.sendMessage(msg.chat.id, 'لطفا پیامتون رو وارد کنید');
});

bot.onText(/\/support/, (msg) => {
  sessions[msg.from.id] = {
    command: 'support',
    step: 'waiting_for_message',
  };
  bot.sendMessage(msg.chat.id, 'لطفا پیامتون رو وارد کنید');
});

bot.onText(/\/random_koony/, (msg) => {
  const randomUser = users[Math.floor(Math.random() * users.length)];
  bot.sendMessage(msg.chat.id, `🍑@${randomUser} کونیه`);
});

bot.onText(/\/random_kiss/, (msg) => {
  const randomUser1 = users[Math.floor(Math.random() * users.length)];
  const randomUser2 = users[Math.floor(Math.random() * users.length)];
  bot.sendMessage(msg.chat.id, `@${randomUser1} 💏 @${randomUser2}`);
});

bot.onText(/\/fact(?:\s+(\S+))?/, async (msg, match) => {
  if (!match[1]) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ لطفاً بعد از دستور، شناسه‌ی گیرنده را وارد کنید.\nمثال:\n/fact @user',
    );
  }
  if (!users.includes(match[1].slice(1))) {
    bot.sendMessage(msg.chat.id, 'Invalid user');
    return;
  }
  const facts = [
    'این {user} شبا زیر پل کون میده',
    'این {user} روزی ده تا کیر میخوره',
    'غلامرضا از {user} میترسه',
    'این {user} هنوز پول اکبرپورو نداده',
    'بالاترین نمره مستمر {user} 3 بوده (از ورزش)',
    'این {user} میتونه با گچپز پرس سینه بزنه',
    'این {user} خود خداس',
    'این {user} کصخله',
    'این {user} ترنسه',
    'این {user} بچه خوبیه, صبحا میره نون میگیره',
    'افشار جلوی {user} کم میاره, حالا توی چی, بماند',
    'این {user} پولداره, به ما پیزی نمیگه',
    'این {user} هنوز داره از نوکیای پدربزرگش استقاده میکنه',
    'دوست پسر {user} باهاش کات کرده',
    'این {user} همتونو میگاد',
    'فکت؟ بیاه👍',
    'یبار دیگه بگو',
  ];
  const fact = facts[Math.floor(Math.random() * facts.length)];
  bot.sendMessage(msg.chat.id, fact.replace('{user}', match[1]));
});
//=============================================================|
bot.on('message', (msg) => {
  const message = msg.text;
  if (message.startsWith('/message')) return;
  if (message.startsWith('/support')) return;
  if (message.startsWith('/random_koony')) return;
  if (message.startsWith('/random_kiss')) return;
  if (message.startsWith('/fact')) return;

  if (message === 'لغو') {
    return delete sessions[msg.from.id];
  }

  const session = sessions[msg.from.id];
  //--------------------------|
  if (session.command === 'message' && session.step === 'waiting_for_message') {
    bot.sendMessage(session.receiver.id, String(message));
    bot.sendMessage(
      msg.chat.id,
      `✅ پیام شما به ${session.receiver.username} ارسال شد:\n${message}`,
    );
  }
  //--------------------------|
  if (session.command === 'support' && session.step === 'waiting_for_message') {
    bot.sendMessage(
      TELEGRAM_SUPPORT_CHANNEL_ID,
      `message from ${msg.from.username} with id:${msg.from.id} :\n${message}`,
    );
    bot.sendMessage(
      msg.chat.id,
      `✅ پیام شما به گروه پشتیبانی ما ارسال شد:\n${message}`,
    );
  }
  //--------------------------|
  delete sessions[msg.from.id];
});
//=============================================================|
// sendToTelegram({ message: 'ربات با موفقیت آنلاین شد' });
