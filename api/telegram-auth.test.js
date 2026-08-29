import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { verifyTelegramInitData } from './telegram-auth.js'

const BOT_TOKEN = 'test-bot-token'

// Подписывает данные так же, как это делает сам Telegram — независимая от
// verifyTelegramInitData реализация, чтобы тест не был тавтологией.
function signInitData(paramsObj, botToken) {
  const params = new URLSearchParams(paramsObj)
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  params.set('hash', hash)
  return params.toString()
}

describe('verifyTelegramInitData', () => {
  it('accepts correctly signed data and returns the user', () => {
    const user = { id: 12345, first_name: 'Test', username: 'testuser' }
    const initData = signInitData(
      { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify(user) },
      BOT_TOKEN,
    )
    expect(verifyTelegramInitData(initData, BOT_TOKEN)).toEqual(user)
  })

  it('rejects data signed with a different bot token', () => {
    const user = { id: 1, first_name: 'X' }
    const initData = signInitData(
      { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify(user) },
      'a-different-token',
    )
    expect(verifyTelegramInitData(initData, BOT_TOKEN)).toBeNull()
  })

  it('rejects data tampered with after signing', () => {
    const user = { id: 1, first_name: 'X' }
    const initData = signInitData(
      { auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify(user) },
      BOT_TOKEN,
    )
    const tampered = initData.replace('X', 'Y')
    expect(verifyTelegramInitData(tampered, BOT_TOKEN)).toBeNull()
  })

  it('rejects auth_date older than 24 hours (replay protection)', () => {
    const user = { id: 1, first_name: 'X' }
    const staleDate = Math.floor(Date.now() / 1000) - 25 * 60 * 60
    const initData = signInitData({ auth_date: String(staleDate), user: JSON.stringify(user) }, BOT_TOKEN)
    expect(verifyTelegramInitData(initData, BOT_TOKEN)).toBeNull()
  })

  it('rejects data with no hash field', () => {
    expect(verifyTelegramInitData('auth_date=123&user=%7B%7D', BOT_TOKEN)).toBeNull()
  })
})
