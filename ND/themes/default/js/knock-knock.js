(function ($) {

    var characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    var screenW = 450, screenH = 550,
        keyboard_line = 3, keyboard_size = 6, keyboard_top_y = 0;
        balloon_rate = 80,
        score = 0, life = 0,
        gameState = 0;  // 0 -> ready, 1 -> start, 2 -> end

    var Key = function (index,value) {

        this.value = '';
        this.width = 0;
        this.height = 0;
        this.x = 0;
        this.y = 0;
        this.isClicked = 0;

        this.init = function () {
            this.value = value;
            this.width = screenW / keyboard_size;
            this.height = this.width;
            this.x = (index % keyboard_size) * this.width;
            this.y = screenH - this.height * keyboard_line + parseInt(index / keyboard_size) * this.height;
        };

        this.init();

    };

    var Balloon = function (keys) {

        this.speedY = 0;
        this.speedY_Min = 5;
        this.speedY_Max = 9;
        this.x = 0;
        this.y = 0;
        this.width = 90;
        this.height = 90;
        this.isDead = false;
        this.isShot = false;
        this.shotTemp=5;
        this.value = '';

        this.init = function () {
            this.x = Math.random() * (screenW - this.width);
            this.y = screenH - screenW / keyboard_size * keyboard_line;
            //this.speedY = Math.random() * (this.speedY_Max - this.speedY_Min);
            this.speedY = 1.5;
            this.value = keys[parseInt(Math.random() * (keys.length - 1))].value;
        };

        this.logic = function () {
            if (this.isShot) {
                this.shotTemp--;
            }
            else if (this.y+this.height > 0) {
                this.y = this.y - this.speedY;
            }
            else if (this.y + this.height <= 0) {
                this.isDead = true;
            }
        };

        this.init();

    };

    var Canvas = function () {

        var canvas = null,
            context = null,
            interval = null,
            keyboards = null,
            keyboardsY = screenH - screenW / keyboard_size * keyboard_line,
            balloonlist = null,
            balloontemp = 0;

        var init = function () {
            canvas = $('#manCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth()-10);
                canvas.css('max-height', $(window).innerHeight()-10);
            }
            //init game
            score = 0;
            life = 5;
            balloon_rate = 80;

            //init keys
            var randomChars = characters.sort(function () { return (Math.round(Math.random()) - 0.5); }).slice(-keyboard_line * keyboard_size);
            console.log(randomChars);
            keyboards = new Array();
            $.each(randomChars, function (i, item) {
                var key = new Key(i, item);
                keyboards.push(key);
            });
            keyboard_top_y = screenH - screenW / keyboard_size * keyboard_line;
            console.log(keyboard_top_y);


            //init balloon
            balloonlist = new Array();
        };

        var event = function () {
            //window size changes event
            $(window).resize(function () {
                if (canvas != null) {
                    canvas.css('max-width', $(window).innerWidth() - 10);
                    canvas.css('max-height', $(window).innerHeight() - 10);
                }
            });

            canvas.on("touchstart click", function (e) {
                e.stopPropagation(); e.preventDefault();
                
                if (gameState === 1) {

                    var rect = this.getBoundingClientRect();
                    var clientX = (e.clientX ? e.clientX : e.originalEvent.changedTouches[0].clientX) - rect.left;
                    var clientY = (e.clientY ? e.clientY : e.originalEvent.changedTouches[0].clientY) - rect.top;
                    var x = clientX * screenW / canvas.width();
                    var y = clientY * screenH / canvas.height();
                    var value = '';
                    var isCorrect = false;

                    $.each(keyboards, function (i, item) {
                        if (item.x < x && item.x + item.width > x && item.y < y && item.y + item.height > y) {
                            value = item.value;
                            item.isClicked = 4;
                            console.log(x + ',' + y + ':' + value);

                            $.each(balloonlist, function (ix, ball) {
                                if (ball.value === value) {
                                    ball.isShot = true;
                                    score++;
                                    isCorrect = true;
                                }
                            });
                        }
                    });

                    if (y>=keyboard_top_y && !isCorrect) {
                        life--;
                        //alert('life--click:'+life);
                    }
                }
                else if (gameState === 0) {
                    init();
                    gameState = 1;
                }
                else {
                    gameState = 0;
                }

                return false;
            });

        };

        var run = function () {
            event();
            if (canvas && context) {
                interval = setInterval(function () {

                    context.clearRect(0, 0, screenW, screenH);
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, screenW, screenH);
                    context.strokeStyle = '#000000';
                    context.strokeRect(0, 0, screenW, screenH);

                    if (gameState === 1) {
                        renderBalloons();
                        renderKeyboards();
                        renderScore();
                        if (life <= 0) {
                            gameState = 2;
                        }

                        if (score > 10 && score<=15) {
                            balloon_rate = 70;
                        }
                        else if (score > 15 && score<=20) {
                            $.each(balloonlist, function (i, item) {
                                item.speedY = 2;;
                            });
                            balloon_rate = 60;
                        }
                        else if (score > 20 && score <= 25) {
                            balloon_rate = 50;
                        }
                        else if (score > 25) {
                            $.each(balloonlist, function (i, item) {
                                item.speedY = 2.5;;
                            });
                            balloon_rate = 40;
                        }
                        
                    }
                    else if (gameState === 2) {
                        renderEndScreen();
                    }
                    else if (gameState === 0) {
                        renderStartScreen();
                    }

                }, 20);
            }
        };

        var renderBalloons = function () {
            var deadBalloon = new Array();
            for (var i = 0; i < balloonlist.length; i++) {
                var ball = balloonlist[i];
                ball.logic();

                if (ball.isShot) {
                    context.fillStyle = '#8e8e8e';
                    context.beginPath();
                    context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2, true);
                    context.fill();
                }

                context.strokeStyle = '#000000';
                context.beginPath();
                context.arc(ball.x + ball.width / 2, ball.y + ball.height / 2, ball.width / 2, 0, Math.PI * 2, true);
                context.stroke();

                context.fillStyle = '#000000';
                context.font = "30px Arial";
                context.textAlign = "center";
                context.fillText(ball.value, ball.x + ball.width / 2, ball.y + ball.height / 2);

                if (ball.isDead || (ball.isShot&&ball.shotTemp<=0)) {
                    deadBalloon.push(ball);
                }

                if (ball.isDead) {
                    life--;
                    //alert('life--dead:'+life);
                }
            }
            if (deadBalloon.length) {
                $.each(deadBalloon, function (i, item) {
                    balloonlist.splice($.inArray(item, balloonlist), 1);
                });
            }
            balloontemp++;
            if (balloontemp >= balloon_rate) {
                var ballnew = new Balloon(keyboards);
                balloonlist.push(ballnew);
                balloontemp = 0;
            }
        };

        var renderKeyboards = function () {            
            context.fillStyle = '#ffffff';
            context.fillRect(0, keyboardsY, screenW, screenW / keyboard_size * keyboard_line);
            $.each(keyboards, function (i, item) {

                if (item.isClicked>0) {
                    context.fillStyle = '#8e8e8e';
                    context.fillRect(item.x, item.y, item.width, item.height);
                    item.isClicked--;
                }

                context.strokeStyle = '#000000';
                context.strokeRect(item.x, item.y, item.width, item.height);
                
                context.fillStyle = '#000000';
                context.font = "20px Arial";
                context.textAlign = "center";
                context.fillText(item.value, item.x + item.width / 2, item.y + item.height / 2);
            });
        };

        var renderScore = function () {
            context.fillStyle = '#000000';
            context.textAlign = 'start';
            context.font = '20px Arial';
            context.fillText('Score: ' + score, 10, 20);

            context.fillText('Life: ', 10, 40);
            for (var i = 0; i < life; i++) {
                context.fillStyle = '#000000';
                context.beginPath();
                context.arc(60+i*22, 35, 10, 0, Math.PI * 2, true);
                context.fill();
            }
        };

        var renderStartScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Knock Knock", screenW / 2, screenH * 0.3, screenW);
            context.font = "50px Arial";
            context.fillText("Start", screenW / 2, screenH * 0.6, screenW);
            context.font = "15px Arial";
            context.fillText("© 2014 Doris Zhang", screenW / 2, screenH * 0.9, screenW);
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
        
        var getBestScore = function () {
            var best = getCookie("doris_knock_best_score");
            if (best.length < 1 || best < score) {
                document.cookie = "doris_knock_best_score=" + score;
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
        
        //Doris.Wechat.init({
        //    "tTitle": 'Game - Knock Knock',
        //    "tContent": 'Doris canvas training'
        //});

        var canvas = new Canvas();
        canvas.run();
        
    });

})(jQuery);