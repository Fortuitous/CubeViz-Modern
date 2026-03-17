import React, { useEffect, useState, useRef } from 'react';

const BackgammonBoard = ({ 
  xgid = "XGID=-b----E-C---eE---c-e----B-:0:0:1:00:0:0:0:0:10", 
  cubeLevel = 0, 
  perspective = "doubler",
  boardTheme = 1,
  boardDirection = "right",
  appTheme = 'night'
}) => {
  const [engineLoaded, setEngineLoaded] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [currentPerspective, setCurrentPerspective] = useState("doubler");

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
          
          // Crop trays from the SVG viewBox (Original: 0 0 1028 724)
          const svg = container.find('svg');
          if (svg.length > 0) {
            svg[0].setAttribute('viewBox', '60 0 908 724');
          }
          
          if (window.theme1) window.bglog.loadTheme(window.theme1);
          setInitialized(true);
          console.log("Board container initialized once");
        } catch (err) {
          console.error("Failed to initialize legacy bglog board structure", err);
        }
      }
    }
  }, [engineLoaded, initialized]);

  // Update logic for XGID, Theme, Direction and Cube changes
  useEffect(() => {
    if (initialized && window.bglog) {
      try {
        // 0. Theme and Direction
        const themeObj = window['theme' + boardTheme];
        let directionChanged = false;
        if (themeObj) {
          console.log(`Loading board theme ${boardTheme}`);
          window.bglog.loadTheme(themeObj);
          
          // Set direction based on prop (right is default/false, left is true)
          const isLeft = (boardDirection === 'left');
          if (window.currentTheme.direction !== isLeft) {
             console.log(`Setting board direction to: ${boardDirection}`);
             window.currentTheme.direction = isLeft;
             directionChanged = true;
          }

          // Force synchronization of canvas and pipcount colors with App Theme
          const canvasColor = (appTheme === 'night') ? "#1a1b26" : "#F2F2F2";
          const pipTextColor = (appTheme === 'night') ? "#FFFFFF" : "#000000";
          
          if (window.currentTheme.canvasColor !== canvasColor || window.currentTheme.pipcountTextColor !== pipTextColor) {
            console.log(`Syncing board colors for ${appTheme} theme: ${canvasColor}, ${pipTextColor}`);
            window.currentTheme.canvasColor = canvasColor;
            window.currentTheme.pipcountTextColor = pipTextColor;
            // Force immediate SVG update and visual refresh
            window.bglog.loadTheme("currentTheme");
            window.bglog.drawCheckers();
          }
        }

        // Ensure XGID prefix
        const fullXgid = xgid.startsWith("XGID=") ? xgid : "XGID=" + xgid;
        
        console.log("Updating board with XGID:", fullXgid);
        
        // Re-enable animations as per user request to see "gliding" checkers
        window.animateFlag = true;
        
        // Ensure reasonable animation speed exists in the legacy theme
        if (window.currentTheme && (window.currentTheme.animateSpeed === undefined || window.currentTheme.animateSpeed === 0)) {
          window.currentTheme.animateSpeed = 0.4;
        }
        
        if (directionChanged) {
          console.log("Forcing full checker re-draw for direction change");
          
          // 1. Snapshot target state
          const targetXgid = fullXgid;
          
          // 2. Clear current counts in engine to force move to trays
          // We use the existing ourBoard/oppBoard arrays which the engine uses to track state
          if (window.ourBoard && window.oppBoard) {
            window.ourBoard.fill(0);
            window.oppBoard.fill(0);
            window.bglog.drawCheckers(); // Everything glides to trays
          }
          
          // 3. Update coordinates for the new direction
          window.bglog.updateTrays();
          window.bglog.doCubes();
          window.bglog.updateScores();
          window.bglog.doPointNumbers();
          
          // 4. Load the target position back and draw
          window.bglog.loadXgId(targetXgid); // This fills the boards and calls drawCheckers again
        } else {
          // Normal load
          window.bglog.loadXgId(fullXgid);
        }

        // 2. Perspective (checkSwap) logic
        const targetPerspective = perspective.toLowerCase();
        if (targetPerspective !== currentPerspective) {
          console.log(`Swapping perspective to: ${targetPerspective}`);
          window.fbSSFlag = targetPerspective === "taker";
          if (typeof window.bglog.swapSides === 'function') {
            window.bglog.swapSides();
          }
          setCurrentPerspective(targetPerspective);
        }
        
        // Ensure fbSSFlag is synced with global state for other components
        window.fbSSFlag = targetPerspective === "taker";
        
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
  }, [xgid, cubeLevel, initialized, perspective, boardTheme, boardDirection, appTheme]);

  if (!engineLoaded) {
    return (
      <div className="panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading Board Engine...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', flex: 0, display: 'flex', flexDirection: 'column', marginTop: '5px' }}>
      <div 
        style={{ 
          width: '100%', 
          position: 'relative',
          paddingBottom: '79.7%', // Updated for 908x724 aspect ratio (Tray-Crop)
          backgroundColor: 'transparent', 
          overflow: 'hidden'
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
    </div>
  );
};

export default BackgammonBoard;
