var aMove = function (from, to, moveType) {
    this.Sx = from.x;
    this.Sy = from.y;
    this.St = from.time;
    this.Ex = to.x;
    this.Ey = to.y;
    this.Et = to.time;
    this.Ty = moveType;
};

var Point = function (x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time;
    this.getDis = function (bPoint) {
        return Math.sqrt((this.x - bPoint.x) * (this.x - bPoint.x) + (this.y - bPoint.y) * (this.y - bPoint.y)) * (bPoint.y - this.y < 0 ? -1 : 1);
    };

    this.getSpd = function (bPoint) {
        if (debug) console.log("Speed = " + (this.getDis(bPoint) / (bPoint.time - this.time)));
        return this.getDis(bPoint) / (bPoint.time - this.time);
    };

    this.disFrom = function (aPoint, bPoint) {
        return Math.abs((aPoint.x - this.x) * (bPoint.y - this.y) - (bPoint.x - this.x) * (aPoint.y - this.y)) / aPoint.getDis(bPoint);
    }
};

var Path = function (startPoint, name) {
    this.name = name;
    this.moves = new Array();
    this.window = new Array();
    this.lastPoint = null;

    this.keyPoint = null;

    this.errDis = 5;
    this.errSpd = 0.5;

    this.add = function (nPoint) {
        if (this.lastPoint != null && Math.abs(nPoint.time - this.lastPoint.time) <= 40) return;
        this.lastPoint = nPoint;
        if (this.window.length <= 1) {
            this.keyPoint = nPoint;
            return this.window.push(nPoint);
        }
        if (Math.abs(this.window[1].getSpd(nPoint) / this.window[0].getSpd(this.window[1]) - 1) > this.errSpd
            || nPoint.disFrom(this.window[0], this.window[1]) > this.errDis
            || this.keyPoint.disFrom(this.window[0], nPoint) > this.errDis
        ) {
            this.moves.push(new aMove(this.window[0], this.window[1], this.name));
            this.window[0] = this.window[1];
            this.window[1] = nPoint;
            this.keyPoint = nPoint;
            if (debug) console.log(this.name + " number = " + this.moves.length);
        } else {
            if (this.window[1].disFrom(this.window[0], nPoint) >= this.keyPoint.disFrom(this.window[0], nPoint))
                this.keyPoint = this.window[1];
            this.window[1] = nPoint;
        }
    };

    this.flush = function (time) {
        if (time != undefined) this.add(new Point(this.lastX, this.lastY, time));
        if (this.window.length == 2) {
            this.moves.push(new aMove(this.window[0], this.window[1], this.name));
            keyPoint = null;
        }
        this.window = new Array();
    };

    this.getData = function () {
        return this.moves;
    };

    this.add(startPoint);
};

var mRec = {
    movePath: null,
    scrollPath: null,
    pause: function () {
        if (mRec.movePath != null) mRec.movePath.flush((new Date()).getTime());
        if (mRec.scrollPath != null) mRec.scrollPath.flush((new Date()).getTime());
    },
    end: function () {
        mRec.pause();
    },
    getData: function () {
        var ret = new Array();
        if (mRec.movePath != null) ret = ret.concat(mRec.movePath.getData());
        if (mRec.scrollPath != null) ret = ret.concat(mRec.scrollPath.getData());
        return ret;
    },
    move: function (e) {
        var oPoint = new Point(e.pageX, e.pageY, (new Date()).getTime());
        if (mRec.movePath == null)
            mRec.movePath = new Path(oPoint, "move");
        else
            mRec.movePath.add(oPoint);
    },
    scroll: function () {
        var oPoint = new Point($(window).scrollLeft(), $(window).scrollTop(), (new Date()).getTime());
        if (mRec.scrollPath == null)
            mRec.scrollPath = new Path(oPoint, "scroll");
        else
            mRec.scrollPath.add(oPoint);
    },
    initialize: function () {
        mRec.movePath = null;
        mRec.scrollPath = null;
        if (debug) console.log("mRec initialize");
    },
    controlMouse: function (x, y) {
        $("#box").attr("style", "left:" + x + "px;top:" + y + "px;position:absolute;width:20px;height:20px;background:red;z-index:999999;");
    },
    controlScroll: function (x, y) {
        window.scrollTo(x, y);
    },
    reRun: function (move, t0, controller) {
        var tnow = (new Date()).getTime() - t0;
        var dx = (move.Ex - move.Sx) / (move.Et - move.St) * tnow;
        var dy = (move.Ey - move.Sy) / (move.Et - move.St) * tnow;
        controller(move.Sx + dx, move.Sy + dy);
    },
    replayLine: function (move, controler) {
        var key = setInterval(mRec.reRun, 10, move, (new Date()).getTime(), controler);
        setTimeout(function (key) {
            window.clearInterval(key)
        }, move.Et - move.St, key);
    },
    replay: function () {
        $("body").append('<div id="box" style="left: 43px; top: 47px;position:absolute;width:10px;height:10px;background:red;z-index:999999;"></div>')
        mRec.pause();
        var moveRec, scrollRec, moveT0 = 1e18, scrollT0 = 1e18;
        if (mRec.movePath != null) moveRec = mRec.movePath.getData(), moveT0 = moveRec[0].St;
        if (mRec.scrollPath != null) scrollRec = mRec.scrollPath.getData(), scrollT0 = scrollRec[0].St;
        moveT0 = scrollT0 = Math.min(moveT0, scrollT0);
        if (moveRec != undefined) {
            moveRec.forEach(function (e, id) {
                setTimeout(mRec.replayLine, e.St - moveT0, e, mRec.controlMouse);
            });
        }
        if (scrollRec != undefined) {
            scrollRec.forEach(function (e, id) {
                setTimeout(mRec.replayLine, e.St - scrollT0, e, mRec.controlScroll);
            });
        }
    }
};