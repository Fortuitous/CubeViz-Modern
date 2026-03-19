import React, { useState } from 'react';
import BackgammonBoard from './BackgammonBoard';
import Heatmap from './Heatmap';
import PositionDetails from './PositionDetails';
import '../Mobile.css';

// Custom Domain Icons for Mobile Navbar
const PositionIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 20L7 4L11 20H3Z" fill="white" stroke="white" />
    <path d="M13 20L17 4L21 20H13Z" fill="black" stroke="currentColor" />
  </svg>
);

const ScoresIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Colored cells representing heatmap segments */}
    <rect x="3" y="3" width="6" height="6" fill="#ef4444" stroke="none" fillOpacity="0.8" />
    <rect x="9" y="3" width="6" height="6" fill="#f59e0b" stroke="none" fillOpacity="0.8" />
    <rect x="15" y="3" width="6" height="6" fill="#10b981" stroke="none" fillOpacity="0.8" />
    <rect x="3" y="9" width="6" height="6" fill="#f59e0b" stroke="none" fillOpacity="0.8" />
    <rect x="9" y="9" width="6" height="6" fill="#10b981" stroke="none" fillOpacity="0.8" />
    <rect x="15" y="9" width="6" height="6" fill="#3b82f6" stroke="none" fillOpacity="0.8" />
    <rect x="3" y="15" width="6" height="6" fill="#10b981" stroke="none" fillOpacity="0.8" />
    <rect x="9" y="15" width="6" height="6" fill="#3b82f6" stroke="none" fillOpacity="0.8" />
    <rect x="15" y="15" width="6" height="6" fill="#6366f1" stroke="none" fillOpacity="0.8" />
    <path d="M9 3V21M15 3V21M3 9H21M3 15H21" stroke="#888" strokeOpacity="0.4" />
    <rect x="3" y="3" width="18" height="18" rx="1" stroke="#888" strokeOpacity="0.8" />
  </svg>
);

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

  const isAndroid = /Android/i.test(navigator.userAgent);

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

  // Viewport height fix for mobile browsers (accounts for OS bars and browser chrome)
  // This is no longer needed due to the 'Sticky-Fixed' layout model.
  
  // Theme is applied via className on the root div (theme-${theme}) — no body mutation needed.

  const currentDeckName = decks.find(d => d.DeckID === parseInt(selectedDeckId, 10))?.DeckName || 'Select Deck';

  if (!hasStarted) {
    return (
      <div className={`app-container theme-${theme} mobile-layout mobile-app-level`}>
        <div className="mobile-header">
          <div className="header-title">CubeViz</div>
        </div>
        
        {/* Scrollable Welcome Content */}
        <div className="mobile-opening-main">
          <div className="welcome-content">
            <h2>Welcome to CubeViz</h2>
            <p>Backgammon match data, aggregated and visualized.</p>
            <p>
              This app explores the effect of match-score on cube decisions by presenting cube-action data for all scores up to a 25-point match, all at once. Instead of peeking at a data point here and there (Hey XG, what about this score? What about that score?), see the pattern as a whole. Insights abound.
            </p>
            <p>
              Select a deck of positions below, and tap <strong>Start Session</strong>.
            </p>
          </div>
        </div>

        {/* Fixed Selection Footer */}
        <div className="mobile-opening-footer">
          <div className="panel menu-panel">
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
            {isAndroid && (
              <button onClick={toggleFullScreen} className="mobile-secondary-button">
                {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
              </button>
            )}
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
      <main className={`mobile-main-content ${activeTab}-active`}>
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
            <div className="mobile-board-scroll-area">
              <div className="details-section">
                <PositionDetails cardId={cardsInDeck[currentCardIndex]} matchLength={heatmapMatchLength} deckName={currentDeckName} />
              </div>
              <div className="mobile-board-controls">
                <div className="control-group">
                  <label>Perspective:</label>
                  <select 
                    value={perspective} 
                    onChange={(e) => setPerspective(e.target.value)}
                    className="mobile-select"
                  >
                    <option value="doubler">Doubler's</option>
                    <option value="taker">Taker's</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'heatmap' && (
          <div className="mobile-page heatmap-page">
            <div className="heatmap-section">
              <Heatmap positionIndex={cardsInDeck[currentCardIndex]} mlength={heatmapMatchLength} dataType={heatmapDataType} cubeLevel={cubeLevelMap[cubeTo]} globalVisibility={heatmapDataVisibility} showData={true} isMobile={true}/>
            </div>
            
            {/* Relocated Heatmap Controls */}
            <div className="mobile-heatmap-controls">
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
                <label>Double To:</label>
                <select value={cubeTo} onChange={e => setCubeTo(parseInt(e.target.value, 10))} className="mobile-select">
                  {[2, 4, 8, 16, 32].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mobile-page settings-page">

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
      </main>

      {/* Bottom Nav Bar */}
      <div className="mobile-bottom-nav">
        <button className={`nav-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>
          <div className="nav-icon-container">
            <PositionIcon size={24} />
          </div>
          <span className="nav-label">Position</span>
        </button>
        <button className={`nav-item ${activeTab === 'heatmap' ? 'active' : ''}`} onClick={() => setActiveTab('heatmap')}>
          <div className="nav-icon-container">
            <ScoresIcon size={24} />
          </div>
          <span className="nav-label">Scores</span>
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
