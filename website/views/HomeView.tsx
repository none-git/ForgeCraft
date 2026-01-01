import React from 'react';
import { Link } from 'react-router-dom';

const HomeView: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full py-16 md:py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-600/5 rounded-full blur-[80px] -z-10 -translate-x-1/3 translate-y-1/3"></div>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 text-left order-2 lg:order-1">
              <div className="inline-flex self-start items-center gap-2 px-3 py-1 rounded-full bg-surface-dark border border-surface-border text-xs font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Server Online</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black leading-tight text-white">
                ForgeCraft: <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-200">
                  Text Adventure
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                Welcome to the game! You are an adventurer who fights, explores, and collects powerful items
                to grow stronger!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href="https://t.me/ForgeCraftRobot"
                  className="flex items-center justify-center h-12 px-8 bg-primary hover:bg-primary-hover text-surface-dark text-base font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(195,163,138,0.4)] hover:shadow-[0_0_30px_rgba(195,163,138,0.6)]"
                >
                  <span className="material-symbols-outlined mr-2">smart_toy</span>
                  Enter Telegram Bot
                </a>
                <a
                  href="https://t.me/ForgeCraftGuide"
                  className="flex items-center justify-center h-12 px-8 bg-surface-dark hover:bg-surface-border border border-surface-border text-white text-base font-bold rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined mr-2">group</span>
                  Join Channel
                </a>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-gray-600"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-gray-500"></div>
                  <div className="w-8 h-8 rounded-full border-2 border-background-dark bg-gray-400"></div>
                </div>
                <p className="ml-2">Join 100+ active players</p>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
              <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-surface-border bg-surface-dark pixel-art">
                <div className="w-full h-full bg-cover bg-center bg-[url('https://github.com/none-git/ForgeCraft/blob/main/website/pictures/profile.webp?raw=true')] opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-mono text-gray-400">SYSTEM LOG</span>
                  </div>
                  <p className="text-sm font-mono text-green-400 text-left">
                    &gt; You crafted [Legendary Sword]!
                    <br />
                    &gt; XP Gained: +1200
                    <br />
                    &gt; Level Up! You are now Lvl 15.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-surface-border bg-surface-dark/50">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-surface-border/50">
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">100+</div>
              <div className="text-sm text-gray-400">Active Players</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">2K+</div>
              <div className="text-sm text-gray-400">Items Crafted</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">8</div>
              <div className="text-sm text-gray-400">Dungeons Found</div>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl font-bold text-white mb-1 font-display">24/7</div>
              <div className="text-sm text-gray-400">Server Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Feature Summary */}
      <section className="py-20 bg-background-dark">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-primary font-bold tracking-wider uppercase text-sm mb-3">Core Features</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">
              Master the Mechanics
            </h3>
            <p className="text-gray-400 text-lg">
              ForgeCraft offers a deep RPG experience right in your chat app.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Fighting',
                icon: 'swords',
                color: 'text-red-500',
                bg: 'bg-red-500/10',
                desc: 'Engage in strategic turn-based combat. Fight fearsome monsters and challenge players.',
              },
              {
                title: 'Exploring',
                icon: 'explore',
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                desc: 'Traverse dangerous lands and discover hidden dungeons for great rewards.',
              },
              {
                title: 'Collecting',
                icon: 'construction',
                color: 'text-primary',
                bg: 'bg-primary/10',
                desc: 'Gather rare resources and craft powerful equipment to enhance your abilities.',
              },
              {
                title: 'Leveling Up',
                icon: 'trending_up',
                color: 'text-green-500',
                bg: 'bg-green-500/10',
                desc: 'Gain experience from battles. Level up to unlock new skills and become a legend.',
              },
              {
                title: 'Quests',
                icon: 'map',
                color: 'text-yellow-500',
                bg: 'bg-yellow-500/10',
                desc: 'Embark on epic quests and follow storylines that take you across the world.',
              },
              {
                title: 'Community',
                icon: 'diversity_3',
                color: 'text-purple-500',
                bg: 'bg-purple-500/10',
                desc: 'Join guilds, trade in a free market, and socialize with thousands of adventurers.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-surface-dark border border-surface-border rounded-xl p-6 hover:border-primary/50 transition-colors duration-300"
              >
                <div
                  className={`w-12 h-12 ${feature.bg} rounded-lg flex items-center justify-center ${feature.color} mb-4 group-hover:scale-110 transition-transform`}
                >
                  <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bot Simulation UI */}
      <section className="py-20 bg-surface-dark/20">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full"></div>
              <div className="relative bg-[#1c1c1c] border border-gray-700 rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                <div className="bg-[#262626] p-4 flex items-center gap-3 border-b border-gray-700">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-surface-dark">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">ForgeCraft</h4>
                    <p className="text-blue-400 text-xs">bot</p>
                  </div>
                </div>
                <div className="p-4 space-y-4 font-mono text-sm h-[350px] overflow-hidden relative">
                  <div className="bg-[#2b2b2b] p-3 rounded-lg rounded-tl-none border border-gray-700 max-w-[90%]">
                    <p className="text-gray-300">
                      Adventure Completed!
                      <p className="mt-2">Your rewards:</p>
                      <p>
                        💰 Money Reward: <span className="font-bold">$101</span>
                      </p>
                      <p>
                        ✨ XP Gained: <span className="text-green-400 font-bold">+900</span>
                      </p>
                      <p>
                        🎁 Item: <span className="text-yellow-500 font-bold">🔥Boots of Light🔥</span>
                      </p>
                    </p>
                  </div>
                  <div className="bg-primary/20 p-3 rounded-lg rounded-tr-none border border-primary/30 max-w-[80%] ml-auto text-left">
                    <p className="text-white">/profile</p>
                  </div>
                  <div className="bg-[#2b2b2b] p-3 rounded-lg rounded-tl-none border border-gray-700 max-w-[90%]">
                    <ul className="text-gray-300 list-inside">
                      <li>
                        ⭐ Level: <span className="font-bold">54</span>
                      </li>
                      <li>
                        💰 Money: <span className="font-bold">$8600</span>
                      </li>
                      <li>
                        ✨ XP: <span className="font-bold">22000/40200XP</span>
                      </li>
                    </ul>
                    <ul className="text-gray-300 list-inside mt-4">
                      <li>
                        🛡️ Armor: <span className="font-bold">2685</span>
                      </li>
                      <li>
                        💪 Strength: <span className="font-bold">542</span>
                      </li>
                      <li>
                        ❤️ Stamina: <span className="font-bold">566</span>
                      </li>
                    </ul>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#1c1c1c] to-transparent"></div>
                </div>
                <div className="bg-[#262626] p-3 border-t border-gray-700 flex gap-2">
                  <div className="h-10 bg-[#1c1c1c] rounded flex-1"></div>
                  <div className="h-10 w-10 bg-primary rounded flex items-center justify-center text-surface-dark">
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6 font-display">
                Simple UI, <br />
                Strategic Depth
              </h3>
              <p className="text-gray-400 text-lg mb-8">
                No huge downloads or complex controls. The entire game world lives in your pocket, accessible
                directly through Telegram.
              </p>
              <ul className="space-y-4">
                {[
                  {
                    title: 'Instant Access',
                    desc: 'Play instantly on any device with Telegram installed.',
                  },
                  {
                    title: 'Low Data Usage',
                    desc: 'Ideal for gaming on the go, even with slow internet.',
                  },
                  {
                    title: 'Live Interaction',
                    desc: 'Real-time chat, trade, and PvP with other players.',
                  },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="min-w-[24px] pt-1 text-primary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                    <div>
                      <h5 className="text-white font-bold">{item.title}</h5>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-background-dark to-surface-dark relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-surface-dark mx-auto mb-8 shadow-[0_0_30px_rgba(195,163,138,0.5)] -rotate-6">
            <span className="material-symbols-outlined text-5xl">swords</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 font-display">
            Ready for Adventure?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of other adventurers and write your own legend in the world of ForgeCraft. Start
            your journey for free today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://t.me/ForgeCraftRobot"
              className="flex items-center justify-center h-14 px-10 bg-primary hover:bg-primary-hover text-surface-dark text-lg font-bold rounded-xl transition-all shadow-lg hover:-translate-y-1"
            >
              <span className="material-symbols-outlined mr-2">rocket_launch</span>
              Start on Telegram
            </a>
            <Link
              to="/features"
              className="flex items-center justify-center h-14 px-10 bg-transparent border border-gray-600 hover:border-white hover:bg-white/5 text-white text-lg font-bold rounded-xl transition-all"
            >
              View Game Wiki
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeView;
