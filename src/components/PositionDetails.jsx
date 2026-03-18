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
                  <span style={{ color: 'var(--accent-red)', marginRight: '8px' }}>TEST</span> Money Data
                </div>
              </div>
            </td>
          </tr>
          <tr><td colSpan="6" style={{ height: '8px' }}></td></tr>
          
          <tr>
            <td width="80"><b className="text-bold">Actions:</b></td>
            <td width="100" className={getEqClass(moneyDEr)}>{actionDouble}</td>
            <td width="60" className={getEqClass(moneyDEr)}>{formatEq(parseFloat(moneyDEr))}</td>
            <td width="10"></td>
            <td colSpan="2" style={{ color: 'var(--text-secondary)' }}>(No Jacoby)</td>
          </tr>
          <tr>
            <td></td>
            <td className={getEqClass(moneyRDEr)}>{actionRedouble}</td>
            <td className={getEqClass(moneyRDEr)}>{formatEq(parseFloat(moneyRDEr))}</td>
            <td></td>
            <td width="50" className={getEqClass(moneyDPEr)}>{formatEq(parseFloat(moneyDPEr))}</td>
            <td className={getEqClass(moneyDPEr)}>{takePass}</td>
          </tr>

          <tr><td colSpan="6" style={{ height: '12px' }}></td></tr>

          <tr>
            <td><b className="text-bold">Equities:</b></td>
            <td>No Double</td>
            <td>{formatEq(ndEq)}</td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td></td>
            <td>No Redouble</td>
            <td>{formatEq(nrdEq)}</td>
            <td colSpan="3"></td>
          </tr>
          <tr>
            <td></td>
            <td>Double/{takePass}</td>
            <td>{formatEq(dtEq)}</td>
            <td colSpan="3"></td>
          </tr>

          <tr><td colSpan="6" style={{ height: '12px' }}></td></tr>

          <tr>
            <td><b className="text-bold">Outcomes:</b></td>
            <td>Win%</td>
            <td>{formatPct(outcome.PlainW)}</td>
            <td></td>
            <td colSpan="2" style={{ color: 'var(--text-secondary)' }}>
              ({formatPct(outcome.GammonW)}, {formatPct(outcome.BackgammonW)})
            </td>
          </tr>
          <tr>
            <td></td>
            <td>Loss%</td>
            <td>{formatPct(outcome.PlainL)}</td>
            <td></td>
            <td colSpan="2" style={{ color: 'var(--text-secondary)' }}>
              ({formatPct(outcome.GammonL)}, {formatPct(outcome.BackgammonL)})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PositionDetails;
