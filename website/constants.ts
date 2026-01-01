export const CORE_FEATURES = [
  {
    title: 'Combat',
    icon: 'swords',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    desc: 'Fight monsters and challenge other players using your stats, gear, and strategy.',
  },
  {
    title: 'Adventures',
    icon: 'travel_explore',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    desc: 'Send your hero on timed adventures to earn gold, experience, and random loot.',
  },
  {
    title: 'Dungeons',
    icon: 'domain',
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    desc: 'Enter dangerous dungeons discovered on the map. High risk, high reward — victory or death.',
  },
  {
    title: 'Items & Gear',
    icon: 'construction',
    color: 'text-primary',
    bg: 'bg-primary/10',
    desc: 'Collect, equip, trade, or sell items to build your perfect character.',
  },
  {
    title: 'Progression',
    icon: 'trending_up',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    desc: 'Gain XP, level up, and increase your power through consistent play.',
  },
  {
    title: 'Social & Economy',
    icon: 'diversity_3',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    desc: 'Join guilds, duel other players, trade items in the market, and grow together.',
  },
];

export const CORE_COMMANDS = [
  {
    name: 'Profile',
    syntax: ['/profile', '/profile @username'],
    description:
      'View your character stats, level, experience, and equipped items. You can also inspect other players.',
    icon: 'person',
  },
  {
    name: 'Inventory',
    syntax: ['/inventory', '/inventory [username]'],
    description: 'View all items you own with their stats, rarity, and unique IDs. Inventory limit applies.',
    icon: 'backpack',
  },
  {
    name: 'Equip Item',
    syntax: '/equip',
    description: 'Equip armor or items from your inventory using their item ID to improve your stats.',
    icon: 'shield',
  },
  {
    name: 'Adventure',
    syntax: '/adventure',
    description:
      'Start a 1-hour timed adventure. When it ends, you automatically receive gold, XP, and a random item.',
    icon: 'travel_explore',
  },
  {
    name: 'Map & Dungeons',
    syntax: '/map',
    description:
      'Explore the world map and challenge dangerous dungeons. Each dungeon takes several hours and can only be entered once per day.',
    icon: 'map',
  },
  {
    name: 'Duel',
    syntax: '/duel',
    description: 'Challenge another player to a wagered duel. The winner takes the bet. The loser pays.',
    icon: 'swords',
  },
];

export const ECONOMY_COMMANDS = [
  {
    name: 'Shop',
    syntax: '/shop',
    description: 'Browse the daily system shop. Items refresh every day and cost 2x their base price.',
    icon: 'storefront',
  },
  {
    name: 'Market',
    syntax: '/market',
    description:
      'Buy and sell items with other players in the open market. Listed items expire after one week.',
    icon: 'store',
  },
  {
    name: 'Sell Items',
    syntax: ['/sell_by_id', '/sell_by_rank'],
    description: 'Sell individual items by ID or bulk sell items by rarity rank.',
    icon: 'sell',
  },
  {
    name: 'Gift Item',
    syntax: '/gift',
    description: 'Transfer an item from your inventory to another player if they have available space.',
    icon: 'card_giftcard',
  },
  {
    name: 'Guild',
    syntax: '/guild',
    description:
      'Create or join a guild and grow stronger together. Donate gold to level up your guild and gain permanent stat bonuses shared by all members.',
    icon: 'diversity_3',
  },
  {
    name: 'Feedback',
    syntax: '/feedback',
    description: 'Send feedback or report bugs directly to help improve the game.',
    icon: 'support_agent',
  },
];

export const NOTES = [
  {
    title: 'Adventure & Dungeon Timers',
    description:
      'Adventures take 1 hour to complete. Dungeons are longer challenges that take several hours and require preparation.',
    icon: 'schedule',
  },
  {
    title: 'Dungeon Cooldown',
    description:
      'Each dungeon can only be entered once per day. Choose carefully; failed runs still consume the daily attempt.',
    icon: 'timer_off',
  },
  {
    title: 'Inventory Limit',
    description:
      'Your inventory can hold up to 30 items. Manage your space by selling, gifting, or trading items.',
    icon: 'inventory_2',
  },
  {
    title: 'Shop & Market Rules',
    description:
      'The system shop refreshes daily at 00:00 Tehran time. Market listings expire after one week.',
    icon: 'storefront',
  },
];

export const RANKS = [
  {
    name: 'Common',
    tier: 'Tier 1',
    color: 'rank-common',
  },
  {
    name: 'Uncommon',
    tier: 'Tier 2',
    color: 'rank-uncommon',
  },
  {
    name: 'Rare',
    tier: 'Tier 3',
    color: 'rank-rare',
  },
  {
    name: 'Epic',
    tier: 'Tier 4',
    color: 'rank-epic',
  },
  {
    name: 'Legendary',
    tier: 'Tier 5',
    color: 'rank-legendary',
  },
];
