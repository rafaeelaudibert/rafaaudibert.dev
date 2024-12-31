// This file is used to parse the CSV files into a format that can be used in the UI
// Note that TS can't detect them correctly but we're exporting them with a proper type

// @ts-expect-error
import bubbleSortRandomRaw from './assets/csv/bubbleRandom.csv'
// @ts-expect-error
import bubbleSortReversedRaw from './assets/csv/bubbleReversed.csv'
// @ts-expect-error
import bubbleSortSortedRaw from './assets/csv/bubbleSorted.csv'

// @ts-expect-error
import insertionSortRandomRaw from './assets/csv/insertionRandom.csv'
// @ts-expect-error
import insertionSortReversedRaw from './assets/csv/insertionReversed.csv'
// @ts-expect-error
import insertionSortSortedRaw from './assets/csv/insertionSorted.csv'

// @ts-expect-error
import binaryInsertionSortRandomRaw from './assets/csv/binaryInsertionRandom.csv'
// @ts-expect-error
import binaryInsertionSortReversedRaw from './assets/csv/binaryInsertionReversed.csv'
// @ts-expect-error
import binaryInsertionSortSortedRaw from './assets/csv/binaryInsertionSorted.csv'

// @ts-expect-error
import shellSort0RandomRaw from './assets/csv/shell0Random.csv'
// @ts-expect-error
import shellSort0ReversedRaw from './assets/csv/shell0Reversed.csv'
// @ts-expect-error
import shellSort0SortedRaw from './assets/csv/shell0Sorted.csv'

// @ts-expect-error
import shellSort1RandomRaw from './assets/csv/shell1Random.csv'
// @ts-expect-error
import shellSort1ReversedRaw from './assets/csv/shell1Reversed.csv'
// @ts-expect-error
import shellSort1SortedRaw from './assets/csv/shell1Sorted.csv'

// @ts-expect-error
import shellSort2RandomRaw from './assets/csv/shell2Random.csv'
// @ts-expect-error
import shellSort2ReversedRaw from './assets/csv/shell2Reversed.csv'
// @ts-expect-error
import shellSort2SortedRaw from './assets/csv/shell2Sorted.csv'

// @ts-expect-error
import quickSortRaw from './assets/csv/quickSort200.csv'
// @ts-expect-error
import mergeSortRaw from './assets/csv/mergeSort200.csv'
// @ts-expect-error
import radixSortRaw from './assets/csv/radixSort200.csv'

// @ts-expect-error
import quickSortFilesRaw from './assets/csv/quickSortFiles200.csv'
// @ts-expect-error
import mergeArraysFilesRaw from './assets/csv/mergeArrays200.csv'
// @ts-expect-error
import selectionTreeFilesRaw from './assets/csv/selectionTree200.csv'

// @ts-expect-error
import hashRaw from './assets/csv/hash.csv'

// CSVs are in format Iteration, Array Size, Swaps, Time
type SortingAlgorithmData = {
    "Iteration": string
    " Array Size": string
    " Swaps": string
    " Time": string
}

export type ParsedSortingAlgorithmData = {
    iteration: number
    arraySize: number
    swaps: number
    time: number
}

const parseSortingAlgorithmData = (data: SortingAlgorithmData[]) => {
    return data.map((row) => ({
        iteration: parseInt(row["Iteration"]),
        arraySize: parseInt(row[" Array Size"]),
        swaps: parseInt(row[" Swaps"]),
        time: parseFloat(row[" Time"]) || 0.00000001
    }))
}

export const bubbleSortRandom = parseSortingAlgorithmData(bubbleSortRandomRaw)
export const bubbleSortReversed = parseSortingAlgorithmData(bubbleSortReversedRaw)
export const bubbleSortSorted = parseSortingAlgorithmData(bubbleSortSortedRaw)

export const insertionSortRandom = parseSortingAlgorithmData(insertionSortRandomRaw)
export const insertionSortReversed = parseSortingAlgorithmData(insertionSortReversedRaw)
export const insertionSortSorted = parseSortingAlgorithmData(insertionSortSortedRaw)

export const binaryInsertionSortRandom = parseSortingAlgorithmData(binaryInsertionSortRandomRaw)
export const binaryInsertionSortReversed = parseSortingAlgorithmData(binaryInsertionSortReversedRaw)
export const binaryInsertionSortSorted = parseSortingAlgorithmData(binaryInsertionSortSortedRaw)

export const shellSort0Random = parseSortingAlgorithmData(shellSort0RandomRaw)
export const shellSort0Reversed = parseSortingAlgorithmData(shellSort0ReversedRaw)
export const shellSort0Sorted = parseSortingAlgorithmData(shellSort0SortedRaw)

export const shellSort1Random = parseSortingAlgorithmData(shellSort1RandomRaw)
export const shellSort1Reversed = parseSortingAlgorithmData(shellSort1ReversedRaw)
export const shellSort1Sorted = parseSortingAlgorithmData(shellSort1SortedRaw)

export const shellSort2Random = parseSortingAlgorithmData(shellSort2RandomRaw)
export const shellSort2Reversed = parseSortingAlgorithmData(shellSort2ReversedRaw)
export const shellSort2Sorted = parseSortingAlgorithmData(shellSort2SortedRaw)

// Recursive sorting algorithms are slightly different, as they have more data per row
type RecursiveSortingAlgorithmData = {
    "Numbers per File": string
    " Recursive Calls": string
    " Time": string
    " Recursive Calls Average": string
    " Time Average": string
    " Calls Standard Deviation": string
    " Timer Standard Deviation": string
}

export type ParsedRecursiveSortingAlgorithmData = {
    arraySize: number
    recursiveCalls: number
    time: number
    recursiveCallsAverage: number
    timeAverage: number
    callsStandardDeviation: number
    timerStandardDeviation: number
}

const parseRecursiveSortingAlgorithmData = (data: RecursiveSortingAlgorithmData[]) => {
    return data.map((row) => ({
        arraySize: parseInt(row["Numbers per File"]),
        recursiveCalls: parseInt(row[" Recursive Calls"]),
        time: parseFloat(row[" Time"]) || 0.00000001,
        recursiveCallsAverage: parseInt(row[" Recursive Calls Average"]),
        timeAverage: parseFloat(row[" Time Average"]) || 0.00000001,
        callsStandardDeviation: parseFloat(row[" Calls Standard Deviation"]) || 0.00000001,
        timerStandardDeviation: parseFloat(row[" Timer Standard Deviation"]) || 0.00000001
    }))
}

export const quickSortData = parseRecursiveSortingAlgorithmData(quickSortRaw)
export const mergeSortData = parseRecursiveSortingAlgorithmData(mergeSortRaw)
export const radixSortData = parseRecursiveSortingAlgorithmData(radixSortRaw)

// File-based sorting algorithms
// Numbers per File, Time, Time Per File, Output Size
type FileSortingAlgorithmData = {
    "Numbers per File": string
    " Time": string
    " Time Per File": string
    " Output Size": string
}

export type ParsedFileSortingAlgorithmData = {
    arraySize: number
    time: number
    timePerFile: number
    outputSize: number
}

const parseFileSortingAlgorithmData = (data: FileSortingAlgorithmData[]) => {
    return data.map((row) => ({
        arraySize: parseInt(row["Numbers per File"]),
        time: parseFloat(row[" Time"]) || 0.00000001,
        timePerFile: parseFloat(row[" Time Per File"]) || 0.00000001,
        outputSize: parseInt(row[" Output Size"])
    }))
}

export const quickSortFilesData = parseFileSortingAlgorithmData(quickSortFilesRaw)
export const mergeArraysFilesData = parseFileSortingAlgorithmData(mergeArraysFilesRaw)
export const selectionTreeFilesData = parseFileSortingAlgorithmData(selectionTreeFilesRaw)