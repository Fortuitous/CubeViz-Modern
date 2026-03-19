import React from 'react';

const BlueColorTable = ["#f7fbff", "#e3eef9", "#cfe1f2", "#b5d4e9", "#93c3df", "#6daed5", "#4b97c9", "#2f7ebc", "#1864aa", "#0a4a90", "#08306b"];
const RedColorTable = ["#fff5f0", "#fee3d6", "#fdc9b4", "#fcaa8e", "#fc8a6b", "#f9694c", "#ef4533", "#d92723", "#bb151a", "#970b13", "#67000d"];
const GreyColorTable = ["#ffffff", "#f2f2f2", "#e2e2e2", "#cecece", "#b4b4b4", "#979797", "#7a7a7a", "#5f5f5f", "#404040", "#1e1e1e", "#000000"];
const OrangeColorTable = ["#fff5eb", "#fee8d3", "#fdd8b3", "#fdc28c", "#fda762", "#fb8d3d", "#f2701d", "#e25609", "#c44103", "#9f3303", "#7f2704"];

const takeErrPos = [".005", ".01", ".02", ".04", ".08", ".16", ".32", ".64", "1.3", "2.6", "5.1"];

const LegendCell = ({ color, text, width = 23, height = 23, fontSize = 9, isMobile }) => {
  // Simple light/dark check for text contrast
  const isLight = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    return hsp > 127.5;
  };

  return (
    <div style={{
      backgroundColor: color,
      width: isMobile ? 'auto' : `${width}px`,
      flex: isMobile ? 1 : 'none',
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${fontSize}px`,
      color: isLight(color) ? '#333' : '#eee',
      border: '1px solid var(--border-color, #444)',
      margin: '1px'
    }}>
      {text}
    </div>
  );
};

const HeatmapLegend = ({ dataType, isMobile }) => {
  const containerStyle = {
    padding: isMobile ? '16px 5px' : '12px 10px',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
    justifyContent: 'center',
    gap: isMobile ? '8px' : '12px',
    width: '100%',
    flexWrap: 'wrap'
  };

  const titleStyle = {
    fontSize: isMobile ? '0.95rem' : '1.1rem',
    fontWeight: 'bold',
    textAlign: isMobile ? 'left' : 'right',
    minWidth: isMobile ? 'auto' : '100px',
    flex: isMobile ? '1 1 auto' : '0 1 auto',
    lineHeight: '1.2',
    marginBottom: isMobile ? '4px' : '0'
  };

  if (dataType === 'Action') {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Cube Actions:</div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: '3px', width: isMobile ? '100%' : 'auto' }}>
          <LegendCell color="#979797" text="ND-T" width={60} height={45} fontSize={isMobile ? 13 : 15} isMobile={isMobile} />
          <LegendCell color="#6daed5" text="D-T" width={60} height={45} fontSize={isMobile ? 13 : 15} isMobile={isMobile} />
          <LegendCell color="#d92723" text="D-P" width={60} height={45} fontSize={isMobile ? 13 : 15} isMobile={isMobile} />
          <LegendCell color="#fb8d3d" text="TG-P" width={60} height={45} fontSize={isMobile ? 13 : 15} isMobile={isMobile} />
          <LegendCell color="#ffff00" text="TG-T" width={60} height={45} fontSize={isMobile ? 13 : 15} isMobile={isMobile} />
        </div>
      </div>
    );
  }

  const isTake = dataType === 'Take';
  const label1 = isTake ? 'T' : 'D';
  const label2 = isTake ? 'P' : 'N';
  const colors1 = BlueColorTable;
  const colors2 = isTake ? RedColorTable : GreyColorTable;

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        {isTake ? 'Take / Pass by up to:' : 'Double / No-Double / Too Good by up to:'}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'stretch' : 'flex-start', width: isMobile ? '100%' : 'auto' }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>{label1}</div>
          {colors1.map((color, i) => (
            <LegendCell key={i} color={color} text={takeErrPos[i]} width={33} height={27} fontSize={isMobile ? 10 : 12} isMobile={isMobile} />
          ))}
        </div>
        
        {/* Row 2 */}
        <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>{label2}</div>
          {colors2.map((color, i) => (
            <LegendCell key={i} color={color} text="" width={33} height={27} isMobile={isMobile} />
          ))}
        </div>

        {/* Row 3 (Only for Double) */}
        {!isTake && (
          <div style={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>T</div>
            {OrangeColorTable.map((color, i) => (
              <LegendCell key={i} color={color} text="" width={33} height={27} isMobile={isMobile} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapLegend;
