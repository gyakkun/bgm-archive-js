// ==UserScript==
// @name         Bangumi Forum Enhance Alpha
// @version      0.0.1
// @description  I know your (black) history!
// @author       gyakkun
// @include     /^https?://(bgm\.tv|chii\.in|bangumi\.tv)/(group|subject)/topic/*
// ==/UserScript==

(function () {
    const BA_API_URL = "https://bgm.nyamori.moe/forum-enhance/query"
    const BA_FEH_CACHE_PREFIX = "ba_feh_" + SPACE_TYPE + "_" // + username
    const FACE_KEY_GIF_MAPPING = {
        0: 44,
        140: 101,
        80: 41,
        54: 15,
        85: 46,
        104: 65,
        88: 49,
        62: 23,
        79: 40,
        53: 14,
        122: 83,
        92: 53,
        118: 79,
        141: 102,
        90: 51,
        76: 37,
        60: 21,
        128: 89,
        47: 08,
        68: 29,
        137: 98,
        132: 93
    }
    const SPACE_TYPE = getSpaceType();
    const SPACE_ACTIO_BUTTON_WORDING = {
        "group": "小组统计",
        "subject": "条目统计"
    };

    function getSpaceType() {
        return document.location.pathname.split("/")[1];
    }


    function getPostDivList() {
        return $("div[id^='post_'")
    }

    function getUsernameAndPidOfPostDiv(postDiv) {
        return {
            username: postDiv.attr("data-item-user"),
            postId: parseInt(postDiv.attr("id").substr("post_".length))
        }
    }

    function getAllUsername() {
        var set = {}
        getPostDivList.each(function () { set[$(this).attr("data-item-user")] = null })
        return Object.keys(set)
    }

    function drawActionButton(username, postId) {
        return `
        <div class="action">
            <a href="javascript:void(0);" class="icon" title="${SPACE_ACTIO_BUTTON_WORDING}">
                <span data-dropped="false" class="ico" id="ba-feh-action-btn-${postId}-${username}" style="text-indent: 0px">▼</span><span class="title">${SPACE_ACTIO_BUTTON_WORDING}</span>
            </a>
        </div>
        `
    }

    function drawPostStatData(total, deleted, adminDeleted) {
        return `
            <small class="grey">
                ${total}(T)
                ${deleted > 0 ? `/<span style="color: red;">${deleted}(D)</span>` : ""}
                ${adminDeleted > 0 ? `/<span style="color: yellowgreen;">${adminDeleted}(AD)</span>` : ""}
            </small>
        `
    }

    function drawTopicStatData(total, deleted, silent, closed, reopen){
        return `
            <small class="grey">
                ${total}(T)
                ${deleted > 0 ? `/<span style="color: red;">${deleted}(D)</span>` : ""}
                ${silent > 0 ? `/<span style="color: rgb(255, 145, 0);;">${silent}(S)</span>` : ""}
                ${closed > 0 ? `/<span style="color: rgb(164, 75, 253);">${closed}(D)</span>` : ""}
                ${reopen > 0 ? `/<span style="color: rgb(53, 188, 134);">${reopen}(D)</span>` : ""}
            </small>
        `
    }

    function attachActionButton() {
        getPostDivList().each(function () {
            let { username, postId } = getUsernameAndPidOfPostDiv($(this))
            $(this).find("div.post_actions.re_info > div:nth-child(1)").first().after(
                drawActionButton(username, postId)
            )
        })
    }

    function registerOnClickEvent() {
        $("span[id^='ba-feh-action-btn-'").each(function () {
            let that = $(this)
            that.click(() => {
                alert("hi");
                if (that.attr("data-dropped") === "false") {
                    that.html("▲")
                    that.attr("data-dropped", "true")
                } else {
                    that.html("▼")
                    that.attr("data-dropped", "true")
                }
            })

        })
    }
    attachActionButton()
    registerOnClickEvent()
})();




const API_URL = "aHR0cHM6Ly9lYXN0YXNpYS5henVyZS5kYXRhLm1vbmdvZGItYXBpLmNvbS9hcHAvcHJldnBvc3QtanB6cW0vZW5kcG9pbnQvaGlzdG9yeT8="
const PAYLOAD = "eyJhcGkta2V5IiA6ICJNZjQ3eDBsMmtUajgxYVJ6QlNlelNGbHpZajVkVGdtNTV2cEFUalV5akFUeWRWRXJoQ2RjM3l3VnNock5SNEgwIiB9";


const PATH_PREFIX = "/" + TYPE + "/topic/";
const ANCHOR = "div.postTopic";

const postTopic = $("div.postTopic");
const posterName = postTopic.find("strong").find('a.l').html();
const posterId = postTopic.attr("data-item-user");
const postId = getPostID();
function getPostID() {
    let path = document.URL.replace("https://" + document.domain, "");
    const s = path.split("/");
    return s[1] + "/topic/" + s[3];
}
//

const STORAGE_KEY_PREFIX = TYPE + "_history_";
const GREET = posterName + " 最近发表的其他" + WORD[TYPE];
const GREET_fold = GREET + "&nbsp;&nbsp;► ";
const GREET_expand = GREET + "&nbsp;&nbsp;▼ ";

function fetchHistory(user) {
    const key = STORAGE_KEY_PREFIX + user;
    const cache = sessionStorage.getItem(key);
    if (!cache) {
        let url = atob(API_URL) + "user=" + user + "&type=" + TYPE;
        $.ajax({
            timeout: 8000,
            crossDomain: true,
            CORS: true,
            dataType: 'json',
            contentType: 'application/json',
            type: 'POST',
            url: url,
            data: atob(PAYLOAD),
            success: function (resp) {
                console.log("[bgm_prevPosts] " + TYPE + " history for " + user + " fetched, " + resp.length + " records.");
                sessionStorage.setItem(key, JSON.stringify(resp));
                drawRecentDiv(genAList(resp));
            },
            error: function (resp) {
                console.warn("[bgm_prevPosts] api fails");
                const ERROR_TEXT = '<h2 id="history_loading" style="font-size:1.2em; text-align:right; margin-bottom:0px"><i>服务器正在ICU抢救中...</i></h2>';
                drawRecentDiv(ERROR_TEXT);
            }
        });
    } else {
        console.log("[bgm_prevPosts] cache hit!");
        drawRecentDiv(genAList(JSON.parse(cache)));
    }
}

function shrinkDate(date) {
    const s = date.split("-")
    return Number(s[1]) + "/" + Number(s[2]) + "/" + Number(s[0].substr(2));
}

function genAList(histDict) {
    const EMPTY_TEXT = '<h2 style="font-size:1.2em; text-align:right; margin-bottom:0px"><i>孤舟蓑笠翁，独钓寒江雪。</i></h2>';
    let ret = '';
    for (let i in histDict) {
        const p = histDict[i];
        // dont have to show current post in the post list
        if (postId === p.type + "/topic/" + p.id) {
            continue;
        }
        ret += '<a href="' + PATH_PREFIX + p.id + '" class="l"><span>' + p.title + '</sapn> <small class="grey">' + shrinkDate(p.lastpost) + '</small></a>';
    }
    if (ret == '') return EMPTY_TEXT;
    return ret;
}

function drawRecentDiv(inner) {
    const target = $("#historyList");
    target.html(inner);
}

function initDraw() {
    const text = '<h2 class="subtitle" id="slideIcon" style="font-size:1em; margin-bottom:0px;">' + GREET_fold + '</h2>';
    const INIT_INNER = '<div id="historyList" style="margin-top:10px;" hidden><h2 id="history_loading" style="font-size:1.2em; margin-bottom:0px">loading...</h2></div>';
    const father = $(ANCHOR);
    father.append('<div class="subject_tag_section inner" id="historyWrapper" style="margin-top:8px;">' + text + INIT_INNER + '</div>');
}

initDraw();
// fetchHistory(posterId);
clickevent();


function clickevent() {
    var block = $('#historyWrapper');
    block.live('click', function () {
        var historyDiv = $(this).find('#historyList');
        if (historyDiv.is(':hidden')) {
            block.find('#slideIcon').html(GREET_expand);
            if (block.find('#history_loading').html()) {
                fetchHistory(posterId);
            }
            historyDiv.slideDown();
        } else {
            block.find('#slideIcon').html(GREET_fold);
            historyDiv.slideUp();
        }
    });
}