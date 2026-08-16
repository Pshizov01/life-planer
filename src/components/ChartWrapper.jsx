import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const darkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: { ticks: { color: '#a3a3a3' }, grid: { color: '#262626' } },
    y: { ticks: { color: '#a3a3a3' }, grid: { color: '#262626' } },
  },
  plugins: {
    legend: { labels: { color: '#d4d4d4' } },
  },
}

export function ChartWrapper({ type = 'line', labels, data, label }) {
  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: '#10b981',
        backgroundColor: '#10b98155',
      },
    ],
  }

  const Component = type === 'bar' ? Bar : Line

  return (
    <div className="h-64">
      <Component data={chartData} options={darkOptions} />
    </div>
  )
}
