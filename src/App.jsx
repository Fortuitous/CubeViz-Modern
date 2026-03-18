import React, { useState, useEffect } from 'react'
import './App.css'
import DesktopView from './components/DesktopView'
import MobileView from './components/MobileView'
import { DECK_SET_ORDER, DECK_ORDER, CC_CARD_ORDER } from './constants/legacyData'

const themeData = {
  1: { name: "Christmas", thumb: "/theme-thumbs/Christmas.png" },
  2: { name: "Butter", thumb: "/theme-thumbs/Butter.png" },
  3: { name: "Business", thumb: "/theme-thumbs/RedWhite.png" },
  4: { name: "Earth", thumb: "/theme-thumbs/Earth.png" },
  5: { name: "Sand", thumb: "/theme-thumbs/Sand.png" },
  6: { name: "Vineyard", thumb: "/theme-thumbs/Vineyard.png" },
  7: { name: "Lorax", thumb: "/theme-thumbs/Lorax.png" },
  8: { name: "Attache", thumb: "/theme-thumbs/Attache.png" },
  9: { name: "Sunset", thumb: "/theme-thumbs/Sunset.png" },
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

  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    const handleResize = () => setIsPortrait(window.innerHeight > window.innerWidth);
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
    document.body.classList.remove('theme-day', 'theme-night');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

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

  const viewProps = {
    hasStarted, theme, setTheme,
    selectedDeckId, setSelectedDeckId,
    deckSets, decks,
    handleStartDataView,
    cardsInDeck, currentCardIndex, setCurrentCardIndex,
    currentXgid, perspective, setPerspective,
    cubeTo, setCubeTo,
    boardTheme, setBoardTheme,
    boardDirection, setBoardDirection,
    heatmapDataType, setHeatmapDataType,
    heatmapMatchLength, setHeatmapMatchLength,
    heatmapDataVisibility, setHeatmapDataVisibility,
    handlePrevPosition, handleNextPosition,
    handleBackToSelection,
    copiedXgid, setCopiedXgid,
    themePickerOpen, setThemePickerOpen,
    appThemePickerOpen, setAppThemePickerOpen,
    themeData, cubeLevelMap
  };

  return isPortrait ? <MobileView {...viewProps} /> : <DesktopView {...viewProps} />;
}

export default App;
