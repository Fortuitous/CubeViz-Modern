import React, { useEffect, useState, useRef } from 'react';

const BackgammonBoard = ({ xgid = "XGID=-b----E-C---eE---c-e----B-:0:0:1:00:0:0:0:0:10", cubeLevel = 0 }) => {
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check if the legacy bgLog engine dependencies are loaded
    const checkEngine = () => {
      // bglogSVG comes from bglogCore-2010C-JB-CC-svg.js
      if (window.bglogSVG && window.jQuery && window.TweenLite && window.theme1) {
        setEngineLoaded(true);
      } else {
        setTimeout(checkEngine, 100);
      }
    };
    checkEngine();
  }, []);

  // Helper to reset messy legacy global state
  const resetLegacyState = () => {
    console.log("Resetting legacy bglog global state");
    
    // Reset tray pools to avoid accumulating extra checker IDs
    window.ourTrayCheckerArray = [];
    window.oppTrayCheckerArray = [];
    
    // Reset checker name tracking arrays (point x checkers)
    if (window.ourCheckerNameArray) {
      for (let i = 0; i < 25; i++) {
        if (window.ourCheckerNameArray[i]) {
          window.ourCheckerNameArray[i].fill(-1);
        }
      }
    }
    
    if (window.oppCheckerNameArray) {
      for (let i = 0; i < 25; i++) {
        if (window.oppCheckerNameArray[i]) {
          window.oppCheckerNameArray[i].fill(-1);
        }
      }
    }
    
    // Reset move queue
    if (window.moveListArray) {
      for (let i = 0; i < 30; i++) {
        window.moveListArray[i] = [];
      }
    }
  };

  // One-time initialization of the board SVG
  useEffect(() => {
    if (engineLoaded && window.bglogSVG && !initialized) {
      // Alias bglog like legacy flashcheck_new.js did
      window.bglog = window.bglogSVG;

      // Make sure the DOM container is empty before remaking to avoid duplicating SVGs
      const container = window.jQuery('#bglogContainer');
      if (container.length > 0) {
        container.empty();
        try {
          // CRITICAL: Reset the leaking globals before making a "fresh" board
          resetLegacyState();
          
          // makeBoard should only be called once to create the SVG elements
          window.bglog.makeBoard();
          if (window.theme1) window.bglog.loadTheme(window.theme1);
          setInitialized(true);
          console.log("Board container initialized once");
        } catch (err) {
          console.error("Failed to initialize legacy bglog board structure", err);
        }
      }
    }
  }, [engineLoaded, initialized]);

  // Update logic for XGID and Cube changes
  useEffect(() => {
    if (initialized && window.bglog) {
      try {
        // Ensure XGID prefix
        const fullXgid = xgid.startsWith("XGID=") ? xgid : "XGID=" + xgid;
        
        console.log("Updating board with XGID:", fullXgid);
        
        // Re-enable animations as per user request to see "gliding" checkers
        window.animateFlag = true;
        
        // Ensure reasonable animation speed exists in the legacy theme
        if (window.currentTheme && (window.currentTheme.animateSpeed === undefined || window.currentTheme.animateSpeed === 0)) {
          window.currentTheme.animateSpeed = 0.4;
        }
        
        // 1. Load the ID (this handles internal board arrays and triggers drawCheckers)
        window.bglog.loadXgId(fullXgid);

        // 2. checkSwap() logic
        if (window.fbSSFlag) {
          window.bglog.swapSides();
        }
        
        // 3. Define/Execute setCube as requested
        window.setCube = () => {
          // Recreating logic from flashcheck.js line 1336
          let cubeLocation = "mid";
          const fbSSFlag = window.fbSSFlag || false; // Default to false if not set
          
          if (fbSSFlag) {
            if (cubeLevel > 0) cubeLocation = "top";
          } else if (cubeLevel > 0) {
            cubeLocation = "bot";
          }
          
          if (typeof window.bglog.moveCube === 'function') {
            window.bglog.moveCube(1, cubeLocation, cubeLevel);
          }
        };

        window.setCube();

        // Ensure visuals are updated - loadXgId already calls drawCheckers, 
        // but calling it again here ensures the most recent cube/side-swap state is depicted.
        if (typeof window.bglog.drawCheckers === 'function') {
          window.bglog.drawCheckers();
        }
        
      } catch (err) {
        console.error("Error updating backgammon board state", err);
      }
    }
  }, [xgid, cubeLevel, initialized]);

  if (!engineLoaded) {
    return (
      <div className="panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Board Engine...</p>
      </div>
    );
  }

  return (
    <div className="panel" style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>Board Status</h3>
      
      <div 
        style={{ 
          width: '100%', 
          position: 'relative',
          paddingBottom: '65%', 
          backgroundColor: '#ebebeb', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: 'inset 0px 0px 5px rgba(0,0,0,0.1)'
        }}
      >
        <div 
          id="bglogContainer" 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%' 
          }}
        >
        </div>
      </div>
      
      <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        Position: {xgid}
      </div>
    </div>
  );
};

export default BackgammonBoard;
