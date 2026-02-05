/**
 * Custom Walter-Lieth Climate Diagram
 * Renders climate charts without external dependencies
 */

// Global data array used by ui.js
var data = [
  { month: "Jan", temp: 0, prec: 0 },
  { month: "Feb", temp: 0, prec: 0 },
  { month: "Mär", temp: 0, prec: 0 },
  { month: "Apr", temp: 0, prec: 0 },
  { month: "Mai", temp: 0, prec: 0 },
  { month: "Jun", temp: 0, prec: 0 },
  { month: "Jul", temp: 0, prec: 0 },
  { month: "Aug", temp: 0, prec: 0 },
  { month: "Sep", temp: 0, prec: 0 },
  { month: "Okt", temp: 0, prec: 0 },
  { month: "Nov", temp: 0, prec: 0 },
  { month: "Dez", temp: 0, prec: 0 }
];

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    months: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    colors: {
      tempLine: '#ef4444',
      tempLineCold: '#3b82f6',
      precBar: '#3b82f6',
      precBarDense: '#2563eb',
      wetFill: 'rgba(59, 130, 246, 0.3)',
      dryFill: 'rgba(245, 158, 11, 0.4)',
      freezeFill: 'rgba(107, 114, 128, 0.15)',
      gridLine: '#e5e7eb',
      axisLine: '#9ca3af',
      text: '#6b7280',
      textDark: '#1a1d23'
    },
    padding: { top: 30, right: 50, bottom: 40, left: 50 },
    tempMin: -50,
    tempMax: 60,
    precMax: 300 // Visual max for precipitation
  };

  // Current chart data
  let currentData = null;
  let canvas = null;
  let ctx = null;
  let tooltip = null;
  let chartBounds = null;

  /**
   * Initialize the chart
   */
  function initChart() {
    const container = document.getElementById('chartdiv-2');
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    // Create canvas
    canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Create tooltip element
    tooltip = document.createElement('div');
    tooltip.className = 'climate-tooltip';
    tooltip.style.display = 'none';
    container.appendChild(tooltip);

    // Set up canvas size
    resizeCanvas();

    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', debounce(resizeCanvas, 100));
  }

  /**
   * Resize canvas to match container
   */
  function resizeCanvas() {
    if (!canvas) return;
    
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    
    // Recalculate bounds
    chartBounds = {
      width: rect.width,
      height: rect.height,
      plotLeft: CONFIG.padding.left,
      plotRight: rect.width - CONFIG.padding.right,
      plotTop: CONFIG.padding.top,
      plotBottom: rect.height - CONFIG.padding.bottom
    };
    chartBounds.plotWidth = chartBounds.plotRight - chartBounds.plotLeft;
    chartBounds.plotHeight = chartBounds.plotBottom - chartBounds.plotTop;
    
    // Redraw if we have data
    if (currentData) {
      drawChart(currentData);
    }
  }

  /**
   * Transform precipitation value for display (Walter-Lieth convention)
   * Values above 100mm are compressed by factor of 10
   */
  function transformPrec(prec) {
    const halfPrec = prec / 2; // Scale: 20mm = 10°C, so divide by 2
    if (halfPrec > 50) {
      return 50 + (halfPrec - 50) / 10;
    }
    return halfPrec;
  }

  /**
   * Convert temperature to Y coordinate
   */
  function tempToY(temp) {
    const range = CONFIG.tempMax - CONFIG.tempMin;
    const normalized = (CONFIG.tempMax - temp) / range;
    return chartBounds.plotTop + normalized * chartBounds.plotHeight;
  }

  /**
   * Convert month index to X coordinate (center of bar)
   */
  function monthToX(monthIndex) {
    const barWidth = chartBounds.plotWidth / 12;
    return chartBounds.plotLeft + barWidth * monthIndex + barWidth / 2;
  }

  /**
   * Draw the complete chart
   */
  function drawChart(data) {
    if (!ctx || !chartBounds) return;
    
    currentData = data;
    
    // Clear canvas
    ctx.clearRect(0, 0, chartBounds.width, chartBounds.height);
    
    // Transform data
    const transformedData = data.map(d => ({
      ...d,
      precTransformed: transformPrec(d.prec)
    }));
    
    // Draw components in order (back to front)
    drawGrid();
    drawFreezingZone(transformedData);
    drawAreaFills(transformedData);
    drawPrecBars(transformedData);
    drawTempLine(transformedData);
    drawAxes();
    drawLabels();
  }

  /**
   * Draw grid lines
   */
  function drawGrid() {
    ctx.strokeStyle = CONFIG.colors.gridLine;
    ctx.lineWidth = 1;
    
    // Horizontal grid lines for temperature scale
    const tempSteps = [-40, -20, 0, 20, 40];
    tempSteps.forEach(temp => {
      const y = tempToY(temp);
      ctx.beginPath();
      ctx.moveTo(chartBounds.plotLeft, y);
      ctx.lineTo(chartBounds.plotRight, y);
      ctx.stroke();
    });
    
    // Special styling for 0°C and 50 (100mm) lines
    ctx.strokeStyle = CONFIG.colors.axisLine;
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    
    // 0°C line
    const zeroY = tempToY(0);
    ctx.beginPath();
    ctx.moveTo(chartBounds.plotLeft, zeroY);
    ctx.lineTo(chartBounds.plotRight, zeroY);
    ctx.stroke();
    
    // 100mm (50 on transformed scale) line
    const hundredY = tempToY(50);
    ctx.beginPath();
    ctx.moveTo(chartBounds.plotLeft, hundredY);
    ctx.lineTo(chartBounds.plotRight, hundredY);
    ctx.stroke();
    
    ctx.setLineDash([]);
  }

  /**
   * Draw freezing zone with hatching pattern
   */
  function drawFreezingZone(data) {
    const zeroY = tempToY(0);
    const barWidth = chartBounds.plotWidth / 12;
    
    // Check each month for freezing temperatures
    data.forEach((d, i) => {
      if (d.temp < 0) {
        const x = chartBounds.plotLeft + barWidth * i;
        const y = tempToY(d.temp);
        
        // Draw hatched area below 0
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, zeroY, barWidth, Math.abs(y - zeroY));
        ctx.clip();
        
        // Hatching pattern
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
        ctx.lineWidth = 1;
        for (let j = -chartBounds.plotHeight; j < chartBounds.plotWidth; j += 6) {
          ctx.beginPath();
          ctx.moveTo(x + j, zeroY + chartBounds.plotHeight);
          ctx.lineTo(x + j + chartBounds.plotHeight, zeroY);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  }

  /**
   * Draw area fills between temp line and prec bars
   */
  function drawAreaFills(data) {
    const barWidth = chartBounds.plotWidth / 12;
    
    // Draw wet (humid) and dry areas
    data.forEach((d, i) => {
      const x = chartBounds.plotLeft + barWidth * i;
      const tempY = tempToY(d.temp);
      const precY = tempToY(d.precTransformed);
      
      if (d.precTransformed > d.temp) {
        // Wet period: precipitation > temperature (blue fill)
        ctx.fillStyle = CONFIG.colors.wetFill;
        ctx.beginPath();
        ctx.rect(x, tempY, barWidth, precY - tempY);
        ctx.fill();
      } else if (d.temp > d.precTransformed) {
        // Dry period: temperature > precipitation (yellow/orange stippled)
        ctx.fillStyle = CONFIG.colors.dryFill;
        ctx.beginPath();
        ctx.rect(x, precY, barWidth, tempY - precY);
        ctx.fill();
        
        // Add stipple pattern for dry periods
        drawStipple(x, precY, barWidth, tempY - precY);
      }
    });
  }

  /**
   * Draw stipple pattern for dry periods
   */
  function drawStipple(x, y, width, height) {
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    const spacing = 6;
    for (let px = x + 3; px < x + width; px += spacing) {
      for (let py = y + 3; py < y + height; py += spacing) {
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draw precipitation bars
   */
  function drawPrecBars(data) {
    const barWidth = chartBounds.plotWidth / 12;
    const barPadding = barWidth * 0.15;
    const actualBarWidth = barWidth - barPadding * 2;
    const zeroY = tempToY(0);
    const fiftyY = tempToY(50); // 100mm threshold
    
    data.forEach((d, i) => {
      const x = chartBounds.plotLeft + barWidth * i + barPadding;
      const precY = tempToY(d.precTransformed);
      const barHeight = zeroY - precY;
      
      if (d.precTransformed > 50) {
        // Draw dense portion (above 100mm) in darker blue
        ctx.fillStyle = CONFIG.colors.precBarDense;
        ctx.fillRect(x, precY, actualBarWidth, fiftyY - precY);
        
        // Draw normal portion in lighter blue
        ctx.fillStyle = CONFIG.colors.precBar;
        ctx.fillRect(x, fiftyY, actualBarWidth, zeroY - fiftyY);
      } else {
        // All in normal blue
        ctx.fillStyle = CONFIG.colors.precBar;
        ctx.fillRect(x, precY, actualBarWidth, barHeight);
      }
    });
  }

  /**
   * Draw temperature line
   */
  function drawTempLine(data) {
    const barWidth = chartBounds.plotWidth / 12;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw line segments, changing color at 0°C
    for (let i = 0; i < data.length; i++) {
      const x1 = monthToX(i);
      const y1 = tempToY(data[i].temp);
      
      if (i < data.length - 1) {
        const x2 = monthToX(i + 1);
        const y2 = tempToY(data[i + 1].temp);
        
        // Check if crossing zero
        if ((data[i].temp >= 0 && data[i + 1].temp < 0) || 
            (data[i].temp < 0 && data[i + 1].temp >= 0)) {
          // Find crossing point
          const zeroY = tempToY(0);
          const ratio = (0 - data[i].temp) / (data[i + 1].temp - data[i].temp);
          const crossX = x1 + (x2 - x1) * ratio;
          
          // Draw segment before crossing
          ctx.strokeStyle = data[i].temp >= 0 ? CONFIG.colors.tempLine : CONFIG.colors.tempLineCold;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(crossX, zeroY);
          ctx.stroke();
          
          // Draw segment after crossing
          ctx.strokeStyle = data[i + 1].temp >= 0 ? CONFIG.colors.tempLine : CONFIG.colors.tempLineCold;
          ctx.beginPath();
          ctx.moveTo(crossX, zeroY);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        } else {
          // Normal segment
          ctx.strokeStyle = data[i].temp >= 0 ? CONFIG.colors.tempLine : CONFIG.colors.tempLineCold;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
      
      // Draw point
      ctx.fillStyle = data[i].temp >= 0 ? CONFIG.colors.tempLine : CONFIG.colors.tempLineCold;
      ctx.beginPath();
      ctx.arc(x1, y1, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draw axes and labels
   */
  function drawAxes() {
    ctx.strokeStyle = CONFIG.colors.axisLine;
    ctx.lineWidth = 1.5;
    
    // Left axis (temperature)
    ctx.beginPath();
    ctx.moveTo(chartBounds.plotLeft, chartBounds.plotTop);
    ctx.lineTo(chartBounds.plotLeft, chartBounds.plotBottom);
    ctx.stroke();
    
    // Right axis (precipitation)
    ctx.beginPath();
    ctx.moveTo(chartBounds.plotRight, chartBounds.plotTop);
    ctx.lineTo(chartBounds.plotRight, chartBounds.plotBottom);
    ctx.stroke();
    
    // Bottom axis
    ctx.beginPath();
    ctx.moveTo(chartBounds.plotLeft, chartBounds.plotBottom);
    ctx.lineTo(chartBounds.plotRight, chartBounds.plotBottom);
    ctx.stroke();
  }

  /**
   * Draw axis labels
   */
  function drawLabels() {
    ctx.font = '10px "Sora", sans-serif';
    ctx.textAlign = 'center';
    
    // Month labels
    ctx.fillStyle = CONFIG.colors.text;
    CONFIG.months.forEach((month, i) => {
      const x = monthToX(i);
      ctx.fillText(month, x, chartBounds.plotBottom + 16);
    });
    
    // Temperature labels (left axis)
    ctx.textAlign = 'right';
    const tempLabels = [60, 40, 20, 0, -20, -40];
    tempLabels.forEach(temp => {
      const y = tempToY(temp);
      ctx.fillText(temp + '°', chartBounds.plotLeft - 6, y + 3);
    });
    
    // Precipitation labels (right axis)
    ctx.textAlign = 'left';
    const precLabels = [
      { value: 60, label: '300' },
      { value: 50, label: '100' },
      { value: 40, label: '80' },
      { value: 30, label: '60' },
      { value: 20, label: '40' },
      { value: 10, label: '20' },
      { value: 0, label: '0' }
    ];
    precLabels.forEach(p => {
      const y = tempToY(p.value);
      ctx.fillText(p.label, chartBounds.plotRight + 6, y + 3);
    });
    
    // Axis titles
    ctx.font = 'bold 11px "Sora", sans-serif';
    ctx.fillStyle = CONFIG.colors.textDark;
    
    // Temperature title
    ctx.save();
    ctx.translate(12, chartBounds.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Temperatur (°C)', 0, 0);
    ctx.restore();
    
    // Precipitation title
    ctx.save();
    ctx.translate(chartBounds.width - 8, chartBounds.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Niederschlag (mm)', 0, 0);
    ctx.restore();
  }

  /**
   * Handle mouse move for tooltips
   */
  function handleMouseMove(e) {
    if (!currentData || !chartBounds || !tooltip) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is in plot area
    if (x < chartBounds.plotLeft || x > chartBounds.plotRight ||
        y < chartBounds.plotTop || y > chartBounds.plotBottom) {
      tooltip.style.display = 'none';
      return;
    }
    
    // Find which month the mouse is over
    const barWidth = chartBounds.plotWidth / 12;
    const monthIndex = Math.floor((x - chartBounds.plotLeft) / barWidth);
    
    if (monthIndex >= 0 && monthIndex < 12 && currentData[monthIndex]) {
      const data = currentData[monthIndex];
      
      // Show tooltip
      tooltip.innerHTML = `
        <div class="tooltip-header">${CONFIG.months[monthIndex]}</div>
        <div class="tooltip-row">
          <span class="tooltip-label">Temperatur:</span>
          <span class="tooltip-value tooltip-temp">${data.temp.toFixed(1)}°C</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Niederschlag:</span>
          <span class="tooltip-value tooltip-prec">${data.prec.toFixed(0)} mm</span>
        </div>
      `;
      
      // Position tooltip
      const tooltipRect = tooltip.getBoundingClientRect();
      let tooltipX = x + 15;
      let tooltipY = y - 10;
      
      // Keep tooltip in bounds
      if (tooltipX + 150 > chartBounds.width) {
        tooltipX = x - 160;
      }
      if (tooltipY < 0) {
        tooltipY = y + 15;
      }
      
      tooltip.style.left = tooltipX + 'px';
      tooltip.style.top = tooltipY + 'px';
      tooltip.style.display = 'block';
      
      // Highlight the current month
      drawChart(currentData);
      highlightMonth(monthIndex);
    }
  }

  /**
   * Highlight a specific month
   */
  function highlightMonth(monthIndex) {
    const barWidth = chartBounds.plotWidth / 12;
    const x = chartBounds.plotLeft + barWidth * monthIndex;
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.fillRect(x, chartBounds.plotTop, barWidth, chartBounds.plotHeight);
  }

  /**
   * Handle mouse leave
   */
  function handleMouseLeave() {
    if (tooltip) {
      tooltip.style.display = 'none';
    }
    // Redraw without highlight
    if (currentData) {
      drawChart(currentData);
    }
  }

  /**
   * Debounce helper
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Public API: Create a new graph with data
   */
  function createNewGraph(data) {
    if (!canvas) {
      initChart();
    }
    
    // Transform data to expected format
    const chartData = data.map((d, i) => ({
      month: CONFIG.months[i],
      temp: d.temp,
      prec: d.prec
    }));
    
    drawChart(chartData);
  }

  /**
   * Public API: Delete/clear the graph
   */
  function deleteGraph() {
    currentData = null;
    if (ctx && chartBounds) {
      ctx.clearRect(0, 0, chartBounds.width, chartBounds.height);
    }
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChart);
  } else {
    initChart();
  }

  // Expose public API
  window.createNewGraph = createNewGraph;
  window.deleteGraph = deleteGraph;

})();
