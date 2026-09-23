import React, { useState } from 'react'
import HashTableStructure from './hash'
import styles from './ui.module.css'

type Row = {
  mode?: "insert" | "search"
  key?: string
  data?: string | number
  conflicts?: string | number
}

// Global because it's much easier to use it this way, let's see how that behaves with React
let hashTable: HashTableStructure<string, number> = new HashTableStructure(1009, 'openDoubleHashing')

export default function HashTable() {
  const [key, setKey] = useState("")
  const [data, setData] = useState("")
  const [rows, setRows] = useState<Row[]>([])
  const [error, setError] = useState<string | null>(null)

  const set = (key: string, data: number) => {
    const { conflicts, exist } = hashTable.insert(key, data)
    return { key, data, conflicts, exist }
  }

  const get = (key: string) => hashTable.search(key)


  const insert = () => {
    const keys = key.split("\n").map(k => k.trim()).filter(k => k.length > 0)
    const datum = data.split("\n").map(d => d.trim()).filter(d => d.length > 0).map(d => parseInt(d))

    if (keys.length === 0 || datum.length === 0 || datum.length !== keys.length) {
      setError("Enter one value per key: both boxes need the same number of lines.")
      return
    }
    setError(null)

    for (const key in keys) {
      const { data, conflicts, exist } = set(keys[key], datum[key])
      setRows(rows => ([...rows, { mode: "insert", key: keys[key], data, conflicts: exist ? "Key already exists" : conflicts }]))
    }

    clearInputFields()
  }

  const retrieve = () => {
    const keys = key.split("\n").map(k => k.trim()).filter(k => k.length > 0)
    if (keys.length === 0) {
      setError("Enter at least one key to look up.")
      return
    }
    setError(null)

    for (const key in keys) {
      const { found, elem, conflicts } = get(keys[key])
      setRows(rows => ([...rows, { mode: "search", key: keys[key], data: found ? elem!.data : "Not found", conflicts }]))
    }

    clearInputFields()
  }

  const resetTable = () => {
    setRows([])
    setError(null)
    clearInputFields()
    hashTable = new HashTableStructure(1009, 'openDoubleHashing')
  }

  const clearInputFields = () => {
    setKey("")
    setData("")
  }


  return <section className={styles.panel} aria-label="Hash table playground">
    <div className={`${styles.form} ${styles.hashForm}`}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="key">Keys</label>
        <textarea className={styles.input} rows={5} id="key" aria-describedby="keyHint" value={key} onChange={e => setKey(e.target.value)}></textarea>
        <small id="keyHint" className={styles.hint}>One alphanumeric key per line</small>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="data">Values</label>
        <textarea className={styles.input} rows={5} id="data" aria-describedby="dataHint" value={data} onChange={e => setData(e.target.value)}></textarea>
        <small id="dataHint" className={styles.hint}>One number per line, matching the keys. Not needed to look up.</small>
      </div>

      <div className={`${styles.actions} ${styles.fieldWide}`}>
        <button type="button" className={styles.primary} onClick={insert}>Insert</button>
        <button type="button" className={styles.secondary} onClick={retrieve}>Look up</button>
      </div>
    </div>

    {error && <p role="alert" className={styles.error}>{error}</p>}

    <div className={styles.results} aria-live="polite">
      {rows.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Operation</th>
              <th scope="col">Key</th>
              <th scope="col">Value</th>
              <th scope="col" className={styles.num}>Conflicts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => <tr key={i}>
              <td className={styles.index}>{i + 1}</td>
              <td>{row.mode === "insert" ? "Insert" : "Look up"}</td>
              <td>{row.key}</td>
              <td>{row.data}</td>
              <td className={styles.num}>{row.conflicts}</td>
            </tr>)}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>Nothing stored yet. Insert a few keys, then look them up.</p>
      )}
    </div>

    <div className={styles.footer}>
      <p className={styles.hint}>1009 slots, open addressing with double hashing.</p>
      <button type="button" className={styles.secondary} onClick={resetTable} disabled={rows.length === 0}>
        Empty the table
      </button>
    </div>
  </section>
}
