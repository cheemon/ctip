﻿/*
Author: cheemon
Blog URL: http://cheemon.net
http://github.com/cheemon/ctip
*/
!function() {
    var cTip = {
        $: function () {
            var elements = new Array();
            for (var i = 0; i < arguments.length; i++) {
                var element = arguments[i];
                if (typeof element == "string")
                    element = document.getElementById(element);
                if (arguments.length == 1)
                    return element;
                elements.push(element);
            }
            return elements;
        },
        addEvent: function (el, type, handler) {
            if (el.addEventListener) {
                el.addEventListener(type, handler, false);
            } else if (el.attachEvent) {
                el.attachEvent("on" + type, handler);
            }
            else {
                el["on" + type] = handler;
            }
        },
        removeEvent: function (el, type, handler) {

            if (el.removeEventListener) {
                el.removeEventListener(type, handler, false);
            } else if (el.detachEvent) {
                el.detachEvent("on" + type);
            } else {
                el["on" + type] = null;
            }
        },
        preventDefault: function (e) {
            e = e || window.event;
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }
        },
        getPageScroll: function () {
            var xScroll;
            var yScroll;
            if (self.pageYOffset) {
                xScroll = self.pageXOffset;
                yScroll = self.pageYOffset;
            }
            else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
                xScroll = document.documentElement.scrollLeft;
                yScroll = document.documentElement.scrollTop;
            }
            else if (document.body) {// all other Explorers
                xScroll = document.body.scrollLeft;
                yScroll = document.body.scrollTop;
            }
            return [xScroll, yScroll];
        },
        getPageSize: function () {
            var xScroll, yScroll;
            if (window.innerHeight && window.scrollMaxY) {
                xScroll = document.body.scrollWidth;
                yScroll = window.innerHeight + window.scrollMaxY;
            }
            else if (document.body.scrollHeight > document.body.offsetHeight) { // all but Explorer Mac
                xScroll = document.body.scrollWidth;
                yScroll = document.body.scrollHeight;
            }
            else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
                xScroll = document.body.offsetWidth;
                yScroll = document.body.offsetHeight;
            }
            var windowWidth, windowHeight;
            if (self.innerHeight) { // all except Explorer
                windowWidth = self.innerWidth;
                windowHeight = self.innerHeight;
            }
            else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
                windowWidth = document.documentElement.clientWidth;
                windowHeight = document.documentElement.clientHeight;
            }
            else if (document.body) { // other Explorers
                windowWidth = document.body.clientWidth;
                windowHeight = document.body.clientHeight;
            }

            if (yScroll < windowHeight)
                pageHeight = windowHeight;
            else
                pageHeight = yScroll;
            if (xScroll < windowWidth)
                pageWidth = windowWidth;
            else
                pageWidth = xScroll;
            return [pageWidth, pageHeight, windowWidth, windowHeight];
        },
        getDrapMaxPos: function (el) {
            el = typeof (el) == "string" ? cTip.$(el) : el;
            var pageScroll = cTip.getPageScroll();
            var pageSize = cTip.getPageSize();
            //var x = pageSize[0] - el.offsetWidth;
            var x = document.documentElement.scrollWidth - el.offsetWidth;
            var y = pageSize[1] - el.offsetHeight;
            return [x, y];
        },
        getPos: function (el) {
            el = typeof (el) == "string" ? cTip.$(el) : el;
            if (arguments.length != 1 || el == null)
                return null;
            var offsetLeft = el.offsetLeft;
            var offsetTop = el.offsetTop;
            while (el = el.offsetParent) {
                offsetTop += el.offsetTop;
                offsetLeft += el.offsetLeft;
            }
            return [offsetLeft, offsetTop];
        },
        getWindowCenterPos: function (el) {
            el = typeof (el) == "string" ? cTip.$(el) : el;
            var pageScroll = cTip.getPageScroll();
            var pageSize = cTip.getPageSize();
            var x = (pageSize[2] - el.offsetWidth) / 2 + pageScroll[0];
            var y = (pageSize[3] - el.offsetHeight) / 2 + pageScroll[1];
            return [x, y];
        },
        setWindowCenter: function (el) {
            var pos = cTip.getWindowCenterPos(el);

            el.style.left = pos[0] + "px";
            el.style.top = pos[1] + "px";
        },
        setStyle: function (el, style) {
            el = typeof (el) == "string" ? cTip.$(el) : el;
            if (typeof el != "object" || typeof style != "object")
                return;
            for (var x in style) {

                if (x == "opacity" && cTip.browser.msie) {
                    el.style.filter = (style[x] == 1) ? "" : "alpha(opacity=" + (style[x] * 100) + ")";

                }
                el.style[x] = style[x];

            }
        }
    };

    cTip.browser = {
        version: (navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/) || [])[1],
        msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
        mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase()),
        opera: /opera/.test(navigator.userAgent.toLowerCase()),
        safari: /webkit/.test(navigator.userAgent.toLowerCase())
    }

    cTip.zIndex = 10000;
    cTip.win = function (config) {
        this.config = {
            type: 1,//对话框类型(可选参数,默认值为1) 1:提示 2:警告 3:正确或成功 4:错误 5:问号 6:tip 7：用于特殊要求，有三个按钮的。
            width: 320, //对话框宽度(可选参数)
            height: "",//(可选参数,默认是根据里面内容自动增长高度)
            title: "提示",
            msg: "",
            fade: 1000,
            timeout: 2000,
            isOverlay: true,//显示遮罩层(可选参数,默认为true)
            closeBtn: true,//是否显示取消按钮
            confirmEventBtn: true,//是否显示确定按钮
            confirmBtnTitle: "确认",
            confirmBtnTitle1: "确认",
            closeEvent: null,  // type设为5时,取消按钮的回调函数(可选参数)
            confirmEvent: null, //type设为5时,确定按钮的回调函数(可选参数),
            confirmEvent1: null//用于type=7时，三个按钮

        };
        for (var par in config) {
            if (config[par] != "undefined" && config[par] != undefined) {
                this.config[par] = config[par];
            }
        }
        this.show();
    };

    cTip.win.prototype = {
        show: function () {
            var config = this.config,
                oThis = this;
            var win = document.createElement("div");
            window.win = win;
            if (config.isOverlay) {
                this.overlay = new cTip.overlay();
                win.className = "dialog-shadow";
            }

            cTip.setStyle(win, {
                width: config.width + "px",

                position: "absolute",

                zIndex: cTip.zIndex++

            });
            if (config.height != "") {
                win.style.height = config.height + "px";
            }
            var topDiv = document.createElement("div");
            topDiv.innerHTML = config.title;
            topDiv.className = "tip_top";
            var sp_close = document.createElement("span");
            sp_close.className = "sp_close";
            sp_close.innerHTML = "×";
            topDiv.innerHTML = "<span>" + config.title + "</span>";
            topDiv.appendChild(sp_close);
            sp_close.onclick = function () {
                oThis.close();

            };
            var midDiv = document.createElement("div");
            midDiv.className = "tip_mid";

            midDiv.innerHTML = "<span>" + config.msg + "</span>";

            var bottomDiv = document.createElement("div");

            bottomDiv.className = "tip_bottom";
            if (config.type == 5 || config.type == 7 || (config.type == 0 && config.closeBtn)) {
                var winBtnOk = document.createElement("span");
                if (config.type == 7) {
                    winBtnOk.className = "btn_ok btn";
                } else {
                    winBtnOk.className = "btn_ok";
                }

                winBtnOk.innerHTML = config.confirmBtnTitle;

                winBtnOk.onclick = function () {
                    oThis.close();
                    if (config.confirmEvent != null) {
                        config.confirmEvent();
                    }
                }
                bottomDiv.appendChild(winBtnOk);

            }
            //用于特殊要求，有三个按钮的
            if (config.type == 7) {

                var winBtnOk1 = document.createElement("span");
                winBtnOk1.className = "btn_ok btn";
                winBtnOk1.innerHTML = config.confirmBtnTitle1;
                winBtnOk1.onclick = function () {
                    oThis.close();
                    if (config.confirmEvent1 != null) {
                        config.confirmEvent1();
                    }
                };
                cTip.setStyle(winBtnOk1, {
                    "margin-left": "24px"

                });
                bottomDiv.appendChild(winBtnOk1);
            }
            if (config.closeBtn) {
                var winBtnCancel = document.createElement("span");
                winBtnCancel.className = "btn_cancel";
                if (config.type == 5 || config.type == 0 || config.type == 7) {
                    winBtnCancel.innerHTML = "取消";
                } else {
                    winBtnCancel.innerHTML = "确定";
                }
                if (config.type != 5) {

                    if (config.type != 7) {
                        cTip.setStyle(winBtnCancel, {
                            "margin-right": "100px"

                        });
                    } else {
                        winBtnCancel.className = "btn_cancel btn";

                    }
                }
                winBtnCancel.onclick = function () {
                    oThis.close();
                    if (config.closeEvent != null) {
                        config.closeEvent();
                    }
                };

                bottomDiv.appendChild(winBtnCancel);
            }

            win.appendChild(topDiv);
            win.appendChild(midDiv);
            win.appendChild(bottomDiv);

            document.getElementsByTagName("body")[0].appendChild(win);
            cTip.setWindowCenter(win);

            addEvent(window, "resize", this.changeSize);
            this.disableScroll();


        },
        changeSize: function () {
            cTip.setWindowCenter(win);
        },
        close: function () {
            var win = window.win;
            var config = this.config;
            win.parentNode.removeChild(win);
            cTip.removeEvent(window, "resize", this.changeSize);
            this.enableScroll();
            if (config.isOverlay)
                this.overlay.close();
        },
        disableScroll: function () {
            addEvent(window, "DOMMouseScroll", this.wheel);


        },
        wheel: function (e) {
            cTip.preventDefault(e);
        },
        enableScroll: function () {
            cTip.removeEvent(window, "DOMMouseScroll", this.wheel);
            document.onkeydown = null;
        }
    };

    /****************************************
     Description:
     页面遮罩层
     1.可以通过new来创建多个遮罩层
     2.当页面大小改变或滚动时,遮罩层会自动调整为网页的高度
     Example:
     var obj = new cTip.overlay();//显示
     obj.close();//关闭(从页面中移出)

     ****************************************/
    cTip.overlay = function () {

        var overlay = document.createElement("div");

        cTip.setStyle(overlay, {
            width: "100%",
            height: cTip.getPageSize()[1] + "px",
            position: "absolute",
            left: "0",
            top: "0",
            zIndex: cTip.zIndex++,
            background: "#000",
            opacity: 0.2
        });
        this.changeSize = function () {

            overlay.style.height = cTip.getPageSize()[1] + "px";
        }
        this.show = function () {
            document.getElementsByTagName("body")[0].appendChild(overlay);
            addEvent(window, "resize", this.changeSize);
            addEvent(window, "scroll", this.changeSize);

        }
        this.close = function () {
            if (overlay)
                overlay.parentNode.removeChild(overlay);
            cTip.removeEvent(window, "resize", this.changeSize);
            cTip.removeEvent(window, "scroll", this.changeSize);

            overlay = null;
            if (cTip.browser.msie)
                CollectGarbage();
        }
        this.show();
    }

    var addEvent = addEvent || cTip.addEvent,
        $ = $ || cTip.$;
    var layer = {
        alert: function (msg, btnTitle) {
            new cTip.win({
                type: 5,
                msg: msg,
                confirmBtnTitle: btnTitle
            });
        },
        error: function (msg) {
            new cTip.win({
                type: 4,
                msg: msg
            });
        },
        warn: function (msg) {
            new cTip.win({
                type: 2,
                msg: msg
            });
        },
        success: function (msg) {
            new cTip.win({
                type: 3,
                msg: msg
            });
        },
        question: function (msg, confirmEvent, cancelEvent, btnTitle) {

            new cTip.win({
                type: 5,
                msg: msg,
                confirmBtnTitle: btnTitle,
                confirmEvent: confirmEvent,
                closeEvent: cancelEvent
            });
        },
        html: function (title, html) {
            new cTip.win({
                width: 500,
                title: title,
                type: 0,
                msg: html,
                closeBtn: false,
                confirmBtn: false
            });
        },
        doubleQuestion: function (msg, btnTitle1, btnTitle2, confirmEvent, confirmEvent1, cancelEvent) {
            new cTip.win({
                type: 7,
                msg: msg,
                confirmBtnTitle: btnTitle1,
                confirmBtnTitle1: btnTitle2,
                confirmEvent: confirmEvent,
                confirmEvent1: confirmEvent1,
                closeEvent: cancelEvent
            });
        }

    };
    window["layer"]=layer;
}();
 
 