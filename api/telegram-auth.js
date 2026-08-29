import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Проверяет подпись Telegram Web App initData по алгоритму из их документации:
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
// Делать это можно ТОЛЬКО на сервере — токен бота никогда не должен попасть в браузер.
export function verifyTelegramInitData(initData, botToken) {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')
  if (computedHash !== hash) return null

  const authDate = Number(params.get('auth_date'))
  const ONE_DAY = 24 * 60 * 60
  if (!authDate || Date.now() / 1000 - authDate > ONE_DAY) return null

  const userJson = params.get('user')
  if (!userJson) return null
  return JSON.parse(userJson)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!botToken || !supabaseUrl || !serviceRoleKey || !anonKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const tgUser = req.body?.initData && verifyTelegramInitData(req.body.initData, botToken)
  if (!tgUser) {
    return res.status(401).json({ error: 'Invalid Telegram data' })
  }

  const email = `tg-${tgUser.id}@telegram.local`
  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      data: {
        telegram_id: tgUser.id,
        telegram_username: tgUser.username ?? null,
        full_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
      },
    },
  })

  if (linkError || !linkData?.properties?.hashed_token) {
    return res.status(500).json({ error: 'Could not create session' })
  }

  const anon = createClient(supabaseUrl, anonKey)
  const { data: sessionData, error: verifyError } = await anon.auth.verifyOtp({
    type: 'magiclink',
    token_hash: linkData.properties.hashed_token,
  })

  if (verifyError || !sessionData?.session) {
    return res.status(500).json({ error: 'Could not verify session' })
  }

  return res.status(200).json({
    access_token: sessionData.session.access_token,
    refresh_token: sessionData.session.refresh_token,
  })
}
