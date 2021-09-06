/**
 * 一个类来记录一个移动
 * @param {Point} from 起始点
 * @param {Point} to 终止点
 * @param {String} moveType 移动类型，分为Move和Scroll
 */
var aMove = function (from, to, moveType) {
    this.Sx = from.x;
    this.Sy = from.y;
    this.St = from.time;
    this.Ex = to.x;
    this.Ey = to.y;
    this.Et = to.time;
    this.Ty = moveType;
};

/**
 * 构造一个时间点，表示这个时候所在坐标
 * X和Y的位置为相对应内容最左上角的位置，也就是加入了窗口滑动的距离
 * @param {number} x 坐标X
 * @param {number} y 坐标Y
 * @param {number} time 当前时间
 */
var Point = function (x, y, time) {
    this.x = x;
    this.y = y;
    this.time = time;
    /**
     * 返回自己与另一个点的欧式距离
     * @param {Point} bPoint 另一个点
     */
    this.getDis = function (bPoint) {
        return Math.sqrt((this.x - bPoint.x) * (this.x - bPoint.x) + (this.y - bPoint.y) * (this.y - bPoint.y)) * (bPoint.y - this.y < 0 ? -1 : 1);
    };

    /**
     * 以自己为起点另一点为终点做匀速直线运动的速度
     * @param {Point} bPoint 终点
     */
    this.getSpd = function (bPoint) {
        if (debug) console.log("Speed = " + (this.getDis(bPoint) / (bPoint.time - this.time)));
        return this.getDis(bPoint) / (bPoint.time - this.time);
    };

    this.disFrom = function (aPoint, bPoint) {
        return Math.abs((aPoint.x - this.x) * (bPoint.y - this.y) - (bPoint.x - this.x) * (aPoint.y - this.y)) / aPoint.getDis(bPoint);
    }
};

/**
 * 一条压缩的路径
 * @param {Point} startPoint 第一次操作开始点(X,Y,T)
 * @param {string} name 这条路径的名称
 */
var Path = function (startPoint, name) {
    /**
     * 这条路径的名字
     */
    this.name = name;
    /**
     * 目前所有储存的操作集合
     */
    this.moves = new Array();
    /**
     * 滑动窗口内的点
     * pt0 and pt1
     */
    this.window = new Array();
    /**
     * 最近一次操作相对页面可见的左上角绝对位置
     * and 最近一次操作时间
     */
    this.lastPoint = null;

    /**
     * 距离偏移参考点
     */
    this.keyPoint = null;

    this.errDis = 5;
    this.errSpd = 0.5;

    /**
     * 加入一个点
     * @param {Point} nPoint 一个新的点
     */
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

    /**
     * 清空当前滑动窗口内的内容并且保存到moves内
     * @param {number} time 最后结束的时间，如果不传代表直接清空
     */
    this.flush = function (time) {
        if (time != undefined) this.add(new Point(this.lastX, this.lastY, time));
        if (this.window.length == 2) {
            this.moves.push(new aMove(this.window[0], this.window[1], this.name));
            keyPoint = null;
        }
        this.window = new Array();
    };

    /**
     * 获得这个路径，以Array的形式返回aMove数组
     */
    this.getData = function () {
        return this.moves;
    };

    /**
     * 初始化的构造函数
     */
    this.add(startPoint);
};

/**
 * 用于记录鼠标移动和滚动的对象
 */
var mRec = {
    /**
     * 鼠标移动路径
     */
    movePath: null,
    /**
     * 鼠标滚动路径
     */
    scrollPath: null,
    /**
     * 暂停记录鼠标移动
     */
    pause: function () {
        if (mRec.movePath != null) mRec.movePath.flush((new Date()).getTime());
        if (mRec.scrollPath != null) mRec.scrollPath.flush((new Date()).getTime());
    },
    /**
     * 结束记录鼠标移动
     */
    end: function () {
        mRec.pause();
    },
    /**
     * 导出记录的鼠标数据
     */
    getData: function () {
        var ret = new Array();
        if (mRec.movePath != null) ret = ret.concat(mRec.movePath.getData());
        if (mRec.scrollPath != null) ret = ret.concat(mRec.scrollPath.getData());
        return ret;
    },
    /**
     * 鼠标移动了
     * @param {鼠标位置信息} e
     */
    move: function (e) {
        var oPoint = new Point(e.pageX, e.pageY, (new Date()).getTime());
        if (mRec.movePath == null)
            mRec.movePath = new Path(oPoint, "move");
        else
            mRec.movePath.add(oPoint);
    },
    /**
     * 鼠标滚动了
     */
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
    //---以下为重新播放刚刚的操作的部分
    controlMouse: function (x, y) {
        $("#box").attr("style", "left:" + x + "px;top:" + y + "px;position:absolute;width:20px;height:20px;background:red;z-index:999999;");
    },
    controlScroll: function (x, y) {
        window.scrollTo(x, y);
    },
    /**
     * @param {aMove} move
     * @param {number} t0
     * @param {function} controller
     */
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
    /**
     * 重放刚刚录制的操作
     */
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