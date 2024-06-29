// ==UserScript==
// @name          Show Site-Age of User Alpha
// @author        gyakkun
// @description   How old are you?
// @license       MIT
// @version       0.0.240630
// @match        *://bangumi.tv/*
// @match        *://bgm.tv/*
// @match        *://chii.in/*
// @updateURL    https://openuserjs.org/meta/gyakkun/Show_Site-Age_of_User_Alpha.meta.js
// @downloadURL https://openuserjs.org/install/gyakkun/Show_Site-Age_of_User_Alpha.user.js
// @grant none
// ==/UserScript==

(function () {
  //'use strict';
  const VER = "240630"
  const PATH = window.location.pathname

  //URLs
  const THREAD_URL = /\/(ep|blog|subject|group|character|person|(index\/[0-9]+\/comments))/

  //Selectors
  const THREAD_AVATAR_SELECTOR = "div[id^='post_'] > a.avatar "

  //Regexes
  const USERNAME_REG = /user\/(.+)/
  const AVATAR_UID_REG = /pic\/user\/.+\/\d+\/\d+\/\d+\/(\d+)\.jpg/

  if (PATH.match(THREAD_URL) === null) return

  const UID_JOIN_DATE_MTX = [
    [1, "080618"],
    [10, "080713"],
    [100, "080731"],
    [1125, "080908"],
    [1250, "081010"],
    [1375, "081118"],
    [1425, "081214"],
    [1500, "090110"],
    [2500, "090131"],
    [2800, "090228"],
    [2950, "090417"],
    [3000, "090507"],
    [3200, "090609"],
    [3300, "090710"],
    [4200, "090802"],
    [5000, "090904"],
    [5750, "091002"],
    [6500, "091106"],
    [6825, "091201"],
    [7500, "100108"],
    [7800, "100205"],
    [8000, "100317"],
    [9000, "100420"],
    [9500, "100520"],
    [10000, "100624"],
    [10500, "100726"],
    [11000, "100820"],
    [11750, "100914"],
    [12500, "101020"],
    [13000, "101116"],
    [13500, "101210"],
    [14000, "101231"],
    [15500, "110208"],
    [16500, "110302"],
    [25000, "110404"],
    [32500, "110517"],
    [35000, "110601"],
    [40000, "110703"],
    [50000, "110816"],
    [55000, "110924"],
    [57500, "111016"],
    [60000, "111108"],
    [63750, "111214"],
    [66000, "120105"],
    [70000, "120206"],
    [72500, "120301"],
    [77500, "120417"],
    [80000, "120508"],
    [85000, "120622"],
    [90000, "120723"],
    [95000, "120821"],
    [97500, "120906"],
    [101000, "121005"],
    [105000, "121031"],
    [110000, "121207"],
    [115000, "130108"],
    [120000, "130206"],
    [127500, "130315"],
    [131000, "130406"],
    [135000, "130503"],
    [140000, "130601"],
    [150000, "130723"],
    [155000, "130814"],
    [160000, "130909"],
    [165000, "131007"],
    [170000, "131103"],
    [175000, "131201"],
    [180000, "140108"],
    [185000, "140209"],
    [190000, "140314"],
    [199000, "140428"],
    [200000, "140505"],
    [205000, "140622"],
    [207500, "140716"],
    [210000, "140809"],
    [215000, "140916"],
    [220000, "141024"],
    [222500, "141113"],
    [225000, "141205"],
    [230000, "150123"],
    [235000, "150223"],
    [237500, "150311"],
    [240000, "150406"],
    [245000, "150508"],
    [250000, "150615"],
    [255000, "150720"],
    [260000, "150821"],
    [262500, "150911"],
    [265000, "151007"],
    [267500, "151104"],
    [270000, "151201"],
    [275000, "160130"],
    [277500, "160216"],
    [280000, "160307"],
    [285000, "160421"],
    [287500, "160511"],
    [290000, "160601"],
    [295000, "160706"],
    [300000, "160809"],
    [305000, "160914"],
    [310000, "161030"],
    [307500, "161006"],
    [312500, "161127"],
    [315000, "161227"],
    [317500, "170120"],
    [320000, "170208"],
    [325000, "170322"],
    [330000, "170421"],
    [335000, "170519"],
    [340000, "170614"],
    [350000, "170727"],
    [355000, "170813"],
    [360000, "170901"],
    [370000, "171012"],
    [380000, "171121"],
    [390000, "171227"],
    [395000, "180114"],
    [400000, "180202"],
    [405000, "180220"],
    [410000, "180313"],
    [415000, "180411"],
    [420000, "180516"],
    [425000, "180624"],
    [430000, "180729"],
    [435000, "180828"],
    [437500, "180920"],
    [440000, "181007"],
    [445000, "181114"],
    [450000, "181219"],
    [455000, "190119"],
    [460000, "190216"],
    [465000, "190324"],
    [470000, "190424"],
    [475000, "190522"],
    [480000, "190619"],
    [485000, "190715"],
    [490000, "190808"],
    [500000, "190916"],
    [505000, "191011"],
    [510000, "191108"],
    [515000, "191212"],
    [520000, "200122"],
    [525000, "200217"],
    [530000, "200311"],
    [535000, "200406"],
    [540000, "200507"],
    [545000, "200615"],
    [550000, "200722"],
    [555000, "200826"],
    [557500, "200921"],
    [560000, "201018"],
    [562500, "201113"],
    [565000, "201204"],
    [570000, "210109"],
    [580000, "210224"],
    [585000, "210328"],
    [590000, "210417"],
    [600000, "210530"],
    [605000, "210618"],
    [610000, "210706"],
    [620000, "210808"],
    [630000, "210908"],
    [640000, "211026"],
    [645000, "211117"],
    [650000, "211205"],
    [660000, "220112"],
    [670000, "220214"],
    [680000, "220330"],
    [685000, "220415"],
    [690000, "220503"],
    [700000, "220610"],
    [710000, "220715"],
    [720000, "220819"],
    [730000, "220929"],
    [735000, "221018"],
    [740000, "221106"],
    [750000, "221222"],
    [760000, "230117"],
    [770000, "230214"],
    [775000, "230307"],
    [782500, "230408"],
    [788750, "230503"],
    [794375, "230601"],
    [800675, "230702"],
    [808750, "230731"],
    [816250, "230830"],
    [824375, "231001"],
    [832500, "231031"],
    [840000, "231202"],
    [846250, "231230"],
    [852500, "240123"],
    [857500, "240218"],
    [862500, "240312"],
    [868750, "240409"],
    [876250, "240511"],
    [882500, "240609"]
  ]


  const Ceiling = function (mtx, target) {
    let totalLen = mtx.length
    let lo = 0,
      hi = totalLen - 1
    while (lo < hi) {
      let mid = Math.floor(lo + (hi - lo) / 2)
      if (mtx[mid][0] >= target) {
        hi = mid
      }
      else {
        lo = mid + 1
      }
    }
    if (mtx[lo][0] < target) return -1
    return lo
  }

  const SixDigitDateStrLiteralToDate = function (sixDigitDateStrLiteral) {
    let iso8601Str = `20${sixDigitDateStrLiteral.substring(0, 2)
      }-${sixDigitDateStrLiteral.substring(2, 4)
      }-${sixDigitDateStrLiteral.substring(4)
      }T00:08:00.000Z`
    return new Date(iso8601Str)
  }

  const DateDeltaToYearMonth = function (dateDeltaMs, ceiling = false) {
    let delta = Math.max(0, dateDeltaMs)
    let roundFun = ceiling ? Math.ceil : Math.floor
    let year = roundFun(delta / 1000 / 86400 / 365)
    let month = roundFun((delta - year * 1000 * 86400 * 365) / 1000 / 86400 / 30)
    return [year, month]
  }

  const ShowUserSiteAge = function () {
    let that = $(this)
    let postJqObj = that.closest("div[id^='post_']")
    let picSpan = that.children("span")
    let userHref = that.attr("href")
    let username = (!!userHref.match(USERNAME_REG) && userHref.match(USERNAME_REG).length > 0) ? userHref.match(USERNAME_REG)[1] : ""
    let isUsernameAllDigit = username.match(/[0-9]+/)
    if (picSpan.length == 0 && !isUsernameAllDigit) return
    let uidFromUsn = parseInt(username)
    let userIdNotNumber = picSpan.attr("style")
    if (!userIdNotNumber && isNaN(uidFromUsn)) return
    let isMatch = !!userIdNotNumber.match(AVATAR_UID_REG) && userIdNotNumber.match(AVATAR_UID_REG).length > 0
    if (!isMatch && isNaN(uidFromUsn)) return
    let userId = isMatch ? Number(userIdNotNumber.match(AVATAR_UID_REG)[1]) : uidFromUsn
    let ceilingIdIdx = Ceiling(UID_JOIN_DATE_MTX, userId)
    let tip = ""
    if (ceilingIdIdx == -1) {
      let deltaMs = Date.now().valueOf() - SixDigitDateStrLiteralToDate(VER).valueOf()
      let [_, month] = DateDeltaToYearMonth(deltaMs, true)
      tip = ` (最近${Math.max(1, month)}个月加入)`
    } else {
      let closestDateLiteral = UID_JOIN_DATE_MTX[ceilingIdIdx][1]
      let theDate = SixDigitDateStrLiteralToDate(closestDateLiteral)
      let deltaMs = Date.now().valueOf() - theDate.valueOf()
      let [year, month] = DateDeltaToYearMonth(deltaMs)
      if (year == 0 && month == 0) {
        tip = " (最近1个月加入)"
      } else if (year == 0) {
        tip = " (" + month + "月前加入)"
      } else if (month == 0) {
        tip = " (" + year + "年前加入)"
      } else {
        tip = " (" + year + "年" + month + "月前加入)"
      }
    }
    // main-reply
    if (postJqObj.children("div.inner").children("span.userInfo").length > 0) {
      postJqObj.children("div.inner").children("span.userInfo").children("strong")
        .append("<span class=\"tip_j\" style=\"display: inline;\">" + tip + "</span>")
    }
    else {
      // sub-reply
      postJqObj.children("div.inner").children("strong").append("<span class=\"tip_j\" style=\"display: inline;\">" + tip + "</span>")
    }
  }

  $(THREAD_AVATAR_SELECTOR).each(ShowUserSiteAge)

})()