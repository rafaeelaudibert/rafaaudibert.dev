import React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import {
  BarPlot,
  ChartsGrid,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  MarkPlot,
  ChartsDataProvider,
  ChartsSurface,
  ChartsWrapper,
} from "@mui/x-charts"
import type {
  ParsedRecursiveSortingAlgorithmData,
  ParsedSortingAlgorithmData,
} from "./csv"
import {
  binaryInsertionSortRandom,
  binaryInsertionSortReversed,
  binaryInsertionSortSorted,
  bubbleSortRandom,
  bubbleSortReversed,
  shellSort0Sorted,
  shellSort1Random,
  bubbleSortSorted,
  insertionSortRandom,
  insertionSortReversed,
  insertionSortSorted,
  shellSort1Reversed,
  shellSort0Reversed,
  shellSort0Random,
  shellSort1Sorted,
  shellSort2Random,
  shellSort2Reversed,
  shellSort2Sorted,
  quickSortData,
  mergeSortData,
  radixSortData,
  quickSortFilesData,
  mergeArraysFilesData,
  selectionTreeFilesData,
  hashData,
} from "./csv"
import { ChartFigure, Segmented, usePalette } from "./ui"

const toSeriesFormatter = (formatter?: (v: number) => string) =>
  formatter ? (v: number | null) => (v == null ? "" : formatter(v)) : undefined

const trimZero = (s: string) => s.replace(/\.0$/, "")

const formatCompact = (value: number): string => {
  const abs = Math.abs(value)
  if (abs >= 1e9) return `${trimZero((value / 1e9).toFixed(1))}B`
  if (abs >= 1e6) return `${trimZero((value / 1e6).toFixed(1))}M`
  if (abs >= 1e3) return `${trimZero((value / 1e3).toFixed(1))}K`
  return trimZero(value.toFixed(1))
}

const formatTime = (seconds: number): string => {
  if (seconds === 0) return "0ns"
  const abs = Math.abs(seconds)
  if (abs >= 1) return `${trimZero(seconds.toFixed(1))}s`
  if (abs >= 0.001) return `${trimZero((seconds * 1000).toFixed(1))}ms`
  if (abs >= 0.000001) return `${trimZero((seconds * 1e6).toFixed(1))}\u00B5s`
  return `${trimZero((seconds * 1e9).toFixed(1))}ns`
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹"

/** Array sizes are powers of two, so label them as 2ⁿ to keep the axis short. */
const formatSize = (value: number): string => {
  const exponent = Math.log2(value)
  if (!Number.isInteger(exponent)) return formatCompact(value)
  return "2" + [...String(exponent)].map((d) => SUPERSCRIPT[+d]).join("")
}

type ScaleType = "linear" | "log"
type Order = "random" | "reversed" | "sorted"

const SCALE_OPTIONS = [
  ["linear", "Linear"],
  ["log", "Log"],
] as const

const ORDER_OPTIONS = [
  ["random", "Random"],
  ["reversed", "Reversed"],
  ["sorted", "Sorted"],
] as const

const ScaleToggle = ({
  scaleType,
  setScaleType,
}: {
  scaleType: ScaleType
  setScaleType: (s: ScaleType) => void
}) => (
  <Segmented label="Scale" options={SCALE_OPTIONS} value={scaleType} onChange={setScaleType} />
)

const OrderToggle = ({ order, setOrder }: { order: Order; setOrder: (o: Order) => void }) => (
  <Segmented label="Input" options={ORDER_OPTIONS} value={order} onChange={setOrder} />
)

// --- Dataset generation ---

type Generator = [string, (i: number) => number]
const generateDatasets = (
  length: number,
  generators: Generator[],
  {
    increaseBy = 1,
    startAt = 0,
  }: { increaseBy?: number; startAt?: number } = {}
) => {
  const xAxis = Array.from({ length }, (_, i) => i * increaseBy + startAt)

  return {
    xAxis: [{ data: xAxis }],
    series: generators.map(([label, func]) => ({
      label,
      data: Array.from({ length }, (_, idx) =>
        func(idx * increaseBy + startAt)
      ),
    })),
  }
}

// --- Theoretical complexity charts ---

const CHART_HEIGHT = 320
const DATA_CHART_HEIGHT = 360

/**
 * Each complexity chart plots a function between two bounds. The prose refers
 * to them by color: the function is purple, the bounds blue and yellow.
 */
const ComplexityChart = ({
  title,
  dataset,
}: {
  title: string
  dataset: ReturnType<typeof generateDatasets>
}) => {
  const palette = usePalette()
  return (
    <ChartFigure title={title}>
      <LineChart
        height={CHART_HEIGHT}
        series={dataset.series.map((s, i) => ({
          ...s,
          curve: "catmullRom" as const,
          showMark: false,
          color: palette.bounds[i],
        }))}
        xAxis={dataset.xAxis}
        yAxis={[{ valueFormatter: formatCompact, width: 48 }]}
        grid={{ horizontal: true }}
      />
    </ChartFigure>
  )
}

const LINEAR_COMPLEXITY_CHART_DATASET = generateDatasets(50, [
  ["40n", (n) => n * 40],
  ["50n", (n) => n * 50],
  ["60n", (n) => n * 60],
])
export const LinearComplexityChart = () => (
  <ComplexityChart title="Linear complexity" dataset={LINEAR_COMPLEXITY_CHART_DATASET} />
)

const SQUARE_COMPLEXITY_CHART_DATASET = generateDatasets(50, [
  ["n²", (n) => n * n],
  ["n² + 2n + 10", (n) => n * n + 2 * n + 10],
  ["2n²", (n) => 2 * n * n],
])
export const SquareComplexityChart = () => (
  <ComplexityChart title="Quadratic complexity" dataset={SQUARE_COMPLEXITY_CHART_DATASET} />
)

const LOG_COMPLEXITY_CHART_DATASET = generateDatasets(
  20,
  [
    ["n", (n) => n],
    ["n + log(n)", (n) => n + Math.log(n)],
    ["2n", (n) => 2 * n],
  ],
  { increaseBy: 10, startAt: 1 }
)
export const LogComplexityChart = () => (
  <ComplexityChart title="Linear plus logarithmic" dataset={LOG_COMPLEXITY_CHART_DATASET} />
)

const CUBIC_COMPLEXITY_CHART_DATASET = generateDatasets(
  30,
  [
    ["n³", (n) => n * n * n],
    ["n³ - 100n²", (n) => n * n * n - 100 * (n * n)],
    ["n³/2", (n) => (n * n * n) / 2],
  ],
  { increaseBy: 10 }
)
export const CubicComplexityChart = () => (
  <ComplexityChart title="Cubic complexity" dataset={CUBIC_COMPLEXITY_CHART_DATASET} />
)

const CONSTANT_COMPLEXITY_CHART_DATASET = generateDatasets(
  40,
  [
    ["1", () => 1],
    ["(2n²)/(3n² - 1)", (n) => (2 * n * n) / (3 * n * n - 1)],
    ["1/3", () => 1 / 3],
  ],
  { increaseBy: 0.5 }
)
export const ConstantComplexityChart = () => (
  <ComplexityChart title="Constant complexity" dataset={CONSTANT_COMPLEXITY_CHART_DATASET} />
)

const LINEAR_LOG_COMPLEXITY_CHART_DATASET = generateDatasets(
  50,
  [
    ["10n log(n)", (n) => 10 * n * Math.log(n)],
    ["10n log(2n)", (n) => 10 * n * Math.log(2 * n)],
    ["11n log(n)", (n) => 11 * n * Math.log(n)],
  ],
  { increaseBy: 1000, startAt: 1 }
)
export const LinearLogComplexityChart = () => (
  <ComplexityChart title="Linearithmic complexity" dataset={LINEAR_LOG_COMPLEXITY_CHART_DATASET} />
)

// --- Data-driven charts ---

const TimeAndSwapsChart = ({
  data,
  scaleType,
}: {
  data: ParsedSortingAlgorithmData[]
  scaleType: ScaleType
}) => (
  <DoubleAxisChart
    data={data}
    scaleType={scaleType}
    axis1={{ label: "Time", dataMapper: (d) => d.time, valueFormatter: formatTime }}
    axis2={{ label: "Swaps", dataMapper: (d) => d.swaps }}
  />
)

const TimeAndRecursiveCallsChart = ({
  data,
  scaleType,
}: {
  data: ParsedRecursiveSortingAlgorithmData[]
  scaleType: ScaleType
}) => (
  <DoubleAxisChart
    data={data}
    scaleType={scaleType}
    axis1={{ label: "Average time", dataMapper: (d) => d.timeAverage, valueFormatter: formatTime }}
    axis2={{
      label: "Average recursive calls",
      dataMapper: (d) => d.recursiveCallsAverage,
    }}
  />
)

const DoubleAxisChart = <D extends { arraySize: number }>({
  data,
  scaleType,
  axis1,
  axis2,
}: {
  data: D[]
  scaleType: ScaleType
  axis1: { label: string; dataMapper: (d: D) => number; valueFormatter?: (v: number) => string }
  axis2: { label: string; dataMapper: (d: D) => number; valueFormatter?: (v: number) => string }
}) => {
  const palette = usePalette()
  return (
    <ChartsDataProvider
      height={DATA_CHART_HEIGHT}
      xAxis={[
        {
          data: data.map((d) => d.arraySize),
          scaleType: "band",
          id: "x-axis-id",
          label: "Array size",
          valueFormatter: formatSize,
        },
      ]}
      yAxis={[
        {
          id: "axis1",
          scaleType,
          position: "left",
          label: axis1.label,
          domainLimit: (min, max) => ({ min, max }),
          valueFormatter: axis1.valueFormatter,
          width: 64,
        },
        {
          id: "axis2",
          scaleType: "linear",
          position: "right",
          label: axis2.label,
          domainLimit: (min, max) => ({
            min,
            max: Number(max) * 1.1,
          }),
          valueFormatter: axis2.valueFormatter ?? formatCompact,
          width: 64,
        },
      ]}
      series={[
        {
          label: axis1.label,
          data: data.map(axis1.dataMapper),
          type: "line",
          yAxisId: "axis1",
          showMark: true,
          color: palette.accent,
          valueFormatter: toSeriesFormatter(axis1.valueFormatter),
        },
        {
          label: axis2.label,
          data: data.map(axis2.dataMapper),
          type: "bar",
          yAxisId: "axis2",
          color: palette.bar,
          valueFormatter: toSeriesFormatter(axis2.valueFormatter ?? formatCompact),
        },
      ]}
    >
      {/* The legend is HTML, so it sits beside the SVG surface, not inside it */}
      <ChartsWrapper legendPosition={{ vertical: "top", horizontal: "center" }}>
        <ChartsLegend />
        <ChartsSurface>
          <ChartsGrid horizontal />
          <BarPlot />
          <LinePlot />
          <MarkPlot />
          <ChartsXAxis axisId="x-axis-id" />
          <ChartsYAxis axisId="axis1" />
          <ChartsYAxis axisId="axis2" />
        </ChartsSurface>
        <ChartsTooltip />
      </ChartsWrapper>
    </ChartsDataProvider>
  )
}

// --- Sorting algorithm chart groups ---

const ORDER_LABEL: Record<Order, string> = {
  random: "random input",
  reversed: "reversed input",
  sorted: "sorted input",
}

const SortChartTriple = ({
  name,
  randomData,
  reversedData,
  sortedData,
}: {
  name: string
  randomData: ParsedSortingAlgorithmData[]
  reversedData: ParsedSortingAlgorithmData[]
  sortedData: ParsedSortingAlgorithmData[]
}) => {
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear")
  const [order, setOrder] = React.useState<Order>("random")
  const data = { random: randomData, reversed: reversedData, sorted: sortedData }[order]

  return (
    <ChartFigure
      title={`${name}, ${ORDER_LABEL[order]}`}
      controls={
        <>
          <OrderToggle order={order} setOrder={setOrder} />
          <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
        </>
      }
    >
      <TimeAndSwapsChart data={data} scaleType={scaleType} />
    </ChartFigure>
  )
}

export const BubbleSortCharts = () => (
  <SortChartTriple
    name="Bubble sort"
    randomData={bubbleSortRandom}
    reversedData={bubbleSortReversed}
    sortedData={bubbleSortSorted}
  />
)

export const InsertionSortCharts = () => (
  <SortChartTriple
    name="Insertion sort"
    randomData={insertionSortRandom}
    reversedData={insertionSortReversed}
    sortedData={insertionSortSorted}
  />
)

export const BinaryInsertionSortCharts = () => (
  <SortChartTriple
    name="Binary insertion sort"
    randomData={binaryInsertionSortRandom}
    reversedData={binaryInsertionSortReversed}
    sortedData={binaryInsertionSortSorted}
  />
)

type Sequence = "shell" | "knuth" | "tokuda"

const SEQUENCE_OPTIONS = [
  ["shell", "Shell"],
  ["knuth", "Knuth"],
  ["tokuda", "Tokuda"],
] as const

const SHELL_DATA = {
  shell: { random: shellSort0Random, reversed: shellSort0Reversed, sorted: shellSort0Sorted },
  knuth: { random: shellSort1Random, reversed: shellSort1Reversed, sorted: shellSort1Sorted },
  tokuda: { random: shellSort2Random, reversed: shellSort2Reversed, sorted: shellSort2Sorted },
} as const

export const ShellSortCharts = () => {
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear")
  const [order, setOrder] = React.useState<Order>("random")
  const [sequence, setSequence] = React.useState<Sequence>("shell")
  const data = SHELL_DATA[sequence][order] as unknown as ParsedSortingAlgorithmData[]
  const sequenceName = SEQUENCE_OPTIONS.find(([s]) => s === sequence)![1]

  return (
    <ChartFigure
      title={`Shell sort (${sequenceName} sequence), ${ORDER_LABEL[order]}`}
      controls={
        <>
          <Segmented label="Sequence" options={SEQUENCE_OPTIONS} value={sequence} onChange={setSequence} />
          <OrderToggle order={order} setOrder={setOrder} />
          <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
        </>
      }
    >
      <TimeAndSwapsChart data={data} scaleType={scaleType} />
    </ChartFigure>
  )
}

const SingleRecursiveChart = ({
  title,
  data,
}: {
  title: string
  data: ParsedRecursiveSortingAlgorithmData[]
}) => {
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

  return (
    <ChartFigure
      title={title}
      controls={<ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />}
    >
      <TimeAndRecursiveCallsChart data={data} scaleType={scaleType} />
    </ChartFigure>
  )
}

export const QuickSortCharts = () => (
  <SingleRecursiveChart title="Quick sort, random input" data={quickSortData} />
)

export const MergeSortCharts = () => (
  <SingleRecursiveChart title="Merge sort, random input" data={mergeSortData} />
)

export const RadixSortCharts = () => (
  <SingleRecursiveChart title="Radix sort, random input" data={radixSortData} />
)

// --- Comparison charts ---

const ComparisonChart = ({
  sizes,
  series,
  scaleType = "linear",
}: {
  sizes: number[]
  series: { label: string; data: number[] }[]
  scaleType?: ScaleType
}) => {
  const palette = usePalette()
  return (
    <LineChart
      height={DATA_CHART_HEIGHT}
      series={series.map((s, i) => ({
        ...s,
        showMark: false,
        color: palette.series[i],
        valueFormatter: toSeriesFormatter(formatTime),
      }))}
      xAxis={[{ data: sizes, scaleType: "band", valueFormatter: formatSize, label: "Array size" }]}
      yAxis={[{ scaleType, valueFormatter: formatTime, width: 56 }]}
      grid={{ horizontal: true }}
    />
  )
}

export const RecursiveSortingCharts = () => (
  <ChartFigure title="Quick, merge and radix sort, random input">
    <ComparisonChart
      sizes={quickSortData.map((d) => d.arraySize)}
      series={[
        { label: "Quick sort", data: quickSortData.map((d) => d.time) },
        { label: "Merge sort", data: mergeSortData.map((d) => d.time) },
        { label: "Radix sort", data: radixSortData.map((d) => d.time) },
      ]}
    />
  </ChartFigure>
)

export const FileSortingCharts = () => (
  <ChartFigure title="Merging 200 sorted files">
    <ComparisonChart
      sizes={selectionTreeFilesData.map((d) => d.arraySize)}
      series={[
        { label: "Quick sort", data: quickSortFilesData.map((d) => d.time) },
        { label: "Merge arrays", data: mergeArraysFilesData.map((d) => d.time) },
        { label: "Selection tree", data: selectionTreeFilesData.map((d) => d.time) },
      ]}
    />
  </ChartFigure>
)

const ARRAY_TIMES = {
  sorted: [bubbleSortSorted, insertionSortSorted, binaryInsertionSortSorted, shellSort0Sorted, shellSort1Sorted, shellSort2Sorted],
  reversed: [bubbleSortReversed, insertionSortReversed, binaryInsertionSortReversed, shellSort0Reversed, shellSort1Reversed, shellSort2Reversed],
  random: [bubbleSortRandom, insertionSortRandom, binaryInsertionSortRandom, shellSort0Random, shellSort1Random, shellSort2Random],
} as const

const ARRAY_TIMES_LABELS = [
  "Bubble",
  "Insertion",
  "Binary insertion",
  "Shell (Shell)",
  "Shell (Knuth)",
  "Shell (Tokuda)",
]

export const ArrayTimesCharts = () => {
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear")
  const [order, setOrder] = React.useState<Order>("random")
  const datasets = ARRAY_TIMES[order] as unknown as ParsedSortingAlgorithmData[][]

  return (
    <ChartFigure
      title={`All six algorithms, ${ORDER_LABEL[order]}`}
      controls={
        <>
          <OrderToggle order={order} setOrder={setOrder} />
          <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
        </>
      }
    >
      <ComparisonChart
        scaleType={scaleType}
        sizes={datasets[3].map((d) => d.arraySize)}
        series={datasets.map((data, i) => ({
          label: ARRAY_TIMES_LABELS[i],
          data: data.map((d) => d.time),
        }))}
      />
    </ChartFigure>
  )
}

// --- Hash table collisions ---

const HASH_METHODS = [
  ["Open Linear", "Linear search"],
  ["Open Rehashing", "Rehashing"],
  ["Closed List", "List"],
] as const

const HASH_TABLE_SIZES = [...new Set(hashData.map((d) => d.tableSize))]

const collisionsFor = (method: string) =>
  HASH_TABLE_SIZES.map(
    (size) => hashData.find((d) => d.tableSize === size && d.method === method)?.collisions ?? 0
  )

/** One bar per method and table size: insertion collisions, with search stacked on top. */
export const HashCollisionsChart = () => {
  const palette = usePalette()
  return (
    <ChartFigure title="Collisions by table size">
      <BarChart
        height={DATA_CHART_HEIGHT}
        xAxis={[{ data: HASH_TABLE_SIZES, scaleType: "band", label: "Table size" }]}
        yAxis={[{ label: "Collisions", width: 56 }]}
        series={HASH_METHODS.flatMap(([method, name], i) => [
          {
            label: `${name}, insertion`,
            data: collisionsFor(`${method} Insertion`),
            stack: method,
            color: palette.series[i],
          },
          {
            label: `${name}, search`,
            data: collisionsFor(`${method} Search`),
            stack: method,
            color: palette.tints[i],
          },
        ])}
        grid={{ horizontal: true }}
      />
    </ChartFigure>
  )
}
