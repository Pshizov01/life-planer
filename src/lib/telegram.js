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

// Показывает текст на закреплённой снизу кнопке Telegram — удобно для
// таймера помодоро: остаток времени виден, даже если проскроллить страницу.
// Работает только пока мини-апп открыт (Telegram не даёт фоновым вкладкам
// исполнять JS, когда приложение закрыто или экран телефона выключен).
export function showMainButton(text) {
  try {
    window.Telegram?.WebApp?.MainButton?.setText(text)
    window.Telegram?.WebApp?.MainButton?.show()
  } catch {
    // ignore
  }
}

export function hideMainButton() {
  try {
    window.Telegram?.WebApp?.MainButton?.hide()
  } catch {
    // ignore
  }
}

// Вибрация телефона через Telegram — самый надёжный способ привлечь
// внимание внутри мини-аппа, не зависит от системных разрешений на
// уведомления и работает даже при выключенном звуке.
export function notifySuccess() {
  try {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
  } catch {
    // ignore
  }
}
