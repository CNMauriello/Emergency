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
    <header className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shrink-0 shadow-sm z-10 relative">
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black tracking-tight text-[#0B1B32]">FARO</h1>
        <div className="w-px h-6 bg-gray-300"></div>
        <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
          <i className="far fa-clock"></i> Current Time: {time}
        </span>
      </div>
      
      <div className="flex items-center space-x-6 text-gray-500">
        <button className="relative hover:text-gray-700 transition-colors">
          <i className="far fa-bell text-lg"></i>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
        </button>
        <button className="hover:text-gray-700 transition-colors">
          <i className="fas fa-cog text-lg"></i>
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        <button className="flex items-center gap-2 text-sm font-semibold text-[#0B1B32] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition-colors">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  )
}
