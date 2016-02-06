(function ($) {

    var screenW=560, screenH=800;
    var gameStart = 2; //  0 -> ready, 1 -> start, 2 -> end
    var score = 0;

    var Hook=function(){

        this.growSpeed=10;
        this.rotateSpeed=2;
        this.moveSpeed=0.5;
        this.radius=0;
        this.minRadius=0;
        this.maxRadius=180;
        this.isMoving=true;
        this.length=0;
        this.minLength=80;
        this.maxLength=1500;
        this.position={
            startX:0,
            startY:0,
            endX:0,
            endY:0
        };
        this.shipImg=new Image();
        this.shipWidth=150;
        this.shipHeight=this.shipWidth/2;
        this.groundLength=screenW*0.8;

        this.init=function(){
            this.length=this.minLength;
            this.radius=this.minRadius;
            this.shipImg.src='themes/img/ship.png';
        };

        this.logic=function(){
            if(this.isMoving){
                this.radius-=this.rotateSpeed;
                if(this.radius>=this.maxRadius){
                    this.radius=this.maxRadius;
                    this.rotateSpeed=-this.rotateSpeed;
                }else if(this.radius<=this.minRadius){
                    this.radius=this.minRadius;
                    this.rotateSpeed=-this.rotateSpeed
                }
            }else{
                this.length+=this.growSpeed;
                if(this.length>=this.maxLength){
                    this.length=this.maxLength;
                    this.growSpeed=-this.growSpeed;
                }else if(this.length<=this.minLength){
                    this.length=this.minLength;
                    this.growSpeed=-this.growSpeed;
                    this.isMoving=true;
                }
            }

            var x=this.length*Math.cos(2*Math.PI*this.radius/360);
            var y=this.length*Math.sin(2*Math.PI*this.radius/360);
            this.position.endX=this.position.startX+x;
            this.position.endY=this.position.startY+y;

            if(this.position.endY>screenH || this.position.endX>screenW || this.position.endX<0){
                this.growSpeed=-this.growSpeed;
            }

            this.position.startX+=this.moveSpeed;
            if(this.position.startX>=screenW/2+this.groundLength*0.5-this.shipWidth || this.position.startX<=screenW/2-this.groundLength*0.5+this.shipWidth){
                this.moveSpeed=-this.moveSpeed;
            }
        };

        this.draw=function(context){
            //ground
            context.strokeStyle = "#000000";
            context.lineWidth=3;
            context.beginPath();
            context.moveTo(screenW/2-this.groundLength/2,this.position.startY+20);
            context.lineTo(screenW/2+this.groundLength/2,this.position.startY+20);
            context.stroke();
            context.closePath();
            //ship
            context.drawImage(this.shipImg, (this.position.startX-this.shipWidth/2), (this.position.startY-this.shipHeight*0.8), this.shipWidth, this.shipHeight);
            //hook
            context.strokeStyle = "#000000";
            context.lineWidth=5;
            context.beginPath();
            context.moveTo(this.position.startX,this.position.startY);
            context.lineTo(this.position.endX,this.position.endY);
            context.stroke();
            context.closePath();
            //test
            // context.beginPath();
            // context.arc(this.position.startX,this.position.startY,this.minLength,0,Math.PI*2);
            // context.stroke();
            // context.closePath();
        };

        this.init();
    };

    var Character=function(type){

        this.image=new Image();
        this.type=1;
        this.width=0;
        this.height=0;
        this.speed=0;
        this.bonus=0;
        this.position={
            x:0,
            y:0
        };
        this.isActive=true;

        this.init=function(initType){
            this.type=initType || 1; // 1 - bonus, 2 - punish, 3 - boom
            switch(this.type){
                case 1:
                    this.image.src='themes/img/fish.png';
                    this.width=60;
                    this.height=30;
                    this.speed=3;
                    break;
                case 2:
                    this.image.src='themes/img/fr.png';
                    this.width=60;
                    this.height=60;
                    this.speed=-1;
                    break;
                default:
                    this.image.src='themes/img/boom.png';
                    this.width=40;
                    this.height=40;
                    this.speed=2;
                    this.type=3;
                    break;
            }
            this.isActive=true;
            this.position.x=-this.width;
            this.position.y=getRandomY();
        };

        function getRandomY(){
            var y=Math.floor(Math.random()*(8+1))+1;

            return screenH-500+y*60;
        };

        this.logic=function(hook){
            if(this.isActive){
                this.position.x+=this.speed;
                // if( this.position.x>(screenW+this.width) || this.position.x<-this.width ){
                //     // this.isActive=false;
                //     this.speed=-this.speed;
                // }
                if(this.position.x>(screenW+this.width)){
                    this.position.x=-this.width;
                    this.position.y=getRandomY();
                }else if(this.position.x<-this.width){
                    this.position.x=screenW+this.width;
                    this.position.y=getRandomY();
                }
            }else{
                if(!hook.isMoving){
                    this.position.x=hook.position.endX;
                    this.position.y=hook.position.endY;
                }else{
                    if(this.type==3){
                        gameStart=2;
                    }else{
                        score+=this.bonus;
                        this.init(this.type);
                    }
                }
            }
        };

        this.draw=function(context){
            
            context.drawImage(this.image, (this.position.x-this.width/2), (this.position.y-this.height/2), this.width, this.height);
            
            if(this.type==1){
                context.fillStyle = "#ffffff";
                context.textAlign = "center";
                context.font = "16px Arial";
                context.fillText("+"+this.bonus,this.position.x,this.position.y+5);
            }else if(this.type==2){
                context.fillStyle = "#000000";
                context.textAlign = "center";
                context.font = "16px Arial";
                context.fillText(this.bonus,this.position.x,this.position.y+5);
            }
        };

        this.init(type);

    };
    
    var Canvas = function () {

        var canvas = null,
            context = null,
            hook = null,
            tmpTim=0,
            timer = 0,
            characters={
                bonus:[],
                punish:[],
                boom:[]
            };

        var init = function () {
            canvas = $('#manCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth()-10);
                canvas.css('max-height', $(window).innerHeight()-10);
            }
            timer=30;
            initHook();
            initCharacters();
        };

        var initHook=function(){
            hook=new Hook();
            hook.position.startX=screenW/2;
            hook.position.startY=120;
        };

        var initCharacters=function(){
            // 1 - bonus, 2 - punish, 3 - boom
            characters={
                bonus:[],
                punish:[],
                boom:[]
            };
            for(var i=0;i<6;i++){
                var item=new Character(1);
                item.speed=0;
                item.bonus=1;
                item.tmpIndex=getRandomPosition();
                item.position=getLocationByValue(item.tmpIndex,item);
                characters.bonus.push(item);
            }
            for(var i=0;i<5;i++){
                var item=new Character(2);
                item.speed=0;
                item.bonus=-1;
                item.tmpIndex=getRandomPosition();
                item.position=getLocationByValue(item.tmpIndex,item);
                characters.punish.push(item);
            }
            for(var i=0;i<5;i++){
                var item=new Character(3);
                item.speed=0;
                item.bonus=0;
                item.tmpIndex=getRandomPosition();
                item.position=getLocationByValue(item.tmpIndex,item);
                characters.boom.push(item);
            }

            // console.log(characters);

            function getLocationByValue(value,item){
                var x=0,y=0; // row - 6*100, col - 7*80
                var row=Math.floor((value-1)/7),
                    column=Math.floor((value-1)%7)+1;
                x=column*80;
                y=screenH-500+row*80;
                return {
                    x:x-item.width/2,
                    y:y-item.height/2
                }
            }

            function getRandomPosition(){
                var value=Math.floor(Math.random()*(42+1))+1;
                if(isDuplicatePosition(value)){
                    value=getRandomPosition();
                }
                return value;
            }

            function isDuplicatePosition(value){
                var isDuplicate=false;
                for(var list in characters){
                    if(characters[list] && characters[list].length){
                        for(var i=0;i<characters[list].length;i++){
                            if(characters[list][i].tmpIndex==value){
                                isDuplicate=true;
                                break;
                            }
                        }
                    }
                    if(isDuplicate){
                        break;
                    }
                }
                return isDuplicate;
            }

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
                    context.lineWidth=1;
                    context.strokeStyle = "#000000";
                    context.strokeRect(0, 0, screenW, screenH);

                    if(gameStart==1){
                        renderHook();
                        renderCharacters();
                        checkHit();
                        renderScore();
                        renderTimer();
                    }else if(gameStart==2){
                        renderEndScreen();
                    }else if(gameStart==0){
                        renderStartScreen();
                    }
                    
                }, 20);
            }
        };

        var event=function(){
            canvas.on('touchstart click',function(e){
                e.stopPropagation();
                e.preventDefault();

                if(gameStart===1){
                    if(hook.isMoving){
                        hook.isMoving=false;
                        hook.length=hook.minLength;
                    }
                }else if(gameStart===0){
                    init();
                    gameStart=1;
                    score=0;
                }else{
                    gameStart=0;
                }

                return false;
            });
        };

        var renderStartScreen=function(){
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Fish Fish Die", screenW / 2, screenH * 0.3, screenW);
            context.font = "50px Arial";
            context.fillText("Start", screenW / 2, screenH * 0.5, screenW);
            context.font = "10px Arial";
            context.fillText("© 2016 Doris ~ Zhang WenWen", screenW / 2, screenH * 0.9, screenW);

            var imgBonus=new Image();
            imgBonus.src='themes/img/fish.png';
            var imgPunish=new Image();
            imgPunish.src='themes/img/fr.png';
            var imgBoom=new Image();
            imgBoom.src='themes/img/boom.png';
            context.font="25px Arial";
            context.textAlign = "start";
            context.fillText("Score +1", screenW / 2 + 10, screenH * 0.5 + 100, screenW);
            context.fillText("Score -1", screenW / 2 + 10, screenH * 0.5 + 170, screenW);
            context.fillText("Dont Touch !!!", screenW / 2 + 10, screenH * 0.5 + 240, screenW);
            context.drawImage(imgBonus, (screenW / 2 - 80), screenH * 0.5 + 100 - imgBonus.height/2, 60, 30);
            context.drawImage(imgPunish, (screenW / 2 - 80), screenH * 0.5 + 170 - imgPunish.height/2, 60, 60);
            context.drawImage(imgBoom, (screenW / 2 - 70), screenH * 0.5 + 210, 40, 40);
        };

        var renderEndScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Game Over", screenW / 2, screenH * 0.4, screenW);
            context.font = "30px Arial";
            context.fillText("Score: " + score, screenW / 2, screenH * 0.5, screenW);
            context.fillText("Best score: " + getBestScore(), screenW / 2, screenH * 0.5 + 30, screenW);

            if(score>=5){
                var caidan=new Image();
                caidan.src='themes/img/caidan.png';
                context.drawImage(caidan, (screenW / 2 - 80), screenH * 0.5 + 80, 160, 200);
            }else if(score<=-5){
                var caidan=new Image();
                caidan.src='themes/img/caidan.png';
                context.drawImage(caidan, (screenW / 2 - 80), screenH * 0.5 + 80, 160, 200);
            }
        };

        var getBestScore = function () {
            var best = getCookie("doris_fish_best_score");
            if (best.length < 1 || best<score) {
                document.cookie = "doris_fish_best_score=" + score;
                best = score;
            }
            return best;
        };

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

        var renderScore=function(){
            context.fillStyle = "#000000";
            context.textAlign = "start";
            context.font = "20px Arial";
            context.fillText("Score: "+score, 15, 30);
        };

        var renderTimer=function(){
            context.fillStyle = "#000000";
            context.textAlign = "end";
            context.font = "20px Arial";
            context.fillText("00:00:"+(timer>=10?timer:('0'+timer)), screenW-15, 30);

            tmpTim++;
            if(tmpTim>=50){
                tmpTim=0;
                timer--;
            }
            if(timer<0){
                gameStart=2;
            }
        };

        var renderHook=function(){
            hook.logic();
            hook.draw(context);
        };

        var renderCharacters=function(){
            for(var list in characters){
                if(characters[list] && characters[list].length){
                    for(var i=0;i<characters[list].length;i++){
                        characters[list][i].logic(hook);
                        characters[list][i].draw(context);
                    }
                    
                }
            }
        };

        var checkHit=function(){
            if(!hook.isMoving && hook.growSpeed>=0){
                var isHit=false;
                for(var list in characters){
                    if(characters[list] && characters[list].length){
                        for(var i=0;i<characters[list].length;i++){
                            var x1=characters[list][i].position.x-characters[list][i].width/2,
                                x2=characters[list][i].position.x+characters[list][i].width/2,
                                y1=characters[list][i].position.y-characters[list][i].height/2,
                                y2=characters[list][i].position.y+characters[list][i].height/2;
                            if(hook.position.endX>x1 && hook.position.endX<x2 && hook.position.endY>y1 && hook.position.endY<y2){
                                characters[list][i].isActive=false;
                                hook.growSpeed=-hook.growSpeed;
                                isHit=true;
                                break;
                            }
                        }
                        if(isHit){
                            break;
                        }
                    }
                }
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