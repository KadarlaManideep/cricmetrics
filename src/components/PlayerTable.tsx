import React, { useMemo, useState } from 'react'

type Column<T> = {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

type Props<T> = {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchKey?: keyof T
  onRowClick?: (row: T) => void
}

function PlayerTable<T extends Record<string, any>>({ data, columns, searchable, searchKey, onRowClick }: Props<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [desc, setDesc] = useState(true)

  const filtered = useMemo(() => {
    let out = data.slice()
    if (query && searchKey) {
      out = out.filter((r) => String(r[searchKey]).toLowerCase().includes(query.toLowerCase()))
    }
    if (sortKey) {
      out.sort((a,b)=>{
        const av = a[sortKey as string]
        const bv = b[sortKey as string]
        if (av === bv) return 0
        if (av == null) return 1
        if (bv == null) return -1
        if (typeof av === 'number' && typeof bv === 'number') return desc ? bv - av : av - bv
        return desc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv))
      })
    }
    return out
  }, [data, query, sortKey, desc, searchKey])

  return (
    <div>
      {searchable && searchKey && (
        <div style={{marginBottom:8}}>
          <input placeholder="Search" className="search-input" value={query} onChange={(e)=>setQuery(e.target.value)} />
        </div>
      )}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c)=>(
                <th key={c.label} onClick={()=>{
                  const k = c.key as string
                  if (sortKey === k) setDesc(!desc)
                  else { setSortKey(k); setDesc(true) }
                }} style={{cursor:'pointer'}}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx)=> (
              <tr key={idx} className="player-row" onClick={()=>onRowClick?.(row)}>
                {columns.map((c, i)=>(
                  <td key={i}>{c.render ? c.render(row) : String((row as any)[c.key as string])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlayerTable
