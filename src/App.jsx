import React, { useState, useEffect } from 'react'
import './App.css'
import './Mobile.css'
import BackgammonBoard from './components/BackgammonBoard'
import Heatmap from './components/Heatmap'
import MobileView from './components/MobileView'
import { DECK_SET_ORDER, DECK_ORDER, CC_CARD_ORDER } from './constants/legacyData'

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

const themeData = {
  1: { name: "Christmas", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Christmas.png` },
  2: { name: "Butter", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Butter.png` },
  3: { name: "Business", thumb: `${import.meta.env.BASE_URL}theme-thumbs/RedWhite.png` },
  4: { name: "Earth", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Earth.png` },
  5: { name: "Sand", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Sand.png` },
  6: { name: "Vineyard", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Vineyard.png` },
  7: { name: "Lorax", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Lorax.png` },
  8: { name: "Attache", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Attache.png` },
  9: { name: "Sunset", thumb: `${import.meta.env.BASE_URL}theme-thumbs/Sunset.png` },
};

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'night');
  
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [appThemePickerOpen, setAppThemePickerOpen] = useState(false);
  
  const [deckSets, setDeckSets] = useState([]);
  const [decks, setDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(() => localStorage.getItem('selectedDeckId') || '41');
  const [cardsInDeck, setCardsInDeck] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentXgid, setCurrentXgid] = useState(null);
  const [perspective, setPerspective] = useState(() => localStorage.getItem('perspective') || 'doubler');
  const [copiedXgid, setCopiedXgid] = useState(false);
  
  const [boardTheme, setBoardTheme] = useState(() => parseInt(localStorage.getItem('boardTheme'), 10) || 1);
  const [boardDirection, setBoardDirection] = useState(() => localStorage.getItem('boardDirection') || 'right');

  const [heatmapDataType, setHeatmapDataType] = useState(() => localStorage.getItem('heatmapDataType') || 'Take');
  const [heatmapMatchLength, setHeatmapMatchLength] = useState(() => parseInt(localStorage.getItem('heatmapMatchLength'), 10) || 15);
  const [cubeTo, setCubeTo] = useState(() => parseInt(localStorage.getItem('cubeTo'), 10) || 2);
  const [heatmapDataVisibility, setHeatmapDataVisibility] = useState(() => localStorage.getItem('heatmapDataVisibility') || 'Show');

  const isMobileDevice = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const getIsMobile = () => {
    const { innerWidth: w, innerHeight: h } = window;
    // Mobile if narrow (phones) OR if it's a portrait tablet (w < h and w is tablet-sized)
    return w < 768 || (w < 1025 && w < h);
  };

  const [useMobileLayout, setUseMobileLayout] = useState(getIsMobile);
  const [isLandscape, setIsLandscape] = useState(() => window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setUseMobileLayout(getIsMobile());
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('perspective', perspective); }, [perspective]);
  useEffect(() => { if (selectedDeckId) localStorage.setItem('selectedDeckId', selectedDeckId); }, [selectedDeckId]);
  useEffect(() => { localStorage.setItem('boardTheme', boardTheme); }, [boardTheme]);
  useEffect(() => { localStorage.setItem('boardDirection', boardDirection); }, [boardDirection]);
  useEffect(() => { localStorage.setItem('heatmapDataType', heatmapDataType); }, [heatmapDataType]);
  useEffect(() => { localStorage.setItem('heatmapMatchLength', heatmapMatchLength); }, [heatmapMatchLength]);
  useEffect(() => { localStorage.setItem('cubeTo', cubeTo); }, [cubeTo]);
  useEffect(() => { localStorage.setItem('heatmapDataVisibility', heatmapDataVisibility); }, [heatmapDataVisibility]);

  useEffect(() => {
    const loadData = () => {
      if (window.DeckSet && Array.isArray(window.DeckSet) && window.Deck && Array.isArray(window.Deck) && window.CardInDeck) {
        setDeckSets(DECK_SET_ORDER.map(id => window.DeckSet[id] ? { ...window.DeckSet[id], DeckSetID: id } : null).filter(ds => ds));
        setDecks(DECK_ORDER.map(id => window.Deck[id] ? { ...window.Deck[id], DeckID: id } : null).filter(d => d));
      } else {
        setTimeout(loadData, 50);
      }
    };
    loadData();
  }, []);

  const updateXgidForCard = (cardId) => {
    if (!cardId || !window.Card || !window.Card[cardId]) return setCurrentXgid(null);
    const cardKind = window.Card[cardId].CardKind;
    let xgid = null;
    if (cardKind === 0 && window.CubeCard && window.CubeCard[cardId]) {
      const posId = window.CubeCard[cardId][0];
      if (window.CubePosition && window.CubePosition[posId]) xgid = window.CubePosition[posId].XGID;
    } else if (cardKind === 1 && window.PlayCard && window.PlayCard[cardId]) {
      const posId = window.PlayCard[cardId][0];
      if (window.PlayPosition && window.PlayPosition[posId]) xgid = window.PlayPosition[posId].XGID;
    }
    setCurrentXgid(xgid);
  };

  const handleStartDataView = () => {
    if (!selectedDeckId) return alert("Please select a deck first.");
    const deckCards = CC_CARD_ORDER
      .map(index => window.CardInDeck[index])
      .filter(cid => cid && cid.DeckID === parseInt(selectedDeckId, 10))
      .map(cid => cid.CardID);
    setCardsInDeck(deckCards);
    setCurrentCardIndex(0);
    if (deckCards.length > 0) updateXgidForCard(deckCards[0]);
    setHasStarted(true);
    setCopiedXgid(false);
  };

  const handleNextPosition = () => {
    if (currentCardIndex < cardsInDeck.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      updateXgidForCard(cardsInDeck[nextIndex]);
      setCopiedXgid(false);
    }
  };

  const handlePrevPosition = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      updateXgidForCard(cardsInDeck[prevIndex]);
      setCopiedXgid(false);
    }
  };

  const handleBackToSelection = () => {
    setHasStarted(false);
    setCopiedXgid(false);
  };

  const cubeLevelMap = { 2: 0, 4: 1, 8: 2, 16: 3, 32: 4 };

  // Orientation Lock for Mobile (Phones only)
  if (isMobileDevice && isLandscape && window.innerWidth < 768) {
    return (
      <div className="orientation-warning">
        <div className="warning-content">
          <div className="warning-icon">🔄</div>
          <h2>Please Rotate Your Device</h2>
          <p>CubeViz is optimized for portrait mode on mobile.</p>
        </div>
      </div>
    );
  }

  // Route to mobile layout when viewport is narrow
  if (useMobileLayout) {
    return (
      <MobileView
        hasStarted={hasStarted}
        theme={theme} setTheme={setTheme}
        selectedDeckId={selectedDeckId} setSelectedDeckId={setSelectedDeckId}
        deckSets={deckSets} decks={decks}
        handleStartDataView={handleStartDataView}
        cardsInDeck={cardsInDeck} currentCardIndex={currentCardIndex} setCurrentCardIndex={setCurrentCardIndex}
        currentXgid={currentXgid} perspective={perspective} setPerspective={setPerspective}
        cubeTo={cubeTo} setCubeTo={setCubeTo}
        boardTheme={boardTheme} setBoardTheme={setBoardTheme}
        boardDirection={boardDirection} setBoardDirection={setBoardDirection}
        heatmapDataType={heatmapDataType} setHeatmapDataType={setHeatmapDataType}
        heatmapMatchLength={heatmapMatchLength} setHeatmapMatchLength={setHeatmapMatchLength}
        heatmapDataVisibility={heatmapDataVisibility} setHeatmapDataVisibility={setHeatmapDataVisibility}
        handlePrevPosition={handlePrevPosition} handleNextPosition={handleNextPosition}
        handleBackToSelection={handleBackToSelection}
        copiedXgid={copiedXgid} setCopiedXgid={setCopiedXgid}
        themePickerOpen={themePickerOpen} setThemePickerOpen={setThemePickerOpen}
        appThemePickerOpen={appThemePickerOpen} setAppThemePickerOpen={setAppThemePickerOpen}
        themeData={themeData} cubeLevelMap={cubeLevelMap}
      />
    );
  }

  return (
    <div className={`app-container theme-${theme}`}>
      {!hasStarted ? (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
          <div className="left-pane" style={{ width: '100%', maxWidth: '350px', paddingTop: '40px' }}>
            <div className="panel" style={{ flex: 0 }}>
              <h3>Deck Selection</h3>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '10px' }}>Select filters and click Start.</p>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Select Deck:</label>
                <select value={selectedDeckId} onChange={(e) => setSelectedDeckId(e.target.value)} className="control-select">
                  <option value="" disabled>-- Choose a Deck --</option>
                  {deckSets.map(ds => (
                    <optgroup key={ds.DeckSetID} label={ds.DeckSetName}>
                      {decks.filter(d => d.DeckSetID === ds.DeckSetID).map(deck => (
                        <option key={deck.DeckID} value={deck.DeckID}>{deck.DeckName}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <button onClick={handleStartDataView} className="panel-button" style={{ width: '100%', background: 'var(--accent-blue)', color: 'white' }}>Start</button>
            </div>
          </div>
          <div className="welcome-container">
            <div className="welcome-content">
              <h2>Welcome to CubeViz</h2>
              <p>Backgammon match data, aggregated and visualized.</p>
              <p>
                This app explores the effect of match-score on cube decisions by presenting cube-action data for all scores up to a 25-point match, all at once. Instead of peeking at a data point here and there (Hey XG, what about this score? What about that score?), see the pattern as a whole. Insights abound.
              </p>
              <p>
                Select a deck of positions in the left panel, and click <strong>Start</strong>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="left-pane">

            <div className="board-container">
              <BackgammonBoard 
                xgid={currentXgid} 
                perspective={perspective} 
                cubeLevel={cubeLevelMap[cubeTo]}
                boardTheme={boardTheme}
                boardDirection={boardDirection}
                appTheme={theme} 
              />
            </div>

            <div className="panel board-controls-panel">
              <div className="board-controls">
                <button className="panel-button" onClick={() => setPerspective(prev => prev === 'doubler' ? 'taker' : 'doubler')}>
                  {perspective === 'doubler' ? "Doubler's Perspective" : "Taker's Perspective"}
                </button>
                <button className="panel-button" onClick={() => { navigator.clipboard.writeText(`XGID=${currentXgid}`); setCopiedXgid(true); }}>
                  {copiedXgid ? "Copied!" : "Copy XGID"}
                </button>
              </div>
            </div>

            <PositionDetails cardId={cardsInDeck[currentCardIndex]} matchLength={heatmapMatchLength} deckName={decks.find(d => d.DeckID === parseInt(selectedDeckId, 10))?.DeckName || ''} />

            <div className="panel nav-panel" style={{ marginTop: 'auto' }}>
              <div className="position-nav-buttons">
                <button className="panel-button" onClick={handlePrevPosition} disabled={currentCardIndex === 0}>Prev</button>
                <div className="pos-indicator" style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>{currentCardIndex + 1} / {cardsInDeck.length}</div>
                <button className="panel-button" onClick={handleNextPosition} disabled={currentCardIndex === currentCardIndex === (cardsInDeck.length - 1) || cardsInDeck.length === 0}>Next</button>
              </div>
              <button onClick={handleBackToSelection} className="panel-button" style={{ width: '100%', marginTop: '10px' }}>← New Deck</button>
            </div>
            {/* Conditional spacer for iPad/Mobile ONLY - hidden via CSS on desktop */}
            <div className="tablet-spacer" style={{ flexShrink: 0 }}></div>
          </div>

          <div className="right-pane">
            <div className="heatmap-main-area">
              <Heatmap positionIndex={cardsInDeck[currentCardIndex]} mlength={heatmapMatchLength} dataType={heatmapDataType} cubeLevel={cubeLevelMap[cubeTo]} globalVisibility={heatmapDataVisibility} showData={true} appTheme={theme}/>
            </div>

            <div className="heatmap-controls panel">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div className="section-title">Heatmap Controls</div>
                <div>
                  <label>Data Type:</label>
                  <select value={heatmapDataType} onChange={e => setHeatmapDataType(e.target.value)} className="control-select">
                    <option value="Double">Double</option>
                    <option value="Take">Take</option>
                    <option value="Action">Action</option>
                  </select>
                </div>
                <div>
                  <label>Double To:</label>
                  <select value={cubeTo} onChange={e => setCubeTo(parseInt(e.target.value, 10))} className="control-select">
                    {[2, 4, 8, 16, 32].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label>Match Length:</label>
                  <select value={heatmapMatchLength} onChange={e => setHeatmapMatchLength(parseInt(e.target.value, 10))} className="control-select">
                    {[...Array(21)].map((_, i) => <option key={i+5} value={i+5}>{i+5}</option>)}
                  </select>
                </div>
                <div>
                  <label>Data:</label>
                  <select value={heatmapDataVisibility} onChange={e => setHeatmapDataVisibility(e.target.value)} className="control-select">
                    <option value="Show">Show</option>
                    <option value="Hide">Hide</option>
                  </select>
                </div>
              </div>

              <div style={{ flex: 1 }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <div className="section-title" style={{ paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>Settings</div>
                <div>
                  <label>App Theme:</label>
                  <div className="theme-picker-container">
                    <div className="theme-picker-header" onClick={() => setAppThemePickerOpen(!appThemePickerOpen)}>
                      <span className="theme-picker-name">{theme === 'night' ? 'Night' : 'Day'}</span>
                      <span className="theme-picker-visual">{theme === 'night' ? '🌙' : '☀️'}</span>
                      <span className="theme-picker-chevron">{appThemePickerOpen ? '▲' : '▼'}</span>
                    </div>
                    {appThemePickerOpen && (
                      <div className="theme-picker-list">
                        <div className="theme-picker-option" onClick={() => { setTheme('night'); setAppThemePickerOpen(false); }}>
                          <span className="theme-picker-name">Night</span>
                          <span className="theme-picker-visual">🌙</span>
                        </div>
                        <div className="theme-picker-option" onClick={() => { setTheme('day'); setAppThemePickerOpen(false); }}>
                          <span className="theme-picker-name">Day</span>
                          <span className="theme-picker-visual">☀️</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label>Board Theme:</label>
                  <div className="theme-picker-container">
                    <div className="theme-picker-header" onClick={() => setThemePickerOpen(!themePickerOpen)}>
                      <span className="theme-picker-name">{themeData[boardTheme].name}</span>
                      <img src={themeData[boardTheme].thumb} alt="" className="theme-picker-thumb" />
                      <span className="theme-picker-chevron">{themePickerOpen ? '▲' : '▼'}</span>
                    </div>
                    {themePickerOpen && (
                      <div className="theme-picker-list">
                        {Object.entries(themeData).map(([id, data]) => (
                          <div key={id} className="theme-picker-option" onClick={() => { setBoardTheme(parseInt(id, 10)); setThemePickerOpen(false); }}>
                            <span className="theme-picker-name">{data.name}</span>
                            <img src={data.thumb} alt="" className="theme-picker-thumb" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label>Board Direction:</label>
                  <select value={boardDirection} onChange={e => setBoardDirection(e.target.value)} className="control-select">
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App
