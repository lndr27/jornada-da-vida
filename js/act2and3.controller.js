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

        this.maxSkips = 1;
    };

    Act2and3Controller.prototype.playAct = function() {
        
        var _this = this;
        this.maxRounds = this.game.numberOfPlayers * this.game.numberOfQuestionsPerPlayer;        
        return $.Deferred(function(def) {
            _this.endActSuccess = def.resolve;
            var title = _this.game.currentActNumber === 2 ? "ATO II" : "ATO III";
            var subtitle = _this.game.currentActNumber === 2 ? "Sua História" : "Seu Futuro";
            _this.game.fadeActTitle(title, subtitle, _this.game.fadeTransitionDelay)
            .then(function() {
                _this.loadHtml().done(_this.loadingDone.bind(_this));
                _this.loadChallenges().done(_this.loadingDone.bind(_this));
            });            
        }).promise();
    };    

    Act2and3Controller.prototype.loadHtml = function() {

        var _this = this;
        return $.Deferred(function(def) {
            var htmlUrl = _this.game.currentActNumber === 2 ? "./views/act2_pt-br.html" : "./views/act3_pt-br.html";
            $.get(htmlUrl, function(html) {
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

    Act2and3Controller.prototype.bindButtons = function() {
        
        $("#skip-btn").unbind("click").on("click", this.skipChallenge.bind(this));
        $("#done-btn").unbind("click").on("click", this.completeChallenge.bind(this))
    };

    Act2and3Controller.prototype.skipChallenge = function() {

        if (this.challengesSkiped >= this.maxSkips) {
            this.nextRound();
            return;
        }
        this.challengesSkiped += 1;
        this.currentChallengeValue /= 2;
        this.updateChallengeText();
        this.saveCache();
    };

    Act2and3Controller.prototype.completeChallenge = function() {

        this.game.totalPoints += this.currentChallengeValue;
        this.nextRound();
    };

    Act2and3Controller.prototype.nextRound = function() {
        
        this.currentRound += 1;

        if (this.currentRound > this.maxRounds) {
            this.reset();
            this.endActSuccess();
            this.toggleButton(false);
            return;
        }
        this.currentChallenge = this.pickRandomChallenge() || {}; 
        this.game.switchToNextPlayer();
        this.playRound();
    };    

    Act2and3Controller.prototype.playRound = function() {
        
        $("#challenge").removeClass("hide");
        this.currentStep = 2;
        this.challengesSkiped = 0;
        this.currentChallenge = this.currentChallenge || this.pickRandomChallenge();
        this.currentChallengeValue = this.currentChallenge.value;
        this.updateRoundText();
        this.updateTotalPointsText();
        this.setCurrentPlayerName();
        this.toggleButton(true);
        this.bindButtons();
        this.updateChallengeText();
        this.saveCache();
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

    Act2and3Controller.prototype.updateChallengeText = function() {

        $("#challenge").html(this.currentChallenge.text + "<br/> (" + this.currentChallengeValue + " pontos)"  || "");   
    };

    Act2and3Controller.prototype.updateTotalPointsText = function() {

        $(".total-points").html("Placar: " + this.game.totalPoints);
    };

    Act2and3Controller.prototype.pickRandomChallenge = function () {

        var type = this.game.currentActNumber === 2 ? "myStory" : "myFuture";
        var max = this.challenges[type].length - 1;
        var rand = getRandomInt(0, max);
        return this.challenges[type][rand];
    }

    Act2and3Controller.prototype.setCurrentPlayerName = function() {

        $(".challenge-player").text("Jogador(a): " + this.game.getCurrentPlayerName());
    };

    Act2and3Controller.prototype.reset = function() {

        this.currentStep = 1;
        this.currentRound = 1;
        this.currentChallenge = null;
        this.currentChallengeValue = 0;
        this.isChallengeLoaded = false;
        this.isHtmlLoaded = false;
    };

    Act2and3Controller.prototype.updateRoundText = function() {

        $(".round").html("Rodada: " + this.currentRound);
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
        this.game.bindMainButton("Continuar", this.videoDoneClick.bind(this));
        this.saveCache();
    };

    Act2and3Controller.prototype.videoDoneClick = function() {

        this.game.hideMainButton();
        this.hideIntro();
        this.playRound();
        this.saveCache();
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

        this.currentStep = cache.currentStep || 1;
        this.currentChallenge = cache.currentChallenge || null;
        this.currentChallengeValue = cache.currentChallengeValue || 0;
        this.currentRound = cache.currentRound || 1;
    };

    return Act2and3Controller;
})();