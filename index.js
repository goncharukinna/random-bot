require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

console.log('Random-bot starting...');
console.log('BOT_TOKEN exists:', !!process.env.BOT_TOKEN);

bot.start((ctx) => {
  const name = ctx.from.first_name || 'друг';
  ctx.reply(
    `Привет, ${name}! 🎲\n\nЯ бот со случайными числами.\n\n` +
    `Команды:\n/roll — кубик (1–6)\n/random — число (1–100)\n/coin — орёл или решка`,
    Markup.keyboard([['/roll', '/random'], ['/coin']]).resize()
  );
});

bot.command('roll', (ctx) => {
  const num = Math.floor(Math.random() * 6) + 1;
  ctx.reply(`🎲 Выпало: *${num}*`, { parse_mode: 'Markdown' });
});

bot.command('random', (ctx) => {
  const num = Math.floor(Math.random() * 100) + 1;
  ctx.reply(`🎯 Случайное число: *${num}*`, { parse_mode: 'Markdown' });
});

bot.command('coin', (ctx) => {
  const result = Math.random() < 0.5 ? '🪙 Орёл' : '🪙 Решка';
  ctx.reply(result);
});

bot.help((ctx) => {
  ctx.reply('🎲 Отправь /roll, /random или /coin');
});

bot.catch((err) => console.error('Ошибка:', err));

bot.launch()
  .then(() => console.log('✅ Random-bot запущен!'))
  .catch((err) => { console.error('❌ Ошибка:', err); process.exit(1); });

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
