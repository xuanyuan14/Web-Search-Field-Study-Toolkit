if (debug) console.log("General Page is Loaded!");

mPage.initialize = function () {
    mPage.click_results = new Array();
    mPage.click_others = new Array();
    mPage.init_content();
};

mPage.init_content = function () {
    mPage.title = document.title;
};

setTimeout(mPage.init_content, 1500);
setTimeout(mPage.init_content, 3000);

mPage.update = function () {
    $("a").each(function (id, element) {
        if ($(element).attr("bindClick") == undefined) {
            $(element).attr("bindClick", true);
            $(element).click(function (event) {
                var click_time = (new Date()).getTime();
                var href = $($(this).get(0)).attr("href");
                // 站内链接
                if (href[0] !== "h") {
                        var url = window.location.href;
                        var start_id = url.search('.com');
                        href =  url.slice(0, start_id + 4) + href;
                    }
                var content = this.innerText;
                if (content == null) {
                    content = "";
                }
                var e = event || window.event;
                var pos_x = e.screenX;
                var pos_y = e.screenY;
                mPage.clickother(href, pos_x, pos_y, click_time, content);
            });
        }
    });
};

setTimeout(mPage.update, 1500);