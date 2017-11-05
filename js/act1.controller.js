window.LifeJourney = window.LifeJourney || {};

window.LifeJourney.Act1Controller = (function() {

    var Act1Controller = function(game) {
        this.game = game;
        this.currentStep = 0;
        this.totalSteps = 0;
    };

    Act1Controller.prototype.playAct = function() {

        var _this = this;
        return $.Deferred(function(def) {
            _this.endActSuccess = def.resolve;
            _this.game.fadeActTitle("ATO I", "Partida", 2000)
            .then(_this.getHtml.bind(_this))
            .then(_this.nextStep.bind(_this));
        }).promise();
    };

    Act1Controller.prototype.getHtml = function() {

        var _this = this;
        return $.Deferred(function(def) {
            $.get("../views/act1_pt-br.html", function(html) {
                _this.game.showHtml(html);
                _this.totalSteps = $("[data-step]").length;
                def.resolve();
            });            
        }).promise();        
    };

    Act1Controller.prototype.nextStep = function() {

        this.currentStep += 1;

        if (this.currentStep > this.totalSteps) {
            $("#main-btn").unbind("click").addClass("hide");
            this.endActSuccess();
            return;
        }
                
        this.hideLastStep();
        this.showCurrentStep();

        if (this.stepHasTimer()) {
            this.bindTimerButtons();                      
        }
        else {
            this.bindButtons("Próximo", this.nextStep.bind(this));
        }
        this.game.saveCache();
    };

    Act1Controller.prototype.bindTimerButtons = function() {

        var _this = this;
        this.bindButtons("Começar", function() {
            
            $("#main-btn").unbind("click").addClass("hide");

            _this.startTime().done(function() {
                this.currentStepTimerBlock().text("00:00");
                _this.bindButtons("Próximo", _this.nextStep.bind(_this))
            });
        });  

    };

    Act1Controller.prototype.startTime = function() {

        var timerBlock = this.currentStepTimerBlock();
        var minutes = +timerBlock.attr("data-minutes");
        return Timer.countDown(0, minutes, 0, function(hours, min, sec) {
            var txt = min + ":" + sec;
            timerBlock.text(txt);
        });
    };

    Act1Controller.prototype.bindButtons = function(txt, onClick) {

        var _this = this;
        $("#main-btn").text(txt);
        $("#main-btn")[0].className = "btn btn-rounded btn-red";
        $("#main-btn")
        .unbind("click")
        .on("click", onClick);        
    };

    Act1Controller.prototype.stepHasTimer = function() {

        return this.currentStepTimerBlock().length ? true : false;
    };

    Act1Controller.prototype.currentStepTimerBlock = function() {
        
          return $("[data-act=1] [data-step=" + this.currentStep + "] .timer");
      };

    Act1Controller.prototype.currentStepBlock = function() {
      
        return $("[data-act=1] [data-step=" + this.currentStep + "]");
    };

    Act1Controller.prototype.hideLastStep = function() {
        
        $("[data-act=1] [data-step=" + (this.currentStep - 1) + "]").addClass("hide");
    };

    Act1Controller.prototype.showCurrentStep = function() {
        
        $("[data-act=1] [data-step=" + (this.currentStep) + "]").removeClass("hide");
    };

    Act1Controller.prototype.loadCache = function(cache) {

        this.currentStep = cache.currentStep;
    };

    return Act1Controller;
})();