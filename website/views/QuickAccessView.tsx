import React from 'react';

const QuickAccessView: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-10 px-4 md:px-0 w-full bg-background-dark">
      <div className="max-w-[600px] flex-1 w-full">
        <div className="flex flex-col gap-8 text-center items-center">
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-primary text-4xl md:text-5xl font-bold tracking-tight">
              Quick Access
            </h1>
            <p className="text-text-muted text-lg max-w-md">
              Jump straight into the adventure or explore the code behind the
              forge.
            </p>
          </div>

          <div className="flex flex-col w-full gap-4 max-w-sm">
            {[
              {
                title: 'Launch Bot',
                sub: 'Start your adventure (/start)',
                icon: 'rocket_launch',
                href: 'https://t.me/ForgeCraftRobot',
              },
              {
                title: 'ForgeCraft GitHub',
                sub: 'View source code',
                icon: 'code',
                href: 'https://github.com/none-git/ForgeCraft',
              },
              {
                title: 'Telegram Support',
                sub: 'Use (/feedback)',
                icon: 'support_agent',
                href: 'https://t.me/ForgeCraftRobot',
              },
            ].map((link, i) => (
              <a
                key={i}
                href={link.href || '#'}
                className="flex items-center justify-between w-full p-4 rounded-xl bg-surface-dark border border-surface-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                    <span className="material-symbols-outlined text-2xl">
                      {link.icon}
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-bold text-lg">
                      {link.title}
                    </span>
                    <span className="text-gray-400 text-sm">{link.sub}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">
                  arrow_forward_ios
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccessView;
