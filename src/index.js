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
        const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
        const { data } = await db.from('settings').select('value').eq('key', 'lastDailyRun').maybeSingle();
        const lastRun = data?.value;
        if (lastRun !== currentDate) {
          await db.from('shop').delete();
          const { data: items } = await db.from('items').select('*');
          const forbiddenRanks = ['legendary', 'common'];
          let i = 0;
          while (i < 4) {
            const item = items[Math.floor(Math.random() * items.length)];
            if (!forbiddenRanks.includes(item.rank)) {
              await db.from('shop').insert([{ item_id: item.id }]);
              i++;
            }
          }
          await db.from('settings').upsert({ key: 'lastDailyRun', value: currentDate });
        }
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
          if (diffMinutes >= 29) {
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
                '❌ An error occurred while creating your character\\.',
              );
            }
          }
        }
      })(),
    );
  },
  // ========================== Fetch ========================== //
  async fetch(request, env, ctx) {
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
    // ---------------------- Commands ---------------------- //\\.'
    if (body.message && body.message.text) {
      const fromId = body.message.from.id;
      const chatId = body.message.chat.id;
      const text = body.message.text;
      const textMatch = text.trim().split(/\s+/);
      async function sendMsg(messageText) {
        return await sendMessage(TELEGRAM_TOKEN, chatId, messageText, { parse_mode: 'MarkdownV2' });
      }
      async function editMsg(messageId, messageText) {
        await editMessage(TELEGRAM_TOKEN, chatId, messageId, messageText, { parse_mode: 'MarkdownV2' });
      }
      //------------------------------------------/fact
      if (textMatch[0].startsWith('/fact')) {
        if (!textMatch[1]) {
          await sendMsg('⚠️ لطفاً بعد از دستور، شناسه‌ی گیرنده را وارد کنید.\nمثال:\n/fact @user');
          return new Response('Error', { status: 200 });
        }
        if (!users.includes(factMatch[1].slice(1))) {
          await sendMsg('Invalid user');
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
        await sendMsg(fact.replace('{user}', factMatch[1]));
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/create
      if (textMatch[0].startsWith('/create')) {
        const username = body.message.from.username;
        try {
          const { data: player } = await db.from('players').select('id').eq('id', fromId).maybeSingle();
          if (player) {
            await sendMsg('⚠️ You already have a character\\.');
            return new Response('Error', { status: 200 });
          }

          const { error: insertError } = await db.from('players').insert([{ id: fromId, username }]);
          if (insertError) throw insertError;

          await sendMsg(`✅ Character "${username}" created.`);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while creating your character\\.');
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
            await sendMsg(
              textMatch[1]
                ? `⚠️ Your target doesn't have a character\\.`
                : `⚠️ You don't have a character\\.`,
            );
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);
          const profile = getUserProfile(items, player.level);

          await sendMsg(`
⭐*Level:  ${player.level}*
💰*Money:  $${player.money}*
⭐*XP:  ${player.xp}\\/${xpForNextLevel(player.level)}XP*

🛡️*Armor:  ${profile.armor}*
💪*Strength:  ${profile.strength}*
❤️*Stamina:  ${profile.stamina}*

weapon:  ${rankDisplay(profile.equipped.weapon?.data ?? null)}
shield:  ${rankDisplay(profile.equipped.shield?.data ?? null)}
chest:  ${rankDisplay(profile.equipped.chest?.data ?? null)}
head:  ${rankDisplay(profile.equipped.head?.data ?? null)}
legs:  ${rankDisplay(profile.equipped.legs?.data ?? null)}
arms:  ${rankDisplay(profile.equipped.arms?.data ?? null)}
            `);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while geting charecter profile data\\.');
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
            await sendMsg(
              textMatch[1]
                ? `⚠️ Your target doesn't have a character\\.`
                : `⚠️ You don't have a character\\.`,
            );
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);

          let message = '';
          items.forEach((item) => {
            if (message)
              message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
            message += `
${rankDisplay(item.data)}     *ID:  ${item.id}*
*Price:  $${item.data.price}*     *Type:*  ${item.data.type}
🛡️: *${item.data.armor}*    \\|    💪: *${item.data.strength}*    \\|    🩸: *${item.data.stamina}*
            `;
          });
          if (!items?.length) message = '*No item*';
          await sendMsg(message);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while geting charecter items data\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/equip
      if (textMatch[0].startsWith('/equip')) {
        const itemId = parseInt(textMatch[1]);
        if (!itemId) {
          await sendMsg('⚠️ Enter your item ID\nLike:\n/equip 123');
          return new Response('Error', { status: 200 });
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);

          const item = items.find((item) => item.id === parseInt(itemId));
          if (!item) {
            await sendMsg(`⚠️ You don't have this item\\.`);
            return new Response('Error', { status: 200 });
          }
          const oldItem = items.find((x) => x.status && x.data.type === item.data.type);
          if (oldItem) await db.from('player_items').update({ status: false }).eq('id', oldItem.id);
          await db.from('player_items').update({ status: true }).eq('id', item.id);

          await sendMsg(`${rankDisplay(item.data)} equipped`);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while equipping item\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/adventure
      if (textMatch[0].startsWith('/adventure')) {
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: adventure } = await db
            .from('adventures')
            .select('id')
            .eq('player_id', fromId)
            .maybeSingle();
          if (adventure) {
            await sendMsg('⚠️ You already in an adventure\\.');
            return new Response('Error', { status: 200 });
          }
          const items = await getPlayerItems(player.id);
          const profile = getUserProfile(items, player.level);
          const moneyReward = Math.floor(player.level + Math.random() * (player.level * 0.5)) * 2;
          const xpReward = Math.floor(player.level + Math.random() * (player.level * 0.5)) * 60;
          let rank = 'common';
          const rankChance = Math.floor(Math.random() * 100);
          if (rankChance >= 60 && rankChance < 80) rank = 'uncommon';
          if (rankChance >= 80 && rankChance < 92) rank = 'rare';
          if (rankChance >= 92 && rankChance < 98) rank = 'epic';
          if (rankChance >= 98) rank = 'legendary';
          // {
          // function wichRank(level) {
          //   const ranks = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
          //   const rankNum = Math.floor(level / 20);
          //   return { name: ranks[rankNum], id: rankNum };
          // }
          // if (rankChance >= 65 && rankChance < 80) {
          //   const rankNum = rank.id - 1 >= 0 ? rank.id - 1 : rank.id + 1;
          //   rank = wichRank(rankNum * 20);
          // }
          // if (rankChance >= 80 && rankChance < 90) {
          //   let rankNum = 0;
          //   if (rank.id - 1 >= 0) {
          //     if (rank.id + 1 <= 4) {
          //       rankNum = rank.id + 1;
          //     } else {
          //       rankNum = rank.id - 2;
          //     }
          //   } else {
          //     rankNum = rank.id + 2;
          //   }
          //   rank = wichRank(rankNum * 20);
          // }
          // if (rankChance >= 90 && rankChance < 97) {
          //   let rankNum = 0;
          //   if (rank.id - 1 >= 0) {
          //     if (rank.id + 1 <= 4) {
          //       if (rank.id - 2 >= 0) {
          //         rankNum = rank.id - 2;
          //       } else {
          //         rankNum = rank.id + 2;
          //       }
          //     } else {
          //       rankNum = rank.id - 3;
          //     }
          //   } else {
          //     rankNum = rank.id + 3;
          //   }
          //   rank = wichRank(rankNum * 20);
          // }
          // if (rankChance >= 97) {
          //   let rankNum = 0;
          //   if (rank.id - 1 >= 0) {
          //     if (rank.id + 1 <= 4) {
          //       if (rank.id - 2 >= 0) {
          //         if (rank.id + 2 <= 4) {
          //           rankNum = rank.id + 2;
          //         } else {
          //           rankNum = rank.id - 3;
          //         }
          //       } else {
          //         rankNum = rank.id + 3;
          //       }
          //     } else {
          //       rankNum = rank.id - 4;
          //     }
          //   } else {
          //     rankNum = rank.id + 4;
          //   }
          //   rank = wichRank(rankNum * 20);
          // }
          // }
          const { data: allItems } = await db.from('items').select('*').eq('rank', rank);
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

          await sendMsg(`
*Adventure Started\\!*

*Your rewards after journey:*
💰 Money Reward:  *$${moneyReward}*
✨ XP Gain:  *${xpReward}XP*
🎁 Item:  *${rankDisplay(itemReward)}*

Current Stats:
🛡️: *${profile.armor}*    \\|    💪: *${profile.strength}*    \\|    🩸: *${profile.stamina}*
            `);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while starting an adventure\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/gift
      if (textMatch[0].startsWith('/gift')) {
        let targetUsername = textMatch[1];
        const itemId = parseInt(textMatch[2]);
        if (!targetUsername) {
          await sendMsg('⚠️ Enter your target\nLike:\n/gift @user 123');
          return new Response('Error', { status: 200 });
        } else {
          targetUsername = textMatch[1].slice(1);
        }
        if (!itemId) {
          await sendMsg('⚠️ Enter your item ID\nLike:\n/gift @user 123');
          return new Response('Error', { status: 200 });
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: target } = await db
            .from('players')
            .select('*')
            .eq('username', targetUsername)
            .maybeSingle();
          if (!target) {
            await sendMsg(`⚠️ Your target doesn't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: item } = await db
            .from('player_items')
            .select(`*, data:items(*)`)
            .eq('id', itemId)
            .eq('player_id', player.id)
            .maybeSingle();
          if (!item) {
            await sendMsg(`⚠️ You don't have this item\\.`);
            return new Response('Error', { status: 200 });
          }

          await db.from('player_items').update({ status: false, player_id: target.id }).eq('id', item.id);

          await sendMsg(`${rankDisplay(item.data)} gifted to @${escapeMarkdownV2(target.username)}`);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while gifting item\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/sell
      if (textMatch[0].startsWith('/sell')) {
        const itemId = parseInt(textMatch[1]);
        if (!itemId) {
          await sendMsg('⚠️ Enter your item ID\nLike:\n/sell 123');
          return new Response('Error', { status: 200 });
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: item } = await db
            .from('player_items')
            .select(`*, data:items(*)`)
            .eq('id', itemId)
            .eq('player_id', player.id)
            .maybeSingle();
          if (!item) {
            await sendMsg(`⚠️ You don't have this item\\.`);
            return new Response('Error', { status: 200 });
          }
          await db
            .from('players')
            .update({ money: player.money + item.data.price })
            .eq('id', player.id);
          await db.from('player_items').delete().eq('id', item.id);

          await sendMsg(`${rankDisplay(item.data)} sold\nPrice: *$${item.data.price}*`);
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while selling item\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/shop
      if (textMatch[0].startsWith('/shop')) {
        const actionType = textMatch[1];
        const itemId = parseInt(textMatch[2]);
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: shop } = await db.from('shop').select(`*, item:items(*)`);
          if (!actionType) {
            let message = '';
            shop.forEach((shopItem) => {
              if (message)
                message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
              message += `
${rankDisplay(shopItem.item)}     *ID:  ${shopItem.id}*
*Price:  $${shopItem.item.price * 2}*     *Type:*  ${shopItem.item.type}
🛡️: *${shopItem.item.armor}*    \\|    💪: *${shopItem.item.strength}*    \\|    🩸: *${
                shopItem.item.stamina
              }*
              `;
            });
            if (!shop?.length) message = '*All items have been sold\\.*';
            await sendMsg(message);
          } else if (actionType === 'buy') {
            if (!itemId) {
              await sendMsg('⚠️ Enter your item ID\nLike:\n/buy 123');
              return new Response('Error', { status: 200 });
            }
            const shopItem = shop.find((item) => item.id === itemId);
            if (!shopItem) {
              await sendMsg(`⚠️ This item isn't available for sale\\.`);
              return new Response('Error', { status: 200 });
            }
            const { data: item } = await db
              .from('items')
              .select(`*`)
              .eq('id', shopItem.item_id)
              .maybeSingle();
            if (player.money < item.price * 2) {
              await sendMsg(`⚠️ You don't have enough money to buy this item\\.`);
              return new Response('Error', { status: 200 });
            }
            await db
              .from('players')
              .update({ money: player.money - item.price * 2 })
              .eq('id', player.id);
            await db.from('shop').delete().eq('id', shopItem.id);
            await db.from('player_items').insert([{ player_id: player.id, item_id: item.id }]);
            await sendMsg(`🛒 You successfully bought the item\\!`);
          }
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while using shop\\.');
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
            await sendMsg(`⚠️ You don't have a character\\.`);
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
${rankDisplay(action.item.data)}     *ID:  ${action.item.id}*
*Price:  $${action.price}*     *Type:*  ${action.item.data.type}
🛡️: *${action.item.data.armor}*    \\|    💪: *${action.item.data.strength}*    \\|    🩸: *${
                action.item.data.stamina
              }*
              `;
            });
            if (!actions?.length) message = '*No item for sale\\.*';
            await sendMsg(message);
          } else if (actionType === 'sell') {
            if (!itemId || !price) {
              await sendMsg('⚠️ Enter your item ID and Price\nLike:\n/action_house sell 123 500');
              return new Response('Error', { status: 200 });
            }
            const { data: item } = await db
              .from('player_items')
              .select(`*, data:items(*)`)
              .eq('id', itemId)
              .eq('player_id', player.id)
              .maybeSingle();
            if (!item) {
              await sendMsg(`⚠️ You don't have this item\\.`);
              return new Response('Error', { status: 200 });
            }
            if (player.money < price * 0.05) {
              await sendMsg(`⚠️ You don't have enough money to pay the fee\\.`);
              return new Response('Error', { status: 200 });
            }
            await db
              .from('players')
              .update({ money: player.money - price * 0.05 })
              .eq('id', player.id);
            await db.from('action_house').insert([{ id: item.id, price }]);
            await sendMsg('✅ Your item has been listed in the Action House\\!');
          } else if (actionType === 'buy') {
            if (!itemId) {
              await sendMsg('⚠️ Enter item ID\nLike:\n/action_house buy 123');
              return new Response('Error', { status: 200 });
            }
            const action = actions.find((action) => action.id === itemId);
            if (!action) {
              await sendMsg(`⚠️ This item isn't available for sale\\.`);
              return new Response('Error', { status: 200 });
            }
            if (player.money < action.price) {
              await sendMsg(`⚠️ You don't have enough money to buy this item\\.`);
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
            await sendMsg('🛒 You successfully bought the item\\!');
          } else {
            await sendMsg('⚠️ Action Type must be "buy" or "sell"\nLike:\n/action_house buy \\.\\.\\.');
            return new Response('Error', { status: 200 });
          }
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while using action house\\.');
        }
        return new Response('OK', { status: 200 });
      }
      //------------------------------------------/fight
      if (textMatch[0].startsWith('/fight')) {
        let targetUsername = textMatch[1];
        if (!targetUsername) {
          await sendMsg('⚠️ Enter your target\nLike:\n/fight @user');
          return new Response('Error', { status: 200 });
        } else {
          targetUsername = textMatch[1].slice(1);
        }
        try {
          const { data: player } = await db.from('players').select('*').eq('id', fromId).maybeSingle();
          if (!player) {
            await sendMsg(`⚠️ You don't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const { data: target } = await db
            .from('players')
            .select('*')
            .eq('username', targetUsername)
            .maybeSingle();
          if (!target) {
            await sendMsg(`⚠️ Your target doesn't have a character\\.`);
            return new Response('Error', { status: 200 });
          }
          const playeritems = await getPlayerItems(player.id);
          const pp = getUserProfile(playeritems, player.level);
          pp.hp = pp.stamina * 10;
          pp.dps = pp.strength;
          pp.dpsTake = (4000 - pp.armor) / 4000;
          const targetitems = await getPlayerItems(target.id);
          const tp = getUserProfile(targetitems, target.level);
          tp.hp = tp.stamina * 10;
          tp.dps = tp.strength;
          tp.dpsTake = (4000 - tp.armor) / 4000;

          const sent = await sendMsg(`
@${escapeMarkdownV2(player.username)}
🛡️: *${pp.armor}*    \\|    💪: *${pp.strength}*    \\|    🩸: *${pp.stamina}*

                              _*VS*_
@${escapeMarkdownV2(target.username)}
🛡️: *${tp.armor}*    \\|    💪: *${tp.strength}*    \\|    🩸: *${tp.stamina}*
            `);
          ctx.waitUntil(
            (async () => {
              await delay(2500);
              await editMsg(
                sent.message_id,
                `
@${escapeMarkdownV2(player.username)}
🛡️: *${pp.armor}*    \\|    💪: *${pp.strength}*    \\|    🩸: *${pp.stamina}*

                    _*${escapeMarkdownV2('— FIGHT! —')}*_
@${escapeMarkdownV2(target.username)}
🛡️: *${tp.armor}*    \\|    💪: *${tp.strength}*    \\|    🩸: *${tp.stamina}*
                `,
              );

              let i = 0;
              while (i < 10 && pp.hp > 0 && tp.hp > 0) {
                const attacker = Math.random() < 0.5;
                let attackSide = '';
                if (attacker) {
                  tp.hp -= pp.dps * tp.dpsTake;
                  if (tp.hp < 0) tp.hp = 0;
                  attackSide = '🗡️➡️';
                } else {
                  pp.hp -= tp.dps * pp.dpsTake;
                  if (pp.hp < 0) pp.hp = 0;
                  attackSide = '⬅️🗡️';
                }
                await delay(1050);
                await editMsg(
                  sent.message_id,
                  `
*Round ${i + 1}*
@${escapeMarkdownV2(player.username)}     ${attackSide}     @${escapeMarkdownV2(target.username)}

HP: *${parseInt(pp.hp)}*                             HP: *${parseInt(tp.hp)}*
DPS: *${pp.dps}*                             DPS: *${tp.dps}*
                  `,
                );
                i++;
              }

              await delay(1050);
              await editMsg(
                sent.message_id,
                `
_*${escapeMarkdownV2('— FIGHT ENDED! —')}*_

*WINNER:* @${escapeMarkdownV2(pp.hp > tp.hp ? player.username : target.username)}
                `,
              );
            })(),
          );
        } catch (err) {
          console.error('DB Error:', err);
          await sendMsg('❌ An error occurred while fighting\\.');
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
    console.error('Telegram edit error:', data);
  }

  return data.result;
}
async function editMessage(TELEGRAM_TOKEN, chatId, messageId, text, options = {}) {
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
function escapeMarkdownV2(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}
const getUserProfile = (items, playerLevel) => {
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
function xpForNextLevel(level) {
  const baseXP = 100;
  const growth = 1.15;
  return Math.floor(baseXP * Math.pow(1 + level, growth) * Math.log(1 + level));
}
function rankDisplay(item) {
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
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
