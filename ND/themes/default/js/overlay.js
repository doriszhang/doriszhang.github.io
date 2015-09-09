/// <reference path="lib/jquery-1.7.1.js" />
/// <reference path="lib/modernizr.custom.js" />

(function ($) {

    $.fn.fullScreenOverlay = function () {

        var fullOverlay = function (element) {

            //var overlay = this;

            this.init = function () {
                var url = element.attr("href");

                //inject template
                var markup = {
                    overlaywrap: function () {
                        return "<div class='overlay-wrap'></div>";
                    },
                    topcontrol: function () {
                        return "<div class='control-top'><a class='close' href='#'>CLOSE</a></div>";
                    },
                    content: function () {
                        return "<div class='content'></div>";
                    },
                    bottomcontrol: function () {
                        return "<div class='control-bottom'><a class='top' href='#'>BACK TO TOP</a><a class='close' href='#'>CLOSE</a></div>";
                    }
                };                
                var $body = $("body");
                $body.append(markup.overlaywrap());
                $body.addClass("noscroll");
                var $overlaywrap = $(".overlay-wrap");                
                $overlaywrap.append("<div class='overlay-content'>" + markup.topcontrol() + markup.content() + markup.bottomcontrol() + "</div>");
                
                //inject content
                var $content = $overlaywrap.find(".content");
                $.ajax({
                    url: url,
                    success: function (data) {
                        $content.append(data);
                    },
                    error: function (msg) {
                        alert(msg);
                    }
                });

                //events listener
                $overlaywrap.find("a.close").click(function (e) {
                    e.preventDefault();
                    $body.removeClass("noscroll");
                    $overlaywrap.remove();
                    return false;
                });
                $overlaywrap.find("a.top").click(function (e) {
                    e.preventDefault();
                    $overlaywrap.animate({ scrollTop: 0 });
                    return false;
                });
                $overlaywrap.click(function (e) {
                    e.preventDefault();
                    if (e.target.className == $overlaywrap.attr("class")) {
                        $body.removeClass("noscroll");
                        $overlaywrap.remove();
                    }
                    return false;
                });

            };

        };

        $(this).click(function (e) {
            e.preventDefault();
            var overlay = new fullOverlay($(this));
            overlay.init();
            return false;
        });
    }

})(jQuery);