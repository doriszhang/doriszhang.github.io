(function ($) {

    $.fn.puzzlePlay = function (options) {

        var defaults = {
            row_num: 0,
            col_num: 0,
            item_w: 200,
            item_h: 200,
            move_duration: 400,
            move_easing: "swing",
            move_complete: null
        };

        var options = $.extend(defaults, options);
        var items = [];

        var puzzleInit = function (container) {
            initItems(container);
            console.log(items);
            if (items.length) {
                registerEvents(container);
            }
        };

        function initItems(container) {
            container.addClass('dd_puzzle_container');
            var tempItems = $('ul li', container);
            if (tempItems && options.row_num && options.col_num && options.row_num * options.col_num <= tempItems.length) {
                tempItems.each(function (index, elem) {
                    if ((index + 1) <= options.row_num * options.col_num) {
                        items.push(new Object({
                            elem: elem,
                            index: index,
                            position_x: index % options.col_num * options.item_w,
                            position_y: Math.floor(index / options.col_num) * options.item_h
                        }));
                    }
                });
                var innerContainer = $('ul', container);
                innerContainer.empty();
                $.each(items, function (index,item) {
                    item.elem.style.top = item.position_y + 'px';
                    item.elem.style.left = item.position_x + 'px';
                    item.elem.style.width = options.item_w + 'px';
                    item.elem.style.height = options.item_h + 'px';
                    item.elem.setAttribute('index', item.index);
                    innerContainer.append(item.elem);
                });
            }
        };

        function registerEvents(container) {
            $(document).on('click', function (e) {
                if (!e.target.closest('.dd_puzzle_container')) {
                    $('ul li', container).removeClass('active');
                }
            });
            $('ul li', container).on('mousedown touchstart', function (e) {
                e.stopPropagation(); e.preventDefault();
                var thisItem = this;
                $(thisItem).toggleClass('active');
                var startMouse_X = e.clientX,
                    startMouse_Y = e.clientY,
                    startItem_X = thisItem.offsetLeft,
                    startItem_Y = thisItem.offsetTop;
                $(document).on('mousemove touchmove', function (ev) {
                    ev.stopPropagation(); ev.preventDefault();
                    if (ev.clientY - startMouse_Y > 10 || ev.clientY - startMouse_Y < -10) {
                        thisItem.style.top = startItem_Y + (ev.clientY - startMouse_Y) + 'px';
                        thisItem.style.left = startItem_X + (ev.clientX - startMouse_X) + 'px';
                        $('ul li', container).removeClass('active hover');
                        $(thisItem).addClass('active');
                        var curCenter_x=startItem_X + (ev.clientX - startMouse_X)+options.item_w/2,
                            curCenter_y = startItem_Y + (ev.clientY - startMouse_Y) + options.item_h / 2;
                        $.each(items, function (index, item) {
                            if (thisItem.getAttribute('index') !== item.index + '') {
                                var tl_x = item.position_x,
                                    tl_y = item.position_y,
                                    br_x = item.position_x + options.item_w,
                                    br_y = item.position_y + options.item_h;
                                if (curCenter_x > tl_x && curCenter_x < br_x && curCenter_y > tl_y && curCenter_y < br_y) {
                                    $(item.elem).addClass('hover');
                                }
                            }
                        });
                    }
                });                
            });
            $('ul li', container).on('mouseup touchend', function (e) {
                e.stopPropagation(); e.preventDefault();
                $(document).off('mousemove touchmove');
                var activeItems = [];
                $('ul li.hover', container).removeClass('hover').addClass('active');
                $.each(items, function () {
                    if (this.elem.className.indexOf('active') >= 0) {
                        activeItems.push(this);
                    }
                });
                if (activeItems.length >= 2) {
                    exchangePosition(container, activeItems);
                }
                else if (activeItems.length == 1) {
                    //activeItems[0].elem.style.top = activeItems[0].position_y;
                    //activeItems[0].elem.style.top = activeItems[0].position_x;
                    $(activeItems[0].elem).animate({ top: activeItems[0].position_y, left: activeItems[0].position_x }, options.move_duration, options.move_easing);
                }                
            });
        };

        function exchangePosition(container, activeItems) {
            console.log('exchange');
            var temPosition = new Object({
                position_x: activeItems[0].position_x,
                position_y: activeItems[0].position_y
            });
            var tempX = activeItems[0].position_x,
                tempY = activeItems[0].position_y;
            $(activeItems[0].elem).animate({ top: activeItems[1].position_y, left: activeItems[1].position_x }, options.move_duration, options.move_easing, function () {
                activeItems[0].position_x = activeItems[1].position_x;
                activeItems[0].position_y = activeItems[1].position_y;
            });
            $(activeItems[1].elem).animate({ top: tempY, left: tempX }, options.move_duration, options.move_easing, function () {
                $('ul li', container).removeClass('active');
                activeItems[1].position_x = tempX;
                activeItems[1].position_y = tempY;
            });
        }

        puzzleInit($(this));

    };


}(jQuery));