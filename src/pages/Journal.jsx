import { useEffect, useState } from 'react'
import { Moon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useJournal } from '../hooks/useJournal'
import { groupByMonth } from '../lib/calculations'
import { today, addDays, relativeDayLabel, monthLabel, dayLabel } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { PageHeading } from '../components/PageHeading'

export default function Journal() {
  const { entries, loading, saveEntry, deleteEntry } = useJournal()
  const [date, setDate] = useState(today())
  const [content, setContent] = useState('')
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const existing = entries.find((e) => e.date === date)
    setContent(existing?.content ?? '')
    setSaved(false)
  }, [date, entries])

  async function handleSave() {
    if (!content.trim()) return
    try {
      await saveEntry(date, content.trim())
      setError(null)
      setSaved(true)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Удалить запись за ${date}?`)) return
    try {
      await deleteEntry(date)
      setContent('')
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const hasEntry = entries.some((e) => e.date === date)
  const groups = groupByMonth(entries)

  return (
    <div className="flex flex-col gap-4">
      <PageHeading icon={Moon} color="text-purple-700">
        Дневник
      </PageHeading>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setDate(addDays(date, -1))}
            aria-label="Предыдущий день"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">{relativeDayLabel(date)}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-500 outline-none"
            />
          </div>
          <button
            onClick={() => setDate(addDays(date, 1))}
            aria-label="Следующий день"
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setSaved(false)
          }}
          placeholder="Как прошёл день? Что думаешь, что тревожит, за что благодарен..."
          rows={8}
          className="mt-3 w-full resize-none rounded-lg border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-purple-600"
        />

        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={handleSave}
            className="rounded-lg bg-purple-700 px-3 py-2 text-sm font-medium text-white hover:bg-purple-600"
          >
            Сохранить
          </button>
          {hasEntry && (
            <button
              onClick={handleDelete}
              className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-red-50 hover:text-red-600"
            >
              Удалить запись
            </button>
          )}
          {saved && <span className="text-xs text-neutral-500">Сохранено</span>}
        </div>
      </Card>

      {groups.length > 0 && (
        <Card title="Прошлые записи">
          <div className="flex flex-col gap-2">
            {groups.map((group, index) => (
              <details key={group.month} open={index === 0} className="rounded-lg border border-neutral-200">
                <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium">
                  {monthLabel(group.month)}
                </summary>
                <div className="flex flex-col divide-y divide-neutral-200 border-t border-neutral-200">
                  {group.items.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => setDate(entry.date)}
                      className="flex flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                    >
                      <span className="text-xs text-neutral-500">{dayLabel(entry.date)}</span>
                      <span className="line-clamp-1 text-neutral-700">{entry.content}</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
