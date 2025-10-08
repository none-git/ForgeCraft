import { createClient } from '@supabase/supabase-js';
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

export default {
  // ========================== Scheduled ========================== //
  async scheduled(event, env, ctx) {
    const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    ctx.waitUntil(
      (async () => {
        //------------------------------------------//
        const { data: actions } = await db.from('action_house').select('*');
        if (!actions?.length) {
          for (const action of actions) {
            const created = new Date(action.created_at);
            const now = new Date();
            const diffMinutes = Math.floor((now - created) / (1000 * 60));
            if (diffMinutes >= 60 * 24 * 3) {
              await db.from('action_house').delete().eq('id', action.id);
            }
          }
        }
        //------------------------------------------//
        const { data: adventures } = await db
          .from('adventures')
          .select('*, item_reward:items(*), player:players(*)');
        if (!adventures?.length) return;
        for (const adventure of adventures) {
          const player = adventure.player;
          const created = new Date(adventure.created_at);
          const now = new Date();
          const diffMinutes = Math.floor((now - created) / (1000 * 60));
          if (diffMinutes >= 30) {
            try {
              const playerUpdate = { money: player.money + adventure.money_reward };
              const playerXP = player.xp + adventure.xp_reward;
              if (xpForNextLevel(player.level) <= playerXP) {
                playerUpdate.level = player.level + 1;
                playerUpdate.xp = playerXP - xpForNextLevel(player.level);
              } else {
                playerUpdate.xp = playerXP;
              }

              await db.from('adventures').delete().eq('id', adventure.id);
              await db
                .from('player_items')
                .insert([{ player_id: player.id, item_id: adventure.item_reward.id }]);
              await db.from('players').update(playerUpdate).eq('id', player.id);
              await sendMessage(
                TELEGRAM_TOKEN,
                adventure.player.id,
                `
*Adventure Completed\\!*

*Your rewards:*
💰 Money Reward:  *$${adventure.money_reward}*
✨ XP Gained:  *${adventure.xp_reward}XP*
🎁 Item:  *${adventure.item_reward.name}*
              `,
                { parse_mode: 'MarkdownV2' },
              );
            } catch (err) {
              console.error('DB Error:', err);
              await sendMessage(
                TELEGRAM_TOKEN,
                adventure.player.id,
                '❌ An error occurred while creating your character.',
              );
            }
          }
        }
      })(),
    );
  },
  // ========================== Fetch ========================== //
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('OK', { status: 200 });
    const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const body = await request.json();

    const getPlayerItems = async (playerId) => {
      const { data: data, error: error } = await db
        .from('player_items')
        .select(`*, data:items(*)`)
        .eq('player_id', playerId);
      if (error) throw error;
      return data;
    };
    const getUserProfile = async (items, playerLevel) => {
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
          Object.values(equipped).reduce((sum, item) => sum + (item?.data?.[stat] ?? 0), 0)
        );
      }
      return {
        equipped,
        armor: calcTotal('armor'),
        strength: calcTotal('strength'),
        stamina: calcTotal('stamina'),
      };
    };
    // ---------------------- Commands ---------------------- //
    if (body.message && body.message.text) {
      const fromId = body.message.from.id;
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const textMatch = text.trim().split(/\s+/);
      //------------------------------------------/fact
      if (textMatch[0].startsWith('/fact')) {
        if (!textMatch[1]) {
          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            '⚠️ لطفاً بعد از دستور، شناسه‌ی گیرنده را وارد کنید.\nمثال:\n/fact @user',
          );
          return new Response('Error', { status: 200 });
        }
        if (!users.includes(factMatch[1].slice(1))) {
          await sendMessage(TELEGRAM_TOKEN, chatId, 'Invalid user');
          return new Response('Error', { status: 200 });
        }
        const facts = [
          'این {user} شبا زیر پل کون میده',
          'این {user} روزی 26 تا کیر میخوره',
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
        await sendMessage(TELEGRAM_TOKEN, chatId, fact.replace('{user}', factMatch[1]));
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/create
      if (textMatch[0].startsWith('/create')) {
        const username = body.message.from.username;
        try {
          const { data: player } = await db.from('players').select('id').eq('id', fromId).maybeSingle();
          if (player) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You already have a character.');
            return new Response('Error', { status: 200 });
          }

          const { error: insertError } = await db.from('players').insert([{ id: fromId, username }]);
          if (insertError) throw insertError;

          await sendMessage(TELEGRAM_TOKEN, chatId, `✅ Character "${username}" created.`);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(TELEGRAM_TOKEN, chatId, '❌ An error occurred while creating your character.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/profile
      if (textMatch[0].startsWith('/profile')) {
        const username = textMatch[1] ? textMatch[1].slice(1) : body.message.from.username;
        try {
          const { data: player } = await db
            .from('players')
            .select('*')
            .eq('username', username)
            .maybeSingle();
          if (!player) {
            await sendMessage(
              TELEGRAM_TOKEN,
              chatId,
              textMatch[1] ? '⚠️ Character not found.' : '⚠️ You dont have a character.',
            );
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);
          const profile = await getUserProfile(items, player.level);

          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            `
⭐*Level:  ${player.level}*
💰*Money:  $${player.money}*
⭐*XP:  ${player.xp}\\/${xpForNextLevel(player.level)}XP*

🛡️*Armor:  ${profile.armor}*
💪*Strength:  ${profile.strength}*
❤️*Stamina:  ${profile.stamina}*

*weapon:  ${profile.equipped.weapon?.data.name ?? 'none'}*
*shield:  ${profile.equipped.shield?.data.name ?? 'none'}*
*chest:  ${profile.equipped.chest?.data.name ?? 'none'}*
*head:  ${profile.equipped.head?.data.name ?? 'none'}*
*legs:  ${profile.equipped.legs?.data.name ?? 'none'}*
*arms:  ${profile.equipped.arms?.data.name ?? 'none'}*
            `,
            { parse_mode: 'MarkdownV2' },
          );
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            '❌ An error occurred while geting charecter profile data.',
          );
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/items
      if (textMatch[0].startsWith('/items')) {
        const username = textMatch[1] ? textMatch[1].slice(1) : body.message.from.username;
        try {
          const { data: player } = await db
            .from('players')
            .select('*')
            .eq('username', username)
            .maybeSingle();
          if (!player) {
            await sendMessage(
              TELEGRAM_TOKEN,
              chatId,
              textMatch[1] ? '⚠️ Character not found.' : '⚠️ You dont have a character.',
            );
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);

          let message = '';
          items.forEach((item) => {
            if (message)
              message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
            message += `
*${item.data.name}*     *ID:  ${item.id}*
*Price:  $${item.data.price}*     *Type:*  ${item.data.type}
🛡️: *${item.data.armor}*    \\|    💪: *${item.data.strength}*    \\|    🩸: *${item.data.stamina}*
            `;
          });
          if (!items?.length) message = '*No item*';
          await sendMessage(TELEGRAM_TOKEN, chatId, message, { parse_mode: 'MarkdownV2' });
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            '❌ An error occurred while geting charecter items data.',
          );
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/equip
      if (textMatch[0].startsWith('/equip')) {
        const itemId = parseInt(textMatch[1]);
        if (!itemId) {
          await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ Enter your item ID\nLike:\n/equip 123');
          return new Response('Error', { status: 200 });
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have a character.');
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);

          const item = items.find((item) => item.id === parseInt(itemId));
          if (!item) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have this item');
            return new Response('Error', { status: 200 });
          }
          const oldItem = items.find((x) => x.status && x.data.type === item.data.type);
          if (oldItem) await db.from('player_items').update({ status: false }).eq('id', oldItem.id);
          await db.from('player_items').update({ status: true }).eq('id', item.id);

          await sendMessage(TELEGRAM_TOKEN, chatId, `*${item.data.name}* equipped`, {
            parse_mode: 'MarkdownV2',
          });
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(TELEGRAM_TOKEN, chatId, '❌ An error occurred while equipping item');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/adventure
      if (textMatch[0].startsWith('/adventure')) {
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have a character.');
            return new Response('Error', { status: 200 });
          }
          const { data: adventure } = await db
            .from('adventures')
            .select('id')
            .eq('player_id', fromId)
            .maybeSingle();
          if (adventure) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You already in an adventure.');
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);
          const profile = await getUserProfile(items, player.level);
          const moneyReward = Math.floor(player.level + Math.random() * (player.level * 0.5)) * 2;
          const xpReward = Math.floor(player.level + Math.random() * (player.level * 0.5)) * 60;
          let rank = wichRank(player.level);
          const rankChance = Math.floor(Math.random() * 100);
          function wichRank(level) {
            const ranks = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
            const rankNum = Math.floor(level / 20);
            return { name: ranks[rankNum], id: rankNum };
          }
          if (rankChance >= 65 && rankChance < 80) {
            const rankNum = rank.id - 1 >= 0 ? rank.id - 1 : rank.id + 1;
            rank = wichRank(rankNum * 20);
          }
          if (rankChance >= 80 && rankChance < 90) {
            let rankNum = 0;
            if (rank.id - 1 >= 0) {
              if (rank.id + 1 <= 4) {
                rankNum = rank.id + 1;
              } else {
                rankNum = rank.id - 2;
              }
            } else {
              rankNum = rank.id + 2;
            }
            rank = wichRank(rankNum * 20);
          }
          if (rankChance >= 90 && rankChance < 97) {
            let rankNum = 0;
            if (rank.id - 1 >= 0) {
              if (rank.id + 1 <= 4) {
                if (rank.id - 2 >= 0) {
                  rankNum = rank.id - 2;
                } else {
                  rankNum = rank.id + 2;
                }
              } else {
                rankNum = rank.id - 3;
              }
            } else {
              rankNum = rank.id + 3;
            }
            rank = wichRank(rankNum * 20);
          }
          if (rankChance >= 97) {
            let rankNum = 0;
            if (rank.id - 1 >= 0) {
              if (rank.id + 1 <= 4) {
                if (rank.id - 2 >= 0) {
                  if (rank.id + 2 <= 4) {
                    rankNum = rank.id + 2;
                  } else {
                    rankNum = rank.id - 3;
                  }
                } else {
                  rankNum = rank.id + 3;
                }
              } else {
                rankNum = rank.id - 4;
              }
            } else {
              rankNum = rank.id + 4;
            }
            rank = wichRank(rankNum * 20);
          }
          const { data: allItems } = await db.from('items').select('*').eq('rank', rank.name);
          const itemReward = allItems[Math.floor(Math.random() * allItems.length)];

          const { error: insertError } = await db.from('adventures').insert([
            {
              player_id: fromId,
              armor: profile.armor,
              strength: profile.strength,
              stamina: profile.stamina,
              item_reward: itemReward.id,
              money_reward: moneyReward,
              xp_reward: xpReward,
            },
          ]);
          if (insertError) throw insertError;

          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            `
*Adventure Started\\!*

*Your rewards after journey:*
💰 Money Reward:  *$${moneyReward}*
✨ XP Gain:  *${xpReward}XP*
🎁 Item:  *${itemReward.name}*

Current Stats:
🛡️: *${profile.armor}*    \\|    💪: *${profile.strength}*    \\|    🩸: *${profile.stamina}*
            `,
            { parse_mode: 'MarkdownV2' },
          );
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(TELEGRAM_TOKEN, chatId, '❌ An error occurred while starting an adventure');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/sell
      if (textMatch[0].startsWith('/sell')) {
        const itemId = parseInt(textMatch[1]);
        if (!itemId) {
          await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ Enter your item ID\nLike:\n/sell 123');
          return new Response('Error', { status: 200 });
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have a character.');
            return new Response('Error', { status: 200 });
          }
          const { data: item } = await db
            .from('player_items')
            .select(`*, data:items(*)`)
            .eq('id', itemId)
            .eq('player_id', player.id)
            .maybeSingle();
          if (!item) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have this item');
            return new Response('Error', { status: 200 });
          }
          await db
            .from('players')
            .update({ money: player.money + item.data.price })
            .eq('id', player.id);
          await db.from('player_items').delete().eq('id', item.id);

          await sendMessage(
            TELEGRAM_TOKEN,
            chatId,
            `*${item.data.name}* sold\nPrice: *$${item.data.price}*`,
            { parse_mode: 'MarkdownV2' },
          );
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(TELEGRAM_TOKEN, chatId, '❌ An error occurred while selling item');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/action_house
      if (textMatch[0].startsWith('/action_house')) {
        const actionType = textMatch[1];
        const itemId = parseInt(textMatch[2]);
        const price = parseInt(textMatch[3]);
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have a character.');
            return new Response('Error', { status: 200 });
          }
          const { data: actions } = await db
            .from('action_house')
            .select(`*, item:player_items(*, data:items(*))`);
          if (!actionType) {
            let message = '';
            actions.forEach((action) => {
              if (message)
                message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
              message += `
*${action.item.data.name}*     *ID:  ${action.item.id}*
*Price:  $${action.price}*     *Type:*  ${action.item.data.type}
🛡️: *${action.item.data.armor}*    \\|    💪: *${action.item.data.strength}*    \\|    🩸: *${action.item.data.stamina}*
              `;
            });
            if (!actions?.length) message = '*No item for sale*';
            await sendMessage(TELEGRAM_TOKEN, chatId, message, { parse_mode: 'MarkdownV2' });
            return new Response('OK', { status: 200 });
          }
          if (actionType === 'sell') {
            if (!itemId || !price) {
              await sendMessage(
                TELEGRAM_TOKEN,
                chatId,
                '⚠️ Enter your item ID and Price\nLike:\n/action_house sell 123 500',
              );
              return new Response('Error', { status: 200 });
            }
            const { data: item } = await db
              .from('player_items')
              .select(`*, data:items(*)`)
              .eq('id', itemId)
              .eq('player_id', player.id)
              .maybeSingle();
            if (!item) {
              await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have this item.');
              return new Response('Error', { status: 200 });
            }
            if (player.money < price * 0.05) {
              await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have enough money to pay the fee.');
              return new Response('Error', { status: 200 });
            }
            await db
              .from('players')
              .update({ money: player.money - price * 0.05 })
              .eq('id', player.id);
            await db.from('action_house').insert([{ id: item.id, price }]);
            await sendMessage(TELEGRAM_TOKEN, chatId, '✅ Your item has been listed in the Action House\\!', {
              parse_mode: 'MarkdownV2',
            });
          } else if (actionType === 'buy') {
            if (!itemId) {
              await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ Enter item ID\nLike:\n/action_house buy 123');
              return new Response('Error', { status: 200 });
            }
            const action = actions.find((action) => action.id === itemId);
            if (!action) {
              await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ This item isn’t available for sale.');
              return new Response('Error', { status: 200 });
            }
            if (player.money < action.price) {
              await sendMessage(TELEGRAM_TOKEN, chatId, '⚠️ You dont have enough money to buy this item.');
              return new Response('Error', { status: 200 });
            }
            const { data: seller } = await db
              .from('players')
              .select('*')
              .eq('id', action.item.player_id)
              .maybeSingle();
            await db
              .from('players')
              .update({ money: player.money - action.price })
              .eq('id', player.id);
            await db
              .from('players')
              .update({ money: seller.money + action.price })
              .eq('id', seller.id);
            await db.from('action_house').delete().eq('id', action.id);
            await db.from('player_items').update({ status: false, player_id: player.id }).eq('id', action.id);
            await sendMessage(TELEGRAM_TOKEN, chatId, '🛒 You successfully bought the item\\!', {
              parse_mode: 'MarkdownV2',
            });
          } else {
            await sendMessage(
              TELEGRAM_TOKEN,
              chatId,
              '⚠️ Action Type must be "buy" or "sell"\nLike:\n/action_house buy ...',
            );
            return new Response('Error', { status: 200 });
          }
        } catch (err) {
          console.error('DB Error:', err);
          await sendMessage(TELEGRAM_TOKEN, chatId, '❌ An error occurred while using action house');
        }
        return new Response('OK', { status: 200 });
      }
    }

    return new Response('OK', { status: 200 });
  },
};
// ====================== Helper ======================
async function sendMessage(TELEGRAM_TOKEN, chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...options,
    }),
  });
}
function xpForNextLevel(level) {
  const baseXP = 100;
  const growth = 1.15;
  return Math.floor(baseXP * Math.pow(1 + level, growth) * Math.log(1 + level));
}
