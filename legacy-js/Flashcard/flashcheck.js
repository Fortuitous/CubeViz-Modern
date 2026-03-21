$(document).ready(function() {
/*	start = Date.now();*/

    $('#settingsNavbar').hide()
    $('#cardNavbar').hide()
    $('#statsNavbar').hide()
    $('#statsCompareNavbar').hide()    
    $('#browseNavbar').hide()    

    window.isphone = false;
    var ua = navigator.userAgent.toLowerCase();
    window.isphone = ua.indexOf("mobile") > -1 || ua.indexOf("android") > -1;

    if( window.isphone ) {
        document.addEventListener("deviceready", onDeviceReady, false);
    } else {
        onDeviceReady();
    }
});

function onDeviceReady() {
/*	start = Date.now();*/
	
    var oldStats = []; // array to hold old stats for comparison
    var medStats = []; // array to hold old stats, which may or may not become new oldStats
    var selecteddecksets = [];
	var selecteddecks = [];
	var checked = []; // array to hold checked decks
    var fave = []
    var browselist = []; //array to hold cards to be browsed
    var currentbrowse = 0
    var currentcards = [];  //array to hold arrays of active cards
    var decklist = []; //array to hold decks of selected card
    var hintlist = []; //array to hold hints of selected card
    var fbDeckSetForSale = []; //array to hold ForSale value of DeckSets

    for (var i=0; i<8; i++) {   // Initializes arrays within currentcards
        currentcards[i] = [];
    }

 	var chosencard = {}; // placename for currentcard object
    var chosenposition = {}; // placename for currentcard position object
    var parsedPS = []; // Array to hold makeParsedPS object: FromPoint, ToPoint
    var randomcard = "";
	
    var questiontext = "";
    var answertext = []; // array to hold lines of answer
    
	var train = 0;
    var oldtrainval = 0;
    var newtrainval = 0;
    var currenttraining = 0;
    var randomcard = 0;
    var unseencount = 0;
    var learnedcount = 0;
    var trainingcount = 0;
    var lastcard = -1;

    var trainingsizelow = 10;  // Below which always gets an unseen card
    var trainingsizehigh = 20; // Above which never gets an unseen card
	
	var defaultThemeName = "theme1";
	var fbTheme = defaultThemeName;
    var fbShowPointNumbers = true;
	var fbShowPipcount = true;
    var fbShowDeckName = true;
    var fbShowDice = true;
    var fbDirection = true;
    var fbUITheme = false;
    var fbAnimation = .5;
    var fbShowTakiPoints = true
    var comapreFlag = false
    var settingsChangeFlag = false
    var themeChangeFlag = true
    var numberOfThemes = 3
    var undoFlag = false
    var showingAnswer = false
    var isMobile = true
    var browseMode = false
    var fbCoach = "True"
    var productPrefix = "ts3."
    var currentPage = "deckselect"
    var lastPage = ""
    var pageBeforeSettings = ""
    var hintOrigin = ""
    var mlength = 13
    var sortdt = "SortD"
    var dataType = "Take"
    var cubeLevel = 2
    var showCell = "Show";
    var showData = false;
    var fbSSFlag = false;
    var nextFlag = false;
    var cellRow = []
    var cellCol = []
    var TGPShow = true
    var TGTShow = true

    // color swatches (sequential) <---lighter    darker--->
    var BlueColorTable = ["#f7fbff","#e3eef9","#cfe1f2","#b5d4e9","#93c3df","#6daed5","#4b97c9","#2f7ebc","#1864aa","#0a4a90","#08306b"] // blues
    var GreenColorTable = ["#f7fcf5","#e8f6e3","#d3eecd","#b7e2b1","#97d494","#73c378","#4daf62","#2f984f","#157f3b","#036429","#00441b"] // greens
    var GreyColorTable = ["#ffffff","#f2f2f2","#e2e2e2","#cecece","#b4b4b4","#979797","#7a7a7a","#5f5f5f","#404040","#1e1e1e","#000000"] // greys
    var OrangeColorTable = ["#fff5eb","#fee8d3","#fdd8b3","#fdc28c","#fda762","#fb8d3d","#f2701d","#e25609","#c44103","#9f3303","#7f2704"] // oranges
    var PurpleColorTable = ["#fcfbfd","#f1eff6","#e2e1ef","#cecee5","#b6b5d8","#9e9bc9","#8782bc","#7363ac","#61409b","#501f8c","#3f007d"] // purples
    var RedColorTable = ["#fff5f0","#fee3d6","#fdc9b4","#fcaa8e","#fc8a6b","#f9694c","#ef4533","#d92723","#bb151a","#970b13","#67000d"] // reds
/*    animateFlag = false*/


    
// events

	/*$('#clickme').on('vclick', function(){ loadcard(); });*/
    $('#hard').on('vclick', function(){ ishard(); });
	$('#unsure').on('vclick', function(){ isunsure(); });
	$('#easy').on('vclick', function(){ iseasy(); });
	$('#reset').on('vclick', function(){ loadCard(); });
	$('#cleartrain').on('vclick', function(e){ 
        e.preventDefault();
        clearTraining(); 
    });
    $('#clearKeys').on('vclick', function(){ clearTrainingKeys(); });
    $('#clearselectedtrain').on('vclick', function(e){
        e.preventDefault();
        clearSelectedTraining(); 
    });
    $('#clearSelectedKeys').on('vclick', function(){ clearSelectedTrainingKeys(); }); 
    $('#copyXGButton').on('vclick', function(){ 
        copyXG();
        $('#clipMessage').show(250)    
    }); 
       

    $('#beginBtn').on('vclick', function(){
        currentbrowse = 0
        $("#myprev").text('Previous (Home)')
        areAnyDecksSelected();
    });
    $('#nextBtn').on('vclick', function(){browseResult(1);});
    $('#prevBtn').on('vclick', function(){browseResult(-1);});    
	
	$('input[name="fbUITheme"]').change(function(){
		var uitheme = $(this).val();
		if (uitheme == "true") fbUITheme = true;
		else fbUITheme = false;
		changeUITheme(fbUITheme);
		if (storageAvailable('localStorage')) { localStorage.fbUITheme = uitheme; }
	});
	$('input[name="fbTheme"]').change(function(){
		fbTheme = $(this).val();
		changeTheme(fbTheme);
		if (storageAvailable('localStorage')) { localStorage.fbTheme = "" + fbTheme; }
        applySettings();
	});
	$('#animation').change(function(){
		fbAnimation = (100-($('#fbAnimation').val()))/50;
		changeAnimation(fbAnimation);
		if (storageAvailable('localStorage')) { localStorage.fbAnimation = "" + fbAnimation; }
	});
	$('input[name="fbDirection"]').change(function(){
		var direction = $(this).val();
		if (direction == "true") fbDirection = true;
		else fbDirection = false;
		changeDirection(fbDirection);
		if (storageAvailable('localStorage')) { localStorage.fbDirection = direction; }
	});
	$('input[name="fbShowDice"]').change(function(){
		fbShowDice = $('#fbShowDice').prop('checked');
		changeDice(fbShowDice);
		if (storageAvailable('localStorage')) { localStorage.fbShowDice = fbShowDice; }
	});
	$('input[name="fbShowPipcount"]').change(function(){
		fbShowPipcount = $('#fbShowPipcount').prop('checked');
		changePipCount(fbShowPipcount);
		if (storageAvailable('localStorage')) { localStorage.fbShowPipcount = fbShowPipcount; }
	});
	$('input[name="fbShowPointNumbers"]').change(function(){
		fbShowPointNumbers = $('#fbShowPointNumbers').prop('checked');
		changePointNumbers(fbShowPointNumbers);
		if (storageAvailable('localStorage')) { localStorage.fbShowPointNumbers = fbShowPointNumbers; }
	});
	$('input[name="fbShowTakiPoints"]').change(function(){
		fbShowTakiPoints = $('#fbShowTakiPoints').prop('checked');
		changeTakiPoints(fbShowTakiPoints);
		if (storageAvailable('localStorage')) { localStorage.fbShowTakiPoints = fbShowTakiPoints; }
	});
	$('input[name="fbShowDeckName"]').change(function(){
		fbShowDeckName = $('#fbShowDeckName').prop('checked');
		if (storageAvailable('localStorage')) { localStorage.fbShowDeckName = fbShowDeckName; }
	});

    $('input[name="radio-choice-h-2"]').change(function(){ //Match Length
        mlength = $(this).val();
        console.log(typeof mlength)
        showCContext(dataType, sortdt, mlength, cubeLevel, showCell)
        if (storageAvailable('localStorage')) { localStorage.mlength = "" + mlength }
    });
/*    $('input[name="radio-choice-h-1"]').change(function(){ //Sort by Doubler or Taker (Only used in table so not used)
        sortdt = $(this).val();
        showCContext(dataType, sortdt, mlength, cubeLevel, showCell)
        if (storageAvailable('localStorage')) { localStorage.sortdt = sortdt }
    });*/

    $('input[name="radio-choice-h-6"]').change(function(){  //dataType: Take, Double, Range.
        dataType = $(this).val();
        showCContext(dataType, sortdt, mlength, cubeLevel, showCell)
        if (storageAvailable('localStorage')) { localStorage.dataType = "" + dataType }
    });

    $('input[name="radio-choice-h-4"]').change(function(){ // Cube Level
        cubeLevel = $(this).val();
        console.log(" CubeLevel changed to = " + cubeLevel)
//        console.log(typeof cubeLevel)
        showCContext(dataType, sortdt, mlength, cubeLevel, showCell)
        if (storageAvailable('localStorage')) { localStorage.cubeLevel = "" + cubeLevel }
    });

    $('input[name="radio-choice-h-5"]').change(function(){ //Show Hide Cells
        showCell = $(this).val();
        showCContext(dataType, sortdt, mlength, cubeLevel, showCell)
        if (storageAvailable('localStorage')) { localStorage.showCell = "" + showCell }
    });



	// Prevents button from opening collapsible
	$('#swapButton').on('vclick', function() { fbswap(); return false;});  
/*    $('#swapButton').on('hover', function() { fbswap(); return false;});  */


    $('#questioncontainer').on('vclick', function(){ toggleAnswerContainer(); });
    $('#clearLS').on('vclick', function(){ clearLS(); }); // Dev only option
    $('#hintButton').on('vclick', function(){ openHint(); });
    $('#restorePurchases').on('vclick', function(){ restorePurchases(); });
    $('#clearDecks').on('vclick', function(){ clearSelectedDecks(); });

    $('#settingsHeaderButton').on('vclick', function(){
        $("body").pagecontainer("change", "#settings", {transition: "pop"});
    });
    
    $('#otherHeaderButton').on('vclick', function(){ otherHeaderFunction() });

    $('#homeHeaderButton').on('vclick', function(){
        $("body").pagecontainer("change", "#deckselect", {transition: "pop", reverse: "true"});
    });

    $('#infoHeaderButton').on('vclick', function(){ infoHeaderFunction() });

    $('.buying').on('vclick', function(){
        if (window.isphone){
            var res = "" + productPrefix + this.id.slice(-1);
            store.order(res);
        }
        else{
            alert("Desktop sim of buying deck " + this.id.slice(-1))
            afterBuy(this.id.slice(-1))
        }
    })

    // Setup for Persistent External Header
    $( "[data-role='header'], [data-role='footer']" ).toolbar({ theme: "a" });  
    $('#navPanel').enhanceWithin().panel();      

    $( document ).on( "pagecontainershow", function() {
        lastPage = currentPage
        currentPage = $.mobile.activePage.attr('id')
        //Keeps track of page that preceeds settings to prevent back-button loops

        if (lastPage == "deckselect" || lastPage == "flashcards" || lastPage == "stats"){
            pageBeforeSettings = lastPage
        }
        
        if (currentPage.indexOf("hint") !=-1) {     
            if (lastPage == "deckselect"){hintOrigin = "deckselect"}
            if (lastPage == "flashcards"){hintOrigin = "flashcards"}
            if (lastPage == "store"){hintOrigin = "store"}                
        }

        var current = $( ".ui-page-active" ).jqmData( "title" );


        switch (current) {
            case "Cube Context":
                $( "[data-role='header'] h1" ).html('<span class="headleft">Money</span><span class="headright">Scores</span>')
                break;
            case "Select Deck":
                $( "[data-role='header'] h1" ).html('<span class="headleft">Select Deck</span><span class="headright">Welcome!</span>')
                break;
            case "Help":
                $( "[data-role='header'] h1" ).html('<span>Help</span>')
                break;
            case "Settings":
                $( "[data-role='header'] h1" ).html('<span>Settings</span>')
                break;         
            case "About":
                $( "[data-role='header'] h1" ).html('<span>About</span>');
            }


        // Bring the change header here from Loadcard, so it applies on return to Flashcard without new loadcard.

        if (current == "Select Deck"){
          $('#otherHeaderButton').addClass('ui-disabled')
          $('#homeHeaderButton').addClass('ui-disabled')          
        }
        else{
            $('#otherHeaderButton').removeClass('ui-disabled')            
            $('#homeHeaderButton').removeClass('ui-disabled')            
        }

        if (current == "Settings"){$('#settingsHeaderButton').addClass('ui-disabled')}     else{$('#settingsHeaderButton').removeClass('ui-disabled')}
        if (current == "About"){$('#aboutHeaderButton').addClass('ui-disabled')}     else{$('#aboutHeaderButton').removeClass('ui-disabled')}
        if (current == "Store"){$('#storeHeaderButton').addClass('ui-disabled')}     else{$('#storeHeaderButton').removeClass('ui-disabled')}                    
        if (current == "Help"){$('#infoHeaderButton').addClass('ui-disabled')}     else{$('#infoHeaderButton').removeClass('ui-disabled')}                    

        if (current == "Select Deck"){
          $('#cardNavbar').hide()
          $('#statsNavbar').hide()
          $('#statsCompareNavbar').hide()
          $('#deckNavbar').show()
          $('#browseNavbar').hide()                                                        
        }

        else if (current == "Cube Context"){
            if (browseMode){
              $('#deckNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').hide()
              $('#cardNavbar').hide()
              $('#browseNavbar').show()                                                                      
            } 
            else {
              $('#deckNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').hide()
              $('#cardNavbar').show()
              $('#browseNavbar').hide()                                              
            }

        }
        else if (current == "Stats"){
            if (compareFlag){
              $('#deckNavbar').hide()
              $('#cardNavbar').hide()
              $('#statsNavbar').hide()
              $('#statsCompareNavbar').show()
              $('#browseNavbar').hide()
            }
            else{
              $('#deckNavbar').hide()
              $('#cardNavbar').hide()
              $('#statsNavbar').show()
              $('#statsCompareNavbar').hide()
              $('#browseNavbar').hide()   
            }

        }
        else{
          $('#deckNavbar').hide()
          $('#cardNavbar').hide()
          $('#statsNavbar').hide()  
          $('#statsCompareNavbar').hide()        
          $('#browseNavbar').hide()                                                                    
        }
    });




// code starts here

	init();

    
// initial functions
	function init() {

        loadSettings(); // if ls.Value, fbValue = ls.value
/*        fbUITheme = false*/

        if (fbUITheme == true){
            changeGlobalTheme("a");
        } 
        else{
            changeGlobalTheme("b");
        }


		createDeckMenu();  // Deck menu and restore selected decks

        $('input[type=checkbox]').change(function(){
                manageDecks();
        });

        console.log("Before decksplit conditional")

		if (localStorage.selecteddecks){
			var decksplit = localStorage.selecteddecks.split(",");
            restoreSavedDecks(decksplit);
            console.log("Restoring decks: " + decksplit)
		}

        if (localStorage.selecteddecks === undefined) restoreSavedDeck("#Deck41");

        if (localStorage.fave){
            fave = localStorage.fave.split(",")
        }

        checkFavorites();

        try {
            eval(fbTheme);
        } catch (e) {
            console.log(e.message);
            fbTheme = defaultThemeName;
        }
		
		bglog = bglogSVG;
		//twoCubesFlag = true;
		//numberOfCubes = 2;
		var ua = navigator.userAgent.toLowerCase();
        isAndroid = ua.indexOf("android") > -1; //&& ua.indexOf("mobile");
        
		currentTheme = eval(fbTheme);

// Simon's suggested bglog fixes
//        animateFlag = false;
        bglog.makeBoard();
        changeTheme(fbTheme);
        changeUITheme(fbUITheme);
        bglog.loadXgId(xgStartPos);
        applySettings();
//        animateFlag = true;


/*		animateFlag = false;*/
/*		bglog.makeBoard();
		changeTheme(fbTheme);
        changeUITheme(fbUITheme);

		applySettings();*/
/*		animateFlag = true;*/

        markSettings(); // adjust settings ui to fbValues
        manageDecks()


	}
	

	function storageAvailable(type) {
		try {
			var storage = window[type],
				x = '__storage_test__';
			storage.setItem(x, x);
			storage.removeItem(x);
			return true;
		}
		catch(e) {
			return false;
		}
	}



    function createDeckMenu() {

/*        var deckSetOrder = [0, 1, 6, 2, 3, 4, 5, 8, 9, 7]*/
        var deckSetOrder = [10, 12, 9, 13, 11, 14, 15]        
        for (var h=deckSetOrder.length; h>0; h--){
            i = h - 1
            var content = '<fieldset data-role="collapsible" data-corners="false" class="decksetclass" id="' + DeckSet[deckSetOrder[i]].DeckSetName + '"><legend data-position="inline">' + DeckSet[deckSetOrder[i]].DeckSetName + '<span style="float:right;" class="button-span"><a id="buyButton' + deckSetOrder[i] + '" class="ui-btn ui-btn-icon-notext ui-icon-lock ui-corner-all buyButton metaButton" style="float:right"></a><a id="infoButton' + deckSetOrder[i] + '" style="float:right; margin-right: 10px;" class="ui-btn ui-btn-icon-notext ui-icon-info ui-corner-all infoButton metaButton"></a></span></legend><div data-role="controlgroup" data-corners="false" class="insidedecksetclass" id="Inside' + deckSetOrder[i] + '"></div></fieldset>'            

            $(content).prependTo('#selectDeckForm')

/*            var deckOrder = [30, 0, 1, 2, 3, 4, 5, 6, 7, 8, 18, 9, 10, 11, 12, 13, 14, 15, 16, 17, 27, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 40, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 43] */
            var deckOrder = [30, 41, 42, 43, 47, 44, 45, 46, 50, 48, 49, 51, 52, 54, 55, 56, 57, 58, 59]             
            // To distinguish Deck number from Deck order.
            // May use same techinique for DeckSet above when needed.  
            // If you're adding decks, remember to add cards in var CCCardOrder

            for (var j=0; j<deckOrder.length; j++){
                if (Deck[deckOrder[j]].DeckSetID == deckSetOrder[i]){
                    var innercontent = '<label id="Label' + deckOrder[j] + '"><input type="checkbox" name="Deck' + deckOrder[j] + '" id="Deck' + deckOrder[j] + '">' + Deck[deckOrder[j]].DeckName + '</label>'
                    $(innercontent).appendTo('#Inside' + deckSetOrder[i]);
                }
            }
        }

        $('.insidedecksetclass').enhanceWithin();
        $('.insidedecksetclass').controlgroup({ corners: false });
        $('.decksetclass').collapsible();

        for (var k=0; k<DeckSet.length; k++){
            if (fbDeckSetForSale[k] == false){
                $('#buyButton' + k).removeClass('buyButton');
                $('#buyButton' + k).removeClass('ui-icon-lock');
                $('#buyButton' + k).addClass('ui-icon-check');
                $('#buyButton' + k).addClass('ui-disabled');
                $('#buying' + k).addClass('ui-disabled');

                for (var l=0; l<Deck.length; l++){
                    if (Deck[l].DeckSetID == k && Deck[l].IsSample == 1){
                        $('#Label' + l).css('display', 'none');
                        $('#Deck' + l).css('display', 'none');
/*                        $('label[for="Deck' + l +'"]').css('display', 'none');
                        $('#Deck' + l).css('display', 'none');*/
                    }
                }                
            }
            else{
                for (var l=0; l<Deck.length; l++){
                    if (Deck[l].DeckSetID == k && Deck[l].IsSample == 0){

                        $('#Deck' + l).checkboxradio( "disable" );
                    }
                }                
            }
        }

        $('.infoButton').click(function(e) {  // Should be moved to events, but for JQM refresh bug. 
            var infoNum = this.id
            infoNum = infoNum.replace( /^\D+/g, '');
            for (var m=0; m<Deck.length; m++){
                if (Deck[m].DeckSetID == infoNum){
                    $("body").pagecontainer("change", "#hint" + m, {transition: "slide"});
                    break;
                }
            }
            return false; // preventDefault
        });

        $('.buyButton').click(function(e) {  // Should be moved to events, but for JQM refresh bug. 
            openStore()
            return false; // preventDefault
        });  

        $( "#Context" ).collapsible( "expand" );
      
    }

    function checkFavorites(){
        if (fave.length == 0){
            $('#Deck30').prop('checked', false).checkboxradio('refresh');
            $('#Deck30').checkboxradio('disable')
/*            $("label[for='Deck30']").html("No Saved Favorites");*/
            $("#Label30").html("No Saved Favorites");
            manageDecks()

        }
        else{
            $('#Deck30').checkboxradio('enable')
/*            $("label[for='Deck30']").html("Favorites");*/
            $("#Label30").html("Favorites");            
        }

    }



    function loadSettings(){  //Startup
		if (storageAvailable('localStorage')) {
			fbCoach = (localStorage.fbCoach === undefined) ? fbCoach = "True" : fbCoach = localStorage.fbCoach;
			fbTheme = (localStorage.fbTheme === undefined) ? fbTheme = "theme1" : fbTheme = localStorage.fbTheme;
            fbUITheme = (localStorage.fbUITheme === undefined) ? fbUITheme = "true" : fbUITheme = localStorage.fbUITheme;            
			fbAnimation = (localStorage.fbAnimation === undefined) ? fbAnimation = .75 : fbAnimation = Number(localStorage.fbAnimation);
			fbDirection = (localStorage.fbDirection === undefined) ? fbDirection = "true" : fbDirection = localStorage.fbDirection;
            fbShowDice = (localStorage.fbShowDice === undefined) ? fbShowDice = "true" : fbShowDice = localStorage.fbShowDice;
            fbShowPipcount = (localStorage.fbShowPipcount === undefined) ? fbShowPipcount = "true" : fbShowPipcount = localStorage.fbShowPipcount;
            fbShowPointNumbers = (localStorage.fbShowPointNumbers === undefined) ? fbShowPointNumbers = "true" : fbShowPointNumbers = localStorage.fbShowPointNumbers;
            fbShowTakiPoints = (localStorage.fbShowTakiPoints === undefined) ? fbShowTakiPoints = "true" : fbShowTakiPoints = localStorage.fbShowTakiPoints;
            fbShowDeckName = (localStorage.fbShowDeckName === undefined) ? fbShowDeckName = "true" : fbShowDeckName = localStorage.fbShowDeckName;
            mlength = (localStorage.mlength === undefined) ? mlength = 25 : mlength = Number(localStorage.mlength);
            sortdt = (localStorage.sortdt === undefined) ? sortdt = "SortD" : sortdt = localStorage.sortdt;
            cubeLevel = (localStorage.cubeLevel === undefined) ? cubeLevel = 0 : cubeLevel = Number(localStorage.cubeLevel);
            showCell = (localStorage.showCell === undefined) ? showCell = "Show" : showCell = localStorage.showCell;
            dataType = (localStorage.dataType === undefined) ? dataType = "Take" : dataType = localStorage.dataType;
            console.log(" Storage cube level = " + cubeLevel)


			if (fbDirection == "true") fbDirection = true; else fbDirection = false;
			if (fbUITheme == "true") fbUITheme = true; else fbUITheme = false;
			if (fbShowDice == "true") fbShowDice = true; else fbShowDice = false;
			if (fbShowPipcount == "true") fbShowPipcount = true; else fbShowPipcount = false;
			if (fbShowPointNumbers == "true") fbShowPointNumbers = true; else fbShowPointNumbers = false;
			if (fbShowTakiPoints == "true") fbShowTakiPoints = true; else fbShowTakiPoints = false;
            if (fbShowDeckName == "true") fbShowDeckName = true; else fbShowDeckName = false;            
			
			localStorage.fbCoach = fbCoach;
			localStorage.fbTheme = fbTheme;
			localStorage.fbAnimation =  "" + fbAnimation;
			localStorage.fbDirection = eval(fbDirection);
			localStorage.fbUITheme = eval(fbUITheme);        
			localStorage.fbShowDice = eval(fbShowDice); 
			localStorage.fbShowPipcount = eval(fbShowPipcount);
			localStorage.fbShowPointNumbers= eval(fbShowPointNumbers);
			localStorage.fbShowTakiPoints = eval(fbShowTakiPoints);
            localStorage.fbShowDeckName = eval(fbShowDeckName);            
			
			for (var i=0; i<DeckSet.length; i++){
				if (localStorage["fbDeckSetForSale" + i] === "false"){
					fbDeckSetForSale[i] = false    
				} else if (localStorage["fbDeckSetForSale" + i] === "true"){
					fbDeckSetForSale[i] = true
				} else{
					fbDeckSetForSale[i] = !!DeckSet[i].IsForSale
					localStorage["fbDeckSetForSale" + i] = fbDeckSetForSale[i].toString()                
				}
			}
		} else {
			console.log("LocalStorage inaccessible, defaults used");
		}
	}
	
    function markSettings(){  //Startup
		setTimeout(function () {
			$('#settings').page();
			$("input:radio[name='fbTheme']").each(function() { $(this).prop('checked', false); });
			$("input:radio[name='fbTheme'][value ='"+fbTheme+"']").prop('checked', true).checkboxradio("refresh");
			$("input:radio[name='fbDirection']").each(function() { $(this).prop('checked', false); });
			$("input:radio[name='fbDirection'][value ='"+fbDirection+"']").prop('checked', true).checkboxradio("refresh");

            $("input:radio[name='fbUITheme']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='fbUITheme'][value ='"+fbUITheme+"']").prop('checked', true).checkboxradio("refresh");


            $("input[type='radio']").checkboxradio();
            $("input:radio[name='radio-choice-h-2']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='radio-choice-h-2'][value ='"+mlength+"']").prop('checked', true).checkboxradio("refresh");
            $("input:radio[name='radio-choice-h-1']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='radio-choice-h-1'][value ='"+sortdt+"']").prop('checked', true).checkboxradio("refresh");
            $("input:radio[name='radio-choice-h-6']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='radio-choice-h-6'][value ='"+dataType+"']").prop('checked', true).checkboxradio("refresh");            
            $("input:radio[name='radio-choice-h-4']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='radio-choice-h-4'][value ='"+cubeLevel+"']").prop('checked', true).checkboxradio("refresh");
            $("input:radio[name='radio-choice-h-5']").each(function() { $(this).prop('checked', false); });
            $("input:radio[name='radio-choice-h-5'][value ='"+showCell+"']").prop('checked', true).checkboxradio("refresh");





			$('#fbShowDice').prop('checked', fbShowDice).checkboxradio("refresh");
            $('#fbShowDeckName').prop('checked', fbShowDeckName).checkboxradio("refresh");            
			$('#fbShowPipcount').prop('checked', fbShowPipcount).checkboxradio("refresh");
			$('#fbShowPointNumbers').prop('checked', fbShowPointNumbers).checkboxradio("refresh");
			$('#fbShowTakiPoints').prop('checked', fbShowTakiPoints).checkboxradio("refresh");
			$('#fbAnimation').slider();
			$('#fbAnimation').val(100-(fbAnimation*50));
			$('#fbAnimation').slider('refresh');
		}, 200);
    }

    function applySettings(){
		changeAnimation(fbAnimation);
		changeDirection(fbDirection);
        changeUITheme(false);
		changeDice(fbShowDice);
		changePipCount(fbShowPipcount);
		changePointNumbers(fbShowPointNumbers);
		changeTakiPoints(fbShowTakiPoints);

    }



	function changeTheme(themeName) {
		console.log("Changing theme to " + themeName);
		if (fbSSFlag) bglog.swapSides(); // reset swapSides if necessary
		bglog.loadTheme(eval(themeName));
		showQuestion();
	}
	
	function changeAnimation(fbAnimation) {
		bglog.setAnimationSpeed(fbAnimation);
		
	}
	
    function changeDirection(fbDirection) {
        if (fbDirection == true){
          currentTheme.direction = false;
        } 
        else{
          currentTheme.direction = true;
        } 
        bglog.toggleDirection();
    }

    function changeUITheme(fbUITheme) {
/*        fbUITheme = false*/
        if (fbUITheme == true){
			currentTheme.canvasColor = "#F2F2F2";
			currentTheme.pipcountTextColor = "#000";
            $(".ui-page").css("background-color", "#F2F2F2");
            changeGlobalTheme("a");
        } 
        else{
			currentTheme.canvasColor = "#2a2a2a";
			currentTheme.pipcountTextColor = "#FFF";
            $(".ui-page").css("background-color", "#2a2a2a");
            changeGlobalTheme("b");
        }
		changeTheme("currentTheme");
    }

	function changePipCount(fbShowPipcount) {
		if (fbShowPipcount == true) currentTheme.showPipCount = false;
		else currentTheme.showPipCount = true;
		if (fbShowPipcount == true || showingAnswer == false) bglog.togglePipCount();  
        //  Toggles unless Pips are off and Answer is open -- when pips are reversed. 
	}

    function changeDice(fbShowDice) {
        if (fbShowDice == true) currentTheme.showDice = false;
            else currentTheme.showDice = true;
        bglog.toggleDice();
    }

    function changePointNumbers(fbShowPointNumbers){
    	if (fbShowPointNumbers == true) currentTheme.showPointNumbers = false;
            else currentTheme.showPointNumbers = true;
        bglog.toggleShowNumbers();
    }

    function changeTakiPoints(fbShowTakiPoints){
        if (fbShowTakiPoints == true) currentTheme.takiPoints = false;
            else currentTheme.takiPoints = true;
        bglog.toggletakiPoints();
    }

    function restoreSavedDecks(deckNames){
		for (var i=0;i<deckNames.length;i++){
			restoreSavedDeck(deckNames[i]);
		}
	}

    function restoreFaves(faveNames){
        for (var i=0;i<faveNames.length;i++){
            restoreFave(faveNames[i])
        }
    }

	function restoreSavedDeck(deckName){ // *** should use prop
		$(deckName).prop("checked", true).checkboxradio("refresh");
        console.log(deckName)
	}


    function showStats(version){

        clearTrainingFlag = true
//        selectCards()//

        $('#stattext').empty();
        if (version == "Fresh"){
//            $("body").pagecontainer("change", "#stats", {transition: "pop"});//
            selectCards()
            console.log("Oldstats updated; version = Fresh")

        }
        else {
//            $("body").pagecontainer("change", "#stats", {transition: "pop", reverse: "true"});//
        }
		

        var thenum = ""

        for (var i=0; i<checked.length; i++){
            thenum = checked[i].replace( /^\D+/g, ''); // Get deck number
            console.log("i = " + i + "; thenum = " + thenum)
            if (i==0){
                statrow = "<tr><td width = '180'><b>Selected Decks: </b></td><td colspan='4'>" + Deck[thenum].DeckName + "</td></tr>";
                $('#stattext').append(statrow);
            }
            else{
                statrow = "<tr><td> </td><td colspan='4'>" + Deck[thenum].DeckName + "</td></tr>";
                $('#stattext').append(statrow);
            }
        }

        statrow = "<tr><td></td><td width = '10'></td></tr>";
        $('#stattext').append(statrow);
        $('#stattext').append(statrow); 
         
        var totalcards = 0
        for (var i=0; i < 8; i++){
            totalcards = totalcards + currentcards[i].length 
            }

        statrow = "<tr><td><b>Selected Cards: </b></td><td>" + totalcards + "</td>";
        if (version == "Fresh"){  // or browsemode
            statrow += "</tr>"
        }
        else {
            statrow += "<td></td><td colspan = 3><strong>Change:</strong></td></tr>"
        }


        $('#stattext').append(statrow);

        statrow = "<tr><td> </td></tr>";
        $('#stattext').append(statrow);
        $('#stattext').append(statrow);   

        for (var i=0; i < 8; i++){ 

            if (i == 0){
                statrow = "<tr><td>Unseen cards: </td><td>" + currentcards[i].length + "</td>";
                if (version != "Fresh"){statrow += "<td></td><td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr><tr></tr>"
                $('#stattext').append(statrow);
            }
            
            else if (i == 7){
                statrow = "<tr></tr><tr><td>Learned cards: </td><td>" + currentcards[i].length + "</td><td></td>"
                if (version != "Fresh"){statrow += "<td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr>";
                $('#stattext').append(statrow);
            }

            else {
                statrow = "<tr><td>Cards in group " + i + ":</td><td>&nbsp</td><td>" + currentcards[i].length + "</td>"
                if (version != "Fresh"){statrow += "<td " + formatStatDiff(i) + "</td>"}
                statrow += "</tr>";
                $('#stattext').append(statrow);
            }
            medStats[i] = currentcards[i].length
        }
        if (version == "Fresh") {oldStats = medStats.slice();}


        browseMode = true;
        showloader('deckselect', loadCard);
    };


    function formatStatDiff(i){
        var statDiff = currentcards[i].length - oldStats[i]
        console.log("Oldstats = " + oldStats[i])
        if (statDiff < 0){
            var fStatDiff = "width = '10' style='color:red'>-</td><td style='color:red'>" + Math.abs(statDiff)
        }
        else if (statDiff > 0) {
            var fStatDiff = "style='color:green'>+</td><td style='color:green'>" + Math.abs(statDiff)
        }
        else if (statDiff == 0) {var fStatDiff = ""}
        return fStatDiff
    }

// mainEngine functions

    function showloader(divID, destination){
        $('#' + divID).spin('custom', 'black');
        setTimeout(function () {
            destination();
            $('#' + divID).spin(false);
        }, 0)
        return
    }

    function clearSelectedDecks(){
        for (var j=0; j<Deck.length; j++){
            $('#Deck' + j).prop("checked", false).checkboxradio("refresh");
            } 
        checked.length = 0;
        selecteddecks.length = 0;
        localStorage.selecteddecks = ""
        manageDecks()
       
    }

    function manageDecks(){
        checked.length = 0;
        selecteddecks.length = 0;
        selecteddecksets.length = 0
        var deckReportNum = 0


        for (var j=0; j<Deck.length; j++){
            if ($('#Deck' + j).prop("checked") == true){    
                checked.push("Deck" + j);
                selecteddecks.push("#Deck" + j)
                selecteddecksets.push(Deck[j].DeckSetID)
                deckReportNum = deckReportNum + 1
            }
        }

        for (var k=0; k<DeckSet.length; k++){
            if (selecteddecksets.indexOf(k) > -1){
                $( '#buyButton' + k).css( 'opacity', '1' );                
            }
            else {
                if (fbDeckSetForSale[k] == false){
                    $( '#buyButton' + k).css( 'opacity', '.3' );
                }
                else {
                    $( '#buyButton' + k).css( 'opacity', '.5' );                    
                }
            }
        }


        $('#numDeckSpan').html(deckReportNum);
        if (deckReportNum == 0){$('#clearDecks').addClass('ui-disabled')}
        else {$('#clearDecks').removeClass('ui-disabled')}    
        localStorage.selecteddecks = "" + selecteddecks.toString();
        console.log("Selected decks: " + selecteddecks)      
        console.log("Local Storage Selected decks: " + localStorage.selecteddecks)
    }

		
    function areAnyDecksSelected(){
        if (checked.length == 0){
            $("#NoneSelectedPopup").popup("open");
            return
        }
        compareFlag = false
        showStats("Fresh")
    }

    function copyXG(){
/*    function copyTextToClipboard(text) {*/
          var textArea = document.createElement("textarea");

          //
          // *** This styling is an extra step which is likely not required. ***
          //
          // Why is it here? To ensure:
          // 1. the element is able to have focus and selection.
          // 2. if element was to flash render it has minimal visual impact.
          // 3. less flakyness with selection and copying which **might** occur if
          //    the textarea element is not visible.
          //
          // The likelihood is the element won't even render, not even a flash,
          // so some of these are just precautions. However in IE the element
          // is visible whilst the popup box asking the user for permission for
          // the web page to copy to the clipboard.
          //

          // Place in top-left corner of screen regardless of scroll position.
          textArea.style.position = 'fixed';
          textArea.style.top = 0;
          textArea.style.left = 0;

          // Ensure it has a small width and height. Setting to 1px / 1em
          // doesn't work as this gives a negative w/h on some browsers.
          textArea.style.width = '2em';
          textArea.style.height = '2em';

          // We don't need padding, reducing the size if it does flash render.
          textArea.style.padding = 0;

          // Clean up any borders.
          textArea.style.border = 'none';
          textArea.style.outline = 'none';
          textArea.style.boxShadow = 'none';

          // Avoid flash of white box if rendered for any reason.
          textArea.style.background = 'transparent';


          textArea.value = "XGID=" + chosenposition.XGID

          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
          } catch (err) {
            console.log('Oops, unable to copy');
          }

          document.body.removeChild(textArea);
        



    }

 



    function selectCards(){  //  Loads currentcards[train] with cards from selected decks


        browselist = [];
        
        for (var i=0; i < Card.length; i++){  // Clear cards
            if ('decklist' in Card[i]){Card[i].decklist.length = 0}
            if ('hintlist' in Card[i]){Card[i].hintlist.length = 0}
            if ('namelist' in Card[i]){Card[i].namelist.length = 0}
        }

        for (var i=0; i<8; i++){
            currentcards[i].length = 0;
        }
        
        //for (var i=6842; i < CardInDeck.length; i++){ // 6842 is beginning of CubeContext cards

        var CCCardOrder = [6842, 6843, 6844, 6845, 6846, 6847, 6848, 6849, 6850, 6851, 6852, 6853, 6855, 6856, 6857, 6859, 6860, 6861, 6862, 6863, 6864, 6865, 6866, 6867, 6868, 6869, 6870, 6871, 6872, 6873, 6874, 6875, 6876, 6877, 6878, 6903, 6904, 6905, 6906, 6907, 6908, 6909, 6910, 6911, 6912, 6913, 6914, 6915, 6916, 6917, 6918, 6919, 6920, 6921, 6922, 6923, 6924, 6925, 6926, 6927, 6928, 6929, 6930, 6931, 6932, 6933, 6934, 6935, 6936, 6937, 6938, 6939, 6940, 6941, 6942, 6943, 6944, 6945]        
        for (var i=0; i<CCCardOrder.length; i++){


            /*            if (checked.indexOf('Deck30') > -1){ // If favorites . . .
                if (checked.indexOf('Deck' + CardInDeck[i].DeckID) > -1 || fave.indexOf('Card' + CardInDeck[i].CardID) > -1){
                    loadCurrentCards(i)
                } 
            }
            else */
            if (checked.indexOf('Deck' + CardInDeck[CCCardOrder[i]].DeckID) > -1){
                loadCurrentCards(CCCardOrder[i])
            }
        }
    }


    function loadCurrentCards(i){
        if (!('decklist' in Card[CardInDeck[i].CardID])){
            Card[CardInDeck[i].CardID].decklist = []
        }
        
        Card[CardInDeck[i].CardID].decklist.push(CardInDeck[i].DeckID)

        if (!('hintlist' in Card[CardInDeck[i].CardID])){Card[CardInDeck[i].CardID].hintlist = []}
        Card[CardInDeck[i].CardID].hintlist.push(CardInDeck[i].DeckHintPointer)            

        if (!('namelist' in Card[CardInDeck[i].CardID])){Card[CardInDeck[i].CardID].namelist = []}
        if (typeof CardInDeck[i].PositionName === "undefined"){CardInDeck[i].PositionName = ""}     
        Card[CardInDeck[i].CardID].namelist.push(CardInDeck[i].PositionName)            

        browselist[browselist.length] = Card[CardInDeck[i].CardID]  // Card is added to Browselist
        if (localStorage['train' + CardInDeck[i].CardID]){
            train = Number(localStorage['train' + CardInDeck[i].CardID]);
            Card[CardInDeck[i].CardID].trainval = train;
            currentcards[train][currentcards[train].length] = Card[CardInDeck[i].CardID];
        }

        else {
            train = 0;
            Card[CardInDeck[i].CardID].trainval = 0;
            currentcards[0][currentcards[0].length] = Card[CardInDeck[i].CardID];
        }

    }

    function loadCard(){
/*        animateFlag = false*/
        checkSwap()
/*        animateFlag = true*/

		$("body").pagecontainer("change", "#flashcards", {transition: "pop"});
       //undo();  // Resets move animtion

        if (browseMode){
//            console.log("Browsing")
            browsecard();
        } 
        else {
//            console.log("Choosing")
            choosecard();
            lastcard = chosencard.CardID;  //Allows for check of card twice in succession
        }

        chooseposition();
		
        $("#questioncontainer").css("text-align", "left");
		$('#questioncontainer').removeClass("ui-icon-minus");
		$('#questioncontainer').addClass("ui-icon-plus");
		
        if (fbShowPipcount == false && showingAnswer == true) bglog.togglePipCount()

/*        if (fbSSFlag) bglog.swapSides(); // reset swapSides if necessary*/
        $("#belowAnswerContainer").show()
		
        if (chosencard.CardKind == 0){
            $("#swapButton").show();
        }
        else{
            $("#swapButton").hide();
            /*bglog.moveCube(2,"off",0);*/
        }

        if (chosencard.CardKind > 1){
            $("#bglogContainer").slideUp();
        }
        else{
            $("#bglogContainer").slideDown();
            bglog.loadXgId("XGID=" + chosenposition.XGID);


        }
        
/*        $("#outerAnswerContainer").hide();
        showingAnswer = false;    */

        $("#outerAnswerContainer").show();
        showingAnswer = true;    

        $('#clipMessage').hide()


        showQuestion();
        showAnswer();
        checkSwap()

        animateFlag = false
        setCube()
        animateFlag = true

        return
    }

    function checkSwap(){
        if (fbSSFlag) bglog.swapSides();
/*        animateFlag = false        */
    }

    function getheaderText(){
        if (fbShowDeckName == true){
            if (chosencard.decklist.length > 1) {
                var headerText = "Multiple Decks"
            }
            else {
                var headerText = Deck[chosencard.decklist[0]].DeckName
            }
        }
        else{
            var headerText = "Cube In Context"
        }

        return(headerText)
    }





    function showQuestion(){

        var colorName = currentTheme.ourCheckerColorText
        var crawFlag = ""
        var scoreText = ""
        var leadFlag = ""

        if (chosencard.CardKind == 2){

            if (chosenposition.iNeed > chosenposition.youNeed){leadFlag = " leads: "}
            else if (chosenposition.iNeed < chosenposition.youNeed){leadFlag = " trails: "}
            else {
                leadFlag = " is even: ";
                colorName = "Match";
            }

            if (chosenposition.iNeed == -1 || chosenposition.youNeed == -1){crawFlag = ", Crawford"}

            scoreText = colorName + leadFlag + chosenposition.iNeed + ", " + chosenposition.youNeed + crawFlag + "."

            if (chosenposition.Concepttype == "TP"){
                questiontext = scoreText + "<br>" + currentTheme.ourCheckerColorText + " is doubled to " + chosenposition.Cube + ".  Take point?"
            }

            if (chosenposition.Concepttype == "MWC"){
                questiontext = scoreText + "<br>Match Winning Chances?" 
            } 
        }

        else if (chosencard.CardKind == 3){
            questiontext = "<p style='text-align:center'>" + chosenposition.RuleName + ":<br>" 
            for (i = 0; i < chosenposition.Subrules.length; i++) {
                questiontext = questiontext.concat(String.fromCharCode(65 + i) + ". ")
            }
        }

        else{
            if (matchLength == 0){scoreText = "Money game."}
            else{
                var ourNeed = ourScore - matchLength;
                var oppNeed = oppScore - matchLength;
                if (ourScore > oppScore) {leadFlag = "leads:"}
                else if (ourScore < oppScore) {leadFlag = "trails:"}
                else {leadFlag = "is even:"}
                if (crawfordFlag) {crawFlag = ", Crawford"}
                else {crawFlag = ""}
                scoreText = " " + currentTheme.ourCheckerColorText + " " + leadFlag + " " + ourNeed + ", " + oppNeed + crawFlag + ".";
            } 

            if (chosencard.CardKind == 0) {questiontext = currentTheme.ourCheckerColorText + " on roll, Cube Action?<br>" + scoreText}
            else if (chosencard.CardKind == 1) {
                // Check that card is in Replies decks
                if (chosencard.CardID > 2749 && chosencard.CardID < 5270){var replyText = getOpeningPlay()}
                else {var replyText = ".<br>"}

                questiontext = currentTheme.ourCheckerColorText + " to play " + leftDie + rightDie + replyText + scoreText;
            }
        }
      
		$('#questioncontainer').html(questiontext);
        return
    }



    function showAnswer(){
		
        $('.answerContainer div .iscroll-content').empty();
		
        if (chosencard.CardKind == 0){
            showCubeAnswer();
            showCContext(dataType, sortdt, mlength, cubeLevel, showCell);
        }

        else if (chosencard.CardKind == 1){
            showPlayAnswer();
        }
		        
        else if (chosencard.CardKind == 2){
            showConceptAnswer();
        }

        else if (chosencard.CardKind == 3){
            showRuleAnswer();
        }

        var insertTable = "";

        for (var i=0; i < answertext.length; i++){
            insertTable += answertext[i]
        }

        var currentNameList = ""
        for (var i=0; i < chosencard.namelist.length; i++){
            currentNameList += "" + chosencard.namelist[i] + "<br>";
        }


        insertTable += "<table cellpadding='0' cellspacing='0' width='100%'><tr><td width = 2></td><td width='300'></td><td width='201'></td><td width='10'></td><td width='30'></td></tr>"
        insertTable += "<tr><td colspan = 5><hr></td></tr>"

        if (fave.indexOf('Card' + chosencard.CardID) > -1){
            insertTable += "<tr><td></td><td>" + currentNameList + "</td><td style='text-align:right'><div id='remFavMessage' class='favMessage'>Removed from Favorites</div><div id='addFavMessage' class='favMessage'>Added to Favorites</div></td><td></td><td><div id='favButton' class='ui-btn ui-icon-star ui-alt-icon ui-btn-icon-notext ui-corner-all'></div></td></tr>"}

        else {insertTable += "<tr><td></td><td>" + currentNameList + "</td><td style='text-align:right'><div id='remFavMessage' class='favMessage'>Removed from Favorites</div><div id='addFavMessage' class='favMessage'>Added to Favorites</div></td><td></td><td><div id='favButton' class='ui-btn ui-icon-star ui-btn-icon-notext ui-corner-all'></div></td></tr>"}

        insertTable += "</table>" 

        $('.answerContainer').empty();
        $('.answerContainer').append(insertTable);


		$('.movebutton').click(function(e) {  
            $('.movebutton').not(this).addClass('ui-disabled')
			$(this).removeClass('ui-icon-carat-r');
			$(this).addClass('ui-icon-carat-l');
            animate($(this).text());
			return false; // preventDefault
        });


        $("#outdistbtn").click(function(){
            $(".outcomedist").toggle(250);
            setTimeout(function () {
                $(".answerContainer").iscrollview("refresh");
                window.scrollTo(0);
            }, 10);            
        });


        $('#favButton').on('vclick', function(){ manageFav(); });        

        return
    }
			
    function toggleAnswerContainer(){  // Simulates collapsible: iscrollview buggy on collapsibles.

        if(fbShowPipcount == false) bglog.togglePipCount()

        if(showingAnswer){
            $("#outerAnswerContainer").hide()
            $("#belowAnswerContainer").show()
			$('#questioncontainer').removeClass("ui-icon-minus");
			$('#questioncontainer').addClass("ui-icon-plus");
            showingAnswer = false
        }
        else{
            $("#outerAnswerContainer").show()
            $("#belowAnswerContainer").hide()
			$('#questioncontainer').removeClass("ui-icon-plus");
			$('#questioncontainer').addClass("ui-icon-minus");
            showingAnswer = true
        }
		
        $(".answerContainer").iscrollview("refresh");
        return
    }


    function showCubeAnswer(){
        answertext = [];
        cubeDataNum = getCubeData();                          // Equities and errors
        cubeColor = getCubeColors(cubeDataNum);               // Text color 
        cubeActions = getCubeActions(cubeDataNum);            // "Double / Pass" labels
        cubeData = formatCubeData(cubeDataNum, cubeActions);  // Add parenthesis and +/- signs
        cubeOutcomes = getCubeOutcomes();                     // Raw outcome distribution signs

        answertext[answertext.length] = "<table class='tr2 tr3'>";

/*        answertext[answertext.length] = "<tr><td>&nbsp;</td></tr>"
        answertext[answertext.length] = "<tr><td>&nbsp;</td></tr>"*/

        answertext[answertext.length] = "<tr><td width='100'></td><td width='120'></td><td width='50'></td><td width='10'></td><td width='45'></td><td width='60'></td></tr>";

        answertext[answertext.length] = "<tr><td><b>Actions:</b></td><td style='color:" + cubeColor.moneyDEr + "'>" + cubeActions.moneyDouble + "</td><td style='color:" + cubeColor.moneyDEr + "'>" + cubeData.moneyDEr + "</td><td></td><td colspan='2'>(No Jacoby)</td></tr>";
        answertext[answertext.length] = "<tr><td></td><td style='color:" + cubeColor.moneyRDEr + "'>" + cubeActions.moneyReDouble + "</td><td style='color:" + cubeColor.moneyRDEr + "'>" + cubeData.moneyRDEr + "</td><td></td><td style='color:" + cubeColor.moneyDPEr + "'>" + cubeData.moneyDPEr + "</td><td style='color:" + cubeColor.moneyDPEr + "'>" + cubeActions.moneyTake + "</td></tr>";


        answertext[answertext.length] = "<tr><td>&nbsp;</td></tr>"

        answertext[answertext.length] = "<tr><td><b>Equities:</b></td><td>No Double</td><td>" + cubeData.moneyND + "</td></tr>";
        answertext[answertext.length] = "<tr><td></td><td>No Redouble</td><td>" + cubeData.moneyNRD + "</td></tr>";
        answertext[answertext.length] = "<tr><td></td><td>Double/" + cubeActions.moneyTakeString + "</td><td>" + cubeData.moneyDT + "</td></tr>";

        answertext[answertext.length] = "<tr><td>&nbsp;</td></tr>"

        answertext[answertext.length] = "<tr><td><b>Outcomes:</b></td><td>Win%</td><td>" + cubeOutcomes.MPlainW + "</td><td></td><td colspan='3'>(" + cubeOutcomes.MGammonW + ", " + cubeOutcomes.MBackgammonW + ")"
        answertext[answertext.length] = "<tr><td></td><td>Loss%</td><td>" + cubeOutcomes.MPlainL + "</td><td></td><td colspan='3'>(" + cubeOutcomes.MGammonL + ", " + cubeOutcomes.MBackgammonL +")</td></tr>" // </table>"

        answertext[answertext.length] = "<tr><td>&nbsp;</td></tr>"

        return(answertext);
    }


    function setCube(){
        cubeLocation = "mid"
        if (fbSSFlag) {
        if (cubeLevel > 0) cubeLocation = "top"
        }
        else if (cubeLevel > 0) cubeLocation = "bot" 

/*            if (nextFlag) animateFlag = false*/
        bglog.moveCube(1, cubeLocation, cubeLevel)
/*            animateFlag = true*/
        return
    }

    function showCContext(dataType, sortdt, mlength, cubeLevel, showCell){

        $('#cubecontext').empty();
        $('#legendtable').empty();


        setCube()

        if (mlength < 14){showData = true}
    	else {showData = false}

        // console.log(" Starting mlength = " + mlength)
        // console.log(" Starting cube level = " + cubeLevel)

        //Set up Grid -- Doubler Needs and Taker Needs numbers
        ccrow = "<tr style='border-bottom: 1px solid #ddd'><th width='90'></th>"
        for (var ml = 2; ml <= mlength; ml++){
            ccrow += "<th>" + ml + "</th>"
        }

        ccrow+="</tr>"
        $('#cubecontext').append(ccrow);
      
        truelinecount = 576  // 24 Squared

        for (var myneed=2; myneed <= mlength; myneed++){
            ccrow = "<tr><th>" + myneed + "</th>"
			//ccrow = "<tr>"

            for (var youneed=2; youneed <= mlength; youneed++){
                truelinecount -= 1

                linecount = truelinecount
                myneedshow = myneed
                youneedshow = youneed

                minneed = Math.max(myneed, youneed)
                var DubErr = [];
                var TakeErr = [];
                var Action = [];

                //Get data for specific score / cube value
                i = Number(cubeLevel)

                DubErr[i]=[];
                TakeErr[i]=[];
                Action[i]=[];

                switch (i) {
                    case 0:
                        DubErr[i].value = (Math.min((CubeContext[chosenposition.positionIndex][linecount].DTEq0), 1)-(CubeContext[chosenposition.positionIndex][linecount].NDEq0)).toFixed(3)
                        TakeErr[i].value = (1-(CubeContext[chosenposition.positionIndex][linecount].DTEq0)).toFixed(3)
                        DT=CubeContext[chosenposition.positionIndex][linecount].DTEq0
                        ND=CubeContext[chosenposition.positionIndex][linecount].NDEq0
                        break;
                    case 1:
                        DubErr[i].value = (Math.min((CubeContext[chosenposition.positionIndex][linecount].DTEq1), 1)-(CubeContext[chosenposition.positionIndex][linecount].NDEq1)).toFixed(3)
                        TakeErr[i].value = (1-(CubeContext[chosenposition.positionIndex][linecount].DTEq1)).toFixed(3)
                        DT=CubeContext[chosenposition.positionIndex][linecount].DTEq1
                        ND=CubeContext[chosenposition.positionIndex][linecount].NDEq1
                        break
                    case 2:
                        DubErr[i].value = (Math.min((CubeContext[chosenposition.positionIndex][linecount].DTEq2), 1)-(CubeContext[chosenposition.positionIndex][linecount].NDEq2)).toFixed(3)
                        TakeErr[i].value = (1-(CubeContext[chosenposition.positionIndex][linecount].DTEq2)).toFixed(3)
                        DT=CubeContext[chosenposition.positionIndex][linecount].DTEq2
                        ND=CubeContext[chosenposition.positionIndex][linecount].NDEq2
                        break
                    case 3:
                        DubErr[i].value = (Math.min((CubeContext[chosenposition.positionIndex][linecount].DTEq3), 1)-(CubeContext[chosenposition.positionIndex][linecount].NDEq3)).toFixed(3)
                        TakeErr[i].value = (1-(CubeContext[chosenposition.positionIndex][linecount].DTEq3)).toFixed(3)
                        DT=CubeContext[chosenposition.positionIndex][linecount].DTEq3
                        ND=CubeContext[chosenposition.positionIndex][linecount].NDEq3
                        break
                    case 4:
                        DubErr[i].value = (Math.min((CubeContext[chosenposition.positionIndex][linecount].DTEq4), 1)-(CubeContext[chosenposition.positionIndex][linecount].NDEq4)).toFixed(3)
                        TakeErr[i].value = (1-(CubeContext[chosenposition.positionIndex][linecount].DTEq4)).toFixed(3)
                        DT=CubeContext[chosenposition.positionIndex][linecount].DTEq4
                        ND=CubeContext[chosenposition.positionIndex][linecount].NDEq4    
                }


//  Red        Blue      Green    Purp       Orange    Yellow   
//["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#ffff33","#a65628","#f781bf","#999999"]  Set 1

//    Blue     Orange    Red        LBlue   Green     Yellow    Purple
//["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"] Tableau 10

                if (ND == 9999) Action[i].color = 'black'
                else if (ND > 1){
//                    if (DT > 1) Action[i].color = '#984ea3' // TGP
                    if (DT > 1) Action[i].color = '#fb8d3d' // TGP                        
//                    else Action[i].color = '#ffff33' // TGT     
                    else Action[i].color = 'yellow' // TGT                             
                }
                else {
//                    if (DT > 1) Action[i].color = '#e41a1c' // DP
                    if (DT > 1) Action[i].color = '#d92723' // DP                        
//                    else if (DT > ND) Action[i].color = '#4daf4a' // DT
                    else if (DT > ND) Action[i].color = '#6daed5' // DT
//                    else Action[i].color = '#377eb8' // NDT
                    else Action[i].color = '#979797' // NDT
                }



                //["#67001f","#6a011f","#6d0220","#700320","#730421","#760521","#790622","#7b0722","#7e0823","#810923","#840a24","#870b24","#8a0c25","#8c0d26","#8f0f26","#921027","#941127","#971228","#9a1429","#9c1529","#9f172a","#a1182b","#a41a2c","#a61c2d","#a81d2d","#aa1f2e","#ad212f","#af2330","#b12531","#b32732","#b52933","#b72b34","#b82e35","#ba3036","#bc3238","#be3539","#bf373a","#c13a3b","#c33c3d","#c43f3e","#c6413f","#c74441","#c94742","#ca4943","#cc4c45","#cd4f46","#ce5248","#d0544a","#d1574b","#d25a4d","#d45d4e","#d56050","#d66252","#d86554","#d96855","#da6b57","#db6d59","#dd705b","#de735d","#df755f","#e07861","#e17b63","#e27d65","#e48067","#e58369","#e6856b","#e7886d","#e88b6f","#e98d71","#ea9073","#eb9276","#ec9578","#ed977a","#ee9a7c","#ee9c7f","#ef9f81","#f0a183","#f1a486","#f2a688","#f2a88b","#f3ab8d","#f4ad90","#f4af92","#f5b295","#f5b497","#f6b69a","#f6b89c","#f7ba9f","#f7bda1","#f8bfa4","#f8c1a6","#f8c3a9","#f9c5ab","#f9c7ae","#f9c9b0","#facab3","#faccb5","#faceb8","#fad0ba","#fad2bc","#fad3bf","#fad5c1","#fbd7c4","#fbd8c6","#fbdac8","#fbdbca","#fbddcc","#fadecf","#fae0d1","#fae1d3","#fae2d5","#fae3d7","#fae5d8","#fae6da","#f9e7dc","#f9e8de","#f9e9e0","#f8eae1","#f8eae3","#f7ebe4","#f7ece6","#f6ede7","#f6ede8","#f5eee9","#f4eeeb","#f4efec","#f3efed","#f2efed","#f1efee","#f0f0ef","#eff0f0","#eef0f0","#edf0f1","#eceff1","#ebeff1","#eaeff2","#e9eff2","#e7eef2","#e6eef2","#e5edf2","#e3edf2","#e2ecf2","#e0ecf2","#dfebf2","#ddeaf2","#dbeaf1","#dae9f1","#d8e8f1","#d6e7f0","#d4e6f0","#d3e6f0","#d1e5ef","#cfe4ef","#cde3ee","#cbe2ee","#c9e1ed","#c7e0ed","#c5dfec","#c2ddec","#c0dceb","#bedbea","#bcdaea","#bad9e9","#b7d8e8","#b5d7e8","#b2d5e7","#b0d4e6","#aed3e6","#abd1e5","#a9d0e4","#a6cfe3","#a3cde3","#a1cce2","#9ecae1","#9cc9e0","#99c7e0","#96c6df","#93c4de","#91c3dd","#8ec1dc","#8bc0db","#88beda","#85bcd9","#83bbd8","#80b9d7","#7db7d7","#7ab5d6","#77b3d5","#74b2d4","#71b0d3","#6faed2","#6cacd1","#69aad0","#66a8cf","#64a7ce","#61a5cd","#5ea3cc","#5ba1cb","#599fca","#569dc9","#549bc8","#5199c7","#4f98c6","#4d96c5","#4b94c4","#4892c3","#4690c2","#448ec1","#428cc0","#408bbf","#3e89be","#3d87bd","#3b85bc","#3983bb","#3781ba","#3680b9","#347eb7","#337cb6","#317ab5","#3078b4","#2e76b2","#2d75b1","#2c73b0","#2a71ae","#296fad","#286dab","#266baa","#2569a8","#2467a6","#2365a4","#2164a2","#2062a0","#1f609e","#1e5e9c","#1d5c9a","#1b5a98","#1a5895","#195693","#185490","#17528e","#164f8b","#154d89","#134b86","#124983","#114781","#10457e","#0f437b","#0e4178","#0d3f75","#0c3d73","#0a3b70","#09386d","#08366a","#073467","#063264","#053061"]


 /*               console.log(" ND = " + ND)
                console.log(" DT = " + DT)*/
				
				// color swatches (sequential) <---lighter    darker--->
				//posColorTable = ["#f7fbff","#e3eef9","#cfe1f2","#b5d4e9","#93c3df","#6daed5","#4b97c9","#2f7ebc","#1864aa","#0a4a90","#08306b"] // blues
				//posColorTable = ["#f7fcf5","#e8f6e3","#d3eecd","#b7e2b1","#97d494","#73c378","#4daf62","#2f984f","#157f3b","#036429","#00441b"] // greens
				//colorTable = ["#ffffff","#f2f2f2","#e2e2e2","#cecece","#b4b4b4","#979797","#7a7a7a","#5f5f5f","#404040","#1e1e1e","#000000"] // greys
				//negColorTable = ["#fff5eb","#fee8d3","#fdd8b3","#fdc28c","#fda762","#fb8d3d","#f2701d","#e25609","#c44103","#9f3303","#7f2704"] // oranges
				//negColorTable = ["#fcfbfd","#f1eff6","#e2e1ef","#cecee5","#b6b5d8","#9e9bc9","#8782bc","#7363ac","#61409b","#501f8c","#3f007d"] // purples
				//negColorTable = ["#fff5f0","#fee3d6","#fdc9b4","#fcaa8e","#fc8a6b","#f9694c","#ef4533","#d92723","#bb151a","#970b13","#67000d"] // reds
				
				// take error color stop values
				//takeErrNeg = [-.026, -.05, -.1, -.15, -.2, -.25, -.3, -.35, -.4, -.45, -.5]
				//takeErrPos = [.026, .05, .1, .15, .2, .25, .3, .35, .4, .45, .5]
				
				takeErrNeg = [-.005, -.01, -.02, -.04, -.08, -.16, -.32, -.64, -1.28, -2.56, -5.12]
				takeErrPos = [.005, .01, .02, .04, .08, .16, .32, .64, 1.28, 2.56, 5.12]
				
				TakeErr[i].color = "#fff" // default color between takeErrNeg[0] and takeErrPos[0]
                DubErr[i].color = "#fff" // default color between takeErrNeg[0] and takeErrPos[0]
				
				if (TakeErr[i].value < 0){
					if (TakeErr[i].value < -100){
						TakeErr[i].value = '----'
						TakeErr[i].color = 'black'
					} else {
						for (j=0; j<OrangeColorTable.length; j++){
							if (TakeErr[i].value < takeErrNeg[j]) TakeErr[i].color = RedColorTable[j] // Pass
						}
					}
				} else if (TakeErr[i].value > 0){
					for (j=0; j<GreenColorTable.length; j++){
						if (TakeErr[i].value > takeErrPos[j]) TakeErr[i].color = BlueColorTable[j]  // Take
					}
				} else TakeErr[i].color = "#fff" // value == 0.000

                if (DubErr[i].value < 0){
                    if (DubErr[i].value < -100){
                        DubErr[i].value = '----'
                        DubErr[i].color = 'black'
                    } 
                    else {
                        for (j=0; j<PurpleColorTable.length; j++){
                            if (ND > 1){
                                if (DubErr[i].value < takeErrNeg[j]) DubErr[i].color = OrangeColorTable[j]  // Too good
                            }
                            else {
                                if (DubErr[i].value < takeErrNeg[j]) DubErr[i].color = GreyColorTable[j]  // No Dub    
                            } 
                        }
                    }
                } else if (DubErr[i].value > 0){
                    for (j=0; j<GreenColorTable.length; j++){
                        if (DubErr[i].value > takeErrPos[j]) DubErr[i].color = BlueColorTable[j]  // Dub
                    }
                } else DubErr[i].color = "#fff" // value == 0.000



                TakeErr[i].value = TakeErr[i].value.toString().replace("0.", ".")
                TakeErr[i].value = TakeErr[i].value.toString().replace("-0.", "-.")
                DubErr[i].value = DubErr[i].value.toString().replace("0.", ".")
                DubErr[i].value = DubErr[i].value.toString().replace("-0.", "-.")                

                fsize = 10 // mlength == 25
				cellSize = 30
				if (mlength == 13) {
					fsize = 16
					cellSize = 61
				}
				
                value = ""

                if (dataType == "Take"){
                    if (showData) value = TakeErr[i].value
                    background = TakeErr[i].color
                }
                else if (dataType == "Double"){
                    if (showData) value = DubErr[i].value
                    background = DubErr[i].color
                }
                else if (dataType == "Actions"){
                    background = Action[i].color
                }

                  
                diagonal = "none"
                textColor = "#555"
                if (lightOrDark(background) == "dark") textColor = "#ccc"



                // Add Diagonal chevrons
                if (myneed == youneed) {
                    //diagonal = "linear-gradient(to right top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,.4) 51%, rgba(0,0,0,0) 52%, rgba(0,0,0,0) 100%)"
                    diagonal = "linear-gradient(to left top, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%)"
                }

                // Add borders around 13-point match
                if (mlength == 25) {
                 
                    if (myneed == 13 && youneed < 14)   {
                        //diagonal = "linear-gradient(to right top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,.4) 51%, rgba(0,0,0,0) 52%, rgba(0,0,0,0) 100%)"
                        diagonal = "linear-gradient(to top, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%)"
                    }

                    if (youneed == 13 && myneed < 14)   {
                        //diagonal = "linear-gradient(to right top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,.4) 51%, rgba(0,0,0,0) 52%, rgba(0,0,0,0) 100%)"
                        diagonal = "linear-gradient(to left, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%)"
                    }


                    if (myneed == 13 && youneed == 13) {
                        //diagonal = "linear-gradient(to right top, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 49%, rgba(0,0,0,0) 50%, rgba(0,0,0,.4) 51%, rgba(0,0,0,0) 52%, rgba(0,0,0,0) 100%)"
                        diagonal = "linear-gradient(to left, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,.5) 0%, rgba(0,0,0,.5) 8%, rgba(0,0,0,0) 9%, rgba(0,0,0,0) 100%) ";
                    }
                }

				// Fill cell with color / data
                ccrow += "<td class='clickme' style='background-color: " + background + "; background-image: " + diagonal + "; width: " + cellSize + "px; height: " + cellSize + "px; font-size: " + fsize + "px; color: " + textColor + "; white-space: nowrap;'>" + value + "</td>"                    
            }
            ccrow +="</tr>"
            $('#cubecontext').append(ccrow); 
            truelinecount = truelinecount - (25-mlength)
        }
        

        //Show Legend

        if (dataType == "Actions"){
            lrow = "<tr><td colspan='9' style='text-align: center; vertical-align:top; height:45px'>Cube Actions:</td></tr>"  
            $('#legendtable').append(lrow); 
            lrow = "<tr>"
            lrow += "<td style='background-color:#979797; width: 50px; height: 50px; font-size: 12px; color:#555; white-space: nowrap;'>ND-T</td>"
            lrow += "<td style='width: 23px; height: 50px;'</td>"
            lrow += "<td style='background-color:#6daed5; width: 50px; height: 50px; font-size: 12px; color:#555; white-space: nowrap;'>D-T</td>"
            lrow += "<td style='width: 23px; height: 50px;'</td>"
            lrow += "<td style='background-color:#d92723; width: 50px; height: 50px; font-size: 12px; color:#555; white-space: nowrap;'>D-P</td>"  
            lrow += "<td style='width: 23px; height: 50px;'</td>"
            lrow += "<td id='TGPCell' style='background-color:#fb8d3d; width: 50px; height: 50px; font-size: 12px; color:#555; white-space: nowrap;'>TG-P</td>" 
            lrow += "<td style='width: 23px; height: 50px;'</td>"
            lrow += "<td id='TGTCell' style='background-color:yellow; width: 50px; height: 50px; font-size: 12px; color:#555; white-space: nowrap;'>TG-T</td>" 
//            lrow =+ "</tr>"            
            //lrow += "<td>&nbsp</td><td>D-T&nbsp</td><td style='background-color:#6daed5; width: 30px; height: 30px; font-size: 12px; white-space: nowrap;'></td>"
            //lrow += "<td>&nbsp</td><td>D-P&nbsp</td><td style='background-color:#d92723; width: 30px; height: 30px; font-size: 12px; white-space: nowrap;'></td>"

            $('#legendtable').append(lrow); 
        }

        else{
            if (dataType == "Take") lrow = "<tr><td colspan='12' style='text-align: center; vertical-align:top; height:40px'>Take / Pass by up to:</td></tr>"
            else lrow = "<tr><td colspan='12' style='text-align: center; vertical-align:top; height:40px'>Double / No-Double / Too Good by up to:</td></tr>"  
            

            $('#legendtable').append(lrow); 
            
            if (dataType == "Take") lrow = "<tr><td>T&nbsp</td>"
            else lrow = "<tr><td>D&nbsp</td>"

            for (j=0; j<RedColorTable.length; j++){
               var value = takeErrPos[j] 
               value = value.toString().replace("0.", ".")
               value = value.toString().replace("-0.", "-.")
               textColor = "#555"
               if (lightOrDark(BlueColorTable[j]) == "dark") textColor = "#ccc"
               lrow += "<td style='background-color: " + BlueColorTable[j] + "; width: 30px; height: 30px; font-size: 12px; color: " + textColor + "; white-space: nowrap;'>" + value + "</td>"      
            }
            lrow += "</tr>"
            $('#legendtable').append(lrow);

            if (dataType == "Take") lrow = "<tr><td>P&nbsp</td>"
            else lrow = "<tr><td>N&nbsp</td>"
            for (j=0; j<RedColorTable.length; j++){
               var value = takeErrNeg[j] 
               value = value.toString().replace("0.", ".")
               value = value.toString().replace("-0.", "-.")
               textColor = "#555"
               if (lightOrDark(RedColorTable[j]) == "dark") textColor = "#ccc"           
               if (dataType == "Take") lrow += "<td style='background-color: " + RedColorTable[j] + "; width: 30px; height: 30px; font-size: 12px; color: " + textColor + "; white-space: nowrap;'></td>"
               else lrow += "<td style='background-color: " + GreyColorTable[j] + "; width: 30px; height: 30px; font-size: 12px; color: " + textColor + "; white-space: nowrap;'></td>"
            }
            
            lrow += "</tr>"

            if (dataType == "Double"){
                $('#legendtable').append(lrow);

                lrow = "<tr><td>T&nbsp</td>"
                for (j=0; j<RedColorTable.length; j++){
                   var value = takeErrNeg[j] 
                   value = value.toString().replace("0.", ".")
                   value = value.toString().replace("-0.", "-.")
                   textColor = "#555"
                   if (lightOrDark(RedColorTable[j]) == "dark") textColor = "#ccc"           
                
                   lrow += "<td style='background-color: " + OrangeColorTable[j] + "; width: 30px; height: 30px; font-size: 12px; color: " + textColor + "; white-space: nowrap;'></td>"
                }

            }


            lrow += "</td><td></td><td></td><td></td><td></tr>"
            $('#legendtable').append(lrow);




        }

        




        // Show / Hide data
        if (showCell == "Hide"){
            $('.clickme').css({ "opacity": 0 });
            for (k=0; k<cellRow.length; k++) {
                $('#cubecontext tr:eq(' + cellRow[k] + ') td:eq(' + cellCol[k] + ')').css({ "opacity": 1 });
                console.log(cellCol, cellRow)
            }
        }
        else {
            cellCol = []
            cellRow = []
        }

        if (TGPShow == false) $('#TGPCell').css({ "opacity": 0 });
        if (TGTShow == false) $('#TGTCell').css({ "opacity": 0 });



        $('.clickme').click(function(e) {  // Should be moved to events, but for JQM refresh bug.
            /*if($(this).is(":visible")){*/
            if($(this).css("opacity") != 0){
                $(this).css({ "opacity": 0 });
            }
            else {
                $(this).css({ "opacity": 1 });
/*                alert("clicked cell at: " + this.cellIndex + ", " + this.parentNode.rowIndex);*/
                cellCol[cellCol.length] = (this.cellIndex) -1
                cellRow[cellRow.length] = this.parentNode.rowIndex

            }
 
            return false; // preventDefault
        });  

        $('#TGPCell').click(function(e) {  // Should be moved to events, but for JQM refresh bug.
            //if($(this).is(":visible")){
            if($(this).css("opacity") != 0){
                $(this).css({ "opacity": 0 });
                TGPShow = false
            }
            else {
                $(this).css({ "opacity": 1 });
                TGPShow = true
            }
 
            return false; // preventDefault
        });

        $('#TGTCell').click(function(e) {  // Should be moved to events, but for JQM refresh bug.
            //if($(this).is(":visible")){
            if($(this).css("opacity") != 0){
                $(this).css({ "opacity": 0 });
                TGTShow = false
            }
            else {
                $(this).css({ "opacity": 1 });
                TGTShow = true
            }
 
            return false; // preventDefault
        });


        return
    }


   	
	function lightOrDark(color) {
		// Variables for red, green, blue values
		var r, g, b, hsp;
		
		// Check the format of the color, HEX or RGB?
		if (color.match(/^rgb/)) {
	
			// If RGB --> store the red, green, blue values in separate variables
			color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
			
			r = color[1];
			g = color[2];
			b = color[3];
		} 
		else {
			
			// If hex --> Convert it to RGB: http://gist.github.com/983661
			color = +("0x" + color.slice(1).replace( 
			color.length < 5 && /./g, '$&$&'));
	
			r = color >> 16;
			g = color >> 8 & 255;
			b = color & 255;
		}
		
		// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
		hsp = Math.sqrt(
		0.299 * (r * r) +
		0.587 * (g * g) +
		0.114 * (b * b)
		);
	
		// Using the HSP value, determine whether the color is light or dark
/*		if (hsp>127.5) {*/
	    if (hsp>110) {
			return 'light';
		} 
		else {
	
			return 'dark';
		}
	}      

/*    function getColor(colorNum){
        var divColor = ["#2d004b","#2f024d","#300350","#320552","#330655","#350857","#360959","#380b5c","#390c5e","#3b0e60","#3c1063","#3e1165","#3f1367","#41156a","#43166c","#44186e","#461a70","#471c72","#491e75","#4a2077","#4c2279","#4e247b","#4f267d","#51287f","#522a81","#542c83","#562e85","#573187","#593388","#5b358a","#5c388c","#5e3a8e","#603d8f","#613f91","#634293","#654594","#664796","#684a98","#6a4d99","#6c4f9b","#6d529c","#6f559e","#71589f","#735aa1","#745da2","#7660a4","#7862a5","#7a65a7","#7c68a8","#7d6aa9","#7f6dab","#8170ac","#8372ae","#8575af","#8777b1","#887ab2","#8a7cb4","#8c7fb5","#8e81b7","#9083b8","#9286b9","#9488bb","#968abc","#978dbe","#998fbf","#9b91c1","#9d93c2","#9f96c3","#a198c5","#a39ac6","#a49cc7","#a69ec9","#a8a0ca","#aaa2cb","#aca4cd","#ada6ce","#afa8cf","#b1abd0","#b3add2","#b4afd3","#b6b0d4","#b8b2d5","#b9b4d6","#bbb6d7","#bcb8d9","#bebada","#c0bcdb","#c1bedc","#c3c0dd","#c4c1de","#c6c3df","#c7c5e0","#c9c7e1","#cac9e1","#cccae2","#cdcce3","#cfcee4","#d0cfe5","#d1d1e6","#d3d2e7","#d4d4e7","#d5d5e8","#d7d7e9","#d8d8ea","#dadaea","#dbdbeb","#dcddec","#dddeec","#dfdfed","#e0e1ed","#e1e2ee","#e2e3ee","#e4e4ee","#e5e5ef","#e6e6ef","#e7e7ef","#e8e8ef","#e9e9ef","#eaeaef","#ebebef","#ecebef","#edecef","#eeedee","#efedee","#f0eded","#f1eeec","#f2eeec","#f3eeeb","#f3eeea","#f4eee8","#f5eee7","#f5eee6","#f6eee4","#f7eee3","#f7eee1","#f8eddf","#f8eddd","#f9ecdb","#f9ecd9","#f9ebd7","#faead5","#fae9d3","#fae9d0","#fbe8ce","#fbe7cc","#fbe6c9","#fbe5c6","#fce4c4","#fce3c1","#fce2be","#fce1bc","#fce0b9","#fddeb6","#fdddb3","#fddcb0","#fddbad","#fdd9aa","#fdd8a7","#fdd7a4","#fdd5a1","#fdd49e","#fdd29b","#fdd198","#fdd095","#fdce92","#fdcd8f","#fdcb8b","#fdc988","#fcc885","#fcc682","#fcc57f","#fcc37c","#fbc178","#fbbf75","#fbbe72","#fabc6f","#faba6c","#f9b868","#f9b765","#f8b562","#f7b35f","#f7b15c","#f6af59","#f5ad55","#f4ab52","#f4a94f","#f3a74c","#f2a549","#f1a346","#f0a143","#ef9f40","#ee9d3e","#ed9b3b","#ec9938","#ea9735","#e99533","#e89430","#e7922e","#e6902b","#e48e29","#e38c27","#e28a25","#e08823","#df8621","#dd841f","#dc821d","#da801b","#d97e1a","#d77d18","#d67b17","#d47916","#d37714","#d17613","#cf7412","#ce7211","#cc7010","#ca6f0f","#c96d0e","#c76b0e","#c56a0d","#c3680c","#c2670c","#c0650b","#be640b","#bc620a","#ba610a","#b85f0a","#b75e09","#b55c09","#b35b09","#b15909","#af5808","#ad5708","#ab5508","#a95408","#a75308","#a55208","#a35008","#a14f07","#9f4e07","#9d4c07","#9b4b07","#994a07","#974907","#954807","#934707","#914507","#8f4407","#8d4308","#8b4208","#894108","#874008","#853e08","#833d08","#813c08","#7f3b08"];
        return divColor[colorNum]


    }
*/
    function getCubeOutcomes(){
        var cubeOutcomes = [];

        if (matchLength > 0){
            cubeOutcomes.SPlainW = Outcome[0][chosenposition.positionIndex].PlainW
            cubeOutcomes.SGammonW = Outcome[0][chosenposition.positionIndex].GammonW
            cubeOutcomes.SBackgammonW = Outcome[0][chosenposition.positionIndex].BackgammonW
            cubeOutcomes.SPlainL = Outcome[0][chosenposition.positionIndex].PlainL
            cubeOutcomes.SGammonL = Outcome[0][chosenposition.positionIndex].GammonL
            cubeOutcomes.SBackgammonL = Outcome[0][chosenposition.positionIndex].BackgammonL

            var otherOutcomeIndex = CubeCard[chosencard.CardID][1]
            console.log("chosencard.CardID = " + chosencard.CardID)
            console.log("Other Outcome Index =" + otherOutcomeIndex)

            cubeOutcomes.MPlainW = Outcome[0][otherOutcomeIndex].PlainW
            cubeOutcomes.MGammonW = Outcome[0][otherOutcomeIndex].GammonW
            cubeOutcomes.MBackgammonW = Outcome[0][otherOutcomeIndex].BackgammonW
            cubeOutcomes.MPlainL = Outcome[0][otherOutcomeIndex].PlainL
            cubeOutcomes.MGammonL = Outcome[0][otherOutcomeIndex].GammonL
            cubeOutcomes.MBackgammonL = Outcome[0][otherOutcomeIndex].BackgammonL
        }
        else{
            cubeOutcomes.MPlainW = Outcome[0][chosenposition.positionIndex].PlainW
            cubeOutcomes.MGammonW = Outcome[0][chosenposition.positionIndex].GammonW
            cubeOutcomes.MBackgammonW = Outcome[0][chosenposition.positionIndex].BackgammonW
            cubeOutcomes.MPlainL = Outcome[0][chosenposition.positionIndex].PlainL
            cubeOutcomes.MGammonL = Outcome[0][chosenposition.positionIndex].GammonL
            cubeOutcomes.MBackgammonL = Outcome[0][chosenposition.positionIndex].BackgammonL
        }

        return(cubeOutcomes)
    }


    function getCubeData(){
        var cubeData = [];

        for (var i=0, j=CubeCard[chosencard.CardID].length; i < j; i++){ //  This is a loop because the first item might be a money cube or might be a score cube.
            if (CubePosition[CubeCard[chosencard.CardID][i]].Score1 == 0){
                cubeData.moneyDT = CubePosition[CubeCard[chosencard.CardID][i]].DTEq;
                if (CubePosition[CubeCard[chosencard.CardID][i]].CubeOwner == 0){
                    cubeData.moneyND = CubePosition[CubeCard[chosencard.CardID][i]].NDEq;
                }
                else{
                    cubeData.moneyNRD = CubePosition[CubeCard[chosencard.CardID][i]].NDEq;
                }    
            }
        }


        cubeData.moneyDEr = ((Math.min(cubeData.moneyDT, 1)) - cubeData.moneyND  ).toFixed(3)
        cubeData.moneyRDEr = ((Math.min(cubeData.moneyDT, 1)) - cubeData.moneyNRD ).toFixed(3)
        cubeData.moneyDPEr = (1 - cubeData.moneyDT).toFixed(3);
 

        return(cubeData)
    }

    function getCubeColors(cubeDataNum){
        cubeColor = {}
        cubeColor.moneyNDEr = getCubeColor(cubeDataNum.moneyNDEr)
        cubeColor.moneyNRDEr = getCubeColor(cubeDataNum.moneyNRDEr)
        cubeColor.moneyDPEr = getCubeColor(cubeDataNum.moneyDPEr)
        cubeColor.moneyDTEr = getCubeColor(cubeDataNum.moneyDTEr)
        cubeColor.scoreNDEr = getCubeColor(cubeDataNum.scoreNDEr)
        cubeColor.scoreDPEr = getCubeColor(cubeDataNum.scoreDPEr)
        cubeColor.scoreDTEr = getCubeColor(cubeDataNum.scoreDTEr)
        cubeColor.moneyDEr = getCubeColor(cubeDataNum.moneyDEr)
        cubeColor.moneyRDEr = getCubeColor(cubeDataNum.moneyRDEr)                

        return cubeColor
    }

    function getCubeColor(eqDiff){
        var acubeColor = "" // Default will change with theme 

        if (Number(eqDiff) > 0) {acubeColor = BlueColorTable[6]} //#009933"}
        else {acubeColor = RedColorTable[6]} //#FF0000"}            
        return acubeColor




    }

    function formatCubeData(cubeData, cubeActions){
        for (datum in cubeData) {

            cubeData[datum] = cubeData[datum].toString().replace("0.", ".")
            cubeData[datum] = cubeData[datum].toString().replace("-0.", "-.")      

        }
        

        return(cubeData)
    }


    function getCubeActions(cubeData){
        var cubeActions = [];
        
        if (cubeData.moneyNRD < cubeData.moneyDT){
            if (cubeData.moneyNRD > 1){cubeActions.moneyReDouble = "Too Good";}
            else{cubeActions.moneyReDouble = "Redouble";}
        }
        else {cubeActions.moneyReDouble = "No Redouble";}

        if (cubeData.moneyND < cubeData.moneyDT){cubeActions.moneyDouble = "Double";}
        else {cubeActions.moneyDouble = "No Double";}

        if (cubeActions.moneyDouble == "No Double"){
            if (cubeActions.moneyReDouble == "No Redouble"){cubeActions.moneyCombo = "No (Re)Double";}
            else {cubeActions.moneyCombo = "No Double (Redouble)";}
        }
        else {
            if (cubeActions.moneyReDouble == "No Redouble"){cubeActions.moneyCombo = "Double (No Redouble)";}
            else if (cubeActions.moneyReDouble == "Redouble"){cubeActions.moneyCombo = "(Re)Double";}
            else {cubeActions.moneyCombo = "Double (Too Good)";}
        }


        if (cubeData.moneyDT >= 1){
            cubeActions.moneyTake = "Pass";
            cubeActions.moneyTakeString = "Take";
        }
        else{
            if(cubeData.moneyDT < 0){
                cubeActions.moneyTake = "Beaver";
                cubeActions.moneyTakeString = "Beaver";
            }
            else{
                cubeActions.moneyTake = "Take"
                cubeActions.moneyTakeString = "Take";
            }
        }
 /*       Score Actions*/

        if (cubeData.scoreND < cubeData.scoreDT){
            if (cubeData.scoreND > 1){cubeActions.scoreDouble = "Too Good";}
            else{cubeActions.scoreDouble = "Double";}
        }
        else{cubeActions.scoreDouble = "No Double";}

        if (cubeData.scoreDT >= 1){cubeActions.scoreTake = "Pass";}
        else{cubeActions.scoreTake = "Take"}
        return(cubeActions)
    }

 
    function getMoneyPlayPosition(){  
    // Looping through PlayCard[chosencard.CardID]) is not needed.  
    // Proper data structure has only one or two entries -- Money and (perhaps) Score.
    // With data convention that Score (if there) always comes first, this function is just:
    // PlayCard[chosencard.CardID][1]    

        for (var key in PlayCard[chosencard.CardID]){
            if (PlayPosition[PlayCard[chosencard.CardID][key]].Score1 == 0){
                return(PlayCard[chosencard.CardID][key])
            }
        }
    }


    function chooseposition(){
        if (chosencard.CardKind == 0){
            chosenposition = jQuery.extend(true, {}, CubePosition[CubeCard[chosencard.CardID][0]]);
            chosenposition.positionIndex = CubeCard[chosencard.CardID][0];
            $("#swapButton").show();
        }

        else if (chosencard.CardKind == 1){
            chosenposition = jQuery.extend(true, {}, PlayPosition[PlayCard[chosencard.CardID][0]]);
            chosenposition.positionIndex = PlayCard[chosencard.CardID][0];
            $("#swapButton").hide();  
        }

        else if (chosencard.CardKind == 2){
            chosenposition = jQuery.extend(true, {}, ConceptCard[chosencard.CardID]);
            chosenposition.positionIndex = chosencard.CardID;
        }

        else if (chosencard.CardKind == 3){
            chosenposition = jQuery.extend(true, {}, RuleCard[chosencard.CardID]);
            chosenposition.positionIndex = chosencard.CardID;
        }
        return
    }
    
    function browsecard(){
        chosencard = {};
        randomcard = Math.floor(Math.random() * browselist.length);
        chosencard = jQuery.extend(true, {}, browselist[currentbrowse]);
        return
    }


    function choosecard(){

        do {
           //Pick train group.  Then pick specific card.
            traingroup = choosegroup();
            chosencard = {};

            if (traingroup == "Unseen"){
                randomcard = Math.floor(Math.random() * unseencount);
                chosencard = jQuery.extend(true, {}, currentcards[0][randomcard]);
            }

            else if (traingroup == "Learned"){
                randomcard = Math.floor(Math.random() * learnedcount);
                chosencard = jQuery.extend(true, {}, currentcards[7][randomcard]);
            }

            else {  // Training
                var tickets = [];
                tickets[0] = 0;
                var ticket = 0;
                
                for (var i=1; i<7; i++) {
                    tickets[i] = tickets[i-1] + (currentcards[i].length * (7 - i));  // Gives 6 tickets to group 1; 5 to group 2; etc.
                }

                ticket = Math.floor( (Math.random() * tickets[6]) + 1); // Picks a ticket

                for (var i=1; i<7; i++) {
                    if (ticket <= tickets[i]){
                        randomcard = Math.floor(Math.random() * currentcards[i].length);
                        chosencard = jQuery.extend(true, {}, currentcards[i][randomcard]);
                        break;
                    }
                }       
            }
        }
        while (chosencard.CardID == lastcard)
        return
    }

    function choosegroup(){
        traingroup = "";
        unseencount = currentcards[0].length;
        learnedcount = currentcards[7].length;
        trainingcount = 0;

        for (var i=1; i<7; i++){
            trainingcount = trainingcount + currentcards[i].length;
        }

        if (unseencount == 0){
            if (trainingcount == 0){
                if (learnedcount == 0){
					$("body").pagecontainer("change", "#checkbox");
                }
                
                else {   // learnedcount =/= 0
                    traingroup = "Learned";
                }
            }
            
            else {  // trainingcount =/= 0
                if (learnedcount == 0){
                    traingroup = "Training";
                }
                
                else { // learnedcount =/= 0  95% Training 5% Learned
                    if (Math.random() < .95){
                        traingroup = "Training";
                    }

                    else {
                        traingroup = "Learned";
                    } 
                }
            }
        }

        else {  // Unseen =/= 0
            if (trainingcount < trainingsizelow){
                traingroup = "Unseen";
            }

            else if (trainingcount < trainingsizehigh){  // 50% Training 50% Unseen
                if (Math.random() < .5){
                    traingroup = "Training";
                }

                else {
                    traingroup = "Unseen";
                } 
            }

            else { // Trainincount <= trainingsizehigh
                if (learnedcount == 0){
                    traingroup = "Training";
                }

                else {  // 95% Training 5% Learned
                    if (Math.random() < .95){
                        traingroup = "Training";
                    }

                    else {
                        traingroup = "Learned";
                    }
                }
            }
        }
        return(traingroup);
    }


    function browseResult(direction){
        currentbrowse = currentbrowse + direction

        if (currentbrowse == browselist.length-1){
            $("#mynext").text('Next (Home)')
        }
        else {
            $("#mynext").text('Next')
        }

        if (currentbrowse == 0){
            $("#myprev").text('Previous (Home)')
        }
        else {
            $("#myprev").text('Previous')
        }


        if (currentbrowse == browselist.length || currentbrowse == -1){
			$("body").pagecontainer("change", "#deckselect");
            $("#deckselect").on("pagecontainershow" , function() {
                $("#AllBrowsedPopup").popup("open", {positionTo: 'window'})
                $("#myprev").text('Previous (Home)')
            });
        }
        else{
            loadCard();
        } 
        return
    }



    function parsePlayString(pStr){
        var playMultiplier = 1
        var pStr1 = pStr.replace(/bar/gi, "25"); //Convert "Bar"
        var pStr2 = pStr1.replace(/off/gi, "0"); //Convert "Off"
        var pStr3 = pStr2.replace(/\*/gi, "").trim();  //Remove "*"  .trim removes trailing space.
        var playSplit = pStr3.split(" ");  //  playSplit[0] = 13/11;  playSplit[1] = 6/5
        var moveSplit = [];
        
        for (var i=0; i<playSplit.length; i++){
            moveSplit[i] = playSplit[i].split("/"); //moveSplit[0][0] = 13; moveSplit[0][1] = 11
            
            if (moveSplit[i][1].indexOf("(") > -1){
                var playMultiplierIndex = moveSplit[i][1].indexOf("(")
                playMultiplier = Number(moveSplit[i][1][playMultiplierIndex + 1])
                var slicedMove = moveSplit[i][1].slice(0, playMultiplierIndex)
                moveSplit[i][1] = slicedMove
            }
            else playMultiplier = 1
             
            for (var j = 0; j < playMultiplier; j++){
                parsedPS[parsedPS.length] = new makeParsedPS(Number(moveSplit[i][0])-1, Number(moveSplit[i][1])-1)
            }
        }
        return (parsedPS);
    }

    function makeParsedPS(FromPoint, ToPoint){
        this.FromPoint = FromPoint;
        this.ToPoint = ToPoint;
        return
    }

    function fbswap(){
		if (fbSSFlag) {
			$('#swapButton').removeClass("ui-icon-back");
			$('#swapButton').addClass("ui-icon-forward");
            $('#swapButton').text("Doubler's Perspective");
		} else {
			$('#swapButton').removeClass("ui-icon-forward");
			$('#swapButton').addClass("ui-icon-back");
            $('#swapButton').text("Taker's Perspective");
		}
        bglog.swapSides();
        fbSSFlag = !fbSSFlag
        return;
    }

    function clearLS(){
        window.localStorage.clear();
    }


    function openHint(){
		$("body").pagecontainer("change", "#hint" + chosencard.hintlist[0], {transition: "slide"});
    }

    function openStore(){

        $("body").pagecontainer("change", "#store", {transition: "pop"});

        if (sessionStorage.storeInit != "Initialized"){
            initStore();    // Starts ecommerce protocols
        } 
    }

    function manageFav(){
        if (fave.indexOf('Card' + chosencard.CardID) > -1){  // If card is Fav
            fave.splice(fave.indexOf('Card' + chosencard.CardID),1)
            localStorage.fave = "" + fave.toString()
            $('#favButton').removeClass('ui-alt-icon');
            $('#addFavMessage').hide(250)
            $('#remFavMessage').show(250)            
            checkFavorites()             
        }
        else {
            fave.push("Card" + chosencard.CardID);
            localStorage.fave = "" + fave.toString(); 
            $('#favButton').addClass('ui-alt-icon');
            $('#addFavMessage').show(250)            
            $('#remFavMessage').hide(250)

            checkFavorites() 
        }
    }

    function otherHeaderFunction(){
        var current = $( ".ui-page-active" ).jqmData( "title" );

        if (current == "Cube Context"){
            $("body").pagecontainer("change", "#deckselect", {transition: "pop", reverse: "true"} );
        }

        else {
            $("body").pagecontainer("change", "#" + pageBeforeSettings, {transition: "pop", reverse: "true"} );            
        }
    }

    function infoHeaderFunction(){
        $("body").pagecontainer("change", "#Help", {transition: "pop"});
        var current = $( ".ui-page-active" ).jqmData( "title" );
        if (current == "Select Deck") $( "#sdHelp" ).collapsible( "expand" );
        else if (current == "Stats")  $( "#stHelp" ).collapsible( "expand" );
        else if (current == "Flashcard") {
            if (showingAnswer) $( "#flashA" ).collapsible( "expand" ); 
            else $( "#flashQ" ).collapsible( "expand" );
        }
        else if (current == "Settings") $( "#setHelp" ).collapsible( "expand" ); 
        else {
            $( "#setHelp" ).collapsible( "expand" );
            $( "#setHelp" ).collapsible( "collapse" );
        }
    }


    // Dynamically changes the theme of all UI elements on all pages,
    // also pages not yet rendered (enhanced) by jQuery Mobile.
    function changeGlobalTheme(theme)
    {
        // These themes will be cleared, add more
        // swatch letters as needed.
        var themes = " a b c d e";

        // Updates the theme for all elements that match the
        // CSS selector with the specified theme class.
        function setTheme(cssSelector, themeClass, theme)
        {
            $(cssSelector)
                .removeClass(themes.split(" ").join(" " + themeClass + "-"))
                .addClass(themeClass + "-" + theme)
                .attr("data-theme", theme);
        }

        // Add more selectors/theme classes as needed.
        setTheme(".ui-mobile-viewport", "ui-overlay", theme);
        setTheme("[data-role='page']", "ui-body", theme);
        setTheme("[data-role='page']", "ui-page-theme", theme);        
        setTheme("[data-role='page']", "ui-overlay-theme", theme);        
        setTheme("[data-role='header']", "ui-bar", theme);
        setTheme("[data-role='footer']", "ui-bar", theme);
        setTheme("[data-role='collapsibleset']", "ui-bar", theme);                        
        setTheme("[data-role='listview'] > li", "ui-bar", theme);
        setTheme(".ui-page", "background", theme);
        setTheme(".ui-btn", "ui-btn-up", theme);
        setTheme(".ui-btn", "ui-btn-hover", theme);
        setTheme("[data-role='panel']", "ui-panel-page-container", theme);
        setTheme("[data-role='panel']", "ui-panel-page-content", theme);
    };

};  // end on device ready function
