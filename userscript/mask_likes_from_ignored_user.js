// ==UserScript==
// @name         Mask Likes from Ignored Users
// @version      0.0.1
// @description  I don't like your likes!
// @updateURL https://openuserjs.org/meta/gyakkun/Mask_Likes_from_Ignored_Users.meta.js
// @downloadURL https://openuserjs.org/install/gyakkun/Mask_Likes_from_Ignored_Users.user.js
// @copyright gyakkun
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/(group|subject)\/topic\/*/
// @include     /^https?:\/\/(((fast\.)?bgm\.tv)|chii\.in|bangumi\.tv)\/ep\/*/
// @license MIT
// ==/UserScript==


(function () {
    document.onreadystatechange = () => {
      if (document.readyState === "complete") {
        console.log("[ba_feh]: document-complete ready state detected. Going to mask likes from ignored users.")
        maskIt()
        chiiLib.likes.updateAllGrids(data_likes_list)
      }
    }
  
    function maskIt() {
      let bakDataLikesList = JSON.parse(JSON.stringify(data_likes_list))
      let bakDataIgnoreUsers = JSON.parse(JSON.stringify(data_ignore_users))
      let ignoreUserSet = {}
      bakDataIgnoreUsers.forEach(element => {
        ignoreUserSet[element] = true
      });
      // for(let pid in bakDataLikesList){
      for (let pid in data_likes_list) {
        // let v = bakDataLikesList[pid]
        let val = data_likes_list[pid]
        if (Array.isArray(val)) {
          for (let faceObj of val) {
            let v = faceObj
            v["users"] = v["users"].filter(i => !!!ignoreUserSet[i["username"]])
            v["total"] = v["users"].length
          }
          data_likes_list[pid] = val.filter(i => i["total"] != 0)
        } else {
          for (let faceId in val) {
            let v = val[faceId]
            v["users"] = v["users"].filter(i => !!!ignoreUserSet[i["username"]])
            v["total"] = v["users"].length
            if (v["users"].length == 0) {
              delete val[faceId]
            }
          }
        }
      }
    }
  })();