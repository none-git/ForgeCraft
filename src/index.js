import {
  getBot,
  sendMessage,
  editMessage,
  deleteMessage,
  sendPhoto,
  editPhoto,
  answerInlineQuery,
  editInlineMessage,
  answerCallbackQuery,
  isCommand,
  escapeMarkdownV2,
  quote,
  getUserProfile,
  getGuildProfile,
  xpForNextLevel,
  rankDisplay,
  dungeonPower,
  delay,
  toTitleCase,
} from './functions';
import { createClient } from '@supabase/supabase-js';
const ADMINS = [1425784815];

export default {
  // ========================== Scheduled ========================== //
  async scheduled(event, env, ctx) {
    const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    ctx.waitUntil(
      (async () => {
        const { data: items } = await db.from('items').select('*').order('price', { ascending: true });
        const now = new Date();
        //------------------------------------------|DAILY
        const currentDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
        const { data } = await db.from('settings').select('value').eq('key', 'lastDailyRun').maybeSingle();
        const lastRun = data?.value;
        if (lastRun !== currentDate) {
          //------------------------------------------/shop
          await db.from('shop').delete().not('id', 'is', null);
          const forbiddenRanks = ['legendary', 'common'];
          const shopItems = [];
          while (shopItems.length < 6) {
            const item = items[Math.floor(Math.random() * items.length)];
            if (forbiddenRanks.includes(item.rank)) continue;
            shopItems.push({ item_id: item.id });
          }
          await db.from('shop').insert(shopItems);
          //------------------------------------------/dungeons
          await db.from('cooldowns').delete().eq('type', 'dungeon');
          //------------------------------------------
          await db.from('settings').upsert({ key: 'lastDailyRun', value: currentDate });
        }
        //------------------------------------------/sessions
        await db
          .from('sessions')
          .delete()
          .lt('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString());
        //------------------------------------------/cooldowns
        await db
          .from('cooldowns')
          .delete()
          .eq('type', 'guild broadcast')
          .lt('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString());
        //------------------------------------------/market
        await db
          .from('market')
          .delete()
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
        //------------------------------------------/adventure
        const { data: adventures } = await db
          .from('adventures')
          .select(
            'id, player_id, money_reward, xp_reward, created_at, item_reward:items(id, name, rank), player:players(id, money, xp, level)',
          )
          .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());
        for (const adventure of adventures ?? []) {
          try {
            const player = adventure.player;
            const playerUpdate = { money: player.money + adventure.money_reward, level: player.level };
            let playerXP = player.xp + adventure.xp_reward;
            while (playerXP >= xpForNextLevel(playerUpdate.level)) {
              playerXP -= xpForNextLevel(playerUpdate.level);
              playerUpdate.level++;
            }
            playerUpdate.xp = playerXP;

            await db.from('players').update(playerUpdate).eq('id', player.id);
            await db
              .from('player_items')
              .insert([{ player_id: player.id, item_id: adventure.item_reward.id }]);
            await db.from('adventures').delete().eq('id', adventure.id);

            await sendMessage(
              TELEGRAM_TOKEN,
              adventure.player.id,
              `
*Adventure Completed\\!*

*Your rewards:*
💰 Money Reward:  *$${adventure.money_reward}*
✨ XP Gained:  *${adventure.xp_reward}XP*
🎁 Item:  *${rankDisplay(adventure.item_reward)}*
              `,
              { parse_mode: 'MarkdownV2' },
            );
          } catch (err) {
            console.error('Adventure error:', adventure.id, err);
          }
        }
        //------------------------------------------/dungeons
        // 1️⃣ load active dungeons + players
        const { data: playerDungeons } = await db
          .from('player_dungeons')
          .select('id, player_id, dungeon_id, created_at, player:players(*)');
        if (!playerDungeons?.length) return;
        // 2️⃣ preload shared data
        const playerIds = [...new Set(playerDungeons.map((d) => d.player_id))];
        const [{ data: allItems }, { data: allGuildDonations }, { data: dungeons }] = await Promise.all([
          db
            .from('player_items')
            .select('player_id, item_id, status, data:items(*)')
            .eq('status', 'true')
            .in('player_id', playerIds),
          db.from('guild_donations').select('guild_id, amount'),
          db.from('dungeons').select('id'),
        ]);
        // 3️⃣ index in memory
        const itemsByPlayer = new Map();
        for (const i of allItems ?? []) {
          const arr = itemsByPlayer.get(i.player_id) ?? [];
          arr.push(i);
          itemsByPlayer.set(i.player_id, arr);
        }
        const donationsByGuild = new Map();
        for (const d of allGuildDonations ?? []) {
          donationsByGuild.set(d.guild_id, (donationsByGuild.get(d.guild_id) ?? 0) + d.amount);
        }
        // 4️⃣ side-effects buffers
        const playerUpdates = [];
        const itemInserts = [];
        const dungeonDeletes = [];
        const messages = [];
        // 5️⃣ main loop (NO DB CALLS)
        for (const dungeon of playerDungeons) {
          try {
            const dunLvl = dungeon.dungeon_id;
            const player = dungeon.player;
            const diffMinutes = Math.floor((now - new Date(dungeon.created_at).getTime()) / (1000 * 60)) + 1;
            if (diffMinutes % 17 === 0) {
              const items = itemsByPlayer.get(player.id) ?? [];
              let profile = {};
              if (player.guild_id) {
                const guildProfile = getGuildProfile(donationsByGuild.get(player.guild_id));
                profile = getUserProfile(items, player.level, guildProfile.level);
              } else {
                profile = getUserProfile(items, player.level);
              }
              const playerPower = Math.floor(
                (profile.armor + profile.strength * 5 + profile.stamina * 5) / 3,
              );
              const P = playerPower / (playerPower + dungeonPower(dunLvl));
              const stepSuccessChance = Math.pow(P, 1 / 10);

              if (Math.random() > stepSuccessChance) {
                dungeonDeletes.push(dungeon.id);
                messages.push({
                  chatId: player.id,
                  text: `*Dungeon*\n>You fought bravely\\, but the darkness claimed you\\.`,
                });
              }
            }
            if (diffMinutes >= 60 * 3) {
              let dungeonItems = items.filter((i) => i.rank !== 'common');
              const chunkSize = Math.ceil(dungeonItems.length / dungeons.length);
              const start = (dunLvl - 1) * chunkSize;
              dungeonItems = dungeonItems.slice(start, start + chunkSize);

              const itemReward = dungeonItems[Math.floor(Math.random() * dungeonItems.length)];
              const xpReward = Math.floor((dunLvl + Math.random() * dunLvl * 0.5) * 500);

              let xp = player.xp + xpReward;
              let level = player.level;
              while (xp >= xpForNextLevel(level)) {
                xp -= xpForNextLevel(level);
                level++;
              }
              player.xp = xp;
              player.level = level;

              playerUpdates.push(player);
              itemInserts.push({ player_id: player.id, item_id: itemReward.id });
              dungeonDeletes.push(dungeon.id);
              messages.push({
                chatId: player.id,
                text: `
*Dungeon Completed\\!*

✨ XP Gained: *${xpReward}XP*
🎁 Item: *${rankDisplay(itemReward)}*
                `,
              });
            }
          } catch (err) {
            console.error('Dungeon error:', dungeon.id, err);
          }
        }
        // 6️⃣ apply DB changes (batch)
        await Promise.all([
          playerUpdates.length && db.from('players').upsert(playerUpdates),
          itemInserts.length && db.from('player_items').insert(itemInserts),
          dungeonDeletes.length && db.from('player_dungeons').delete().in('id', dungeonDeletes),
        ]);
        // 7️⃣ send messages (outside DB pressure)
        for (const m of messages) {
          await sendMessage(TELEGRAM_TOKEN, m.chatId, m.text, {
            parse_mode: 'MarkdownV2',
          });
        }
      })(),
    );
  },
  // ============================ Fetch ============================ //
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') return new Response('OK', { status: 200 });
    const TELEGRAM_TOKEN = env.TELEGRAM_TOKEN;
    const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    const body = await request.json();
    const bot = await getBot(TELEGRAM_TOKEN);
    const now = new Date();

    try {
      async function verifyPlayer(id, username, callback = false) {
        let { data: player } = await db
          .from('players')
          .select('*, guild:guilds!players_guild_id_fkey(*)')
          .eq('id', id)
          .eq('username', username)
          .maybeSingle();
        if (!player) {
          if (!username) {
            if (callback) {
              await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: body.callback_query.id }),
              });
              throw new Error(`❗ You need username to play this game.`);
            }
            throw new Error(`⚠️ You need username to play this game.`);
          }
          await db.from('players').upsert({ id, username });
          const { data: newPlayer } = await db.from('players').select('*').eq('id', id).maybeSingle();
          player = newPlayer;
        }
        return player;
      }
      async function getPlayerItems(playerId) {
        const { data: data, error: error } = await db
          .from('player_items')
          .select(`*, data:items(*)`)
          .eq('player_id', playerId);
        if (error) throw error;
        return data;
      }
      async function showItemsPage(
        chatId,
        page = 1,
        { messageId = null, inlineMessageId = null, market = false, playerId = null } = {},
      ) {
        const pageSize = 10;
        const offset = (page - 1) * pageSize;
        let items = [];
        if (market) {
          const { data: itemsData } = await db
            .from('market')
            .select(`*, item:player_items(*, data:items(*))`);
          items = itemsData;
        } else {
          const { data: itemsData } = await db
            .from('player_items')
            .select(`*, data:items(*)`)
            .eq('player_id', playerId);
          items = itemsData;
        }

        let message = '';
        let i = offset;
        while (i < offset + pageSize && items[i]) {
          const item = market ? items[i].item : items[i];
          const price = market ? items[i].price : item.data.price;
          if (message)
            message += escapeMarkdownV2(`\n-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n`);
          message += `${rankDisplay(item.data)}     *ID:  ${item.id}*
*Price:  $${price}*     *Type:*  ${item.status ? '✅' : ''} ${item.data.type}
🛡️: *${item.data.armor}*    \\|    💪: *${item.data.strength}*    \\|    🩸: *${item.data.stamina}*`;
          i++;
        }
        if (!message) message = market ? '*No item for sale\\.*' : '*Your inventory is empty\\.*';

        const hasNext = items.length - offset > pageSize;
        const hasPrev = page > 1;
        const navButtons = [];
        if (hasPrev) {
          navButtons.push({
            text: '⬅️ Prev',
            callback_data: `${market ? 'market' : 'inventory'}_page_${page - 1}_${playerId ?? ''}`,
          });
        }
        if (hasNext) {
          navButtons.push({
            text: 'Next ➡️',
            callback_data: `${market ? 'market' : 'inventory'}_page_${page + 1}_${playerId ?? ''}`,
          });
        }
        const buttons = [navButtons];
        if (market) {
          buttons.push([
            { text: 'sell', callback_data: 'market_sell' },
            { text: 'buy', callback_data: 'market_buy' },
          ]);
        } else {
          buttons.push([{ text: 'equip', callback_data: 'inventory_equip' }]);
        }

        if (inlineMessageId) {
          await editInlineMessage(TELEGRAM_TOKEN, inlineMessageId, message, {
            parse_mode: 'MarkdownV2',
            reply_markup: { inline_keyboard: buttons },
          });
        } else if (messageId) {
          await editMessage(TELEGRAM_TOKEN, chatId, messageId, message, {
            parse_mode: 'MarkdownV2',
            reply_markup: { inline_keyboard: buttons },
          });
        } else {
          await sendMessage(TELEGRAM_TOKEN, chatId, message, {
            parse_mode: 'MarkdownV2',
            reply_markup: { inline_keyboard: buttons },
          });
        }
      }
      async function showGuildsPage(chatId, page = 1, { messageId = null, inlineMessageId = null } = {}) {
        const pageSize = 6;
        const offset = (page - 1) * pageSize;
        const { data: guilds } = await db.from('guilds').select(`*`);
        const { data: guildPlayers } = await db.from('players').select(`guild_id`);
        const { data: guildDonations } = await db.from('guild_donations').select(`guild_id, amount`);

        let message = '';
        let i = offset;
        while (i < offset + pageSize && guilds[i]) {
          const guild = guilds[i];
          const members = guildPlayers.filter((player) => player.guild_id == guild.id);
          const donations = guildDonations.filter((donate) => donate.guild_id == guild.id) ?? [];
          const totalDonations = donations.reduce((sum, donate) => sum + donate.amount, 0);
          const guildProfile = getGuildProfile(totalDonations);
          if (message) message += escapeMarkdownV2(`\n-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n`);
          message += `🏛️ *${toTitleCase(guild.name)}*
Level:  *${guildProfile.level}*
Members:  *${members.length}/10*
Power bonus:  *\\+${guildProfile.level}*
Total donations:  *${totalDonations}*`;
          i++;
        }

        const hasNext = guilds.length - offset > pageSize;
        const hasPrev = page > 1;
        const navButtons = [];
        if (hasPrev) navButtons.push({ text: '⬅️ Prev', callback_data: `guild_list_${page - 1}` });
        if (hasNext) navButtons.push({ text: 'Next ➡️', callback_data: `guild_list_${page + 1}` });
        const buttons = [navButtons, [{ text: 'Join Guild', callback_data: `guild_join` }]];

        if (inlineMessageId) {
          await editInlineMessage(TELEGRAM_TOKEN, inlineMessageId, message, {
            parse_mode: 'MarkdownV2',
            reply_markup: { inline_keyboard: buttons },
          });
        } else {
          await editMessage(TELEGRAM_TOKEN, chatId, messageId, message, {
            parse_mode: 'MarkdownV2',
            reply_markup: { inline_keyboard: buttons },
          });
        }
      }
      async function getSession(chatId, messageId, playerId) {
        const { data: session } = await db
          .from('sessions')
          .select('*')
          .eq('id', chatId + '_' + messageId)
          .maybeSingle();
        if (session && session.player_id != playerId) throw new Error(`🚫`);
        if (!session) {
          await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
          if (body.callback_query) {
            throw new Error(`❗ Session expired.`);
          } else {
            throw new Error(`⚠️ Session expired.`);
          }
        }
        return session;
      }
      // ---------------------- InlineMode ---------------------- //
      if (body.inline_query) {
        const inlineQuery = body.inline_query;
        const fromId = inlineQuery.from.id;
        const results = [
          {
            type: 'article',
            id: 'profile_view',
            title: 'View your character profile',
            description: 'Check your stats and equipment',
            input_message_content: {
              message_text: 'Tap below to load your character 🧙‍♂️',
            },
            reply_markup: {
              inline_keyboard: [[{ text: 'View Profile', callback_data: `profile` }]],
            },
          },
          {
            type: 'article',
            id: 'inventory_view',
            title: 'View your inventory',
            description: 'See what you currently own',
            input_message_content: {
              message_text: 'Tap below to load your inventory 🎒',
            },
            reply_markup: {
              inline_keyboard: [[{ text: 'View Inventory', callback_data: `inventory_page_1` }]],
            },
          },
          {
            type: 'article',
            id: 'leaderboard_view',
            title: 'View top players',
            description: 'See the list of greatest players',
            input_message_content: {
              message_text: 'Tap below to load the leaderboard 🏅',
            },
            reply_markup: {
              inline_keyboard: [[{ text: 'View Leaderboard', callback_data: `leaderboard` }]],
            },
          },
        ];
        return await answerInlineQuery(TELEGRAM_TOKEN, inlineQuery.id, results);
      }
      // ---------------------- Callbacks ---------------------- //
      if (body.callback_query) {
        const fromId = body.callback_query.from.id;
        const fromUsername = body.callback_query.from.username;
        const chatId = body.callback_query.message?.chat.id;
        const messageId = body.callback_query.message?.message_id;
        const inlineMessageId = body.callback_query.inline_message_id;
        const data = body.callback_query.data;
        const player = await verifyPlayer(fromId, fromUsername, true);
        async function sendMsg(
          messageText,
          { reply = false, buttons = null, to = chatId, replyData = null } = {},
        ) {
          const options = { parse_mode: 'MarkdownV2' };
          if (reply) options.reply_markup = { force_reply: true, selective: true };
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          const sent = await sendMessage(TELEGRAM_TOKEN, to, messageText, options);
          if (reply) {
            await db.from('sessions').upsert({
              id: to + '_' + sent.message_id,
              player_id: fromId,
              data: replyData,
            });
          }
          return sent;
        }
        async function editMsg(messageText, { buttons = null, chatID = chatId, messageID = messageId } = {}) {
          const options = { parse_mode: 'MarkdownV2' };
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          return await editMessage(TELEGRAM_TOKEN, chatID, messageID, messageText, options);
        }
        async function editImg(photo, { buttons = null, caption = null } = {}) {
          const options = { parse_mode: 'MarkdownV2' };
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          if (caption) options.caption = caption;
          return await editPhoto(TELEGRAM_TOKEN, chatId, messageId, photo, options);
        }
        async function editInlineMsg(messageText, { buttons = null } = {}) {
          const options = { parse_mode: 'MarkdownV2' };
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          return await editInlineMessage(TELEGRAM_TOKEN, inlineMessageId, messageText, options);
        }
        async function answerCallback(messageText, showAlert = false) {
          await answerCallbackQuery(TELEGRAM_TOKEN, body.callback_query.id, messageText, showAlert);
        }
        //------------------------------------------/dev
        if (data.split('_')[0] === 'dev') {
          if (!ADMINS.includes(fromId)) throw new Error(`❗ Only admins can use this command`);
          if (data.split('_')[1] === 'whisper') {
            await sendMsg('Dev Whisper \\- Reply and enter your *Target*', { reply: true });
          } else if (data.split('_')[1] === 'globalMessage') {
            await sendMsg('Dev Global Message \\- Reply and enter your *Message*', { reply: true });
          }
        }
        //------------------------------------------/profile
        if (data.split('_')[0] === 'profile') {
          const items = await getPlayerItems(player.id);
          let profile = {};
          if (player.guild_id) {
            const { data: guildDonations } = await db
              .from('guild_donations')
              .select(`amount`)
              .eq('guild_id', player.guild.id);
            const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
            const guildProfile = getGuildProfile(totalDonations);
            profile = getUserProfile(items, player.level, guildProfile.level);
          } else {
            profile = getUserProfile(items, player.level);
          }

          await editInlineMsg(`
@${escapeMarkdownV2(player.username)} *Profile*
⭐*Level:  ${player.level}*
💰*Money:  $${player.money}*
✨*XP:  ${player.xp}\\/${xpForNextLevel(player.level)}XP*

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
        }
        //------------------------------------------/inventory
        if (data.split('_')[0] === 'inventory') {
          if (data.split('_')[1] === 'page') {
            const page = parseInt(data.split('_')[2]);
            const playerId = parseInt(data.split('_')[3]) || fromId;
            if (messageId) {
              await showItemsPage(chatId, page, { messageId, playerId });
            } else {
              await showItemsPage(chatId, page, { inlineMessageId, playerId });
            }
          } else if (data.split('_')[1] === 'equip') {
            await sendMsg('Equip \\- Reply and enter your *item ID*', { reply: true });
          }
        }
        //------------------------------------------/map
        if (data === 'map_main') {
          await editImg(
            'https://dahmbtmkdwhjnenkwbux.supabase.co/storage/v1/object/public/ForgeCraft-storage/map.png',
            {
              buttons: [[{ text: 'Dungeons', callback_data: `dungeons` }]],
            },
          );
        }
        if (data.split('_')[0] === 'dungeons') {
          const { data: dungeons } = await db.from('dungeons').select('*');
          const buttons = [];
          let i = 0;
          while (i < dungeons.length) {
            buttons.push([
              { text: dungeons[i].name, callback_data: `dungeon_${dungeons[i].id}` },
              { text: dungeons[i + 1].name, callback_data: `dungeon_${dungeons[i + 1].id}` },
            ]);
            i += 2;
          }
          buttons.push([{ text: '⬅️ Back', callback_data: `map_main` }]);
          editImg(
            'https://dahmbtmkdwhjnenkwbux.supabase.co/storage/v1/object/public/ForgeCraft-storage/map.png',
            { buttons },
          );
        }
        if (data.split('_')[0] === 'dungeon') {
          const id = parseInt(data.split('_')[1]);
          const { data: dungeon } = await db.from('dungeons').select('*').eq('id', id).maybeSingle();
          const isAccepted = data.split('_')[2];
          const targetId = data.split('_')[3];
          if (!isAccepted) {
            let profile = {};
            const items = await getPlayerItems(player.id);
            if (player.guild_id) {
              const { data: guildDonations } = await db
                .from('guild_donations')
                .select(`amount`)
                .eq('guild_id', player.guild_id);
              const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
              const guildProfile = getGuildProfile(totalDonations);
              profile = getUserProfile(items, player.level, guildProfile.level);
            } else {
              profile = getUserProfile(items, player.level);
            }
            const playerPower = Math.round((profile.armor + profile.strength * 5 + profile.stamina * 5) / 3);
            const dunPower = dungeonPower(dungeon.id, true);
            editImg(
              'https://dahmbtmkdwhjnenkwbux.supabase.co/storage/v1/object/public/ForgeCraft-storage/map.png',
              {
                caption: `
*${dungeon.name}*

Survival chance:  ${Math.floor((playerPower / (playerPower + dungeonPower(dungeon.id))) * 100)}\\%

Advised Gear for Survival:
🛡️: *${dunPower}*    \\|    💪: *${Math.floor(dunPower / 5)}*    \\|    🩸: *${Math.floor(dunPower / 5)}*
                `,
                buttons: [
                  [
                    { text: '❌', callback_data: `dungeon_${dungeon.id}_no_${fromId}` },
                    { text: '✅', callback_data: `dungeon_${dungeon.id}_yes_${fromId}` },
                  ],
                  [{ text: '⬅️ Back', callback_data: `dungeons` }],
                ],
              },
            );
          } else if (fromId == targetId) {
            if (isAccepted === 'no') await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
            if (isAccepted === 'yes') {
              const { data: cooldown } = await db
                .from('cooldowns')
                .select('created_at')
                .eq('player_id', player.id)
                .eq('type', 'dungeon')
                .maybeSingle();
              if (cooldown) {
                const created = new Date(cooldown.created_at);
                const diffMinutes = Math.floor((now - created) / (1000 * 60));
                throw new Error(
                  `❗ Dungeon is on cooldown. Come back after ${24 * 60 - diffMinutes} minutes`,
                );
              }

              await db.from('cooldowns').upsert({ type: 'dungeon', player_id: player.id });
              await db.from('player_dungeons').upsert({
                player_id: fromId,
                dungeon_id: dungeon.id,
              });

              const dungeonTxt = [
                `⚔️ The dungeon gates have opened... your fate awaits inside.`,
                `⚔️ You have entered the dungeon. Prepare for battle!`,
                `⚔️ The echoes of the dungeon swallow your steps... there's no turning back now.`,
                `⚔️ Dungeon started! Defeat enemies and claim your reward.`,
                `⚔️ You've entered the dungeon — good luck, adventurer!`,
              ];
              await answerCallback(dungeonTxt[Math.floor(Math.random() * dungeonTxt.length)], true);
              await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
            }
          }
        }
        //------------------------------------------/sell_by
        if (data.split('_')[0] === 'sellBy') {
          if (data.split('_')[1] === 'rank') {
            const rank = data.split('_')[2];
            let items = await getPlayerItems(fromId);
            items = items.filter((item) => item.status === false);
            if (rank) items = items.filter((item) => item.data.rank === rank);
            if (!items?.length > 0) throw new Error(`❗ You don't have any unequipped ${rank ?? ''} item.`);

            const price = items.reduce((sum, item) => sum + item.data.price, 0);
            await Promise.all(
              items.map(async (item) => {
                await db.from('market').delete().eq('id', item.id);
                await db.from('player_items').delete().eq('id', item.id);
              }),
            );

            await db
              .from('players')
              .update({ money: player.money + price })
              .eq('id', fromId);
            await answerCallback(
              `✅ All items${rank ? ' with rank of ' + rank : ''} sold for $${price}`,
              true,
            );
          }
        }
        //------------------------------------------/shop
        if (data === 'shop_buy') {
          await sendMsg('Shop \\- Reply and enter the *item ID*', { reply: true });
        }
        //------------------------------------------/market
        if (data.split('_')[0] === 'market') {
          const actionType = data.split('_')[1];
          if (actionType === 'page') {
            const page = parseInt(data.split('_')[2]);
            await showItemsPage(chatId, page, { messageId, market: true });
          } else if (actionType === 'sell') {
            await sendMsg('Market \\- Reply and enter your *item ID*', { reply: true });
          } else if (actionType === 'buy') {
            await sendMsg('Market \\- Reply and enter the *item ID*', { reply: true });
          }
        }
        //------------------------------------------/duel
        if (data.split('_')[0] === 'duel') {
          const isAccepted = data.split('_')[1];
          const targetId = data.split('_')[2];
          if (fromId != targetId) throw new Error(`❗ Only the invited person can answer.`);
          const session = await getSession(chatId, messageId, targetId);
          if (isAccepted === 'no') {
            await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
            const baseMessageId = session.data.baseMessageId;
            if (baseMessageId)
              await editMsg(`⚔️ The opponent has refused your duel challenge\\.`, {
                chatID: session.data.player.id,
                messageID: baseMessageId,
              });
          } else if (isAccepted === 'yes') {
            const baseMessageId = session.data.baseMessageId;
            const bet = session.data.bet;
            const player = session.data.player;
            const target = session.data.target;
            if (target.money < bet) throw new Error(`❗ You don't have enough money to pay the bet.`);
            const playerItems = await getPlayerItems(player.id);
            let pp = {};
            if (player.guild_id) {
              const { data: guildDonations } = await db
                .from('guild_donations')
                .select(`amount`)
                .eq('guild_id', player.guild_id);
              const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
              const guildProfile = getGuildProfile(totalDonations);
              pp = getUserProfile(playerItems, player.level, guildProfile.level);
            } else {
              pp = getUserProfile(playerItems, player.level);
            }
            pp.hp = pp.stamina * 10;
            pp.dps = pp.strength;
            pp.dpsTake = (4000 - pp.armor) / 4000;
            const targetItems = await getPlayerItems(target.id);
            let tp = {};
            if (target.guild_id) {
              const { data: guildDonations } = await db
                .from('guild_donations')
                .select(`amount`)
                .eq('guild_id', target.guild_id);
              const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
              const guildProfile = getGuildProfile(totalDonations);
              tp = getUserProfile(targetItems, target.level, guildProfile.level);
            } else {
              tp = getUserProfile(targetItems, target.level);
            }
            tp.hp = tp.stamina * 10;
            tp.dps = tp.strength;
            tp.dpsTake = (4000 - tp.armor) / 4000;

            const text1 = `
@${escapeMarkdownV2(player.username)}
🛡️: *${pp.armor}*    \\|    💪: *${pp.strength}*    \\|    🩸: *${pp.stamina}*

                              _*VS*_
@${escapeMarkdownV2(target.username)}
🛡️: *${tp.armor}*    \\|    💪: *${tp.strength}*    \\|    🩸: *${tp.stamina}*
            `;
            await editMsg(text1);
            if (baseMessageId) await editMsg(text1, { chatID: player.id, messageID: baseMessageId });
            ctx.waitUntil(
              (async () => {
                await delay(2500);
                const text2 = `
@${escapeMarkdownV2(player.username)}
🛡️: *${pp.armor}*    \\|    💪: *${pp.strength}*    \\|    🩸: *${pp.stamina}*

                    _*${escapeMarkdownV2('— FIGHT! —')}*_
@${escapeMarkdownV2(target.username)}
🛡️: *${tp.armor}*    \\|    💪: *${tp.strength}*    \\|    🩸: *${tp.stamina}*
                `;
                await editMsg(text2);
                if (baseMessageId) await editMsg(text2, { chatID: player.id, messageID: baseMessageId });
                let i = 0;
                while (i < 15 && pp.hp > 0 && tp.hp > 0) {
                  const attacker = Math.random() < 0.5;
                  let attackSide = '';
                  if (attacker) {
                    tp.hp -= pp.dps * tp.dpsTake;
                    if (tp.hp < 0) tp.hp = 0;
                    attackSide = '➡️🗡️';
                  } else {
                    pp.hp -= tp.dps * pp.dpsTake;
                    if (pp.hp < 0) pp.hp = 0;
                    attackSide = '🗡️⬅️';
                  }
                  await delay(1050);
                  const text3 = `
*Round ${i + 1}*
@${escapeMarkdownV2(player.username)}     ${attackSide}     @${escapeMarkdownV2(target.username)}

HP: *${parseInt(pp.hp)}*                             HP: *${parseInt(tp.hp)}*
DPS: *${pp.dps}*                             DPS: *${tp.dps}*
                  `;
                  await editMsg(text3);
                  if (baseMessageId) await editMsg(text3, { chatID: player.id, messageID: baseMessageId });
                  i++;
                }

                const winner = pp.hp > tp.hp ? player : target;
                const loser = pp.hp < tp.hp ? player : target;
                await db
                  .from('players')
                  .update({ money: winner.money + bet })
                  .eq('id', winner.id);
                await db
                  .from('players')
                  .update({ money: loser.money - bet })
                  .eq('id', loser.id);
                await delay(1050);
                const text4 = `
_*${escapeMarkdownV2('— DUEL ENDED! —')}*_

*WINNER:* @${escapeMarkdownV2(winner.username)}
                `;
                await editMsg(text4);
                if (baseMessageId) await editMsg(text4, { chatID: player.id, messageID: baseMessageId });
              })(),
            );
          }
        }
        //------------------------------------------/leaderboard
        if (data.split('_')[0] === 'leaderboard') {
          let { data: players } = await db.from('players').select('*');
          const { data: playersItems } = await db.from('player_items').select(`*, data:items(*)`);
          const { data: guildDonations } = await db.from('guild_donations').select(`guild_id, amount`);
          players = players.map((player) => {
            const items = playersItems.filter((item) => item.player_id === player.id);
            let profile = {};
            if (player.guild_id) {
              const donations = guildDonations.filter((donation) => donation.guild_id === player.guild_id);
              const totalDonations = donations.reduce((sum, donate) => sum + donate.amount, 0);
              const guildProfile = getGuildProfile(totalDonations);
              profile = getUserProfile(items, player.level, guildProfile.level);
            } else {
              profile = getUserProfile(items, player.level);
            }
            player.score = profile.armor + profile.strength * 5 + profile.stamina * 5;
            player.armor = profile.armor;
            player.strength = profile.strength;
            player.stamina = profile.stamina;
            return player;
          });
          const playersRank = players.sort((a, b) => b.score - a.score);
          let message = '';
          let i = 0;
          while (i < 5) {
            if (message)
              message += escapeMarkdownV2(
                `\n-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n`,
              );
            message += `*\\#${i + 1}*  @${escapeMarkdownV2(playersRank[i].username)}
🛡️: *${playersRank[i].armor}*    \\|    💪: *${playersRank[i].strength}*    \\|    🩸: *${
              playersRank[i].stamina
            }*`;
            i++;
          }
          await editInlineMsg(message);
        }
        //------------------------------------------/guild
        if (data.split('_')[0] === 'guild') {
          if (data.split('_')[1] === 'donate') {
            if (!player.guild) throw new Error(`❗ You aren't a member of any guild.`);
            await sendMsg('Guild \\- Reply and enter the *Donation amount*', { reply: true });
          } else if (data.split('_')[1] === 'broadcast') {
            if (!player.guild || player.guild.owner !== player.id) {
              throw new Error(`❗ You aren't owner of any guild.`);
            }
            const { data: cooldown } = await db
              .from('cooldowns')
              .select(`created_at`)
              .eq('player_id', player.id)
              .eq('type', 'guild broadcast')
              .maybeSingle();
            if (cooldown) {
              const created = new Date(cooldown.created_at);
              const diffMinutes = Math.floor((now - created) / (1000 * 60));
              throw new Error(`❗ Broadcast is on cooldown.\nCome back after ${360 - diffMinutes} minutes.`);
            }
            await sendMsg('Guild \\- Reply and enter your *Message*', { reply: true });
            if (!player.guild || player.guild.owner !== player.id) {
              throw new Error(`❗ You aren't owner of any guild.`);
            }
          } else if (data.split('_')[1] === 'members') {
            if (!player.guild || player.guild.owner !== player.id) {
              throw new Error(`❗ You aren't owner of any guild.`);
            }
            const { data: guildMembers } = await db
              .from('players')
              .select(`id, username`)
              .eq('guild_id', player.guild_id);
            const members = guildMembers.filter((member) => member.id !== player.id);
            let column = 1;
            if (members.length >= 4) column = 2;
            if (members.length > 6) column = 3;
            const buttons = [];
            let row = 0;
            while (row < members.length / column) {
              const x = row * column;
              const rowButtons = [];
              let i = 0;
              while (i < column) {
                if (members[x + i]) {
                  rowButtons.push({
                    text: members[x + i].username,
                    callback_data: `guild_member_${members[x + i].id}`,
                  });
                }
                i++;
              }
              buttons.push(rowButtons);
              row++;
            }
            await editMsg('*Members:*', { buttons: buttons });
          } else if (data.split('_')[1] === 'member') {
            if (!player.guild || player.guild.owner !== player.id) {
              throw new Error(`❗ You aren't owner of any guild.`);
            }
            const playerId = data.split('_')[2];
            const action = data.split('_')[3];
            const { data: guildMembers } = await db
              .from('players')
              .select(`id, username`)
              .eq('guild_id', player.guild.id);
            const member = guildMembers.find((member) => member.id == playerId);
            if (!member) throw new Error(`❗ This player is not a memeber of your guild.`);
            const { data: guildDonations } = await db
              .from('guild_donations')
              .select(`player_id, amount`)
              .eq('guild_id', player.guild.id);
            const memberDonation = guildDonations.find((donate) => donate.player_id == playerId)?.amount ?? 0;
            const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
            if (!action) {
              const buttons = [];
              if (memberDonation < totalDonations / guildMembers.length / 2)
                buttons.push([{ text: '💣 Kick', callback_data: `guild_member_${playerId}_kick` }]);
              buttons.push([
                { text: '👑 Transfer Owner', callback_data: `guild_member_${playerId}_transfer` },
              ]);
              buttons.push([{ text: '⬅️ Back', callback_data: `guild_members` }]);
              await editMsg(
                `
@${escapeMarkdownV2(member.username)}

donation:  *$${memberDonation}*`,
                { buttons },
              );
            } else if (action === 'kick') {
              if (memberDonation > totalDonations / guildMembers.length / 2) {
                throw new Error(`❗ You can't kick this member.`);
              }
              await db.from('players').update({ guild_id: null }).eq('id', playerId);
              await answerCallback(`✅ @${member.username} kicked from the guild.`, true);
              await sendMsg(`💣 You kicked from the guild by guild owner\\.`, { to: playerId });
            } else if (action === 'transfer') {
              const transferAction = data.split('_')[4];
              if (!transferAction) {
                await editMsg(
                  `
*ARE YOU SURE?*

Transfer of ownership to @${escapeMarkdownV2(member.username)}`,
                  {
                    buttons: [
                      [
                        { text: '❌', callback_data: `guild_members` },
                        { text: '✅', callback_data: `guild_member_${playerId}_transfer_yes` },
                      ],
                    ],
                  },
                );
              } else if (transferAction === 'yes') {
                await db.from('guilds').update({ owner: playerId }).eq('id', player.guild.id);
                await answerCallback(`✅ You transferred ownership to ${member.username}.`, true);
                await sendMsg(
                  `👑 You'ar now the owner of *${escapeMarkdownV2(player.guild.name)}* guild\\.`,
                  { to: playerId },
                );
              }
            }
          } else if (data.split('_')[1] === 'leave') {
            if (!player.guild) throw new Error(`❗ You aren't a member of any guild.`);
            await db.from('players').update({ guild_id: null }).eq('id', player.id);
            await answerCallback(`✅ You left your guild.`, true);
            await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
          } else if (data.split('_')[1] === 'list') {
            if (player.guild) throw new Error(`❗ You are a member of a guild.`);
            const page = parseInt(data.split('_')[2]);
            await showGuildsPage(chatId, page, { messageId });
          } else if (data.split('_')[1] === 'join') {
            if (player.guild) throw new Error(`❗ You are a member of a guild.`);
            await sendMsg('Guild \\- Reply and enter the *Guild name*', { reply: true });
          } else if (data.split('_')[1] === 'create') {
            if (player.guild) throw new Error(`❗ You are a member of a guild.`);
            const action = data.split('_')[2];
            if (!action) {
              await sendMsg('Guild \\- Reply and enter your *Guild name*', { reply: true });
            } else if (action === 'no') {
              await getSession(chatId, messageId, player.id);
              await deleteMessage(TELEGRAM_TOKEN, chatId, messageId);
            } else if (action === 'yes') {
              const session = await getSession(chatId, messageId, player.id);
              if (player.money < 10000) throw new Error(`❗ You don't have enough money.`);
              await db
                .from('players')
                .update({ money: player.money - 10000 })
                .eq('id', fromId);
              await db.from('guilds').upsert({ name: session.data.name, owner: player.id });
              const { data: guild } = await db
                .from('guilds')
                .select('id')
                .eq('name', session.data.name)
                .maybeSingle();
              await db.from('players').update({ guild_id: guild.id }).eq('id', player.id);
              await answerCallback(
                `✅ You created the  🏛️ *${toTitleCase(session.data.name)}*  guild.`,
                true,
              );
            }
          }
        }
        //------------------------------------------
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: body.callback_query.id }),
        });
        return new Response('OK', { status: 200 });
      }
      // --------------------- ForceReplys --------------------- //
      if (body.message?.reply_to_message?.text) {
        const fromId = body.message.from.id;
        const fromUsername = body.message.from.username;
        const chatId = body.message.chat.id;
        const text = body.message.text;
        const repliedTo = body.message.reply_to_message;
        if (repliedTo.from.id !== bot.result.id) throw new Error(`🚫`);
        const player = await verifyPlayer(fromId, fromUsername);
        async function sendMsg(
          messageText,
          { reply = false, buttons = null, replyData = null, to = chatId } = {},
        ) {
          const options = { parse_mode: 'MarkdownV2' };
          if (reply) {
            options.reply_to_message_id = body.message.message_id;
            options.reply_markup = { force_reply: true, selective: true };
          }
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          const sent = await sendMessage(TELEGRAM_TOKEN, to, messageText, options);
          if (reply) {
            await db.from('sessions').upsert({
              id: to + '_' + sent.message_id,
              player_id: fromId,
              data: replyData,
            });
          }
          return sent;
        }
        //------------------------------------------/dev
        if (repliedTo.text.startsWith('Dev')) {
          if (repliedTo.text.includes('Dev Whisper - Reply and enter your Target')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const playerId = parseInt(text);
            if (isNaN(playerId)) throw new Error('⚠️ ID must be a Number.');
            const { data: target } = await db.from('players').select('*').eq('id', playerId).maybeSingle();
            if (!target) throw new Error(`⚠️ Your target doesn't have a character.`);
            await sendMsg('Dev Whisper \\- Reply and enter your *Message*', {
              reply: true,
              replyData: { playerId },
            });
          }
          if (repliedTo.text.includes('Dev Whisper - Reply and enter your Message')) {
            const session = await getSession(chatId, repliedTo.message_id, fromId);
            const message = `*👨‍💻 ForgeCraft Dev Team:*\n` + quote(escapeMarkdownV2(text));
            const sent = await sendMsg(message, { to: session.data.playerId });
            if (!sent) throw Error(`⚠️ Cant send message to ${session.data.playerId}`);
          }
          if (repliedTo.text.includes('Dev Global Message - Reply and enter your Message')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const message = `*📜 Message from the Guide Master:*\n` + quote(escapeMarkdownV2(text));
            const { data: players } = await db.from('players').select('id');
            const results = await Promise.allSettled(
              players.map(async (player) => {
                const sent = await sendMsg(message, { to: player.id });
                return sent ? 'sent' : 'failed';
              }),
            );
            const sentNum = results.filter((r) => r.value === 'sent').length;
            const cantSentNum = results.length - sentNum;
            await sendMsg(`✅ Sent for:  ${sentNum}\n❌ Cant send for:  ${cantSentNum}`);
          }
        }
        //------------------------------------------/feedback
        if (repliedTo.text.includes('Feedback - Reply and enter your Feedback')) {
          await getSession(chatId, repliedTo.message_id, fromId);
          const message =
            `*Feedback from ID: ${fromId}\nMessage ID: ${body.message.message_id}*\n` +
            quote(escapeMarkdownV2(text));
          const sent = await sendMessage(TELEGRAM_TOKEN, '-1003101666041', message, {
            message_thread_id: 31,
            parse_mode: 'MarkdownV2',
          });
          if (sent) await sendMsg(`✅ Feedback sent\\!`);
        }
        if (repliedTo.text.startsWith('Feedback from ID:')) {
          const playerId = repliedTo.text.split(/\s+/)[3];
          const messageId = repliedTo.text.split(/\s+/)[6];
          const message =
            `*ForgeCraft Dev Team:\nMessage ID: ${body.message.message_id}*\n` +
            quote(escapeMarkdownV2(text)) +
            `\n*reply to this message for response*`;
          const sent = await sendMessage(TELEGRAM_TOKEN, playerId, message, {
            reply_to_message_id: messageId,
            parse_mode: 'MarkdownV2',
          });
          if (!sent) throw Error(`⚠️ Cant send message to ${playerId}`);
        }
        if (repliedTo.text.includes('ForgeCraft Dev Team:')) {
          const messageId = repliedTo.text.split(/\s+/)[5];
          const message =
            `*Feedback from ID: ${fromId}\nMessage ID: ${body.message.message_id}*\n` +
            quote(escapeMarkdownV2(text));
          const sent = await sendMessage(TELEGRAM_TOKEN, '-1003101666041', message, {
            message_thread_id: 31,
            reply_to_message_id: messageId,
            parse_mode: 'MarkdownV2',
          });
          if (sent) await sendMsg(`✅ Feedback sent\\!`);
        }
        //------------------------------------------/equip
        if (repliedTo.text.includes('Equip - Reply and enter your item ID')) {
          await getSession(chatId, repliedTo.message_id, fromId);
          const itemId = parseInt(text);
          if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
          const items = await getPlayerItems(fromId);
          const item = items.find((item) => item.id === itemId);
          if (!item) throw new Error(`⚠️ You don't have this item.`);
          const oldItem = items.find((x) => x.status && x.data.type === item.data.type);
          if (oldItem) await db.from('player_items').update({ status: false }).eq('id', oldItem.id);
          await db.from('player_items').update({ status: true }).eq('id', item.id);

          await sendMsg(`${rankDisplay(item.data)} equipped`);
        }
        //------------------------------------------/gift
        if (repliedTo.text.startsWith('Gift')) {
          if (repliedTo.text.includes('Gift - Reply and enter your Target')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            let targetUsername = text.trim();
            if (!targetUsername) {
              throw new Error('⚠️ Target must be a User.');
            } else {
              targetUsername = targetUsername.slice(1);
            }
            const { data: target } = await db
              .from('players')
              .select('*')
              .eq('username', targetUsername)
              .maybeSingle();
            if (!target) throw new Error(`⚠️ Your target doesn't have a character.`);
            if (player.id === target.id) throw new Error(`⚠️ You can't gift yourself.`);
            const items = await getPlayerItems(target.id);
            if (items.length >= 30) throw new Error(`⚠️ Your target inventory is full.`);
            await sendMsg('Gift \\- Reply and enter your *item ID*', { reply: true, replyData: { target } });
          }
          if (repliedTo.text.includes('Gift - Reply and enter your item ID')) {
            const session = await getSession(chatId, repliedTo.message_id, fromId);
            const itemId = parseInt(text);
            if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
            const target = session.data.target;
            const { data: item } = await db
              .from('player_items')
              .select(`*, data:items(*)`)
              .eq('id', itemId)
              .eq('player_id', fromId)
              .maybeSingle();
            if (!item) throw new Error(`⚠️ You don't have this item.`);
            await db.from('market').delete().eq('id', item.id);
            await db.from('player_items').update({ status: false, player_id: target.id }).eq('id', item.id);
            await sendMsg(`${rankDisplay(item.data)} gifted to @${escapeMarkdownV2(target.username)}`);
            await sendMsg(
              `
@${escapeMarkdownV2(player.username)} has gifted you:\n${rankDisplay(item.data)}`,
              { to: target.id },
            );
          }
        }
        //------------------------------------------/sell_by_id
        if (repliedTo.text.includes('Sell - Reply and enter your item ID')) {
          await getSession(chatId, repliedTo.message_id, fromId);
          const items = text.trim().split(/\s+/);
          const { data: playerItems } = await db
            .from('player_items')
            .select(`*, data:items(*)`)
            .eq('player_id', fromId);
          let profit = 0;
          for (let itemId of items) {
            itemId = parseInt(itemId);
            if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
            const item = playerItems.find((item) => item.id === itemId);
            if (!item) throw new Error(`⚠️ You don't have item with id: ${itemId}.`);
            profit += item.data.price;
            await db.from('market').delete().eq('id', item.id);
            await db.from('player_items').delete().eq('id', item.id);
          }
          await db
            .from('players')
            .update({ money: player.money + profit })
            .eq('id', fromId);
          await sendMsg(`✅ All selected items sold for $${profit}`);
        }
        //------------------------------------------/shop
        if (repliedTo.text.includes('Shop - Reply and enter the item ID')) {
          await getSession(chatId, repliedTo.message_id, fromId);
          const itemId = parseInt(text);
          if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
          const { data: shopItem } = await db
            .from('shop')
            .select(`*, item:items(*)`)
            .eq('id', itemId)
            .maybeSingle();
          if (!shopItem) throw new Error(`⚠️ This item isn't available for sale.`);
          const items = await getPlayerItems(fromId);
          if (items.length >= 30) throw new Error(`⚠️ Your inventory is full.`);
          const { data: item } = await db.from('items').select(`*`).eq('id', shopItem.item_id).maybeSingle();
          if (player.money < item.price * 2)
            throw new Error(`⚠️ You don't have enough money to buy this item.`);
          await db
            .from('players')
            .update({ money: player.money - item.price * 2 })
            .eq('id', fromId);
          await db.from('shop').delete().eq('id', shopItem.id);
          await db.from('player_items').insert([{ player_id: fromId, item_id: item.id }]);
          await sendMsg(`🛒 You successfully bought the item\\!`);
        }
        //------------------------------------------/market
        if (repliedTo.text.startsWith('Market')) {
          if (repliedTo.text.includes('Market - Reply and enter the item ID')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const itemId = parseInt(text);
            if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
            const items = await getPlayerItems(player.id);
            if (items.length >= 30) throw new Error(`⚠️ Your inventory is full.`);
            const { data: action } = await db
              .from('market')
              .select(`*, item:player_items(*, data:items(*))`)
              .eq('id', itemId)
              .maybeSingle();
            const { data: seller } = await db
              .from('players')
              .select('*')
              .eq('id', action.item.player_id)
              .maybeSingle();

            if (player.money < action.price)
              throw new Error(`⚠️ You don't have enough money to buy this item.`);
            await db
              .from('players')
              .update({ money: player.money - action.price })
              .eq('id', player.id);
            await db
              .from('players')
              .update({ money: seller.money + action.price })
              .eq('id', seller.id);
            await db.from('market').delete().eq('id', action.id);
            await db.from('player_items').update({ status: false, player_id: player.id }).eq('id', action.id);
            await sendMsg('🛒 You successfully bought the item \\!');
            await sendMsg(
              `
*Market*
>A traveler has purchased your
>${rankDisplay(action.item.data)} for *$${action.price}*\\.
            `,
              { to: seller.id },
            );
          }
          if (repliedTo.text.includes('Market - Reply and enter your item ID')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const itemId = parseInt(text);
            if (isNaN(itemId)) throw new Error('⚠️ ID must be a Number.');
            const { data: item } = await db
              .from('player_items')
              .select(`*, data:items(*)`)
              .eq('id', itemId)
              .eq('player_id', player.id)
              .maybeSingle();
            if (!item) throw new Error(`⚠️ You don't have this item.`);
            await sendMsg('Market \\- Reply and enter the *Price*', {
              reply: true,
              replyData: { item },
            });
          }
          if (repliedTo.text.includes('Market - Reply and enter the Price')) {
            const session = await getSession(chatId, repliedTo.message_id, fromId);
            const price = parseInt(text);
            if (isNaN(price) || price < 0) throw new Error('⚠️ Price must be a Positive Number.');
            if (player.money < price * 0.05)
              throw new Error(`⚠️ You don't have enough money to pay the fee.`);
            await db
              .from('players')
              .update({ money: player.money - price * 0.05 })
              .eq('id', player.id);
            await db.from('market').insert([{ id: session.data.item.id, price }]);
            await sendMsg('✅ Your item has been listed in the market\\!');
          }
        }
        //------------------------------------------/duel
        if (repliedTo.text.startsWith('Duel')) {
          if (repliedTo.text.includes('Duel - Reply and enter the Bet amount')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const bet = parseInt(text);
            if (isNaN(bet) || bet < 0) throw new Error('⚠️ Bet amount must be a Positive Number.');
            if (player.money < bet) throw new Error(`⚠️ You don't have enough money to pay the bet.`);
            await sendMsg('Duel \\- Reply and enter your *Target*', {
              reply: true,
              replyData: { bet },
            });
          }
          if (repliedTo.text.includes('Duel - Reply and enter your Target')) {
            const session = await getSession(chatId, repliedTo.message_id, fromId);
            let targetUsername = text.trim();
            if (!targetUsername) {
              throw new Error('⚠️ Target must be a User.');
            } else {
              targetUsername = targetUsername.slice(1);
            }
            const { data: target } = await db
              .from('players')
              .select('*')
              .eq('username', targetUsername)
              .maybeSingle();
            if (!target) throw new Error(`⚠️ Your target doesn't have a character.`);
            if (player.id === target.id) throw new Error(`⚠️ You can't duel with yourself.`);
            let sent;
            let baseMessage;
            console.log(String(chatId)[0], chatId);
            if (String(chatId)[0] === '-') {
              sent = await sendMsg(
                `
  *DUEL REQUEST\\!*
  
  from:  @${escapeMarkdownV2(player.username)}
  to:  @${escapeMarkdownV2(target.username)}
  bet amount:  *$${session.data.bet}*
                `,
                {
                  buttons: [
                    [
                      { text: '✅', callback_data: `duel_yes_${target.id}` },
                      { text: '❌', callback_data: `duel_no_${target.id}` },
                    ],
                  ],
                },
              );
            } else {
              sent = await sendMsg(
                `
  *DUEL REQUEST\\!*
  
  from:  @${escapeMarkdownV2(player.username)}
  to:  @${escapeMarkdownV2(target.username)}
  bet amount:  *$${session.data.bet}*
                `,
                {
                  buttons: [
                    [
                      { text: '✅', callback_data: `duel_yes_${target.id}` },
                      { text: '❌', callback_data: `duel_no_${target.id}` },
                    ],
                  ],
                  to: target.id,
                },
              );
              baseMessage = await sendMsg(`⏳ Waiting for opponent to accept\\.\\.\\.`);
            }

            await db.from('sessions').upsert({
              id: sent.chat.id + '_' + sent.message_id,
              player_id: target.id,
              data: { bet: session.data.bet, player, target, baseMessageId: baseMessage?.message_id },
            });
          }
        }
        //------------------------------------------/guild
        if (repliedTo.text.startsWith('Guild')) {
          if (repliedTo.text.includes('Guild - Reply and enter the Donation amount')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const amount = parseInt(text);
            if (isNaN(amount)) throw new Error('⚠️ Donation amount must be a Number.');
            if (amount < 500) throw new Error('⚠️ The minimum donation amount is $500.');
            const { data: donation } = await db
              .from('guild_donations')
              .select(`amount`)
              .eq('guild_id', player.guild.id)
              .eq('player_id', player.id)
              .maybeSingle();
            if (donation) {
              await db
                .from('guild_donations')
                .update({ amount: donation.amount + amount })
                .eq('guild_id', player.guild.id)
                .eq('player_id', player.id);
            } else {
              await db
                .from('guild_donations')
                .upsert({ guild_id: player.guild.id, player_id: fromId, amount: amount });
            }
            await db
              .from('players')
              .update({ money: player.money - amount })
              .eq('id', fromId);
            await sendMsg(`✅ You donated *$${amount}* to your guild`);
          }
          if (repliedTo.text.includes('Guild - Reply and enter your Message')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            if (!player.guild || player.guild.owner !== player.id) {
              throw new Error(`⚠️ You aren't owner of any guild.`);
            }
            const { data: cooldown } = await db
              .from('cooldowns')
              .select(`created_at`)
              .eq('player_id', player.id)
              .eq('type', 'guild broadcast')
              .maybeSingle();

            if (cooldown) {
              const created = new Date(cooldown.created_at);
              const diffMinutes = Math.floor((now - created) / (1000 * 60));
              throw new Error(`⚠️ Broadcast is on cooldown.\nCome back after ${360 - diffMinutes} minutes.`);
            }
            await db.from('cooldowns').upsert({ type: 'guild broadcast', player_id: player.id });

            const message = `*📜 Message from your Guild Owner:*\n` + quote(escapeMarkdownV2(text));
            const { data: members } = await db.from('players').select(`id`).eq('guild_id', player.guild_id);
            const results = await Promise.allSettled(
              members.map(async (member) => {
                const sent = await sendMsg(message, { to: member.id });
                return sent ? 'sent' : 'failed';
              }),
            );

            const sentNum = results.filter((r) => r.value === 'sent').length;
            const cantSentNum = results.length - sentNum;
            await sendMsg(`✅ Sent for:  ${sentNum}\n❌ Cant send for:  ${cantSentNum}`);
          }
          if (repliedTo.text.includes('Guild - Reply and enter the Guild name')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const guildName = text.toLowerCase();
            const { data: guild } = await db.from('guilds').select(`*`).eq('name', guildName).maybeSingle();
            if (!guild) throw new Error(`⚠️ there is no guild with this name.`);
            const { data: members } = await db.from('players').select(`guild_id`).eq('guild_id', guild.id);
            if (members.length >= 10) throw new Error(`⚠️ Guild is full.`);
            await db.from('players').update({ guild_id: guild.id }).eq('id', player.id);
            await sendMsg(`✅ You joined  🏛️ *${toTitleCase(guild.name)}*  guild\\.`);
          }
          if (repliedTo.text.includes('Guild - Reply and enter your Guild name')) {
            await getSession(chatId, repliedTo.message_id, fromId);
            const guildName = text.toLowerCase();
            if (3 > guildName || guildName > 20)
              throw new Error(`⚠️ name must be between 3 and 20 characters.`);
            const { data: guild } = await db.from('guilds').select(`*`).eq('name', guildName).maybeSingle();
            if (guild) throw new Error(`⚠️ this name is already being used by another guild.`);

            const sent = await sendMsg(
              `
*ARE YOU SURE\\?*

name: 🏛️ *${toTitleCase(guildName)}*
cost:  *$10000*`,
              {
                buttons: [
                  [
                    { text: '✅', callback_data: `guild_create_yes` },
                    { text: '❌', callback_data: `guild_create_no` },
                  ],
                ],
              },
            );
            await db.from('sessions').upsert({
              id: sent.chat.id + '_' + sent.message_id,
              player_id: player.id,
              data: { name: guildName },
            });
          }
        }
        //------------------------------------------
        return new Response('OK', { status: 200 });
      }
      // ---------------------- Commands ---------------------- //
      if (body.message?.text) {
        const fromId = body.message.from.id;
        const fromUsername = body.message.from.username;
        const chatId = body.message.chat.id;
        const text = body.message.text;
        const textMatch = text.trim().split(/\s+/);
        const player = await verifyPlayer(fromId, fromUsername);
        async function sendMsg(
          messageText,
          { reply = false, buttons = null, replyData = null, to = chatId } = {},
        ) {
          const options = { parse_mode: 'MarkdownV2' };
          if (reply) {
            options.reply_to_message_id = body.message.message_id;
            options.reply_markup = { force_reply: true, selective: true };
          }
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          const sent = await sendMessage(TELEGRAM_TOKEN, to, messageText, options);
          if (reply) {
            await db.from('sessions').upsert({
              id: to + '_' + sent.message_id,
              player_id: fromId,
              data: replyData,
            });
          }
          return sent;
        }
        async function sendImg(photo, { reply = false, buttons = null, caption = null } = {}) {
          const options = { parse_mode: 'MarkdownV2' };
          if (reply) options.reply_markup = { force_reply: true, selective: true };
          if (buttons) options.reply_markup = { inline_keyboard: buttons };
          if (caption) options.caption = caption;
          return await sendPhoto(TELEGRAM_TOKEN, chatId, photo, options);
        }
        //------------------------------------------/dev
        if (isCommand(text, 'dev')) {
          if (!ADMINS.includes(fromId)) throw new Error(`⚠️ Only admins can use this command`);
          await sendMsg('Dev Dashboard', {
            buttons: [
              [{ text: 'Whisper', callback_data: `dev_whisper` }],
              [{ text: 'Global Message', callback_data: `dev_globalMessage` }],
            ],
          });
        }
        //------------------------------------------/start
        if (isCommand(text, 'start')) {
          await sendMsg(`Welcome to ForgeCraft\\! ⚒️
Use /help to learn the basics and start your adventure\\.`);
        }
        //------------------------------------------/help
        if (isCommand(text, 'help')) {
          await sendMsg(`
🎮 *Game Guide*

Welcome to the game\\!  
You are an adventurer who fights, explores, and collects powerful items to grow stronger\\!

${escapeMarkdownV2('──────────────────────')}
👤 *Profile*
/profile  
Show your own stats:  
⭐️ Level  
💰 Money  
✨ XP  
🛡️ Armor  
💪 Strength  
❤️ Stamina  
Also shows your equipped items\\.

Check others:  
/profile @username

${escapeMarkdownV2('──────────────────────')}
🎒 *Inventory*
/inventory
See all your items with pages \\(⬅️ ➡️\\)  
Each item has:  
🛡️ Armor \\| 💪 Strength \\| 🩸 Stamina  

${escapeMarkdownV2('──────────────────────')}
🗡 *Equip Item*
/equip  
Bot asks you to reply with your *item ID*\\.

${escapeMarkdownV2('──────────────────────')}
🧭 *Adventure*
/adventure
Start a 1\\-hour adventure\\!
After completion you automatically get rewards:
💰 Money
✨ XP
🎁 Random Item

${escapeMarkdownV2('──────────────────────')}
🗺️ *Map*  
/map  
Explore the world and discover *Dungeons*\\!  
Inside the map\\, choose a dungeon to challenge\\.  
Each dungeon lasts *3 hours* and tests your strength\\.  
Be prepared\\, you might die or return victorious with:  
✨ XP
🎁 Random Item

${escapeMarkdownV2('──────────────────────')}
🎁 *Gift Item*
/gift
1\\. Reply with target username
2\\. Then reply with *item ID*
The target must have inventory space \\(max 30 items\\)\\.

${escapeMarkdownV2('──────────────────────')}
💸 *Sell Items*
By ID:
/sell\\_by\\_id
Bot asks for your item ID then sells it\\.

By Rank:
/sell\\_by\\_rank
Choose one rank \\(common\\/uncommon\\/rare\\/epic\\) to sell all items of that rank\\.

${escapeMarkdownV2('──────────────────────')}
🏪 *Shop*
/shop
Daily refreshed shop \\(00\\:00 Tehran time\\)\\.
Each item costs *2x its base price*\\.
Press *Buy* then reply with item ID to purchase\\.

${escapeMarkdownV2('──────────────────────')}
🏦 *Market*
/market \\- View items for sale

*Sell item:*
Press *Sell* then reply with item ID then reply with favorite Price to list the item in market\\.
\\(Requires 5% fee\\)

*Buy item:*
Press *Buy* then reply with item ID to purchase\\.

${escapeMarkdownV2('──────────────────────')}
⚔️ *Duel*
/duel
1\\. Reply with *bet amount*
2\\. Then reply with opponent username
Opponent can accept or decline\\.
Winner earns the bet amount \\- loser pays it\\!

${escapeMarkdownV2('──────────────────────')}
🏰 *Guild*
/guild
Join or create a Guild and grow stronger together\\!

Donate money to level up your Guild\\.
Each level grants every member:
*🛡️ \\+5 \\| 💪 \\+1 \\| 🩸 \\+1*

${escapeMarkdownV2('──────────────────────')}
🧩 *Notes*
• Inventory limit: 30 items
• Shop resets daily
• Market items expire after 1 week
• Adventure duration:   1 hour
• Dungeon duration:   3 hour
• Dungeon cooldown:   24 hours
• Session expires after   12 hours

${escapeMarkdownV2('──────────────────────')}
🔰 *Item Rank Colors*
⚪️ *Common* \\- basic
🟢 *Uncommon* \\- improved
🔵 *Rare* \\- valuable
🟣 *Epic* \\- powerful
🟠🔥 *Legendary* 🔥 \\- the best

${escapeMarkdownV2('──────────────────────')}
We love to hear your feedback via /feedback
Enjoy your journey, hero\\! ✨`);
        }
        //------------------------------------------/feedback
        if (isCommand(text, 'feedback')) {
          await sendMsg('Feedback \\- Reply and enter your *Feedback*', { reply: true });
        }
        //------------------------------------------/profile
        if (text.startsWith('/profile')) {
          const targetUsername = textMatch[1] ? textMatch[1].slice(1) : null;
          let localPlayer = player;
          if (targetUsername) {
            const { data: targetPlayer } = await db
              .from('players')
              .select('*')
              .eq('username', targetUsername)
              .maybeSingle();
            if (!targetPlayer) throw new Error('⚠️ Invalid Target.');
            localPlayer = targetPlayer;
          }
          const items = await getPlayerItems(localPlayer.id);
          let profile = {};
          if (localPlayer.guild_id) {
            const { data: guildDonations } = await db
              .from('guild_donations')
              .select(`amount`)
              .eq('guild_id', localPlayer.guild_id);
            const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
            const guildProfile = getGuildProfile(totalDonations);
            profile = getUserProfile(items, localPlayer.level, guildProfile.level);
          } else {
            profile = getUserProfile(items, localPlayer.level);
          }

          await sendMsg(`
⭐*Level:  ${localPlayer.level}*
💰*Money:  $${localPlayer.money}*
✨*XP:  ${localPlayer.xp}\\/${xpForNextLevel(localPlayer.level)}XP*

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
        }
        //------------------------------------------/inventory
        if (text.startsWith('/inventory')) {
          const targetUsername = textMatch[1] ? textMatch[1].slice(1) : null;
          let localPlayer = player;
          if (targetUsername) {
            const { data: targetPlayer } = await db
              .from('players')
              .select('*')
              .eq('username', targetUsername)
              .maybeSingle();
            if (!targetPlayer) throw new Error('⚠️ Invalid Target.');
            localPlayer = targetPlayer;
          }
          await showItemsPage(chatId, 1, { playerId: localPlayer.id });
        }
        //------------------------------------------/equip
        if (isCommand(text, 'equip')) {
          await sendMsg('Equip \\- Reply and enter your *item ID*', { reply: true });
        }
        //------------------------------------------/adventure
        if (isCommand(text, 'adventure')) {
          const { data: adventure } = await db
            .from('adventures')
            .select('id')
            .eq('player_id', fromId)
            .maybeSingle();
          if (adventure) throw new Error('⚠️ You already in an adventure.');
          const items = await getPlayerItems(player.id);
          if (items.length >= 30) throw new Error(`⚠️ Your inventory is full.`);
          const moneyReward = Math.floor((player.level + Math.random() * (player.level * 0.5)) * 2);
          const xpReward = Math.floor((player.level + Math.random() * (player.level * 0.5)) * 20);
          let rank = 'common';
          const rankChance = Math.floor(Math.random() * 100);
          if (rankChance >= 65 && rankChance < 87) rank = 'uncommon';
          if (rankChance >= 87 && rankChance < 96) rank = 'rare';
          if (rankChance >= 96 && rankChance < 99) rank = 'epic';
          if (rankChance >= 99) rank = 'legendary';
          const { data: allItems } = await db.from('items').select('*').eq('rank', rank);
          const itemReward = allItems[Math.floor(Math.random() * allItems.length)];

          const { error: insertError } = await db.from('adventures').insert([
            {
              player_id: fromId,
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
            `);
        }
        //------------------------------------------/map
        if (isCommand(text, 'map')) {
          await sendImg(
            'https://dahmbtmkdwhjnenkwbux.supabase.co/storage/v1/object/public/ForgeCraft-storage/map.png',
            {
              buttons: [[{ text: 'Dungeons', callback_data: `dungeons` }]],
            },
          );
        }
        //------------------------------------------/gift
        if (isCommand(text, 'gift')) {
          await sendMsg('Gift \\- Reply and enter your *Target*', { reply: true });
        }
        //------------------------------------------/sell_by_id
        if (isCommand(text, 'sell_by_id')) {
          await sendMsg(
            `
Sell \\- Reply and enter your *item IDs*

*Single:*
example → 425

*Multiple:*
example → 89 43 523
            `,
            { reply: true },
          );
        }
        //------------------------------------------/sell_by_rank
        if (isCommand(text, 'sell_by_rank')) {
          await sendMsg('Choose one *Rank* to delete items', {
            buttons: [
              [
                { text: '⚪ Common', callback_data: `sellBy_rank_common` },
                { text: '🟢 Uncommon', callback_data: `sellBy_rank_uncommon` },
              ],
              [
                { text: '🔵 Rare', callback_data: `sellBy_rank_rare` },
                { text: '🟣 Epic', callback_data: `sellBy_rank_epic` },
              ],
              [{ text: '⚫ All', callback_data: `sellBy_rank` }],
            ],
          });
        }
        //------------------------------------------/shop
        if (isCommand(text, 'shop')) {
          const { data: shop } = await db.from('shop').select(`*, item:items(*)`);
          let message = '';
          shop.forEach((shopItem) => {
            if (message)
              message += `\n\\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-  \\-\n`;
            message += `${rankDisplay(shopItem.item)}     *ID:  ${shopItem.id}*
*Price:  $${shopItem.item.price * 2}*     *Type:*  ${shopItem.item.type}
🛡️: *${shopItem.item.armor}*    \\|    💪: *${shopItem.item.strength}*    \\|    🩸: *${
              shopItem.item.stamina
            }*`;
          });
          if (!shop?.length) message = '*All items have been sold\\.*';
          await sendMsg(message, { buttons: [[{ text: 'Buy', callback_data: `shop_buy` }]] });
        }
        //------------------------------------------/market
        if (isCommand(text, 'market')) {
          await showItemsPage(chatId, 1, { market: true });
        }
        //------------------------------------------/duel
        if (isCommand(text, 'duel')) {
          await sendMsg('Duel \\- Reply and enter the *Bet amount*', { reply: true });
        }
        //------------------------------------------/leaderboard
        if (isCommand(text, 'leaderboard')) {
          let { data: players } = await db.from('players').select('*');
          const { data: playersItems } = await db.from('player_items').select(`*, data:items(*)`);
          const { data: guildDonations } = await db.from('guild_donations').select(`guild_id, amount`);
          players = players.map((player) => {
            const items = playersItems.filter((item) => item.player_id === player.id);
            let profile = {};
            if (player.guild_id) {
              const donations = guildDonations.filter((donation) => donation.guild_id === player.guild_id);
              const totalDonations = donations.reduce((sum, donate) => sum + donate.amount, 0);
              const guildProfile = getGuildProfile(totalDonations);
              profile = getUserProfile(items, player.level, guildProfile.level);
            } else {
              profile = getUserProfile(items, player.level);
            }
            player.score = profile.armor + profile.strength * 5 + profile.stamina * 5;
            player.armor = profile.armor;
            player.strength = profile.strength;
            player.stamina = profile.stamina;
            return player;
          });
          const playersRank = players.sort((a, b) => b.score - a.score);
          let message = '';
          let i = 0;
          while (i < 5) {
            if (message)
              message += escapeMarkdownV2(
                `\n-  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -  -\n`,
              );
            message += `*\\#${i + 1}*  @${escapeMarkdownV2(playersRank[i].username)}
🛡️: *${playersRank[i].armor}*    \\|    💪: *${playersRank[i].strength}*    \\|    🩸: *${
              playersRank[i].stamina
            }*`;
            i++;
          }
          await sendMsg(message);
        }
        //------------------------------------------/guild
        if (isCommand(text, 'guild')) {
          let text;
          const buttons = [];
          if (!player.guild) {
            text = `You are not in any guild\\.`;
            buttons.push([{ text: `📃 Guilds List   `, callback_data: `guild_list_1` }]);
            buttons.push([{ text: `🏰 Create new Guild   `, callback_data: `guild_create` }]);
          } else {
            const { data: guildPlayers } = await db
              .from('players')
              .select(`id`)
              .eq('guild_id', player.guild_id);
            const { data: guildDonations } = await db
              .from('guild_donations')
              .select(`*`)
              .eq('guild_id', player.guild.id);
            const yourDonation = guildDonations.find((donate) => donate.player_id == player.id) ?? 0;
            const totalDonations = guildDonations.reduce((sum, donate) => sum + donate.amount, 0);
            const guildProfile = getGuildProfile(totalDonations);
            text = `
🏛️ *${toTitleCase(player.guild.name)}*

Level:  *${guildProfile.level}*
Members:  *${guildPlayers.length}/10*
Power bonus:  *\\+${guildProfile.level}*
MFNL:  *$${guildProfile.mhfnl}/$${guildProfile.mnfnl}*
Your donations:  *$${yourDonation.amount}*
Total donations:  *$${totalDonations}*
            `;
            buttons.push([{ text: `💰 Donate   `, callback_data: `guild_donate` }]);
            if (player.guild.owner === player.id) {
              buttons.push([{ text: `📣 Broadcast   `, callback_data: `guild_broadcast` }]);
              buttons.push([{ text: `👥 Members   `, callback_data: `guild_members` }]);
            } else {
              buttons.push([{ text: `🚶‍➡️ Leave   `, callback_data: `guild_leave` }]);
            }
          }
          await sendMsg(text, { buttons });
        }
        //------------------------------------------
        return new Response('OK', { status: 200 });
      }
    } catch (err) {
      if (err.message.startsWith('⚠️ ')) {
        await sendMessage(
          TELEGRAM_TOKEN,
          body.message?.chat.id ?? body.callback_query.message.chat.id,
          err.message,
        );
      } else if (err.message.startsWith('❗ ')) {
        await answerCallbackQuery(TELEGRAM_TOKEN, body.callback_query.id, err.message);
      } else if (err.message !== '🚫') {
        console.error(err);
        await sendMessage(
          TELEGRAM_TOKEN,
          body.message?.chat.id ?? body.callback_query.message.chat.id,
          '❌ Something went wrong. You can report it with /feedback.',
        );
        await sendMessage(TELEGRAM_TOKEN, '-1003101666041', err.message, {
          message_thread_id: 37,
        });
      }
    }
    if (body.callback_query) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: body.callback_query.id }),
      });
    }
    return new Response('OK', { status: 200 });
  },
};
