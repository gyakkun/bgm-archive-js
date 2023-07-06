// ==UserScript==
// @name          Show History Link in Group and Subject Topic Alpha
// @author        gyakkun
// @description   You wrote the history!
// @license       MIT
// @version       0.0.6
// @match        *://bangumi.tv/*
// @match        *://bgm.tv/*
// @match        *://chii.in/*
// @match        *://fast.bgm.tv/*
// @updateURL https://openuserjs.org/meta/gyakkun/Show_History_Link_in_Group_and_Subject_Topic_Alpha.meta.js
// @downloadURL https://openuserjs.org/install/gyakkun/Show_History_Link_in_Group_and_Subject_Topic_Alpha.user.js
// @grant none
// ==/UserScript==

(function () {
    if (window.location.pathname.match(/group\/topic\/\d+$/) != null) {
        let gtid = window.location.pathname.match(/group\/topic\/(\d+)$/)[1]
        $("#columnInSubjectB > div > a").last().after("<br/><a href=\"https://bgm.nyamori.moe/history/group/" + gtid + "/link\" class=\"l\">/ 历史</a>")
        $("#colunmNotice > div > p.tip_j > a:nth-child(2)").after(` 或 <a href="https://bgm.nyamori.moe/history/group/${gtid}/link" class="l">查看历史</a>`)
        return
    }

    if (window.location.pathname.match(/subject\/topic\/\d+$/) != null) {
        let stid = window.location.pathname.match(/subject\/topic\/(\d+)$/)[1]
        $("#subject_inner_info > div > ul > li").last("a").after("<li><a href=\"https://bgm.nyamori.moe/history/subject/" + stid + "/link\" class=\"l\">/ 历史</a></li>")
        $("#colunmNotice > div > p.tip_j > a:nth-child(2)").after(` 或 <a href="https://bgm.nyamori.moe/history/subject/${stid}/link" class="l">查看历史</a>`)
        return
    }

    if (window.location.pathname.match(/blog\/\d+$/) != null) {
        let bid = window.location.pathname.match(/blog\/(\d+)$/)[1]
        $("#columnB").append("<div class=\"menu_inner\"><a href=\"https://bgm.nyamori.moe/history/blog/" + bid + "/link\" class=\"l\">/ 历史</a></div>")
        $("#colunmNotice > div > p.tip_j > a:nth-child(2)").after(` 或 <a href="https://bgm.nyamori.moe/history/blog/${bid}/link" class="l">查看历史</a>`)
        return
    }

    if (window.location.pathname.match(/ep\/\d+$/) != null) {
        let epid = window.location.pathname.match(/ep\/(\d+)$/)[1]
        $("#subject_inner_info > div > ul > li").last().find("a").after("<br/><a href=\"https://bgm.nyamori.moe/history/ep/" + epid + "/link\" class=\"l\">/ 历史</a>")
        return
    }

    if (window.location.pathname.match(/person\/\d+$/) != null) {
        let peid = window.location.pathname.match(/person\/(\d+)$/)[1]
        $("#columnCrtA > div.infobox").last().after(`
            <br/>
            <div id="ba-history-person" class="SimpleSidePanel">
                <h2>页面历史</h2>
                <span class="tip_i">
                / <a href="https://bgm.nyamori.moe/history/person/${peid}/link" class="l">历史</a>
            </div>
        `)
        return
    }

    if (window.location.pathname.match(/character\/\d+$/) != null) {
        let chid = window.location.pathname.match(/character\/(\d+)$/)[1]
        $("#columnCrtA > div.infobox").last().after(`
            <br/>
            <div id="ba-history-person" class="SimpleSidePanel">
                <h2>页面历史</h2>
                <span class="tip_i">
                / <a href="https://bgm.nyamori.moe/history/character/${chid}/link" class="l">历史</a>
            </div>
        `)
        return
    }
})()
