export const CORE_COMMANDS = [
  {
    name: 'Profile',
    syntax: ['/profile', '/profile [username]'],
    description:
      "View your adventurer's stats, level, experience, and current equipment. This is your main dashboard.",
    icon: 'person',
  },
  {
    name: 'Inventory',
    syntax: ['/inventory', '/inventory [username]'],
    description:
      'Check your gathered resources, crafted items, and loot. Shows item quantities and IDs.',
    icon: 'backpack',
  },
  {
    name: 'Equip Item',
    syntax: '/equip',
    description:
      'Wear armor or wield weapons from your inventory to boost your stats. Requires the specific ID from /inv.',
    icon: 'shield',
  },
  {
    name: 'Adventure',
    syntax: '/adventure',
    description:
      'Set out on a quest to gather resources and gain experience. Be prepared for random encounters!',
    icon: 'explore',
  },
  {
    name: 'Map',
    syntax: '/map',
    description:
      'View the world map, current location, and available travel destinations.',
    icon: 'map',
  },
  {
    name: 'Duel',
    syntax: '/duel',
    description:
      'Challenge another player to combat. Winner takes glory (and sometimes loot).',
    icon: 'swords',
  },
];

export const ECONOMY_COMMANDS = [
  {
    name: 'Shop',
    syntax: '/shop',
    description:
      'Access the system shop to buy basic supplies and sell junk items.',
    icon: 'storefront',
  },
  {
    name: 'Player Market',
    syntax: '/market',
    description:
      'Browse items listed by other players. Use filter commands to find specific gear.',
    icon: 'store',
  },
  {
    name: 'Sell Items',
    syntax: ['/sell_by_id', '/sell_by_rank'],
    description:
      'Sell specific items or bulk sell by rarity rank (e.g., Common).',
    icon: 'sell',
  },
  {
    name: 'Gift Item',
    syntax: '/gift',
    description:
      'Send an item from your inventory to another player as a gift.',
    icon: 'card_giftcard',
  },
  {
    name: 'Guild',
    syntax: '/guild',
    description:
      'Open the guild menu to create, join, or manage a guild. Team up for bonuses!',
    icon: 'diversity_3',
  },
  {
    name: 'Feedback',
    syntax: '/feedback',
    description:
      'Send feedback, suggestions, or bug reports directly to the team to help improve the bot.',
    icon: 'support_agent',
  },
];

export const NOTES = [
  {
    title: 'Cooldowns & Resets',
    description:
      'Adventure energy resets fully every 4 hours. Daily rewards reset at 00:00 UTC.',
    icon: 'schedule',
  },
  {
    title: 'Inventory Limits',
    description:
      'Base inventory size is 50 slots. Can be expanded using gems or by upgrading your backpack.',
    icon: 'inventory_2',
  },
  {
    title: 'Effect Durations',
    description:
      'Potions typically last for 30 minutes. Buffs from guild shrines last for 2 hours.',
    icon: 'hourglass_top',
  },
];

export const RANKS = [
  {
    name: 'Common',
    tier: 'Tier 1',
    colorClass: 'border-rank-common text-gray-300',
  },
  {
    name: 'Uncommon',
    tier: 'Tier 2',
    colorClass: 'border-rank-uncommon text-rank-uncommon',
  },
  {
    name: 'Rare',
    tier: 'Tier 3',
    colorClass: 'border-rank-rare text-rank-rare',
  },
  {
    name: 'Epic',
    tier: 'Tier 4',
    colorClass: 'border-rank-epic text-rank-epic',
  },
  {
    name: 'Legendary',
    tier: 'Tier 5',
    colorClass: 'border-rank-legendary text-rank-legendary font-bold',
  },
];
