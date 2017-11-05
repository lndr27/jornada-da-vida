window.LifeJourney = window.LifeJourney || {};


(function() {

    var CHALLENGES = [];
    
    var game = new LifeJourney.Game();
    
    window.foo = game;
    
    
    
    
    
    
    
    // $(".btn").on("click", function (evt) {        
    //     var time = $(this).attr("data-time");
    //     var challenge = LifeJourney.PickRandomChallenge(time) || {};
    //     $(".text-scroller-container").html(challenge.text || "");
    //     $(".challenge-type").html(challenge.type || "");
    //     $(".challenge-value").html("(" + (challenge.value || "") + " pontos)");
    //     //$(".challenge-multi").html((challenge.multiplier || ""));
    // });
    
    // /**
    //  * Picks a random questions given it's type
    //  * @param {String} type 
    //  * @returns {String}
    //  */
    // LifeJourney.PickRandomChallenge = function (type) {

    //     var min = 0;
    //     var max = CHALLENGES[type].length - 1;
    //     var rand = getRandomInt(min, max);
    //     return CHALLENGES[type][rand];
    // }

    // /**
    //  *  Gernerate a pseudo-random int between to numbers
    //  * @param {Number} min
    //  * @param {Numner} max
    //  * @returns {Number}
    //  */    
    // function getRandomInt(min, max) {
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    // }

    // function init() {

    //     $.getJSON("./js/challenges.json", function(data) {
    //         CHALLENGES = data;
    //     });
    // }
    // init();

})();