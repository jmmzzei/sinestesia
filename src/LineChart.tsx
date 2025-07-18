import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface LineChartProps {
  dataToneX: number[];
  dataToneY: number[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  dataToneX,
  dataToneY,
  width = 800,
  height = 180,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Función para calcular valores acumulados
    const accumulate = (data: number[]) =>
      data.reduce(
        (accumulated, current) => {
          const lastValue = accumulated[accumulated.length - 1]?.value || 0;
          if (current == 3) {
            accumulated.push({ value: lastValue, t: true });
          } else {
            accumulated.push({ value: lastValue + current, t: false });
          }
          return accumulated;
        },
        [] as { value: number, t: boolean }[]
      )

    const accumulatedToneY = accumulate(dataToneY);
    const accumulatedToneX = accumulate(dataToneX).map(e => e.value);

    // Limpiar el SVG
    d3.select(svgRef.current).selectAll("*").remove();

    // Dimensiones y márgenes
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Crear escalas
    const xScale = d3
      .scaleLinear()
      .domain([
        Math.min(...accumulatedToneX),
        Math.max(...accumulatedToneX),
      ])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(...accumulatedToneY.map(e => e.value)),
        Math.max(...accumulatedToneY.map(e => e.value)),
      ])
      .nice()
      .range([innerHeight, 0]);

    // Crear el contenedor SVG
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Agregar ejes
    g.append("g").call(d3.axisLeft(yScale)).attr("class", "axis-y");

    g.append("g")
      .call(d3.axisBottom(xScale))
      .attr("class", "axis-x")
      .attr("transform", `translate(0,${innerHeight})`);

    // Function to split data into segments and skip segments where the end value is 3
    const splitIntoSegments2 = (xData: number[], yData: { value: number; t: boolean }[]) => {
      const segments: { x: number; y: number }[][] = [];
      let currentSegment: { x: number; y: number }[] = [];

      for (let i = 0; i < yData.length; i++) {
        // Add the current data point to the current segment
        currentSegment.push({ x: xData[i], y: yData[i].value });

        // Check if we're at the last point or if the next value is 3
        if (i === yData.length - 1 || yData[i + 1].t) {
          segments.push(currentSegment);
          currentSegment = [];
        }
      }

      return segments;
    };


    // Split data into segments
    const toneSegments2 = splitIntoSegments2(accumulatedToneX, accumulatedToneY);

    // Agregar etiqueta al eje X (por ejemplo, "Tiempo (s)")
    g.append("text")
      .attr("x", innerWidth / 2) // Centrar en el eje X
      .attr("y", innerHeight + margin.bottom - 10) // Ajustar posición abajo
      .attr("text-anchor", "middle") // Alinear el texto al centro
      .style("fill", "white") // Color del texto
      .style("font-size", "10") // Color del texto
      .text("Porcentaje del texto"); // Texto de la unidad

    // Dibujar segunda línea (dataTone)
    toneSegments2.forEach((segment) => {
      g.append("path")
        .datum(segment)
        .attr("fill", "none")
        .attr("stroke", "#d95645")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<{ x: number; y: number }>()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y))
        );
    });

    // Agregar puntos para la segunda línea
    g.selectAll(".dot-tone")
      .data(accumulatedToneY)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(accumulatedToneX[i]))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 3)
      .attr("fill", "#d95645");

    const legend = svg.append("g").attr("transform", `translate(60, 20)`);

    legend
      .append("text")
      .attr("x", 5)
      .attr("y", -5)
      .attr("fill", "#d95645")
      .attr("font-size", "14px")
      .text("Orografía");
  }, [dataToneX, dataToneY, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
