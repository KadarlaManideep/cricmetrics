import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  from: number
  to: number
  total: number
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange, from, to, total }) => {
  if (totalPages <= 1 && total <= 10) return null

  const pages = getPageNumbers(page, totalPages)

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    height: 32,
    borderRadius: 6,
    border: '1.5px solid #E4E8F0',
    background: '#FFFFFF',
    color: '#5A6070',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '0 8px',
    transition: 'all 0.15s',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnBase,
    background: '#6C5CE7',
    borderColor: '#6C5CE7',
    color: '#FFFFFF',
    fontWeight: 700,
  }

  const disabledBtnStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.3,
    cursor: 'not-allowed',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 16, padding: '12px 4px' }}>
      <span style={{ fontSize: 12, color: '#9BA3B2' }}>
        Showing {from}–{to} of {total}
      </span>

      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          style={page === 1 ? disabledBtnStyle : btnBase}
          onClick={() => page > 1 && onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ ...btnBase, cursor: 'default', border: 'none', color: '#C8D0E0', background: 'transparent' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              style={p === page ? activeBtnStyle : btnBase}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          style={page === totalPages ? disabledBtnStyle : btnBase}
          onClick={() => page < totalPages && onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

export default Pagination
