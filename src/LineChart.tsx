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

    // Calculate the accumulated Y values
    const accumulatedY = dataY.reduce((accumulated, current) => {
      const lastValue = accumulated[accumulated.length - 1] || 0;
      accumulated.push(lastValue + current);
      return accumulated;
    }, [] as number[]);


    // Calculate the accumulated X values (page numbers)
    const accumulatedX = dataX.reduce((accumulated, current) => {
      const lastValue = accumulated[accumulated.length - 1] || 0;
      accumulated.push(lastValue + current);
      return accumulated;
    }, [] as number[]);

    // Clear the SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create margins and dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleLinear()
      // .domain([Math.min(...accumulatedX), dataX[dataX.length - 1]]) // Scale based on the accumulatedX values

      .domain([Math.min(...accumulatedX), Math.max(...accumulatedX)]) // Scale based on the accumulatedX values
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([Math.min(...accumulatedY), Math.max(...accumulatedY)])
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
      .call(d3.axisBottom(xScale)) // Use xScale for bottom axis
      .attr("class", "axis-x")
      .attr("transform", `translate(0,${innerHeight})`);

    // Line generator
    const line = d3
      .line<number>()
      .x((_, i) => xScale(accumulatedX[i])) // Use xScale to position points on the x-axis
      .y((d) => yScale(d));

    // Append the line path
    g.append("path")
      .datum(accumulatedY)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots for each data point
    g.selectAll(".dot")
      .data(accumulatedY) // Link each point to its corresponding value in accumulatedY
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(accumulatedX[i])) // Position based on dataX
      .attr("cy", (d) => yScale(d)) // Position based on accumulatedY
      .attr("r", 4)
      .attr("fill", "red");
  }, [dataX, dataY, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
