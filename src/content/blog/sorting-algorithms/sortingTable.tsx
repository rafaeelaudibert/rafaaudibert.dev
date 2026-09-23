import { useState } from 'react'
import { capture } from '../../../utils/analytics'
import type { ArrayType } from './sorting'
import styles from './ui.module.css'

/** Shape returned by /api/sorting/*; errors carry `error` instead. */
type SortResponse = { size: number; changes: number; error?: string }


const sentenceCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

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
  "0": ", Shell sequence",
  "1": ", Knuth sequence",
  "2": ", Tokuda sequence"
}

/** The Worker rejects anything bigger; the quadratic sorts exceed its CPU budget. */
const MAX_SIZE = 25000

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

    if (arrayType === "custom" && custom.length === 0) {
      setError("Enter at least one number, separated by spaces.")
      return
    }
    if (arrayType !== "custom" && !(arraySize >= 1 && arraySize <= MAX_SIZE)) {
      setError(`Enter a size between 1 and ${MAX_SIZE.toLocaleString("en-US")}.`)
      return
    }

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
        sortingAlgorithm: sentenceCase(parsedSortingAlgorithm.split("-").join(" ")) + SHELL_TYPE_MAP[shellType as keyof typeof SHELL_TYPE_MAP],
        arrayType: sentenceCase(arrayType),
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


  return <section className={styles.panel} aria-label="Sorting playground">
    <form className={`${styles.form} ${styles.sortForm}`} onSubmit={e => { e.preventDefault(); submit() }}>
      <div className={`${styles.field} ${styles.fieldWide}`}>
        <label className={styles.label} htmlFor="sortingAlgorithm">Algorithm</label>
        <select className={styles.input} id="sortingAlgorithm" value={sortingAlgorithm} onChange={e => setSortingAlgorithm(e.target.value as AlgorithmChoice)}>
          <option value='bubble-sort'>Bubble sort</option>
          <option value='insertion-sort'>Insertion sort</option>
          <option value='binary-insertion-sort'>Binary insertion sort</option>
          <option value='shell-sort/0'>Shell sort, Shell sequence</option>
          <option value='shell-sort/1'>Shell sort, Knuth sequence</option>
          <option value='shell-sort/2'>Shell sort, Tokuda sequence</option>
          {extended && <option value='quick-sort'>Quick sort</option>}
          {extended && <option value='merge-sort'>Merge sort</option>}
          {extended && <option value='radix-sort'>Radix sort</option>}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="arrayType">Input</label>
        <select className={styles.input} id="arrayType" value={arrayType} onChange={e => setArrayType(e.target.value as ArrayType)}>
          <option value='sorted'>Sorted</option>
          <option value='reversed'>Reversed</option>
          <option value='random'>Random</option>
          <option value='custom'>Custom numbers</option>
        </select>
      </div>

      {arrayType === "custom" ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="customField">Numbers</label>
          <input className={styles.input} type="text" id="customField" placeholder="5 3 8 1" aria-describedby="customFieldHint" value={customField} onChange={e => setCustomField(e.target.value)} />
          <span id="customFieldHint" className="sr-only">Separate numbers with spaces</span>
        </div>
      ) : (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="arraySize">Size</label>
          <input className={styles.input} type="number" inputMode="numeric" min={1} max={MAX_SIZE} id="arraySize" value={Number.isNaN(arraySize) ? "" : arraySize} onChange={e => setArraySize(parseInt(e.target.value))} />
        </div>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={pending}>
          {pending ? "Sorting…" : "Run"}
        </button>
      </div>
    </form>

    {error && <p role="alert" className={styles.error}>{error}</p>}

    <div className={styles.results} aria-live="polite">
      {data.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Algorithm</th>
              <th scope="col">Input</th>
              <th scope="col" className={styles.num}>Size</th>
              <th scope="col" className={styles.num}>Time</th>
              <th scope="col" className={styles.num}>Changes</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => <tr key={i}>
              <td className={styles.index}>{i + 1}</td>
              <td>{d.sortingAlgorithm}</td>
              <td>{d.arrayType}</td>
              <td className={styles.num}>{d.arraySize.toLocaleString("en-US")}</td>
              <td className={styles.num}>{d.time}</td>
              <td className={styles.num}>{d.changes.toLocaleString("en-US")}</td>
            </tr>)}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>No runs yet. Pick an algorithm and an input, then press Run.</p>
      )}
    </div>

    <div className={styles.footer}>
      <p className={styles.hint}>
        Sorting runs on a Cloudflare Worker. Time is the full round trip, so
        expect a floor of about 0.1 s however small the array.
      </p>
      <button type="button" className={styles.secondary} onClick={resetTable} disabled={data.length === 0}>
        Clear results
      </button>
    </div>
  </section>
}
