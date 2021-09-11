var msg = {
    send_flag: true,
    username: "",
    start_timestamp: 0,
    end_timestamp: 0,
    dwell_time: 0,
    page_timestamps: new Array(),
    type: "",
    origin: "",
    url: "",
    referrer: "",
    serp_link: "",
    query: "",
    page_id: 0,
    html: "",
    mouse_moves: "",
    clicked_results: "",
    interface: 1,
    preRate: -1,

    initialize: function () {
        msg.send_flag = true;
        msg.start_timestamp = 0;
        msg.end_timestamp = 0;
        msg.dwell_time = 0;
        msg.page_timestamps = new Array();
        msg.type = "";
        msg.origin = "";
        msg.url = "";
        msg.referrer = "";
        msg.serp_link = "";
        msg.query = "";
        msg.page_id = 0;
        msg.html = "";
        msg.mouse_moves = "";
        msg.clicked_results = "";
        msg.username = "";
        msg.interface = 1;
        msg.preRate = -1;
    }
};

var pageTimestamp = function (inT, outT) {
    this.inT = inT;
    this.outT = outT;
    this.getDwell = function () {
        return this.outT - this.inT;
    };
};

var pageManager = {
    start_timestamp: 0,
    end_timestamp: 0,
    dwell_time: 0,
    page_timestamps: new Array(),
    lastViewTime: 0,

    initialize: function () {
        pageManager.start_timestamp = (new Date()).getTime();
        pageManager.end_timestamp = pageManager.start_timestamp;
        pageManager.dwell_time = 0;
        pageManager.page_timestamps = new Array();
        pageManager.lastViewTime = pageManager.start_timestamp;
        if (debug) console.log("pageManager initialize");
    },
    getIn: function () {
        pageManager.lastViewTime = (new Date()).getTime();
    },
    getOut: function () {
        pageManager.end_timestamp = (new Date()).getTime();
        pageManager.page_timestamps.push(new pageTimestamp(pageManager.lastViewTime, pageManager.end_timestamp));
        pageManager.dwell_time += pageManager.end_timestamp - pageManager.lastViewTime;
        pageManager.lastViewTime = pageManager.end_timestamp;
    }
};

var viewState = {
    show: true,
    lastOp: 0,
    timeLimit: 100000,
    check: function () {
        if (debug) console.log("check state");
        if ((new Date()).getTime() - viewState.lastOp >= viewState.timeLimit && viewState.show == true)
            viewState.toggleState();
        else if (viewState.show == true)
            setTimeout(viewState.check, viewState.timeLimit);
    },
    toggleState: function () {
        if (debug) console.log("View State Changed from " + viewState.show + " to " + !viewState.show);
        if (viewState.show == false) {
            viewState.show = true;
            viewState.check();
            pageManager.getIn();
        } else {
            viewState.show = false;
            pageManager.getOut();
            mRec.pause();
        }
    },

    getIn: function () {
        viewState.lastOp = (new Date()).getTime();
        if (viewState.show == false) {
            viewState.toggleState();
        }
    },
    getOut: function () {
        if (viewState.show == true) {
            viewState.toggleState();
        }
    },
    tabEnter: function () {
        viewState.getIn();
    },
    tabLeave: function () {
        viewState.getOut();
    },
    focus: function () {
        if (debug) console.log("focus");
        viewState.getIn();
    },
    blur: function () {
        if (debug) console.log("blur");
        viewState.getOut();
    },
    mMove: function (e) {
        viewState.getIn();
        mRec.move(e);
    },
    mScroll: function () {
        viewState.getIn();
        mRec.scroll();
    },
    update: function () {
        //if (debug) console.log("update");
        mPage.update();
        //viewState.getIn();
    },
    close: function () {
        viewState.sendMessage();
    },
    initialize: function () {
        document.addEventListener("visibilitychange", function (event) {
            var hidden = event.target.webkitHidden;
            if (hidden) viewState.tabLeave();
            else viewState.tabEnter();
        }, false);
        window.onbeforeunload = viewState.close;
        $(window).focus(viewState.focus);
        $(window).blur(viewState.blur);
        viewState.show = true;
        viewState.lastOp = (new Date()).getTime();

        var origin = "???";
        var current_url = window.location.href;
        var temp = current_url.match(/www\.(baidu)?(sogou)?(so)?\.com\/(s|web)/g);
        if (temp != null) { //SERP页面
            switch (temp[0]) {
                case "www.sogou.com/web":
                    origin = "sogou";
                    break;

                case "www.baidu.com/s":
                    origin = "baidu";
                    break;

                case "www.so.com/s":
                    origin = "360";
                    break;

                default:
                    break;
            }
        }
        if (debug) {
            console.log("origin=" + origin);
            console.log(viewState);
            console.log(pageManager);
            console.log(mPage);
            console.log(mRec);
        }
        if (origin != "???") {
            if (debug) console.log("extension is working on SERP");
            $(window).bind('mousemove', viewState.mMove);
            $(window).bind('scroll', viewState.mScroll);
            chrome.runtime.sendMessage({file: origin + ".js"}, function (response) {
                    if (response.scriptFinish === true) {
                        if (debug) console.log("execute script done");
                        pageManager.initialize();
                        mPage.initialize();
                        mRec.initialize();
                        viewState.check();
                    }
            });
        }
        else {
            if (debug) console.log("extension is working on general page");
            $(window).bind('mousemove', viewState.mMove);
            $(window).bind('scroll', viewState.mScroll);
            chrome.runtime.sendMessage({file: "general.js"}, function (response) {
                    if (response.scriptFinish === true) {
                        if (debug) console.log("execute script done");
                        pageManager.initialize();
                        mPage.initialize();
                        mRec.initialize();
                        viewState.check();
                    }
            });
        }
    },
    sendMessage: function () {
        if (debug) console.log("send message");
        pageManager.getOut();
        mRec.end();
        var origin = "???";
        var current_url = window.location.href;
        var temp = current_url.match(/www\.(baidu)?(sogou)?(so)?\.com\/(s|web)/g);
        if (temp != null) {
            switch (temp[0]) {
                case "www.sogou.com/web":
                    origin = "sogou";
                    break;
                case "www.baidu.com/s":
                    origin = "baidu";
                    break;
                case "www.so.com/s":
                    origin = "360";
                    break;

                default:
                    break;
            }
        }

        msg.start_timestamp = pageManager.start_timestamp;
        msg.end_timestamp = pageManager.end_timestamp;
        msg.dwell_time = pageManager.dwell_time;
        msg.page_timestamps = JSON.stringify(pageManager.page_timestamps);
        msg.url = current_url;
        msg.referrer = current_referrer;
        msg.serp_link = current_serp_link;

        var temp1 = msg.referrer.match(/www\.(baidu)?(sogou)?(so)?\.com\/(s|web)/g);
        var tmp1 = 0, tmp2 = 0, isfromserp = 0;
        if (temp1 != null) {
            if ((temp1[0] === "www.sogou.com/web") || (temp1[0] === "www.baidu.com/s") || (temp1[0] === "www.so.com/s")) {
                tmp1 = 1;
            }
        }
        if ((msg.referrer === 'https://www.baidu.com/') || (msg.referrer === 'https://www.sogou.com/') || (msg.referrer === 'https://www.so.com/')) {
            tmp2 = 1;
        }
        if (tmp1 === 1 || tmp2 === 1) {
            isfromserp = 1;
        }

        if (origin !== "???") {
            msg.type = "SERP";
            msg.origin = origin;
            msg.query = mPage.getQuery();
            msg.page_id = mPage.getPageId();
            //msg.html = pako.deflate(mPage.getHtml(), {to: 'string'});
            msg.html = mPage.getHtml();
            msg.title = mPage.getTitle();
            //msg.mouse_moves = pako.deflate(JSON.stringify(mRec.getData()), {to: 'string'});
            msg.mouse_moves = JSON.stringify(mRec.getData());
            //msg.clicked_results = pako.deflate(JSON.stringify(mPage.getClickedResults()), {to: 'string'});
            msg.clicked_results = JSON.stringify(mPage.getClickedResults());
            msg.clicked_others = JSON.stringify(mPage.getClickedOthers());
            if (isfromserp === 0) {
                msg.interface = 5;
            }
            else{
                msg.interface = mPage.getInterface();
            }
            msg.preRate = mPage.getPreRate();
        }
        else {
            msg.type = "general";
            msg.title = mPage.getTitle();
            msg.mouse_moves = JSON.stringify(mRec.getData());
            msg.clicked_results = JSON.stringify(mPage.getClickedResults());
            msg.clicked_others = JSON.stringify(mPage.getClickedOthers());
        }
        if (msg.url.slice(0, 27) !== "http://127.0.0.1:8000"){
            chrome.runtime.sendMessage(msg);
        }
        msg.initialize();
    }
};
