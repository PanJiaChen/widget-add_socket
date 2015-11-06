(function($) {

    // keycode
    var KEY_ENTER = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_SPACE = 32;
    var KEY_CANCEL = 8;
    var KEY_PRESS_INTERVAL = 200; // 按键间隔（毫秒）用来触发搜索
    var KEY_DOLLAR=36; //$ keycode

    //由于恒生暂时不支持中文
    var valReg = /[^a-z0-9]+/gi;

    var preventDefault = function(event) {
        if (event && event.preventDefault)
            event.preventDefault();
        else
            window.event.returnValue = false;
        return false;
    };

    var StocksBox = (function() {

        var $stocksBoxCopy = $(
            '<div class="widget-stocks-container">' +
            '<div class="stocks-box-title">请输入您要添加的股票代码/首字母</div>' +
            '<ul class="stocks-box-list"></ul>' +
            '</div>' +
            '<div class="widget-to-location">' +
            '<span data-before></span>' +
            '<span data-flag></span>' +
            '<span data-search>$</span>' +
            '<span data-after></span>' +
            '</div>'
        );

        var fixPosition = function($self, val) {
            var tWidth = $self.outerWidth();
            var tHeight = $self.outerHeight();
            var tPos = $self.offset();
            var tpadTop = $self.css('padding-top');
            var tpadLeft = $self.css('padding-left');
            var move2Top = tPos.top + tHeight;
            var move2Left = tPos.left;
            var widget2Location = $('.widget-to-location');

            tVal = val.replace(/\n/g, "<br/>");
            splitVal(tVal, widget2Location);

            widget2Location.css({
                'width': tWidth,
                'height': tHeight,
                'top': move2Top,
                'left': move2Left,
                'padding-top': tpadTop,
                'padding-left': tpadLeft
            });

            var lastSpan = widget2Location.find('span[data-flag]');
            var lastSpanPos = lastSpan.offset();

            $('.widget-stocks-container').css({
                left: (lastSpanPos.left + 20) + 'px',
                top: (lastSpanPos.top - tHeight + 30) + 'px'
            });
        }

        var stocksSearch = function(searchVal, $searchList) {
            console.log('apple')
            var trueSearchVal = searchVal.replace(valReg, '');
            var wizard = new HsDataFactoryList['wizard']({
                prod_code: trueSearchVal,
                en_finance_mic: 'SS,SZ'
            });
            wizard.onDataReady(function(data) {

                updateSearch(data, $searchList)

            }).init()
        }

        var updateSearch = function(data, $searchList) {
            $searchList.empty();
            for (var i = 0; i < data.length; i++) {
                var codeGroup = data[i]['prod_code'].split('.');
                if (codeGroup[1].toUpperCase() == 'SS') {
                    codeGroup[1] = 'SH'
                }
                $searchList.append('<li class="stocks-box-item">' + data[i]['prod_name'] + '(' + codeGroup[1] + codeGroup[0] + ')' + '</li>');
            }
        }

        var searchListScroll = function(isDown, $searchListContainer, $searchList) {
            var scrollTop = $searchListContainer.scrollTop();
            var viewMin = scrollTop;
            var viewMax = viewMin + $searchListContainer.height();

            var $target = $searchList.children('li.active');
            var deltaOffset = $target.offset().top - $searchListContainer.offset().top + scrollTop;
            isDown && (deltaOffset += $target.height());

            // deltaOffset要在视窗范围里
            if (deltaOffset > viewMax) {
                $searchListContainer.scrollTop(scrollTop + deltaOffset - viewMax)
            } else if (deltaOffset < viewMin) {
                $searchListContainer.scrollTop(scrollTop - (viewMin - deltaOffset))
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
            target.find('span[data-before]').html(strBefore)
            target.find('span[data-after]').html(strAfter);
        }

        var splitTagVal = function(val,cur, target) {
            var curPos=cursorPosition.get(cur).end;
            var strBefore = val.substr(0, curPos)+('$');
            var strAfter=val.substr(curPos);
            target.find('span[data-flag]').html(curPos)
            target.find('span[data-before]').html(strBefore)
            target.find('span[data-after]').html(strAfter);
        }

        var calSearchStr=function(val,cur,target){
            var start=target.find('span[data-flag]').html();
            var end=cursorPosition.get(cur).end;
            var searchStr = val.substr(+start+1, +end);
            return searchStr
        }
        var cursorPosition = {
            get: function (textarea) {
                var rangeData = {text: "", start: 0, end: 0 };
            
                if (textarea.setSelectionRange) { // W3C    
                    textarea.focus();
                    rangeData.start= textarea.selectionStart;
                    rangeData.end = textarea.selectionEnd;
                    rangeData.text = (rangeData.start != rangeData.end) ? textarea.value.substring(rangeData.start, rangeData.end): "";
                } else if (document.selection) { // IE
                    textarea.focus();
                    var i,
                        oS = document.selection.createRange(),
                        // Don't: oR = textarea.createTextRange()
                        oR = document.body.createTextRange();
                    oR.moveToElementText(textarea);
                    
                    rangeData.text = oS.text;
                    rangeData.bookmark = oS.getBookmark();
                    
                    // object.moveStart(sUnit [, iCount]) 
                    // Return Value: Integer that returns the number of units moved.
                    for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i ++) {
                        // Why? You can alert(textarea.value.length)
                        if (textarea.value.charAt(i) == '\r' ) {
                            i ++;
                        }
                    }
                    rangeData.start = i;
                    rangeData.end = rangeData.text.length + rangeData.start;
                }
                return rangeData;
            },
            
            set: function (textarea, rangeData) {
                var oR, start, end;
                if(!rangeData) {
                    alert("You must get cursor position first.")
                }
                textarea.focus();
                if (textarea.setSelectionRange) { // W3C
                    textarea.setSelectionRange(rangeData.start, rangeData.end);
                } else if (textarea.createTextRange) { // IE
                    oR = textarea.createTextRange();
                    
                    // Fixbug : ues moveToBookmark()
                    // In IE, if cursor position at the end of textarea, the set function don't work
                    if(textarea.value.length === rangeData.start) {
                        //alert('hello')
                        oR.collapse(false);
                        oR.select();
                    } else {
                        oR.moveToBookmark(rangeData.bookmark);
                        oR.select();
                    }
                }
            },

            add: function (textarea, rangeData, text) {
                var oValue, nValue, oR, sR, nStart, nEnd, st;
                this.set(textarea, rangeData);
                
                if (textarea.setSelectionRange) { // W3C
                    oValue = textarea.value;
                    nValue = oValue.substring(0, rangeData.start) + text + oValue.substring(rangeData.end);
                    nStart = nEnd = rangeData.start + text.length;
                    st = textarea.scrollTop;
                    textarea.value = nValue;
                    // Fixbug:
                    // After textarea.values = nValue, scrollTop value to 0
                    if(textarea.scrollTop != st) {
                        textarea.scrollTop = st;
                    }
                    textarea.setSelectionRange(nStart, nEnd);
                } else if (textarea.createTextRange) { // IE
                    sR = document.selection.createRange();
                    sR.text = text;
                    sR.setEndPoint('StartToEnd', sR);
                    sR.select();
                }
            }
        }




        var init = function(instance) {
            // 生成元素
            var $parent = $(instance.opts.appendTo);
            $parent.append($stocksBoxCopy.clone());

            var timeClock; //计时器
            // 记录上次搜索输入的timestamp
            // 
            var pressPool='';

            var widget2Location = $('.widget-to-location');
            var $searchListContainer = $parent.find('.widget-stocks-container');
            var $searchList = $parent.find('.stocks-box-list');
            var $spanFlag = widget2Location.find('span[data-flag]');
            var $spanAfter = widget2Location.find('span[data-after]');

            //click事件
            $(document).on('click', '.stocks-box-item', function(event) {
                var val = $('.widget-focus').val();
                var originalVal = widget2Location.find('[data-before]').html();
                var addVal = $(this).text();
                console.log('originalVal'+originalVal)
                console.log('addVal'+addVal)
                $('.widget-focus').val(originalVal + addVal + '$ ').focus();
                $searchListContainer.hide();
                $spanFlag.attr('data-flag', 'false');
            })

            //hover事件
            $(document).on('mouseover mouseout', '.stocks-box-item', function() {
                if (event.type == "mouseover") {
                    $(this).addClass('active');
                } else if (event.type == "mouseout") {
                    $(this).removeClass('active');
                }
            })


            //按键事件
            $parent.on('keypress', '[widget-add-stocks]', function(event) {
                //通过widget-focus类判断对象 
                $('[widget-add-stocks]').removeClass('widget-focus');
                $(this).addClass('widget-focus');

                clearTimeout(timeClock);

                var val = $(this).val();
                
                var pressKeyCode=event.which || event.keyCode;
                var lastVal = val.substr(-1);
                var $self = $(this);

                if ($spanFlag.attr('data-flag') == 'true') {
                    
                }

                if (pressKeyCode == KEY_DOLLAR ) {
                    fixPosition($self, val);
                    $searchListContainer.show();
                    $searchList.empty();
                    // splitVal(val, widget2Location);
                    splitTagVal(val,$(this)[0],widget2Location);
                    $spanFlag.attr('data-flag', 'true');
                    pressPool=''
                }

            });

            $parent.on('keyup','[widget-add-stocks]',function(event){
                if($spanFlag.attr('data-flag') == 'true'){

                    var val = $(this).val();
                    var searchStr=calSearchStr(val,$(this)[0],widget2Location);
                    // widget2Location.find('span[data-search]').html(pressPool);
                    // NOTE: 持续快速输入时不触发搜索
                    console.log(searchStr)
                    timeClock = setTimeout(function() {
                        searchStr.length >= 2 && stocksSearch(searchStr, $searchList);
                    }, 300)

                     // 特殊按键（动作键）
                    switch (event.keyCode) {
                        case KEY_ENTER:
                            searchSchoolChosen($searchList);
                            return preventDefault(event);
                            break;
                        case KEY_UP:
                            searchListScrollPrev($searchListContainer, $searchList);
                            return preventDefault(event);
                            break;
                        case KEY_DOWN:
                            console.log('down')
                            searchListScrollNext($searchListContainer, $searchList);
                            return preventDefault(event);
                            break;
                        case KEY_SPACE:
                            $searchListContainer.hide();
                            $spanFlag.attr('data-flag', 'false');
                            $searchList.empty();
                            break;
                            // case KEY_CANCEL:
                            //     $searchListContainer.hide();
                            //     $spanFlag.attr('data-flag', 'false');
                            //     $searchList.empty();
                            //     break;
                        default:
                            break;
                    }

                }
            })

        };

        // ***************
        // 
        // ***************
        return function(options) {
            // 默认配置
            this.opts = $.extend({
                appendTo: 'body',
            }, options);

            // 即popup效果
            // if (this.opts.appendTo === 'body') {
            //     this.opts.popup = true;
            // }

            // 自定义事件观察者
            this.handlers = {};

            // 初始化生成
            init(this);
            // this.init();
        };
    })();


    // *********
    // 对外API
    // *********
    StocksBox.prototype = {
        // init: function() {
        //     // popup时初始化隐藏
        //     if (this.opts.popup) {
        //         // $(this.opts.appendTo).find('.widget-stocks-container').addClass('school-box-hide');
        //     }
        // },
        show: function(self) {
            var targetTextarea = self.closest('div').find('[widget-add-stocks]');
            var val = targetTextarea.val();
            targetTextarea.focus().val(val + '$').keyup();
        },
        // hide: function() {
        //     $(this.opts.appendTo).find('.widget-stocks-container')
        //         .addClass('hide');
        // }
    };

    // export
    window.StocksBox = StocksBox;

})(jQuery);
