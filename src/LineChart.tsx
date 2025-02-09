import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

interface LineChartProps {
  dataX: number[];
  dataY: number[];
  dataToneX: number[];
  dataToneY: number[];
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({
  dataX,
  dataY,
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
          const lastValue = accumulated[accumulated.length - 1] || 0;
          accumulated.push(lastValue + current);
          return accumulated;
        },
        [] as number[]
      )

    const accumulatedY = accumulate(dataY);
    const accumulatedX = accumulate(dataX);
    const accumulatedToneY = accumulate(dataToneY);
    const accumulatedToneX = accumulate(dataToneX);

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
        Math.min(...accumulatedX, ...accumulatedToneX),
        Math.max(...accumulatedX, ...accumulatedToneX),
      ])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(...accumulatedY, ...accumulatedToneY),
        Math.max(...accumulatedY, ...accumulatedToneY),
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

    // Generador de líneas
    const lineGenerator = d3
      .line<number>()
      .x((_, i) => xScale(accumulatedX[i]))
      .y((d) => yScale(d));

    const lineGeneratorTone = d3
      .line<number>()
      .x((_, i) => xScale(accumulatedToneX[i]))
      .y((d) => yScale(d));

  // Agregar etiqueta al eje X (por ejemplo, "Tiempo (s)")
  g.append("text")
    .attr("x", innerWidth / 2) // Centrar en el eje X
    .attr("y", innerHeight + margin.bottom - 10) // Ajustar posición abajo
    .attr("text-anchor", "middle") // Alinear el texto al centro
    .style("fill", "white") // Color del texto
    .style("font-size", "10") // Color del texto
    .text("Porcentaje del texto"); // Texto de la unidad

    // Dibujar primera línea
    g.append("path")
      .datum(accumulatedY)
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator);

    // Dibujar segunda línea (dataTone)
    g.append("path")
      .datum(accumulatedToneY)
      .attr("fill", "none")
      .attr("stroke", "#d95645") // Diferente color
      .attr("stroke-width", 1.5)
      .attr("d", lineGeneratorTone);

    // Agregar puntos para la primera línea
    g.selectAll(".dot")
      .data(accumulatedY)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(accumulatedX[i]))
      .attr("cy", (d) => yScale(d))
      .attr("r", 3)
      .attr("fill", "white");

    // Agregar puntos para la segunda línea
    g.selectAll(".dot-tone")
      .data(accumulatedToneY)
      .enter()
      .append("circle")
      .attr("cx", (_, i) => xScale(accumulatedToneX[i]))
      .attr("cy", (d) => yScale(d))
      .attr("r", 3)
      .attr("fill", "#d95645");

    const legend = svg.append("g").attr("transform", `translate(60, 20)`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 12)
      .attr("width", 8)
      .attr("height", 8)
      .attr("fill", "white");

    legend
      .append("text")
      .attr("x", 12)
      .attr("y", 19)
      .attr("fill", "white")
      .attr("font-size", "8px")
      .text("Respiración");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 8)
      .attr("height", 8)
      .attr("fill", "#d95645");

    legend
      .append("text")
      .attr("x", 12)
      .attr("y", 7)
      .attr("fill", "#d95645")
      .attr("font-size", "8px")
      .text("Ritmo");
  }, [dataX, dataY, dataToneX, dataToneY, width, height]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;
