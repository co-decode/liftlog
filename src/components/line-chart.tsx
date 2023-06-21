import React, { useEffect, useRef } from 'react';
import { select, line, curveLinear } from 'd3';

interface LineChartProps {
  width: number,
  height: number,
}

const LineChart = ({ width, height }: LineChartProps) => {
  const chartRef = useRef(null);
  useEffect(() => {
    const data: [number, number][] = [
      [0, 10],
      [1, 20],
      [2, 15],
      [3, 25],
      [4, 35],
    ];
    const svg = select(chartRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const lineGenerator = line()
      .x((_, i) => i * (width / data.length))
      .y((d) => height - d[1])
      .curve(curveLinear);

    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', lineGenerator);
  }, [height, width]);

  return <div ref={chartRef}></div>;
};

export default LineChart;
