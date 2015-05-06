(function($) {
    // Constants
    var KEY_ENTER = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_PRESS_INTERVAL = 300; // 按键间隔（毫秒）用来触发搜索

    var preventDefault = function(event) {
        if (event && event.preventDefault)
            event.preventDefault();
        else
            window.event.returnValue = false;
        return false;
    };

    var StocksBox = (function() {

        var $stocksBoxCopy = $(
            '<div class="stocks-box-container">' +
            '<div class="stocks-box-title">请输入您要添加的股票代码</div>' +
            '<ul class="stocks-box-list"></ul>' +
            '</div>' +
            '<div class="widget-to-location">' +
            '<span data-before></span>' +
            '<span data-flag>$</span>' +
            '<span data-after></span>' +
            '</div>'
        );


        var $popupCloseCopy = $('<div class="school-box-popup-close"><a href="javascript:void(0)" title="关闭">X</a></div>');

        var $provinceCopy = $('<a href="javascript:void(0)" class="province-item"></a>');
        var $schoolCopy = $('<a href="javascript:void(0)" class="school-item"></a>');

        var fixPosition = function($slef, val) {
            var tWidth = $slef.outerWidth();
            var tHeight = $slef.outerHeight();
            var tPos = $slef.offset();
            var move2Top = tPos.top + tHeight;
            var move2Left = tPos.left;
            var widget2Location = $('.widget-to-location');
            // var tVal = val.replace(/$/, '<span data-flag>$</span>');
            tVal = val.replace(/\n/g, "<br/>");
            splitVal(tVal, widget2Location);

            widget2Location.css({
                'width': tWidth,
                'height': tHeight,
                'top': move2Top,
                'left': move2Left
            });

            var lastSpan = widget2Location.find('span[data-flag]');
            var lastSpanPos = lastSpan.offset();
            console.log(lastSpanPos.left, lastSpanPos.top)
            $('.stocks-box-container').css({
                left: (lastSpanPos.left) + 'px',
                top: (lastSpanPos.top - tHeight + 15) + 'px'
            });
        }

        var stocksSearch = function(searchVal) {
            var wizard = new HsDataFactoryList['wizard']({
                prod_code: searchVal,
                en_finance_mic: 'SS,SZ'
            });
            wizard.onDataReady(function(data) {
                updateSearch(data)

            }).init()
        }

        var updateSearch = function(data) {
            $('.stocks-box-list').empty();
            for (var i = 0; i < data.length; i++) {
                var codeGroup = data[i]['prod_code'].split('.');
                if (codeGroup[1] == 'SS') {
                    codeGroup[1] = 'SH'
                }
                $('.stocks-box-list').append('<li class="stocks-box-item">' + data[i]['prod_name'] + '(' + codeGroup[1] + codeGroup[0] + ')' + '</li>');
            }
        }

        $(document).on('click', '.stocks-box-item', function(event) {

            var val = $('.widget-focus').val();
            var originalVal = $('.widget-to-location').find('[data-before]').html();
            var addVal = $(this).text();
            $('.widget-focus').val(originalVal + '$' + addVal + '$').focus();
            $('.stocks-box-container').hide();
        })

        $('.widget-focus').on('keyup', function(event) {


            // // when正常输入
            // initSearchSchool.currentTime = (new Date()).getTime();
            // // NOTE: 持续快速输入时不触发搜索
            // if (initSearchSchool.currentTime - initSearchSchool.lastKeypressTime > KEY_PRESS_INTERVAL) {
            //     initSearchSchool.lastKeypressTime = initSearchSchool.currentTime;
            //     searchSchool(keywords, $searchListContainer, $searchList, $searchEmpty);
            // }
        });

        var searchListScroll = function(isDown, $searchListContainer, $searchList) {
            var scrollTop = $searchListContainer.scrollTop();
            var viewMin = scrollTop;
            var viewMax = viewMin + $searchListContainer.height();

            var $target = $searchList.children('li.active');
            var deltaOffset = $target.offset().top - $searchListContainer.offset().top + scrollTop;
            isDown && (deltaOffset += $target.height());

            // deltaOffset要在视窗范围里
            if (deltaOffset > viewMax) {
                $searchListContainer.animate({
                    scrollTop: scrollTop + deltaOffset - viewMax
                }, 'fast');
            } else if (deltaOffset < viewMin) {
                $searchListContainer.animate({
                    scrollTop: scrollTop - (viewMin - deltaOffset)
                }, 'fast');
            }
        };

        var searchListScrollPrev = function($searchListContainer, $searchList) {
            var $cur = $searchList.children('li.active');
            $cur.removeClass && $cur.removeClass('active');

            if ($cur.length == 0 || $cur.index() == 0) {
                $searchList.children('li').last().addClass('active');
                searchListScroll(true, $searchListContainer, $searchList);
            } else {
                $searchList.children('li').eq($cur.index() - 1).addClass('active');
                searchListScroll(false, $searchListContainer, $searchList);
            }
        };

        var searchListScrollNext = function($searchListContainer, $searchList) {
            var $cur = $searchList.children('li.active');
            $cur.removeClass && $cur.removeClass('active');

            if ($cur.length == 0 || $cur.index() == $searchList.children().length - 1) {
                $searchList.children('li').first().addClass('active');
                searchListScroll(false, $searchListContainer, $searchList);
            } else {
                $searchList.children('li').eq($cur.index() + 1).addClass('active');
                searchListScroll(true, $searchListContainer, $searchList);
            }
        };

        var searchSchoolChosen = function($searchList) {
            // 转向click event
            $searchList.children('li.active').click();
        };

        var splitVal = function(val, target) {
            var valArr = val.split('$');
            var strBefore = valArr.slice(0, valArr.length - 1).join('$');
            var strAfter = valArr.slice(-1);
            if (strBefore.length > 0) {
                target.find('span[data-before]').text(strBefore)
            } else {
                target.find('span[data-before]').text(' ')
            };
            target.find('span[data-after]').text(strAfter);
        }


        var init = function(instance) {
            // 生成元素
            var $parent = $(instance.opts.appendTo);

            $parent.append($stocksBoxCopy.clone());
            var widget2Location = $('.widget-to-location');
            var $searchListContainer = $parent.find('.stocks-box-container');
            var $searchList = $parent.find('.stocks-box-list');

            $parent.on('keyup', '[widget-add-stocks]', function(event) {
                $('[widget-add-stocks]').removeClass('widget-focus');
                $(this).addClass('widget-focus');

                // 特殊按键（动作键）
                if (event.keyCode == KEY_ENTER) {
                    searchSchoolChosen($searchList);
                    return preventDefault(event);
                    return false;
                }
                if (event.keyCode == KEY_UP) {
                    searchListScrollPrev($searchListContainer, $searchList);
                    return preventDefault(event);
                    return false;
                }
                if (event.keyCode == KEY_DOWN) {
                    searchListScrollNext($searchListContainer, $searchList);
                    return preventDefault(event);
                    return false;
                }


                var val = $(this).val();
                var lastVal = val.substr(-1);
                var $self = $(this);
                if (lastVal === '$') {
                    fixPosition($self, val);
                    $('.stocks-box-container').show();
                    splitVal(val, widget2Location)
                }

                var spanBeforLength = widget2Location.find('span[data-before]').text().length;
                var spanAfterLength = widget2Location.find('span[data-after]').text().length;

                if (spanBeforLength > 0 || spanAfterLength > 0) {
                    splitVal(val, widget2Location);
                    console.log(spanAfterVal)
                    var spanAfterVal = widget2Location.find('span[data-after]').text()
                    stocksSearch(spanAfterVal)
                }


                // var keywords = $.trim($(this).val());
                // // 空格or拼音没输完时暂不search
                // if (keywords.length == 0 || keywords.indexOf("'") > -1) {
                //     $searchListContainer.hide();
                //     return false;
                // }
            });


        };

        // ***************
        // 真正的构造函数
        // ***************
        return function(options) {
            // 默认配置
            this.opts = $.extend({
                appendTo: 'body',
            }, options);

            // 即popup效果
            if (this.opts.appendTo === 'body') {
                this.opts.popup = true;
            }

            // 自定义事件观察者
            this.handlers = {};

            // 初始化生成
            init(this);
            this.init();
        };
    })();


    // *********
    // 对外API
    // *********
    StocksBox.prototype = {
        unbind: function(type) {
            this.handlers[type] = [];
            return this;
        },
        on: function(type, handler) {
            if (typeof this.handlers[type] === 'undefined') {
                this.handlers[type] = [];
            }
            this.handlers[type].push(handler);
            return this;
        },
        fire: function(type, data) {
            if (this.handlers[type] instanceof Array) {
                var handlers = this.handlers[type];
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i](data);
                }
            }
        },
        init: function() {
            // popup时初始化隐藏
            if (this.opts.popup) {
                // $(this.opts.appendTo).find('.stocks-box-container').addClass('school-box-hide');
            }
        },
        show: function() {
            $(this.opts.appendTo).find('.stocks-box-container')
                .removeClass('hide')
        },
        hide: function() {
            $(this.opts.appendTo).find('.stocks-box-container')
                .addClass('hide');
        }
    };

    // export
    window.StocksBox = StocksBox;

})(jQuery);