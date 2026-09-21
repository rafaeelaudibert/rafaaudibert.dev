import { useState } from 'react'
import { capture } from '../../../utils/analytics'
import type { ArrayType } from './sorting'

/** Shape returned by /api/sorting/*; errors carry `error` instead. */
type SortResponse = { size: number; changes: number; error?: string }


const capitalize = (str: string) => str.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")

type Data = {
  sortingAlgorithm: string
  arrayType: string
  arraySize: number
  time: string
  changes: number
}

/** Select values: shell sort carries its gap sequence as a suffix. */
type AlgorithmChoice =
  | "bubble-sort" | "insertion-sort" | "binary-insertion-sort"
  | "shell-sort/0" | "shell-sort/1" | "shell-sort/2"
  | "quick-sort" | "merge-sort" | "radix-sort"

// Whitespace because it's concatenating with the sorting algorithm name
const SHELL_TYPE_MAP = {
  "": "",
  "0": " (Shell)",
  "1": " (Knuth)",
  "2": " (Tokuda)"
}

type Props = {
  extended?: boolean
}

export default function SortingTable({ extended = false }: Props) {
  const [sortingAlgorithm, setSortingAlgorithm] = useState<AlgorithmChoice>("bubble-sort")
  const [arrayType, setArrayType] = useState<ArrayType>("sorted")
  const [arraySize, setArraySize] = useState(100)
  const [customField, setCustomField] = useState("")
  const [data, setData] = useState<Data[]>([])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const [parsedSortingAlgorithm, shellType = ""] = sortingAlgorithm.split("/")

    const custom = arrayType === "custom"
      ? customField.split(" ").map(x => parseInt(x)).filter(x => !Number.isNaN(x))
      : []

    if (arrayType === "custom" && custom.length === 0) return

    const params = new URLSearchParams(
      arrayType === "custom"
        ? { array: custom.join(","), type: shellType || "0" }
        : { size: String(arraySize), type: shellType || "0" },
    )
    const url = `/api/sorting/${arrayType}/${parsedSortingAlgorithm}?${params}`

    setError(null)
    setPending(true)

    // The sort runs in the Worker. Workers freeze the clock during synchronous
    // execution, so the server cannot time itself - we measure the round trip
    // here instead, which necessarily includes network latency.
    const start = performance.now()
    let size: number
    let changes: number
    try {
      const res = await fetch(url)
      const body = (await res.json()) as SortResponse
      if (!res.ok) {
        setError(body?.error ?? `Request failed (${res.status})`)
        return
      }
      ;({ size, changes } = body)
    } catch {
      setError("Could not reach the sorting service. Check your connection and try again.")
      return
    } finally {
      setPending(false)
    }
    const time = `${((performance.now() - start) / 1000).toFixed(3)} s`

    capture("sorting playground run", {
      algorithm: parsedSortingAlgorithm,
      shell_sequence: shellType || undefined,
      array_type: arrayType,
      array_size: size,
      changes,
      duration_seconds: Number.parseFloat(time),
    })

    setData([
      ...data,
      {
        sortingAlgorithm: capitalize(parsedSortingAlgorithm.split("-").join(" ")) + SHELL_TYPE_MAP[shellType as keyof typeof SHELL_TYPE_MAP],
        arrayType: capitalize(arrayType),
        arraySize: size,
        time,
        changes,
      }])
    clearInputFields()
  }

  const resetTable = () => {
    setData([])
    clearInputFields()
  }

  const clearInputFields = () => {
    setArraySize(100)
    setCustomField("")
  }


  return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", width: "100%" }}>
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "1rem" }}>
      <div style={{ flexGrow: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <label htmlFor="sortingAlgorithm">Sorting Algorithm</label>
        <select id="sortingAlgorithm" value={sortingAlgorithm} onChange={e => setSortingAlgorithm(e.target.value as AlgorithmChoice)} style={{ width: "100%" }}>
          <option value='bubble-sort'>Bubble Sort</option>
          <option value='insertion-sort'>Insertion Sort</option>
          <option value='binary-insertion-sort'>Binary Insertion Sort</option>
          <option value='shell-sort/0'>Shell Sort - Shell Sequence</option>
          <option value='shell-sort/1'>Shell Sort - Knuth Sequence</option>
          <option value='shell-sort/2'>Shell Sort - Tokuda Sequence</option>
          {extended && <option value='quick-sort'>Quick Sort</option>}
          {extended && <option value='merge-sort'>Merge Sort</option>}
          {extended && <option value='radix-sort'>Radix Sort</option>}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "45%" }}>
        <label htmlFor="arrayType">Array Type</label>
        <select id="arrayType" value={arrayType} onChange={e => setArrayType(e.target.value as ArrayType)} style={{ width: "100%" }}>
          <option value='sorted'>Sorted Array</option>
          <option value='reversed'>Reversed Array</option>
          <option value='random'>Random Array</option>
          <option value='custom'>Custom Array</option>
        </select>
      </div>

      <div style={{ display: arrayType === "custom" ? "none" : "flex", flexDirection: "column", alignItems: "flex-start", flexGrow: 2 }}>
        <label htmlFor="arraySize">Array Size</label>
        <input type="text" id="arraySize" value={arraySize} onChange={e => setArraySize(parseInt(e.target.value))} style={{ width: "100%" }} />
      </div>
      <div style={{ display: arrayType === "custom" ? "flex" : "none", flexDirection: "column", alignItems: "flex-start", flexGrow: 2 }}>
        <label htmlFor="customField">Custom field</label>
        <input type="text" id="customField" placeholder="1 2 3 4" value={customField} onChange={e => setCustomField(e.target.value)} style={{ width: "100%" }} />
      </div>
    </div>


    <button onClick={submit} disabled={pending} style={{ width: "50%" }}>
      {pending ? "Sorting…" : "Run"}
    </button>

    {error && (
      <p role="alert" style={{ margin: 0, padding: "0.5rem 1rem", width: "100%", textAlign: "center", border: "1px solid currentColor", borderRadius: "0.5rem" }}>
        {error}
      </p>
    )}

    <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.75, textAlign: "center" }}>
      Sorting runs on the server. The time shown is the full round trip, so it
      includes network latency — expect a floor of roughly 0.1s however small
      the array is.
    </p>

    <hr />

    <div style={{ width: "100%" }}>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Sorting Algorithm</th>
            <th scope="col">Array Type</th>
            <th scope="col">Array Size</th>
            <th scope="col">Time</th>
            <th scope="col">Changes</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((d, i) => <tr key={i}>
            <td>{i + 1}</td>
            <td>{d.sortingAlgorithm}</td>
            <td>{d.arrayType}</td>
            <td>{d.arraySize}</td>
            <td>{d.time}</td>
            <td>{d.changes}</td>
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