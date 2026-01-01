import React from 'react';
import { CORE_COMMANDS, ECONOMY_COMMANDS, NOTES, RANKS } from '../constants';

const WikiView: React.FC = () => {
  return (
    <main className="flex justify-center w-full flex-1 py-12 px-4 md:px-6">
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full gap-16">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 text-center items-center pb-12 border-b border-surface-border">
          <h1 className="text-primary text-4xl md:text-5xl font-bold tracking-tight">Game Guide</h1>
          <p className="text-text-muted text-lg max-w-2xl">
            Master the forge with our comprehensive command reference. Learn how to craft, battle, trade, and
            conquer in ForgeCraft.
          </p>
        </div>

        {/* Core Commands */}
        <section id="commands" className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8 font-display scroll-mt-24">
            <span className="material-symbols-outlined text-primary">terminal</span>
            Core Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CORE_COMMANDS.map((cmd) => (
              <div
                className={`bg-surface-dark p-6 rounded-xl border border-surface-border hover:border-primary/40 transition-colors ${
                  false ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary">{cmd.icon}</span>
                  <h3 className="text-lg font-bold text-white font-display">{cmd.name}</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  {Array.isArray(cmd.syntax) ? (
                    cmd.syntax.map((item, index) => (
                      <code
                        key={index}
                        className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm w-max"
                      >
                        {item}
                      </code>
                    ))
                  ) : (
                    <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm w-max">
                      {cmd.syntax}
                    </code>
                  )}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{cmd.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Economy & Trade */}
        <section className="scroll-mt-24">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-8 font-display scroll-mt-24">
            <span className="material-symbols-outlined text-primary">payments</span>
            Economy & Trade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ECONOMY_COMMANDS.map((cmd) => (
              <div
                className={`bg-surface-dark p-6 rounded-xl border border-surface-border hover:border-primary/40 transition-colors ${
                  false ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-primary">{cmd.icon}</span>
                  <h3 className="text-lg font-bold text-white font-display">{cmd.name}</h3>
                </div>
                <div className="flex gap-2 mb-3">
                  {Array.isArray(cmd.syntax) ? (
                    cmd.syntax.map((item, index) => (
                      <code
                        key={index}
                        className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm w-max"
                      >
                        {item}
                      </code>
                    ))
                  ) : (
                    <code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-sm w-max">
                      {cmd.syntax}
                    </code>
                  )}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{cmd.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Grid: Notes & Ranks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* Important Notes */}
          <section
            id="notes"
            className="lg:col-span-2 bg-surface-dark rounded-xl border border-surface-border p-8 scroll-mt-24"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8 font-display">
              <span className="material-symbols-outlined text-primary">info</span>
              Important Notes
            </h2>
            <ul className="space-y-6">
              {NOTES.map((note, idx) => (
                <li key={idx} className="flex gap-4 items-start group">
                  <div className="min-w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-0.5 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                    <span className="material-symbols-outlined text-xl">{note.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold font-display text-lg">{note.title}</h4>
                    <p className="text-gray-400 text-sm mt-1 leading-relaxed">{note.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Item Ranks */}
          <section
            id="ranks"
            className="bg-surface-dark rounded-xl border border-surface-border p-8 scroll-mt-24"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8 font-display">
              <span className="material-symbols-outlined text-primary">palette</span>
              Item Ranks
            </h2>
            <div className="space-y-3">
              {RANKS.map((rank, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded bg-black/20 border-l-4 transition-transform hover:translate-x-1 border-${rank.color} text-${rank.color}`}
                >
                  <span className="font-medium ml-2">{rank.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                    {rank.tier}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default WikiView;
