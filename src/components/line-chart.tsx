import React, { useEffect, useRef } from 'react';
import { select, line, curveLinear, scaleLinear, axisBottom, axisLeft, bisector, pointer, scaleTime, max, min, timeFormat, format } from 'd3';
import { Accumulators } from '@/pages/analysis';
import { useAuth } from './auth-and-context';

interface LineChartProps {
  width: number,
  height: number,
  data: [Date, number][]
  type: Accumulators
}

const LineChart = ({ width, height, data, type }: LineChartProps) => {
  const chartRef = useRef(null);
  const { weightUnit } = useAuth()
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark')
    const lineColour = isDarkMode ? 'hsl(213,31%,91%)' : 'hsl(222.2, 47.4%, 11.2%)'
    const highlightColour = isDarkMode ? 'hsl(0,63%,31%)' : 'hsl(0, 100%, 50%)'

    const ref = chartRef.current
    const svg = select(ref)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('overflow', 'visible')

    const xScale = scaleTime()
      .domain([data[0][0], data[data.length - 1][0]])
      //.nice()
      .range([0, width])

    const yScale = scaleLinear()
      .domain([min(data, (d) => d[1]) as number, max(data, (d) => d[1]) as number])
      .range([height, 0])

    const lineGenerator = line<[Date, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]))
      .curve(curveLinear);


    svg
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', lineColour)
      .attr('stroke-width', 1)
      .attr('d', lineGenerator);

    const formatTime = timeFormat('%e/%m')

    const xAxis = axisBottom(xScale)
      //.tickValues(data.map(d => d[0]))
      .ticks(6)
      .tickFormat(d => formatTime(d as Date))

    const yAxis = axisLeft(yScale)
      .ticks(data.length)
      .tickFormat(format("d"))
    //.tickFormat((d) => String(Math.round(d as number)))


    svg
      .append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    svg
      .append('g')
      .call(yAxis);

    const popover = select(chartRef.current)
      .append('div')
      .attr('class', 'popover')
      .style('opacity', 0)
      .style('font-size', '10px')
      .style('white-space', 'nowrap')
      .style('position', 'absolute')

    const highlight = select(chartRef.current)
      .append('div')
      .attr('class', 'popover')
      .style('opacity', 0)
      .style('position', 'absolute')

    svg.on('mouseover', showPopover).on('mousemove', updatePopover).on('mouseout', hidePopover);

    function showPopover() {
      popover.style('opacity', 1);
      highlight.style('opacity', 1);
    }

    function updatePopover(event: MouseEvent) {
      let pointerE = pointer(event)
      const closestPoint = findClosestPoint(pointerE[0]);

      const suffix =
        ["TOTALWEIGHT", "MAXIMUMWEIGHT", "AVERAGEWEIGHT"].includes(type)
          ? weightUnit
          : type === "TOTALSETS"
            ? "sets"
            : "reps"

      popover
        .html(`<div>${closestPoint[1]} ${suffix}</div><div>${formatTime(closestPoint[0])}</div>`)
        .style('left', pointerE[0] + 10 + 'px')
        .style('top', pointerE[1] + 10 + 'px');
      highlight
        .style('border', 'solid 3px ' + highlightColour)
        .style('border-radius', '50%')
        .style('transform', 'translate(-50%,-50%)')
        .style('left', xScale(closestPoint[0]) + 'px')
        .style('top', yScale(closestPoint[1]) + 'px');
    }

    function hidePopover() {
      popover.style('opacity', 0);
      highlight.style('opacity', 0);
    }

    function findClosestPoint(x: number) {
      return data.reduce((a, b) => {
        const distanceA = Math.abs(x - (xScale(a[0])));
        const distanceB = Math.abs(x - (xScale(b[0])));
        return distanceA < distanceB ? a : b;
      })
    }

    return () => {
      select(ref)
        .select('svg')
        .remove()
    }
  }, [height, width, data, type, weightUnit]);

  return <div className='relative' ref={chartRef}></div>;
};

export default LineChart;
