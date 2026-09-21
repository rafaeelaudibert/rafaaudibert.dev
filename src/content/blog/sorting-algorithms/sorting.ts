/**
 * Sorting algorithms backing the playground in this post.
 *
 * These run in the browser rather than server-side, and deliberately so:
 * edge runtimes freeze the clock during synchronous execution as a Spectre
 * mitigation, so performance.now() would not advance across a sort and every
 * run would report 0s. Only a real monotonic clock makes these numbers mean
 * anything, which means measuring on the client.
 *
 * Each algorithm keeps its own idiosyncratic definition of "changes" - see the
 * individual functions, they are not directly comparable to each other.
 */

export type SortingAlgorithm =
  | 'bubble-sort'
  | 'insertion-sort'
  | 'binary-insertion-sort'
  | 'shell-sort'
  | 'quick-sort'
  | 'merge-sort'
  | 'radix-sort'

export type ArrayType = 'sorted' | 'reversed' | 'random' | 'custom'

export type SortResult = {
  /** Algorithm-specific operation count; see each implementation. */
  changes: number
  /** Seconds, e.g. "0.005066171 s". */
  time: string
}

/* ------------------------------------------------------------------ arrays */

export const createSortedArray = (size: number): number[] =>
  Array.from({ length: size }, (_, i) => i)

export const createReversedArray = (size: number): number[] =>
  Array.from({ length: size }, (_, i) => size - i - 1)

export const createRandomArray = (size: number): number[] => {
  // Fisher-Yates shuffle over a sorted array.
  const array = createSortedArray(size)
  for (let s = size; s > 0; s--) {
    const index = Math.floor(Math.random() * s)
    const temp = array[s - 1]
    array[s - 1] = array[index]
    array[index] = temp
  }
  return array
}

export const buildArray = (type: ArrayType, size: number, custom: number[]): number[] => {
  switch (type) {
    case 'sorted': return createSortedArray(size)
    case 'reversed': return createReversedArray(size)
    case 'random': return createRandomArray(size)
    case 'custom': return [...custom]
  }
}

/* -------------------------------------------------------------------- utils */

const swap = (array: number[], i: number, j: number) => {
  const temp = array[i]
  array[i] = array[j]
  array[j] = temp
}

/** Renders milliseconds as seconds, e.g. "0.005066171 s". */
const seconds = (ms: number): string => `${(ms / 1000).toFixed(9)} s`

/* --------------------------------------------------------------- algorithms */

/** changes = element swaps. */
const bubbleSort = (array: number[]): number => {
  let changes = 0
  let m = array.length - 1
  let k = 1
  let changed = false

  do {
    changed = false
    for (let i = 0; i < m; i++) {
      if (array[i] > array[i + 1]) {
        swap(array, i, i + 1)
        k = i
        changed = true
        changes++
      }
    }
    m = k
  } while (changed)

  return changes
}

/** changes = element shifts, not swaps. */
const insertionSort = (array: number[]): number => {
  let changes = 0
  for (let j = 1; j < array.length; j++) {
    const key = array[j]
    let i = j - 1
    while (i >= 0 && array[i] > key) {
      array[i + 1] = array[i]
      i--
      changes++
    }
    array[i + 1] = key
  }
  return changes
}

const binarySearch = (array: number[], inf: number, sup: number, key: number): number => {
  const half = inf + Math.floor((sup - inf) / 2)
  if (inf === sup) return inf
  if (key > array[half]) return binarySearch(array, half + 1, sup, key)
  if (key < array[half]) return binarySearch(array, inf, half, key)
  return half
}

/** Shifts still dominate; the binary search only reduces comparisons. */
const binaryInsertionSort = (array: number[]): number => {
  let changes = 0
  for (let j = 1; j < array.length; j++) {
    const key = array[j]
    let i = j - 1
    const position = binarySearch(array, 0, j, key)
    while (i >= position) {
      array[i + 1] = array[i]
      i--
      changes++
    }
    array[position] = key
  }
  return changes
}

export type ShellSequence = '0' | '1' | '2'

/** Shell (1959), Knuth (1971) and Tokuda (1992) gap sequences. */
const generateGapSequence = (maxElem: number, type: ShellSequence): number[] => {
  const seq: number[] = []
  let e = 1
  let numElems = 1

  switch (type) {
    case '0': // 1, 2, 4, 8, 16, 32, ...
      while (e < maxElem) { e *= 2; numElems++ }
      numElems--
      e = 1
      for (let i = 0; i < numElems; i++, e = e << 1) seq[i] = e
      break
    case '1': // 1, 4, 13, 40, 121, 364, ...
      while (e < maxElem) { e = e * 3 + 1; numElems++ }
      numElems--
      e = 1
      for (let i = 0; i < numElems; i++, e = 3 * e + 1) seq[i] = e
      break
    case '2': // 1, 4, 9, 20, 46, 103, ...
      numElems = 0
      while (e < maxElem) {
        e = Math.ceil((9.0 * Math.pow(9.0, numElems) / Math.pow(4.0, numElems) - 4.0) / 5.0)
        numElems++
      }
      numElems--
      for (let i = 0; i < numElems; i++) {
        seq[i] = Math.ceil((9.0 * Math.pow(9.0, i) / Math.pow(4.0, i) - 4.0) / 5.0)
      }
      break
  }

  return seq
}

const gappedInsertionSort = (array: number[], h: number, f: number): number => {
  let changes = 0
  for (let j = f + h; j < array.length; j += h) {
    const key = array[j]
    let i = j - h
    while (i >= 0 && array[i] > key) {
      array[i + h] = array[i]
      i -= h
      changes++
    }
    array[i + h] = key
  }
  return changes
}

/**
 * Walks the gap sequence from largest to smallest, running a gapped insertion
 * pass at each h. The big gaps move elements a long way cheaply, so by the time
 * h reaches 1 the array is nearly sorted and the final pass is almost free.
 */
const shellSort = (array: number[], type: ShellSequence): number => {
  const sequence = generateGapSequence(array.length, type)
  let changes = 0

  for (let i = sequence.length - 1; i >= 0; i--) {
    const h = sequence[i]
    for (let f = 0; f < h; f++) changes += gappedInsertionSort(array, h, f)
  }

  return changes
}

const partition = (array: number[], pi: number, pf: number): { i: number; changes: number } => {
  const random = Math.floor(pi + Math.random() * (pf - pi))
  const p = pf
  let i = pi - 1
  let changes = 0

  swap(array, random, pf) // random pivot

  for (let j = pi; j <= pf - 1; j++) {
    if (array[j] <= array[p]) {
      changes++
      i++
      swap(array, i, j)
    }
  }

  changes++
  i++
  swap(array, i, p)
  return { i, changes }
}

const recursiveQuickSort = (array: number[], pi: number, pf: number): number => {
  let total = 0
  if (pf > pi) {
    const { i, changes } = partition(array, pi, pf)
    total += recursiveQuickSort(array, pi, i - 1)
    total += recursiveQuickSort(array, i + 1, pf)
    total += changes
  }
  return total
}

const quickSort = (array: number[]): number => recursiveQuickSort(array, 0, array.length - 1)

const merge = (array: number[], aux: number[], pi: number, m: number, pf: number): number => {
  let changes = 0
  for (let k = pi; k <= pf; k++) aux[k] = array[k]

  let j = m + 1
  let left = pi
  for (let k = pi; k <= pf; k++, changes++) {
    if (left > m) array[k] = aux[j++]
    else if (j > pf) array[k] = aux[left++]
    else if (aux[left] <= aux[j]) array[k] = aux[left++]
    else array[k] = aux[j++]
  }

  return changes
}

const recursiveMergeSort = (array: number[], aux: number[], pi: number, pf: number): number => {
  let changes = 0
  if (pf > pi) {
    const m = Math.floor((pi + pf) / 2)
    changes += recursiveMergeSort(array, aux, pi, m)
    changes += recursiveMergeSort(array, aux, m + 1, pf)
    changes += merge(array, aux, pi, m, pf)
  }
  return changes
}

const mergeSort = (array: number[]): number =>
  recursiveMergeSort(array, new Array(array.length), 0, array.length - 1)

const MAX_DIGITS = 6

const digit = (value: number, position: number): number =>
  Math.floor((value % Math.pow(10, position + 1)) / Math.pow(10, position))

/** Distribution sort: changes stays 0, since it performs no comparisons. */
const radixSort = (array: number[]): number => {
  const C = new Array(10)
  const B = new Array(array.length)

  for (let d = 0; d < MAX_DIGITS; d++) {
    for (let i = 0; i < 10; i++) C[i] = 0
    for (let i = 0; i < array.length; i++) C[digit(array[i], d)]++
    for (let i = 1; i < 10; i++) C[i] += C[i - 1]
    for (let i = array.length - 1; i >= 0; i--) {
      const dj = digit(array[i], d)
      B[C[dj] - 1] = array[i]
      C[dj]--
    }
    for (let i = 0; i < array.length; i++) array[i] = B[i]
  }

  return 0
}

/* ------------------------------------------------------------------ runner */

/**
 * Sorts `array` in place and times it. The array is mutated, so callers that
 * need the original should pass a copy.
 */
export const runSort = (
  algorithm: SortingAlgorithm,
  array: number[],
  shellType: ShellSequence = '0',
): SortResult => {
  const start = performance.now()

  let changes: number
  switch (algorithm) {
    case 'bubble-sort': changes = bubbleSort(array); break
    case 'insertion-sort': changes = insertionSort(array); break
    case 'binary-insertion-sort': changes = binaryInsertionSort(array); break
    case 'shell-sort': changes = shellSort(array, shellType); break
    case 'quick-sort': changes = quickSort(array); break
    case 'merge-sort': changes = mergeSort(array); break
    case 'radix-sort': changes = radixSort(array); break
  }

  return { changes, time: seconds(performance.now() - start) }
}
