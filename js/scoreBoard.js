window.LifeJourney = window.LifeJourney || {};

window.LifeJourney.ScoreBoard = (function() {

    var ScoreBoard = function() {

        this.totalPoints = 0;
    };

    ScoreBoard.prototype.add = function(points) {
        
        this.totalPoints += (+points);
    };

    ScoreBoard.prototype.reset = function() {
        
        this.totalPoints = 0;
    };

    return ScoreBoard;
})();