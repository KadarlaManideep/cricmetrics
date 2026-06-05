import { useState, useEffect } from 'react'

export interface PaginationResult<T> {
  page: number
  setPage: (p: number) => void
  pageData: T[]
  totalPages: number
  from: number
  to: number
  total: number
  offset: number
}

export function usePagination<T>(data: T[], pageSize = 10): PaginationResult<T> {
  const [page, setPage] = useState(1)

  // Reset to page 1 whenever the source data changes (filter/sort changed)
  useEffect(() => {
    setPage(1)
  }, [data])

  const total = data.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const offset = (safePage - 1) * pageSize
  const pageData = data.slice(offset, offset + pageSize)

  return {
    page: safePage,
    setPage,
    pageData,
    totalPages,
    from: total === 0 ? 0 : offset + 1,
    to: Math.min(offset + pageSize, total),
    total,
    offset,
  }
}
