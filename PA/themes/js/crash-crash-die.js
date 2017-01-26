(function ($) {

    var screenW=560, screenH=800;
    var gameStatus = 0; //  0 -> ready, 1 -> start, 2 -> end
    var score = 0;

    var Man = function(){
        this.manHeight = 150;
        this.manWidth = 60;
        this.image = new Image();
        this.isMoving = false;
        this.isJumping = false;
        this.imageSrc1 = 'themes/img/man1.png';
        this.imageSrc2 = 'themes/img/man2.png';
        this.imageSrc3 = 'themes/img/man3.png';
        this.position = { x: 0, y: 0 };
        this.preMoveX = 0;
        this.movingRight = true;
        this.maxSpeedY = 25;
        this.speedY = 0;
        this.decrementY = 1.8;
        this.isCrashed=false;

        this.init = function(){
            this.image.src = this.imageSrc1;
            this.position.x = screenW/2 - this.manWidth/2;
            this.position.y = screenH - this.manHeight;
            this.manHeight = 150;
            this.manWidth = 60;
            this.isCrashed=false;
        }

        this.checkMove = function(x, y){
            if(this.position.x<x && (this.position.x+this.manWidth)>x && this.position.y<y && (this.position.y+this.manHeight)>y){
                this.isMoving = true;
            }else{
                this.isMoving = false;
            }
        }

        this.setMove = function(x, y){
            if(this.isMoving){
                if(this.preMoveX){
                    this.movingRight = (x-this.preMoveX)>0;
                    this.position.x = this.position.x + (x-this.preMoveX)
                }
                if(this.position.x<0){
                    this.position.x=0;
                    // this.preMoveX = 0;
                }else if(this.position.x+this.manWidth>screenW){
                    this.position.x=screenW-this.manWidth;
                    // this.preMoveX = screenW;
                }else{
                    this.preMoveX = x;
                }
            }
        }

        this.stopMove = function(){
            this.isMoving=false;
            this.isJumping=true;
            this.speedY=this.maxSpeedY;
            this.preMoveX=0;
        }

        this.logic = function(){
            if(this.isMoving || this.isJumping){
                this.image.src = this.movingRight && this.imageSrc2 || this.imageSrc3;
                if(this.isJumping){
                    if(Math.abs(this.speedY)>this.maxSpeedY){
                        this.isJumping=false;
                        this.position.y=screenH - this.manHeight;
                    }else{
                        this.position.y-=this.speedY;
                        this.speedY-=this.decrementY;
                    }
                }
            }else{
                this.image.src = this.imageSrc1;
            }
            if(this.isCrashed){
                this.manHeight -= 30;
                this.manWidth += 10;
                this.manHeight = Math.max(5, this.manHeight)
                this.manWidth = Math.min(screenW/3, this.manWidth)
                this.position.y = screenH - this.manHeight;
            }
        }

        this.draw = function(context){
            context.drawImage(this.image, this.position.x, this.position.y, this.manWidth, this.manHeight)
        }

        this.init();
    }

    var Ball = function(){
        this.ballRadius = 20;
        this.position = { x: 0, y: 0 };
        this.speedX = 0;
        this.speedY = 0;
        this.isHitting = 0;
        this.isCrashed=false;

        var getRandom = function(min, max){
            var random = Math.random()*10;
            if(random>min && random<max){
                return random;
            }
            return getRandom(min, max);
        }

        this.init = function(){
            this.position.x = screenW/2;
            this.position.y = 0;
            this.speedX = getRandom(3, 8);
            this.speedY = getRandom(5, 8);
            this.isCrashed = false;
            if(Math.round(this.speedX*100)%2){
                this.speedX=-this.speedX;
            }
            console.log(this.speedX, this.speedY)
        }

        this.logic = function(){
            this.position.x+=this.speedX;
            this.position.y+=this.speedY;
            if(this.position.x+this.ballRadius>screenW){
                this.position.x=screenW-this.ballRadius;
                this.speedX=-this.speedX
            }else if(this.position.x-this.ballRadius<0){
                this.position.x=this.ballRadius;
                this.speedX=-this.speedX
            }
            if(this.position.y+this.ballRadius>screenH){
                this.isCrashed = true;
                // return;
            }else if(this.position.y-this.ballRadius<0){
                this.position.y=this.ballRadius
                this.speedY=-this.speedY
            }
        }

        this.checkHitMan = function(man){
            if(this.isHitting>0){
                this.isHitting -=1;
                return false;
            }
            function hitManByPoint(x, y){
                if(x>man.position.x && x<man.position.x+man.manWidth && y>man.position.y && y<man.position.y+man.manHeight){
                    return true;
                }
                return false;
            }
            var pos = [
                [this.position.x, this.position.y], //left top
                [this.position.x+this.ballRadius, this.position.y], // right top
                [this.position.x, this.position.y+this.ballRadius], // left bottom
                [this.position.x+this.ballRadius, this.position.y+this.ballRadius] //right bottom
            ],
            isHit = false;
            for(var i=0;i<pos.length;i++){
                if(hitManByPoint(pos[i][0], pos[i][1])){
                    var top = pos[i][1]-man.position.y,
                        left = pos[i][0]-man.position.x,
                        right = man.position.x+man.manWidth-pos[i][0],
                        bottom = man.position.y+man.manHeight-pos[i][1];
                    var min = Math.min(top, left, right, bottom);
                    switch(min){
                        case top:
                            this.speedY=-this.speedY;break;
                        case left:
                            this.speedX=-this.speedX;break;
                        case right:
                            this.speedX=-this.speedX;break;
                        case bottom:
                            this.speedY=-this.speedY;break;
                        
                    }
                    man.speedY=-man.speedY;
                    this.isHitting = 8;
                    isHit = true;
                    break;
                }
            }
            return isHit;
        }

        this.draw = function(context){
            context.beginPath();
            context.arc(this.position.x, this.position.y, this.ballRadius, 0, Math.PI * 2, true);
            context.fill();
        }

        this.init();
    }
    
    var Canvas = function () {

        var canvas = null,
            context = null,
            man = null,
            ball = null,
            score = 0;

        var init = function () {
            canvas = $('#manCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth()-10);
                canvas.css('max-height', $(window).innerHeight()-10);
            }
            
            man = new Man();
            ball = new Ball();
        };


        var run = function () {
            if (canvas && context) {
                event();
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
                    if(gameStatus==1){
                        checkHit();
                        renderMan();
                        renderBall();
                        renderScore();
                    }else if(gameStatus==0){
                        renderStartScreen();
                    }else if(gameStatus==2){
                        renderEndScreen();
                    }
                }, 20);
            }
        };

        var event = function(){
            canvas.on('touchstart', function(e){
                e.stopPropagation();
                e.preventDefault();
                if(gameStatus==1){
                    var rect = this.getBoundingClientRect();
                    var clientX = (e.clientX ? e.clientX : e.originalEvent.changedTouches[0].clientX) - rect.left;
                    var clientY = (e.clientY ? e.clientY : e.originalEvent.changedTouches[0].clientY) - rect.top;
                    var x = clientX * screenW / canvas.width();
                    var y = clientY * screenH / canvas.height();
                    man.checkMove(x, y);
                }else if(gameStatus==0){
                    init();
                    gameStatus=1;
                    score=0;
                }else{
                    gameStatus=0;
                }
                
            });
            canvas.on('touchmove', function(e){
                e.stopPropagation();
                e.preventDefault();
                var rect = this.getBoundingClientRect();
                var clientX = (e.clientX ? e.clientX : e.originalEvent.changedTouches[0].clientX) - rect.left;
                var clientY = (e.clientY ? e.clientY : e.originalEvent.changedTouches[0].clientY) - rect.top;
                var x = clientX * screenW / canvas.width();
                var y = clientY * screenH / canvas.height();
                man.setMove(x, y)
            })
            canvas.on('touchend', function(e){
                e.stopPropagation();
                e.preventDefault();
                man.stopMove();
            })
        };

        var renderMan = function(){
            man.logic();
            man.draw(context);
        };

        var renderBall = function(){
            ball.logic();
            ball.draw(context);
        }

        var checkHit = function(){
            if(ball.checkHitMan(man)){
                if(man.isJumping){
                    score++;
                }else{
                    man.isCrashed=true;
                }
            }
            if(ball.isCrashed){
                gameStatus=2;
            }
        }

        var renderScore = function(){
            context.fillStyle = "#000000";
            context.textAlign = "start";
            context.font = "20px Arial";
            context.fillText("Score: "+score, 10, 20);
        }

        var renderStartScreen = function(){
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Crash Crash Die", screenW / 2, screenH * 0.3, screenW);
            context.font = "50px Arial";
            context.fillText("Start", screenW / 2, screenH * 0.5, screenW);
            context.font = "10px Arial";
            context.fillText("© 2017 Doris ~ Zhang WenWen", screenW / 2, screenH * 0.9, screenW);

            context.strokeRect(screenW * 0.2, screenH * 0.6, screenW * 0.6, 120);
            context.font = "40px Arial";
            context.fillText("Jump!!!", screenW / 2, screenH * 0.6 + 50, screenW);
            context.font = "30px Arial";
            context.fillText("and hit the ball", screenW / 2, screenH * 0.6 + 90, screenW);
        }

        var renderEndScreen = function(){
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Game Over", screenW / 2, screenH * 0.4, screenW);
            context.font = "30px Arial";
            context.fillText("Score: " + score, screenW / 2, screenH * 0.5, screenW);
            context.fillText("Best score: " + getBestScore(), screenW / 2, screenH * 0.5 + 30, screenW);
        }

        var getBestScore = function () {
            var best = getCookie("doris_crash_best_score");
            if (best.length < 1 || best<score) {
                document.cookie = "doris_crash_best_score=" + score;
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