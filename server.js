import { createClient } from '@supabase/supabase-js';
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
const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
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

bot.onText(/\/fact(?:\s+(\S+))?/, (msg, match) => {
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

bot.onText(/\/create/, async (msg) => {
  const user = msg.from;
  try {
    const { data: player } = await db
      .from('players')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    if (player)
      return bot.sendMessage(msg.chat.id, '⚠️ You already have a character.');

    const { error: insertError } = await db.from('players').insert([
      {
        id: user.id,
        username: user.username,
      },
    ]);
    if (insertError) throw insertError;

    bot.sendMessage(
      msg.chat.id,
      `✅ Character "${user.username}" created successfully.`,
    );
  } catch (err) {
    console.error('DB Error:', err);
    bot.sendMessage(
      msg.chat.id,
      '❌ An error occurred while creating your character.',
    );
  }
});

bot.onText(/\/profile(?:\s+(\S+))?/, async (msg, match) => {
  const username = match[1] ? match[1].slice(1) : msg.from.username;
  try {
    const { data: player } = await db
      .from('players')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (!player) {
      if (match[1]) {
        return bot.sendMessage(msg.chat.id, '⚠️ Character not found.');
      } else {
        return bot.sendMessage(msg.chat.id, '⚠️ You dont have a character.');
      }
    }
    const { data: items } = await db
      .from('player_items')
      .select(`*, data:items(*)`)
      .eq('player_id', player.id);

    const equipped = {
      weapon: items.find((x) => x.data.type === 'weapon' && x.status),
      shield: items.find((x) => x.data.type === 'shield' && x.status),
      chest: items.find((x) => x.data.type === 'chest' && x.status),
      head: items.find((x) => x.data.type === 'head' && x.status),
      legs: items.find((x) => x.data.type === 'legs' && x.status),
      arms: items.find((x) => x.data.type === 'arms' && x.status),
    };
    function calcTotal(stat) {
      return (
        player.level * (stat === 'armor' ? 5 : 1) +
        Object.values(equipped).reduce(
          (sum, item) => sum + (item?.data?.[stat] ?? 0),
          0,
        )
      );
    }

    bot.sendMessage(
      msg.chat.id,
      `
⭐*Level:  ${player.level}*

🛡️*Armor:  ${calcTotal('armor')}*
💪*Strength:  ${calcTotal('strength')}*
❤️*Stamina:  ${calcTotal('stamina')}*

*weapon:  ${equipped.weapon?.data.name ?? 'none'}*
*shield:  ${equipped.shield?.data.name ?? 'none'}*
*chest:  ${equipped.chest?.data.name ?? 'none'}*
*head:  ${equipped.head?.data.name ?? 'none'}*
*legs:  ${equipped.legs?.data.name ?? 'none'}*
*arms:  ${equipped.arms?.data.name ?? 'none'}*
      `,
      { parse_mode: 'MarkdownV2' },
    );
  } catch (err) {
    console.error('DB Error:', err);
    bot.sendMessage(
      msg.chat.id,
      '❌ An error occurred while geting charecter profile data.',
    );
  }
});

bot.onText(/\/items(?:\s+(\S+))?/, async (msg, match) => {
  const username = match[1] ? match[1].slice(1) : msg.from.username;
  try {
    const { data: player } = await db
      .from('players')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (!player) {
      if (match[1]) {
        return bot.sendMessage(msg.chat.id, '⚠️ Character not found.');
      } else {
        return bot.sendMessage(msg.chat.id, '⚠️ You dont have a character.');
      }
    }
    const { data: items } = await db
      .from('player_items')
      .select(`*, data:items(*)`)
      .eq('player_id', player.id);

    let message = '';
    items.forEach((item) => {
      if (message)
        message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
      message += `
*${item.data.name}*     *Type:*  ${item.data.type}     *ID:  ${item.id}*
Armor:  *${item.data.armor}*   \\|   Strength:  *${item.data.strength}*   \\|   Stamina:  *${item.data.stamina}*
      `;
    });
    if (!items?.length) message = '*No item*';
    bot.sendMessage(msg.chat.id, message, { parse_mode: 'MarkdownV2' });
  } catch (err) {
    console.error('DB Error:', err);
    bot.sendMessage(
      msg.chat.id,
      '❌ An error occurred while geting charecter items data.',
    );
  }
});

bot.onText(/\/equipe(?:\s+(\S+))?/, async (msg, match) => {
  const userId = msg.from.id;
  const itemId = match[1];
  if (!itemId) {
    return bot.sendMessage(
      msg.chat.id,
      '⚠️ Enter your item ID\nLike:\n/equipe 123',
    );
  }
  try {
    const { data: player } = await db
      .from('players')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (!player)
      return bot.sendMessage(msg.chat.id, '⚠️ You dont have a character.');
    const { data: item } = await db
      .from('player_items')
      .select(`*, data:items(*)`)
      .match({ player_id: player.id, id: itemId })
      .maybeSingle();
    if (!item)
      return bot.sendMessage(msg.chat.id, '⚠️ You dont have this item');

    await db.from('player_items').update({ status: false }).eq('id', itemId);
    await db.from('player_items').update({ status: true }).eq('id', itemId);

    bot.sendMessage(msg.chat.id, `*${item.data.name}* equiped successfully`, {
      parse_mode: 'MarkdownV2',
    });
  } catch (err) {
    console.error('DB Error:', err);
    bot.sendMessage(
      msg.chat.id,
      '❌ An error occurred while geting charecter items data.',
    );
  }
});
//=============================================================|
bot.on('message', (msg) => {
  const message = msg.text;
  if (message.startsWith('/message')) return;
  if (message.startsWith('/support')) return;
  if (message.startsWith('/fact')) return;
  if (message.startsWith('/create')) return;
  if (message.startsWith('/profile')) return;
  if (message.startsWith('/items')) return;
  if (message.startsWith('/equipe')) return;

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
