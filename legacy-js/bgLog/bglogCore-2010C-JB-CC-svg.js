// bglogCore-2010C-JB-CC-svg.js

var numberOfCubes = 1;
var maxCubes = 4;
var topCubes = [maxCubes,maxCubes,maxCubes,maxCubes];
var midCubes = [maxCubes,maxCubes,maxCubes,maxCubes];
var botCubes = [maxCubes,maxCubes,maxCubes,maxCubes];
var multiCubeOffset = 0;
var cubePos = "mid";
var cubeValue = 0;
var cubeNumber = 1;

var xgEmptyId = "XGID=--------------------------:0:0:1:00:0:0:0:0:10";
var xgStartPos = "XGID=-b----E-C---eE---c-e----B-:0:0:1:00:0:0:0:0:10";
var xgNackStartPos = "XGID=-bb---D-C---dD---c-d---BB-:0:0:1:00:0:0:0:0:10";
var xgPos = xgStartPos;

var defaultTheme = theme1;
var currentTheme = defaultTheme;
//var borderWidth = 5;
var borderSize;
var trayX;
var ourPoint;
var savedPos = xgEmptyId;
var idMessage = "";
var idWarningFlag = false;
var idErrorFlag = false;
var roll = true;
var turn = true;
var editMode = false;
var recMode = false;
var firstRoll = false;
var matchInProgress = false;
var cubeFlag = false;
var twoCubesFlag = false;
var diceSwapFlag = false;
var swapSidesFlag = false;
var snapBackFlag = false;
var undoMoveFlag = false;
var dragging = false;
var checkerTweenActive = false;
var drawFlag = true;
var animateFlag = true;
var badAndroidFlag = false;
var checkerSize = 60;
var lineWidth = (checkerSize / 60);
var doubleLineWidth = (lineWidth * 2);
var trayCheckerCornerRadius = (checkerSize / 10);
var cubeLineWidth = (checkerSize / 5);
var ourScore = 0;
var oppScore = 0;
var leftDie = 0;
var rightDie = 0;
var highDie = 0
var lowDie = 0;
var thisLeftDie = 0;
var thisRightDie = 0;
var matchLength = 0;
var cubeStatus = 0;
var nackFlag = 0;
var crawfordFlag = 0;
var jacobyFlag = 0;
var beaverFlag = 0;
var resignFlag = 0;
var moveCount = 0;
var count = 0;
var size = 0;
var gameState = 1;

var oppBoard = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
var ourBoard = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);

var ourCheckerNameArray = new Array(25);
for (var i = 0; i < ourCheckerNameArray.length; i++) {
	ourCheckerNameArray[i] = new Array(15);
	for (var j = 0; j < 15; j++) {
		ourCheckerNameArray[i][j] = -1;
	}
}
var oppCheckerNameArray = new Array(25);
for (var i = 0; i < oppCheckerNameArray.length; i++) {
	oppCheckerNameArray[i] = new Array(15);
	for (var j = 0; j < 15; j++) {
		oppCheckerNameArray[i][j] = -1;
	}
}

var ourTrayCheckerArray = [];
var oppTrayCheckerArray = [];

var moveListArray = new Array(30);
for (var i = 0; i < 30; i++) {
	moveListArray[i] = new Array(0);
}
		
var moveArray = [
	[0,0,"+", -1],
	[0,0,"+", -1],
	[0,0,"+", -1],
	[0,0,"+", -1]
];
		
// Functions
bglogSVG = {

	getPipCount:function() {
		thisPipCount = 0;
		ourPipCount = 0;
		oppPipCount = 0;
		for (var i = 0; i < 25; i++) {
			if (ourBoard[i] > 0) ourPipCount += (ourBoard[i] * (i + 1));
			if (oppBoard[i] > 0) oppPipCount += (oppBoard[i] * (i + 1));
		}
		if (roll) thisPipCount = ourPipCount;
		else thisPipCount = oppPipCount;
	},
	
	//core
	move:function(fromPoint, toPoint, count) {
		if (fromPoint == toPoint) return;
		//console.log("move " + fromPoint + " to " + toPoint);
		var barPoint = 24;
		var otherToPoint = -(toPoint - 23);
		
		if (roll) thisBoard = ourBoard;
		else thisBoard = oppBoard;
		
		var thisSaveBoard = thisBoard;
		thisToPoint = toPoint;
		thisFromPoint = fromPoint;
		
		var ourCheckersInOuterBoard = 0;
		var oppCheckersInOuterBoard = 0;
		for (var i = 24; i > 5; i--) ourCheckersInOuterBoard += ourBoard[i];
		for (var i = 24; i > 5; i--) oppCheckersInOuterBoard += oppBoard[i];
		
		if ((fromPoint == barPoint) && (undoMoveFlag)) {
			// special case to undo hit checker
			//console.log("Undo hit");
			if (thisBoard == ourBoard) {
				thisBoard = oppBoard;
				otherBoard = ourBoard;
			} else {
				thisBoard = ourBoard;
				otherBoard = oppBoard;
			}
			thisToPoint = otherToPoint;
		}
		
		if (thisBoard == ourBoard) {
			otherBoard = oppBoard;
			checkerNameArray = ourCheckerNameArray;
			otherCheckerNameArray = oppCheckerNameArray;
			trayCheckerArray = ourTrayCheckerArray;
			checkers = ourCheckersInOuterBoard;
		} else {
			otherBoard = ourBoard;
			checkerNameArray = oppCheckerNameArray;
			otherCheckerNameArray = ourCheckerNameArray;
			trayCheckerArray = oppTrayCheckerArray;
			checkers = oppCheckersInOuterBoard;
		}
		
		if ((fromPoint < 0) && (undoMoveFlag)) {
			// special case for bearing in from undo
			//console.log("bear in, checkerName: " + checkerName);
			checkerName = trayCheckerArray.pop();
			if (toPoint >= 0) checkerNameArray[toPoint][thisBoard[toPoint]] = checkerName;
			bglog.pointToXY(toPoint, thisBoard[toPoint], thisBoard);
			thisBoard[toPoint] += count;
			thisFromPoint = -1;
			moveListArray[checkerName].push(pointX, pointY);
			bglog.runMoveList();
			savedPos = xgPos;
			return;
		}
		checkerName = checkerNameArray[fromPoint][thisBoard[fromPoint]-1];
		if ((checkerName != undefined) && (checkerName != -1)) { // move arrayChecker
			checkerNameArray[fromPoint][thisBoard[fromPoint]-1] = -1;
			if (toPoint >= 0) checkerNameArray[toPoint][thisBoard[toPoint]] = checkerName;
		} else {
			console.log("checkerName not found!!");
			return;
		}

		if (toPoint < 0) { // bear off
			if ((checkers == 0) || (editMode)) {
				thisBoard[fromPoint] -= count;
				trayCheckerArray.push(checkerName);
				bglog.pointToXY(toPoint, 0, thisBoard);
				moveListArray[checkerName].push(pointX, pointY);
				diceToPlay -= count;
				pipsToMove -= ((fromPoint - toPoint) * count);
				bglog.saveMove(fromPoint + 1, "o", count, "", checkerName);
			}
		} else { // regular move
			bglog.pointToXY(toPoint, thisBoard[toPoint], thisBoard);
			hit = "";
			thisBoard[fromPoint] -= count;
			thisBoard[toPoint] += count;
			moveListArray[checkerName].push(pointX, pointY);
			diceToPlay -= count;
			pipsToMove -= ((fromPoint - toPoint) * count);
			if (otherBoard[otherToPoint] == 1) {
				otherBoard[otherToPoint] = 0;
				otherBoard[barPoint] += 1;
				hit = "*";
				// find the checker to be hit
				hitChecker = otherCheckerNameArray[otherToPoint][otherBoard[otherToPoint]];
				if ((hitChecker != undefined) && (hitChecker != -1)) { // move arrayChecker
					otherCheckerNameArray[otherToPoint][otherBoard[otherToPoint]] = -1;
					otherCheckerNameArray[barPoint][otherBoard[barPoint] -1] = hitChecker;
				} else {
					console.log("hitChecker " + hitChecker + " not found!!");
					return;
				}
				bglog.pointToXY(barPoint, (otherBoard[barPoint] -1), otherBoard);
				thisToPoint = barPoint;
				//console.log("move hit checker " + checkerName + " from " + toPoint + " to " + thisToPoint);
				moveListArray[hitChecker].push(pointX, pointY);
			}
			bglog.saveMove(fromPoint + 1, toPoint + 1, count, hit, checkerName);
		}
		thisBoard = thisSaveBoard;
		if (pipsToMove == 0) {
			diceToPlay = 0;
		}
		bglog.runMoveList();
	},

	runMoveList:function() {
		// we do this point by point to ensure the checkers are stacked in the right order
		for (var i=0; i<oppBoard.length; i++) {
			if (oppBoard[i] > 0) {
				for (j=0; j<oppBoard[i]; j++) bglog.generateMove(oppCheckerNameArray[i][j]);
			}
			if (ourBoard[i] > 0) {
				for (j=0; j<ourBoard[i]; j++) bglog.generateMove(ourCheckerNameArray[i][j]);
			}
		}
		// the moveList now only contains moves of spares to the trays
		for (var i=0; i<moveListArray.length; i++) bglog.generateMove(i);
		bglog.updatePipCount();
		bglog.boardToXGpos();
	},
	
	generateMove:function(checkerName) {
		if (moveListArray[checkerName].length > 0) {
			var pointY = moveListArray[checkerName].pop(); // if there is more than one move per checker, use the last one
			var pointX = moveListArray[checkerName].pop(); 
			//console.log("move checker " + checkerName + " to " + pointX + ", " + pointY);
			moveListArray[checkerName] = []; // zap any other moves
			bglog.moveChecker(checkerName, pointX, pointY, currentTheme.animateSpeed);
		}
	},
	
	//core
	saveMove:function (fromPoint, toPoint, count, hit, checkerName) {
		//console.log(moveArray);
		if (!undoMoveFlag) {
			moveArray[moveCount][0] = fromPoint;
			moveArray[moveCount][1] = toPoint;
			moveArray[moveCount][2] = count;
			moveArray[moveCount][3] = hit;
			moveArray[moveCount][4] = checkerName;
			moveCount++;
		}
	},
	
	//core
	clearMoveArray:function () {
		for (var i = 0; i < 4; i++) {
			moveArray[i][0] = 0;
			moveArray[i][1] = 0;
			moveArray[i][2] = 0;
			moveArray[i][3] = "+";
			moveArray[i][4] = -1;
		}
		//moveCount = 0;
	},
	
	//core
	undoMove:function() {
		//console.log("undoMove, moveCount: " + moveCount);
		if (moveCount > 0) {
			undoMoveFlag = true;
			for (var i = moveCount - 1; i >= 0; i--) {
				checkerName = moveArray[i][4];
				thisFromPoint = moveArray[i][1];
				if (thisFromPoint == "o") {
					thisFromPoint = -1;
				} else {
					thisFromPoint--;
				}
				bglog.move(thisFromPoint, moveArray[i][0] - 1, moveArray[i][2]);
				if (moveArray[i][3] == "*") {
					var thisToPoint = moveArray[i][1] - 1;
					//console.log("undo hit");
					bglog.move(24, -(thisToPoint - 23), 1);
				}
			}
			bglog.clearMoveArray();
			moveCount = 0;
			diceToPlay = 2;
			pipsToMove = (leftDie + rightDie);
			if (leftDie == rightDie) {
				pipsToMove += pipsToMove;
				diceToPlay = 4;
			}
			undoMoveFlag = false;
		}
	},
	
	//core
	XYtoPointCount:function(thisX, thisY) {
	// this function figures out which point number is clicked
	// it sets ourPoint and count
		// check for trays
		if ((thisX < leftX) || (thisX > (rightX + checkerSize))) {
			ourPoint = -1;
			oppPoint = -1;
			thisPoint = -1;
		} else 
		// check for bar
		if ((thisX >= (leftX + (checkerSize * 6))) && (thisX <= (leftX + (checkerSize * 7)))) {
			ourPoint = 24; // bar
			oppPoint = 24;
			thisPoint = 24;
		} else
		if (thisY <= middleY) { // top half
			if (thisX < (leftX + (checkerSize * 6))){
				ourPoint = ((-((thisX - leftX) / checkerSize)) + 24); // right side
			} else {
				thisX -= checkerSize; // BAR_WIDTH
				ourPoint = ((-((thisX - leftX) / checkerSize)) + 24); // left side
			}
		} else // bottom half
		if (thisX < (leftX + (checkerSize * 6))){
			ourPoint = (((thisX - leftX) / checkerSize) - 0);
		} else {
			thisX -= checkerSize; // BAR_WIDTH
			ourPoint = (((thisX - leftX) / checkerSize) - 0);
		}
		ourPoint = Math.floor(ourPoint);
		// now we figure out the count, ie number of checkers on point
		// top and bottom & right and left
		count = 0;
		if ((thisY < topY) && ((thisX > leftX) && (thisX < (rightX + checkerSize)))) count = 0;
		if ((thisY > bottomY) && ((thisX > leftX) && (thisX < (rightX + checkerSize)))) count = 0;

		else if (thisY < (middleY - (checkerSize / 2))) { // top
			count = Math.ceil((thisY - topY) / checkerSize);
		} else if (thisY > (middleY + (checkerSize / 2))) {
			count = Math.ceil((-(thisY - topY) / checkerSize) + 11);
		} else count = 6;
		//count = Math.ceil(count);
							
		// adjust for direction
		if ((!currentTheme.direction) && (ourPoint != 24) && (ourPoint != -1)) {
			if (ourPoint < 12) ourPoint = ((-ourPoint) + 11);
			else ourPoint = ((-ourPoint) + 35);
		}
		// we now know the point clicked and the count
		if (ourPoint == 24) oppPoint = 24 // fix up bar
		else if (ourPoint != -1) oppPoint = -(ourPoint-23);
		
		// set up all the variables we'll need
		var ourCheckersInOuterBoard = 0;
		var oppCheckersInOuterBoard = 0;
		for (var i = 24; i > 5; i--) ourCheckersInOuterBoard += ourBoard[i];
		for (var i = 24; i > 5; i--) oppCheckersInOuterBoard += oppBoard[i];
		
		if (roll) {
			thisBoard = ourBoard;
			otherBoard = oppBoard;
			thisPoint = ourPoint;
			otherPoint = oppPoint;
			checkers = ourCheckersInOuterBoard;
			checkerColor = currentTheme.ourCheckerColor;
		} else {
			thisBoard = oppBoard;
			otherBoard = ourBoard;
			thisPoint = oppPoint;
			otherPoint = ourPoint;
			checkers = oppCheckersInOuterBoard;
			checkerColor = currentTheme.oppCheckerColor;
		}
	},
	
	//core
	loadXgId:function(xgid) {
		if (xgid == "") return;
		if (xgid === undefined) return;
		//console.log("loadXgId: " + xgid);
		bglog.xgPosToBoard(xgid);
		bglog.xgMatchToBoard(xgid);
		bglog.drawCheckers();
		bglog.setDice();
		bglog.doPointNumbers();
	},
	
	//loadgnuId:function(posid,matchid) {
	loadgnuId:function(id) {
		//gnuPosid = id.substring(13, 27);
		//gnuMatchid = id.substring(38, 50);
		var gnuid = id.split(":");
		gnuPosid = gnuid[0];
		gnuMatchid = gnuid[1];
		//console.log("gnuPosid: " + gnuPosid + ", gnuMatchid: " + gnuMatchid);
		if (gnuMatchid != null) bglog.matchid2board(gnuMatchid);
		if (gnuPosid != null) bglog.posid2board(gnuPosid);
		bglog.drawCheckers();
		bglog.setDice();
		bglog.doPointNumbers();
	},
	
	//core
	swapSides:function() {
		bglog.swapColors();
		bglog.toggleRoll();
		
		var thisBoard = ourBoard;
		ourBoard = oppBoard;
		oppBoard = thisBoard;
		
		var tempCubes = topCubes;
		topCubes = botCubes;
		botCubes = tempCubes;
		
		var tempCubePos = cubePos;
		if (tempCubePos == "top") cubePos = "bot";
		if (tempCubePos == "bot") cubePos = "top";
		
		animateFlag = false;
		bglog.doCubes();
		bglog.drawCheckers();
		bglog.setDice();
		animateFlag = true;
		
		if (swapSidesFlag) swapSidesFlag = false; // for external use only
		else swapSidesFlag = true;
	},
	
	//core
	swapColors:function() {
		var tempColor = currentTheme.ourCheckerColor;
		currentTheme.ourCheckerColor = currentTheme.oppCheckerColor;
		currentTheme.ourDiceColour = currentTheme.oppCheckerColor;
		currentTheme.oppCheckerColor = tempColor;
		currentTheme.oppDiceColour = tempColor;
		
		tempColor = currentTheme.ourDicePipColor;
		currentTheme.ourDicePipColor = currentTheme.oppDicePipColor;
		currentTheme.oppDicePipColor = tempColor;
		
		tempColor = currentTheme.ourStackingColor;
		currentTheme.ourStackingColor = currentTheme.oppStackingColor;
		currentTheme.oppStackingColor = tempColor;
		
		$('.ourchecker').attr('fill', currentTheme.ourCheckerColor);
		$('#ourTurnChecker').attr('fill', currentTheme.ourCheckerColor);
		$('.ourdice').attr('fill', currentTheme.ourCheckerColor);
		$('.oppchecker').attr('fill', currentTheme.oppCheckerColor);
		$('#oppTurnChecker').attr('fill', currentTheme.oppCheckerColor);
		$('.oppdice').attr('fill', currentTheme.oppCheckerColor);

		//bglog.loadTheme(currentTheme);
		//do3Dshadows();
	},
	
	setDice:function() {
		if ((leftDie == 0) && (rightDie == 0) || (!currentTheme.showDice)) {
			bglog.hideDice();
			return;
		}
		if (roll) {
			$('.oppdice').hide();
			$('.ourdice').show();
			var dieTurn = "our";
		} else {
			$('.ourdice').hide();
			$('.oppdice').show();
			var dieTurn = "opp";
		}
		bglog.showDice(dieTurn + "L", leftDie);
		bglog.showDice(dieTurn + "R", rightDie);
		//console.log("setDice leftDie: " + leftDie + ", rightDie: " + rightDie);
	},
	
	showDice: function(die, num) {
		// hide all pips (num == 0)
		$('#'+die+'tlPip').hide();
		$('#'+die+'trPip').hide();
		$('#'+die+'clPip').hide();
		$('#'+die+'cPip').hide();
		$('#'+die+'crPip').hide();
		$('#'+die+'blPip').hide();
		$('#'+die+'brPip').hide();
		if (num == 1) {
			$('#'+die+'cPip').show();
		} else if (num == 2) {
			$('#'+die+'tlPip').show();
			$('#'+die+'brPip').show();
		} else if (num == 3) {
			$('#'+die+'trPip').show();
			$('#'+die+'cPip').show();
			$('#'+die+'blPip').show();
		} else if (num == 4) {
			$('#'+die+'tlPip').show();
			$('#'+die+'trPip').show();
			$('#'+die+'blPip').show();
			$('#'+die+'brPip').show();
		} else if (num == 5) {
			$('#'+die+'tlPip').show();
			$('#'+die+'trPip').show();
			$('#'+die+'cPip').show();
			$('#'+die+'blPip').show();
			$('#'+die+'brPip').show();
		} else if (num == 6) {
			$('#'+die+'tlPip').show();
			$('#'+die+'trPip').show();
			$('#'+die+'clPip').show();
			$('#'+die+'crPip').show();
			$('#'+die+'blPip').show();
			$('#'+die+'brPip').show();
		}
	},
	
	hideDice: function() {
		$('.dice').hide();
	},
	
	//split
	toggleDirection:function() {	
		//console.log("td borderSize: " + borderSize + ", borderWidth: " + borderWidth + ", borderWidth: " + borderWidth);
		//bglog.startSpinner();
		if (currentTheme.direction) currentTheme.direction = false;
		else currentTheme.direction = true;
		animateFlag = false;
	 	bglog.doCubes();
		bglog.updateScores();
		var oldTrayX = trayX;
		bglog.updateTrays();
		
		for (var i=0; i<30; i++) { // move any tray checkers to opposite tray
			var thisChecker = $('#checker' + i);
			var thisCircle = $('#checkerCircle' + i);
			//var cornerRadius = (lineWidth * 4);
			var currX = 0;
			if (thisChecker[0]._gsTransform) {
				currX = thisChecker[0]._gsTransform.x;
			}
			if ((currX == oldTrayX) && (currX != trayX)) {
				TweenLite.set(thisChecker, {x: trayX});
				//console.log("toggleDirection: set tray checker height for " + i);
				TweenLite.set(thisCircle, {attr: {height: trayCheckerHeight, rx: trayCheckerCornerRadius}});
			}
		}
//		bglog.boardToXGpos();
//		savedPos = xgPos;
//		bglog.loadXgId(xgEmptyId);
		//bglog.drawCheckers();
//		bglog.loadXgId(savedPos);
		//bglog.drawCheckers();
		//bglog.setDice();
		//bglog.doPointNumbers();
		animateFlag = true;
	},
	
	toggleRoll:function() {
		if (roll) roll = false;
		else roll = true;
		bglog.setDice();
		bglog.updateScores();
		bglog.boardToXGpos();
		bglog.doPointNumbers();
		savedPos = xgPos;
	},
	
	updateTrays:function() {
		trayX = rightX + checkerSize + borderWidth;
		if (currentTheme.direction) trayX = (leftX - checkerSize - borderWidth);
		//console.log("updateTrays, trayX: " + trayX);
	},
	
	toggleStacking:function() {
		if (currentTheme.stacking) currentTheme.stacking = false;
		else {
			currentTheme.stacking = true;
			//allOurBoardCheckerTexts.setVisible(false);
			//allOppBoardCheckerTexts.setVisible(false);
		}
		bglog.drawCheckers();
	},
	
	toggleShowNumbers:function() {
		if (currentTheme.showPointNumbers) currentTheme.showPointNumbers = false;
		else currentTheme.showPointNumbers = true;
		bglog.doPointNumbers();
		//doTextShadows();
	},
	
	togglecpStyle:function() {
		if (currentTheme.cpStyle) currentTheme.cpStyle = false;
		else currentTheme.cpStyle = true;
		bglog.doPointNumbers();
		//doTextShadows();
	},
	
	toggletakiPoints:function() {
		if (currentTheme.takiPoints) currentTheme.takiPoints = false;
		else currentTheme.takiPoints = true;
		$('.takiPoint').hide();
		$('.nonTakiPoint').hide();
		if (currentTheme.takiPoints) $('.takiPoint').show();
		else $('.nonTakiPoint').show();
	},
	
	togglePipCount:function() {
		if (currentTheme.showPipCount) currentTheme.showPipCount = false;
		else currentTheme.showPipCount = true;
		bglog.updatePipCount();
	},
	
	toggleCube:function() {
		if (currentTheme.showCube) currentTheme.showCube = false;
		else currentTheme.showCube = true;
	},
	
	toggleIDs:function() {
		if (currentTheme.showIDs) currentTheme.showIDs = false;
		else currentTheme.showIDs = true;
	},
	
	toggleEdit:function() {
		if (editMode) editMode = false;
		else editMode = true;
	},
	
	toggleDice:function() {
		if (currentTheme.showDice) currentTheme.showDice = false;
		else currentTheme.showDice = true;
		if (currentTheme.showDice) bglog.setDice();
		//else bglog.clearAllDice();
		else bglog.hideDice();
	},
	
	toggleScore:function() {
		//console.log("toggleScore from " + currentTheme.showScore);
		if (currentTheme.showScore) currentTheme.showScore = false;
		else currentTheme.showScore = true;
		if (currentTheme.showScore && (matchLength != 0)) {
			$('#ourScoreText').show();
			$('#oppScoreText').show();
		} else {
			$('#ourScoreText').hide();
			$('#oppScoreText').hide();
		}
	},
	
	toggleTurnIndicator:function() {
		//console.log("toggleTurnIndicator from " + currentTheme.showTurnIndicator);
		if (currentTheme.showTurnIndicator) currentTheme.showTurnIndicator = false;
		else currentTheme.showTurnIndicator = true;
		// rest of this done in updateScores ***
		if (currentTheme.direction) {
			$('#ourScoreText').attr('x', (leftX - borderWidth - (checkerSize / 2)));
			$('#oppScoreText').attr('x', (leftX - borderWidth - (checkerSize / 2)));
		} else {
			$('#ourScoreText').attr('x', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
			$('#oppScoreText').attr('x', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
		}
		if (currentTheme.showTurnIndicator) {
			if (roll) {
				$('#oppTurnChecker').hide();
				$('#ourTurnChecker').show();
			} else {
				$('#oppTurnChecker').show();
				$('#ourTurnChecker').hide();
			}
		} else {
			$('#ourTurnChecker').hide();
			$('#oppTurnChecker').hide();
		}
		bglog.updateScores();
	},
	
	toggleAwayStyle:function() {
		if (currentTheme.awayStyle) currentTheme.awayStyle = false;
		else currentTheme.awayStyle = true;
		bglog.updateScores();
	},
	
	toggleCubeStart:function() {
		if (currentTheme.cubeStart) currentTheme.cubeStart = false;
		else currentTheme.cubeStart = true;
		bglog.doCubes();
	},
	
	setAnimationSpeed: function(animationSpeed) {
		currentTheme.animateSpeed = animationSpeed;
	},

	moveCube:function(cubeNumber, pos, val) {
		//console.log("moveCube " + (cubeNumber - 1) + " to " + pos + ", val: " + val + ", numberOfCubes: " + numberOfCubes);
//		if (cubeNumber > allCubeGroups.length) {
//			console.log("moveCube: cubeNumber: " + cubeNumber + " more than " + allCubeGroups.length);
//			return;
//		}
		var thisCube = cubeNumber -1;
		var thisCubePos = pos;
//		var thisCubeGroup = allCubeGroups[thisCube];
//		var thisCubeText = thisCubeGroup.getChildren()[1];
		var thisCubeText = $('#cube' + thisCube + 'Text');
		var thisCubeValue = val;
		
		var cubeX = ((checkerSize * 1) + (borderWidth * 1) + ((size - cubeWidth) / 2));
		var cubeY = ((checkerSize * 5) + borderWidth + pipCountFontSize + ((size - cubeWidth) / 2));
		
		//thisCubeGroup.visible(true);
		$('#cube' + thisCube).css("visibility", "visible");
		//$('#cube' + thisCube).show();
		//$('#cube1').show();
		if (pos == "off") {
			//thisCubeGroup.visible(false);
			$('#cube' + thisCube).css("visibility", "hidden");
			//$('#cube' + thisCube).hide();
			//movingLayer.draw();
			return;  // set cube values anyway ??
		}
		if (pos == "on") {
			//thisCubeGroup.visible(true);
			$('#cube' + thisCube).css("visibility", "visible");
			//$('#cube' + thisCube).show();
			//movingLayer.draw();
			return;
		}

		if ((currentTheme.cubeStart) && (thisCubePos == "mid") && (thisCubeValue == 0)) thisCubeValue = 6;		
		var value = Math.pow(2, thisCubeValue);		
		//thisCubeText.setText(value+'');
		thisCubeText.text(value+'');
		//if (crawfordFlag == 1) thisCubeText.setText('C');
		if (crawfordFlag == 1) thisCubeText.text('C');
		
		if ((thisCube == 0) && ((thisCubePos == "ourside") || (thisCubePos == "oppside"))) {
			cubeX = leftX + (checkerSize * 6) + (cubeLineWidth / 2);
			cubeY = topY + (checkerSize * 5) + (cubeLineWidth / 2);
			if (currentTheme.direction) cubeX -= (checkerSize * 3.5);
			else cubeX += (checkerSize * 3.5);
			if (thisCubePos == "ourside") cubeY += (checkerSize * 3);
			if (thisCubePos == "oppside") cubeY -= (checkerSize * 3);
			bglog.animateCube(thisCube, cubeX, cubeY);
		} else {
			for (var i=0; i<maxCubes; i++) { // zap current position
				if (topCubes[i] == thisCube) topCubes[i] = maxCubes;
				if (midCubes[i] == thisCube) midCubes[i] = maxCubes;
				if (botCubes[i] == thisCube) botCubes[i] = maxCubes;
			}
			if (thisCube == 0) {
				cubePos = thisCubePos;
				//cubeValue = thisCubeValue;
				cubeValue = val;
			}
			//if (thisCubeGroup.visible()) console.log("Cube " + thisCube + " visible");
			//else console.log("Cube " + thisCube + " invisible");
//			if (thisCubeGroup.visible()) { // update cube pos array, only for visible cubes
				if (thisCubePos == "top") {
					for (var i=0; i<maxCubes; i++) {
						if (topCubes[i] == maxCubes) {
							topCubes[i] = thisCube;
							break;
						}
					}
				}
				if (thisCubePos == "mid") {
					for (var i=0; i<maxCubes; i++) {
						if (midCubes[i] == maxCubes) {
							midCubes[i] = thisCube;
							break;
						}
					}
				}
				if (thisCubePos == "bot") {
					for (var i=0; i<maxCubes; i++) {
						if (botCubes[i] == maxCubes) {
							botCubes[i] = thisCube;
							break;
						}
					}
				}
//			} //else console.log("ignore invisible cube " + thisCube);
			
			topCubes.sort();
			midCubes.sort();
			botCubes.sort();

			bglog.doCubes();
		}
	},
	
	//split
	showCubes:function() {
		//console.log("showCubes: numberOfCubes: " + numberOfCubes);
		if (currentTheme.showCube) {
			for (var i=0; i<maxCubes; i++) {
				if (i >= numberOfCubes) allCubeGroups[i].hide(); // hide cube
				else allCubeGroups[i].show(); // show cube
			}
		} else allCubeGroups.hide();
		bglog.drawLayer(movingLayer);
	},
	
	//core
	animateCube:function(cubeNumber, cubeX, cubeY) {
		if (!drawFlag) return;
		//console.log("animateCube: x:" + cubeX + ", y:" + cubeY);
		//console.log("animateCube " + cubeNumber + " to x:" + cubeX + ", y:" + cubeY);
//		var thisGroup = allCubeGroups[cubeNumber];
//		var currX = thisGroup.getX();
//		var currY = thisGroup.getY();
		//console.log("currX: " + currX + ", currY: " + currY);
//		if ((currX == newCubeX) && (currY == newCubeY)) { //** need to delay this until animation starts or it is wrongly ignored
//			console.log("animateCube " + cubeNumber + " no move required");
//			return;
//		}
		//console.log("animateCube " + cubeNumber + " to x:" + cubeX + ", y:" + cubeY);
//		if (currentTheme.animateSpeed == 0) {
//			thisGroup.setX(cubeX);
//			thisGroup.setY(cubeY);
//		} else {
			var speed = currentTheme.animateSpeed;
			if (!animateFlag) speed = 0;
//			speed = 0;
			bglog.moveToTop($('#cube' + cubeNumber)); // move to top
			TweenLite.to($('#cube' + cubeNumber), speed*2, {
				x: cubeX,
				y: cubeY,
				ease: Power4.easeInOut
			});
//		}
	},
	
	doCubes:function() {
		// move all cubes
		// set cubeX
		var halfCubeLineWidth = (cubeLineWidth / 2);
		if  ((numberOfCubes == 1) || ((numberOfCubes == 2) && twoCubesFlag)) {
			//cubeX = leftX + (checkerSize * 6) + halfCubeLineWidth;
			cubeX = leftX + (checkerSize * 6) + halfCubeLineWidth - doubleLineWidth;
		} else {
			cubeX = halfCubeLineWidth;
			if (!currentTheme.direction) cubeX = (checkerSize * 2.5) + rightX;
		}
		// we need to know how many cubes on mid to calculate cubeY
		var cubesOnMid = 0;
		for (var i=0; i<maxCubes; i++) {
			if (midCubes[i] < maxCubes) cubesOnMid++;
		}
		var cubesOnTop = 0;
		for (var i=0; i<maxCubes; i++) {
			if (topCubes[i] < maxCubes) cubesOnTop++;
		}
		var cubesOnBot = 0;
		for (var i=0; i<maxCubes; i++) {
			if (botCubes[i] < maxCubes) cubesOnBot++;
		}
		//console.log("cubesOnTop: " + cubesOnTop + ", cubesOnMid: " + cubesOnMid + ", cubesOnBot: " + cubesOnBot);
		for (var i=0; i<maxCubes; i++) {
			var cubeY = topY + doubleLineWidth; // top cubes - top down
			if (topCubes[i] < maxCubes) {
				bglog.animateCube(topCubes[i], cubeX, (cubeY + (checkerSize * i)));
			}
			var cubeY = topY - lineWidth + halfCubeLineWidth + (checkerSize * 5);
			if (cubesOnMid > 1) cubeY -= ((checkerSize / 2) * (cubesOnMid - 1)); // mid cubes - top down adjusted
			if (midCubes[i] < maxCubes) {
				bglog.animateCube(midCubes[i], cubeX, (cubeY + (checkerSize * i)));
			}
			var cubeY = topY + doubleLineWidth + halfCubeLineWidth + (checkerSize * 10); // bot cubes - bottom up
			if (botCubes[i] < maxCubes) {
				bglog.animateCube(botCubes[i], cubeX, (cubeY - (checkerSize * i)));
			}
		}
	},
	
	drawCheckers:function() {
		var ourCheckerCount = 0;
		var oppCheckerCount = 0;
		for (var i = 0;  i < 25; i++) {
			ourCheckerCount += ourBoard[i];
			oppCheckerCount += oppBoard[i];
		}
		for (var i=0; i<25; i++) { // we have to remove unnecessary checkers first, to give us a pool to add checkers from
			bglog.generateMoveList("rem", i,ourBoard[i],ourBoard,ourCheckerCount);
			bglog.generateMoveList("rem", i,oppBoard[i],oppBoard,oppCheckerCount);
		}
		for (var i=0; i<25; i++) { // now add them back as needed
			bglog.generateMoveList("add", i,ourBoard[i],ourBoard,ourCheckerCount);
			bglog.generateMoveList("add", i,oppBoard[i],oppBoard,oppCheckerCount);
		}
		bglog.runMoveList();
	},
	
	generateMoveList:function(type, point, count, board, checkerCount) {
		var thisType = type; // "add" or "rem"ove
		var thisPoint = point;
		var thisCount = count;
		var thisBoard = board;
		var thisCheckerCount = checkerCount;
		var thisCheckerNameArray = ourCheckerNameArray;
		var thisTrayCheckerArray = ourTrayCheckerArray;
		var thisBoardText = "our";
		if (thisBoard == oppBoard) {
			thisCheckerNameArray = oppCheckerNameArray;
			thisTrayCheckerArray = oppTrayCheckerArray;
			thisBoardText = "opp";
		}
		// get current number of checkers on point
		var checkersOnPoint = 0;
		var checkerName = -1;
		for (var i=0; i<15; i++) {
			if (thisCheckerNameArray[thisPoint][i] != -1) {
				checkersOnPoint++;
				checkerName = thisCheckerNameArray[thisPoint][i];
			}
			else break;
		}
		//console.log("generateMoveList point: " + point + ", count: " + count + ", checkerCount: " + checkerCount + ", trayCount: " + thisTrayCount);
		if (((thisCheckerCount - thisBoard[thisPoint]) + thisCount) > 15) {
			thisCount = (15 - (thisCheckerCount - (thisBoard[thisPoint])));
		}
		//if (thisCount < 6) {
			//***thisBoard[thisPoint] = thisCount;
			//console.log("up2: place " + thisCount + " checkers on " + thisBoardText +" point " + (thisPoint + 1));
			// set number of checkers on point
			if ((checkersOnPoint > thisCount) && (thisType == "rem")) { // remove checkers
				for (var i=(checkersOnPoint - thisCount); i>0; i--) {
					// get top point checker
					checkersOnPoint--;
					checkerName = thisCheckerNameArray[thisPoint][checkersOnPoint];
					thisCheckerNameArray[thisPoint][checkersOnPoint] = -1;
					thisTrayCheckerArray.push(checkerName);
					//console.log("move " + checkerName + " from " + thisPoint + " to tray");
					thisFromPoint = thisPoint;
					bglog.pointToXY(-1, 0, thisBoard);
					//console.log("add move " + checkerName + " to " + pointX + ", " + pointY);
					moveListArray[checkerName].push(pointX, pointY);
				}
			} else if ((checkersOnPoint < thisCount) && (thisType == "add")) { // add checkers
				thisCount-= checkersOnPoint;
				for (var i=0; i<thisCount; i++) {
					// get top tray checker
					if (thisTrayCheckerArray.length == 0) {
						console.log("trayCheckerArray error, move ignored.");
						return;
					}
					checkerName = thisTrayCheckerArray.pop();
					thisCheckerNameArray[thisPoint][checkersOnPoint] = checkerName;
					//console.log("move " + checkerName + " from tray to " + thisPoint);
					thisFromPoint = -1;
					bglog.pointToXY(thisPoint, checkersOnPoint++, thisBoard);
					//console.log("add move " + checkerName + " to " + pointX + ", " + pointY);
					moveListArray[checkerName].push(pointX, pointY);
				}
			}
		//}
		else if (thisType == "add") {
			//thisCount = 5;
			//if ((thisCheckerCount + thisCount) > 15) thisCount = (15 - thisCheckerCount);
			if ((thisCount - checkersOnPoint) > 15) thisCount = (15 - thisCheckerCount);
			//***thisBoard[thisPoint] += thisCount;
			//console.log("up1: add " + thisCount + " checkers to " + thisBoardText +" point " + (thisPoint + 1));
			var moveCount = (thisCount - checkersOnPoint);
			for (var i=0; i<moveCount; i++) {
				// get top tray checker
				if (thisTrayCheckerArray.length == 0) {
					console.log("trayCheckerArray error, move ignored.");
					return;
				}
				checkerName = thisTrayCheckerArray.pop();
				thisCheckerNameArray[thisPoint][checkersOnPoint] = checkerName;
				//console.log("move " + checkerName + " from tray to " + thisPoint);
				thisFromPoint = -1;
				bglog.pointToXY(thisPoint, checkersOnPoint++, thisBoard);
				//console.log("add move " + checkerName + " to " + pointX + ", " + pointY);
				moveListArray[checkerName].push(pointX, pointY);
			}
		}
	},
	
	moveToTop:function(el) {
		var element = el[0];
		element.ownerSVGElement.appendChild(element); // move to top
		//console.log("move " + element.id + " to top");
	},
	
	moveChecker:function(checkerName, toX, toY, speed) {
		//console.log("start moveChecker");
		//console.log("args: " + arguments.length);
		
		if (checkerName == -1) {
			console.log("checkerName -1 ignored");
			return;
		}
		
		firstRoll = false; // *** shouldn't be here
		
		thisMovingChecker = $('#checker' + checkerName);
		var checkerId = "#" + thisMovingChecker.attr('id');
		//originX = parseInt($(checkerId).attr('x'));
		//originY = parseInt($(checkerId).attr('y'));
		currX = currY = 0;
		if (thisMovingChecker[0]._gsTransform) {
			currX = thisMovingChecker[0]._gsTransform.x;
			currY = thisMovingChecker[0]._gsTransform.y;
		}
		
		//console.log("moveChecker " + checkerName + " from " + thisFromPoint + ", " + currX + "," + currY + " to " + toX + "," + toY);
		//console.log("ourTrayCount: " + ourTrayCount + ", oppTrayCount: " + oppTrayCount);
		
//		if ((currX == toX) && (currY == toY)) {
//			console.log("Checker " + checkerName + " - no move required");
//			return; // no move required
//		}
		
		//console.log("moveChecker " + checkerName + " from " + currX + "," + currY + " to " + toX + "," + toY);
		
		thisMovingChecker.show();
		var thisText = $('#checkerText' + checkerName);
		thisText.text("");
		var thisCircle = $('#checkerCircle' + checkerName);
		
		//var thisHighlight = thisMovingChecker.children[1];

		//if (((speed > 0) && (animateFlag)) && (!editMode) && (drawFlag)) { // if we're resizing the board or in edit mode or drawing is turned off (print), don't animate
		//if (((speed > 0) && (animateFlag)) && (!editMode)) {
//		if ((speed > 0) && (animateFlag)) {
	
//		if (checkerTweenActive){
//			console.log("checkerTweenActive");
//		}
	
		if (!animateFlag) speed = 0.01;
		
		checkerTweenActive = true;
		checkerTween = TweenLite.to(thisMovingChecker, speed, {
			paused: true,
			overwrite: true,
			x: toX,
			y: toY,
			ease: Power2.easeInOut,
			onStart: bglog.moveToTop(thisMovingChecker),
			onComplete: bglog.tweenComplete
		});
		//checkerTweenQueue.push(checkerTween);
		//setTimeout(function() {
		//	checkerTween = checkerTweenQueue.shift();
			if ((!snapBackFlag) && (!dragging)) {
				// bear in
				if (currX == trayX) {
					TweenLite.to(thisCircle, (speed / 2), {
						attr: {height: checkerHeight, rx: checkerSize},
						ease: Linear.easeNone,
						delay: (speed / 4)
					});
//						if (currentTheme.checkerHighlights) thisHighlight.visible(true);
				}
				// bear off
				if (toX == trayX) {
					TweenLite.to(thisCircle, (speed / 3), {
						attr: {height: trayCheckerHeight, rx: trayCheckerCornerRadius},
						ease: Linear.easeNone,
						delay: (speed / 2)
					});
					//thisHighlight.visible(false);
				} else {
					TweenLite.to(thisCircle, (speed / 2), {
						overwrite: "all",
						attr: {height: checkerHeight, rx: checkerSize},
						ease: Linear.easeNone
					});
				}
			}
			bglog.restack();
			checkerTween.play();
		//}, (speed * 100) * checkerTweenQueue.length);
	},
	
	//core
	tweenComplete:function() {
		checkerTweenActive = false;
		snapBackFlag = false;
		thisMovingChecker = this.target;
		var checkerId = thisMovingChecker.attr('id');
		checkerName = parseInt(checkerId.substring(7));
//		var thisHighlight = thisMovingChecker.children[1];
		bglog.restack();
		// if (touchEnabled) ???
		bglog.moveToTop($('#touch'));
	},
	
	restack:function() {
		if (!currentTheme.stacking) {
			bglog.restackBoard(ourBoard, ourCheckerNameArray);
			bglog.restackBoard(oppBoard, oppCheckerNameArray);
		}
	},
	
	restackBoard:function(board, nameArray) {
		for (var i=0; i<board.length; i++) {
			if (board[i] > 4) {
				var thisText = $('#checkerText' + nameArray[i][4]);
				if (board[i] > 5) {
					var count = (board[i] - 5);
					for (var j=count; j>0; j--) {
						var checkerName = nameArray[i][j + 4];
						$('#checker' + checkerName).hide();
					}
					thisText.text(board[i]);
				} else thisText.text("");
			}
		}
	},
	
	pointToXY:function(point, pos, board) {
		savePoint = point;
		savePos = pos;
		if (point == 24) {
			var myTopY = topY + (lineWidth / 2) + (4 * checkerSize);
			var myBotY = bottomY - (lineWidth / 2) - (5 * checkerSize);
			maxOnPoint = 4; // force maxOnPoint to 4 for bar
			pointX = leftX + (6 * checkerSize);
			pointX = Math.round(pointX);
			
			var startY = myBotY;
			if (board == ourBoard) startY = myTopY;
	
			var myMax = maxOnPoint;
			var myStartY = startY;
			
			for (var j=0; j<=pos; j++) { 
				if (startY == myTopY) pointY = (myStartY - (checkerSize * pos));
				else pointY = (myStartY + (checkerSize * pos));
				// stacking code
				if (myMax-- == 0) {
					maxOnPoint--;
					if (maxOnPoint > 0) {
						myMax = maxOnPoint - 1;
						var offset = ((maxOnPoint * checkerSize) + (checkerSize / 2));
						if (startY == myTopY) {
							pointY += offset;
							myStartY += offset;
						} else {
							pointY -= offset;
							myStartY -= offset;
						}
					} else { // no room to put more checkers, so point at top of stack
						myMax = 0;
						pointY = saveY;
					}
				}
			}
			pointY = Math.round(pointY);
			saveY = pointY;
			//console.log("pointToXY(from bar), pointX: " + pointX + ", pointY: " + pointY + ", pos: " + pos);
			return;
		}
		
		if (point < 0) {
			pointX = trayX;
			if (board == ourBoard) {
				//var yPos = ourTrayCount;
				var yPos = ourTrayCheckerArray.length - 1;
				pointY = (bottomY - doubleLineWidth) - (trayCheckerHeight * (yPos + 1));
				pointY += (lineWidth / 2);
				if (yPos > 2) pointY -= (lineWidth * 3);
				if (yPos > 5) pointY -= (lineWidth * 3);
				if (yPos > 8) pointY -= (lineWidth * 3);
				if (yPos > 11) pointY -= (lineWidth * 3);
			} else {
				//var yPos = oppTrayCount;
				var yPos = oppTrayCheckerArray.length - 1;
				pointY = (topY - trayCheckerHeight + lineWidth + (trayCheckerHeight * (yPos + 1)));
				pointY += (lineWidth / 2);
				if (yPos > 2) pointY += (lineWidth * 3);
				if (yPos > 5) pointY += (lineWidth * 3);
				if (yPos > 8) pointY += (lineWidth * 3);
				if (yPos > 11) pointY += (lineWidth * 3);
			}
			//console.log("pointToXY(tray), pointX: " + pointX + ", pointY: " + pointY + ", yPos: " + yPos);
			return;
		}
		
		var revIndex = -(savePoint-23);
		var myTopY = topY + doubleLineWidth;
		var startY = bottomY - checkerSize;
		var startX = rightX;
		if (currentTheme.direction) startX = leftX;
		if (board == ourBoard) startY = myTopY;
		
		if (savePoint < 12) {
			revIndex = -(savePoint-11); // adjust and reverse the Index
			if (startY == myTopY) startY = (bottomY - (lineWidth /2) - checkerSize);
			else startY = myTopY;
			if (startX == leftX) startX = rightX;
			else startX = leftX;
		}
		
		if (startX == rightX) { // if it's right to left, decrement point index
			pointX = (startX - (checkerSize * revIndex));
			if (revIndex > 5) pointX -= checkerSize; // jump over bar
		} else { // left to right - increment point index
			pointX = (startX + (checkerSize * revIndex));
			if (revIndex > 5) pointX += checkerSize; // jump over bar
		}
		pointY = startY;
		//console.log("start pointY: " + pointY);
		// Calculate maxOnPoint
		maxOnPoint = 5;

		var myMax = maxOnPoint - 1;
		var myStartY = startY;
		var topCheckerY; // used when not stacking
		
		for (var j=0; j<pos; j++) { 
			if (startY == myTopY) { // if it's the top half, stack checkers down
				pointY = (myStartY + (checkerSize * pos));
				topCheckerY = (myStartY + (checkerSize * (maxOnPoint - 1)));
			} else { // bottom half - stack checkers up 
				pointY = (myStartY - (checkerSize * pos));
				topCheckerY = (myStartY - (checkerSize * (maxOnPoint - 1)));
			}
			// stacking code
			if (((pos + 1) > maxOnPoint) && (!currentTheme.stacking)) {
				pointY = topCheckerY;
			} else {
				if (myMax-- == 0) {
					maxOnPoint--;
					if (maxOnPoint > 0) {
						myMax = maxOnPoint - 1;
						var offset = ((maxOnPoint * checkerSize) + (checkerSize / 2));
						if (startY == myTopY) {
							pointY -= offset;
							myStartY -= offset;
						} else {
							pointY += offset;
							myStartY += offset;
						}
					} else { // no room to put more checkers, so point at top of stack
						myMax = 0;
						pointY = saveY;
					}
				}
			}
		}
		pointX = Math.round(pointX);
		pointY = Math.round(pointY);
		saveY = pointY;
		//console.log("pointToXY, pointX: " + pointX + ", pointY: " + pointY);
		//console.log("pointToXY, pointX: " + pointX + ", pointY: " + pointY + ", pos: " + pos);
	},
	
	updatePipCount:function() {
		bglog.getPipCount();
		$('#ourPipcount').text(ourPipCount);
		$('#oppPipcount').text(oppPipCount);
		if (currentTheme.showPipCount) {
			$('#ourPipcount').show();
			$('#oppPipcount').show();
		}
		else {
			$('#ourPipcount').hide();
			$('#oppPipcount').hide();
		}
	},

//	initDrawPipCount:function() {

//		topPlayerName = new Kinetic.Text({
//			//x: leftX + (checkerSize * 6),
//			x: leftX,
//			y: 0,
//			width: checkerSize * 13,
//			text: '',
//			name: "topPlayer",
//			fontSize: pointNumberFontSize,
//			fontStyle: "italic",
//			fontFamily: "Helvetica,Arial,sans-serif",
//			fill: currentTheme.pipcountTextColor,
//			shadowColor: '#000',
//			shadowBlur: lineWidth / 2,
//			shadowOffset: {x: (lineWidth / 2), y: (lineWidth / 2)},
//			opacity: 1.0,
//			visible: false,
//			align: "center"
//		});
//		bottomPlayerName = new Kinetic.Text({
//			x: leftX,
//			y: bottomY + maxBorderWidth,
//			width: checkerSize * 13,
//			text: '',
//			name: "bottomPlayer",
//			fontSize: pointNumberFontSize,
//			fontStyle: "italic",
//			fontFamily: "Helvetica,Arial,sans-serif",
//			fill: currentTheme.pipcountTextColor,
//			shadowColor: '#000',
//			shadowBlur: lineWidth / 2,
//			shadowOffset: {x: (lineWidth / 2), y: (lineWidth / 2)},
//			opacity: 1.0,
//			visible: false,
//			align: "center"
//		});
//		textLayer.add(pipCountTextTop);
//		textLayer.add(pipCountTextBottom);
//		textLayer.add(topPlayerName);
//		textLayer.add(bottomPlayerName);
//		bglog.updatePipCount();
//	},
//	
//	//core
//	initDrawScores:function() {
//		//textLayer.removeChildren();
//
//		var thisX = (rightX + checkerSize - maxBorderWidth + borderSize);
//		if (currentTheme.direction && currentTheme.showTurnIndicator) var thisX = (leftX - checkerSize - maxBorderWidth - borderSize);
//		
//		oppScoreText = new Kinetic.Text({ // top
//			x: thisX,
//			y: 0,
//			width: checkerSize + doubleMaxBorderWidth,
//			visible: true,
//			text: (oppScore + "/" + matchLength),
//			fontSize: pipCountFontSize,
//			fontFamily: "Helvetica,Arial,sans-serif",
//			fill: currentTheme.textColor,
//			shadowColor: '#000',
//			shadowBlur: lineWidth / 2,
//			shadowOffset: {x: (lineWidth / 2), y: (lineWidth / 2)},
//			opacity: 1.0,
//			align: "center"
//		});
//		textLayer.add(oppScoreText);
//
//		ourScoreText = new Kinetic.Text({ // bottom
//			x: thisX,
//			y: bottomY + maxBorderWidth,
//			width: checkerSize + doubleMaxBorderWidth,
//			visible: true,
//			text: (ourScore + "/" + matchLength),
//			fontSize: pipCountFontSize,
//			fontFamily: "Helvetica,Arial,sans-serif",
//			fill: currentTheme.textColor,
//			shadowColor: '#000',
//			shadowBlur: lineWidth / 2,
//			shadowOffset: {x: (lineWidth / 2), y: (lineWidth / 2)},
//			opacity: 1.0,
//			align: "center"
//		});
//		textLayer.add(ourScoreText);
//	},
	
	//core
	doPointNumbers:function() {
		//console.log("doPointNumbers");
		$('.pointNumbers').hide();
		if (currentTheme.showPointNumbers) {
			if (currentTheme.direction) {
				if (currentTheme.cpStyle) {
					$('#top1to12').show();
					$('#mid24to13').show();
					$('#bot1to12').show();
				} else {
					if (roll) {
						$('#top24to13').show();
						$('#bot1to12').show();
					} else {
						$('#top1to12').show();
						$('#bot24to13').show();
					}
				}
			} else {
				if (currentTheme.cpStyle) {
					$('#top12to1').show();
					$('#mid13to24').show();
					$('#bot12to1').show();
				} else {
					if (roll) {
						$('#top13to24').show();
						$('#bot12to1').show();
					} else {
						$('#top12to1').show();
						$('#bot13to24').show();
					}
				}
			}
		}
	},
	
//	//core
//	initDrawCheckers:function() {
//		//console.log("init checkers");
//		
//		bglog.updateTrays();
//		//console.log("IN trayX: " + trayX);
//		var highlightRadius = Math.floor((checkerSize / 2) - (lineWidth * 2.2));

//			ourCheckerHighlight = new Kinetic.Circle({
//				offset: {x: -(checkerSize / 2) - lineWidth, y: -(checkerSize / 2) - lineWidth},
//				draggable: false,
//				dragOnTop: false,
//				visible: false,
//				radius: highlightRadius,
//				fill: currentTheme.ourCheckerColor,
//				shadowColor: '#fff',
//				shadowBlur: 1,
//				shadowOffset: {x: - (lineWidth * 1.5), y: - (lineWidth * 1.5)},
//				shadowOpacity: .8,
//				name: 'ourCheckerHighlights'
//			});
//			ourBoardChecker.add(ourCheckerHighlight);

	xgPosToBoard:function(xgPos) {
		
		var xgArray = "-abcdefghijklmnoABCDEFGHIJKLMNO";
		var thisInt = 0;
		
		xgPos = xgPos.split("=").pop();

		// oppBoard
		for (var i=1; i<=24; i++) {
			thisInt = xgArray.indexOf(xgPos[i]);
			if (thisInt > 15) thisInt = 0;
			oppBoard[-(i-24)] = thisInt;
		}
		// bar
		thisInt = xgArray.indexOf(xgPos[0]);
		if (thisInt > 15)  thisInt = 0;
		oppBoard[24] = thisInt;
		
		// ourBoard
		for (var i=1; i<=24; i++) {
			thisInt = xgArray.indexOf(xgPos[i]);
			if (thisInt <= 15) thisInt = 0; else thisInt -= 15;
			ourBoard[i-1] = thisInt;
		}
		// bar
		thisInt = xgArray.indexOf(xgPos[25]);
		if (thisInt <= 15) thisInt = 0; else thisInt -= 15;
		ourBoard[24] = thisInt;
	},
	
	//core
	xgMatchToBoard:function(xgPos) {
		//xgPos.substring("XGID=".length);
		xgPos = xgPos.split("=").pop();
		xgPos += ':';
		var xgPosIndex = 27;
		
		var xgCubeValue = '';
		while (xgPos[xgPosIndex] != ":") {
			xgCubeValue += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		cubeValue = parseInt(xgCubeValue);
		
		var xgCubePos = '';
		while (xgPos[xgPosIndex] != ":") {
			xgCubePos += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		xgCubePos = parseInt(xgCubePos);
		cubePos = "mid";
		if (xgCubePos == 1) cubePos = "bot";
		if (xgCubePos == -1) cubePos = "top";
		
		var xgTurn = '';
		while (xgPos[xgPosIndex] != ":") {
			xgTurn += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		xgTurn = parseInt(xgTurn);
		if (xgTurn == -1) {
			roll = false;
			turn = false;
		} else {
			roll = true;
			turn = true;
		}
		
		cubeStatus = 0;
		cubeFlag = false;
		leftDie = rightDie = 0;
		while (xgPos[xgPosIndex] != ":") {
			thisLeftDie = xgPos[xgPosIndex++];
			if ((thisLeftDie == "D") || (thisLeftDie == "B") || (thisLeftDie == "R")) {
				cubeFlag = true;
				cubeStatus = 1;
				if (roll) bglog.moveCube(cubeNumber, "oppside", cubeValue + 1);
				else bglog.moveCube(cubeNumber, "ourside", cubeValue + 1);
			} else {
				thisRightDie = xgPos[xgPosIndex++];
			}
			if (cubeStatus == 1) {
				if (!roll) turn = true;
				else turn = false;
			} else {
				if (thisLeftDie != "-") leftDie = parseInt(thisLeftDie);
				if (thisRightDie != "-") rightDie = parseInt(thisRightDie);
			}
			// ** validate dice here 0-6 + "-"
		}
		xgPosIndex++;

		diceToPlay = 2;
		pipsToMove = (leftDie + rightDie);
		if (leftDie == rightDie) {
			pipsToMove += pipsToMove;
			diceToPlay = 4;
		}
		bglog.clearMoveArray();
		moveCount = 0;
		
		var xgBotScore ='';
		while (xgPos[xgPosIndex] != ":") {
			xgBotScore += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		ourScore = parseInt(xgBotScore);
		var xgTopScore ='';
		while (xgPos[xgPosIndex] != ":") {
			xgTopScore += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		oppScore = parseInt(xgTopScore);
		xgCrawford = parseInt(xgPos[xgPosIndex++]);
		//console.log("xgCrawford: " + xgCrawford);
		xgPosIndex++;
		
		var xgMatchLength = '';
		while (xgPos[xgPosIndex] != ":") {
			xgMatchLength += xgPos[xgPosIndex++];
		}
		xgPosIndex++;
		matchLength = parseInt(xgMatchLength);
		if (matchLength == 0) thisLabel = "money";
		else thisLabel = "match";
		bglog.updateScores();
		crawfordFlag = 0;
		if (thisLabel == "match") {
			if (xgCrawford == 1) crawfordFlag = 1;
			else crawfordFlag = 0;
			//moveCube(cubePos, cubeValue);
		} else {
			if (xgCrawford == 0) {
				jacobyFlag = 0;
				beaverFlag = 0;
			}
			if (xgCrawford == 1) {
				jacobyFlag = 1;
				beaverFlag = 0;
			}
			if (xgCrawford == 2) {
				jacobyFlag = 0;
				beaverFlag = 1;
			}
			if (xgCrawford == 3) {
				jacobyFlag = 1;
				beaverFlag = 1;
			}
		}
		
		var xgMaxCube = '';
		while (xgPos[xgPosIndex] != ":") {
			xgMaxCube += xgPos[xgPosIndex++];
		}
		maxCube = parseInt(xgMaxCube);
		
		if (!cubeFlag) bglog.moveCube(1, cubePos, cubeValue);
	},
	
	//core
	updateScores:function() {
		//console.log("ourScore: " + ourScore + " oppScore: " + oppScore + ", direction: " + currentTheme.direction);
		if (currentTheme.awayStyle) {
			$('#oppScoreText').text("\u2013" + (matchLength - oppScore) + ""); // u2013 = en-dash, a longer dash than minus
			$('#ourScoreText').text("\u2013" + (matchLength - ourScore) + "");
		} else {
			$('#oppScoreText').text(oppScore + "/" + matchLength + "");
			$('#ourScoreText').text(ourScore + "/" + matchLength + "");
		}
		if (currentTheme.showScore) {
			currentTheme.showScore = false;
			bglog.toggleScore();
		} else {
			currentTheme.showScore = true;
			bglog.toggleScore();
		}
		$('#ourScoreText').attr('fill', currentTheme.textColor);
		$('#oppScoreText').attr('fill', currentTheme.textColor);
		
		if (currentTheme.showTurnIndicator) {
			if (currentTheme.direction) {
				$('#ourScoreText').attr('x', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
				$('#oppScoreText').attr('x', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
				$('#ourTurnChecker').attr('cx', (leftX - checkerSize - borderWidth + (checkerSize / 2)));
				$('#oppTurnChecker').attr('cx', (leftX - checkerSize - borderWidth + (checkerSize / 2)));
			}
			else {
				$('#ourScoreText').attr('x', (leftX - borderWidth - (checkerSize / 2)));
				$('#oppScoreText').attr('x', (leftX - borderWidth - (checkerSize / 2)));
				$('#ourTurnChecker').attr('cx', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
				$('#oppTurnChecker').attr('cx', (rightX + checkerSize + borderWidth + (checkerSize / 2)));
			}
		}
				
		if (roll) {
			if (currentTheme.showTurnIndicator) {
				$('#oppTurnChecker').hide();
				$('#ourTurnChecker').show();
			} else $('#ourScoreText').attr('fill', currentTheme.highlightColor);
		} else {
			if (currentTheme.showTurnIndicator) {
				$('#oppTurnChecker').show();
				$('#ourTurnChecker').hide();
			} else $('#oppScoreText').attr('fill', currentTheme.highlightColor);
		}
	},
	
	loadTheme:function(theme){
		
//	currentTheme.highlightColor = theme.highlightColor;
		
		currentTheme = eval(theme);
		var checkerWidth = (checkerSize - doubleLineWidth);
		
		$('.takiPoint').hide();
		$('.nonTakiPoint').hide();
		if (currentTheme.takiPoints) $('.takiPoint').show();
		else $('.nonTakiPoint').show();
		
		$('#canvas').attr('fill', currentTheme.canvasColor);
		//$('#touch').attr('fill', "rgba(0,0,0,0)");
		$('#border').attr('fill', currentTheme.borderColor);
		$('.surface').attr('fill', currentTheme.surfaceColor);
		$('.tray').attr('fill', currentTheme.trayColor);
		$('#bar').attr('fill', currentTheme.barColor);
		$('.pointA').attr('fill', currentTheme.pointBcolor);
		$('.pointA').attr('stroke', currentTheme.pointOutlines);
		$('.pointA').css('strokeWidth', lineWidth);
		$('.pointB').attr('fill', currentTheme.pointAcolor);
		$('.pointB').attr('stroke', currentTheme.pointOutlines);
		$('.pointB').css('strokeWidth', lineWidth);
		$('.pointNumbers').attr('fill', currentTheme.textColor);
		$('.pointNumbers').css('textShadow', "none");
		$('#oppPipcount').attr('fill', currentTheme.pipcountTextColor);
		$('#oppPipcount').css('textShadow', "none");
		$('#ourPipcount').attr('fill', currentTheme.pipcountTextColor);
		$('#ourPipcount').css('textShadow', "none");
		$('.ourchecker').attr('width', checkerWidth);
		$('.ourchecker').attr('fill', currentTheme.ourCheckerColor);
		$('.ourchecker').attr('stroke', "#000");
		$('.ourchecker').css('strokeWidth', lineWidth);
		$('.ourcheckertext').attr('fill', currentTheme.ourStackingColor);
		$('#ourTurnChecker').attr('fill', currentTheme.ourCheckerColor);
		$('#ourTurnChecker').attr('stroke', "#000");
		$('#ourTurnChecker').attr('r', (checkerWidth / 5));
		$('.oppchecker').attr('width', checkerWidth);
		$('.oppchecker').attr('fill', currentTheme.oppCheckerColor);
		$('.oppchecker').attr('stroke', "#000");
		$('.oppchecker').css('strokeWidth', lineWidth);
		$('.oppcheckertext').attr('fill', currentTheme.oppStackingColor);
		$('#oppTurnChecker').attr('fill', currentTheme.oppCheckerColor);
		$('#oppTurnChecker').attr('stroke', "#000");
		$('#oppTurnChecker').attr('r', (checkerWidth / 5));
		$('.cubes').attr('fill', currentTheme.cubeColor);
		$('.cubes').attr('stroke', currentTheme.pointOutlines);
		$('.cubes').css('strokeWidth', doubleLineWidth);
		$('.cubeText').attr('fill', currentTheme.cubeTextColor);
		$('.cubeText').attr('stroke', "none");
		//$('.cubeText').css('strokeWidth', 0); // bad androids don't like strokeWidth 0, stroke "none" works ok
		$('.cubeText').css('fontSize', cubeFontSize);
		$('.cubeText').css('textShadow', "none");
		$('#cube0').css('visibility', 'visible');
		//$('#cube0Text').text("64");
		$('.ourdice').attr('fill', currentTheme.ourCheckerColor);
		$('.ourDicePips').attr('fill', currentTheme.ourDicePipColor);
		$('.ourDicePips').attr('r', dicePipRadius);
		$('.oppdice').attr('fill', currentTheme.oppCheckerColor);
		$('.oppDicePips').attr('fill', currentTheme.oppDicePipColor);
		$('.oppDicePips').attr('r', dicePipRadius);
		
		if (currentTheme.direction) currentTheme.direction = false;
		else currentTheme.direction = true;
		bglog.toggleDirection();
	},
	
	initCheckers:function() {
		for (var i=0; i<15; i++) ourTrayCheckerArray.push(i);
		for (var i=15; i<30; i++) oppTrayCheckerArray.push(i);
		// used to force initialisation of transform matrices by greensock
		//setTimeout(function() { // firefox doesn't work without this
			for (var i=0; i<30; i++) {
				var thisChecker = $('#checker' + i);
				var thisCircle = $('#checkerCircle' + i);
				TweenLite.set(thisChecker, {x: trayX, y: middleY});
				TweenLite.set(thisCircle, {attr: {height: checkerHeight, rx: checkerSize}});
			}
			//for (var i=0; i<15; i++) ourTrayCheckerArray.push(i);
			//for (var i=15; i<30; i++) oppTrayCheckerArray.push(i);
			//console.log("checkers initialised");
		//}, 1);
	},
	
	//core
	base64_decode:function(data) {
	  // http://kevin.vanzonneveld.net
	  // + original by: Tyler Akins (http://rumkin.com)
	  // + improved by: Thunder.m
	  // + input by: Aman Gupta
	  // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // + bugfixed by: Onno Marsman
	  // + bugfixed by: Pellentesque Malesuada
	  // + improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // + input by: Brett Zamir (http://brett-zamir.me)
	  // + bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // * example 1: base64_decode('S2V2aW4gdmFuIFpvbm5ldmVsZA==');
	  // * returns 1: 'Kevin van Zonneveld'
	  // mozilla has this native
	  // - but breaks in 2.0.0.12!
	  //if (typeof this.window['atob'] == 'function') {
	  // return atob(data);
	  //}
	  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
		ac = 0,
		dec = "",
		tmp_arr = [];
	
	  if (!data) {
		return data;
	  }
	
	  data += '';
	
	  do { // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));
	
		bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
	
		o1 = bits >> 16 & 0xff;
		o2 = bits >> 8 & 0xff;
		o3 = bits & 0xff;
	
		if (h3 == 64) {
		  tmp_arr[ac++] = String.fromCharCode(o1);
		} else if (h4 == 64) {
		  tmp_arr[ac++] = String.fromCharCode(o1, o2);
		} else {
		  tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
		}
	  } while (i < data.length);
	
	  dec = tmp_arr.join('');
	
	  return dec;
	},
	
	//core
	hexdec:function(hex_string) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Philippe Baumann
	  // *     example 1: hexdec('that');
	  // *     returns 1: 10
	  // *     example 2: hexdec('a0');
	  // *     returns 2: 160
	  hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
	  return parseInt(hex_string, 16);
	},
	
	//core
	bin2hex:function(s) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +   bugfixed by: Onno Marsman
	  // +   bugfixed by: Linuxworld
	  // +   improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
	  // *     example 1: bin2hex('Kev');
	  // *     returns 1: '4b6576'
	  // *     example 2: bin2hex(String.fromCharCode(0x00));
	  // *     returns 2: '00'
	
	  var i, l, o = "", n;
	
	  s += "";
	
	  for (i = 0, l = s.length; i < l; i++) {
		n = s.charCodeAt(i).toString(16)
		o += n.length < 2 ? "0" + n : n;
	  }
	
	  return o;
	},
	
	boardToXGpos:function() {
		
		var xgArray = "-abcdefghijklmnoABCDEFGHIJKLMNO";
		xgPos = "XGID=";
		//console.log("boardToXGpos");
		if (oppBoard[24] != 0) xgPos += xgArray[(oppBoard[24])+0];
		else xgPos += "-";
		
		for (var i=0; i<24; i++) {
			if (ourBoard[i+0] != 0) xgPos += xgArray[(ourBoard[i])+15];
			else if (oppBoard[-(i-23)] != 0) xgPos += xgArray[(oppBoard[-(i-23)])+0];
			else xgPos += "-";
		}
		if (ourBoard[24] != 0) xgPos += xgArray[(ourBoard[i])+15]
		else xgPos += "-";
		// now the match part
		
		var xgCubePos = 0;
		if (cubePos == "top") xgCubePos = -1;
		if (cubePos == "bot") xgCubePos = 1;

		var xgTurn = -1;
		if (roll) xgTurn = 1;
		
		if (matchLength == 0) { // money game
			xgCrawfordFlag = (jacobyFlag + (beaverFlag * 2));
			thisLabel = "money";
		} else {
			xgCrawfordFlag = crawfordFlag;
			thisLabel = "match";
		}
		bglog.updateScores();
		
		var xgLeftDie = leftDie;
		var xgRightDie = rightDie;
		if (cubeFlag) {
			xgLeftDie = "D";
			xgRightDie = "";
		}
		if (thisLeftDie == "-") xgLeftDie = thisLeftDie;
		if (thisRightDie == "-") xgRightDie = thisRightDie;
		
		xgPos += ":" + cubeValue + ":" + xgCubePos + ":" + xgTurn + ":" + xgLeftDie + xgRightDie + ":";
		xgPos += ourScore + ":" + oppScore + ":" + xgCrawfordFlag + ":" + matchLength + ":" + maxCube;
	},
	
	matchid2board:function(matchId) {
		//console.log("matchid2board");
		idWarningFlag = false;
		idErrorFlag = false;
		idMessage = "";
		var bin_str = "";
		var binmatch = "";
		// convert base64 to binary
		var str = bglog.base64_decode(matchId);
		// convert to hex and then to a zero-padded string of binary digits
		for (var i=0; i<9; i++) {
			bin_str += sprintf("%08b", bglog.hexdec(bglog.bin2hex(str[i])));
		}
		// bin_str now contains a string of 80 little endian bytes in binary
		// reverse the little endian-ness so we can index easily
		for (var i=0; i<9; i++) { // process 9 X 8 bits
			for (var j=7; j>=0; j--) {       // reverse little-endian and append to binmatch
				binmatch += bin_str[((i*8)+j)];
			}
		}
		i = 66; // 67 bits to process //*** not sure why we do this backwards!!
		
		gnuJacoby = bglog.bindec(binmatch[i]); // jacoby
		if (gnuJacoby == 0) jacobyFlag = 1;
		else jacobyFlag = 0;
		i--;
		
		char = "";
		for (var j=0; j<15; j++) { //p1 score
			char += binmatch[i];
			i--;
		}
		ourScore = bglog.bindec(char);
		if (ourScore > 98) {
			idMessage = "Warning: bottom player score reset from " + ourScore + " to 98.";
			ourScore = 98;
			idWarningFlag = true;
		}
	
		char = "";
		for (var j=0; j<15; j++) { //p0 score
			char += binmatch[i];
			i--;
		}
		oppScore = bglog.bindec(char);
		if (oppScore > 98) {
			idMessage = "Warning: top player score reset from " + oppScore + " to 98.";
			oppScore = 98;
			idWarningFlag = true;
		}
	
		char = "";
		for (var j=0; j<15; j++) { //match length
			char += binmatch[i];
			i--;
		}
		matchLength = bglog.bindec(char);
		if (matchLength > 99) {
			idMessage = "Warning: match length reset from " + matchLength + " to 99.";
			matchLength = 99;
			idWarningFlag = true;
		}
		if (matchLength > 0) {
			if (ourScore > (matchLength -1)) {
				idMessage = "Bottom player score invalid - must be less than match length.";
				idErrorFlag = true;
				return false;
			}
			if (oppScore > (matchLength -1)) {
				idMessage = "Top player score invalid - must be less than match length.";
				idErrorFlag = true;
				return false;
			}

//		} else {
//			if ((thisCrawford < 0) || (thisCrawford > 3)) {
//				idMessage = "Jacoby flag invalid - must be 0,1,2 or 3.";
//				return false;
//			}
		}
		
		bglog.updateScores();
		
		thisLabel = "match";
		if (matchLength == 0) thisLabel = "money";
	
		char = "";
		for (var j=0; j<3; j++) { //right die
			char += binmatch[i];
			i--;
		}
		rightDie = bglog.bindec(char);
		if (rightDie > 6) {
			idMessage = "Error: right die " + rightDie + ", should be 0-6.";
			idErrorFlag = true;
			rightDie = 0;
			return false;
		}
//		if ((rightDie > 6) || (rightDie < 1)) {
//			rightDie = 0;
//		}
		
		char = "";
		for (var j=0; j<3; j++) { //left die
			char += binmatch[i];
			i--;
		}
		leftDie = bglog.bindec(char);
		if (leftDie > 6) {
			idMessage = "Error: left die " + leftDie + ", should be 0-6.";
			idErrorFlag = true;
			leftDie = 0;
			return false;
		}
//		if ((leftDie > 6) || (leftDie < 1)) {
//			leftDie = 0;
//		}
	
		char = "";
		for (var j=0; j<2; j++) { //resign
			char += binmatch[i];
			i--;
		}
		res = bglog.bindec(char);
	
		cubeStatus = bglog.bindec(binmatch[i]); // cube offered	
		
		cubeFlag = false;
		if (cubeStatus != 0) cubeFlag = true;
		i--;
	
		gnuTurn = bglog.bindec(binmatch[i]); // turn
		turn = true;
		if (gnuTurn == 0) turn = false;
		i--;
	
		char = "";
		for (var j=0; j<3; j++) { // game state
			char += binmatch[i];
			i--;
		}
		gameState = bglog.bindec(char);
		if (gameState > 4) {
			idMessage = "Error: invalid game state " + gameState + ", should be 0-4.";
			idErrorFlag = true;
			gameState = 0;
			return false;
		}
	
		crawfordFlag = bglog.bindec(binmatch[i]); // crawford
		i--;
		
		if ((crawfordFlag != 0) && (crawfordFlag != 1)) {
			idMessage = "Crawford flag must be 0 or 1.";
			idErrorFlag = true;
			return false;
		}
		if (crawfordFlag == 1) {
			if ((ourScore != (matchLength - 1)) && (oppScore != (matchLength - 1))) {
				idMessage = "Crawford flag invalid at this score.";
				idErrorFlag = true;
				return false;
			}
		}
	
		gnuRoll = bglog.bindec(binmatch[i]); //roll
		roll = true;
		if (gnuRoll == 0) roll = false;
		i--;
	
		char = "";
		for (var j=0; j<2; j++) { // cube owner
			char += binmatch[i];
			i--;
		}
		var cube_owner = bglog.bindec(char);
		if (cube_owner == 0) {
			cubePos = "top";
		} else if (cube_owner == 1) {
			cubePos = "bot";
		} else if (cube_owner == 3) {
			cubePos = "mid";
		} else { // cube_owner == 2
			idMessage = "Error: invalid cube owner " + cube_owner;
			idErrorFlag = true;
			cube_owner = 3;
			return false;
		}
		
		char = "";
		for (var j=0; j<4; j++) { // cube value
			char += binmatch[i];
			i--;
		}
		cubeValue = bglog.bindec(char);
		if (cubeValue > 6) {
			var cv = Math.pow(2, cubeValue);	
			idMessage = "Warning: cube value " + cv + " reduced to 64.";
			cubeValue = 6;
			idWarningFlag = true;
		}
		
		if (cubeFlag) {
			if (roll) bglog.moveCube(cubeNumber, "oppside", cubeValue + 1);
			else bglog.moveCube(cubeNumber, "ourside", cubeValue + 1);
		} else bglog.moveCube(cubeNumber, cubePos, cubeValue);
		return true;
	},

	//core/split
	posid2board:function(userPos) {

		//console.log("posid2board, userPos: " + userPos);
		//console.log("posid2board, gnuMatchid: " + gnuMatchid);
		//$('input#gnu_id').val("Position ID: " + userPos + " Match ID: " + gnuMatchid);
		var bin_str = "";
		var binboard = "";
		var board = [];
		// convert base64 to binary
		var str = bglog.base64_decode(userPos);
		// convert to hex and then to a zero-padded string of binary digits
		for (var i=0; i<10; i++) {
			bin_str += sprintf("%08b", bglog.hexdec(bglog.bin2hex(str[i])));
		}
		// bin_str now contains a string of 80 little endian bytes in binary
		// reverse the little endian-ness so we can index easily
		for (var i=0; i<10; i++) { // process 10 X 8 bits
			for (var j=7; j>=0; j--) {       // reverse little-endian and append to board
				binboard += bin_str[((i*8)+j)];
			}
		}
		// binboard now contains the exact 80-bit pattern described on the gnubg site:
		// http://www.gnu.org/software/gnubg/manual/html_node/A-technical-description-of-the-position-ID.html
		//
		// make it user-friendly, in the form of board0 and board1, eg
		// 0,0,0,0,0,5,0,3,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2,0<=bar point
		//
		var count = 0;
		var j=0;
		var total_checker_count = 0;
		
		var thisOurBoard = [];
		var thisOppBoard = [];
		
		for (var i=0; i<80; i++) {
			while (binboard[i] == 1) {
				total_checker_count++;
				count++;
				i++;
			}
			board[j++] = parseInt(sprintf("%2d", count));
			count = 0;
		}
		//console.log("total_checker_count: " + total_checker_count);
		// validate checkers
		if (total_checker_count > 30) {
			idMessage = "Error: too many checkers!";
			idErrorFlag = true;
			return false;
		}
		for (var i=0; i<25; i++) {
			if (roll) {
				thisOppBoard[i] = board[i];
				thisOurBoard[i] = board[i+25];
			} else {
				thisOppBoard[i] = board[i+25];
				thisOurBoard[i] = board[i];
			}
		}
		
		var ourCount = 0;
		var oppCount = 0;
		for (var i=0; i<25; i++) {
			ourCount += thisOurBoard[i];
			oppCount += thisOppBoard[i];
		}
		if ((ourCount > 15) || (oppCount > 15)) {
			idMessage = "Error: too many checkers!";
			idErrorFlag = true;
			return false;
		}
		// check that different checkers don't occupy the same point
		for (var i=0; i<24; i++) {
			if (thisOurBoard[i] != 0) {
				if (thisOppBoard[(-i + 23)] != 0) {
					idMessage = "Error: illegal checker placement!";
					idErrorFlag = true;
					return false;
				}
			}
		}
		// all ok
		ourBoard = thisOurBoard;
		oppBoard = thisOppBoard;
		return true;
	},
	
	//core
	bindec:function(binary_string) {
		binary_string = (binary_string + '').replace(/[^01]/gi, '');
		return parseInt(binary_string, 2);
	},
	
	makeBoard: function(size) {
		if ((size === undefined) || (size === null)) size = 60;
		leftDie = 0;
		rightDie = 0;
		var cubeText = ['1','2','4','8','16','32','64','C'];
		var cubeValue = cubeText[0];
		var cubePointer = 0; //tmp
		//borderWidth = (size / 15); // max = 20, min = 1
		//borderWidth = 20;
		//borderWidth = 12;
		//borderWidth = 8;
		//borderWidth = 4;
		borderWidth = 2;
		pipCountFontSize = (size / 2);
		//pointNumberFontSize = (size / 3);
		pointNumberFontSize = (size / 12) * 5;
		var viewportWidth = (size * 17) + (borderWidth * 4);
		var viewportHeight = (size * 11) + (borderWidth * 2) + (pipCountFontSize * 2);
		var boardWidth = (size * 15) + (borderWidth * 4);
		var boardHeight = (size * 11) + (borderWidth * 2);
		var boardCorners = (size / 10);
		cubeWidth = (size / 6) * 5;
		cubeFontSize = (size / 6) * 4;
		var diceWidth = (size / 6) * 4;
		dicePipRadius = (size / 12);
		startX = ((size * 2) + (borderWidth * 2) + doubleLineWidth);
		startY = (pipCountFontSize + borderWidth + doubleLineWidth);		
		endX = ((startX + size) - (lineWidth * 4));
		var midX = ((startX + (size / 2)) - doubleLineWidth);
		var midY = (startY + (size * 5));
		var arcY = startY + (size / 2);
		var point = "pointA";
		leftX = (size * 2) + (borderWidth * 2) + lineWidth;
		rightX = leftX + (size * 12);
		middleX = leftX + (size * 6);
		topY = borderWidth + pipCountFontSize;
		bottomY = topY + (size * 11);
		middleY = topY + (size * 5) + (size / 2);
		trayX = rightX + size + borderWidth;
		if (currentTheme.direction) trayX = (leftX - size - borderWidth);
		trayCheckerHeight = (size / 3) - lineWidth;
		checkerHeight = (checkerSize - doubleLineWidth);
		maxCube = 10;
		
		var checker = "ourchecker";
		var cubeX = ((size * 8) + (borderWidth * 2) + ((size - cubeWidth) / 2));
		var cubeY = ((size * 5) + borderWidth + pipCountFontSize + ((size - cubeWidth) / 2));
		var cubeCorners = (cubeWidth / 7);
		var leftDiceX = ((size * 4) + (borderWidth * 2) + ((size - diceWidth) / 2));
		var rightDiceX = leftDiceX + (size * 7);
		var diceY = ((size * 5) + borderWidth + pipCountFontSize + ((size - diceWidth) / 2));
		
		// board
		var svgBoard = "" +
		//"<svg id='svgboard' version='1.1' xmlns='http://www.w3.org/2000/svg' style='max-height: 100%' viewbox='0 0 " + viewportWidth + " " + viewportHeight + "' width='" + viewportWidth + "' height='" + viewportHeight + "' >" +
		//"<svg id='svgboard' version='1.1' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMidYMin slice' style='max-height: 100% width: 100%' viewbox='0 0 " + viewportWidth + " " + viewportHeight + "' >" +
		
//	position: absolute; height: 100%; width: 100%; left: 0; top: 0;
	
	
		"<svg id='svgboard' version='1.1' xmlns='http://www.w3.org/2000/svg' viewbox='0 0 " + viewportWidth + " " + viewportHeight + "' style='position: absolute; height: 100%; width: 100%; left: 0; top: 0;' >" +
		"<rect id='canvas' x='0' y='0' width='" + viewportWidth + "' height='" + viewportHeight + "'></rect>"  +
		//"<rect id='border' x='" + size + "' y='" + pipCountFontSize + "' rx='" + boardCorners + "' width='" + boardWidth + "' height='" + boardHeight + "'></rect>" +
		"<rect id='border' x='" + size + "' y='" + pipCountFontSize + "' width='" + boardWidth + "' height='" + boardHeight + "'></rect>" +
		"<rect id='toplefttray' class='tray' x='" + (size + borderWidth) + "' y='" + (pipCountFontSize + borderWidth) + "' width='" + size + "' height='" + (size * 5) + "'></rect>" +
		"<rect id='botlefttray' class='tray' x='" + (size + borderWidth) + "' y='" + (pipCountFontSize + borderWidth + (size * 6)) + "' width='" + size + "' height='" + (size * 5) + "'></rect>" +
		"<rect id='leftsurface' class='surface' x='" + ((size * 2) + (borderWidth * 2)) + "' y='" + (pipCountFontSize + borderWidth) + "' width='" + (size * 6) + "' height='" + (size * 11) + "'></rect>" +
		"<rect id='bar' x='" + ((size * 8) + (borderWidth * 3)) + "' y='" + (pipCountFontSize + borderWidth) + "' width='" + (size - (borderWidth * 2)) + "' height='" + (size * 11) + "'></rect>" +
		"<rect id='rightsurface' class='surface' x='" + ((size * 9) + (borderWidth * 2)) + "' y='" + (pipCountFontSize + borderWidth) + "' width='" + (size * 6) + "' height='" + (size * 11) + "'></rect>" +
		"<rect id='toprighttray' class='tray' x='" + ((size * 15) + (borderWidth * 3)) + "' y='" + (pipCountFontSize + borderWidth) + "' width='" + size + "' height='" + (size * 5) + "'></rect>" +
		"<rect id='botrighttray' class='tray' x='" + ((size * 15) + (borderWidth * 3)) + "' y='" + (pipCountFontSize + borderWidth + (size * 6)) + "' width='" + size + "' height='" + (size * 5) + "'></rect>";
		
		// points
		var takiStartY = (pipCountFontSize + borderWidth + doubleLineWidth) - (size / 6);
		//console.log("takiStartY: " + takiStartY + ", borderWidth: " + borderWidth);
		
		var j = 0;
		for (var i=0; i<24; i++) {
			if (j == 6) j++; // skip bar
			if (i == 12) {
				j = 0; // reset pointers for bottom points
				startY = (pipCountFontSize + borderWidth - doubleLineWidth + (size * 11));
				takiStartY += ((size * 11.5) - (lineWidth * 4) - (size / 6));
				midY = startY - (size * 5);
				arcY = startY - (size / 2);
				point = "pointB";
			}
			// Taki points
			svgBoard += "<path d='M" + (startX + (size * j)) + " " + arcY + " C" + (startX + (size * j))  + " " + takiStartY + " " + (endX + (size * j))  + " " + takiStartY + " " + (endX + (size * j)) + " " + arcY + " L" + (midX + (size * j)) + " " + midY + "z' class='takiPoint " + point + "'></path>";
			// Flat points
			svgBoard += "<path d='M" + (startX + (size * j)) + " " + startY + " L" + (endX + (size * j)) + " " + startY + " " + (midX + (size * j)) + " " + midY + "z' class='nonTakiPoint " + point + "'></path>";
			if (point == "pointA") point = "pointB"; // flip flop the point class
			else point = "pointA";
			j++;
		}
		
		// point numbers
		var pointNumberX = ((size * 2) + (size / 2 ) + (borderWidth * 2));
		//var pointNumberY = (pipCountFontSize - doubleLineWidth);
		var pointNumberY = (pipCountFontSize - (doubleLineWidth * 3));
		svgBoard += "<g id='top1to12' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=1; i<=12; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 6) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='top13to24' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=13; i<=24; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 18) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='top12to1' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=12; i>=1; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 7) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='top24to13' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=24; i>=13; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 19) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		pointNumberY = midY - (size / 3);
		svgBoard += "<g id='mid1to12' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=1; i<=12; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 6) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='mid13to24' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=13; i<=24; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 18) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='mid12to1' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=12; i>=1; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 7) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='mid24to13' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=24; i>=13; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 19) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		pointNumberY = ((bottomY + pointNumberFontSize + borderWidth));
		svgBoard += "<g id='bot1to12' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=1; i<=12; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 6) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='bot13to24' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=13; i<=24; i++) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 18) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='bot12to1' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=12; i>=1; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 7) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		svgBoard += "<g id='bot24to13' class='pointNumbers' font-size='" + pointNumberFontSize + "' text-anchor='middle' font-family='arial' fill='black'>";
			var thisX = pointNumberX;
			for (var i=24; i>=13; i--) {
				svgBoard += "<text x='" + thisX + "' y='" + pointNumberY + "'>" + i + "</text>";
				if (i == 19) thisX += size; // bar
				thisX += size;
			}
		svgBoard += "</g>";
		
		// pip counts
		var pipCountX = (leftX + (size * 6.5) - lineWidth);
		svgBoard += "<text id='oppPipcount' x='" + pipCountX + "' y='" + (pipCountFontSize - (doubleLineWidth * 2)) + "' font-size='" + pipCountFontSize + "' text-anchor='middle' ></text>";
		svgBoard += "<text id='ourPipcount' x='" + pipCountX + "' y='" + ((bottomY + pipCountFontSize + borderWidth) - (doubleLineWidth * 2)) + "' font-size='" + pipCountFontSize + "' text-anchor='middle'></text>";
		
		// scores
		var thisX = (leftX - borderWidth - (size / 2));
		if (currentTheme.direction && currentTheme.showTurnIndicator) {
			var thisX = (rightX + borderWidth + (size / 2));
		}
		svgBoard += "<text id='oppScoreText' x='" + thisX +"' y='" + (pipCountFontSize - (doubleLineWidth * 2)) + "' font-size='" + pipCountFontSize + "' text-anchor='middle' ></text>";
		svgBoard += "<text id='ourScoreText' x='" + thisX +"' y='" + ((bottomY + pipCountFontSize + borderWidth) - (doubleLineWidth * 2)) + "' font-size='" + pipCountFontSize + "' text-anchor='middle' ></text>";
		
		// checkers
		for (var i=0; i<30; i++) {
			svgBoard += "<g id='checker" + i + "' x='0' y='0'>";
				svgBoard += "<rect id='checkerCircle" + i + "' class='" + checker + "' x='0' y='0'></rect>";
				svgBoard += "<text id='checkerText" + i + "' class='" + checker + "text' x='" + ((size / 2) - lineWidth) + "' y='" + ((size / 3) * 2)  + "' text-anchor='middle' font-family='arial' font-size='" + (size / 2) + "'></text>";
			svgBoard += "</g>";
			if (i == 14) checker = "oppchecker";
		}

		// turn indicators
		var thisX = (rightX + size + borderWidth + (size / 2));
		if (currentTheme.direction && currentTheme.showTurnIndicator) {
			var thisX = (leftX - size - borderWidth + (size / 2));
		}
		svgBoard +=
		"<circle id='ourTurnChecker' cx='" + thisX + "' cy='" + (bottomY + borderWidth + (size / 4)) + "'></circle>" +
		"<circle id='oppTurnChecker' cx='" + thisX + "' cy='" + ((size / 4) + lineWidth) + "'></circle>";
		
		// cubes
		for (var i=0; i<maxCubes; i++) {
			svgBoard += "<g id='cube" + i + "'class='cubes' x='" + cubeX + "' y='" + cubeY + "' style='visibility:hidden' >" +
				"<rect x='0' y='0' width='" + cubeWidth + "' height='" + cubeWidth + "' rx='" + cubeCorners + "'></rect>" +
				//"<text id='cube" + i + "Text' class='cubeText' x='" + (cubeWidth / 2) + "' y='" + (cubeWidth / 2) + "' dominant-baseline='central' text-anchor='middle'>64</text>" +
				"<text id='cube" + i + "Text' class='cubeText' x='" + (cubeWidth / 2) + "' y='" + diceWidth + "' text-anchor='middle'>64</text>" +
			"</g>";
		}
		// dice
		var leftPipX = leftDiceX + (diceWidth / 4);
		var centerPipX = leftPipX + (diceWidth / 4);
		var rightPipX = centerPipX + (diceWidth / 4);
		var topPipY = (diceY + (diceWidth / 4));
		var centerPipY = topPipY + (diceWidth / 4);
		var bottomPipY = centerPipY + (diceWidth / 4);
		
		svgBoard += "<g id='oppLeftDie' class='dice oppdice'>" +
			"<rect  x='" + leftDiceX + "' y='" + diceY + "' width='" + diceWidth + "' height='" + diceWidth + "' rx='" + dicePipRadius + "' stroke='black' stroke-width='1'></rect>" +
			"<g>" +
				"<circle class='oppDicePips' id='oppLtlPip' cx='" + leftPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLtrPip' cx='" + rightPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLclPip' cx='" + leftPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLcPip' cx='" + centerPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLcrPip' cx='" + rightPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLblPip' cx='" + leftPipX + "' cy='" + bottomPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppLbrPip' cx='" + rightPipX + "' cy='" + bottomPipY + "'></circle>" +
			"</g>" +
		"</g>";
		leftPipX += size;
		centerPipX += size;
		rightPipX += size;
		leftDiceX += size;
		svgBoard += "<g id='oppRightDie' class='dice oppdice'>" +
			"<rect x='" + leftDiceX + "' y='" + diceY + "' width='" + diceWidth + "' height='" + diceWidth + "' rx='" + dicePipRadius + "' stroke='black' stroke-width='1'></rect>" +
			"<g class='dicePips'>" +
				"<circle class='oppDicePips' id='oppRtlPip' cx='" + leftPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRtrPip' cx='" + rightPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRclPip' cx='" + leftPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRcPip' cx='" + centerPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRcrPip' cx='" + rightPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRblPip' cx='" + leftPipX + "' cy='" + bottomPipY + "'></circle>" +
				"<circle class='oppDicePips' id='oppRbrPip' cx='" + rightPipX + "' cy='" + bottomPipY + "'></circle>" +
			"</g>" +
		"</g>";
		leftPipX += (size * 6);
		centerPipX += (size * 6);
		rightPipX += (size * 6);
		leftDiceX += (size * 6);
		svgBoard += "<g id='ourLeftDie' class='dice ourdice'>" +
			"<rect x='" + leftDiceX + "' y='" + diceY + "' width='" + diceWidth + "' height='" + diceWidth + "' rx='" + dicePipRadius + "' stroke='black' stroke-width='1'></rect>" +
			"<g>" +
				"<circle class='ourDicePips' id='ourLtlPip' cx='" + leftPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLtrPip' cx='" + rightPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLclPip' cx='" + leftPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLcPip' cx='" + centerPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLcrPip' cx='" + rightPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLblPip' cx='" + leftPipX + "' cy='" + bottomPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourLbrPip' cx='" + rightPipX + "' cy='" + bottomPipY + "'></circle>" +
			"</g>" +
		"</g>";
		leftPipX += size;
		centerPipX += size;
		rightPipX += size;
		leftDiceX += size;
		svgBoard += "<g id='ourRightDie' class='dice ourdice'>" +
			"<rect x='" + leftDiceX + "' y='" + diceY + "' width='" + diceWidth + "' height='" + diceWidth + "' rx='" + dicePipRadius + "' stroke='black' stroke-width='1'></rect>" +
			"<g class='dicePips'>" +
				"<circle class='ourDicePips' id='ourRtlPip' cx='" + leftPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRtrPip' cx='" + rightPipX + "' cy='" + topPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRclPip' cx='" + leftPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRcPip' cx='" + centerPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRcrPip' cx='" + rightPipX + "' cy='" + centerPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRblPip' cx='" + leftPipX + "' cy='" + bottomPipY + "'></circle>" +
				"<circle class='ourDicePips' id='ourRbrPip' cx='" + rightPipX + "' cy='" + bottomPipY + "'></circle>" +
			"</g>" +
		"</g>";
		// touch/click element
		svgBoard += "<rect id='touch' x='0' y='0' width='" + viewportWidth + "' height='" + viewportHeight + "' fill='rgba(0,0,0,0)'></rect>"
		
		svgBoard += "</svg>";
		$('#bglogContainer').html(svgBoard);
		bglog.initCheckers();
		//* initEvents();
	},
}