import React, { useEffect } from 'react';
import BackgammonBoard from './BackgammonBoard';
import Heatmap from './Heatmap';
import PositionDetails from './PositionDetails';

const DesktopView = ({
  hasStarted,
  theme,
  selectedDeckId,
  setSelectedDeckId,
  deckSets,
  decks,
  handleStartDataView,
  cardsInDeck,
  currentCardIndex,
  currentXgid,
  perspective,
  setPerspective,
  cubeTo,
  setCubeTo,
  boardTheme,
  setBoardTheme,
  boardDirection,
  setBoardDirection,
  heatmapDataType,
  setHeatmapDataType,
  heatmapMatchLength,
  setHeatmapMatchLength,
  heatmapDataVisibility,
  setHeatmapDataVisibility,
  handlePrevPosition,
  handleNextPosition,
  handleBackToSelection,
  copiedXgid,
  setCopiedXgid,
  themePickerOpen,
  setThemePickerOpen,
  appThemePickerOpen,
  setAppThemePickerOpen,
  themeData,
  cubeLevelMap
}) => {

  return (
    <div className={`app-container theme-${theme} desktop-layout`}>
      {!hasStarted ? (
        <div className="left-pane" style={{ width: '100%', maxWidth: '350px' }}>
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
                <button className="panel-button" onClick={handleNextPosition} disabled={currentCardIndex === cardsInDeck.length - 1 || cardsInDeck.length === 0}>Next</button>
              </div>
              <button onClick={handleBackToSelection} className="panel-button" style={{ width: '100%', marginTop: '10px' }}>← New Deck</button>
            </div>
          </div>

          <div className="right-pane">
            <div className="heatmap-main-area">
              <Heatmap positionIndex={cardsInDeck[currentCardIndex]} mlength={heatmapMatchLength} dataType={heatmapDataType} cubeLevel={cubeLevelMap[cubeTo]} globalVisibility={heatmapDataVisibility} showData={true}/>
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
};

export default DesktopView;
