"use strict";

// 화면 가로,세로 기본값
var stdWidth = 2000;
var stdHeight = 1200;

var thisfilefullname = document.URL.substring(document.URL.lastIndexOf("/") + 1, document.URL.length);
thisfilefullname = thisfilefullname.replace(".html", "");

$(document).ready(function () {
  $("body").addClass("on");
  PageEvent.init();
  PageEvent.setHeader();

  // 다시하기
  $(".btn_retry").click(function () {
    location.reload();
  });
});

window.ContentHandler = {
  onSaveContentDataResult: function (type, data) {
    // alert(data);
  },
};

var PageEvent = {
  init: function () {
    //스케일 설정되는 영역의 기본 가로,세로 설정
    $(".container").css("width", stdWidth + "px");
    $(".container").css("height", stdHeight + "px");

    PageEvent.setPageScale();

    if (window.innerWidth <= 1920) {
      $("#wrap").addClass("wrap_sm");
    }

    $(".pop_area").load("../common/template/popup.html", function () {
      /**
       * 팝업 Control
       */
      // 다시 풀기
      $(".pop_incorrect .btn_replay").click(function () {
        location.reload();
      });

      // 다음문제
      $(".pop_incorrect .btn_next").click(function () {
        if (nextPage === "#") {
          $(".pop_incorrect").fadeOut();
          $(".pop_last").fadeIn();
        } else {
          window.location.href = nextPage;
        }
      });

      // 마지막 문제
      $(".pop_last .btn_ok").click(function () {
        $(".pop_last").fadeOut();
        $(".pop_finish").fadeIn();
      });

      // 그만하기
      $(".preelem-exit").click(function () {
        PreelemBridge.quit();
      });
    });
  },

  /**
   * 컨텐츠영역 스케일 조절
   */
  setPageScale: function () {
    var windowH = $(window).height();
    var contentH = stdHeight;
    var scale;
    scale = windowH / contentH;
    $("meta[name=viewport]").attr("content", "width=device-width, user-scalable=no, initial-scale=" + scale + ", maximum-scale=" + scale + ", minimum-scale=" + scale);
  },

  setHeader: function () {
    $(".header .cnt .current").text(pageInfo[thisfilefullname].id);
    $(".header .topic").text(pageInfo["topic"]);
    var quizLevel = pageInfo["level"];
    $(".header").addClass("lv" + quizLevel);
    switch (quizLevel) {
      case 1:
        $(".header .level").text("LEVEL1. 봄");
        break;
      case 2:
        $(".header .level").text("LEVEL2. 여름");
        break;
      case 3:
        $(".header .level").text("LEVEL3. 가을");
        break;
      case 4:
        $(".header .level").text("LEVEL4. 겨울");
        break;
    }
  },

  /**
   * 팝업
   */
  openPop: function (name) {
    $(".pop_bg").fadeIn();
    $(".pop_ct.pop_" + name).fadeIn();
  },
  closePop: function (name) {
    $(".pop_bg").fadeOut();
    $(".pop_ct.pop_" + name).fadeOut();
    Quiz.block(false);
  },
};
