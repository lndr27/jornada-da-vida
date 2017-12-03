window.LifeJourney = window.LifeJourney || {};

window.LifeJourney.Act1Controller = (function() {

    var Act1Controller = function(game, title, subtitle, htmlUrl, actNumber) {
        this.game = game;
        
        this.currentStep = 0;
        
        this.totalSteps = 0;

        this.title = title;
        
        this.subtitle = subtitle;
        
        this.htmlUrl = htmlUrl;

        this.actNumber = actNumber;
    };

    Act1Controller.prototype.playAct = function() {

        var _this = this;
        return $.Deferred(function(def) {
            _this.endActSuccess = def.resolve;

            if (_this.currentStep > _this.totalSteps) {
                _this.endActSuccess();
                return;
            }

            _this.game.fadeActTitle(_this.title, _this.subtitle, _this.game.fadeTransitionDelay)
            .then(_this.getHtml.bind(_this))
            .then(_this.nextStep.bind(_this));
        }).promise();
    };

    Act1Controller.prototype.getHtml = function() {

        var _this = this;
        return $.Deferred(function(def) {
            $.get(_this.htmlUrl, function(html) {
                _this.game.showHtml(html);
                _this.totalSteps = $("[data-step]").length;
                def.resolve();
            });            
        }).promise();        
    };

    Act1Controller.prototype.nextStep = function() {

        this.currentStep += 1;
        this.game.pauseBell();

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
            if (this.currentStep === this.totalSteps && this.actNumber === 4) {
                this.game.bindMainButton("FIM", this.nextStep.bind(this));
            }
            else {
                this.game.bindMainButton("Próximo", this.nextStep.bind(this));
            }
        }
        
        this.saveCache();
    };

    Act1Controller.prototype.bindTimerButtons = function() {

        var _this = this;
        var stopTimer = false;
        this.game.bindMainButton("Começar", function() {
            
            _this.game.bindMainButton("Pular", function() {
                _this.game.hideMainButton(true);
                _this.nextStep.call(_this);
                Timer.stop();
            });

            _this.game.playBell();
            _this.startTime().done(function() {
                _this.game.playBell();
                _this.currentStepTimerBlock().text("00:00");
                _this.game.bindMainButton("Próximo", _this.nextStep.bind(_this));
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

    Act1Controller.prototype.saveCache = function() {

        this.game.saveCache({
            currentStep: this.currentStep,
            totalSteps: this.totalSteps
        });
    };

    Act1Controller.prototype.bindDoubleClickNext = function() {

        var _this = this;
        this.currentStepBlock().unbind("dblclick").on("dblclick", function() {
            _this.nextStep();
        });
    }

    Act1Controller.prototype.loadCache = function(cache) {

        this.currentStep = cache.currentStep || 0;
        this.totalSteps = cache.totalSteps || 0;
    };

    Act1Controller.prototype.reset = function(cache) {
        
        this.currentStep = 0;
        this.totalSteps = 0;
    };

    return Act1Controller;
})();