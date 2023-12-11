"use strict";
var correctAudio = new Audio("../common/sound/correct.wav");
var incorrectAudio = new Audio("../common/sound/incorrect.wav");
var clickAudio = new Audio("../common/sound/click.wav");
var dropAudio = new Audio("../common/sound/drop.mp3");

var Quiz = {
  block: function (bool) {
    if (bool) {
      $("body").addClass("block");
    } else {
      $("body").removeClass("block");
    }
  },
  saveData: function (ans) {
    // correctScore : 정답 1, 오답 0
    // topicNum : 토픽 고유번호
    // levelNum : 레벨 번호
    // questionNum : 문제 번호
    var data = {
      sajasuhak_odyssey: {
        correctScore: ans,
        topicNum: pageInfo.topicNum,
        levelNum: pageInfo.level,
        questionNum: pageInfo[thisfilefullname].id,
      },
    };
    var strData = JSON.stringify(data);

    try {
      PreelemBridge.saveContentData("saveCompleteList", btoa(strData));
    } catch (error) {
      console.log(strData);
    }
  },
  correctQuiz: function () {
    Quiz.block(true);
    setTimeout(function () {
      PageEvent.openPop("correct");
      correctAudio.play();
      setTimeout(function () {
        Quiz.saveData(1);
        if (nextPage === "#") {
          $(".pop_correct").fadeOut();
          $(".pop_finish").fadeIn();
        } else {
          window.location.href = nextPage;
        }
      }, 2000);
    }, 1000);
  },
  incorrectQuiz: function () {
    Quiz.block(true);
    setTimeout(function () {
      Quiz.saveData(0);
      PageEvent.openPop("incorrect");
      incorrectAudio.play();
    }, 1000);
  },
  /*
   * ***** 퀴즈타입 : 클릭하기 *****
   * */
  clickQuiz: function () {
    // 정답 요소 클릭 시
    $(".answer_wrap .item").click(function () {
      try {
        PreelemBridge.stopAudio(1);
        PreelemBridge.playAudio("common/sound/click.wav", 1);
      } catch (error) {
        clickAudio.pause();
        clickAudio.currentTime = 0;
        clickAudio.play();
      }

      if ($(this).parents(".answer_wrap").hasClass("group")) {
        $(this).parents(".item_wrap").find(".item").removeClass("on");
        $(this).addClass("on");
      } else if ($(this).parents(".answer_wrap").hasClass("multi")) {
        $(this).toggleClass("on");
      } else {
        $(".answer_wrap .item").removeClass("on");
        $(this).addClass("on");
      }
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var answerType = $(this).parents(".quiz_area").find(".answer_wrap");
      var answerData = answerType.attr("data-answer");
      if (answerType.hasClass("multi")) {
        checkClickMultiAnswer(answerType, answerData);
      } else {
        var answer = false;
        if ($(".answer_wrap .item.on").hasClass("correct")) {
          answer = true;
        }
        checkClickAnswer(answer);
      }
    });

    // 단일 정답 체크
    function checkClickAnswer(answer) {
      if (answer) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    }

    // 멀티 정답 체크
    function checkClickMultiAnswer(el, answer) {
      var ansArr = answer.split("//");
      var ansCnt = 0;
      var itemCnt = el.find(".item.on").length;

      if (ansArr.length === 1) {
        // 정해진 답이 없이 선택 갯수만 맞추는 유형
        if (ansArr[0] == itemCnt) {
          Quiz.correctQuiz();
        } else {
          Quiz.incorrectQuiz();
        }
      } else {
        // 정해진 답을 여러개 맞추는 유형
        ansArr.forEach((num) => {
          if (el.find(".item.a" + num).hasClass("on")) {
            ansCnt++;
          }
        });

        if (ansArr.length == ansCnt && ansCnt == itemCnt) {
          Quiz.correctQuiz();
        } else {
          Quiz.incorrectQuiz();
        }
      }
    }
  },
  /*
   * ***** 퀴즈타입 : 키패드 입력 *****
   * */
  keypadQuiz: function () {
    var keyup = true;

    // input 활성화
    $(".input").click(function () {
      $(".input").removeClass("keyup");
      if (!$(this).hasClass("keyup")) {
        $(this).addClass("keyup");
        keyup = true;
      }
    });

    var ansData;

    if ($(".answer_wrap").hasClass("vary")) {
      var prevData = $(".answer_wrap").attr("data-answer").split(",");
      ansData = prevData[0].split("//");
    } else {
      ansData = $(".answer_wrap").attr("data-answer").split("//");
    }

    // 정답 입력 시
    $(".key_num li").click(function () {
      // input 활성화 되었을 경우 동작
      if (keyup) {
        try {
          PreelemBridge.stopAudio(1);
          PreelemBridge.playAudio("common/sound/click.wav", 1);
        } catch (error) {
          clickAudio.pause();
          clickAudio.currentTime = 0;
          clickAudio.play();
        }

        var v = $(this).text().toString();
        var ipIdx = $(".input.keyup").index();
        var maxLength = ansData[ipIdx].length + 1;

        if ($(".input.keyup span").text().length >= maxLength) {
          return;
        } else {
          if ($(".input.keyup span").text() == 0 && v == 0 && $(".input.keyup span").text().length > 0) {
            return;
          }
          v = $(".input.keyup span").text() + v;

          // 첫번째 숫자가 0인 경우 지우기
          if ($(".input.keyup span").text().length > 0) {
            v = v.replace(/(^0+)/, "");
          }

          // 숫자 입력값 제한이 있는 경우
          if ($(".input.keyup").hasClass("limit")) {
            var limitVal = Number($(".input.keyup").attr("data-limit"));
            if (Number(v) > limitVal) {
              return;
            }
          }
          $(".input.keyup span").text(v);
        }
      }
    });

    // 지우기
    $(".key_tool .delete").click(function () {
      // input 활성화 되었을 경우 동작
      if (keyup) {
        var str = $(".input.keyup span").text();
        var newStr = str.slice(0, -1);
        $(".input.keyup span").text(newStr);
      }
    });

    // 정답 확인
    $(".btn_check").click(function () {
      var ansWrap = $(this).parents(".quiz_area").find(".answer_wrap");
      var ansData = ansWrap.attr("data-answer");
      var ansDataArr = ansData.split(",");
      var inputList = ansWrap.find(".input");
      var inputAns = "";
      for (let i = 0; i < inputList.length; i++) {
        if (i == 0) {
          inputAns += $(inputList[i]).find("span").text();
        } else {
          inputAns = inputAns + "//" + $(inputList[i]).find("span").text();
        }
      }
      if (ansDataArr.includes(inputAns)) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },
  /*
   * ***** 퀴즈타입 : 드래그 *****
   * ***** 1개 드랍, 1개 드래그 1:1 매칭
   * */
  singleMatchDrag: function () {
    //드래그
    $(".drag_item").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };
        return !event;
      },
      revertDuration: 0,
      stack: ".drag_item",
      start: function () {
        $(this).removeClass("drop");
        var idx = $(this).attr("data-answer");
        $(`.drop_item[data-answer='${idx}']`).removeClass("drop");
      },
    });

    //드롭
    $(".drop_item").droppable({
      drop: function (e, ui) {
        var dragId = ui.draggable.parents(".drag_wrap").attr("drop-id");
        var dataAns = ui.draggable.attr("data-answer");
        var dragIdx = ui.draggable.index();

        if (dragId) {
          var dropId = $(this).attr("drop-id");
          if (dragId !== dropId) {
            ui.draggable.animate({ top: 0, left: 0 }, 0);
            return;
          }
        }
        if ($(this).attr("data-idx")) {
          var revertEl = $(`.drag_item[data-answer=${$(this).attr("data-answer")}]`).eq($(this).attr("data-idx"));
          revertEl.animate({ top: 0, left: 0 }, 0);
          revertEl.removeClass("drop");
        } else if ($(this).attr("data-answer")) {
          var revertEl = $(`.drag_item.drop[data-answer=${$(this).attr("data-answer")}]`);
          revertEl.animate({ top: 0, left: 0 }, 0);
          revertEl.removeClass("drop");
        }

        $(this).attr("data-answer", dataAns);
        if ($(".quiz_area").hasClass("clone")) {
          $(this).attr("data-idx", dragIdx);
        }

        ui.draggable.addClass("drop");
        dropAudio.play();
        if (!$(".quiz_area").hasClass("free")) {
          // 드래그 요소가 센터로 가야할 경우
          ui.draggable.position({
            my: "center",
            at: "center",
            of: this,
          });
        }
        $(this).addClass("drop");
      },
      out: function (e, ui) {
        ui.draggable.on("mouseup", function () {
          var dataAns = ui.draggable.attr("data-answer");
          ui.draggable.removeClass("drop");

          if ($(".quiz_area").hasClass("clone")) {
            var dragIdx = ui.draggable.index();
            $(`.drop_item[data-answer=${dataAns}][data-idx=${dragIdx}]`).attr("data-answer", "").attr("data-idx", "");
          } else {
            $(`.drop_item[data-answer=${dataAns}]`).attr("data-answer", "");
          }
        });
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var ansWrap = $(this).parents(".quiz_area").find(".answer_wrap");
      var ansData = ansWrap.attr("data-answer");
      var dropList = ansWrap.find(".drop_item");
      var dropAns = "";
      for (let i = 0; i < dropList.length; i++) {
        dropAns += dropList[i].getAttribute("data-answer");
      }
      if (ansData == dropAns) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },
  /*
   * ***** 퀴즈타입 : 드래그 *****
   * ***** 1개 드랍, 드래그 갯수로 정답 확인
   * */
  singleCntDrag: function () {
    //드래그
    $(".drag_item").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };
        return !event;
      },
      revertDuration: 0,
      stack: ".drag_item",
      start: function () {
        $(this).removeClass("drop");
      },
    });

    //드롭
    $(".drop_item").droppable({
      drop: function (e, ui) {
        ui.draggable.addClass("drop");
        dropAudio.play();
        ui.draggable.parents(".item_wrap").addClass("drop");
      },
      out: function (e, ui) {
        ui.draggable.on("mouseup", function () {
          ui.draggable.removeClass("drop");
        });
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var ansCnt = $(this).parents(".quiz_area").find(".answer_wrap").attr("data-answer");
      var dragCnt = $(".drag_item.drop").length;
      if (ansCnt == dragCnt) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },
  /*
   * ***** 퀴즈타입 : 드래그 *****
   * ***** 드랍 여러개, 드래그 여러개 매칭
   * */
  MultiDropMultiMatchDrag: function () {
    //드래그
    $(".drag_item").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };
        return !event;
      },
      revertDuration: 0,
      stack: ".drag_item",
      start: function () {
        $(this).removeClass("drop");
      },
    });
    //드롭
    $(".drop_item").droppable({
      drop: function (e, ui) {
        var dropNum = $(this).attr("drop-answer");
        ui.draggable.addClass("drop").attr("drop-answer", dropNum);
        ui.draggable.parents(".item_wrap").addClass("drop");
        dropAudio.play();
      },
      out: function (e, ui) {
        ui.draggable.on("mouseup", function () {
          ui.draggable.removeClass("drop");
          ui.draggable.parents(".item_wrap").removeClass("drop");
        });
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var ansWrapCnt = $(".answer_wrap").length;
      for (let i = 0; i < ansWrapCnt; i++) {
        var dragItemCnt = $(`.answer_wrap[drop-answer='${i + 1}'] .drag_item`).length;
        var dropItemCnt = $(`.answer_wrap[drop-answer='${i + 1}'] .drag_item[drop-answer='${i + 1}']`).length;

        if (dragItemCnt !== dropItemCnt) {
          Quiz.incorrectQuiz();
          return false;
        }
      }
      Quiz.correctQuiz();
    });
  },

  /*
   * ***** 퀴즈타입 : 드래그 *****
   * ***** 드랍 > 드래그 자유 드래그&드랍 매칭
   * */
  multiDropVaryMatch: function () {
    //드래그
    $(".drag_item").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };
        return !event;
      },
      revertDuration: 0,
      stack: ".drag_item",
      start: function () {
        $(this).removeClass("drop");
      },
    });

    //드롭
    $(".drop_item").droppable({
      drop: function (e, ui) {
        if ($(this).attr("data-answer")) {
          var revertEl = $(`.drag_item.drop[data-answer=${$(this).attr("data-answer")}]`);
          revertEl.animate({ top: 0, left: 0 }, 0);
          revertEl.removeClass("drop");
        }

        var dataAns = ui.draggable.attr("data-answer");
        $(this).attr("data-answer", dataAns).addClass("drop");

        ui.draggable.addClass("drop");

        dropAudio.play();

        // 드래그 요소가 센터로 가야할 경우
        ui.draggable.position({
          my: "center",
          at: "center",
          of: this,
        });
      },
      out: function (e, ui) {
        ui.draggable.on("mouseup", function () {
          var dataAns = ui.draggable.attr("data-answer");
          ui.draggable.removeClass("drop");
          $(`.drop_item[data-answer=${dataAns}]`).attr("data-answer", "").removeClass("drop");
        });
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var ansWrap = $(this).parents(".quiz_area").find(".answer_wrap");
      var ansData = $(this).parents(".quiz_area").find(".answer_wrap").attr("data-answer");
      var ansArr = ansData.split("//");
      var ansCnt = 0;
      var dropCnt = ansWrap.find(".drop_item.drop").length;

      ansArr.forEach((num) => {
        if (ansWrap.find(".drop_item.d" + num).hasClass("drop")) {
          ansCnt++;
        }
      });

      if (ansArr.length == ansCnt && ansCnt == dropCnt) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },

  /*
   * ***** 퀴즈타입 : 선잇기 *****
   * ***** 한방향 선잇기
   * */
  singleLine: function () {
    var dotWidth = $(".dot_list .dot").innerWidth() / 2;
    var dotHeight = $(".dot_list .dot").innerHeight() / 2;

    function setDragLinePos(el, arr) {
      var idx = el.attr("data-answer");
      var x = el.position().left + dotWidth;
      var y = el.position().top + dotHeight;
      if (arr) {
        x += arr[0];
        y += arr[1];
      }

      $(`line[start=${idx}]`).attr("x2", parseInt(x));
      $(`line[start=${idx}]`).attr("y2", parseInt(y));
    }

    //드래그
    $(".dot .drag").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };
        if (!event) {
          var idx = $(this).parents(".dot").attr("data-answer");
          $(`line[start='${idx}']`).remove();
          $(".dot_list").removeClass("start_left start_right");
        }

        return !event;
      },
      revertDuration: 0,

      start: function () {
        if ($(this).parents(".dot").hasClass("left")) {
          $(this).parents(".dot_list").addClass("start_left");
        } else {
          $(this).parents(".dot_list").addClass("start_right");
        }

        var targetDot = $(this).parents(".dot");
        var idx = targetDot.attr("data-answer");

        var line;
        if ($(`line[start='${idx}']`).length > 0) {
          line = $(`line[start='${idx}']`);
        } else if ($(`line[end='${idx}']`).length > 0) {
          line = $(`line[end='${idx}']`);
          line.attr("end", "");
        } else {
          line = $(document.createElementNS("http://www.w3.org/2000/svg", "line"));

          $("svg").append(line);
          $(line).addClass(`on`);
        }

        $(line).attr("start", idx);
        $(line).attr("x1", parseInt(targetDot.position().left + dotWidth));
        $(line).attr("y1", parseInt(targetDot.position().top + dotHeight));
      },

      drag: function () {
        var targetDot = $(this).parents(".dot");
        var arr = [$(this).position().left, $(this).position().top];
        setDragLinePos(targetDot, arr);
      },
    });

    //드롭
    $(".dot .drop").droppable({
      drop: function (e, ui) {
        var targetDot = $(this).parents(".dot");
        var targetIdx = targetDot.attr("data-answer");

        var targetDrag = ui.draggable.parents(".dot");
        var targetDragIdx = targetDrag.attr("data-answer");

        var x = targetDot.position().left + dotWidth;
        var y = targetDot.position().top + dotHeight;

        if ($(`line[start=${targetIdx}]`).length > 0 || $(`line[end=${targetIdx}]`).length > 0) {
          $(`line[start='${targetDragIdx}']`).remove();
        } else {
          $(`line[start=${targetDragIdx}]`).attr("x2", parseInt(x));
          $(`line[start=${targetDragIdx}]`).attr("y2", parseInt(y));
          $(`line[start=${targetDragIdx}]`).attr("end", targetIdx);
        }

        $(".dot .drag").css("pointer-events", "none");
        setTimeout(function () {
          ui.draggable.animate({ top: 0, left: 0 }, 0);
          $(".dot_list").removeClass("start_left start_right");
          $(".dot .drag").css("pointer-events", "all");
        }, 500);
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var lineList = $("svg line");
      var lineData = [];

      var ansWrap = $(this).parents(".quiz_area").find(".answer_wrap");
      var ansData = ansWrap.attr("data-answer").split("//");

      for (let i = 0; i < lineList.length; i++) {
        var start = $(lineList[i]).attr("start");
        var end = $(lineList[i]).attr("end");
        var arr = [start, end];
        arr = arr.sort();
        lineData.push(`${arr[0]},${arr[1]}`);
      }
      lineData = lineData.sort();

      for (let j = 0; j < ansData.length; j++) {
        if (!lineData.includes(ansData[j])) {
          Quiz.incorrectQuiz();
          return;
        }
      }
      Quiz.correctQuiz();
    });
  },
  /*
   * ***** 퀴즈타입 : 선잇기 *****
   * ***** 한 선에 하나만 잇고 선 개수로 정답 확인(양방향 선잇기)
   * */
  twoWayLineCnt: function () {
    var dotWidth = $(".dot_list .dot").innerWidth() / 2;
    var dotHeight = $(".dot_list .dot").innerHeight() / 2;

    function setDragLinePos(el, arr) {
      var idx = el.attr("data-answer");
      var x = el.position().left + dotWidth;
      var y = el.position().top + dotHeight;
      if (arr) {
        x += arr[0];
        y += arr[1];
      }
      $(`.line${idx}`).attr("x2", parseInt(x));
      $(`.line${idx}`).attr("y2", parseInt(y));
    }

    //드래그
    $(".dot .drag").draggable({
      revert: function (event, ui) {
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };

        if (!event) {
          var idx = $(this).parents(".dot").attr("data-answer");
          $(`.line${idx}`)
            .attr({
              x1: "0",
              y1: "0",
              x2: "0",
              y2: "0",
            })
            .removeClass("on");
          $(".dot_list").removeClass("start_left start_right");
        }

        return !event;
      },
      revertDuration: 0,

      start: function () {
        var targetDot = $(this).parents(".dot");
        var idx = $(this).parents(".dot").attr("data-answer");
        $(`.line${idx}`).addClass("on");
        $(`.line${idx}`).attr("x1", parseInt(targetDot.position().left + dotWidth));
        $(`.line${idx}`).attr("y1", parseInt(targetDot.position().top + dotHeight));

        if ($(this).parents(".dot").hasClass("left")) {
          $(this).parents(".dot_list").addClass("start_left");
        } else {
          $(this).parents(".dot_list").addClass("start_right");
        }
      },
      drag: function () {
        var targetDot = $(this).parents(".dot");
        var arr = [$(this).position().left, $(this).position().top];

        setDragLinePos(targetDot, arr);
      },
    });

    //드롭
    $(".dot .drop").droppable({
      drop: function (e, ui) {
        var targetDot = $(this).parents(".dot");
        var targetDrag = ui.draggable.parents(".dot");

        var targetIdx = targetDot.attr("data-answer");
        var targetDragIdx = targetDrag.attr("data-answer");

        if (targetIdx !== targetDragIdx) {
          $(`.line${targetDragIdx}`)
            .attr({
              x1: "0",
              y1: "0",
              x2: "0",
              y2: "0",
            })
            .removeClass("on");
        }
        setDragLinePos(targetDot);

        setTimeout(function () {
          ui.draggable.animate({ top: 0, left: 0 }, 0);
          $(".dot_list").removeClass("start_left start_right");
        }, 500);
      },
    });
    // 정답 확인
    $(".btn_confirm").click(function () {
      var lineCnt = $("svg line").length;
      var lineOnCnt = $("svg line.on").length;
      if (lineCnt == lineOnCnt) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },
  /*
   * ***** 퀴즈타입 : 선잇기 *****
   * ***** 양방향, 한선에 여러선 잇기
   * */
  twoWayLineMulti: function () {
    var dotWidth = $(".dot_list .dot").innerWidth() / 2;
    var dotHeight = $(".dot_list .dot").innerHeight() / 2;

    function setDragLinePos(el, arr) {
      var idx = el.attr("data-answer");
      var x = el.position().left + dotWidth;
      var y = el.position().top + dotHeight;
      if (arr) {
        x += arr[0];
        y += arr[1];
      }
      var lineIdx = $(`svg .line${idx}`).length;
      $(`.line${idx}[data-answer='${lineIdx}']`).attr("x2", parseInt(x));
      $(`.line${idx}[data-answer='${lineIdx}']`).attr("y2", parseInt(y));
    }

    //드래그
    $(".dot .drag").draggable({
      revert: function (event, ui) {
        $(".dot_list").removeClass("on");
        $(this).data("uiDraggable").originalPosition = {
          top: 0,
          left: 0,
        };

        if (!event) {
          var targetDot = $(this).parents(".dot");
          var idx = targetDot.attr("data-answer");
          var lineCnt = $(`svg .line${idx}`).length;

          $(`.line${idx}[data-answer='${lineCnt}']`).remove();
        }

        return !event;
      },
      revertDuration: 0,

      start: function () {
        $(".dot_list").addClass("on");
        var targetDot = $(this).parents(".dot");
        var idx = targetDot.attr("data-answer");
        var leftPos = parseInt(targetDot.position().left + dotWidth);
        var topPos = parseInt(targetDot.position().top + dotHeight);
        var lineCnt = $(`svg .line${idx}`).length;
        var lineMax = targetDot.attr("line-max");

        // 다시 이을 경우 값 초기화
        if (lineMax == lineCnt) {
          var dropList = $(".dot .drop");
          for (let i = 0; i < dropList.length; i++) {
            var dropMatchId = $(dropList[i]).attr("match-id");
            if (dropMatchId) {
              var arr = dropMatchId.split("//");

              for (let j = 0; j < arr.length; j++) {
                if (arr[j].indexOf(idx) > -1) {
                  arr.splice(j, 1);
                }
              }

              var newMatchId = "";
              if (arr.length == 0) {
                $(dropList[i]).attr("match-id", "");
              } else {
                arr.forEach((el, j) => {
                  if (j == 0) {
                    newMatchId = el;
                  } else {
                    newMatchId = "//" + el;
                  }

                  $(dropList[i]).attr("match-id", newMatchId);
                });
              }
            }
          }

          $(`.line${idx}`).remove();
          lineCnt = $(`svg .line${idx}`).length;
        }

        var line = $(document.createElementNS("http://www.w3.org/2000/svg", "line"));

        $("svg").append(line);
        $(line).addClass(`on line${idx}`);
        $(line).attr("x1", parseInt(targetDot.position().left + dotWidth));
        $(line).attr("y1", parseInt(targetDot.position().top + dotHeight));
        $(line).attr("data-answer", lineCnt + 1);
      },
      drag: function () {
        var targetDot = $(this).parents(".dot");
        var arr = [$(this).position().left, $(this).position().top];
        setDragLinePos(targetDot, arr);
      },
    });

    //드롭
    $(".dot .drop").droppable({
      drop: function (e, ui) {
        setTimeout(function () {
          ui.draggable.animate({ top: 0, left: 0 }, 0);
        }, 500);

        var targetDot = $(this).parents(".dot");
        var targetDrag = ui.draggable.parents(".dot");

        var targetIdx = targetDot.attr("data-answer");
        var targetDragIdx = targetDrag.attr("data-answer");

        var x = targetDot.position().left + dotWidth;
        var y = targetDot.position().top + dotHeight;

        var lineIdx = $(`svg .line${targetDragIdx}`).length;

        var matchId = $(this).attr("match-id");

        var arr = [targetIdx, targetDragIdx];
        arr = arr.sort();
        var arrStr = `${arr[0]},${arr[1]}`;

        // 이미 이어진 선이 있는 경우
        var targetDragDropMatchId = targetDrag.find(".drop").attr("match-id");
        if (targetDragDropMatchId && targetDragDropMatchId.includes(arrStr)) {
          $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).remove();
          return;
        }

        // 이어지면 안되는 선
        var noMatch = $(".answer_wrap").attr("no-match").split("//");
        if (noMatch.includes(arrStr)) {
          $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).remove();
          return;
        }

        var dropList = $(".dot .drop");
        var matchV = 0;
        for (let i = 0; i < dropList.length; i++) {
          var dropMatchId = $(dropList[i]).attr("match-id");
          if (dropMatchId) {
            var arr = dropMatchId.split("//");
            for (let j = 0; j < arr.length; j++) {
              if (arr[j].indexOf(targetDragIdx) > -1) {
                matchV++;
              }
            }
          }
        }
        if (matchV == targetDrag.attr("line-max")) {
          $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).remove();
          return;
        }

        if (matchId) {
          var matchCnt = matchId.split("//").length;
          var maxLine = targetDot.attr("line-max");
          if (matchCnt == maxLine) {
            $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).remove();
            return;
          } else {
            matchId = matchId + "//" + arrStr;
            $(this).attr("match-id", matchId);
          }
        } else {
          $(this).attr("match-id", arrStr);
        }

        $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).attr("x2", parseInt(x));
        $(`.line${targetDragIdx}[data-answer='${lineIdx}']`).attr("y2", parseInt(y));
      },
    });

    // 정답 확인
    $(".btn_confirm").click(function () {
      var ansWrap = $(this).parents(".quiz_area").find(".answer_wrap");
      var ansData = ansWrap.attr("data-answer").split("//");

      var dropList = $(".dot .drop");
      var dropAns = [];
      for (let i = 0; i < dropList.length; i++) {
        var dropMatchId = $(dropList[i]).attr("match-id");
        if (dropMatchId) {
          var arr = dropMatchId.split("//");

          for (let j = 0; j < arr.length; j++) {
            dropAns.push(arr[j]);
          }
        }
      }

      for (let i = 0; i < ansData.length; i++) {
        if (!dropAns.includes(ansData[i])) {
          Quiz.incorrectQuiz();
          return;
        }
      }

      if (ansData.length == dropAns.length) {
        Quiz.correctQuiz();
      } else {
        Quiz.incorrectQuiz();
      }
    });
  },
};

$(document).ready(function () {
  var quizType = $(".quiz_area").attr("data-name");
  switch (quizType) {
    // 클릭하기
    case "click":
      Quiz.clickQuiz();
      break;
    // 키패드
    case "keypad":
      Quiz.keypadQuiz();
      break;
    // 드래그
    case "singleMatchDrag":
      Quiz.singleMatchDrag();
      break;
    case "singleCntDrag":
      Quiz.singleCntDrag();
      break;
    case "MultiDropMultiMatchDrag":
      Quiz.MultiDropMultiMatchDrag();
      break;
    case "multiDropVaryMatch":
      Quiz.multiDropVaryMatch();
      break;

    // 선잇기
    case "singleLine":
      Quiz.singleLine();
      break;
    case "twoWayLineCnt":
      Quiz.twoWayLineCnt();
      break;
    case "twoWayLineMulti":
      Quiz.twoWayLineMulti();
      break;
  }
});
