// ==UserScript==
// @name         Bangumi Forum Enhance Alpha
// @version      0.0.1
// @description  I know your (black) history!
// @author       gyakkun
// @include     /^https?://(bgm\.tv|chii\.in|bangumi\.tv)/(group|subject)/topic/*
// ==/UserScript==

(function () {
    const SPACE_TYPE = getSpaceType();
    const BA_API_URL = "https://bgm.nyamori.moe/forum-enhance/query"
    const BA_FEH_CACHE_PREFIX = "ba_feh_" + SPACE_TYPE + "_" // + username
    const FACE_KEY_GIF_MAPPING = {
        0: "44",
        140: "101",
        80: "41",
        54: "15",
        85: "46",
        104: "65",
        88: "49",
        62: "23",
        79: "40",
        53: "14",
        122: "83",
        92: "53",
        118: "79",
        141: "102",
        90: "51",
        76: "37",
        60: "21",
        128: "89",
        47: "08",
        68: "29",
        137: "98",
        132: "93"
    }
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
            postId: parseInt(postDiv.attr("id").substring("post_".length))
        }
    }

    function getAllUsernameSet() {
        var set = {}
        getPostDivList().each(function () { set[$(this).attr("data-item-user")] = null })
        return set
    }

    function drawWrapper(username, postId, userStatObj) {
        return `
            <div id="ba-feh-wrapper-${postId}-${username}" class="subject_tag_section" style="margin: 1em;float: inline-block">
                <div>
                    <div id="ba-feh-post-stat-${postId}-${username}">
                        <span class="tip">帖子统计:</span>
                        ${drawPostStatData(userStatObj.postStat)}
                    </div>
                    <div id="ba-feh-topic-stat-${postId}-${username}">
                        <span class="tip">话题统计:</span>
                        ${drawTopicStatData(userStatObj.topicStat)}
                    </div>
                    <div id="ba-feh-like-stat-${postId}-${username}">
                        <span class="tip">收到贴贴:</span>
                        ${drawFaceGrid(userStatObj.likeStat)}
                    </div>
                    <div id="ba-feh-space-stat-${postId}-${username}">
                        <span class="tip">空间统计:</span>
                        ${drawSpaceStatSection(userStatObj.spaceStat)}
                    </div>
                    <div id="ba-feh-recent-activities-${postId}-${username}">
                        <span>最近发表:</span>
                        ${drawRecentTopicSection(userStatObj.recentActivities.topic)}
                        <br/>
                        <span>最近回复:</span>
                        ${drawRecentPostSection(userStatObj.recentActivities.post)}
                    </div>
                </div>
            </div>
        `
    }

    function drawActionButton(username, postId) {
        return `
        <div class="action">
            <a href="javascript:void(0);" class="icon" title="${SPACE_ACTIO_BUTTON_WORDING[SPACE_TYPE]}">
                <span data-dropped="false" class="ico" id="ba-feh-action-btn-${postId}-${username}" style="text-indent: 0px">▼</span><span class="title">${SPACE_ACTIO_BUTTON_WORDING[SPACE_TYPE]}</span>
            </a>
        </div>
        `
    }

    function drawRecentPostSection(recentPostObjList) {
        if (recentPostObjList.length == 0) {
            return `<span>N/A</span>`
        }
        let inner = ""
        for (p of recentPostObjList) {
            inner += drawRecentPost(p)
        }
        return `
            <div class="subject_tag_section">
                ${inner}
            </div>
        `
    }

    function drawRecentTopicSection(recentTopicObjList) {
        if (recentTopicObjList.length == 0) {
            return `<span>N/A</span>`
        }
        let inner = ""
        for (t of recentTopicObjList) {
            inner += drawRecentTopic(t)
        }
        return `
            <div class="subject_tag_section">
                ${inner}
            </div>
        `
    }

    function drawSpaceStatSection(spaceStatObjList) {
        if (spaceStatObjList.length == 0) {
            return `<span>N/A</span>`
        }
        let inner = ""
        for (s of spaceStatObjList) {
            inner += drawSpaceStatData(s)
        }
        return `
            <div class="subject_tag_section">
                ${inner}
            </div>
        `
    }

    function drawRecentPost(postBriefObj) {
        return `<a class="l inner" href="/group/topic/${postBriefObj.mid}#post_${postBriefObj.pid}">${postBriefObj.title} <small class="grey">${formatDateline(postBriefObj.dateline)}</small></a>`
    }

    function drawRecentTopic(topicBriefObj) {
        return `<a class="l inner" href="/group/topic/${topicBriefObj.id}">${topicBriefObj.title} <small class="grey">${formatDateline(topicBriefObj.dateline)}</small></a>`
    }

    function drawSpaceStatData(spaceStatObj) {
        let { name, displayName, topic, post } = spaceStatObj
        displayName = displayName.substring(0, Math.min(10, displayName.length))
        let topicDrawing = drawTopicStatData(topic)
        let postDrawing = drawPostStatData(post)
        return `
            <div>
                <a href="/group/${name}" class="l">${displayName}</a>
                <span class="tip">帖子:</span>
                    ${postDrawing}
                <span class="tip">话题:</span>
                    ${topicDrawing}
            </div>
        `
    }

    function drawPostStatData(postStatObj) {
        return `
            <small class="grey">
                ${postStatObj.total}(T)
                ${postStatObj.deleted > 0 ? `/<span style="color: red;">${postStatObj.deleted}(D)</span>` : ""}
                ${postStatObj.adminDeleted > 0 ? `/<span style="color: yellowgreen;">${postStatObj.adminDeleted}(AD)</span>` : ""}
            </small>
        `
    }

    function drawTopicStatData(topicStatObj) {
        return `
            <small class="grey">
                ${topicStatObj.total}(T)
                ${topicStatObj.deleted > 0 ? `/<span style="color: red;">${topicStatObj.deleted}(D)</span>` : ""}
                ${topicStatObj.silent > 0 ? `/<span style="color: rgb(255, 145, 0);;">${topicStatObj.silent}(S)</span>` : ""}
                ${topicStatObj.closed > 0 ? `/<span style="color: rgb(164, 75, 253);">${topicStatObj.closed}(C)</span>` : ""}
                ${topicStatObj.reopen > 0 ? `/<span style="color: rgb(53, 188, 134);">${topicStatObj.reopen}(R)</span>` : ""}
            </small>
        `
    }

    function drawFaceGrid(faceMap) {
        let extracted = extractSortedListOfFace(faceMap)
        if (extracted.length == 0) {
            return `<span>N/A</span>`
        }
        let inner = ""
        for (p of extracted) {
            let faceKey = p[0]
            let faceCount = p[1]
            let facePicValue = FACE_KEY_GIF_MAPPING[faceKey]
            inner += `
                <a class="item" data-like-value="${faceKey}">
                    <span class="emoji" style="background-image: url('/img/smiles/tv/${facePicValue}.gif');"></span>
                    <span class="num">${faceCount}</span>
                </a>
            `
        }
        return `
            <div class="likes_grid">
                ${inner}
            </div>
            `
    }

    function extractSortedListOfFace(faceMap) {
        let res = [] // 2d arr
        for (key in faceMap) {
            res.push([key, faceMap[key]])
        }
        res = res.sort((a, b) => b[1] - a[1])
        return res
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
            let pid = that.attr("id").split("-")[4]
            let username = that.attr("id").split("-")[5]
            that.click(async () => {
                // alert("hi");
                if (that.attr("data-dropped") === "false") {
                    that.html("▲")
                    that.attr("data-dropped", "true")
                    if ($(`#ba-feh-wrapper-${pid}-${username}`).length > 0) {
                        $(`#ba-feh-wrapper-${pid}-${username}`).show()
                    } else {
                        let userStatObj = await getUserStatObj(username)
                        $("#likes_grid_" + pid).after(drawWrapper(username, pid, userStatObj))
                    }
                } else {
                    that.html("▼")
                    that.attr("data-dropped", "false")
                    $(`#ba-feh-wrapper-${pid}-${username}`).hide()
                }
            })

        })
    }

    async function getUserStatObj(username) {
        if (doesThisUserHasCache(username)) return getCacheByUsername(username)
        let allUsernameSet = getAllUsernameSet()
        for (un in allUsernameSet) {
            if (doesThisUserHasCache(un))
                delete allUsernameSet[un]
        }
        let usernameListToFetch = Object.keys(allUsernameSet)
        let fetched = await fetch(BA_API_URL, {
            body: JSON.stringify({ users: usernameListToFetch, type: SPACE_TYPE }),
            method: "POST"
        }).then(d => d.json())
            .catch(e => console.error("Exception when fetching data: " + e, e))
        for (u in fetched) {
            sessionStorage[`${BA_FEH_CACHE_PREFIX}${u}`] = JSON.stringify(fetched[u])
        }
        return getCacheByUsername(username)
    }


    function doesThisUserHasCache(username) {
        if (!!sessionStorage[`${BA_FEH_CACHE_PREFIX}${username}`]) {
            let statObj = JSON.parse(sessionStorage[`${BA_FEH_CACHE_PREFIX}${username}`])
            if ((new Date().valueOf()) > (statObj?._meta?.expiredAt ?? (new Date().valueOf()))) {
                return false
            }
            return true
        }
        return false
    }

    function getCacheByUsername(username) {
        return JSON.parse(sessionStorage[`${BA_FEH_CACHE_PREFIX}${username}`])
    }

    function formatDateline(dateline /* epoch seconds */) {
        let d = new Date(dateline * 1000)
        let [year, month, day] = d.toISOString().split("T")[0].split("-")
        return `${year.substring(2)}${month}${day}`
    }
    attachActionButton()
    registerOnClickEvent()

})();
