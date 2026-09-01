import { useState } from 'react'
import { exportAllData, downloadJson } from '../lib/exportData'
import { today } from '../lib/dates'
import { Card } from './Card'

export function DataExport() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  async function handleExport() {
    setExporting(true)
    setError(null)
    try {
      const data = await exportAllData()
      downloadJson(data, `life-planner-export-${today()}.json`)
    } catch {
      setError('Не удалось выгрузить данные. Попробуй ещё раз.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card title="Экспорт данных">
      <p className="text-sm text-neutral-500">
        Скачать все свои записи одним JSON-файлом — для бэкапа или переноса. Внутри Telegram скачивание может не
        сработать — в этом случае открой сайт в обычном браузере.
      </p>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="mt-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {exporting ? 'Готовим файл…' : 'Скачать все данные (JSON)'}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  )
}
