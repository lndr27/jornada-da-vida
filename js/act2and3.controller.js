window.LifeJourney = window.LifeJourney || {};

window.LifeJourney.Act2and3Controller = (function() {

    var Act2and3Controller = function(game) {

        this.game = game;
        
        this.challenges = null;
        
        this.currentChallenge = null;
        
        this.currentChallengeValue = 0;

        this.currentRound = 1;

        this.currentStep = 1;

        this.maxRounds = this.game.numberOfPlayer * this.game.numberOfQuestionsPerPlayer;

        this.isHtmlLoaded = false;

        this.isChallengeLoaded = false;

        this.challengesSkiped = 0;

        this.maxSkips = 3;
    };

    Act2and3Controller.prototype.playAct = function() {
        
        var _this = this;
        return $.Deferred(function(def) {
            _this.endActSuccess = def.resolve;
            _this.game.fadeActTitle("ATO II", "Sua História", 2000)
            .then(function() {
                _this.loadHtml().done(_this.loadingDone.bind(_this));
                _this.loadChallenges().done(_this.loadingDone.bind(_this));
            });            
        }).promise();
    };    

    Act2and3Controller.prototype.loadHtml = function() {

        var _this = this;
        return $.Deferred(function(def) {
            $.get("../views/act2_pt-br.html", function(html) {
                _this.game.showHtml(html);
                _this.isHtmlLoaded = true;
                def.resolve();
            });            
        }).promise();
    };

    Act2and3Controller.prototype.loadChallenges = function() {
        
        var _this = this;
        return $.Deferred(function(def) {
            if (_this.challenges) {
                _this.isChallengeLoaded = true;
                def.resolve();
                return;
            }

            $.getJSON("./js/challenges.json", function(data) {
                _this.challenges = data;
                _this.isChallengeLoaded = true;
                def.resolve();
            });
        }).promise();        
    };

    Act2and3Controller.prototype.loadingDone = function() {
        
        if (!this.isChallengeLoaded || !this.isHtmlLoaded) {
            return;
        }
        this.currentStep === 1 ?  this.showIntro() : this.playRound();
    };

    Act2and3Controller.prototype.nextRound = function() {

        this.currentRound += 1;

        if (this.currentRound > this.maxRounds) {
            this.endActSuccess();
            this.toggleButton(false);
            return;
        }
        this.currentChallenge = this.pickRandomChallenge() || {}; 
        this.playRound();
        this.saveCache();
    };

    Act2and3Controller.prototype.playRound = function() {
        
        $("#challenge").removeClass("hide");
        this.currentStep = 2;
        this.challengesSkiped = 0;
        this.currentChallenge = this.currentChallenge || this.pickRandomChallenge();
        this.setCurrentPlayerName();
        this.toggleButton(true);
        this.bindButtons();
        this.showChallenge();
        this.saveCache();
    };

    Act2and3Controller.prototype.updateChallengeValue = function(value) {

        this.currentChallengeValue = value;
        $(".challenge-value").html("(" + (value || "") + " pontos)");
    };

    Act2and3Controller.prototype.bindButtons = function() {
        
        $("#skip-btn").unbind("click").on("click", this.skipChallenge.bind(this));
        $("#done-btn").unbind("click").on("click", this.completeChallenge.bind(this))
    };

    Act2and3Controller.prototype.skipChallenge = function() {

        this.challengesSkiped += 1;
        if (this.challengesSkiped > this.maxSkips) {
            this.nextRound();
            return;
        }
        this.updateChallengeValue(this.currentChallengeValue / 2);
        this.game.switchToNextPlayer();
        this.setCurrentPlayerName();
        this.saveCache();
    };

    Act2and3Controller.prototype.completeChallenge = function() {

        this.game.totalPoints += this.currentChallengeValue;
        this.switchToNextPlayer();
        this.game.fadeInOutPlayerName()
        .then(this.nextRound.bind(this));
    };

    Act2and3Controller.prototype.toggleButton = function(b) {

        if (b) {
            $("#skip-btn").removeClass("hide");
            $("#done-btn").removeClass("hide");
        }
        else {
            $("#skip-btn").addClass("hide");
            $("#done-btn").addClass("hide");
        }
    };     

    Act2and3Controller.prototype.showChallenge = function() {

        $("#challenge").html(this.currentChallenge.text || "");
        $(".challenge-type").html(this.currentChallenge.type || "");
        this.updateChallengeValue(this.currentChallengeValue);        
    };    

    Act2and3Controller.prototype.pickRandomChallenge = function () {

        var type = this.game.currentActNumber == 2 ? "myStory" : "myFuture";
        var min = 0;
        var max = this.challenges[type].length - 1;
        var rand = getRandomInt(min, max);
        return this.challenges[type][rand];
    }

    Act2and3Controller.prototype.setCurrentPlayerName = function() {

        $(".challenge-player").text(this.game.getCurrentPlayerName());
    };


    // INTRO
    Act2and3Controller.prototype.showIntro = function() {
        
        if (this.actHasTimer()) {
            this.game.bindMainButton("Começar", this.timerStartBtnClick.bind(this));                    
            return;
        }
        if (this.actHasVideo()){
            this.showVideo();            
        }
        this.game.bindMainButton("Continuar", this.videoDoneClick.bind(this));        
    };

    Act2and3Controller.prototype.timerStartBtnClick = function() {
        
        this.game.hideMainButton();
        this.playTimer().then(this.timerDoneCallback.bind(this));
    };

    Act2and3Controller.prototype.playTimer = function() {
        
        var timerBlock = $("#act-intro").find(".timer");
        var minutes = +timerBlock.attr("data-minutes");
        return Timer.countDown(0, minutes, 0, function(hours, min, sec) {
            timerBlock.text(min + ":" + sec);
        });
    };

    Act2and3Controller.prototype.timerDoneCallback = function() {

        this.game.bindMainButton("Continuar", this.timerDoneBtnClick.bind(this));
    };

    Act2and3Controller.prototype.timerDoneBtnClick = function() {

        this.actHasVideo() ? this.showVideo() : this.playRound();
    };

    Act2and3Controller.prototype.showVideo = function() {
        
        $("#intro").addClass("hide");
        $(".video-box").removeClass("hide");
    };

    Act2and3Controller.prototype.videoDoneClick = function() {

        this.game.hideMainButton();
        this.hideIntro();
        this.playRound();
    };

    Act2and3Controller.prototype.hideIntro = function() {

        $("#act-intro").addClass("hide");
        $("#main-btn").addClass("hide");
        $(".video-box").addClass("hide");
    };    

    Act2and3Controller.prototype.actHasVideo = function() {

        return $("#act-intro").find(".video-box").length ? true : false;
    };

    Act2and3Controller.prototype.actHasTimer = function() {

        return $("#act-intro").find(".timer").length ? true : false;
    };

    Act2and3Controller.prototype.saveCache = function() {

        this.game.saveCache({
            currentStep: this.currentStep,
            currentChallenge: this.currentChallenge,
            currentChallengeValue: this.currentChallengeValue,
            currentRound: this.currentRound
        });
    };

    Act2and3Controller.prototype.loadCache = function(cache) {

        this.currentStep = cache.currentStep;
        this.currentChallenge = cache.currentChallenge;
        this.currentChallengeValue = cache.currentChallengeValue;
        this.currentRound = cache.currentRound;
    };

    return Act2and3Controller;
})();