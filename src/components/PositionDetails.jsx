import React, { useState, useEffect } from 'react';

/**
 * Component to display technical position data (Actions, Equities, Outcomes)
 * from legacy global data structures.
 */
const PositionDetails = ({ cardId, matchLength, deckName }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let timeoutId;
    const check = () => {
      if (!cardId || !window.CubeCard || !window.CubeCard[cardId] || !window.CubePosition || !window.Outcome || !window.Outcome[0]) {
        timeoutId = setTimeout(check, 500);
        return;
      }

      const cubeCardEntries = window.CubeCard[cardId];
      let moneyPos = null;
      let nrdEq = null;
      let ndEq = null;
      let dtEq = null;

      // Legacy getCubeData logic: loop to find money position (Score1 == 0)
      for (const posId of cubeCardEntries) {
        const p = window.CubePosition[posId];
        if (p && (p.Score1 == 0 || p.Score1 === "0")) {
          moneyPos = p;
          dtEq = p.DTEq;
          if (p.CubeOwner == 0) {
            ndEq = p.NDEq;
          } else {
            nrdEq = p.NDEq;
          }
        }
      }

      if (moneyPos && (ndEq === null || nrdEq === null)) {
         for (const posId of cubeCardEntries) {
            const p = window.CubePosition[posId];
            if (p && (p.Score1 == 0 || p.Score1 === "0")) {
               if (p.CubeOwner == 0 && ndEq === null) ndEq = p.NDEq;
               if (p.CubeOwner != 0 && nrdEq === null) nrdEq = p.NDEq;
            }
         }
      }

      let outcome = null;
      if (matchLength > 0 && cubeCardEntries.length > 1) {
        const otherOutcomeIndex = cubeCardEntries[1];
        outcome = window.Outcome[0][otherOutcomeIndex];
      } 
      
      if (!outcome) {
        const primaryPosId = cubeCardEntries[0];
        outcome = window.Outcome[0][primaryPosId];
      }

      if (moneyPos && outcome) {
        setData({ 
          dtEq, 
          ndEq: ndEq ?? nrdEq, 
          nrdEq: nrdEq ?? ndEq, 
          outcome,
          cubeOwner: moneyPos.CubeOwner 
        });
      } else {
        timeoutId = setTimeout(check, 500);
      }
    };
    check();
    return () => clearTimeout(timeoutId);
  }, [cardId, matchLength]);

  if (!data) return null;

  const { dtEq, ndEq, nrdEq, outcome, cubeOwner } = data;
  
  const moneyDEr = (Math.min(dtEq, 1) - ndEq).toFixed(3);
  const moneyRDEr = (Math.min(dtEq, 1) - nrdEq).toFixed(3);
  const moneyDPEr = (1 - dtEq).toFixed(3);

  const actionDouble = parseFloat(moneyDEr) >= 0 ? "Double" : (ndEq > 1 ? "Too Good" : "No Double");
  const actionRedouble = parseFloat(moneyRDEr) >= 0 ? "Redouble" : (nrdEq > 1 ? "Too Good" : "No Redouble");
  const takePass = dtEq >= 1 ? "Pass" : (dtEq < 0 ? "Beaver" : "Take");

  const formatEq = (val) => {
    if (val === undefined || val === null) return ".000";
    let s = val.toFixed(3).toString();
    return s.replace("0.", ".").replace("-0.", "-.");
  };

  const formatPct = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return "0.0%";
    return num.toFixed(1) + "%";
  };

  const getEqClass = (err) => {
    const num = parseFloat(err);
    if (num > 0) return "equity-positive";
    if (num < 0) return "equity-negative";
    return "";
  };

  return (
    <div className="position-details panel">
      <table className="data-table">
        <tbody>
          <tr>
            <td colSpan="6" style={{ paddingBottom: '8px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <b className="text-bold">Deck:</b> <span style={{ marginLeft: '8px' }}>{deckName}</span>
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  Money Data
                </div>
              </div>
            </td>
          </tr>
          <tr><td colSpan="6" style={{ height: '8px' }}></td></tr>
          
          <tr>
            <td width="80"><b className="text-bold">Actions:</b></td>
            <td colSpan="5">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span className={getEqClass(moneyDEr)} style={{ minWidth: '85px' }}>{actionDouble}</span>
                <span className={getEqClass(moneyDEr)} style={{ minWidth: '60px' }}>{formatEq(parseFloat(moneyDEr))}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>(No Jacoby)</span>
              </div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan="5">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span className={getEqClass(moneyRDEr)} style={{ minWidth: '85px' }}>{actionRedouble}</span>
                <span className={getEqClass(moneyRDEr)} style={{ minWidth: '60px' }}>{formatEq(parseFloat(moneyRDEr))}</span>
                <span className={getEqClass(moneyDPEr)} style={{ marginLeft: '10px', minWidth: '50px' }}>{formatEq(parseFloat(moneyDPEr))}</span>
                <span className={getEqClass(moneyDPEr)}>{takePass}</span>
              </div>
            </td>
          </tr>

          <tr><td colSpan="6" style={{ height: '12px' }}></td></tr>

          <tr>
            <td><b className="text-bold">Equities:</b></td>
            <td colSpan="5">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span style={{ minWidth: '153px' }}>No Double</span>
                <span>{formatEq(ndEq)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan="5">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span style={{ minWidth: '153px' }}>No Redouble</span>
                <span>{formatEq(nrdEq)}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan="5">
              <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span style={{ minWidth: '153px' }}>Double/{takePass}</span>
                <span>{formatEq(dtEq)}</span>
              </div>
            </td>
          </tr>

          <tr><td colSpan="6" style={{ height: '12px' }}></td></tr>

          <tr>
            <td><b className="text-bold">Outcomes:</b></td>
            <td colSpan="5">
              <div style={{ display: 'block', width: 'max-content', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-block', minWidth: '85px' }}>Win%</span>
                <span style={{ display: 'inline-block', minWidth: '60px' }}>{formatPct(outcome.PlainW)}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>
                  ({formatPct(outcome.GammonW)}, {formatPct(outcome.BackgammonW)})
                </span>
              </div>
            </td>
          </tr>
          <tr>
            <td></td>
            <td colSpan="5">
              <div style={{ display: 'block', width: 'max-content', whiteSpace: 'nowrap' }}>
                <span style={{ display: 'inline-block', minWidth: '85px' }}>Loss%</span>
                <span style={{ display: 'inline-block', minWidth: '60px' }}>{formatPct(outcome.PlainL)}</span>
                <span style={{ color: 'var(--text-secondary)', marginLeft: '10px' }}>
                  ({formatPct(outcome.GammonL)}, {formatPct(outcome.BackgammonL)})
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PositionDetails;
