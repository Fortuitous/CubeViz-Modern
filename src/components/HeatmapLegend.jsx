import React from 'react';

const BlueColorTable = ["#f7fbff", "#e3eef9", "#cfe1f2", "#b5d4e9", "#93c3df", "#6daed5", "#4b97c9", "#2f7ebc", "#1864aa", "#0a4a90", "#08306b"];
const RedColorTable = ["#fff5f0", "#fee3d6", "#fdc9b4", "#fcaa8e", "#fc8a6b", "#f9694c", "#ef4533", "#d92723", "#bb151a", "#970b13", "#67000d"];
const GreyColorTable = ["#ffffff", "#f2f2f2", "#e2e2e2", "#cecece", "#b4b4b4", "#979797", "#7a7a7a", "#5f5f5f", "#404040", "#1e1e1e", "#000000"];
const OrangeColorTable = ["#fff5eb", "#fee8d3", "#fdd8b3", "#fdc28c", "#fda762", "#fb8d3d", "#f2701d", "#e25609", "#c44103", "#9f3303", "#7f2704"];

const takeErrPos = [".005", ".01", ".02", ".04", ".08", ".16", ".32", ".64", "1.3", "2.6", "5.1"];

const LegendCell = ({ color, text, width = 23, height = 23, fontSize = 9 }) => {
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
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${fontSize}px`,
      color: isLight(color) ? '#333' : '#eee',
      border: '1px solid var(--border-color)',
      margin: '1px'
    }}>
      {text}
    </div>
  );
};

const HeatmapLegend = ({ dataType }) => {
  const containerStyle = {
    padding: '12px 10px',
    display: 'flex',
    flexDirection: 'row', // Side-by-side
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%'
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    textAlign: 'right',
    minWidth: '150px',
    lineHeight: '1.1'
  };

  if (dataType === 'Action') {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Cube Actions:</div>
        <div style={{ display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: '3px' }}>
          <LegendCell color="#979797" text="ND-T" width={60} height={45} fontSize={15} />
          <LegendCell color="#6daed5" text="D-T" width={60} height={45} fontSize={15} />
          <LegendCell color="#d92723" text="D-P" width={60} height={45} fontSize={15} />
          <LegendCell color="#fb8d3d" text="TG-P" width={60} height={45} fontSize={15} />
          <LegendCell color="#ffff00" text="TG-T" width={60} height={45} fontSize={15} />
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
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {/* Row 1 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold' }}>{label1}</div>
          {colors1.map((color, i) => (
            <LegendCell key={i} color={color} text={takeErrPos[i]} width={33} height={27} fontSize={12} />
          ))}
        </div>
        
        {/* Row 2 */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold' }}>{label2}</div>
          {colors2.map((color, i) => (
            <LegendCell key={i} color={color} text="" width={33} height={27} />
          ))}
        </div>

        {/* Row 3 (Only for Double) */}
        {!isTake && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '20px', fontSize: '1rem', fontWeight: 'bold' }}>T</div>
            {OrangeColorTable.map((color, i) => (
              <LegendCell key={i} color={color} text="" width={33} height={27} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatmapLegend;
