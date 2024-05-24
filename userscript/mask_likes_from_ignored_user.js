// ==UserScript==
// @name         Mask Likes from Ignored Users
// @version      0.0.5
// @description  I don't like your likes!
// @updateURL https://openuserjs.org/meta/gyakkun/Mask_Likes_from_Ignored_Users.meta.js
// @downloadURL https://openuserjs.org/install/gyakkun/Mask_Likes_from_Ignored_Users.user.js
// @copyright gyakkun
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/(group|subject)\/topic\/*/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/ep\/*/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/subject\/[0-9]+/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/subject\/[0-9]+\/comments/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)(\/?)/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/timeline/
// @license MIT
// ==/UserScript==


(function () {
    // The whole document
    document.addEventListener("readystatechange", (event) => {
        if (document.readyState === "complete") {
            if (typeof data_likes_list === 'undefined') return
            console.debug("[mlfiu] document-complete ready state detected. Going to mask likes from ignored users.")
            maskIt()
            chiiLib.likes.init()
        }
    });

    // Homepage timeline 
    const tmlContent = document.getElementById("tmlContent");
    const tmlCb = function (mutationsList, observer) {
        if (typeof data_likes_list === 'undefined') return
        console.debug("[mlfiu] Timeline reload detected. Going to mask likes from ignored users.")
        maskIt()
        chiiLib.likes.init()
    };
    const tmlObserver = new MutationObserver(tmlCb);
    tmlObserver.observe(tmlContent, { childList: true });

    function maskIt() {
        let origDataIgnoreUsers = JSON.parse(JSON.stringify(data_ignore_users))
        let ignoreUserSet = {}
        origDataIgnoreUsers.forEach(element => {
            ignoreUserSet[element] = true
        });
        let ctr = 0
        for (let pid in data_likes_list) {
            let val = data_likes_list[pid]
            if (Array.isArray(val)) {
                for (let faceObj of val) {
                    let v = faceObj
                    v["users"] = v["users"].filter(i => {
                        let res = !!!ignoreUserSet[i["username"]]
                        if (!res) ctr++
                        return res
                    })
                    v["total"] = v["users"].length
                }
                data_likes_list[pid] = val.filter(i => i["total"] != 0)
            } else {
                for (let faceId in val) {
                    let v = val[faceId]
                    v["users"] = v["users"].filter(i => {
                        let res = !!!ignoreUserSet[i["username"]]
                        if (!res) ctr++
                        return res
                    })
                    v["total"] = v["users"].length
                    if (v["users"].length == 0) {
                        delete val[faceId]
                    }
                }
            }
        }
        console.debug(`[mlfiu] ${ctr} likes being masked `)
    }
})();