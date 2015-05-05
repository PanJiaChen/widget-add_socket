(function($) {
    // Constants
    var KEY_ENTER = 13;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_PRESS_INTERVAL = 300; // 按键间隔（毫秒）用来触发搜索


    var SocketsBox = (function() {

        var $socketsBoxCopy = $(
            '<div class="sockets-box-container">' +
            '<div class="sockets-box-title">请输入您要添加的股票代码</div>' +
            '<ul class="sockets-box-list"></ul>' +
            '</div>' +
            '<div class="widget-to-location">'+
            '<span data-before></span>'+
            '<span data-flag></span>'+
            '<span data-after></span>'+
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
            var tVal = val.replace(/$/, '<span data-flag>$</span>');
            tVal = tVal.replace(/\n/g, "<br/>");
            var widget2Location = $('.widget-to-location');
            widget2Location.html(tVal)
                .css({
                    'width': tWidth,
                    'height': tHeight,
                    'top': move2Top,
                    'left': move2Left
                });

            var lastSpan = widget2Location.find('span:last');
            var lastSpanPos = lastSpan.offset();
            console.log(lastSpanPos.left, lastSpanPos.top)
            $('.sockets-box-container').css({
                left: (lastSpanPos.left) + 'px',
                top: (lastSpanPos.top - tHeight + 15) + 'px'
            });
        }

        // var initSearch = function() {
        //     var socketVal = val.split('$');
        //     socketVal = socketVal[socketVal.length - 1];
        //     console.log(socketVal)
        //     $parent.on('input propertychange', '[widget-add-sockets]', function(event){

        //     });
        //     var wizard = new HsDataFactoryList['wizard']({
        //         prod_code: socketVal,
        //         en_finance_mic: 'SS,SZ'
        //     });
        //     wizard.onDataReady(function(data) {
        //         console.log(wizard.data[0].prod_code)
        //     }).init()
        // }

        var changeFlag=function(){

        }

        var init = function(instance) {
            // 生成元素
            var $parent = $(instance.opts.appendTo);

            $parent.append($socketsBoxCopy.clone());

            $parent.on('input propertychange', '[widget-add-sockets]', function(event) {
                var val = $(this).val();
                var lastVal = val.substr(-1);
                var $self = $(this);
                if (lastVal === '$') {
                    
                    fixPosition($self, val);
                    $('.sockets-box-container').show();
                    
                }

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
    SocketsBox.prototype = {
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
                $(this.opts.appendTo).find('.sockets-box-container').addClass('school-box-hide');
            }
        },
        show: function() {
            $(this.opts.appendTo).find('.sockets-box-container')
                .removeClass('hide')
        },
        hide: function() {
            $(this.opts.appendTo).find('.sockets-box-container')
                .addClass('hide');
        }
    };

    // export
    window.SocketsBox = SocketsBox;

})(jQuery);
