// src/components/LineChart.tsx

import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface LineChartProps {
  dataX: number[];
  dataY: number[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  dataX,
  dataY,
  width = 500,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Calcular los valores acumulados en el eje Y
    const accumulatedY = dataY.reduce((accumulated, current) => {
      const lastValue = accumulated[accumulated.length - 1] || 0
      accumulated.push(lastValue + current)
      return accumulated
    }, [] as number[])

    // Clear the SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create margins and dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scalePoint()
      .domain(dataX.map(String))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...accumulatedY), Math.max(...accumulatedY)])
      // .domain([d3.min(dataY) || 0, d3.max(dataY) || 0])
      .nice()
      .range([innerHeight, 0]);

    // Create the SVG container
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "axis-y");

    g.append("g")
      .call(d3.axisBottom(xScale).tickFormat((d) => d.toString()))
      .attr("class", "axis-x")
      .attr("transform", `translate(0,${innerHeight})`);

    // Line generator
    const line = d3
      .line<number>()
      .x((_, i) => xScale(dataX[i].toString()) || 0)
      .y((d) => yScale(d) || 0);

    // Append the line path
    g.append("path")
      .datum(accumulatedY)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots for each data point
    g.selectAll(".dot")
      .datum(accumulatedY)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(dataX[i].toString()) || 0)
      .attr("cy", (d) => yScale(d) || 0)
      .attr("r", 4)
      .attr("fill", "red");
  }, [dataX, dataY, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
