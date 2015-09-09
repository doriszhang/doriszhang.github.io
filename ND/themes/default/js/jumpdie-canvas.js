(function ($) {

    var screenW=480, screenH=800;
    var isAdjusting = false;
    var gameStart = 0; //  0 -> ready, 1 -> start, 2 -> end
    var score = 0;
    var adjustSpeedY = 10;    

    var Man = function () {

        this.maxSpeedY = 25;
        this.tempY = 0;  //same as maxSpeedY
        this.speedX = 0;
        this.decrementY = 1.2;
        this.manWidth = 64;
        this.manHeight = 120;
        this.isGoingUp = false;
        this.state = "stay";  //"stay", "jump"
        this.position = { x: 0, y: 0 };
        this.alongwithModel = null;
        this.image = new Image();

        this.init = function () {
            this.state = "stay";
            this.tempY = 0;
            this.position.x=screenW/2-this.manWidth/2;
            this.position.y=screenH-this.manHeight;
            this.image.src = "themes/default/img/man.png";
        };

        this.manJumpHeight = function () {
            var h = 0, s = this.maxSpeedY;
            while (s >= 0) {
                h += s;
                s -= this.decrementY;
            }
            return h;
        };

        this.logic = function () {
            if (this.state == "jump") {
                this.speedX = 0;
                if (this.tempY >= 0)
                    this.isGoingUp = true;
                else
                    this.isGoingUp = false;
                this.position.y -= this.tempY;
                this.tempY -= this.decrementY;

                if (this.position.y > screenH || this.position.y - this.tempY > screenH) {
                    //this.state = "stay";
                    //this.position.y = screenH-this.manHeight;
                    gameStart = 2;
                }
            }
            else if (this.state == "stay") {
                if (this.alongwithModel && this.alongwithModel.speedX) {
                    this.speedX = this.alongwithModel.speedX;
                    this.position.x += this.speedX;
                }
                isAdjusting = this.position.y < screenH-220 ? true : false;
                if (isAdjusting) {
                    this.position.y += adjustSpeedY;
                }
            }
        };

        this.init();
    };

    var Platform = function () {

        this.pfWidth = 80;
        this.pfHeight = 8;
        this.isMoving = false;
        this.speedX = 5;
        this.position = { x: 0, y: 0 };
        this.image = new Image();
        
        this.init = function () {
            this.id = Math.floor(Math.random() * 10000000);
            this.position.x = Math.random() * (screenW - this.pfWidth);
            this.image.src = "themes/default/img/balckline.png";
        };

        this.logic = function () {
            if (this.position.y > 0 && this.position.y < screenH && !this.isMoving) {
                this.isMoving = true;
            }
            if (this.isMoving) {
                this.position.x += this.speedX;
                if (this.position.x <= 0) {
                    this.speedX = -this.speedX;
                    this.position.x = 0;
                }
                else if (this.position.x + this.pfWidth >= screenW) {
                    this.speedX = -this.speedX;
                    this.position.x = screenW - this.pfWidth;
                }
            }
        };


        this.init();
    };


    var Canvas = function () {

        var canvas = null,
            context = null,
            interval = null,
            man = null,
            platforms = null,
            pfStartY = 0,
            pfMarginY = 180;

        var init = function () {
            canvas = $("#mainCanvas");
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                canvas.css('max-width', $(window).innerWidth() - 10);
                canvas.css('max-height', $(window).innerHeight() - 10);
            }

            man = new Man();

            pfStartY = screenH - 180;

            platforms = new Array();
            for (var i = 1; i <= 6; i++) {
                var pf = new Platform();
                pf.position.y = pfStartY;
                pfStartY -= pfMarginY;
                platforms.push(pf);
            }
        };

        var run = function () {
            $(document).on("touchstart click", function (e) {
                e.stopPropagation(); e.preventDefault();
                if (gameStart===1) {
                    if (man.state == "stay") {
                        man.state = "jump";
                        man.tempY = man.maxSpeedY;
                        man.alongwithModel = null;
                    }
                }
                else if (gameStart === 0) {
                    init();
                    gameStart = 1;
                    score = 0;
                    //context.fillStyle = "#fff";
                    //context.fillRect(0, 0, screenW, screenH);
                }
                else {
                    gameStart = 0;
                    //context.fillStyle = "#fff";
                    //context.fillRect(0, 0, screenW, screenH);
                }

                return false;
            });
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
                    //context.fillStyle = "#eeeeff";
                    //context.fillRect(0, 0, screenW, screenH);
                    context.strokeStyle = "#000000";
                    context.strokeRect(0, 0, screenW, screenH);

                    if (gameStart===1) {
                        renderMan();
                        renderPlatforms();
                        checkHit();
                        adjustPlatforms();
                        renderScore();
                    }
                    else if (gameStart === 2) {
                        renderEndScreen();
                    }
                    else if (gameStart === 0) {
                        renderStartScreen();
                    }

                }, 20);
            }
        };

        var renderMan = function () {            
            context.drawImage(man.image, man.position.x, man.position.y, man.manWidth, man.manHeight);
            man.logic();
        };

        var renderPlatforms = function () {
            $.each(platforms, function (i, pf) {
                
                context.drawImage(pf.image, pf.position.x, pf.position.y, pf.pfWidth, pf.pfHeight);
                pf.logic();

            });
        };

        var checkHit = function () {
            if (!man.isGoingUp && man.state == "jump") {
                $.each(platforms, function (i, pf) {
                    if (man.position.y + man.manHeight >= pf.position.y+pf.pfHeight
                        && man.position.y + man.manHeight - 20 <= pf.position.y+pf.pfHeight
                        && ((man.position.x >= pf.position.x && man.position.x <= pf.position.x + pf.pfWidth) || (man.position.x + man.manWidth >= pf.position.x && man.position.x + man.manWidth <= pf.position.x + pf.pfWidth))
                        ) {
                        man.alongwithModel = pf;
                        man.position.y = pf.position.y - man.manHeight;
                        man.state = "stay";
                        score++;
                        return;
                    }
                });
            }
        };

        var adjustPlatforms = function () {
            var minY = platforms.sort(function (a, b) { return (a.position.y - b.position.y) })[0].position.y;
            $.each(platforms, function (i, pf) {

                if (pf.position.y > screenH + pf.pfHeight) {
                    pf.position.y = minY - pfMarginY;
                }

                if (man.state == "stay" && isAdjusting) {
                    pf.position.y += adjustSpeedY;
                }

            });
        };

        var renderScore = function () {
            context.fillStyle = "#000000";
            context.textAlign = "start";
            context.font = "20px Arial";
            context.fillText("Score: "+score, 10, 20);
        };

        var renderEndScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Game Over", screenW / 2, screenH * 0.4, screenW);
            context.font = "30px Arial";
            context.fillText("Score: " + score, screenW / 2, screenH * 0.5, screenW);
            context.fillText("Best score: " + getBestScore(), screenW / 2, screenH * 0.5 + 30, screenW);
        };

        var renderStartScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Jump Jump Die", screenW / 2, screenH * 0.3, screenW);
            context.font = "50px Arial";
            context.fillText("Start", screenW / 2, screenH * 0.6, screenW);
            context.font = "10px Arial";
            context.fillText("© 2014 Doris Zhang", screenW / 2, screenH * 0.9, screenW);
        };

        var getBestScore = function () {
            var best = getCookie("doris_jump_best_score");
            if (best.length < 1 || best<score) {
                document.cookie = "doris_jump_best_score=" + score;
                best = score;
            }
            return best;
        }

        var getCookie = function (c_name) {
            if (document.cookie.length > 0) {
                c_start = document.cookie.indexOf(c_name + "=")
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1
                    c_end = document.cookie.indexOf(";", c_start)
                    if (c_end == -1) c_end = document.cookie.length
                    return unescape(document.cookie.substring(c_start, c_end))
                }
            }
            return "";
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