window.LifeJourney = window.LifeJourney || {};


window.LifeJourney.Game = (function() {

    var CACHE_KEY = "CurrentAct";
    var SECONDS = 1000;
    var BG_FADE_TIME = 2 * SECONDS;

    var Game = function() {

        this.act0Controller = new LifeJourney.Act0Controller(this);

        this.act1Controller = new LifeJourney.Act1Controller(this, "Ato I", "Partida", "./views/act1_pt-br.html?v=" + (new Date()).getTime());

        this.act2Controller = new LifeJourney.Act2and3Controller(this);

        this.act3Controller = this.act2Controller;

        this.act4Controller = new LifeJourney.Act1Controller(this, "Ato IV", "Chegada", "./views/act4_pt-br.html?v=" + (new Date()).getTime());

        this.maxPlayers = 10;

        this.numberOfQuestionsPerPlayer = 10;

        this.totalPoints = 0;

        this.currentActNumber = 0;

        this.lastActNumber = 4;

        this.numberOfPlayers = 1;

        this.playersNames = [];

        this.currentPlayer = 0;

        this.fadeTransitionDelay = 4000;

        this.loadCachedGame();
        this.bindStartButton();
    };

    Game.prototype.start = function() {
        
        var controller = this.getActController(this.currentActNumber);
        controller.playAct()
        .then(this.switchAct.bind(this));
    };

    Game.prototype.switchAct = function() {

        this.currentActNumber += 1;

        if (this.currentActNumber > this.lastActNumber) {
            this.showTheEnd();
            return;
        }
        this.start();
        this.saveCache();
        
    };
    
    Game.prototype.loadCachedGame = function () {

        var cachedGameJson = window.localStorage.getItem(CACHE_KEY);
        if (cachedGameJson) {
            var cachedGame = JSON.parse(cachedGameJson);
            this.totalPoints = cachedGame.totalPoints;
            this.currentActNumber = cachedGame.currentActNumber;
            this.numberOfPlayers = cachedGame.numberOfPlayers;
            this.playersNames = cachedGame.playersNames.split(",");
            this.currentPlayer = cachedGame.currentPlayer;
            this.getActController(this.currentActNumber).loadCache(cachedGame);
        }
    };

    Game.prototype.getActController = function(actNumber) {

        return this["act" + actNumber + "Controller"];
    };

    Game.prototype.showText = function(text) {

        $(".main-card").text(text);
    };

    Game.prototype.showHtml = function(html) {

        $(".main-card").html(html);
    };

    Game.prototype.fadeActTitle = function(title, subtitle, delay) {

        var _this = this;
        $(".act-title").text(title);
        $(".act-subtitle").text(subtitle);
        return this.showActTitle(delay).done(function() { _this.hideActTitle(delay); });
    };

    Game.prototype.showActTitle = function(delay) { 
        
        return $.Deferred(function(def) {
            $(".act-bg").removeClass("hide");
            setTimeout(function() {
                $(".act-bg").css("opacity", 1);
            }, 100);
            setTimeout(def.resolve, delay);

        }).promise();
    };

    Game.prototype.hideActTitle = function(delay) { 
        
        return $.Deferred(function(def) {    
                
            $(".act-bg").css("opacity", 0);
            setTimeout(function() {
                $(".act-bg").addClass("hide");
                def.resolve();
            }, delay);
        }).promise();        
    };    

    Game.prototype.bindStartButton = function() {

        var _this = this;
        $(".main-title").unbind("click").on("click", function() {
            _this.reset();
            _this.start();
        });

        if (this.hasCache()) {
            this.bindMainButton("Continuar", function() { 

                _this.hideMainButton();
                _this.start();
            });
        }
    };

    Game.prototype.switchToNextPlayer = function() {

        this.currentPlayer += 1;
        if (this.currentPlayer >= this.numberOfPlayers) {
            this.currentPlayer = 0;
        }
    };

    Game.prototype.getCurrentPlayerName = function() {
        
        return this.playersNames[this.currentPlayer];
    };

    Game.prototype.addPoints = function(points) {

        this.totalPoints += points;
    }

    Game.prototype.hasCache = function() {

        return window.localStorage.getItem(CACHE_KEY) ? true : false;
    };

    Game.prototype.saveCache = function(obj) {

        var cache = {
            currentActNumber: this.currentActNumber,
            numberOfPlayers: this.numberOfPlayers,
            currentPlayer: this.currentPlayer,
            playersNames: this.playersNames.join(","),
            totalPoints: this.totalPoints,
            currentPlayer: this.currentPlayer,
            currentActStep: this.getActController(this.currentActNumber).currentStep,
        };
        var cachedGame = $.extend(cache, obj);
        window.localStorage.removeItem(CACHE_KEY);
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(cachedGame));
    };

    Game.prototype.bindMainButton = function(btnText, cb) {

        $("#main-btn")
        .text(btnText)
        .removeClass("hide")
        .unbind("click")
        .on("click", cb);
    };

    Game.prototype.hideMainButton = function(unbindIt) {

        $("#main-btn").addClass("hide");
        unbindIt && $("#main-btn").unbind("click");
    };

    Game.prototype.reset = function() {

        this.totalPoints = 0;
        this.currentActNumber = 0;
        this.numberOfPlayers = 1;
        this.playersNames = [];
        this.currentPlayer = 0;
        this.act0Controller.reset();
        this.act1Controller.reset();
        this.act2Controller.reset();
        this.act3Controller.reset();
        window.localStorage.clear();
    };

    Game.prototype.showTheEnd = function() {

        $(".act-title").text("FIM");
        $(".act-subtitle").text("");
        this.showActTitle(2000);
    };

    return Game;
})();