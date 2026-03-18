import React, { useEffect, useState, useMemo, useRef, useLayoutEffect } from 'react';
import HeatmapLegend from './HeatmapLegend';

// Color swatches from legacy code
const BlueColorTable = ["#f7fbff", "#e3eef9", "#cfe1f2", "#b5d4e9", "#93c3df", "#6daed5", "#4b97c9", "#2f7ebc", "#1864aa", "#0a4a90", "#08306b"];
const GreenColorTable = ["#f7fcf5", "#e8f6e3", "#d3eecd", "#b7e2b1", "#97d494", "#73c378", "#4daf62", "#2f984f", "#157f3b", "#036429", "#00441b"];
const GreyColorTable = ["#ffffff", "#f2f2f2", "#e2e2e2", "#cecece", "#b4b4b4", "#979797", "#7a7a7a", "#5f5f5f", "#404040", "#1e1e1e", "#000000"];
const OrangeColorTable = ["#fff5eb", "#fee8d3", "#fdd8b3", "#fdc28c", "#fda762", "#fb8d3d", "#f2701d", "#e25609", "#c44103", "#9f3303", "#7f2704"];
const PurpleColorTable = ["#fcfbfd", "#f1eff6", "#e2e1ef", "#cecee5", "#b6b5d8", "#9e9bc9", "#8782bc", "#7363ac", "#61409b", "#501f8c", "#3f007d"];
const RedColorTable = ["#fff5f0", "#fee3d6", "#fdc9b4", "#fcaa8e", "#fc8a6b", "#f9694c", "#ef4533", "#d92723", "#bb151a", "#970b13", "#67000d"];

const takeErrNeg = [-.005, -.01, -.02, -.04, -.08, -.16, -.32, -.64, -1.28, -2.56, -5.12];
const takeErrPos = [.005, .01, .02, .04, .08, .16, .32, .64, 1.28, 2.56, 5.12];

const getCellData = (cubeLevel, contextLine) => {
  let DTEq = 0, NDEq = 0;
  switch (cubeLevel) {
    case 0: DTEq = contextLine.DTEq0; NDEq = contextLine.NDEq0; break;
    case 1: DTEq = contextLine.DTEq1; NDEq = contextLine.NDEq1; break;
    case 2: DTEq = contextLine.DTEq2; NDEq = contextLine.NDEq2; break;
    case 3: DTEq = contextLine.DTEq3; NDEq = contextLine.NDEq3; break;
    case 4: DTEq = contextLine.DTEq4; NDEq = contextLine.NDEq4; break;
    default: DTEq = contextLine.DTEq0; NDEq = contextLine.NDEq0; break;
  }
  let DubErrVal = Math.min(DTEq, 1) - NDEq;
  let TakeErrVal = 1 - DTEq;
  let actionColor = "#979797";
  if (NDEq === 9999) { actionColor = 'black'; }
  else if (NDEq > 1) {
    if (DTEq > 1) actionColor = '#fb8d3d';
    else actionColor = 'yellow';
  } else {
    if (DTEq > 1) actionColor = '#d92723';
    else if (DTEq > NDEq) actionColor = '#6daed5';
  }
  return { DubErrVal, TakeErrVal, actionColor, DTEq, NDEq };
};

const getBackgroundColor = (dataType, errVal, DTEq, NDEq, actionColor) => {
  if (dataType === 'Action') return actionColor;
  let color = "#fff";
  if (dataType === 'Take') {
    if (errVal < 0) {
      if (errVal < -100) return 'black';
      for (let j = 0; j < OrangeColorTable.length; j++) {
        if (errVal < takeErrNeg[j]) color = RedColorTable[j];
      }
    } else if (errVal > 0) {
      for (let j = 0; j < GreenColorTable.length; j++) {
        if (errVal > takeErrPos[j]) color = BlueColorTable[j];
      }
    }
  } else if (dataType === 'Double') {
    if (errVal < 0) {
      if (errVal < -100) return 'black';
      for (let j = 0; j < PurpleColorTable.length; j++) {
        if (NDEq > 1) {
          if (errVal < takeErrNeg[j]) color = OrangeColorTable[j];
        } else {
          if (errVal < takeErrNeg[j]) color = GreyColorTable[j];
        }
      }
    } else if (errVal > 0) {
      for (let j = 0; j < GreenColorTable.length; j++) {
        if (errVal > takeErrPos[j]) color = BlueColorTable[j];
      }
    }
  }
  return color;
};

const getContrastColor = (color) => {
  if (!color || color === 'transparent') return 'black';

  // Handle standard CSS color names used in the app
  const colorMap = {
    'white': '#ffffff',
    'black': '#000000',
    'yellow': '#ffff00',
    'transparent': '#ffffff'
  };
  
  let hex = color.startsWith('#') ? color : (colorMap[color.toLowerCase()] || '#ffffff');
  
  // Expand 3-digit hex to 6-digit
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }

  if (hex.startsWith('#') && hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // YIQ formula for luminance
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? 'black' : 'white';
  }
  
  return 'black';
};

const Heatmap = ({ positionIndex, mlength = 15, cubeLevel = 0, dataType = 'Action', globalVisibility = 'Show', showData = true, isMobile = false }) => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [cellSize, setCellSize] = useState(25);
  const [labelFontSize, setLabelFontSize] = useState(14);
  const [overriddenKeys, setOverriddenKeys] = useState(new Set());
  const containerRef = useRef(null); // Outermost panel

  useEffect(() => {
    setOverriddenKeys(new Set());
    const checkData = () => {
      const context = window.CubeContext;
      const cards = window.CubeCard;
      if (context && cards && Object.keys(context).length > 0) {
        setDataLoaded(true);
      } else {
        setTimeout(checkData, 500);
      }
    };
    checkData();
  }, [positionIndex, globalVisibility]);

  const gridCellsData = useMemo(() => {
    if (!dataLoaded || !window.CubeContext || !window.CubeCard || positionIndex == null) {
      return { cells: [], actualLength: 0 };
    }
    const cardEntry = window.CubeCard[positionIndex];
    if (!cardEntry) return { cells: [], actualLength: 0 };
    const contextId = cardEntry[0];
    const contextData = window.CubeContext[contextId];
    if (!contextData) return { cells: [], actualLength: 0 };
    
    const totalItems = contextData.length;
    const gridSize = Math.round(Math.sqrt(totalItems));
    const maxIndex = totalItems - 1;
    const actualLength = Math.min(mlength, gridSize + 1);
    
    let cells = [];
    for (let myneed = 2; myneed <= actualLength; myneed++) {
      for (let youneed = 2; youneed <= actualLength; youneed++) {
        const key = myneed + "-" + youneed;
        const mappedIndex = maxIndex - ((myneed - 2) * gridSize + (youneed - 2));
        const lineData = contextData[mappedIndex];
        if (!lineData) continue;
        const { DubErrVal, TakeErrVal, actionColor, DTEq, NDEq } = getCellData(cubeLevel, lineData);
        let valToRender = dataType === 'Take' ? TakeErrVal : dataType === 'Double' ? DubErrVal : '';
        const naturalBackground = getBackgroundColor(dataType, valToRender, DTEq, NDEq, actionColor);
        
        const isCurrentlyVisible = (globalVisibility === 'Show') !== overriddenKeys.has(key);
        const background = isCurrentlyVisible ? naturalBackground : 'black';

        // Apply numerical display rules:
        // 1. Only show if currently visible.
        // 2. If Match Length > 15, do not show numbers.
        // 3. If absolute value of equity > 20, do not show number.
        let finalVal = (isCurrentlyVisible && showData && valToRender !== '' && mlength <= 15 && Math.abs(valToRender) <= 20) 
          ? valToRender.toFixed(3) 
          : '';

        cells.push({
          myneed, youneed, key, background,
          val: finalVal,
          textColor: getContrastColor(background),
          isDiagonal: myneed === youneed
        });
      }
    }
    return { cells, actualLength };
  }, [dataLoaded, positionIndex, mlength, cubeLevel, dataType, showData, globalVisibility, overriddenKeys]);

  const actualLength = gridCellsData.actualLength || 15;

  const toggleCell = (key) => {
    setOverriddenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const el = containerRef.current;
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      
      // Calculate available space inside the .panel.glass
      const availableWidth = isMobile ? rect.width : rect.width - 32; 
      const availableHeight = isMobile ? window.innerHeight : rect.height - 110; 
      const unitSize = Math.min(availableWidth, availableHeight);

      // Label Scaling: Reduced size for relocated legend layout
      const calculatedLabelSize = Math.max(10, Math.floor(unitSize / 35));
      setLabelFontSize(calculatedLabelSize);
      
      const gaps = actualLength - 1;
      
      // total units = actualLength + 1 (for headers) + padding space
      const totalUnits = actualLength + 1; 
      const overhead = isMobile ? 25 : 40; // Less overhead for row headers on mobile
      const cellPx = Math.floor((unitSize - gaps - overhead) / totalUnits);
      
      if (cellPx > 2) {
        setCellSize(cellPx);
      }
    };

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    updateSize(); // Initial call
    
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [actualLength, dataLoaded]);

  if (!dataLoaded) {
    return (
      <div className="panel" style={{ flex: 1, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div> Loading Analysis...
      </div>
    );
  }

  const { cells: gridCells } = gridCellsData;
  const trackSize = `${cellSize}px`;

  const itemStyle = {
    width: isMobile ? '100.2%' : trackSize, // Tiny overlap to ensure no 1px gaps between rows
    height: isMobile ? 'auto' : trackSize,
    aspectRatio: isMobile ? '1 / 1' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    fontSize: `${Math.max(6, Math.floor(cellSize * 0.35))}px`,
    lineHeight: 1
  };

  return (
    <div ref={containerRef} className="panel glass" style={{ 
      flex: 1,
      width: '100%', 
      margin: '0', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column', 
      minWidth: 0, 
      minHeight: 0,
      padding: isMobile ? '8px 0' : '8px 16px',
      position: 'relative'
    }}>
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '16px',
          fontWeight: 'bold',
          fontSize: '13.6px',
          color: 'var(--text-primary)',
          zIndex: 10
        }}>
          Score Data
        </div>
      )}
      <div style={{ 
        flex: 1, 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: isMobile ? 'flex-start' : 'center', // Don't center on mobile, let it fill width
        overflow: 'hidden',
        gap: '2px'
      }}>
        {/* Taker Needs Header */}
        <div style={{ 
          width: '100%', 
          textAlign: 'center', 
          fontWeight: 'bold', 
          fontSize: isMobile ? '14px' : `${labelFontSize}px`,
          // Offset for vertical label + row headers
          paddingLeft: isMobile ? `${100 / actualLength}%` : `${labelFontSize * 2}px`, 
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Taker Needs
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Doubler Needs Vertical Label (Desktop Only) */}
          {!isMobile && (
            <div style={{ 
              writingMode: 'vertical-rl', 
              textOrientation: 'upright',
              fontWeight: 'bold',
              fontSize: `${labelFontSize}px`,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: `${labelFontSize}px`
            }}>
              Doubler Needs
            </div>
          )}

          {/* Corrected Grid with explicit tracks */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? `repeat(${actualLength}, 1fr)` : `repeat(${actualLength}, ${trackSize})`,
            gridTemplateRows: isMobile ? 'auto' : `repeat(${actualLength}, ${trackSize})`,
            gap: isMobile ? '0' : '1px', // 0 gap on mobile for maximum volume
            backgroundColor: 'var(--border-color)',
            border: 'none',
            borderRadius: isMobile ? '0' : '4px',
            overflow: 'hidden',
            width: isMobile ? '100%' : 'max-content',
            height: 'max-content',
            boxSizing: 'border-box',
            margin: isMobile ? '0' : '0 auto' // Ensure no side margins on mobile
          }}>
            {/* Top Left Empty Corner */}
            <div style={{ ...itemStyle, background: 'var(--bg-primary)' }}></div>
            {/* Top Header Row (Needs) */}
            {Array.from({ length: actualLength - 1 }).map((_, i) => (
              <div key={"head-" + (i+2)} style={{ ...itemStyle, background: 'var(--bg-primary)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{i + 2}</div>
            ))}
            {/* Grid Rows */}
            {Array.from({ length: actualLength - 1 }).map((_, rowIdx) => {
              const myneed = rowIdx + 2;
              const rowCells = gridCells.filter(c => c.myneed === myneed);
              return (
                <React.Fragment key={"row-" + myneed}>
                  <div style={{ ...itemStyle, background: 'var(--bg-primary)', fontWeight: 'bold', color: 'var(--text-primary)' }}>{myneed}</div>
                  {rowCells.map(cell => (
                    <div 
                      key={cell.key} 
                      style={{ ...itemStyle, background: cell.background, cursor: 'pointer' }}
                      onClick={() => toggleCell(cell.key)}
                    >
                      {cell.isDiagonal && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left top, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.3) 8%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 100%)' }} />}
                      {cell.val && <span style={{ zIndex: 1, color: cell.textColor }}>{cell.val}</span>}
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doubler Needs Label (Mobile Only, Left Justified) */}
      {isMobile && (
        <div style={{
          width: '100%',
          textAlign: 'left',
          paddingLeft: '10px',
          marginTop: '12px',
          fontWeight: 'bold',
          fontSize: '14px',
          color: 'var(--text-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Doubler Needs
        </div>
      )}

      {/* Legend & Spacer (Desktop Only) */}
      {!isMobile && (
        <>
          <div style={{ 
            width: '100%', 
            borderTop: '1px solid var(--border-color)', 
            margin: '12px 0',
            opacity: 0.6
          }} />
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            paddingBottom: '8px' 
          }}>
            <HeatmapLegend dataType={dataType} />
          </div>
        </>
      )}
    </div>
  );
};

export default Heatmap;
