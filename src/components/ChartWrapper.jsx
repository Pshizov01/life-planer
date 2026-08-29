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

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: { padding: { top: 8, right: 8, bottom: 0, left: 0 } },
  scales: {
    x: {
      ticks: { color: '#737373', font: { size: 12 } },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#737373', font: { size: 12 }, maxTicksLimit: 5 },
      grid: { color: '#e5e5e5' },
      border: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#ffffff',
      borderColor: '#e5e5e5',
      borderWidth: 1,
      titleColor: '#171717',
      bodyColor: '#525252',
      padding: 10,
      cornerRadius: 8,
      displayColors: false,
    },
  },
}

export function ChartWrapper({ type = 'line', labels, data, label }) {
  const isBar = type === 'bar'

  const chartData = {
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: '#10b981',
        backgroundColor: isBar ? '#10b981' : '#10b98133',
        borderRadius: isBar ? 6 : 0,
        maxBarThickness: 40,
        borderWidth: isBar ? 0 : 2,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#10b981',
        pointRadius: 3,
        tension: 0.35,
        fill: !isBar,
      },
    ],
  }

  const Component = isBar ? Bar : Line

  return (
    <div className="h-64">
      <Component data={chartData} options={baseOptions} />
    </div>
  )
}
