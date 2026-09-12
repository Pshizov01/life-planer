import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip)

const options = {
  cutout: '74%',
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
}

export function DonutStat({ icon: Icon, iconColor, color, pct, label, sub }) {
  const data = {
    labels: [label, ''],
    datasets: [
      {
        data: [pct, 100 - pct],
        backgroundColor: [color, '#f0f0f0'],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {label}
      </div>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{pct}%</div>
        </div>
        <p className="text-xs text-neutral-500">{sub}</p>
      </div>
    </div>
  )
}
