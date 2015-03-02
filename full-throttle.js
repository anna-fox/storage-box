var throttleByTimes = function(period, timesPerPeriod, func){
    var counter = 0,
        wait = false,
        lastCallMoment = 0,
        timeLeft = period,
        now = 0,
        args,
        ctx,
        timer = null,
        callLater = null;

    return function(){
        args = arguments;
        ctx = this;
        now = new Date().getTime();

        if (++counter >= timesPerPeriod - 1){
            wait = true;
        }

        if (now - lastCallMoment >= timeLeft ){
            counter = 0;
            lastCallMoment = 0;
            timeLeft = period;
            wait = false;
            callLater = null;
        }

        if (!wait){
            func.apply(this, args);
            if (lastCallMoment){
                timeLeft = timeLeft - (now - lastCallMoment);
            }
            lastCallMoment = now;
            if (timer){
                clearTimeout(timer);
            }
            timer = setTimeout(callLater, timeLeft);
        }

        callLater = function(){
            func.apply(ctx, args);
        };
    }
};