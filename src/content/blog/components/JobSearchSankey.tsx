import React, { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"

// Sankey chart data format: [From, To, Count]
// Update these numbers with your actual job search data
const SANKEY_FLOWS: [string, string, number][] = [
  // Applications flow
  ["Applied", "Rejected (No Interview)", 34],
  ["Applied", "Ghosted", 73],
  ["Applied", "Recruiter Interview", 30],

  // Recruiter Interview outcomes
  ["Recruiter Interview", "Withdrawn", 11],
  ["Recruiter Interview", "Ghosted", 6],
  ["Recruiter Interview", "Technical Interviews", 13],

  // Technical Interviews outcomes
  ["Technical Interviews", "Rejected (After Interview)", 4],
  ["Technical Interviews", "Withdrawn", 3],
  ["Technical Interviews", "Offer", 6],

  // Offer outcomes
  ["Offer", "Declined", 5],
  ["Offer", "Accepted 🦔", 1],
]

// Node info with colors and descriptions
const NODE_INFO: Record<string, { description: string; color: string }> = {
  Applied: { description: "Total applications submitted", color: "#3b82f6" },
  Ghosted: {
    description: "No response after applying or interviewing",
    color: "#6b7280",
  },
  "Rejected (No Interview)": {
    description: "Rejected without an interview",
    color: "#ef4444",
  },
  "Recruiter Interview": {
    description: "Got to speak with someone, usually a recruiter",
    color: "#22c55e",
  },
  Withdrawn: {
    description: "I withdrew (compensation, values, etc.)",
    color: "#f59e0b",
  },
  "Rejected (After Interview)": {
    description: "Rejected after at least one interview",
    color: "#ef4444",
  },
  "Technical Interviews": {
    description: "Advanced to more technical rounds",
    color: "#8b5cf6",
  },
  Offer: { description: "Received a job offer!", color: "#10b981" },
  Declined: { description: "I declined the offer", color: "#f97316" },
  "Accepted 🦔": { description: "Accepted - hello PostHog!", color: "#059669" },
}

// Calculate totals for each node
const calculateNodeTotals = (flows: [string, string, number][]) => {
  const outgoing: Record<string, number> = {}
  const incoming: Record<string, number> = {}

  for (const [from, to, count] of flows) {
    outgoing[from] = (outgoing[from] || 0) + count
    incoming[to] = (incoming[to] || 0) + count
  }

  const totals: Record<string, number> = {}
  const allNodes = new Set([...Object.keys(outgoing), ...Object.keys(incoming)])

  for (const node of allNodes) {
    totals[node] = outgoing[node] || incoming[node] || 0
  }

  return totals
}

const nodeTotals = calculateNodeTotals(SANKEY_FLOWS)
const totalApplied = nodeTotals["Applied"]

// Build graph data for d3-sankey
const buildGraphData = () => {
  const nodeNames = new Set<string>()
  SANKEY_FLOWS.forEach(([from, to]) => {
    nodeNames.add(from)
    nodeNames.add(to)
  })

  const nodes = Array.from(nodeNames).map((name) => ({
    name,
    color: NODE_INFO[name]?.color || "#6b7280",
  }))

  // Use string names for source/target to match nodeId
  const links = SANKEY_FLOWS.map(([source, target, value]) => ({
    source,
    target,
    value,
  }))

  return { nodes, links }
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: React.ReactNode
}

export const JobSearchSankey = () => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  })

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const width = containerRef.current.clientWidth
    const height = 500
    const margin = { top: 10, right: 10, bottom: 10, left: 10 }

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])

    // Clear previous content
    svg.selectAll("*").remove()

    const graphData = buildGraphData()

    // Create sankey generator
    const sankeyGenerator = sankey<
      { name: string; color: string },
      { source: string; target: string; value: number }
    >()
      .nodeId((d) => d.name)
      .nodeWidth(20)
      .nodePadding(20)
      .nodeSort(null) // Preserve input order
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])

    const { nodes, links } = sankeyGenerator({
      nodes: graphData.nodes.map((d) => ({ ...d })),
      links: graphData.links.map((d) => ({ ...d })),
    })

    // Create gradient definitions for links
    const defs = svg.append("defs")

    links.forEach((link, i) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (link.source as unknown as { x1: number }).x1)
        .attr("x2", (link.target as unknown as { x0: number }).x0)

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", (link.source as unknown as { color: string }).color)
        .attr("stop-opacity", 0.5)

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", (link.target as unknown as { color: string }).color)
        .attr("stop-opacity", 0.5)
    })

    // Draw links
    svg
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (_, i) => `url(#gradient-${i})`)
      .attr("stroke-width", (d) => Math.max(1, d.width || 0))
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("stroke-opacity", 0.8)
        const sourceNode = d.source as unknown as { name: string }
        const targetNode = d.target as unknown as { name: string }
        const fromTotal = nodeTotals[sourceNode.name]
        const percentage = ((d.value / fromTotal) * 100).toFixed(1)

        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: (
            <>
              <strong>{sourceNode.name}</strong> →{" "}
              <strong>{targetNode.name}</strong>
              <br />
              <span style={{ color: "#6b7280" }}>
                {d.value} applications ({percentage}%)
              </span>
            </>
          ),
        })
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-opacity", 1)
        setTooltip((prev) => ({ ...prev, visible: false }))
      })

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0!)
      .attr("y", (d) => d.y0!)
      .attr("height", (d) => d.y1! - d.y0!)
      .attr("width", (d) => d.x1! - d.x0!)
      .attr("fill", (d) => d.color)
      .attr("rx", 3)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        const count = nodeTotals[d.name]
        const percentage =
          d.name === "Applied"
            ? null
            : ((count / totalApplied) * 100).toFixed(1)
        const info = NODE_INFO[d.name]

        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip({
          visible: true,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top - 10,
          content: (
            <>
              <strong>
                {d.name} ({count}
                {percentage && `, ${percentage}%`})
              </strong>
              <br />
              <span style={{ color: "#6b7280" }}>{info?.description}</span>
            </>
          ),
        })
      })
      .on("mouseleave", function () {
        setTooltip((prev) => ({ ...prev, visible: false }))
      })

    // Draw node labels - position based on whether node is in left or right half
    svg
      .append("g")
      .style("font-family", "system-ui, sans-serif")
      .style("font-size", "12px")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => {
        const isRightSide = d.x0! > width * 0.6
        return isRightSide ? d.x0! - 6 : d.x1! + 6
      })
      .attr("y", (d) => (d.y1! + d.y0!) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0! > width * 0.6 ? "end" : "start"))
      .attr("fill", "#374151")
      .text((d) => d.name)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "center",
        marginTop: 40,
        marginBottom: 40,
        position: "relative",
      }}
    >
      {tooltip.visible && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            fontFamily: "system-ui",
            fontSize: 13,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {tooltip.content}
        </div>
      )}
      <svg ref={svgRef} style={{ width: "100%", height: 500 }} />
    </div>
  )
}

export default JobSearchSankey
