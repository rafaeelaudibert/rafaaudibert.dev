import React, { useEffect, useRef, useState } from 'react'
import HashTableStructure from './hash'
import styles from './ui.module.css'
import { Segmented } from './ui'

type Result = {
  mode: "insert" | "search"
  key: string
  data: string | number
  conflicts: string | number
}

type Pair = { id: number; key: string; value: string }

type Mode = "insert" | "search"
const MODE_OPTIONS = [
  ["insert", "Insert"],
  ["search", "Look up"],
] as const

// Global because it's much easier to use it this way, let's see how that behaves with React
let hashTable: HashTableStructure<string, number> = new HashTableStructure(1009, 'openDoubleHashing')

let nextId = 0
const emptyPair = (): Pair => ({ id: nextId++, key: "", value: "" })
const INITIAL_PAIRS = 3

export default function HashTable() {
  const [mode, setMode] = useState<Mode>("insert")
  const [pairs, setPairs] = useState<Pair[]>(() => Array.from({ length: INITIAL_PAIRS }, emptyPair))
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState<string | null>(null)

  // Focus follows rows as they are added or removed
  const keyInputs = useRef(new Map<number, HTMLInputElement>())
  const [focusId, setFocusId] = useState<number | null>(null)
  useEffect(() => {
    if (focusId === null) return
    keyInputs.current.get(focusId)?.focus()
    setFocusId(null)
  }, [focusId])

  const update = (id: number, field: "key" | "value", text: string) =>
    setPairs(pairs => pairs.map(p => p.id === id ? { ...p, [field]: text } : p))

  const addPair = () => {
    const pair = emptyPair()
    setPairs(pairs => [...pairs, pair])
    setFocusId(pair.id)
  }

  const removePair = (index: number) => {
    const remaining = pairs.filter((_, i) => i !== index)
    const next = remaining.length > 0 ? remaining : [emptyPair()]
    setPairs(next)
    setFocusId(next[Math.max(0, index - 1)].id)
  }

  const filled = () => pairs
    .map((p, i) => ({ ...p, row: i + 1, key: p.key.trim(), value: p.value.trim() }))
    .filter(p => p.key.length > 0)

  const insert = () => {
    const entries = filled()
    if (entries.length === 0) {
      setError("Enter at least one key and value to insert.")
      return
    }
    const invalid = entries.find(p => !/^-?\d+$/.test(p.value))
    if (invalid) {
      setError(`Row ${invalid.row} needs a whole number as its value.`)
      return
    }
    setError(null)

    const inserted = entries.map(({ key, value }) => {
      const data = parseInt(value)
      const { conflicts, exist } = hashTable.insert(key, data)
      return { mode: "insert" as const, key, data, conflicts: exist ? "Key already exists" : conflicts }
    })
    setResults(results => [...results, ...inserted])
  }

  const retrieve = () => {
    const entries = filled()
    if (entries.length === 0) {
      setError("Enter at least one key to look up.")
      return
    }
    setError(null)

    const found = entries.map(({ key }) => {
      const { found, elem, conflicts } = hashTable.search(key)
      return { mode: "search" as const, key, data: found ? elem!.data : "Not found", conflicts }
    })
    setResults(results => [...results, ...found])
  }

  const resetTable = () => {
    setResults([])
    setError(null)
    setPairs(Array.from({ length: INITIAL_PAIRS }, emptyPair))
    hashTable = new HashTableStructure(1009, 'openDoubleHashing')
  }

  const changeMode = (next: Mode) => {
    setMode(next)
    setError(null)
  }

  // Enter in the last field of the last row starts a new row, so a list can be
  // typed without the mouse
  const onLastFieldKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Enter" && index === pairs.length - 1) {
      e.preventDefault()
      addPair()
    }
  }

  const inserting = mode === "insert"
  const count = pairs.filter(p => p.key.trim().length > 0).length
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`

  return <section className={styles.panel} aria-label="Hash table playground">
    <div className={styles.form}>
      <Segmented label="Mode" options={MODE_OPTIONS} value={mode} onChange={changeMode} />

      <div
        className={`${styles.pairs} ${inserting ? "" : styles.keysOnly}`}
        role="group"
        aria-label={inserting ? "Keys and values to insert" : "Keys to look up"}
      >
        <span className={styles.label} aria-hidden="true">Key</span>
        {inserting && <span className={styles.label} aria-hidden="true">Value</span>}
        <span />
        {pairs.map((pair, i) => (
          <React.Fragment key={pair.id}>
            <input
              ref={el => { if (el) keyInputs.current.set(pair.id, el); else keyInputs.current.delete(pair.id) }}
              className={styles.input}
              type="text"
              aria-label={`Key ${i + 1}`}
              placeholder={i === 0 ? "Freddie Mercury" : undefined}
              value={pair.key}
              onChange={e => update(pair.id, "key", e.target.value)}
              onKeyDown={inserting ? undefined : e => onLastFieldKeyDown(e, i)}
            />
            {inserting && (
              <input
                className={`${styles.input} ${styles.numeric}`}
                type="text"
                inputMode="numeric"
                aria-label={`Value ${i + 1}`}
                placeholder={i === 0 ? "1946" : undefined}
                value={pair.value}
                onChange={e => update(pair.id, "value", e.target.value)}
                onKeyDown={e => onLastFieldKeyDown(e, i)}
              />
            )}
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove row ${i + 1}`}
              onClick={() => removePair(i)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className={styles.actions}>
        {inserting
          ? <button type="button" className={styles.primary} onClick={insert}>
              {count > 0 ? `Insert ${plural(count, "pair")}` : "Insert"}
            </button>
          : <button type="button" className={styles.primary} onClick={retrieve}>
              {count > 0 ? `Look up ${plural(count, "key")}` : "Look up"}
            </button>}
        <button type="button" className={styles.ghost} onClick={addPair}>+ Add row</button>
      </div>
    </div>

    {error && <p role="alert" className={styles.error}>{error}</p>}

    <div className={styles.results} aria-live="polite">
      {results.length > 0 ? (
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
            {results.map((row, i) => <tr key={i}>
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
      <button type="button" className={styles.secondary} onClick={resetTable} disabled={results.length === 0}>
        Empty the table
      </button>
    </div>
  </section>
}
