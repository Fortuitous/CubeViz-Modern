import React from 'react';
import BackgammonBoard from './BackgammonBoard';
import Heatmap from './Heatmap';
import PositionDetails from './PositionDetails';
import '../Mobile.css';

const MobileView = ({
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
    <div className={`app-container theme-${theme} mobile-layout`}>
      {!hasStarted ? (
        <div className="left-pane" style={{ width: '100%', padding: '20px' }}>
          <div className="panel">
            <h3>Deck Selection (Mobile)</h3>
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
          {/* Main Mobile Stack */}
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

          <div className="panel navigation-controls">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button className="panel-button" onClick={handlePrevPosition} disabled={currentCardIndex === 0}>Prev</button>
              <div className="pos-indicator" style={{ fontWeight: 'bold' }}>{currentCardIndex + 1} / {cardsInDeck.length}</div>
              <button className="panel-button" onClick={handleNextPosition} disabled={currentCardIndex === cardsInDeck.length - 1 || cardsInDeck.length === 0}>Next</button>
            </div>
          </div>

          <PositionDetails cardId={cardsInDeck[currentCardIndex]} matchLength={heatmapMatchLength} deckName={decks.find(d => d.DeckID === parseInt(selectedDeckId, 10))?.DeckName || ''} />

          <div className="heatmap-main-area">
            <Heatmap positionIndex={cardsInDeck[currentCardIndex]} mlength={heatmapMatchLength} dataType={heatmapDataType} cubeLevel={cubeLevelMap[cubeTo]} globalVisibility={heatmapDataVisibility} showData={true}/>
          </div>

          <div className="panel mobile-controls">
            <button className="panel-button" onClick={() => setPerspective(prev => prev === 'doubler' ? 'taker' : 'doubler')} style={{ width: '100%', marginBottom: '10px' }}>
              {perspective === 'doubler' ? "Doubler's Perspective" : "Taker's Perspective"}
            </button>
            <button onClick={handleBackToSelection} className="panel-button" style={{ width: '100%' }}>← New Deck</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileView;
