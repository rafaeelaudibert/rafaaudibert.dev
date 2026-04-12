import React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import {
  BarPlot,
  ChartsGrid,
  ChartsLegend,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
  MarkPlot,
  ChartsContainer,
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
} from "./csv"

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

const CHART_COLORS = [
  "#7611a6",
  "#c561f6",
  "#ca7879",
  "#4c6ef5",
  "#37b24d",
  "#f59f00",
  "#e64980",
  "#0ca678",
  "#ae3ec9",
]

type ScaleType = "linear" | "log"

const ScaleToggle = ({
  scaleType,
  setScaleType,
}: {
  scaleType: ScaleType
  setScaleType: (s: ScaleType) => void
}) => (
  <button
    onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}
    style={{
      background: "none",
      border: "1px solid #c3cadb",
      borderRadius: "999px",
      padding: "0.25rem 0.875rem",
      fontSize: "0.8rem",
      color: "#505d84",
      cursor: "pointer",
      fontFamily: "inherit",
      letterSpacing: "0.02em",
    }}
  >
    Scale: {scaleType === "linear" ? "Linear" : "Logarithmic"}
  </button>
)

const ChartSection = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "center",
      gap: "0.5rem",
    }}
  >
    <strong style={{ fontSize: "0.95rem", color: "#283044" }}>{title}</strong>
    {children}
  </div>
)

const ChartGroup = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "3rem",
      width: "100%",
      alignItems: "center",
      marginTop: "2.5rem",
    }}
  >
    {children}
  </div>
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
    series: generators.map(([label, func], i) => ({
      label,
      data: Array.from({ length }, (_, idx) =>
        func(idx * increaseBy + startAt)
      ),
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
  }
}

// --- Theoretical complexity charts ---

const CHART_WIDTH = 600
const CHART_HEIGHT = 450

const LINEAR_COMPLEXITY_CHART_DATASET = generateDatasets(50, [
  ["40n", (n) => n * 40],
  ["50n", (n) => n * 50],
  ["60n", (n) => n * 60],
])
export const LinearComplexityChart = () => (
  <LineChart
    key="linear-complexity-chart"
    title="Linear Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={LINEAR_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={LINEAR_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
)

const SQUARE_COMPLEXITY_CHART_DATASET = generateDatasets(50, [
  ["n\u00B2", (n) => n * n],
  ["n\u00B2 + 2n + 10", (n) => n * n + 2 * n + 10],
  ["2n\u00B2", (n) => 2 * n * n],
])
export const SquareComplexityChart = () => (
  <LineChart
    key="square-complexity-chart"
    title="Square Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={SQUARE_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={SQUARE_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
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
  <LineChart
    key="log-complexity-chart"
    title="Logarithmic Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={LOG_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={LOG_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
)

const CUBIC_COMPLEXITY_CHART_DATASET = generateDatasets(
  30,
  [
    ["n\u00B3", (n) => n * n * n],
    ["n\u00B3 - 100n\u00B2", (n) => n * n * n - 100 * (n * n)],
    ["n\u00B3/2", (n) => (n * n * n) / 2],
  ],
  { increaseBy: 10 }
)
export const CubicComplexityChart = () => (
  <LineChart
    key="cubic-complexity-chart"
    title="Cubic Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={CUBIC_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={CUBIC_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
)

const CONSTANT_COMPLEXITY_CHART_DATASET = generateDatasets(
  40,
  [
    ["1", () => 1],
    ["(2n\u00B2)/(3n\u00B2 - 1)", (n) => (2 * n * n) / (3 * n * n - 1)],
    ["1/3", () => 1 / 3],
  ],
  { increaseBy: 0.5 }
)
export const ConstantComplexityChart = () => (
  <LineChart
    key="constant-complexity-chart"
    title="Constant Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={CONSTANT_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={CONSTANT_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
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
  <LineChart
    key="linear-log-complexity-chart"
    title="Linear Logarithmic Complexity"
    width={CHART_WIDTH}
    height={CHART_HEIGHT}
    series={LINEAR_LOG_COMPLEXITY_CHART_DATASET.series.map((s) => ({
      ...s,
      curve: "catmullRom" as const,
    }))}
    xAxis={LINEAR_LOG_COMPLEXITY_CHART_DATASET.xAxis}
    grid={{ horizontal: true }}
  />
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
    axis1={{ label: "Average Time", dataMapper: (d) => d.timeAverage, valueFormatter: formatTime }}
    axis2={{
      label: "Average Recursive Calls",
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
}) => (
  <ChartsContainer
    width={700}
    height={450}
    colors={CHART_COLORS}
    xAxis={[
      {
        data: data.map((d) => d.arraySize),
        scaleType: "band",
        id: "x-axis-id",
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
      },
    ]}
    series={[
      {
        label: axis1.label,
        data: data.map(axis1.dataMapper),
        type: "line",
        yAxisId: "axis1",
        showMark: true,
        valueFormatter: axis1.valueFormatter,
      },
      {
        label: axis2.label,
        data: data.map(axis2.dataMapper),
        type: "bar",
        yAxisId: "axis2",
        valueFormatter: axis2.valueFormatter ?? formatCompact,
      },
    ]}
    margin={{ left: 80, right: 80 }}
  >
    <ChartsLegend />
    <ChartsGrid horizontal />
    <BarPlot />
    <LinePlot />
    <MarkPlot />
    <ChartsTooltip />
    <ChartsXAxis label="Array Size" axisId="x-axis-id" />
    <ChartsYAxis axisId="axis1" />
    <ChartsYAxis axisId="axis2" />
  </ChartsContainer>
)

// --- Sorting algorithm chart groups ---

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

  return (
    <ChartGroup>
      <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
      <ChartSection title={`${name} - Random Order`}>
        <TimeAndSwapsChart data={randomData} scaleType={scaleType} />
      </ChartSection>
      <ChartSection title={`${name} - Reversed Order`}>
        <TimeAndSwapsChart data={reversedData} scaleType={scaleType} />
      </ChartSection>
      <ChartSection title={`${name} - Sorted Order`}>
        <TimeAndSwapsChart data={sortedData} scaleType={scaleType} />
      </ChartSection>
    </ChartGroup>
  )
}

export const BubbleSortCharts = () => (
  <SortChartTriple
    name="Bubble Sort"
    randomData={bubbleSortRandom}
    reversedData={bubbleSortReversed}
    sortedData={bubbleSortSorted}
  />
)

export const InsertionSortCharts = () => (
  <SortChartTriple
    name="Insertion Sort"
    randomData={insertionSortRandom}
    reversedData={insertionSortReversed}
    sortedData={insertionSortSorted}
  />
)

export const BinaryInsertionSortCharts = () => (
  <SortChartTriple
    name="Binary Insertion Sort"
    randomData={binaryInsertionSortRandom}
    reversedData={binaryInsertionSortReversed}
    sortedData={binaryInsertionSortSorted}
  />
)

export const ShellSortCharts = () => {
  const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

  return (
    <ChartGroup>
      <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
      {(
        [
          ["Shell Sequence", shellSort0Random, shellSort0Reversed, shellSort0Sorted],
          ["Knuth Sequence", shellSort1Random, shellSort1Reversed, shellSort1Sorted],
          ["Tokuda Sequence", shellSort2Random, shellSort2Reversed, shellSort2Sorted],
        ] as const
      ).flatMap(([seq, random, reversed, sorted]) => [
        <ChartSection key={`${seq}-random`} title={`Shell Sort (${seq}) - Random Order`}>
          <TimeAndSwapsChart data={random as unknown as ParsedSortingAlgorithmData[]} scaleType={scaleType} />
        </ChartSection>,
        <ChartSection key={`${seq}-reversed`} title={`Shell Sort (${seq}) - Reversed Order`}>
          <TimeAndSwapsChart data={reversed as unknown as ParsedSortingAlgorithmData[]} scaleType={scaleType} />
        </ChartSection>,
        <ChartSection key={`${seq}-sorted`} title={`Shell Sort (${seq}) - Sorted Order`}>
          <TimeAndSwapsChart data={sorted as unknown as ParsedSortingAlgorithmData[]} scaleType={scaleType} />
        </ChartSection>,
      ])}
    </ChartGroup>
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
    <ChartGroup>
      <ChartSection title={title}>
        <ScaleToggle scaleType={scaleType} setScaleType={setScaleType} />
        <TimeAndRecursiveCallsChart data={data} scaleType={scaleType} />
      </ChartSection>
    </ChartGroup>
  )
}

export const QuickSortCharts = () => (
  <SingleRecursiveChart title="Quick Sort - Random Order" data={quickSortData} />
)

export const MergeSortCharts = () => (
  <SingleRecursiveChart title="Merge Sort - Random Order" data={mergeSortData} />
)

export const RadixSortCharts = () => (
  <SingleRecursiveChart title="Radix Sort - Random Order" data={radixSortData} />
)

// --- Comparison charts ---

export const RecursiveSortingCharts = () => (
  <ChartGroup>
    <ChartSection title="Random Array Times - Recursive Sorting Algorithms">
      <LineChart
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        colors={CHART_COLORS}
        series={[
          { label: "Quick Sort", data: quickSortData.map((d) => d.time), showMark: true },
          { label: "Merge Sort", data: mergeSortData.map((d) => d.time), showMark: true },
          { label: "Radix Sort", data: radixSortData.map((d) => d.time), showMark: true },
        ]}
        xAxis={[
          { data: quickSortData.map((d) => d.arraySize), scaleType: "band" },
        ]}
        grid={{ horizontal: true }}
      />
    </ChartSection>
  </ChartGroup>
)

export const FileSortingCharts = () => (
  <ChartGroup>
    <ChartSection title="File Sorting Algorithms">
      <LineChart
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        colors={CHART_COLORS}
        series={[
          { label: "Quick Sort", data: quickSortFilesData.map((d) => d.time), showMark: true },
          { label: "Merge Arrays", data: mergeArraysFilesData.map((d) => d.time), showMark: true },
          { label: "Selection Tree", data: selectionTreeFilesData.map((d) => d.time), showMark: true },
        ]}
        xAxis={[
          { data: selectionTreeFilesData.map((d) => d.arraySize), scaleType: "band" },
        ]}
        grid={{ horizontal: true }}
      />
    </ChartSection>
  </ChartGroup>
)

export const ArrayTimesCharts = () => (
  <ChartGroup>
    {(
      [
        ["Sorted Array Times", bubbleSortSorted, insertionSortSorted, binaryInsertionSortSorted, shellSort0Sorted, shellSort1Sorted, shellSort2Sorted],
        ["Reversed Array Times", bubbleSortReversed, insertionSortReversed, binaryInsertionSortReversed, shellSort0Reversed, shellSort1Reversed, shellSort2Reversed],
        ["Random Array Times", bubbleSortRandom, insertionSortRandom, binaryInsertionSortRandom, shellSort0Random, shellSort1Random, shellSort2Random],
      ] as const
    ).map(([title, bubble, insertion, binaryInsertion, shell0, shell1, shell2]) => (
      <ChartSection key={title} title={title}>
        <LineChart
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          colors={CHART_COLORS}
          series={[
            { label: "Bubble Sort", data: bubble.map((d) => d.time), showMark: true },
            { label: "Insertion Sort", data: insertion.map((d) => d.time), showMark: true },
            { label: "Binary Insertion Sort", data: binaryInsertion.map((d) => d.time), showMark: true },
            { label: "Shell Sort (Shell Sequence)", data: shell0.map((d) => d.time), showMark: true },
            { label: "Shell Sort (Knuth Sequence)", data: shell1.map((d) => d.time), showMark: true },
            { label: "Shell Sort (Tokuda Sequence)", data: shell2.map((d) => d.time), showMark: true },
          ]}
          xAxis={[
            { data: shell0.map((d) => d.arraySize), scaleType: "band" },
          ]}
          grid={{ horizontal: true }}
        />
      </ChartSection>
    ))}
  </ChartGroup>
)
