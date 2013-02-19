/**################################################
##
##   project:    awsAccordion - a vertical/horizontal accordion plugin for jQuery
##   author:     @anotherwebstorm
##   demo:       code.anotherwebstorm.com/apps/awsaccordion.html
##   Version:    1.0
##   Copyright:  (c) 2012-2013 Marco Cardoso
##
################################################**/

(function ($) {

	var AwsAccordion = function (elem, options) {

    // ### DEFAULT OPTIONS
    var defaults = {

      //Visual Settings and Attributes
      type : 'vertical', //Type of accordion. By default i set to vertical. You can change it to horizontal [string]
      cssAttrsVer : { //Only use if type of accordion is vertical
        ulWidth: 700, //Width for ul [integer/string]. If you specify string 'responsive' it will take full width of parent container
        liHeight: 40 //Height for li [integer/string]
      },
      cssAttrsHor : { //Only use if type of accordion is horizontal
        ulWidth: 700, //Width for ul [integer/string]. If you specify string 'responsive' it will take full width of parent container
        liWidth : 40, //Width for li [integer]
        liHeight : 300, //Height for li [integer]
        responsiveMedia : false //If you want a responsive accordion write here your media query. [string]. By default it will be '(max-width: 600px)'
      },
      startSlide : 1, //Start accordion with slide number X opened. By default is 1 [integer/false]
      openCloseHelper : { //Show or hide numbers or icons on opening and closing tabs
        numeric : false, //Set to true and show numbers [boolean]
        openIcon : false, //icon for opening the tab. (example: 'plus') [string] - Refer to http://fortawesome.github.com/Font-Awesome/#all-icons to check all icons
        closeIcon : false //icon for closing the tab. (example: 'minus') [string] - Refer to http://fortawesome.github.com/Font-Awesome/#all-icons to check all icons
      },
      openOnebyOne : true, //Open Tabs one by one [boolean]

      //HTML
      classTab : 'active', //Opened tab by default has class active [string/false]

      //Events
      slideOn : 'click', //Event for Tab slide, can use click or mouseover [string]

      //Animation Settings
      autoPlay : false, //Set accordion autoPlay [boolean]
      autoPlaySpeed : 2000 //By Default autoPlay speed is set at 3000ms [integer]
    },

      // ### MERGE DEFAULTS WITH OVERWRITTEN SETTINGS 
      settings = $.extend(true, {}, defaults, options),

      // ### GLOBAL VARIABLES
      horUlParentWidth = parseInt($(elem.parent()).css('width'), 10),
      horElemContent = $(elem).html(),
      headLis = elem.children().children(),
      countHeads = headLis.length,
      playing = '',
      versionIE = parseFloat(navigator.appVersion.split("MSIE")[1]),

      // ### METHODS
      methods = {

        // start autoplay
        play : function () {
          var i;
          if (settings.startSlide && (settings.startSlide !== countHeads)) {
            i = settings.startSlide;
          } else {
            i = 0;
          }
          playing = setInterval(function () {
            //While
            if (i < countHeads) {
              var next = i++;
              //Execute click action on li
              $(headLis[next]).trigger('click');
              //Reset Counter if last li is achieved 
              if (i === countHeads) {
                next = 0;
                i = 0;
              }
            }
          }, settings.autoPlaySpeed);
        },

        // Stop autoplay
        stop : function () {
          //Clear Interval setted in var playing
          window.clearInterval(playing);
        },

        //Get border width sum to define correctly width for horizontal accordion
        calcBordWidthHor : function () {
          var borRight,
            borLeft;

          //Small tweaks with isNaN for reading in ie7/ie8
          if (!isNaN(parseInt($(headLis).parent().find('li').css('border-right-width'), 10))) {
            borRight = parseInt($(headLis).parent().find('li').css('border-right-width'), 10);
          } else {
            borRight = 0;
          }

          if (!isNaN(parseInt($(headLis).parent().find('li').css('border-left-width'), 10))) {
            borLeft = parseInt($(headLis).parent().find('li').css('border-left-width'), 10);
          } else {
            borLeft = 0;
          }

          return borRight + borLeft;
        },

        //Get div width for horizontal accordion
        calcDivWidthHor : function () {
          if ($.type(settings.cssAttrsHor.ulWidth) ===  "number") {
            return settings.cssAttrsHor.ulWidth - ($(headLis).parent().find('li').length * (settings.cssAttrsHor.liWidth + methods.calcBordWidthHor()));
          } else {
            //if is 'responsive'
            return horUlParentWidth - ($(headLis).parent().find('li').length * (settings.cssAttrsHor.liWidth + methods.calcBordWidthHor()));
          }
        },

        //! matchMedia() polyfill for IE made by Scott Jehl, Paul Irish and Nicholas Zakas.
        matchQueryMedia : function () {

          window.matchMedia = window.matchMedia || (function (doc, undefined) {

            var docElem  = doc.documentElement,
              refNode  = docElem.firstElementChild || docElem.firstChild,
              // fakeBody required for <FF4 when executed in <head>
              fakeBody = doc.createElement('body'),
              div      = doc.createElement('div'),
              mqRun,
              getEmValue,
              mqSupport,
              eminpx;

            div.id = 'mq-test-1';
            div.style.cssText = "position:absolute;top:-100em";
            fakeBody.style.background = "none";
            fakeBody.appendChild(div);

            mqRun = function (mq) {
              var bool;
              div.innerHTML = '&shy;<style media="' + mq + '"> #mq-test-1 { width: 42px; }</style>';
              docElem.insertBefore(fakeBody, refNode);
              bool = div.offsetWidth === 42;
              docElem.removeChild(fakeBody);

              return { matches: bool, media: mq };
            };

            getEmValue = function () {
              var ret,
                body = docElem.body,
                fakeUsed = false;

              div.style.cssText = "position:absolute;font-size:1em;width:1em";

              if (!body) {
                body = fakeUsed = doc.createElement("body");
                body.style.background = "none";
              }

              body.appendChild(div);

              docElem.insertBefore(body, docElem.firstChild);

              if (fakeUsed) {
                docElem.removeChild(body);
              } else {
                body.removeChild(div);
              }

              //also update eminpx before returning
              ret = eminpx = parseFloat(div.offsetWidth);

              return ret;
            };

            //cached container for 1em value, populated the first time it's needed 
            eminpx;

            // verify that we have support for a simple media query
            mqSupport = mqRun('(min-width: 0px)').matches;

            return function (mq) {
              if (mqSupport) {
                return mqRun(mq);
              } else {
                var min = mq.match(/\(min\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
                  max = mq.match(/\(max\-width:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
                  minnull = min === null,
                  maxnull = max === null,
                  currWidth = doc.body.offsetWidth,
                  em = 'em',
                  bool;

                if (!!min) { min = parseFloat(min) * (min.indexOf(em) > -1 ? (eminpx || getEmValue()) : 1); }
                if (!!max) { max = parseFloat(max) * (max.indexOf(em) > -1 ? (eminpx || getEmValue()) : 1); }

                bool = (!minnull || !maxnull) && (minnull || currWidth >= min) && (maxnull || currWidth <= max);

                return { matches: bool, media: mq };
              }
            };

          }(document));

        },

        //Define Responsive Actions for horizontal accordion
        responsiveAction : function (mq) {
          //If media query matches
          if (mq.matches) {
            $(elem).empty().removeAttr('class').addClass('accordion-ver').html(horElemContent);
            $(elem).awsAccordion({
              type : 'vertical',
              cssAttrsVer : {
                ulWidth : 'responsive',
                liHeight : settings.cssAttrsVer.liHeight
              },
              startSlide : settings.startSlide,
              openCloseHelper : {
                numeric : settings.openCloseHelper.numeric,
                openIcon : settings.openCloseHelper.openIcon,
                closeIcon : settings.openCloseHelper.closeIcon
              },
              openOnebyOne : true,
              classTab : settings.classTab,
              slideOn : settings.slideOn,
              autoPlay : settings.autoPlay,
              autoPlaySpeed : settings.autoPlaySpeed
            });
          } else {
            $(elem).empty().removeAttr('class').addClass('accordion-hor').html(horElemContent);
            $(elem).awsAccordion({
              type : 'horizontal',
              cssAttrsVer : {
                ulWidth : 'responsive',
                liHeight : settings.cssAttrsVer.liHeight
              },
              cssAttrsHor : {
                ulWidth : 'responsive',
                liWidth : settings.cssAttrsHor.liWidth,
                liHeight : settings.cssAttrsHor.liHeight,
                responsiveMedia : settings.cssAttrsHor.responsiveMedia
              },
              startSlide : settings.startSlide,
              openCloseHelper : {
                numeric : settings.openCloseHelper.numeric,
                openIcon : settings.openCloseHelper.openIcon,
                closeIcon : settings.openCloseHelper.closeIcon
              },
              classTab : settings.classTab,
              slideOn : settings.slideOn,
              autoPlay : settings.autoPlay,
              autoPlaySpeed : settings.autoPlaySpeed
            });
          }//end of matches
        }

      },

      // ### CORE
      core = {

        // bind events
        bindEvents : function () {

          //on click or mouseover
          headLis.on(settings.slideOn, core.slideContent);

          //clean up heads first
          headLis.each(core.resetSlideContent);

          //Set Visual Attributes for Accordeons
          core.setAttrs();

          //Set Autoplay
          if (settings.autoPlay) {
            methods.play();
          }

        },

        //Set Visual Attributes for Accordeons
        setAttrs : function () {

          //define i for for and mediaquerie to obtain max-width and/or min-width value defined by user 
          var i,
            mq,
            numberHeight,
            iconHeight,
            h1Height,
            h1HeightIe,
            currentHeight,
            currentWidth,
            windowHeight,
            windowWidth;

          //Set vertical accordion attrs
          if (settings.type === 'vertical') {

            //Set attrs for ul
            if ($.type(settings.cssAttrsVer.ulWidth) ===  "number") {
              $(headLis).parent().css({
                'width': settings.cssAttrsVer.ulWidth + 'px'
              });
            } else {
              $(headLis).parent().css({
                'width': '100%'
              });
            }

            //Set attrs for li
            if (settings.cssAttrsVer.liHeight) {
              $(headLis).css({
                'padding-top': settings.cssAttrsVer.liHeight + 'px'
              });
            }

            //Workout for IE bug onresize
            if (versionIE === 7 || versionIE === 8) {
              $('body').css({'height' : 'auto', 'overflow-y' : 'scroll', 'overflow-x' : 'hidden'});
            }

          }


          //Set horizontal accordion attrs
          if (settings.type === 'horizontal') {

            //Workout for IE bug onresize
            if (versionIE === 7 || versionIE === 8) {
              $('body').removeAttr('style');
            }

            //Check if ulWidth is integer
            if ($.type(settings.cssAttrsHor.ulWidth) === "number") {
              //Set attrs for ul
              $(headLis).parent().css({
                'width': settings.cssAttrsHor.ulWidth + 'px'
              });
            } else {
              //if it's 'responsive'
              //run matchQueryMedia and set mq with matchmedia
              methods.matchQueryMedia();
              mq = window.matchMedia(settings.cssAttrsHor.responsiveMedia);

              if (mq.matches) {
                //if it matches execute responsiveAction
                methods.responsiveAction(mq);
              } else {
                //if doesn't matches let horizontal still be an horizontal accordion instead of a responsive and vertical accordion and set elem parent width
                $(headLis).parent().css({
                  'width': horUlParentWidth + 'px'
                });
              }

              //Tweaking onresize method for IE7 and IE8 due to bug launching various events of onresize when body loads.
              if (versionIE === 7 || versionIE === 8) {

                $(window).resize(function () {
                  windowHeight = $(window).height();
                  windowWidth = $(window).width();

                  if (currentHeight === undefined || currentHeight !== windowHeight || currentWidth === undefined || currentWidth !== windowWidth) {

                    currentHeight = windowHeight;
                    currentWidth = windowWidth;

                    methods.matchQueryMedia();
                    mq = window.matchMedia(settings.cssAttrsHor.responsiveMedia);
                    methods.responsiveAction(mq);

                  }
                });

              } else {

                window.onresize = function (event) {
                  methods.matchQueryMedia();
                  mq = window.matchMedia(settings.cssAttrsHor.responsiveMedia);
                  methods.responsiveAction(mq);
                };

              }
            }

            //Set attrs for each li and div inside Horizontal       
            for (i = 0; i < $(headLis).parent().find('li').length; i++) {

              $(headLis).parent().find('li').eq(i).css({
                'width': settings.cssAttrsHor.liWidth + 'px',
                'height': settings.cssAttrsHor.liHeight + 'px'
              }).find('div').css({
                'left': settings.cssAttrsHor.liWidth + 'px',
                'width': methods.calcDivWidthHor() + 'px',
                'height': settings.cssAttrsHor.liHeight + 'px'
              });

            }
          }

          //Set Numeric or Icon Helper when opening and closing tabs
          if (settings.openCloseHelper) {

            if (settings.openCloseHelper.numeric) {
              //Set a number
              for (i = 0; i <= countHeads; i++) {
                $(headLis[i]).append('<span class="numericTab tab' + [ i + 1 ] + '">' + [ i + 1 ] + '</span>');
              }

            } else if (settings.openCloseHelper.openIcon) {
              //Set a icon
              for (i = 0; i <= countHeads; i++) {
                $(headLis[i]).append('<i class="icon-' + settings.openCloseHelper.openIcon + '"></i>');
              }

            }

            //Search for height attrs in number, icon and h1 and divide it by two to get their correct height
            numberHeight = parseInt($(headLis).find('span.numericTab').css("height"), 10) / 2;
            iconHeight = parseInt($(headLis).find('i').css("height"), 10) / 2;
            h1Height = parseInt($(headLis).find('h1').css("height"), 10) / 2;
            h1HeightIe = parseInt($(headLis).find('h1').css("width"), 10) / 2; //For IE height is not working, we have to use width

            //Set css attrs to Icon, Number and h1
            if (settings.type === 'horizontal') {
              if ((headLis).find('h1').length > 0) {
                //Check if it's IE
                if (versionIE === 7 || versionIE === 8 || versionIE === 9) {
                  $(headLis).find('h1').css({'top': '0px', 'width': 'auto', 'left': ((settings.cssAttrsHor.liWidth / 2) - h1HeightIe) + 'px'});
                } else {
                  $(headLis).find('h1').css('left', ((settings.cssAttrsHor.liWidth / 2) - h1Height) + 'px');
                }
              }
              if (settings.openCloseHelper) {
                if (settings.openCloseHelper.numeric) {
                  $(headLis).find('span.numericTab').css("width", settings.cssAttrsHor.liWidth + 'px');
                } else if (settings.openCloseHelper.openIcon) {
                  $(headLis).find('i').css("width", settings.cssAttrsHor.liWidth + 'px');
                }
              }
            } else if (settings.type === 'vertical') {
              if ((headLis).find('h1').length > 0) {
                $(headLis).find('h1').css('padding-top', ((settings.cssAttrsVer.liHeight / 2) - h1Height) + 'px');
              }
              if (settings.openCloseHelper) {
                if (settings.openCloseHelper.numeric) {
                  $(headLis).find('span.numericTab').css('padding-top', ((settings.cssAttrsVer.liHeight / 2) - numberHeight) + 'px');
                } else if (settings.openCloseHelper.openIcon) {
                  $(headLis).find('i').css('padding-top', ((settings.cssAttrsVer.liHeight / 2) - iconHeight) + 'px');
                }
              }
            }
          }

          // Set Open slide by default
          if (settings.startSlide) {
            if (settings.type === 'vertical') {
              core.animateSlideDown(headLis[settings.startSlide - 1]); //Minus 1 to start array in 1 and not in 0
            } else {
              core.animateSlideRight(headLis[settings.startSlide - 1]); //Minus 1 to start array in 1 and not in 0
            }
            //Insert Close icon if exists
            if (settings.openCloseHelper.closeIcon) {
              $(headLis[settings.startSlide - 1]).find('i').attr("class", 'icon-' + settings.openCloseHelper.closeIcon);
            }

            //and if exists a class name for tab set it then
            if (settings.classTab) {
              $(headLis[settings.startSlide - 1]).addClass(settings.classTab);
            }
          }

          //Give class last to last li
          $(headLis).last().addClass('last');

        },

        // Slide Content
        slideContent : function (ev) {

          //prevent on div selector, preventing from clicking or mouseovering div
          if ($(ev.target).is("div") || $(ev.target).parent().is("div")) {
            return false;
          }

          var selector = $(ev.currentTarget),
            visibleElements = $(selector).parent().find('div:visible');

          //Check if is at autoPlay and if it has been clicked by user
          if (settings.autoPlay && !ev.isTrigger) {
            //Stop autoPlay
            methods.stop();
          }

          //Open one by one only for vertical accordion
          if (settings.openOnebyOne && (visibleElements.length > 0) && settings.type === 'vertical') {
            core.animateSlideUp(visibleElements);
          }

          //Check if is there any visible div
          if (settings.type === 'vertical') {
            if ($(selector).find('div').is(":visible")) {
              core.animateSlideUp(selector);
            } else {
              core.animateSlideDown(selector);
            }
          } else {
            if ($(selector).find('div').is(":hidden")) {
              //Animate Right LI
              core.animateSlideRight(selector);
              //Animate Left visible divs
              core.animateSlideLeft(visibleElements);
            }
          }
        },

        // Slide Up
        animateSlideUp : function (selector) {

          //check if is onebyone, target must be <ul> else we remove parent to target <li>
          if (settings.openOnebyOne) {
          //if has anykind of class remove it and close tab
            if ($(selector).parent().hasClass('last')) {
              $(selector).parent().removeClass(settings.classTab).find('div').slideUp('fast');
            } else {
              $(selector).parent().removeAttr('class').find('div').slideUp('fast');
            }
          } else {
            if ($(selector).hasClass('last')) {
              $(selector).removeClass(settings.classTab).find('div').slideUp('fast');
            } else {
              $(selector).removeAttr('class').find('div').slideUp('fast');
            }
          }

          //If it has a openIcon set it
          if (settings.openCloseHelper.openIcon) {
            $(selector).parent().find('i').attr("class", 'icon-' + settings.openCloseHelper.openIcon);
          }
        },

        // Slide Down
        animateSlideDown : function (selector) {

          //Check classTab and remove it
          $(selector).parent().find('.' + settings.classTab).removeAttr('class');

          //Check if it has a closeIcon
          if (settings.openCloseHelper.closeIcon) {
            //When init accordion length is 1 because it targets directly li, but after that we need to add parent for searching inside li
            if ($(selector).find('i').length > 0) {
              $(selector).find('i').attr("class", 'icon-' + settings.openCloseHelper.closeIcon);
            } else {
              $(selector).parent().find('i').attr("class", 'icon-' + settings.openCloseHelper.closeIcon);
            }
          }

          //Add classTab to current selector if needed and slidedown
          $(selector).addClass(settings.classTab).find('div').slideDown('fast');

        },

        // Slide Right
        animateSlideRight : function (selector) {

          //Check classTab and remove it
          $(selector).parent().find('.' + settings.classTab).removeClass(settings.classTab); 

          //Check if it has a closeIcon
          if (settings.openCloseHelper.closeIcon) {
            //When init accordion length is 1 because it targets directly li, but after that we need to add parent for searching inside li
            if ($(selector).find('i').length > 0) {
              $(selector).find('i').attr("class", 'icon-' + settings.openCloseHelper.closeIcon);
            } else {
              $(selector).parent().find('i').attr("class", 'icon-' + settings.openCloseHelper.closeIcon);
            }
          }

          //Add classTab to current selector and animate right
          $(selector).addClass(settings.classTab).animate({width: (methods.calcDivWidthHor() + settings.cssAttrsHor.liWidth) + 'px'}, 'fast');
          $(selector).find('div').css('display', 'block');
        },

        // Slide Right
        animateSlideLeft : function (selector) {

          //Define display none at the very beginning
          $(selector).parent().find('div').animate({width: '0px'}, 'fast', function () {
            $(this).css({'display': 'none', 'width': methods.calcDivWidthHor() + 'px'});
          });

          //if has anykind of class remove it and close tab
          if ($(selector).parent().hasClass('last')) {
            $(selector).parent().removeClass(settings.classTab).animate({width: settings.cssAttrsHor.liWidth + 'px'}, 'fast');
          } else {
            $(selector).parent().removeAttr('class').animate({width: settings.cssAttrsHor.liWidth + 'px'}, 'fast');
          }

          //If it has a openIcon set it
          if (settings.openCloseHelper.openIcon) {
            $(selector).parent().find('i').attr("class", 'icon-' + settings.openCloseHelper.openIcon);
          }
        },

        // Hide all open content ehen initializing
        resetSlideContent : function () {
          headLis.find('div').hide();
        },

        //Initialize Core
        init : function () {

          //Set Class hor or ver to our accordion
          if (settings.type === 'vertical') {
            $(elem).addClass('accordion-ver');
          } else {
            $(elem).addClass('accordion-hor');
          }
          // init events
          core.bindEvents();
        }

      };

    // ### INITIALIZE CORE
    core.init();

    // ### RETURN METHODS
    return methods;

  };

  // ### CALL JQUERY AWS ACCORDION PLUGIN
  $.fn.awsAccordion = function (options) {
    var elem = this;

    return elem.each(function () {
      var awsAccordion;
      awsAccordion = new AwsAccordion(elem, options);
      elem.data('awsAccordion', awsAccordion);
    });
  };

}(jQuery));