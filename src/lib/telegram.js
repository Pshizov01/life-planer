// Мягкая интеграция с Telegram Web App SDK. Если приложение открыто как
// обычный сайт (не внутри Telegram), window.Telegram отсутствует —
// ничего не делаем, всё остальное работает как обычно.
export function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp
  if (!tg) return

  tg.ready()
  tg.expand()

  try {
    tg.setHeaderColor('#ffffff')
    tg.setBackgroundColor('#fafafa')
  } catch {
    // Старые клиенты Telegram могут не поддерживать эти методы — не критично.
  }
}
