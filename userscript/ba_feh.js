// ==UserScript==
// @name         Bangumi Forum Enhance Alpha
// @version      0.0.19
// @description  I know your (black) history!
// @updateURL https://openuserjs.org/meta/gyakkun/Bangumi_Forum_Enhance_Alpha.meta.js
// @downloadURL https://openuserjs.org/install/gyakkun/Bangumi_Forum_Enhance_Alpha.user.js
// @copyright gyakkun
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/(group|subject)\/topic\/*/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/(ep|person|character|blog)\/*/
// @license MIT
// ==/UserScript==

(function () {
    const INDEXED_DB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
    const SPACE_TYPE = document.location.pathname.split("/")[1]
    const BA_FEH_API_URL = "https://bgm.nyamori.moe/forum-enhance/query"
    const BA_FEH_CACHE_PREFIX = "ba_feh_" + SPACE_TYPE + "_" // + username
    const FACE_KEY_GIF_MAPPING = {
        "0": "44",
        "140": "101",
        "80": "41",
        "54": "15",
        "85": "46",
        "104": "65",
        "88": "49",
        "62": "23",
        "79": "40",
        "53": "14",
        "122": "83",
        "92": "53",
        "118": "79",
        "141": "102",
        "90": "51",
        "76": "37",
        "60": "21",
        "128": "89",
        "47": "08",
        "68": "29",
        "137": "98",
        "132": "93"
    }
    const SPACE_ACTION_BUTTON_WORDING = {
        "group": "小组讨论统计",
        "subject": "条目讨论统计",
        "ep": "章节讨论统计",
        "character": "角色讨论统计",
        "person": "人物讨论统计",
        "blog": "日志发言统计"
    };
    const SPACE_TOPIC_URL = {
        "group": "group/topic",
        "subject": "subject/topic",
        "ep": "ep",
        "character": "character",
        "person": "person",
        "blog": "blog"
    };
    const SHOULD_DRAW_TOPIC_STAT = SPACE_TYPE === 'blog' || SPACE_TOPIC_URL[SPACE_TYPE].endsWith("topic")
    const SHOULD_DRAW_LIKES_STAT = SPACE_TYPE !== 'blog' && SPACE_TYPE.length % 3 != 0

    attachActionButton()
    registerOnClickEvent()
    addStyleForTopPost()
    purgeCache()

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
        if (SPACE_TYPE === 'blog') set[getBlogAuthorUsername()] = null
        return set
    }

    function drawWrapper(username, postId, userStatObj) {
        return `
            <div id="ba-feh-wrapper-${postId}-${username}" class="subject_tag_section" style="margin: 1em;">
                <div>
                    <div id="ba-feh-post-stat-${postId}-${username}">
                        <span class="tip">帖子统计:</span>
                        ${drawPostStatData(userStatObj.postStat)}
                    </div>
                    ${SHOULD_DRAW_TOPIC_STAT ? `
                        <div id="ba-feh-topic-stat-${postId}-${username}">
                            <span class="tip">主题统计:</span>
                            ${drawTopicStatData(userStatObj.topicStat)}
                        </div>
                    ` : ""}
                    ${SHOULD_DRAW_LIKES_STAT ? `
                        <div id="ba-feh-like-stat-${postId}-${username}">
                            <span class="tip">收到贴贴:</span>
                            ${drawFaceGrid(userStatObj.likeStat)}
                        </div>
                        <div id="ba-feh-like-rev-stat-${postId}-${username}">
                            <span class="tip">送出贴贴:</span>
                            ${drawFaceGrid(userStatObj.likeRevStat)}
                        </div>
                    ` : ""}
                    <div id="ba-feh-space-stat-${postId}-${username}">
                        <span class="tip">空间统计:</span>
                        ${drawSpaceStatSection(userStatObj.spaceStat)}
                    </div>
                    <div id="ba-feh-recent-activities-${postId}-${username}">
                        ${SHOULD_DRAW_TOPIC_STAT ? `
                            <span class="tip">最近发表:</span>
                            ${drawRecentTopicSection(userStatObj.recentActivities.topic)}
                            <br/>
                        ` : ""}
                        <span class="tip">最近回复:</span>
                        ${drawRecentPostSection(userStatObj.recentActivities.post)}
                        ${SHOULD_DRAW_LIKES_STAT ? `
                            <br/>
                            <span class="tip">最近送出贴贴:</span>
                            ${drawRecentLikeRevSection(userStatObj.recentActivities.likeRev)}
                        ` : ""}
                    </div>
                </div>
            </div>
        `
    }

    function drawActionButton(username, postId) {
        return `
        <div class="action">
            <a href="javascript:void(0);" class="icon" title="${SPACE_ACTION_BUTTON_WORDING[SPACE_TYPE]}">
                <span data-dropped="false" class="ico" id="ba-feh-action-btn-${postId}-${username}" style="text-indent: 0px">▼</span><span class="title">${SPACE_ACTION_BUTTON_WORDING[SPACE_TYPE]}</span>
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

    function drawRecentLikeRevSection(recentLikeRevObjList) {
        if (recentLikeRevObjList.length == 0) {
            return `<span>N/A</span>`
        }
        let inner = ""
        for (t of recentLikeRevObjList) {
            inner += drawRecentLikeRev(t)
        }
        return `
            <div class="subject_tag_section">
                ${inner}
            </div>
        `
    }

    function drawRecentPost(postBriefObj) {
        return `<a class="l inner" target="_blank"
                 rel="nofollow external noopener noreferrer"
                 href="/${SPACE_TOPIC_URL[SPACE_TYPE]}/${postBriefObj.mid}#post_${postBriefObj.pid}"
                 title="${postBriefObj.spaceDisplayName || ""}"
        >
        ${postBriefObj.title} <small class="grey">${formatDateline(postBriefObj.dateline)}</small></a>`
    }

    function drawRecentTopic(topicBriefObj) {
        return `<a class="l inner" target="_blank"
                 rel="nofollow external noopener noreferrer"
                 href="/${SPACE_TOPIC_URL[SPACE_TYPE]}/${topicBriefObj.id}"
                 title="${topicBriefObj.spaceDisplayName || ""}"
        >
        ${topicBriefObj.title} <small class="grey">${formatDateline(topicBriefObj.dateline)}</small></a>`
    }

    function drawRecentLikeRev(likeRevBrief) {
        let likeRevObjListHtml = ""
        for (l of likeRevBrief.likeRevList) {
            likeRevObjListHtml += `
                <a target="_blank" rel="nofollow external noopener noreferrer"
                   href="/${SPACE_TOPIC_URL[SPACE_TYPE]}/${likeRevBrief.mid}#post_${l.pid}">
                    <img style="width: 18px;height: 18px;" src="/img/smiles/tv/${FACE_KEY_GIF_MAPPING[l.faceKey]}.gif"></img>
                </a>
            `
        }
        return `<p><a class="l inner" target="_blank" rel="nofollow external noopener noreferrer"
                        href="/${SPACE_TOPIC_URL[SPACE_TYPE]}/${likeRevBrief.mid}"
                        title="${likeRevBrief.spaceDisplayName || ""}"
                        >
                        ${likeRevBrief.title}
                        <small class="grey">
                        ${formatDateline(likeRevBrief.dateline)}
                        </small>
                </a><small class="grey">:</small>${likeRevObjListHtml}</p>`
    }

    function drawSpaceStatData(spaceStatObj) {
        let { name, displayName, topic, post, like, likeRev } = spaceStatObj
        let isNameTooLong = displayName.length > 10
        displayName = displayName.substring(0, Math.min(10, displayName.length))
        if (isNameTooLong) displayName += "..."
        let topicDrawing = drawTopicStatData(topic)
        let postDrawing = drawPostStatData(post)
        let likeRevDrawing = drawLikeStatData(likeRev)
        let likeDrawing = drawLikeStatData(like)
        let spacePath = ""
        switch (SPACE_TYPE) {
            case "blog": spacePath = "user"; break
            case "ep": spacePath = "subject"; break
            default: spacePath = SPACE_TYPE
        }
        return `
            <div>
                <a href="/${spacePath}/${name}" class="l" target="_blank" rel="nofollow external noopener noreferrer">${displayName}</a>
                <span class="tip">帖子:</span>
                    ${postDrawing}
                ${SHOULD_DRAW_TOPIC_STAT ? `
                    <span class="tip">主题:</span>
                    ${topicDrawing}
                ` : ""}
                ${SHOULD_DRAW_LIKES_STAT ? `
                    <span class="tip">送出贴贴:</span>
                    ${likeRevDrawing}
                    <span class="tip">收到贴贴:</span>
                    ${likeDrawing}
                ` : ""}
            </div>
        `
    }

    function drawPostStatData(postStatObj) {
        return `
            <small class="grey">
                ${postStatObj.total}(T)
                ${postStatObj.deleted > 0 ? `/<span style="color: red;">${postStatObj.deleted}(D)</span>` : ""}
                ${postStatObj.adminDeleted > 0 ? `/<span style="color: yellowgreen;">${postStatObj.adminDeleted}(AD)</span>` : ""}
                ${postStatObj.violative > 0 ? `/<span style="color: rgb(50, 255, 245);">${postStatObj.violative}(V)</span>` : ""}
                ${postStatObj.collapsed > 0 ? `/<span style="color: rgb(89, 116, 252);">${postStatObj.collapsed}(F)</span>` : ""}
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

    function drawLikeStatData(likeStatForSpaceObj) {
        return `
            <small class="grey">
                ${likeStatForSpaceObj.total}(T)
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
            <div class="likes_grid" style="float: none;">
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
        console.debug(`[BA_FEH] attaching action button`)
        getPostDivList().each(function () {
            let { username, postId } = getUsernameAndPidOfPostDiv($(this))
            $(this).find("div.post_actions.re_info > div:nth-child(1)").first().after(
                drawActionButton(username, postId)
            )
        })
        if (SPACE_TYPE === 'blog') {
            let username = getBlogAuthorUsername()
            let postId = "n" + window.location.pathname.split("/")[2]
            let reInfoSmallSelector = "#columnA > div.re_info > small"
            let topReInfoSelector = "#columnA > div.re_info"
            $(topReInfoSelector).addClass("post_actions")
            $(reInfoSmallSelector).after(drawActionButton(username, postId))
        }
    }

    function getBlogAuthorUsername() {
        let authorAvatarSelecter = "#pageHeader > h1 > span > a.avatar.l"
        let username = $(authorAvatarSelecter).attr("href").split("/")[2]
        return username
    }

    function registerOnClickEvent() {
        $("span[id^='ba-feh-action-btn-'").each(function () {
            let that = $(this)
            let pid = that.attr("id").split("-")[4]
            let username = that.attr("id").split("-")[5]
            that.click(async () => {
                if (that.attr("data-dropped") === "false") {
                    that.html("*")
                    if ($(`#ba-feh-wrapper-${pid}-${username}`).length > 0) {
                        $(`#ba-feh-wrapper-${pid}-${username}`).show()
                    } else {
                        let userStatObj = await getUserStatObj(username)
                        let baFehWrapper = drawWrapper(username, pid, userStatObj)
                        if ($("#likes_grid_" + pid).length > 0) {
                            $("#likes_grid_" + pid).after(baFehWrapper)
                        } else if ($(`#post_${pid} > div.inner > div > div.message`).length > 0) {
                            $(`#post_${pid} > div.inner > div > div.message`).append(baFehWrapper)
                        } else if ($(`#post_${pid} > div.inner > div.cmt_sub_content`).length > 0) {
                            $(`#post_${pid} > div.inner > div.cmt_sub_content`).after(baFehWrapper)
                        } else if (SPACE_TYPE === 'blog' && pid.startsWith("n")) {
                            $("#viewEntry").after(baFehWrapper)
                        } else {
                            console.error(`[BA_FEH] No element to mount ba_feh wrapper for postId-${pid}!`)
                        }
                    }
                    that.html("▲")
                    that.attr("data-dropped", "true")
                } else {
                    that.html("▼")
                    that.attr("data-dropped", "false")
                    $(`#ba-feh-wrapper-${pid}-${username}`).hide()
                }
            })
        })
    }

    async function getUserStatObj(username) {
        if (await areYouCached(username)) {
            return (await getCacheByUsername(username))
        }
        let allUsernameSet = getAllUsernameSet()
        for (un in allUsernameSet) {
            if (await areYouCached(un))
                delete allUsernameSet[un]
        }
        let usernameListToFetch = Object.keys(allUsernameSet)
        console.debug(`[BA_FEH] Fetching: ${JSON.stringify(usernameListToFetch)}`)
        let fetched = await fetch(BA_FEH_API_URL, {
            body: JSON.stringify({ users: usernameListToFetch, type: SPACE_TYPE }),
            method: "POST"
        }).then(d => d.json())
            .catch(e => console.error("[BA_FEH] Exception when fetching data: " + e, e))
        for (u in fetched) {
            await storeInCache(u, fetched[u])
        }
        return await getCacheByUsername(username)
    }

    async function storeInCache(username, userStatObj) {
        let ck = `${BA_FEH_CACHE_PREFIX}${username}`
        if (!!INDEXED_DB) {
            await getIndexedDBManager().setItem(ck, userStatObj)
        } else {
            sessionStorage[ck] = JSON.stringify(userStatObj)
        }
    }

    async function areYouCached(username) {
        let ck = `${BA_FEH_CACHE_PREFIX}${username}`
        if (!!INDEXED_DB) {
            let statObj = (await getIndexedDBManager().getItem(ck))
            if (!!!statObj) return false
            return !isUserStatCacheExpired(statObj)
        } else if (!!sessionStorage[ck]) {
            let statObj = JSON.parse(sessionStorage[ck])
            return !isUserStatCacheExpired(statObj)
        }
        return false
    }

    function isUserStatCacheExpired(userStatObj) {
        if ((new Date().valueOf()) > (userStatObj?._meta?.expiredAt ?? (new Date().valueOf()))) {
            return true
        }
        return false
    }

    async function getCacheByUsername(username) {
        let ck = `${BA_FEH_CACHE_PREFIX}${username}`
        if (!!INDEXED_DB) {
            return (await getIndexedDBManager().getItem(ck))
        }
        return JSON.parse(sessionStorage[ck])
    }

    function formatDateline(dateline /* epoch seconds */) {
        let msWithOffset = 1000 * (dateline - new Date().getTimezoneOffset(/* minutes */) * 60)
        let d = new Date(msWithOffset)
        let [year, month, day] = d.toISOString().split("T")[0].split("-")
        return `${year.substring(2)}${month}${day}`
    }

    // Thank you https://juejin.cn/post/7228480373306818619
    function getIndexedDBManager() {
        const DATA_BASE_NAME = 'BA_FEH'
        const TABLE_NAME = 'CACHE'
        const UNIQ_KEY = 'BA_FEH_CACHE_KEY'

        let dataBase = null
        function getDataBase() {
            if (dataBase) {
                return dataBase
            }
            return new Promise(resolve => {
                const request = indexedDB.open(DATA_BASE_NAME)
                request.onupgradeneeded = e => {
                    const db = e.target.result
                    if (!db.objectStoreNames.contains(TABLE_NAME)) {
                        db.createObjectStore(TABLE_NAME, { keyPath: UNIQ_KEY })
                    }
                }
                request.onsuccess = e => {
                    const db = e.target.result
                    dataBase = db
                    resolve(db)
                }
            })
        }
        return {
            async setItem(key, value) {
                const dataBase = await getDataBase()
                return new Promise(resolve => {
                    const request = dataBase.transaction(TABLE_NAME, 'readwrite')
                        .objectStore(TABLE_NAME)
                        .put({ data: value, [UNIQ_KEY]: key })
                    request.onsuccess = resolve('success')
                })
            },
            async getItem(key) {
                const dataBase = await getDataBase()
                return new Promise(resolve => {
                    const request = dataBase.transaction(TABLE_NAME)
                        .objectStore(TABLE_NAME)
                        .get(key)
                    request.onsuccess = () => {
                        resolve(request.result?.data)
                    }
                })
            },
            async deleteItem(key) {
                const dataBase = await getDataBase()
                return new Promise(resolve => {
                    const request = dataBase.transaction(TABLE_NAME, 'readwrite')
                        .objectStore(TABLE_NAME)
                        .delete(key)
                    request.onsuccess = () => {
                        resolve(request.result === undefined)
                    }
                })
            },
            async keys() {
                const keys = {} // use as set
                const dataBase = await getDataBase()
                return new Promise(resolve => {
                    const request = dataBase.transaction(TABLE_NAME)
                        .objectStore(TABLE_NAME)
                        .openCursor()

                    request.onsuccess = () => {
                        const cursor = request.result;
                        if (cursor) {
                            cursor.continue()
                            keys[cursor.value[UNIQ_KEY]] = true
                        } else {
                            resolve(keys)
                        }
                    }
                })
            }
        }
    }

    async function purgeCache() {
        if (!INDEXED_DB) return
        let timing = new Date().valueOf()
        let dbMgr = getIndexedDBManager()
        let keys = await dbMgr.keys()
        let ctr = 0
        let deleted = []

        console.debug("[BA_FEH] Keys before purging cache: " + JSON.stringify(Object.keys(keys)))

        for (k in keys) {
            let statObj = await dbMgr.getItem(k)
            if (!statObj) continue
            if (isUserStatCacheExpired(statObj)) {
                await dbMgr.deleteItem(k)
                ctr++
                deleted.push(k)
            }
        }
        timing = (new Date().valueOf()) - timing
        console.debug(`[BA_FEH] The following expired cache keys has been removed in db: ${JSON.stringify(deleted)}`)
        console.log(`[BA_FEH] Timing for purging cache: ${timing}ms. ${ctr} rows deleted`)
    }

    function addStyleForTopPost() {
        let topPostStyle = document.createElement('style');
        topPostStyle.innerHTML = `
            .postTopic div[id^='ba-feh-wrapper-'] {
                float: right;
            }
        `
        document.head.appendChild(topPostStyle);
    }
})();