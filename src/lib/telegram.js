// Мягкая интеграция с Telegram Web App SDK. Если приложение открыто как
// обычный сайт (не внутри Telegram), window.Telegram отсутствует —
// ничего не делаем, всё остальное работает как обычно.
//
// Каждый вызов SDK обёрнут отдельно: разные клиенты Telegram поддерживают
// разный набор методов, и падение здесь не должно мешать отрисовке React —
// иначе при неподдерживаемом методе получим пустой экран вместо приложения.
export function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp
  if (!tg) return

  try {
    tg.ready()
  } catch {
    // ignore
  }

  try {
    tg.expand()
  } catch {
    // ignore
  }

  try {
    tg.setHeaderColor('#ffffff')
  } catch {
    // ignore
  }

  try {
    tg.setBackgroundColor('#fafafa')
  } catch {
    // ignore
  }
}
