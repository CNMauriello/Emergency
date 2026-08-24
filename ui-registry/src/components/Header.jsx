import { useEffect, useState } from 'react'

export default function Header() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hh = String(now.getHours()).padStart(2, '0')
      const mm = String(now.getMinutes()).padStart(2, '0')
      setTime(`${hh}:${mm}`)
    }
    updateTime()
    const interval = setInterval(updateTime, 1000 * 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="text-gray-500 text-sm">Directory &gt; Registro Servizi</div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium">
          <i className="far fa-clock"></i> Current Time: {time}
        </span>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
          <i className="fas fa-plus"></i> Register New Service
        </button>
      </div>
    </header>
  )
}
