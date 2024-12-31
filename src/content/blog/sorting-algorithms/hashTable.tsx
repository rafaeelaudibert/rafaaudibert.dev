import React, { useState } from 'react'
import HashTableStructure from './hash'

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

  const set = (key: string, data: number) => {
    const { conflicts, exist } = hashTable.insert(key, data)
    return { key, data, conflicts, exist }
  }

  const get = (key: string) => hashTable.search(key)


  const insert = () => {
    const keys = key.split("\n").map(k => k.trim()).filter(k => k.length > 0)
    const datum = data.split("\n").map(d => d.trim()).filter(d => d.length > 0).map(d => parseInt(d))

    if (keys.length === 0 || datum.length === 0 || datum.length !== keys.length) {
      setRows(rows => ([...rows, { key: "BAD REQUEST -> FILL THE VALUES" }]))
      return
    }

    for (const key in keys) {
      const { data, conflicts, exist } = set(keys[key], datum[key])
      setRows(rows => ([...rows, { mode: "insert", key: keys[key], data, conflicts: exist ? "Key already exists" : conflicts }]))
    }

    clearInputFields()
  }

  const retrieve = () => {
    const keys = key.split("\n").map(k => k.trim()).filter(k => k.length > 0)
    if (keys.length === 0) {
      setRows(rows => ([...rows, { key: "BAD REQUEST -> FILL THE VALUES" }]))
      return
    }

    for (const key in keys) {
      const { found, elem, conflicts } = get(keys[key])
      setRows(rows => ([...rows, { mode: "search", key, data: found ? elem!.data : "[Not Found]", conflicts }]))
    }

    clearInputFields()
  }

  const resetTable = () => {
    setRows([])
    clearInputFields()
    hashTable = new HashTableStructure(1009, 'openDoubleHashing')
  }

  const clearInputFields = () => {
    setKey("")
    setData("")
  }


  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%", marginTop: "80px" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      <label htmlFor="key">Key(s)</label>
      <textarea rows={5} id="key" value={key} onChange={e => setKey(e.target.value)}></textarea>
      <small>Insert alphanumeric key values in each line</small>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      <label htmlFor="data">Value(s)</label>
      <textarea rows={5} id="data" value={data} onChange={e => setData(e.target.value)}></textarea>
      <small>Insert alphanumeric data values in each line</small>
    </div>

    <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
      <button onClick={insert}>Insert Key(s)/Value(s)</button>
      <button onClick={retrieve}>Retrieve Value(s)</button>
      <button onClick={resetTable} style={{ flexGrow: 1 }}>Reset HashTable</button>
    </div>

    <hr />

    <div style={{ width: "100%" }}>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Insertion or Search?</th>
            <th scope="col">Key</th>
            <th scope="col">Data</th>
            <th scope="col">Conflicts</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows.map((row, i) => <tr key={i}>
            <td>{i + 1}</td>
            <td>{row.mode === "insert" ? "Insertion" : "Search"}</td>
            <td>{row.key}</td>
            <td>{row.data}</td>
            <td>{row.conflicts}</td>
          </tr>) : (<tr>
            <td></td>
            <td colSpan={5}>Nothing here yet, you should make requests there, so that I can show u smth ⬆️</td>
          </tr>)}
        </tbody>
      </table>
    </div>

    <button onClick={resetTable}>Reset Table</button>
  </div>
}