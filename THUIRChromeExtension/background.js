var baseUrl = "http://127.0.0.1:8000";
var checkUrl = baseUrl + "/user/check/";
var dataUrl = baseUrl + "/task/data/";
var username, password;
var version = "1.0";
var debug1 = false;

var lastReminder = 0;


function storgeInfo(Msg) {
    var key = (new Date()).getTime();
    localStorage["" + key] = Msg;
    return "" + key;
}

function deleteInfo(key) {
    localStorage.removeItem(key);
}

function sendInfo(Msg) {
    username = localStorage['username'];
    password = localStorage['password'];
    var verified = verifyUser();
    if (verified != 0) return;

    var key = storgeInfo(Msg);
    $.ajax({
        type: "POST",
        dataType: "text",
        //dataType: 'json',
        url: dataUrl,
        data: {message: Msg},
        //contentType: "application/json; charset=utf-8",
        success: function (data) {
            deleteInfo(key);
        },
        error: function (jqXHR, textStatus, errorThrown) {
        }
    });
}

function flush() {
    for (var i = localStorage.length - 1; i >= 0; i--) {
        var lastkey = localStorage.key(i);
        if (lastkey.match(/[0-9]*/g)[0] != lastkey) continue;
        var Msg = localStorage[lastkey];
        deleteInfo(lastkey);
        sendInfo(Msg);
    }
}
flush();

chrome.runtime.onMessage.addListener(function (Msg, sender, sendResponse) {
    if (debug1) console.log(Msg);
    if (Msg.log_status == "request") {
        var verified = verifyUser();
        if (verified == 0) {
            chrome.browserAction.setBadgeText({text: 'on'});
            chrome.browserAction.setBadgeBackgroundColor({color: [255, 0, 0, 255]});
            sendResponse({log_status: true});
        }
        else
            chrome.browserAction.setBadgeText({text: ''});
        return;
    }
    if (Msg.link_store == "request") {
        sessionStorage.setItem(Msg.url, Msg.serp_link);
        sendResponse("sessionStorage done");
        return;
    }
    if (Msg.link_store == "request_update") {
        var now_time = new Date().getTime();
        var data = {interface: Msg.interface, expiry: now_time + 1800000};
        localStorage.setItem(Msg.url + Msg.query, JSON.stringify(data));
        sendResponse("localStorage done");
        return;
    }
    if (Msg.ref_request != undefined) {
        var serp_link = sessionStorage.getItem(Msg.ref_request);
        if (serp_link != undefined)
            sendResponse(serp_link);
        else
            sendResponse("");
        return;
    }
    if (Msg.interface_request != undefined) {
        // window.alert(Msg.interface_request);
        var value = JSON.parse(localStorage.getItem(Msg.interface_request));
        if (value != undefined) {
            var now_time = new Date().getTime();
            if (now_time <= value.expiry) {
                sendResponse(value.interface);
            }
            else {
                localStorage.removeItem(Msg.interface_request);
                // window.alert('expiry!'); // 过期
                sendResponse(1);
            }
        }
        else{
            // window.alert('no records!'); // 空记录
            sendResponse(1);
        }

        return;
    }
    if (Msg.file != undefined) {
        chrome.tabs.executeScript(sender.tab.id, Msg);
        sendResponse({scriptFinish: true});
        return;
    }
    if (Msg.send_flag == true) {
        Msg.username = localStorage['username'];
        Msg = JSON.stringify(Msg);
        sendInfo(Msg);
    }
});

function verifyUser() {
    if (debug1) console.log("checking...");
    var result = -1;
    if (debug1) console.log(localStorage['username']);
    if (debug1) console.log(localStorage['password']);
    if (localStorage['username'] != undefined && localStorage['password'] != undefined) {
        var name = localStorage['username'];
        var psw = localStorage['password'];
        if (debug1) console.log("POSTing...");
        $.ajax
        ({
            type: "POST",
            url: checkUrl,
            dataType: 'json',
            async: false,
            data: {username: name, password: psw},
            success: function (data, textStatus) {
                if (data == 0) {
                    result = 0;
                }
                if (data == 1) {
                    result = 1;
                }
                if (data == 2) {
                    result = 2;
                }
            },
            error: function () {
                result = -1;
            }
        });
    }
    return result;
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function clearlocalStorage() {
    for(var i=0; i<localStorage.length; i++){
        //check if past expiration date
        var this_key = localStorage.key(i);
        if (IsJsonString(localStorage.getItem(this_key))) {
            var values = JSON.parse(localStorage.getItem(this_key));
            if (values.expiry < new Date().getTime()) {
                localStorage.removeItem(this_key);
            }
        }

    }

}
setInterval(function() {clearlocalStorage(); }, 60000);


