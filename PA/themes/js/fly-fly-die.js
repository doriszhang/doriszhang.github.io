(function ($) {

    var screenW=800, screenH=480;
    
    var Canvas = function () {

        var canvas = null,
            context = null;

        var init = function () {
            canvas = $('#manCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth()-10);
                canvas.css('max-height', $(window).innerHeight()-10);
            }
           
        };


        var run = function () {
            if (canvas && context) {
                //window size changes event
                $(window).resize(function () {
                    if (canvas != null) {
                        canvas.css('max-width', $(window).innerWidth() - 10);
                        canvas.css('max-height', $(window).innerHeight() - 10);
                    }
                });
                interval = setInterval(function () {
                    context.clearRect(0, 0, screenW, screenH);
                    context.strokeStyle = "#000000";
                    context.strokeRect(0, 0, screenW, screenH);

                }, 20);
            }
        };



        init();
        return {
            run:run
        };
    };

    
    $(function () {
        
        
        var canvas = new Canvas();
        canvas.run();
        
    });

})(jQuery);