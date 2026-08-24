const CATEGORY_COLORS = {
  FIRE_STATION: 'bg-red-100 text-red-700',
  HOSPITAL: 'bg-green-100 text-green-700',
  AIR_SUPPORT: 'bg-gray-100 text-gray-700',
  POLICE: 'bg-blue-100 text-blue-800',
}

export function CategoryBadge({ category }) {
  const classes = CATEGORY_COLORS[category] || 'bg-blue-100 text-blue-700'
  return (
    <span className={`px-2 py-1 text-xs rounded font-medium ${classes}`}>
      {category}
    </span>
  )
}

export function StatusBadge({ status }) {
  if (status === 'UP' || status === 'ACTIVE') {
    return (
      <span className="text-blue-500 font-medium text-sm flex items-center gap-1">
        <i className="fas fa-circle text-[10px]"></i> ACTIVE
      </span>
    )
  }
  if (status === 'BUSY') {
    return (
      <span className="text-orange-500 font-medium text-sm flex items-center gap-1">
        <i className="fas fa-circle text-[10px]"></i> BUSY
      </span>
    )
  }
  return (
    <span className="text-gray-400 font-medium text-sm flex items-center gap-1">
      <i className="fas fa-circle text-[10px]"></i> OFFLINE
    </span>
  )
}
