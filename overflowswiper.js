// TODO: jQuery と Hammer をここに組み込む。

var OverflowSwiper = (function(tag, option){

  var currentSlideNum = 1;
  var previusSlideNum = 1;
  var position = {
    x: 0,
    y: 0
  };

  var diffX = 0;
  var diffY = 0;
  var isUserChanged = false;

  var nextSlide = function() {
    previusSlideNum = currentSlideNum;
    currentSlideNum++;

    this.len = $(tag + ">.ofswiper-wrapper>.ofswiper-slide").length;
    if(currentSlideNum > this.len) {
      if(option.isLoop) {
        currentSlideNum = 1;
      } else {
        currentSlideNum --;
      }
    }

    removeSlideTag();
    setSlideTag();
    goCurrentSlide(function() {
      if ($(tag + ">.ofswiper-wrapper>.ofswiper-current").hasClass("ofswiper-end")) {
        goSlideNoAnimation(2);
      }
      afterSlideChange();
    });
  }

  var prevSlide = function() {
    previusSlideNum = currentSlideNum;
    currentSlideNum--;

    this.len = $(tag + ">.ofswiper-wrapper>.ofswiper-slide").length;
    if(currentSlideNum < 1) {
      if(option.isLoop) {
        currentSlideNum = this.len;
      } else {
        currentSlideNum ++;
      }
    }

    removeSlideTag();
    setSlideTag();
    goCurrentSlide(function() {
      if($(tag + ">.ofswiper-wrapper>.ofswiper-current").hasClass("ofswiper-start")) {
        goSlideNoAnimation($(tag + ">.ofswiper-wrapper>.ofswiper-slide").not(".ofswiper-end").length);
      }
      afterSlideChange();
    });
  }

  /***** 画面中央にアニメーション移動 *****/
  var goCurrentSlide = function(callbackFun) {
    // カレントがなければ何もしない。
    if($(tag + ">.ofswiper-wrapper>.ofswiper-current").length == 0) {
      return;
    }

    // console.log("go "+currentSlideNum+" slide.");

    var coord   = 0;
    var size    = 0;
    var winSize = 0;
    var animateObj = new Object();

    if(option.direction === 'vertical') {
      coord = $(tag + ">.ofswiper-wrapper>.ofswiper-current").offset().top - $(tag+">.ofswiper-wrapper").offset().top;
      size = $(tag + ">.ofswiper-wrapper>.ofswiper-current").height();
      winSize = $(tag).height();

      position.y = -(coord + ((size-winSize)/2));
      transitionY(callbackFun);
    } else {
      // アニメーションのセット
      coord = $(tag + ">.ofswiper-wrapper>.ofswiper-current").offset().left - $(tag+">.ofswiper-wrapper").offset().left;
      size = $(tag + ">.ofswiper-wrapper>.ofswiper-current").width();
      winSize = $(tag).width();

      position.x = -(coord + ((size-winSize)/2));
      transitionX(callbackFun);
    }
  }

  /***** 画面中央にアニメーションせずに移動 *****/
  var goSlideNoAnimation = function(slideNum) {
    currentSlideNum = slideNum;

    removeSlideTag();
    setSlideTag();

    var coord   = 0;
    var size    = 0;
    var winSize = 0;

    if(option.direction === 'vertical') {
      coord = $(tag + ">.ofswiper-wrapper>.ofswiper-current").offset().top - $(tag+">.ofswiper-wrapper").offset().top;
      size = $(tag + ">.ofswiper-wrapper>.ofswiper-current").height();
      winSize = $(tag).height();

      position.x = -(coord + ((size-winSize)/2));
      transitionYNoAnimation();
    } else {
      coord = $(tag + ">.ofswiper-wrapper>.ofswiper-current").offset().left - $(tag+">.ofswiper-wrapper").offset().left;
      size = $(tag + ">.ofswiper-wrapper>.ofswiper-current").width();
      winSize = $(tag).width();

      position.x = -(coord + ((size-winSize)/2));
      transitionXNoAnimation();
    }
  }

  var transitionX = function(callbackFun) {
    $(tag+">.ofswiper-wrapper").css('transition-duration','0.2s');
    $(tag+">.ofswiper-wrapper").css('transform','translate3d(' + position.x + 'px, 0px, 0px)');
    // TODO: 切り替わるまでスクロール抑制とかできるのかしら。
    $(tag+">.ofswiper-wrapper").one('transitionend', callbackFun);
  }
  var transitionXNoAnimation = function() {
    $(tag+">.ofswiper-wrapper").css('transition-duration','0s');
    $(tag+">.ofswiper-wrapper").css('transform','translate3d(' + position.x + 'px, 0px, 0px)');
  }
  var transitionY = function(callbackFun) {
    $(tag+">.ofswiper-wrapper").css('transition-duration','0.2s');
    $(tag+">.ofswiper-wrapper").css('transform','translate3d(0px, ' + position.y + 'px, 0px)');
    // TODO: 切り替わるまでスクロール抑制とかできるのかしら。
    $(tag+">.ofswiper-wrapper").one('transitionend', callbackFun);
  }
  var transitionYNoAnimation = function() {
    $(tag+">.ofswiper-wrapper").css('transition-duration','0s');
    $(tag+">.ofswiper-wrapper").css('transform','translate3d(0px, ' + position.y + 'px, 0px)');
  }

  // ofswiper のイベントをセット
  var setEvent = function() {
    if(option.direction === 'vertical') {                 /***** 縦の時 *****/
      var myHammer = new Hammer($(tag).get(0));
      myHammer.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });
      myHammer.get('pan').set({ direction: Hammer.DIRECTION_VERTICAL });

      myHammer.on('swipeup', function(ev) {
        nextSlide();
        isUserChanged = true;
      });
      myHammer.on('swipedown', function(ev) {
        prevSlide();
        isUserChanged = true;
      });

      myHammer.on('panstart', function(ev) {
        // 閾値判定の為、タップしたときの座標を保持
        if(!"diffY" in window)
          diffY = 0;
        else {
          diffY = ev.center.y;
        }
        $(tag+">.ofswiper-wrapper").css('transition-duration','0s');
      });
      myHammer.on('panend', function(ev) {
        // 切り替え済みなら何もしない。
        if(isUserChanged) {
          isUserChanged = false;
          return;
        }
        // delta が 閾値以下なら次のスライドへ
        // delta が 閾値以上なら前のスライドへ
        // それ以外は自分のスライド中央へ
        if(ev.deltaY < -option.threshold) {
          nextSlide();
        } else if (ev.deltaY > option.threshold) {
          prevSlide();
        } else {
          previusSlideNum = currentSlideNum;
          // goCurrentSlide(afterSlideChange);
          goCurrentSlide();
        }
      });
      myHammer.on('panup pandown', function(ev) {
        if(!"diffY" in window)
          diffY = 0;
        else {
          diffY = diffY - ev.center.y;
        }

        position.y -= diffY;
        diffY = ev.center.y;

        $(tag+">.ofswiper-wrapper").css('transform','translate3d(0px, ' + position.y + 'px, 0px)');
      });
    } else {                                              /***** 横の時 *****/
      var myHammer = new Hammer($(tag).get(0));
      myHammer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      myHammer.get('pan').set({ direction: Hammer.DIRECTION_HORIZONTAL });
      
      myHammer.on('swipeleft', function(ev) {
        nextSlide();
        isUserChanged = true;
      });
      myHammer.on('swiperight', function(ev) {
        prevSlide();
        isUserChanged = true;
      });

      myHammer.on('panstart', function(ev) {
        // 閾値判定の為、タップしたときの座標を保持
        if(!"diffX" in window)
          diffX = 0;
        else {
          diffX = ev.center.x;
        }
        $(tag+">.ofswiper-wrapper").css('transition-duration','0s');
      });
      myHammer.on('panend', function(ev) {
        // 切り替え済みなら何もしない。
        if(isUserChanged) {
          isUserChanged = false;
          return;
        }
        // delta が 閾値以下なら次のスライドへ
        // delta が 閾値以上なら前のスライドへ
        // それ以外は自分のスライド中央へ
        if(ev.deltaX < -option.threshold) {
          nextSlide();
        } else if (ev.deltaX > option.threshold) {
          prevSlide();
        } else {
          previusSlideNum = currentSlideNum;
          // goCurrentSlide(afterSlideChange);
          goCurrentSlide();
        }
      });
      myHammer.on('panleft panright', function(ev) {
        if(!"diffX" in window)
          diffX = 0;
        else {
          diffX = diffX - ev.center.x;
        }

        position.x -= diffX;
        diffX = ev.center.x;

        $(tag+">.ofswiper-wrapper").css('transform','translate3d(' + position.x + 'px, 0px, 0px)');
      });
    }
  }

  // スライドの切り替わり後の処理
  var afterSlideChange = function() {
    // TODO: LOOP 用タグ start と end を考慮しない current と previus をセットしたい。
    if(currentSlideNum != previusSlideNum) {
      if(option.isLoop) {
        option.onSlideChange({
          currentSlideNum: currentSlideNum - 1,
          previusSlideNum: previusSlideNum - 1,
        });
      } else {
        option.onSlideChange({
          currentSlideNum: currentSlideNum,
          previusSlideNum: previusSlideNum,
        });
      }
    }
  }

  // スライドのタグをリセット
  var removeSlideTag = function() {
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide").removeClass("ofswiper-current");
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide").removeClass("ofswiper-next");
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide").removeClass("ofswiper-prev");
  }

  // スライドのタグをセット
  var setSlideTag = function() {
    // 縦の場合、ofswiper-vertical クラスを追加
    if(option.direction === 'vertical') {
      $(tag).addClass('ofswiper-container-vertical');
      $(tag + ">.ofswiper-wrapper").addClass('ofswiper-wrapper-vertical');
    } else {
      $(tag).addClass('ofswiper-container-horizontal');
      $(tag + ">.ofswiper-wrapper").addClass('ofswiper-wrapper-horizontal');
    }

    this.slide = $(tag + ">.ofswiper-wrapper>.ofswiper-slide");
    this.len = slide.length;
    this.nextSlideNum = currentSlideNum + 1; // 次がないときは 1 をセット
    this.prevSlideNum = currentSlideNum - 1; // 前がないときは 最後 をセット
    if(currentSlideNum == this.len) {
      this.nextSlideNum = 1;
    }
    if(currentSlideNum == 1) {
      this.prevSlideNum = this.len;
    }

    // カレントタグ
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide:nth-child("+currentSlideNum+")").addClass("ofswiper-current");
    // 次のタグ
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide:nth-child("+nextSlideNum+")").addClass("ofswiper-next");
    // 前のタグ
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide:nth-child("+prevSlideNum+")").addClass("ofswiper-prev");
  }

  // 最初と最後の前に切り替え用スライドを追加
  var setupOfSwiper = function() {
    $(tag + ">.ofswiper-wrapper>.ofswiper-start").remove();
    $(tag + ">.ofswiper-wrapper>.ofswiper-end").remove();

    // start と end のタグに 最後と1番目のスライドをセットする。
    this.slideLen = $(tag + ">.ofswiper-wrapper>.ofswiper-slide").length;
    this.firstSlide = $(tag + ">.ofswiper-wrapper>.ofswiper-slide:first-child").clone();
    this.endSlide = $(tag + ">.ofswiper-wrapper>.ofswiper-slide:nth-child("+slideLen+")").clone();

    if(firstSlide.length != 0) {
      firstSlide.addClass("ofswiper-end");
      $(tag + ">.ofswiper-wrapper").append(firstSlide);
    } else {
      var ediv = document.createElement('div');
      ediv.className = "ofswiper-slide ofswiper-end";
      $(tag + ">.ofswiper-wrapper").append(ediv);
    }

    if(endSlide.length != 0){
      endSlide.addClass("ofswiper-start");
      $(tag + ">.ofswiper-wrapper>.ofswiper-slide:first-child").before(endSlide);
    } else {
      var sdiv = document.createElement('div');
      sdiv.className = "ofswiper-slide ofswiper-start";
      $(tag + ">.ofswiper-wrapper").append(sdiv);
    }
  }

  // スワイパーをリサイズする。
  var resize = function() {
    // スライドとウィンドウの大きさを比較
    // とりあえず全部固定想定なので１つめを取得
    var element = $(tag + ">.ofswiper-wrapper>.ofswiper-slide")[0];

    // 画面サイズ・画像サイズから　縦・横の比率を算出
    var wRate = $(element).width() / $(window).width();
    var hRate = $(element).height() / $(window).height();

    // 縦の比率が小さければ縦フィット、横の比率が小さければ横フィット
    $(tag + ">.ofswiper-wrapper>.ofswiper-slide").each(function(index, element) {
      if(wRate < hRate) {
        $(element).css("width", "100vw");
        $(element).css("height", "auto");
      } else {
        $(element).css("width", "auto");
        $(element).css("height", "100vh");
      }
    });
  }

  // スライドを追加
  this.addSlide = function(element) {
    var div = document.createElement('div');
    div.className = "ofswiper-slide";
    $(div).append(element);
    $(tag + ">.ofswiper-wrapper>.ofswiper-end").before(div);
    refresh();
  }

  // option をチェックする。
  var checkOption = function() {
    if(!option) { option = {}; }
    if(!option.threshold) { option.threshold = 0; }
    if(!option.initialSlide) { option.initialSlide = 1; }
    currentSlideNum = option.initialSlide;

    if(!option.onSlideChange) { 
      option.onSlideChange = function() {} 
    }
    if(typeof(option.onSlideChange) != "function") { 
      console.error("'onSlideChnage' option has to specify function.");
      option.onSlideChange = function() {} 
    }
  }

  // このスワイパーを初期化
  var init = function() {
    checkOption();

    setEvent();
    if(option.isLoop) {
      setupOfSwiper();
      previusSlideNum = currentSlideNum++;
    }
    setSlideTag();
    // resize();
    goCurrentSlide();
  }

  // このスワイパーを更新
  var refresh = function() {
    if(option.isLoop)
      setupOfSwiper();
    removeSlideTag();
    setSlideTag();
    // resize();
    goCurrentSlide();
  }

  this.refresh = function() { refresh(); }
  this.goInitialSlide = function(callbackFun) { 
    currentSlideNum = option.initialSlide;
    if(option.isLoop) {
      previusSlideNum = currentSlideNum++;
    }
    removeSlideTag();
    setSlideTag();
    goCurrentSlide(callbackFun);
  }
  this.goInitialSlideNoAnimation = function(callbackFun) { 
    goSlideNoAnimation(option.initialSlide + 1);
  }
  this.getCurrentSlideNum = function() {
    if(option.isLoop) {
      return currentSlideNum - 1;
    } else {
      return currentSlideNum;
    }
  }
  init();
});


