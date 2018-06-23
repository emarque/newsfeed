(function($) {
    "use strict";
    $.breakingNews = function(element, options) {

        var defaults = {
            effect      : 'scroll',
            direction   : 'ltr',
            height      : 40,
            fontSize    : "default",
            themeColor  : "default",
            background  : "default",
            borderWidth : 1,
            radius      : 2,
            source      : "html",
            play        : true,
            delayTimer  : 15000,
            scrollSpeed : 2000,
            stopOnHover : true,
            position    : 'auto',
            zIndex      : 99999,
            animateSpeed: 3000
        }

        var ticker = this;
        ticker.settings = {}

        var $element = $(element);
        var element = element;
        
        var _label = $element.children(".bn-label"),
            _news = $element.children(".bn-news"),
            _ul = _news.children("ul"),
            _li = _ul.children("li"),
            _controls = $element.children(".bn-controls"),
            _prev = _controls.find(".bn-prev").parent(),
            _action = _controls.find(".bn-action").parent(),
            _next = _controls.find(".bn-next").parent();

        var _pause = false;
        var _controlsIsActive = true;
        var _totalNews = _ul.children("li").length;
        var _activeNews = 0;
        var _interval = false;

        /****************************************************/
        /**PRIVATE METHODS***********************************/
        /****************************************************/
        var initializeSettings = function() {
            if (ticker.settings.position === 'fixed-top')
                $element.addClass('bn-fixed-top').css({'z-index': ticker.settings.zIndex});
            else if (ticker.settings.position === 'fixed-bottom')
                $element.addClass('bn-fixed-bottom').css({'z-index': ticker.settings.zIndex});

            if (ticker.settings.fontSize != 'default')
            {
                $element.css({
                    'font-size'     : ticker.settings.fontSize
                });
            }

            if (ticker.settings.themeColor != 'default')
            {
                $element.css({
                    'border-color'  : ticker.settings.themeColor,
                    'color'         : ticker.settings.themeColor
                });

                _label.css({
                    'background'    : ticker.settings.themeColor
                });
            }

            if (ticker.settings.background != 'default')
            {
                $element.css({
                    'background'    : ticker.settings.background
                });
            }

            $element.css({
                //'height'        : ticker.settings.height,
                //'line-height'   : (ticker.settings.height-(ticker.settings.borderWidth*2))+'px',
                'border-radius' : ticker.settings.radius,
                'border-width'  : ticker.settings.borderWidth
            });

            
            _li.find('.bn-seperator').css({
                'height': ticker.settings.height-(ticker.settings.borderWidth*2)
            });
                    
        }

        var setContainerWidth = function(){
            if (_label.length > 0){
                if (ticker.settings.direction == 'rtl')
                    _news.css({"right":_label.outerWidth()});
                else
                    _news.css({"left":_label.outerWidth()});
            }

            if (_controls.length > 0){
                var controlsWidth = _controls.outerWidth();
                if (ticker.settings.direction == 'rtl')
                    _news.css({"left":controlsWidth});
                else
                    _news.css({"right":controlsWidth});
            }    

            if (ticker.settings.effect === 'scroll')
            {
                var totalW = 0;
                _li.each(function(){
                    totalW += $(this).outerWidth();
                });
                totalW += 10;
                _ul.css({'width':totalW});
            }
        }

        var loadDataWithRSS2JSON = function(){
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function(){
                if (xhr.readyState==4 && xhr.status==200)
                {
                    var obj = JSON.parse(xhr.responseText);
                    var items = '';
                    var showingField = '';
                    switch (ticker.settings.source.showingField){
                        case 'title':
                            showingField = 'title';
                            break;
                        case 'description':
                            showingField = 'description';
                            break;
                        case 'link':
                            showingField = 'link';
                            break;
                        default:
                            showingField = 'title';
                    }
                    var seperator = '';
                    if (typeof ticker.settings.source.seperator != 'undefined' && typeof ticker.settings.source.seperator !== undefined)
                        seperator = ticker.settings.source.seperator;


                    for (var i = 0; i < obj.items.length; i++){
                        if (ticker.settings.source.linkEnabled)
                            items += '<li><a target="'+ticker.settings.source.target+'" href="'+obj.items[i].link+'">'+seperator+obj.items[i][showingField]+'</a></li>';
                        else
                            items += '<li><a>'+seperator+obj.items[i][showingField]+'</a></li>';
                    }
                    _ul.empty().append(items);
                    _li = _ul.children("li");
                    _totalNews = _ul.children("li").length;
                    setContainerWidth();
                    if (ticker.settings.effect != 'scroll')
                        showThis();

                    _li.find('.bn-seperator').css({
                        'height': ticker.settings.height-(ticker.settings.borderWidth*2)
                    });

                    playHandler();
                }
            };
            xhr.open(
                'GET',
                'https://api.rss2json.com/v1/api.json?rss_url='+ticker.settings.source.url,
                true
            );
            xhr.send();
        }

        var loadDataWithYQL = function(){
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('GET', 'https://query.yahooapis.com/v1/public/yql?q='+encodeURIComponent('select * from rss where url="'+ticker.settings.source.url+'" limit '+ticker.settings.source.limit)+'&format=json', true);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    if(xmlhttp.status == 200) {
                        var obj = JSON.parse(xmlhttp.responseText);
                        var items = '';
                        var showingField = '';
                        switch (ticker.settings.source.showingField){
                            case 'title':
                                showingField = 'title';
                                break;
                            case 'description':
                                showingField = 'description';
                                break;
                            case 'link':
                                showingField = 'link';
                                break;
                            default:
                                showingField = 'title';
                        }
                        var seperator = '';
                        if (ticker.settings.source.seperator != 'undefined' && ticker.settings.source.seperator !== undefined)
                            seperator = ticker.settings.source.seperator;

                        for (var i = 0; i < obj.query.results.item.length; i++){
                            if (ticker.settings.source.linkEnabled)
                                items += '<li><a target="'+ticker.settings.source.target+'" href="'+obj.query.results.item[i].link+'">'+seperator+obj.query.results.item[i][showingField]+'</a></li>';
                            else
                                items += '<li><a>'+seperator+obj.query.results.item[i][showingField]+'</a></li>';
                        }
                        _ul.empty().append(items);
                        _li = _ul.children("li");
                        _totalNews = _ul.children("li").length;
                        setContainerWidth();
                        if (ticker.settings.effect != 'scroll')
                            showThis();

                        _li.find('.bn-seperator').css({
                            'height': ticker.settings.height-(ticker.settings.borderWidth*2)
                        });

                        playHandler();
                    }
                    else
                        _ul.empty().append('<li><span class="bn-loader-text">'+ticker.settings.source.errorMsg+'</span></li>');
                }
            };
            xmlhttp.send(null);
        }

        var loadJSON = function(){
            $.getJSON( ticker.settings.source.url, function( data ) {
                var items = '';

                var showingField = '';
                if (ticker.settings.source.showingField === 'undefined')
                    showingField = 'title';
                else
                    showingField = ticker.settings.source.showingField;

                var seperator = '';
                    if (typeof ticker.settings.source.seperator != 'undefined' && typeof ticker.settings.source.seperator !== undefined)
                        seperator = ticker.settings.source.seperator;

                for (var i = 0; i < data.length; i++){
                    if (i >= ticker.settings.source.limit)
                        break;

                    if (ticker.settings.source.linkEnabled)
                        items += ( '<li><a target="'+ticker.settings.source.target+'" href="'+data[i].link+'">'+seperator+data[i][showingField]+'</a></li>' );
                    else
                        items += ( '<li><a>'+seperator+data[i][showingField]+'</a></li>' );
                    if (data[i][showingField] === 'undefined')
                        console.log('"'+showingField+'" does not exist in this json.')
                }

                _ul.empty().append(items);
                _li = _ul.children("li");
                _totalNews = _ul.children("li").length;
                setContainerWidth();
                if (ticker.settings.effect != 'scroll')
                    showThis();

                _li.find('.bn-seperator').css({
                    'height': ticker.settings.height-(ticker.settings.borderWidth*2)
                });
                
                playHandler();
            });
        }

        var startScrollAnimationLTR = function(){
            var _ulPosition = parseFloat(_ul.css('marginLeft'));
            _ulPosition -= ticker.settings.scrollSpeed/2;
            _ul.css({'marginLeft': _ulPosition });

            if (_ulPosition <= -_ul.find('li:first-child').outerWidth())
            {
                _ul.find('li:first-child').insertAfter(_ul.find('li:last-child'));
                _ul.css({'marginLeft': 0 });
            }
            if (_pause === false)
                (window.requestAnimationFrame && requestAnimationFrame(startScrollAnimationLTR)) || setTimeout(startScrollAnimationLTR, 16);
        }

        var startScrollAnimationRTL = function(){
            var _ulPosition = parseFloat(_ul.css('marginRight'));
            _ulPosition -= ticker.settings.scrollSpeed/2;
            _ul.css({'marginRight': _ulPosition });

            if (_ulPosition <= -_ul.find('li:first-child').outerWidth())
            {
                _ul.find('li:first-child').insertAfter(_ul.find('li:last-child'));
                _ul.css({'marginRight': 0 });
            }
            if (_pause === false)
                (window.requestAnimationFrame && requestAnimationFrame(startScrollAnimationRTL)) || setTimeout(startScrollAnimationRTL, 16);
        }

        var scrollPlaying = function(){
            if (ticker.settings.direction === 'rtl')
                startScrollAnimationRTL();
            else
                startScrollAnimationLTR();
        }
        
        var scrollGoNextLTR = function(){            
            _ul.stop().animate({
                marginLeft : - _ul.find('li:first-child').outerWidth()
            },ticker.settings.animateSpeed, function(){
                _ul.find('li:first-child').insertAfter(_ul.find('li:last-child'));
                _ul.css({'marginLeft': 0 });
                _controlsIsActive = true;
            });
        }

        var scrollGoNextRTL = function(){
            _ul.stop().animate({
                marginRight : - _ul.find('li:first-child').outerWidth()
            },ticker.settings.animateSpeed, function(){
                _ul.find('li:first-child').insertAfter(_ul.find('li:last-child'));
                _ul.css({'marginRight': 0 });
                _controlsIsActive = true;
            });
        }

        var scrollGoPrevLTR = function(){
            var _ulPosition = parseInt(_ul.css('marginLeft'),10);
            if (_ulPosition >= 0)
            {
                _ul.css({'margin-left' : -_ul.find('li:last-child').outerWidth()});
                _ul.find('li:last-child').insertBefore(_ul.find('li:first-child'));                
            }

            _ul.stop().animate({
                marginLeft : 0
            },ticker.settings.animateSpeed, function(){
                _controlsIsActive = true;
            });
        }

        var scrollGoPrevRTL = function(){
            var _ulPosition = parseInt(_ul.css('marginRight'),10);
            if (_ulPosition >= 0)
            {
                _ul.css({'margin-right' : -_ul.find('li:last-child').outerWidth()});
                _ul.find('li:last-child').insertBefore(_ul.find('li:first-child'));
            }

            _ul.stop().animate({
                marginRight : 0
            },ticker.settings.animateSpeed, function(){
                _controlsIsActive = true;
            });
        }

        var scrollNext = function(){
            if (ticker.settings.direction === 'rtl')
                scrollGoNextRTL();
            else
                scrollGoNextLTR();
        }

        var scrollPrev = function(){
            if (ticker.settings.direction === 'rtl')
                scrollGoPrevRTL();
            else
                scrollGoPrevLTR();
        }

        var effectTypography = function(){
            _ul.find('li').hide();
            _ul.find('li').eq(_activeNews).width(30).show();
            _ul.find('li').eq(_activeNews).animate({
                width: '100%',
                opacity : 1
            },1500);
        }

        var effectFade = function(){
            _ul.find('li').hide();
            _ul.find('li').eq(_activeNews).fadeIn();
        }

        var effectSlideDown = function(){
            
            _ul.find('li:visible').animate({
                'top':30,
                'opacity':0
            },ticker.settings.animateSpeed, function(){
                $(this).hide();
            });

            _ul.find('li').eq(_activeNews).css({
                'top': -30,
                'opacity' : 0
            }).show();

            _ul.find('li').eq(_activeNews).animate({
                'top': 0,
                'opacity' : 1
            },ticker.settings.animateSpeed);
        }

        var effectSlideUp = function(){
            
            _ul.find('li:visible').animate({
                'top':-30,
                'opacity':0
            },ticker.settings.animateSpeed, function(){
                $(this).hide();
            });

            _ul.find('li').eq(_activeNews).css({
                'top': 30,
                'opacity' : 0
            }).show();

            _ul.find('li').eq(_activeNews).animate({
                'top': 0,
                'opacity' : 1
            },ticker.settings.animateSpeed);
        }

        var effectSlideLeft = function(){
            
            _ul.find('li:visible').animate({
                'left':'50%',
                'opacity':0
            },ticker.settings.animateSpeed, function(){
                $(this).hide();
            });

            _ul.find('li').eq(_activeNews).css({
                'left': -50,
                'opacity' : 0
            }).show();

            _ul.find('li').eq(_activeNews).animate({
                'left': 0,
                'opacity' : 1
            },ticker.settings.animateSpeed);
        }

        var effectSlideRight = function(){
            
            _ul.find('li:visible').animate({
                'left':'-50%',
                'opacity':0
            },ticker.settings.animateSpeed, function(){
                $(this).hide();
            });

            _ul.find('li').eq(_activeNews).css({
                'left': '50%',
                'opacity' : 0
            }).show();

            _ul.find('li').eq(_activeNews).animate({
                'left': 0,
                'opacity' : 1
            },ticker.settings.animateSpeed);
        }


        var showThis = function(){            
            _controlsIsActive = true;

            switch (ticker.settings.effect){
                case 'typography':
                    effectTypography();
                    break;
                case 'fade':
                    effectFade();
                    break;
                case 'slide-down':
                    effectSlideDown();
                    break;
                case 'slide-up':
                    effectSlideUp();
                    break;
                case 'slide-left':
                    effectSlideLeft();
                    break;
                case 'slide-right':
                    effectSlideRight();
                    break;
                default:
                    _ul.find('li').hide();
                    _ul.find('li').eq(_activeNews).show();
            }
            
        }

        var nextHandler = function(){
            switch (ticker.settings.effect){
                case 'scroll':
                    scrollNext();
                    break;
                default:
                    _activeNews++;
                    if (_activeNews >= _totalNews && _totalNews > 0)
                        _activeNews = 0;
                    if (_totalNews = 0){
                        _totalNews = _ul.children("li").length;
                        _activeNews++;
                    }

                    showThis();
                    
            }
        }

        var prevHandler = function(){
            switch (ticker.settings.effect){
                case 'scroll':
                    scrollPrev();
                    break;
                default:
                    _activeNews--;
                    if (_activeNews < 0)
                        _activeNews = _totalNews-1;
                    
                    showThis();
            }
        }

        var playHandler = function(){
            _pause = false;
            if (ticker.settings.play)
            {
                switch (ticker.settings.effect){
                    case 'scroll':
                        scrollPlaying();
                        break;
                    default:
                        ticker.pause();
                        _interval = setInterval(function(){
                            ticker.next();
                        },ticker.settings.delayTimer);
                }
            }
        }

        /****************************************************/
        /**PUBLIC METHODS************************************/
        /****************************************************/
        ticker.init = function() {
            ticker.settings = $.extend({}, defaults, options);
            
            //set ticker positions
            initializeSettings();

            //adding effect type class
            $element.addClass('bn-effect-'+ticker.settings.effect+' bn-direction-'+ticker.settings.direction);

            setContainerWidth();

            //if external data, load first
            if (typeof ticker.settings.source === 'object'){
                switch (ticker.settings.source.type){
                    case 'rss':
                        if (ticker.settings.source.usingApi === 'rss2json')
                            loadDataWithRSS2JSON();
                        else
                            loadDataWithYQL();
                        break;
                    case 'json':
                        loadJSON();
                        break;
                    default:
                        console.log('Please check your "source" object parameter. Incorrect Value');
                }
            }
            else if (ticker.settings.source === 'html'){
                if (ticker.settings.effect != 'scroll')
                    showThis();

                playHandler();
            }
            else{
                 console.log('Please check your "source" parameter. Incorrect Value');
            }

            //set playing status class
            if (!ticker.settings.play)
                _action.find('span').removeClass('bn-pause').addClass('bn-play');
            else
                _action.find('span').removeClass('bn-play').addClass('bn-pause');


            $element.on('mouseleave', function(e){                
                var activePosition = $(document.elementFromPoint(e.clientX, e.clientY)).parents('.bn-breaking-news')[0];
                if ($(this)[0] === activePosition) {
                    return;
                }
                

                if (ticker.settings.stopOnHover === true)
                {
                    if (ticker.settings.play === true)
                        ticker.play();
                }
                else
                {
                    if (ticker.settings.play === true && _pause === true)
                        ticker.play();
                }                

            });

            $element.on('mouseenter', function(){
                if (ticker.settings.stopOnHover === true)
                    ticker.pause();
            });

            _next.on('click', function(){
                if (_controlsIsActive){
                    _controlsIsActive = false;
                    ticker.pause();
                    ticker.next();
                }                
            });

            _prev.on('click', function(){
                if (_controlsIsActive){
                    _controlsIsActive = false;
                    ticker.pause();
                    ticker.prev();
                } 
            });

            _action.on('click', function(){
                if (_controlsIsActive){
                    if (_action.find('span').hasClass('bn-pause'))
                    {
                        _action.find('span').removeClass('bn-pause').addClass('bn-play');
                        ticker.stop();
                    }
                    else
                    {
                        ticker.settings.play = true;
                        _action.find('span').removeClass('bn-play').addClass('bn-pause');
                        //_pause = false;
                    }
                } 
            });

            $(window).on('resize', function(){
                if ($element.width() < 480){
                    _label.hide();
                    if (ticker.settings.direction == 'rtl')
                        _news.css({"right":0});
                    else
                        _news.css({"left":0});
                }
                else{
                    _label.show();
                    if (ticker.settings.direction == 'rtl')
                        _news.css({"right":_label.outerWidth()});
                    else
                        _news.css({"left":_label.outerWidth()});
                }
            });

        }

        ticker.pause = function() {
            _pause = true;
            clearInterval(_interval);
        }

        ticker.stop = function() {
            _pause = true;
            ticker.settings.play = false;
        }

        ticker.play = function() {
            playHandler();
        }

        ticker.next = function() {
            nextHandler();
        }

        ticker.prev = function() {
            prevHandler();
        }
        /****************************************************/
        /****************************************************/
        /****************************************************/
        ticker.init();

    }

    $.fn.breakingNews = function(options) {

        return this.each(function() {
            if (undefined == $(this).data('breakingNews')) {
                var ticker = new $.breakingNews(this, options);
                $(this).data('breakingNews', ticker);
            }
        });

    }

})(jQuery);



//http://stefangabos.ro/jquery/jquery-ticker-boilerplate-revisited/
