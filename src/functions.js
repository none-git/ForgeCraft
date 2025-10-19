export async function getBot(TELEGRAM_TOKEN) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getMe`);
  return await res.json();
}
export async function sendMessage(TELEGRAM_TOKEN, chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    ...options,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    if (data.description !== 'Bad Request: chat not found') {
      console.error('Telegram send error:', data);
      return data.result;
    }
  }

  return data.result;
}
export async function editMessage(TELEGRAM_TOKEN, chatId, messageId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageText`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text,
    ...options,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error('Telegram edit error:', data);
  }

  return data.result;
}
export async function deleteMessage(TELEGRAM_TOKEN, chatId, messageId) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/deleteMessage`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error('Telegram delete error:', data);
  }

  return data.ok;
}
export async function sendPhoto(TELEGRAM_TOKEN, chatId, photo, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`;
  const body = {
    chat_id: chatId,
    photo,
    ...options,
  };
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error('Telegram send error:', data);
  }

  return data.result;
}
export async function editPhoto(TELEGRAM_TOKEN, chatId, messageId, photo, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/editMessageMedia`;
  const body = {
    chat_id: chatId,
    message_id: messageId,
    media: {
      type: 'photo',
      media: photo,
      parse_mode: options.parse_mode || 'MarkdownV2',
    },
  };

  if (options.caption) {
    body.media.caption = options.caption;
  }

  if (options.reply_markup) {
    body.reply_markup = options.reply_markup;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error('Telegram edit error:', data);
  }

  return data.result;
}
export async function answerInlineQuery(token, queryId, results) {
  const url = `https://api.telegram.org/bot${token}/answerInlineQuery`;
  const body = { inline_query_id: queryId, results, cache_time: 60 * 60, is_personal: true };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return new Response('OK', { status: res.ok ? 200 : 500 });
}
export async function editInlineMessage(token, inlineMessageId, text, options = {}) {
  const url = `https://api.telegram.org/bot${token}/editMessageText`;
  const body = { inline_message_id: inlineMessageId, text, ...options };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) console.error('Inline edit error:', data);
  return data;
}
export async function answerCallbackQuery(TELEGRAM_TOKEN, callbackQueryId, text, showAlert = false) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`;
  const body = {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error('Telegram callback error:', data);
  }

  return data.result;
}
export function isCommand(text, cmd) {
  if (!text) return false;
  const botUsername = 'ForgeCraftRobot';
  const t = text.trim().toLowerCase();
  const c = cmd.toLowerCase();
  const b = botUsername.toLowerCase();
  return t === `/${c}` || t === `/${c}@${b}`;
}
export function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
export function quote(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}
export function getUserProfile(items, playerLevel, dungeonLevel = 0) {
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
      playerLevel * (stat === 'armor' ? 5 : 1) +
      dungeonLevel * (stat === 'armor' ? 5 : 1) +
      Object.values(equipped).reduce((sum, item) => sum + (item?.data?.[stat] ?? 0), 0)
    );
  }
  return {
    equipped,
    armor: calcTotal('armor'),
    strength: calcTotal('strength'),
    stamina: calcTotal('stamina'),
  };
}
export function getGuildProfile(donations) {
  function moneyForNextGuildLevel(level) {
    const baseMoney = 1000;
    const growth = 1.12;
    return baseMoney * growth ** (level - 1);
  }
  let level = 0;
  let usedMoney = 0;
  while (usedMoney <= donations) {
    level++;
    usedMoney += moneyForNextGuildLevel(level);
  }
  usedMoney -= moneyForNextGuildLevel(level);
  return { level, mnfnl: moneyForNextGuildLevel(level), mhfnl: donations - usedMoney };
}
export function xpForNextLevel(level) {
  const baseXP = 100;
  const growth = 1.15;
  return Math.floor(baseXP * Math.pow(1 + level, growth) * Math.log(1 + level));
}
export function rankDisplay(item) {
  if (!item) return 'none';
  switch (item.rank) {
    case 'common':
      return `⚪ *${item.name}*`;
    case 'uncommon':
      return `🟢 *${item.name}*`;
    case 'rare':
      return `🔵 *${item.name}*`;
    case 'epic':
      return `🟣 *${item.name}*`;
    case 'legendary':
      return `🟠🔥 *${item.name}* 🔥`;
  }
}
export function dungeonPower(lvl, need = false) {
  if (need) {
    switch (lvl) {
      case 1:
        return 200;
      case 2:
        return 350;
      case 3:
        return 550;
      case 4:
        return 850;
      case 5:
        return 1200;
      case 6:
        return 1600;
      case 7:
        return 2500;
      case 8:
        return 2800;
    }
  }
  switch (lvl) {
    case 1:
      return 100;
    case 2:
      return 250;
    case 3:
      return 450;
    case 4:
      return 750;
    case 5:
      return 1200;
    case 6:
      return 1600;
    case 7:
      return 16000;
    case 8:
      return 34000;
  }
}
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
