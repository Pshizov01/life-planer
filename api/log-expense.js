import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

function sha256Hex(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex')
}

function today() {
  return new Date().toLocaleDateString('en-CA')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null
  if (!token) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey)

  const { data: tokenRow } = await admin
    .from('api_tokens')
    .select('user_id')
    .eq('token_hash', sha256Hex(token))
    .maybeSingle()

  if (!tokenRow) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const { amount, category, note, type, date } = req.body ?? {}
  const parsedAmount = Number(amount)
  if (!parsedAmount || parsedAmount <= 0 || !category) {
    return res.status(400).json({ error: 'amount (>0) and category are required' })
  }

  const { error } = await admin.from('finance_transactions').insert({
    user_id: tokenRow.user_id,
    date: date || today(),
    type: type === 'income' ? 'income' : 'expense',
    category: String(category).trim(),
    amount: parsedAmount,
    note: note ? String(note).trim() : null,
  })

  if (error) {
    return res.status(500).json({ error: 'Could not save transaction' })
  }

  return res.status(200).json({ ok: true })
}
