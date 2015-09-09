/// <reference path="lib/jquery-1.7.1.js" />
/// <reference path="lib/jquery.isotope.min.js" />
/// <reference path="lib/modernizr.custom.js" />
(function ($) {
 
    var techIsotope = {
        init: function () {
            var $container = $("#container");
            var filterNavTop = $("ul.navigation").offset().top;

            //init
            $container.isotope({
                itemSelector: ".item",
                //layoutMode: 'fitRows',
                transformsEnables:false,
                masonry: { columnWidth: 310, gutterWidth: 15 }
                
            });

            //click event
            $(".navigation a").click(function (e) {
                
                var selector = $(this).attr("data-filter");
                $container.isotope({ filter: selector });

                $(".navigation a").parent().removeClass("active");
                $(this).parent().addClass("active");
            });

            //navigaton sticky
            $(window).scroll(function () {
                if ($(window).scrollTop() >= filterNavTop) {
                    $("ul.navigation").addClass("sticky");
                }
                else {
                    $("ul.navigation").removeClass("sticky");
                }
            });

            //filter content hover
            $("#container .item").hover(function () {
                $(this).find(".overlap").animate({top:"0"});
            },
            function () {
                $(this).find(".overlap").animate({ top: "-100%" });
            });
            

            //overlay            
            $(".fullscreen-overlay").fullScreenOverlay();

        }
    };

    $(function () {
        techIsotope.init();
    });

})(jQuery);