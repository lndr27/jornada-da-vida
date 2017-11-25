window.Timer = {};
window.Timer.countDown = function(hours, min, sec, cb) {

    return $.Deferred(function(def) {

        var now = new Date();
        var end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + hours, now.getMinutes() + min,  now.getSeconds() + sec, 0);
    
        window.Timer.intervalId = setInterval(function() {
    
            now = (new Date()).getTime();
    
            var elapsed = end.getTime() - now;
            var hours = Math.floor((elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

            hours = hours < 0 ? 0 : hours;
            minutes = minutes < 0 ? 0 : minutes;
            seconds = seconds < 0 ? 0 : seconds;

            hours = (hours+"").length < 2 ? "0" + hours: hours;
            minutes = (minutes+"").length < 2 ? "0" + minutes: minutes;
            seconds = (seconds+"").length < 2 ? "0" + seconds: seconds;
            cb.call(this, hours, minutes, seconds);
    
            if (elapsed < 0) {
                clearInterval(window.Timer.intervalId);
                def.resolve();
            }
        }, 1000);
    }).promise();
    
};
window.Timer.stop = function() {
    window.clearInterval(window.Timer.intervalId);
};

window.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}