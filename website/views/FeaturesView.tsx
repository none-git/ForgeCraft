import React from 'react';
import { Link } from 'react-router-dom';

const FeaturesView: React.FC = () => {
  return (
    <div className="layout-container flex flex-col items-center">
      {/* Header Banner */}
      <div className="relative w-full py-12 lg:py-24 px-4 lg:px-10 border-b border-surface-border overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-[#3E342B]/40 to-transparent pointer-events-none"></div>
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex flex-col gap-6 flex-1 text-left items-start">
              <div className="flex flex-col gap-4">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">
                  Game Features Overview
                </span>
                <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-[-0.033em]">
                  Master the Realm of{' '}
                  <span className="text-primary">ForgeCraft</span>
                </h1>
                <h2 className="text-base lg:text-xl font-normal leading-relaxed text-text-muted">
                  Your complete guide to the features of the ultimate text-based
                  RPG on Telegram. From character stats to guild warfare,
                  explore everything the bot has to offer.
                </h2>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <a
                  href="https://t.me/ForgeCraftRobot"
                  className="flex flex-1 sm:flex-none cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-primary-hover text-black text-base font-bold transition-all shadow-lg"
                >
                  Start Adventure
                </a>
                <Link
                  to="/wiki"
                  className="flex flex-1 sm:flex-none cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-surface-dark border border-surface-border hover:bg-[#4a4039] text-white text-base font-bold transition-all"
                >
                  Full Wiki
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="w-full aspect-video bg-cover bg-center rounded-xl shadow-2xl overflow-hidden border border-surface-border relative group bg-[url('../pictures/background.webp')]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#14110F] via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-surface-dark/90 backdrop-blur border border-surface-border p-4 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs font-mono text-primary">
                        SYSTEM ONLINE
                      </span>
                    </div>
                    <code className="text-sm text-text-muted">/start</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="w-full bg-surface-dark/30 border-y border-surface-border py-16 backdrop-blur-sm">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-10">
          <div className="flex flex-col gap-2 text-center md:text-left mb-10">
            <h2 className="text-[28px] lg:text-[32px] font-bold leading-tight text-primary">
              Character Profile
            </h2>
            <p className="text-base text-text-muted max-w-[720px]">
              Use the{' '}
              <code className="bg-surface-border px-1.5 py-0.5 rounded text-primary font-mono text-sm border border-white/5">
                /profile
              </code>{' '}
              command to view your progress.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Level', sub: 'Growth', icon: 'upgrade' },
              { label: 'Money', sub: 'Gold & Coins', icon: 'payments' },
              { label: 'XP', sub: 'Experience', icon: 'star' },
              { label: 'Armor', sub: 'Defense', icon: 'shield' },
              { label: 'Strength', sub: 'Attack', icon: 'bolt' },
              { label: 'Stamina', sub: 'Health', icon: 'favorite' },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-dark p-4 hover:border-primary/50 transition-all group hover:-translate-y-1"
              >
                <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined">{stat.icon}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-bold leading-tight">
                    {stat.label}
                  </h3>
                  <p className="text-xs text-text-muted">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Ranks & Inventory */}
      <div className="w-full py-16 bg-background-dark border-b border-surface-border">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-10">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="flex-1 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-[28px] lg:text-[32px] font-bold leading-tight text-primary">
                  Inventory Management
                </h2>
                <p className="text-base text-text-muted">
                  Manage your loot and prepare for battle.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-5 rounded-xl border border-surface-border bg-surface-dark hover:bg-surface-border/50 transition-colors">
                  <div className="p-2.5 rounded bg-primary/10 text-primary shrink-0">
                    <span className="material-symbols-outlined">backpack</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">
                      <span className="text-primary font-mono text-base mr-2">
                        /inventory
                      </span>
                      Check Bag
                    </h3>
                    <p className="text-sm text-text-muted">
                      View all items you have collected with full details on
                      quantities and stats.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 rounded-xl border border-surface-border bg-surface-dark hover:bg-surface-border/50 transition-colors">
                  <div className="p-2.5 rounded bg-primary/10 text-primary shrink-0">
                    <span className="material-symbols-outlined">checkroom</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1 text-white">
                      <span className="text-primary font-mono text-base mr-2">
                        /equip
                      </span>
                      Gear Up
                    </h3>
                    <p className="text-sm text-text-muted">
                      Equip weapons and armor to apply their stats. Only
                      equipped items grant bonuses.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-[28px] lg:text-[32px] font-bold leading-tight text-primary">
                  Item Ranks
                </h2>
                <p className="text-base text-text-muted">
                  Rarity determines power. Hunt for artifacts.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    name: 'Common',
                    color: 'text-rank-common',
                    bg: 'bg-rank-common',
                  },
                  {
                    name: 'Uncommon',
                    color: 'text-rank-uncommon',
                    bg: 'bg-rank-uncommon',
                  },
                  { name: 'Rare', color: 'text-rank-rare', bg: 'bg-rank-rare' },
                  { name: 'Epic', color: 'text-rank-epic', bg: 'bg-rank-epic' },
                ].map((rank, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border border-surface-border bg-surface-dark"
                  >
                    <span className={`font-bold ${rank.color}`}>
                      {rank.name}
                    </span>
                    <div
                      className={`size-3 rounded-full ${rank.bg} shadow-md`}
                    ></div>
                  </div>
                ))}
                <div className="flex items-center justify-between col-span-1 sm:col-span-2 p-4 rounded-lg border border-rank-legendary/30 bg-rank-legendary/5">
                  <span className="font-bold text-rank-legendary flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">
                      workspace_premium
                    </span>
                    Legendary
                  </span>
                  <div className="size-3 rounded-full bg-rank-legendary shadow-[0_0_12px_rgba(234,179,8,0.8)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Economy */}
      <div className="w-full py-20 bg-surface-dark/20 relative">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-10">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col gap-2 text-center">
              <h2 className="text-[28px] lg:text-[32px] font-bold leading-tight text-primary">
                Global Economy
              </h2>
              <p className="text-base text-text-muted max-w-[720px] mx-auto">
                Fully player-driven economy. Trade wisely.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'The Shop',
                  cmd: '/shop',
                  icon: 'storefront',
                  img: 'shop',
                  desc: (
                    <p>
                      Purchase essential consumables and gear. The shop
                      inventory{' '}
                      <span className="font-bold text-white">resets daily</span>
                      , offering new randomized deals every 24 hours.
                    </p>
                  ),
                },
                {
                  title: 'Player Market',
                  cmd: '/market',
                  icon: 'handshake',
                  img: 'market',
                  desc: (
                    <p>
                      Buy & sell items with other players. Listings incur a{' '}
                      <span className="font-bold text-white">5% fee</span> and
                      automatically expire after{' '}
                      <span className="font-bold text-white">7 days</span> if
                      unsold.
                    </p>
                  ),
                },
                {
                  title: 'Selling & Gifting',
                  cmd: '/sell & /gift',
                  icon: 'sell',
                  img: 'trade',
                  desc: (
                    <p>
                      Quick sell to NPCs via{' '}
                      <code class="text-primary text-xs bg-black/20 px-1 rounded">
                        /sell_by_id
                      </code>{' '}
                      or{' '}
                      <code class="text-primary text-xs bg-black/20 px-1 rounded">
                        /sell_by_rank
                      </code>
                      . Send items directly to friends using
                      <code class="text-primary text-xs bg-black/20 px-1 rounded">
                        /gift
                      </code>
                      .
                    </p>
                  ),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col gap-4 group bg-surface-dark border border-surface-border rounded-xl p-4 hover:border-primary transition-all"
                >
                  <div
                    className={`w-full aspect-video bg-cover bg-center rounded-lg overflow-hidden relative shadow-lg bg-[url('../pictures/${item.img}.webp')]`}
                  >
                    <div className="absolute inset-0 bg-black/50 group-hover:bg-black/30 transition-all"></div>
                    <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-primary font-mono border border-primary/20">
                      {item.cmd}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 px-1">
                    <div className="flex items-center gap-2 text-primary">
                      <span className="material-symbols-outlined text-xl">
                        {item.icon}
                      </span>
                      <h3 className="text-lg font-bold text-white">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Adventure & PvP */}
      <div className="w-full py-20 bg-surface-dark border-y border-surface-border">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-10 flex flex-col gap-20">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/3] bg-cover bg-center rounded-xl shadow-2xl border border-surface-border relative overflow-hidden bg-[url('../pictures/map.webp')]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="text-white font-bold text-xl block">
                    The Forge Kingdom
                  </span>
                  {/* <span className="text-primary text-sm">
                    Recommended Level: 5-10
                  </span> */}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2">
                <span className="material-symbols-outlined text-3xl">map</span>
              </div>
              <h3 className="text-3xl font-bold text-white">
                Adventure & Exploration
              </h3>
              <p className="text-text-muted text-lg leading-relaxed">
                The world is vast. Use{' '}
                <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm">
                  /map
                </code>{' '}
                to navigate regions and locate dungeons. Use{' '}
                <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm">
                  /adventure
                </code>{' '}
                to explore your current location, fight mobs, and earn valuable
                rewards and XP.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-muted bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                  <span className="material-symbols-outlined text-primary">
                    explore
                  </span>
                  <span>Discover hidden dungeons</span>
                </li>
                <li className="flex items-center gap-3 text-text-muted bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                  <span className="material-symbols-outlined text-primary">
                    trophy
                  </span>
                  <span>Earn XP, Gold, and Loot</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <div className="size-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 mb-2 border border-red-500/20">
                <span className="material-symbols-outlined text-3xl">
                  swords
                </span>
              </div>
              <h3 className="text-3xl font-bold text-white">PvP Duels</h3>
              <p className="text-text-muted text-lg leading-relaxed">
                Test your might against other players with{' '}
                <code className="text-red-400 bg-red-500/10 border border-red-900/50 px-1 py-0.5 rounded text-sm">
                  /duel
                </code>{' '}
                . Challenge rivals, place bets on your victory, and claim the
                loser's coin.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-muted bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                  <span className="material-symbols-outlined text-red-500">
                    timer
                  </span>
                  <span>Real-time combat outcomes</span>
                </li>
                <li className="flex items-center gap-3 text-text-muted bg-background-dark/50 p-3 rounded-lg border border-surface-border">
                  <span className="material-symbols-outlined text-red-500">
                    casino
                  </span>
                  <span>Betting system (Winner takes the pot)</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2">
              <div className="w-full aspect-[4/3] bg-cover bg-center rounded-xl shadow-2xl border border-surface-border relative overflow-hidden bg-[url('../pictures/duel.webp')]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesView;
