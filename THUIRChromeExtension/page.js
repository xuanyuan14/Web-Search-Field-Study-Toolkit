/**管理页面信息的接口 */
var mPage = {
    /**
     * 返回值
     */
    click_results: new Array(),
    click_others: new Array(),
    query: "",
    page_id: 0,
    html: null,
    title: null,
    interface: 1,
    preRate: -1,
    /**
     * 获得当前搜索查询词
     */
    getQuery: function () {
        return mPage.query;
    },
    /**
     * 获得当前搜索页面序号
     */
    getPageId: function () {
        return mPage.page_id;
    },
    /**
     * 获得当前搜索原始网页
     */
    getHtml: function () {
        return mPage.html;
    },
    /**
     * 获得当前网页标题
     */
    getTitle: function () {
        return mPage.title;
    },
    /**
     * 获得当前网页接口
     */
    getInterface: function () {
        return mPage.interface;
    },
    /**
     * 获得当前查询是否有预期标注
     */
    getPreRate: function () {
        return mPage.preRate;
    },
    /**
     * 返回当前页面所有点击结果信息
     */
    getClickedResults: function () {
        return mPage.click_results;
    },
    /**
     * 点击搜索结果的处理
     */
    click: function (link_obj, type, id, click_time, pos_x, pos_y, content) {
        var new_click = {
            href: $(link_obj).attr("href"),
            type: type,
            id: id,
            timestamp: click_time,
            pos_x: pos_x,
            pos_y: pos_y,
            content: content
        };
        mPage.click_results.push(new_click);
    },
    /**
     * 返回当前页面所有点击的坐标x，y，time, content，以及href
     */
    getClickedOthers: function () {
        return mPage.click_others;
    },
    clickother: function (href, pos_x, pos_y, timestamp, content) {
        var new_click_record = {
            href: href,
            pos_x: pos_x,
            pos_y: pos_y,
            timestamp: timestamp,
            content: content
        };
        mPage.click_others.push(new_click_record);
    },
    lastUpdate: 0,
    /**
     * 更新页面的click绑定
     * 在页面DOM树更新的时候触发
     */
    update: function () {
        if (debug) console.log("mPage update");
    },

    /**
     * 页面信息初始化,不同搜索引擎页面初始化的格式不一样
     */
    initialize: function () {
        mPage.preRate = -1;
        mPage.page_id = 0;
        mPage.click_results = new Array();
        mPage.click_others = new Array();
        if (debug) console.log("mPage initialize");
    }
};

var debug = true;
if (debug) console.log("page.js is loaded");
mPage.initialize();