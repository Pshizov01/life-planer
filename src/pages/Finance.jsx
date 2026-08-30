import { useState } from 'react'
import { useFinance } from '../hooks/useFinance'
import { sumByCategory } from '../lib/calculations'
import { today } from '../lib/dates'
import { GENERIC_ERROR } from '../lib/constants'
import { Card } from '../components/Card'
import { ChartWrapper } from '../components/ChartWrapper'
import { ProgressBar } from '../components/ProgressBar'
import { QuickAddToken } from '../components/QuickAddToken'

const emptyTx = { date: today(), type: 'expense', category: '', amount: '', note: '' }
const emptyGoal = { title: '', target_amount: '', target_date: '' }

export default function Finance() {
  const { transactions, goals, loading, addTransaction, addGoal, updateGoalAmount } = useFinance()
  const [txForm, setTxForm] = useState(emptyTx)
  const [goalForm, setGoalForm] = useState(emptyGoal)
  const [goalDrafts, setGoalDrafts] = useState({})
  const [error, setError] = useState(null)

  async function handleAddTx(e) {
    e.preventDefault()
    const amount = Number(txForm.amount)
    if (!txForm.category.trim() || !amount || amount <= 0) return
    try {
      await addTransaction({ ...txForm, category: txForm.category.trim(), amount })
      setTxForm({ ...emptyTx, date: txForm.date })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleAddGoal(e) {
    e.preventDefault()
    const target = Number(goalForm.target_amount)
    if (!goalForm.title.trim() || !target) return
    try {
      await addGoal({ title: goalForm.title.trim(), target_amount: target, target_date: goalForm.target_date })
      setGoalForm(emptyGoal)
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  async function handleUpdateGoal(goalId) {
    const value = Number(goalDrafts[goalId])
    if (Number.isNaN(value)) return
    try {
      await updateGoalAmount(goalId, value)
      setGoalDrafts({ ...goalDrafts, [goalId]: '' })
      setError(null)
    } catch {
      setError(GENERIC_ERROR)
    }
  }

  if (loading) return <p className="text-neutral-500">Загрузка…</p>

  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const byCategory = sumByCategory(
    transactions.filter((t) => t.type === 'expense').map((t) => ({ category: t.category, amount: t.amount })),
  )

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Финансы</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Доходы">
          <p className="text-2xl font-semibold text-emerald-600">{income.toLocaleString('ru-RU')}</p>
        </Card>
        <Card title="Расходы">
          <p className="text-2xl font-semibold text-red-600">{expense.toLocaleString('ru-RU')}</p>
        </Card>
        <Card title="Баланс">
          <p className="text-2xl font-semibold">{(income - expense).toLocaleString('ru-RU')}</p>
        </Card>
      </div>

      <Card title="Расходы по категориям">
        {byCategory.length > 0 ? (
          <ChartWrapper type="bar" labels={byCategory.map((c) => c.category)} data={byCategory.map((c) => c.total)} label="Сумма" />
        ) : (
          <p className="text-sm text-neutral-500">Пока нет расходов</p>
        )}
      </Card>

      <Card title="Добавить транзакцию">
        <form onSubmit={handleAddTx} className="flex flex-wrap gap-2">
          <select
            value={txForm.type}
            onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          >
            <option value="expense">Расход</option>
            <option value="income">Доход</option>
          </select>
          <input
            type="date"
            value={txForm.date}
            onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={txForm.category}
            onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
            placeholder="Категория"
            className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            min="1"
            value={txForm.amount}
            onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
            placeholder="Сумма"
            className="w-28 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            value={txForm.note}
            onChange={(e) => setTxForm({ ...txForm, note: e.target.value })}
            placeholder="Заметка (необязательно)"
            className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить
          </button>
        </form>
      </Card>

      <Card title="Транзакции">
        <div className="flex flex-col divide-y divide-neutral-200">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="shrink-0 text-neutral-500">{t.date}</span>
              <span className="min-w-0 flex-1 truncate px-1">{t.category}</span>
              <span className={`shrink-0 ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}
                {t.amount}
              </span>
            </div>
          ))}
          {transactions.length === 0 && <p className="py-4 text-center text-neutral-500">Пока нет транзакций</p>}
        </div>
      </Card>

      <QuickAddToken />

      <Card title="Финансовые цели">
        <div className="flex flex-col gap-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <p className="mb-1 text-sm">
                {goal.title} {goal.target_date && <span className="text-neutral-500">до {goal.target_date}</span>}
              </p>
              <ProgressBar value={goal.current_amount} max={goal.target_amount} />
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  placeholder="Накоплено"
                  value={goalDrafts[goal.id] ?? ''}
                  onChange={(e) => setGoalDrafts({ ...goalDrafts, [goal.id]: e.target.value })}
                  className="w-32 rounded-lg border border-neutral-300 bg-white px-2 py-1 text-xs outline-none focus:border-emerald-600"
                />
                <button
                  onClick={() => handleUpdateGoal(goal.id)}
                  className="rounded-lg bg-neutral-100 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-200"
                >
                  Обновить
                </button>
              </div>
            </div>
          ))}
          {goals.length === 0 && <p className="text-sm text-neutral-500">Пока нет целей</p>}
        </div>

        <form onSubmit={handleAddGoal} className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
          <input
            value={goalForm.title}
            onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            placeholder="Название цели"
            className="flex-1 min-w-[140px] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            value={goalForm.target_amount}
            onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
            placeholder="Сумма цели"
            className="w-32 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <input
            type="date"
            value={goalForm.target_date}
            onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
          >
            Добавить цель
          </button>
        </form>
      </Card>
    </div>
  )
}
