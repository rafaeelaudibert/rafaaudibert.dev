import React from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { BarPlot, ChartsGrid, ChartsLegend, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot, MarkPlot, ResponsiveChartContainer } from '@mui/x-charts'
import type { ParsedRecursiveSortingAlgorithmData, ParsedSortingAlgorithmData } from './csv'
import { binaryInsertionSortRandom, binaryInsertionSortReversed, binaryInsertionSortSorted, bubbleSortRandom, bubbleSortReversed, shellSort0Sorted, shellSort1Random, bubbleSortSorted, insertionSortRandom, insertionSortReversed, insertionSortSorted, shellSort1Reversed, shellSort0Reversed, shellSort0Random, shellSort1Sorted, shellSort2Random, shellSort2Reversed, shellSort2Sorted, quickSortData, mergeSortData, radixSortData, quickSortFilesData, mergeArraysFilesData, selectionTreeFilesData } from "./csv"


type Generator = [string, ((i: number) => number)]
const generateDatasets = (
    length: number,
    generators: Generator[],
    { increaseBy = 1, startAt = 0 }: { increaseBy?: number, startAt?: number } = {}
) => {
    const xAxis = Array.from({ length }, (_, i) => i * increaseBy + startAt)

    return {
        xAxis: [{ data: xAxis }],
        series: generators.map(([label, func]) => ({
            label,
            data: Array.from({ length }, (_, idx) => func(idx * increaseBy + startAt)),
        }))
    }
}

const LINEAR_COMPLEXITY_CHART_DATASET = generateDatasets(50, [['40n', n => n * 40], ['50n', n => n * 50], ['60n', n => n * 60]])
export const LinearComplexityChart = () => {
    return <LineChart
        key="linear-complexity-chart"
        title="Linear Complexity"
        width={600}
        height={500}
        series={LINEAR_COMPLEXITY_CHART_DATASET.series}
        xAxis={LINEAR_COMPLEXITY_CHART_DATASET.xAxis}
    />
}

const SQUARE_COMPLEXITY_CHART_DATASET = generateDatasets(50, [['n²', n => n * n], ['n² + 2n + 10', n => n * n + 2 * n + 10], ['2n²', n => 2 * n * n]])
export const SquareComplexityChart = () => {
    return <LineChart
        key="square-complexity-chart"
        title="Square Complexity"
        width={600}
        height={500}
        series={SQUARE_COMPLEXITY_CHART_DATASET.series}
        xAxis={SQUARE_COMPLEXITY_CHART_DATASET.xAxis}
    />
}

const LOG_COMPLEXITY_CHART_DATASET = generateDatasets(20, [['n', n => n], ['n + log(n)', n => n + Math.log(n)], ['2n', n => 2 * n]], { increaseBy: 10, startAt: 1 })
export const LogComplexityChart = () => {
    return <LineChart
        key="log-complexity-chart"
        title="Logarithmic Complexity"
        width={600}
        height={500}
        series={LOG_COMPLEXITY_CHART_DATASET.series}
        xAxis={LOG_COMPLEXITY_CHART_DATASET.xAxis}
    />
}

const CUBIC_COMPLEXITY_CHART_DATASET = generateDatasets(30, [['n³', n => n * n * n], ['n³ - 100n²', n => (n * n * n) - 100 * (n * n)], ['n³/2', n => (n * n * n) / 2]], { increaseBy: 10 })
export const CubicComplexityChart = () => {
    return <LineChart
        key="cubic-complexity-chart"
        title="Cubic Complexity"
        width={600}
        height={500}
        series={CUBIC_COMPLEXITY_CHART_DATASET.series}
        xAxis={CUBIC_COMPLEXITY_CHART_DATASET.xAxis}
    />
}

const CONSTANT_COMPLEXITY_CHART_DATASET = generateDatasets(40, [['1', n => 1], ['(2n²)/(3n² - 1)', n => (2 * n * n) / (3 * n * n - 1)], ["1/3", n => 1 / 3]], { increaseBy: 0.5 })
export const ConstantComplexityChart = () => {
    return <LineChart
        key="constant-complexity-chart"
        title="Constant Complexity"
        width={600}
        height={500}
        series={CONSTANT_COMPLEXITY_CHART_DATASET.series}
        xAxis={CONSTANT_COMPLEXITY_CHART_DATASET.xAxis}
    />
}

const LINEAR_LOG_COMPLEXITY_CHART_DATASET = generateDatasets(50, [['10n log(n)', n => 10 * n * Math.log(n)], ['10n log(2n)', n => 10 * n * Math.log(2 * n)], ['11n log(n)', n => 11 * n * Math.log(n)]], { increaseBy: 1000, startAt: 1 })
export const LinearLogComplexityChart = () => {
    return <LineChart
        key="linear-log-complexity-chart"
        title="Linear Logarithmic Complexity"
        width={600}
        height={500}
        series={LINEAR_LOG_COMPLEXITY_CHART_DATASET.series}
        xAxis={LINEAR_LOG_COMPLEXITY_CHART_DATASET.xAxis}
    />
}


type ScaleType = "linear" | "log"

const TimeAndSwapsChart = ({ data, scaleType }: {
    data: ParsedSortingAlgorithmData[],
    scaleType: ScaleType
}) => {
    return <DoubleAxisChart
        data={data}
        scaleType={scaleType}
        axis1={{ label: "Time", dataMapper: d => d.time }}
        axis2={{ label: "Swaps", dataMapper: d => d.swaps }}
    />
}

const TimeAndRecursiveCallsChart = ({ data, scaleType }: {
    data: ParsedRecursiveSortingAlgorithmData[],
    scaleType: ScaleType
}) => {
    return <DoubleAxisChart
        data={data}
        scaleType={scaleType}
        axis1={{ label: "Average Time", dataMapper: d => d.timeAverage }}
        axis2={{ label: "Average Recursive Calls", dataMapper: d => d.recursiveCallsAverage }}
    />
}

const DoubleAxisChart = <D extends { arraySize: number }>({ data, scaleType, axis1, axis2 }: {
    data: D[],
    scaleType: ScaleType,
    axis1: { label: string, dataMapper: (d: D) => number },
    axis2: { label: string, dataMapper: (d: D) => number }
}) => {
    return <ResponsiveChartContainer
        xAxis={[{ data: data.map(d => d.arraySize), scaleType: "band", id: 'x-axis-id' }]}
        yAxis={[
            { id: 'axis1', scaleType, domainLimit: (min, max) => ({ min, max }) },
            { id: 'axis2', scaleType: 'linear', domainLimit: (min, max) => ({ min, max: max * 1.1 }), valueFormatter: (value) => value.toExponential(2) },
        ]}
        series={[
            { label: axis1.label, data: data.map(axis1.dataMapper), type: "line", yAxisId: 'axis1', showMark: true },
            { label: axis2.label, data: data.map(axis2.dataMapper), type: "bar", yAxisId: 'axis2' },
        ]}
        height={500}
        margin={{ left: 75, right: 75 }}
    >
        <ChartsLegend />
        <ChartsGrid horizontal />
        <BarPlot />
        <LinePlot />
        <MarkPlot />
        <ChartsTooltip />
        <ChartsXAxis label="Array Size" position="bottom" axisId="x-axis-id" />
        <ChartsYAxis position="left" axisId="axis1" />
        <ChartsYAxis position="right" axisId="axis2" />
    </ResponsiveChartContainer>
}

export const BubbleSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", gap: 80, width: "100%", alignItems: "center", marginTop: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Bubble Sort - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={bubbleSortRandom} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Bubble Sort - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={bubbleSortReversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Bubble Sort - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={bubbleSortSorted} scaleType={scaleType} />
        </div>
    </div>
}

export const InsertionSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", gap: 80, width: "100%", alignItems: "center", marginTop: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Insertion Sort - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={insertionSortRandom} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Insertion Sort - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={insertionSortReversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Insertion Sort - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={insertionSortSorted} scaleType={scaleType} />
        </div>
    </div>
}

export const BinaryInsertionSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", gap: 80, width: "100%", alignItems: "center", marginTop: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Binary Insertion Sort - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={binaryInsertionSortRandom} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Binary Insertion Sort - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={binaryInsertionSortReversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Binary Insertion Sort - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={binaryInsertionSortSorted} scaleType={scaleType} />
        </div>
    </div>
}

export const ShellSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", gap: 80, width: "100%", alignItems: "center", marginTop: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Shell Sequence) - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort0Random} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Shell Sequence) - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort0Reversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Shell Sequence) - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort0Sorted} scaleType={scaleType} />
        </div>


        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Knuth Sequence) - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort1Random} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Knuth Sequence) - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort1Reversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Knuth Sequence) - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort1Sorted} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Tokuda Sequence) - Random Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort2Random} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Tokuda Sequence) - Reversed Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort2Reversed} scaleType={scaleType} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Shell Sort (Tokuda Sequence) - Sorted Order</strong>
            <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
            <TimeAndSwapsChart data={shellSort2Sorted} scaleType={scaleType} />
        </div>
    </div>
}

export const QuickSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 80 }}>
        <strong>Quick Sort - Random Order</strong>
        <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
        <TimeAndRecursiveCallsChart data={quickSortData} scaleType={scaleType} />
    </div>
}

export const MergeSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 80 }}>
        <strong>Merge Sort - Random Order</strong>
        <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
        <TimeAndRecursiveCallsChart data={mergeSortData} scaleType={scaleType} />
    </div>
}

export const RadixSortCharts = () => {
    const [scaleType, setScaleType] = React.useState<ScaleType>("linear")

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 80 }}>
        <strong>Radix Sort - Random Order</strong>
        <button onClick={() => setScaleType(scaleType === "linear" ? "log" : "linear")}>Toggle scale</button>
        <TimeAndRecursiveCallsChart data={radixSortData} scaleType={scaleType} />
    </div>
}

export const RecursiveSortingCharts = () => {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 80 }}>
        <strong>Random Array Times - Recursive Sorting Algorithms</strong>
        <LineChart
            width={600}
            height={500}
            series={[
                { label: "Quick Sort", data: quickSortData.map(d => d.time) },
                { label: "Merge Sort", data: mergeSortData.map(d => d.time) },
                { label: "Radix Sort", data: radixSortData.map(d => d.time) },
            ]}
            xAxis={[{ data: quickSortData.map(d => d.arraySize), scaleType: "band" }]}
            grid={{ horizontal: true }}
        />
    </div>
}

export const FileSortingCharts = () => {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", marginTop: 80 }}>
        <strong>File Sorting Algorithms</strong>
        <LineChart
            width={600}
            height={500}
            series={[
                { label: "Quick Sort", data: quickSortFilesData.map(d => d.time) },
                { label: "Merge Arrays", data: mergeArraysFilesData.map(d => d.time) },
                { label: "Selection Tree", data: selectionTreeFilesData.map(d => d.time) },
            ]}
            xAxis={[{ data: selectionTreeFilesData.map(d => d.arraySize), scaleType: "band" }]}
            grid={{ horizontal: true }}
        />
    </div>
}

export const ArrayTimesCharts = () => {
    return <div style={{ display: "flex", flexDirection: "column", gap: 80, width: "100%", alignItems: "center", marginTop: 80 }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Sorted Array Times</strong>
            <LineChart
                width={600}
                height={500}
                series={[
                    { label: "Bubble Sort", data: bubbleSortSorted.map(d => d.time) },
                    { label: "Insertion Sort", data: insertionSortSorted.map(d => d.time) },
                    { label: "Binary Insertion Sort", data: binaryInsertionSortSorted.map(d => d.time) },
                    { label: "Shell Sort (Shell Sequence)", data: shellSort0Sorted.map(d => d.time) },
                    { label: "Shell Sort (Knuth Sequence)", data: shellSort1Sorted.map(d => d.time) },
                    { label: "Shell Sort (Tokuda Sequence)", data: shellSort2Sorted.map(d => d.time) },
                ]}
                xAxis={[{ data: shellSort0Sorted.map(d => d.arraySize), scaleType: "band" }]}
                grid={{ horizontal: true }}
            />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Reversed Array Times</strong>
            <LineChart
                width={600}
                height={500}
                series={[
                    { label: "Bubble Sort", data: bubbleSortReversed.map(d => d.time) },
                    { label: "Insertion Sort", data: insertionSortReversed.map(d => d.time) },
                    { label: "Binary Insertion Sort", data: binaryInsertionSortReversed.map(d => d.time) },
                    { label: "Shell Sort (Shell Sequence)", data: shellSort0Reversed.map(d => d.time) },
                    { label: "Shell Sort (Knuth Sequence)", data: shellSort1Reversed.map(d => d.time) },
                    { label: "Shell Sort (Tokuda Sequence)", data: shellSort2Reversed.map(d => d.time) },
                ]}
                xAxis={[{ data: shellSort0Reversed.map(d => d.arraySize), scaleType: "band" }]}
                grid={{ horizontal: true }}
            />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
            <strong>Random Array Times</strong>
            <LineChart
                width={600}
                height={500}
                series={[
                    { label: "Bubble Sort", data: bubbleSortRandom.map(d => d.time) },
                    { label: "Insertion Sort", data: insertionSortRandom.map(d => d.time) },
                    { label: "Binary Insertion Sort", data: binaryInsertionSortRandom.map(d => d.time) },
                    { label: "Shell Sort (Shell Sequence)", data: shellSort0Random.map(d => d.time) },
                    { label: "Shell Sort (Knuth Sequence)", data: shellSort1Random.map(d => d.time) },
                    { label: "Shell Sort (Tokuda Sequence)", data: shellSort2Random.map(d => d.time) },
                ]}
                xAxis={[{ data: shellSort0Random.map(d => d.arraySize), scaleType: "band" }]}
                grid={{ horizontal: true }}
            />
        </div>
    </div>
}