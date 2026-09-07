export function CategoryBadge({ category }) {
  return (
    <span className="px-3 py-1 text-[10px] uppercase font-bold rounded bg-[#dce7f3] text-[#556987] tracking-wider">
      {category}
    </span>
  )
}

export function StatusBadge({ status }) {
  if (status === 'UP' || status === 'ACTIVE') {
    return (
      <span className="text-[#3b82f6] font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide">
        <i className="fas fa-circle text-[8px]"></i> ACTIVE
      </span>
    )
  }
  if (status === 'BUSY') {
    return (
      <span className="text-orange-500 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide">
        <i className="fas fa-circle text-[8px]"></i> BUSY
      </span>
    )
  }
  return (
    <span className="text-gray-400 font-medium text-xs flex items-center gap-1.5 uppercase tracking-wide">
      <i className="fas fa-circle text-[8px]"></i> OFFLINE
    </span>
  )
}
