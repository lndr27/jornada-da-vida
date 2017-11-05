window.LifeJourney = window.LifeJourney || {};

window.LifeJourney.Act0Controller = (function() {

    var Act0Controller = function(game) {
        this.game = game;
    };

    Act0Controller.prototype.playAct = function() {

        var _this = this;
        return $.Deferred(function(def) {
            _this.endActSuccess = def.resolve;
            _this.game.fadeActTitle("Regras do Jogo", "", 2000)
            .then(_this.showRules.bind(_this))
            .done(_this.bindEvents.bind(_this));
        }).promise();
    };

    Act0Controller.prototype.showRules = function() {

        var _this = this;
        return $.Deferred(function(def) {
            $.get("../views/rules_pt-br.html", function(html) {
                _this.game.showHtml(html);
                def.resolve();
            });            
        }).promise();        
    };

    Act0Controller.prototype.bindEvents = function() {
        this.bindButton();
        this.bindNumberOfPlayers();
    };

    Act0Controller.prototype.bindButton = function() {

        var _this = this;
        $("#main-btn").text("Continuar");
        $("#main-btn")[0].className = "btn btn-rounded btn-green";
        $("#main-btn")
        .unbind("click")
        .on("click", function() {

            _this.savePlayerNames();
            $(this).unbind("click").addClass("hide");
            _this.endActSuccess();            
        });        
    };

    Act0Controller.prototype.savePlayerNames = function() {

        var players = [];
        $(".playerName").each(function(i, el) {
            players.push($(el).val());
        });
        this.game.playersNames = players;
        this.game.saveCache();
    };

    Act0Controller.prototype.bindNumberOfPlayers = function() {

        var _this = this;
        $("#numberOfPlayers")
        .unbind("keydown")
        .on("keydown", function(e) {
            
            key = String.fromCharCode(e.keyCode);
            var regex = /[0-9]|\./;

            if (regex.test(key) ||                
                $.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A
                (e.keyCode == 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+C
                (e.keyCode == 67 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: Ctrl+X
                (e.keyCode == 88 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39) ||
                //Allow numbers and numbers + shift key
                ((e.shiftKey && (e.keyCode >= 48 && e.keyCode <= 57)) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((!e.shiftKey && (e.keyCode < 48 || e.keyCode > 57)) || (e.keyCode < 96 || e.keyCode > 105)) {
                return false;
                e.preventDefault();
            }
        });

        $("#numberOfPlayers")
        .unbind("change")
        .on("change", function(e) {

            var numberOfPlayers = +$(this).val();
            if (numberOfPlayers > _this.game.maxPlayers) {
                numberOfPlayers = _this.game.maxPlayers;
            }
            if (numberOfPlayers < 0) {
                numberOfPlayers = 0;
            }
            $(this).val(numberOfPlayers);
            _this.game.numberOfPlayers = numberOfPlayers;
            _this.setupPlayerNameInput();
        });
    };

    Act0Controller.prototype.setupPlayerNameInput = function() {

        var numOfInputs = $(".playerName").length;
        var inputs = $("#playerNames").html();

        if (numOfInputs < this.game.numberOfPlayers) {
            this.addPlayerNameInput(this.game.numberOfPlayers - numOfInputs);
        }
        else {
            this.removePlayerInput();
        }

    };

    Act0Controller.prototype.addPlayerNameInput = function(amount) {

        var start = $(".playerName").length;
        var end = this.game.numberOfPlayers;
        for (var i = start; i < end; ++i) {
            $("#playerNames").append($("<input type='text' value='' class='playerName' placeholder='Player " + (i + 1) + "' />"));
        }
    };

    Act0Controller.prototype.removePlayerInput = function() {

        var len = $(".playerName").length;
        for (var i = len; i >= this.game.numberOfPlayers; --i) {
            $($(".playerName")[i]).remove(); 
        }
    };

    Act0Controller.prototype.loadCache = function(cache) {
        
    }

    return Act0Controller;
})();