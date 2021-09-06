if (debug) console.log("360 Main Page is Loaded!");

mPage.initialize = function () {
    mPage.query = $("#keyword").val();
    mPage.page_id = parseInt($("#page strong").text());
    mPage.html = document.documentElement.outerHTML;
    mPage.title = document.title;
};

setTimeout(mPage.initialize, 1500);

mPage.update = function () {
    $("ul#g-hd-tabs").find("a").each(function (id, element) {
        if ($(element).attr("bindClick") == undefined) {
            $(element).attr("bindClick", true);
            $(element).click(function () {
                mPage.click($(this).get(0), "tab", 0);
            });
        }
    });
    $("ul.result").children("li.res-list").each(function (id, element) {
        $(element).find("a").each(function (child_id, child_element) {
            if ($(child_element).attr("bindClick") == undefined) {
                $(child_element).attr("bindClick", true);
                $(child_element).click(function () {
                    mPage.click($(this).get(0), "content", id+1);
                });
            }
        });
    });
};