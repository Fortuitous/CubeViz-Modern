import React, { useState } from 'react';
import BackgammonBoard from './BackgammonBoard';
import Heatmap from './Heatmap';
import PositionDetails from './PositionDetails';
import '../Mobile.css';

const MobileView = ({
  hasStarted,
  theme,
  setTheme,
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
  const [activeTab, setActiveTab] = useState('board'); // 'board' | 'heatmap' | 'settings'
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Sync state if user exits via browser gesture
  React.useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Theme is applied via className on the root div (theme-${theme}) — no body mutation needed.

  const currentDeckName = decks.find(d => d.DeckID === parseInt(selectedDeckId, 10))?.DeckName || 'Select Deck';

  if (!hasStarted) {
    return (
      <div className={`app-container theme-${theme} mobile-layout mobile-menu-level`}>
        <div className="mobile-header">
          <div className="header-title">CubeViz Mobile</div>
        </div>
        <div className="mobile-content-scroll">
          <div className="panel menu-panel">
            <h3>Deck Selection</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '15px' }}>
              Choose a deck to begin your session.
            </p>
            <div className="control-group">
              <label>Select Deck:</label>
              <select value={selectedDeckId} onChange={(e) => setSelectedDeckId(e.target.value)} className="mobile-select">
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
            <button onClick={handleStartDataView} className="mobile-primary-button">Start Session</button>
            <button onClick={toggleFullScreen} className="mobile-secondary-button">
              {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container theme-${theme} mobile-layout mobile-app-level`}>
      {/* Top Header */}
      <div className="mobile-header">
        <button className="header-back-button" onClick={handleBackToSelection}>← Menu</button>
        <div className="header-title">{currentDeckName}</div>
        <div className="header-spacer"></div>
      </div>

      {/* Main Content Area */}
      <div className="mobile-main-content">
        {activeTab === 'board' && (
          <div className="mobile-page board-page">
            <div className="board-section" id="board-container">
              <BackgammonBoard 
                xgid={currentXgid} 
                perspective={perspective} 
                cubeLevel={cubeLevelMap[cubeTo]}
                boardTheme={boardTheme}
                boardDirection={boardDirection}
                appTheme={theme} 
              />
            </div>
            <div className="navigation-strip">
              <button className="nav-btn" onClick={handlePrevPosition} disabled={currentCardIndex === 0}>Prev</button>
              <div className="nav-indicator">{currentCardIndex + 1} / {cardsInDeck.length}</div>
              <button className="nav-btn" onClick={handleNextPosition} disabled={currentCardIndex === cardsInDeck.length - 1 || cardsInDeck.length === 0}>Next</button>
            </div>
            <div className="details-section">
              <PositionDetails cardId={cardsInDeck[currentCardIndex]} matchLength={heatmapMatchLength} deckName={currentDeckName} />
            </div>
            <div className="quick-actions">
              <button className="action-btn" onClick={() => setPerspective(prev => prev === 'doubler' ? 'taker' : 'doubler')}>
                {perspective === 'doubler' ? "Doubler's Perspective" : "Taker's Perspective"}
              </button>
              <button className="action-btn" onClick={() => { navigator.clipboard.writeText(`XGID=${currentXgid}`); setCopiedXgid(true); }}>
                {copiedXgid ? "Copied!" : "Copy XGID"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="mobile-page heatmap-page">
            <div className="heatmap-section">
              <Heatmap positionIndex={cardsInDeck[currentCardIndex]} mlength={heatmapMatchLength} dataType={heatmapDataType} cubeLevel={cubeLevelMap[cubeTo]} globalVisibility={heatmapDataVisibility} showData={true} isMobile={true}/>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mobile-page settings-page">
            <div className="settings-section">
              <h3>Heatmap Controls</h3>
              <div className="control-group">
                <label>Data Type:</label>
                <select value={heatmapDataType} onChange={e => setHeatmapDataType(e.target.value)} className="mobile-select">
                  <option value="Double">Double</option>
                  <option value="Take">Take</option>
                  <option value="Action">Action</option>
                </select>
              </div>
              <div className="control-group">
                <label>Match Length:</label>
                <select value={heatmapMatchLength} onChange={e => setHeatmapMatchLength(parseInt(e.target.value, 10))} className="mobile-select">
                  {[...Array(21)].map((_, i) => <option key={i+5} value={i+5}>{i+5}</option>)}
                </select>
              </div>
              <div className="control-group">
                <label>Duplicate To:</label>
                <select value={cubeTo} onChange={e => setCubeTo(parseInt(e.target.value, 10))} className="mobile-select">
                  {[2, 4, 8, 16, 32].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="control-group">
                <label>Visibility:</label>
                <select value={heatmapDataVisibility} onChange={e => setHeatmapDataVisibility(e.target.value)} className="mobile-select">
                  <option value="Show">Show</option>
                  <option value="Hide">Hide</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h3>Visual Settings</h3>
              <div className="control-group">
                <label>App Theme:</label>
                <div className="mobile-theme-switches">
                  <button className={`theme-btn ${theme === 'day' ? 'active' : ''}`} onClick={() => setTheme('day')}>☀️ Day</button>
                  <button className={`theme-btn ${theme === 'night' ? 'active' : ''}`} onClick={() => setTheme('night')}>🌙 Night</button>
                </div>
              </div>
              <div className="control-group">
                <label>Board Theme:</label>
                <select value={boardTheme} onChange={e => setBoardTheme(parseInt(e.target.value, 10))} className="mobile-select">
                  {Object.entries(themeData).map(([id, data]) => (
                    <option key={id} value={id}>{data.name}</option>
                  ))}
                </select>
              </div>
              <div className="control-group">
                <label>Board Direction:</label>
                <select value={boardDirection} onChange={e => setBoardDirection(e.target.value)} className="mobile-select">
                  <option value="right">Right</option>
                  <option value="left">Left</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="mobile-bottom-nav">
        <button className={`nav-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
          <span className="nav-icon">🎲</span>
          <span className="nav-label">Board</span>
        </button>
        <button className={`nav-item ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Heatmap</span>
        </button>
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default MobileView;
