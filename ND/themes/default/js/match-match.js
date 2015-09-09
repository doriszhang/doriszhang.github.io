(function ($) {

    var screenW = 450, screenH = 550;
    var characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var score = 0,
        gameState = 0;  // 0 -> ready, 1 -> startSplashScreen, 2 -> start, 3 -> startLevelLife-minus, 4 -> startLevelWin, 5 -> end

    var Block = function (index,numPerRow,rowNum,value) {

        this.width = 0;
        this.maxWidth = screenW / 5;
        this.height = 0;
        this.padding = 4;
        this.x = 0;
        this.y = 0;
        this.minY = screenH / 5;
        this.isActive = false;
        this.isDeactive = false;
        this.isSelected = false;
        this.isDead = false;
        this.isDying = false;
        this.selectTime = 0;
        this.deactiveTime = 0;
        this.dyingTime = 0;
        this.value = '';

        this.init = function () {
            this.value = value;
            this.index = index;

            this.width = screenW / numPerRow - this.padding*2;
            if (this.width > this.maxWidth) {
                this.width = this.maxWidth;
                this.padding = (screenW - this.width * numPerRow) / numPerRow/2;
            }
            if ((this.width + this.padding) * rowNum > (screenH - this.minY)) {
                this.width = (screenH - this.minY) / rowNum - this.padding * 2;
            }
            this.height = this.width;

            var startX = screenW / 2 + this.padding / 2 - (this.width + this.padding) * numPerRow / 2;
            this.x = startX + (index % numPerRow) * (this.width + this.padding);

            var startY = 0;
            if ((this.height + this.padding) * rowNum < screenH / 2) {
                startY = screenH / 2 + this.padding / 2;
            }
            else {
                startY = screenH - this.padding / 2 - (this.height + this.padding) * rowNum;
            }
            this.y = startY + (this.height + this.padding) * parseInt(index / numPerRow);

        };

        this.draw = function (context) {
            if (context && !this.isDead) {
                if (gameState == 1) {
                    drawBackborder(this);
                    drawContent(this);
                }
                else if (this.isActive || this.isDeactive || this.isDying) {
                    drawBackground(this);
                    drawContent(this);
                }
                else {
                    drawContent(this);
                    drawBackground(this);
                }     
            }

            function drawContent(self) {
                context.fillStyle = '#000000';
                context.font = '20px Arial';
                context.textAlign = 'center';
                context.fillText(self.value, self.x + self.width / 2, self.y + self.height / 2 + 8);
            }
            function drawBackground(self) {
                context.fillStyle = '#b8b8b8';
                if (self.isSelected) {
                    context.fillStyle = '#8c8c8c';
                }
                else if (self.isActive) {
                    context.fillStyle = '#dbdbdb';
                }
                else if (self.isDying) {
                    context.fillStyle = '#ededed';
                }
                context.fillRect(self.x, self.y, self.width, self.height);
            }
            function drawBackborder(self) {
                context.strokeStyle = '#b8b8b8';
                context.strokeRect(self.x, self.y, self.width, self.height);
            }
        };        

        this.logic = function () {
            if (this.isSelected) {
                this.selectTime--;
                if (this.selectTime <= 0) {
                    this.isSelected = false;
                    this.selectTime = 0;
                    this.isActive = true;
                }
            }
            else if (this.isDeactive) {
                this.deactiveTime--;                
                if (this.deactiveTime <= 0) {
                    this.isDeactive = false;                    
                    this.deactiveTime = 0;
                    this.isActive = false;
                }
            }
            else if (this.isDying) {
                this.dyingTime--;
                if (this.dyingTime <= 0) {
                    this.dyingTime = 0;
                    this.isDying = false;
                    this.isDead = true;
                }
            }
        };

        this.doSelect = function () {
            this.isSelected = true;
            this.selectTime = 10;
        };

        this.deActive = function () {
            this.isDeactive = true;
            this.deactiveTime = 15;            
        };

        this.goToDie = function () {
            this.isDying = true;
            this.dyingTime = 10;
            this.isActive = false;
        };

        this.init();
    };

    var Canvas = function () {

        var canvas = null,
            context = null,
            interval = null,
            blockItemList = null,
            selectedBlockItems = null,
            block_numPerRow = 0,
            block_rowNum = 0,
            level = 1,
            life = 0,
            bounsScore = 0,
            thisLevelLife = 0,
            lifeMinusTime = 0,
            splashTime=0,
            splashTimeStatic=0;

        var init = function () {
            canvas = $('#mainCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth() - 10);
                canvas.css('max-height', $(window).innerHeight() - 10);
            }
            
            score = 0;
            life = 0;
            level = 1;
            initLevel();            
        };

        var initLevel = function () {
            //init block text
            var blockContentList = new Array();

            //init variable
            if (level <= 0) {
                level = 1;
                initLevel();
                return;
            }
            switch (level) {
                case 1:
                    block_numPerRow = 4;
                    block_rowNum = 1;
                    blockContentList = getSecretContent(2, 2);
                    splashTime = 30;
                    thisLevelLife = 2;
                    break;
                case 2:
                    block_numPerRow = 4;
                    block_rowNum = 2;
                    blockContentList = getSecretContent(2, 4);
                    splashTime = 50;
                    thisLevelLife = 2;
                    break;
                case 3:
                    block_numPerRow = 4;
                    block_rowNum = 2;
                    blockContentList = getSecretContent(4, 2);
                    splashTime = 50;
                    thisLevelLife = 3;
                    break;
                case 4:
                    block_numPerRow = 4;
                    block_rowNum = 3;
                    blockContentList = getSecretContent(2, 6);
                    splashTime = 80;
                    thisLevelLife = 4;
                    break;
                case 5:
                    block_numPerRow = 4;
                    block_rowNum = 3;
                    blockContentList = getSecretContent(3, 4);
                    splashTime = 100;
                    thisLevelLife = 5;
                    break;
                case 6:
                    block_numPerRow = 4;
                    block_rowNum = 3;
                    blockContentList = getSecretContent(6, 2);
                    splashTime = 110;
                    thisLevelLife = 5;
                    break;
                case 7:
                    block_numPerRow = 4;
                    block_rowNum = 4;
                    blockContentList = getSecretContent(2, 8);
                    splashTime = 120;
                    thisLevelLife = 8;
                    break;
                case 8:
                    block_numPerRow = 4;
                    block_rowNum = 4;
                    blockContentList = getSecretContent(4, 4);
                    splashTime = 150;
                    thisLevelLife = 8;
                    break;
                default:
                    block_numPerRow = 6;
                    block_rowNum = 6;
                    blockContentList = getSecretContent(6, 6);
                    splashTime = 200;
                    thisLevelLife = 10;
                    break;
            }

            life += thisLevelLife;
            splashTimeStatic=splashTime;

            console.log(blockContentList);

            //init blocks
            blockItemList = new Array();
            for (var i = 0; i < block_numPerRow * block_rowNum; i++) {
                var value = ''
                if (blockContentList && blockContentList[i]) {
                    value = blockContentList[i];
                }
                var block = new Block(i, block_numPerRow, block_rowNum, value);
                blockItemList.push(block);
            }
            selectedBlockItems = new Array();
        };

        var getSecretContent = function (varietyNum,repeatNum) {
            var results = new Array();
            var temp = characters;
            temp.sort(function () { return (Math.random() - 0.5); });
            var ranOrd = Math.round(Math.random() * (temp.length - varietyNum));
            var getOut = temp.slice(ranOrd, ranOrd + varietyNum);
            for (var i = 0; i < repeatNum; i++) {
                results = results.concat(getOut.sort(function () { return (Math.random() - 0.5); }));
            }
            return results.sort(function () { return (Math.random() - 0.5); });
        };

        var registerEvent = function () {
            //window size changes event
            $(window).resize(function () {
                if (canvas != null) {
                    canvas.css('max-width', $(window).innerWidth() - 10);
                    canvas.css('max-height', $(window).innerHeight() - 10);
                }
            });

            if (canvas && context) {
                //click event
                canvas.on('touchstart click', function (e) {
                    e.stopPropagation(); e.preventDefault();

                    if (gameState === 0 || gameState == 4) {
                        gameState = 1;
                    }
                    else if (gameState == 1) {
                        gameState = 2;
                    }
                    else if (gameState == 5) {
                        gameState = 0;
                        init();
                    }
                    else if (gameState === 2 || gameState === 3) {
                        var rect = this.getBoundingClientRect();
                        var clientX = (e.clientX ? e.clientX : e.originalEvent.changedTouches[0].clientX) - rect.left;
                        var clientY = (e.clientY ? e.clientY : e.originalEvent.changedTouches[0].clientY) - rect.top;
                        var x = clientX * screenW / canvas.width();
                        var y = clientY * screenH / canvas.height();

                        //if click on block
                        var slectedValue = '';
                        if (x >= 0 && x <= screenW && y > 0 && y <= screenH) {
                            var selectedItem = null;
                            $.each(blockItemList, function (i, item) {
                                if (x > item.x && x < item.x + item.width && y > item.y && y < item.y + item.height) {
                                    selectedItem = item;
                                }
                            });
                            console.log(selectedItem.value);
                            if (selectedItem !== null) {
                                if (selectedBlockItems[0] == selectedItem) {
                                    selectedItem.deActive();
                                    selectedBlockItems = new Array();
                                }
                                else if (selectedBlockItems.length < 2) {
                                    selectedItem.doSelect();
                                    selectedBlockItems.push(selectedItem);
                                }

                            }
                        }
                    }


                });
            }
        };

        var run = function () {
            if (canvas && context) {
                interval = setInterval(function () {
                    context.clearRect(0, 0, screenW, screenH);
                    context.fillStyle = '#ffffff';
                    context.fillRect(0, 0, screenW, screenH);
                    context.strokeStyle = '#000000';
                    context.strokeRect(0, 0, screenW, screenH);

                    if (gameState == 0) {
                        renderStartScreen();
                    }
                    else if (gameState == 5) {
                        renderEndScreen();
                    }
                    else if (gameState == 4) {
                        renderLevelCompleteOverlay();
                    }
                    else {
                        renderBlocks();
                        if (gameState == 1) {
                            if (splashTime > 0) {
                                splashTime--;
                            }
                            else {
                                splashTime = 0;
                                gameState = 2;
                            }
                            renderSplashInfo();
                        }
                        else if (gameState == 2) {
                            renderScoreInfo();
                        }
                        else if (gameState == 3) {
                            if (life < 0) {
                                gameState = 5;
                            }
                            else {
                                renderScoreInfo();
                                renderLifeMinusInfo();
                                lifeMinusTime--;
                                if (lifeMinusTime <= 0) {
                                    gameState = 2;
                                    lifeMinusTime = 0;
                                }
                            }
                        }
                    }

                    if (life <= 0) {
                        gameState = 5;
                    }

                }, 20);
            }
        };

        var endGame = function () {
            gameState = 5;
        };

        var renderStartScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Match Match", screenW / 2, screenH * 0.3, screenW);
            context.font = "50px Arial";
            context.fillText("Start", screenW / 2, screenH * 0.6, screenW);
            context.font = "15px Arial";
            context.fillText("© 2014 Doris Zhang", screenW / 2, screenH * 0.9, screenW);
        };

        var renderSplashInfo = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "25px Arial";
            context.fillText("Remember as much as you can", screenW / 2, 40, screenW);
            context.fillText("before time out.", screenW / 2, 65, screenW);
            context.font = "15px Arial";
            context.fillText("Click anywhere to skip...", screenW / 2, 85, screenW);

            context.strokeStyle = '#000000';
            context.strokeRect(screenW * 0.1, screenH / 5 - 15, screenW * 0.8, 20);
            context.fillRect(screenW * 0.1, screenH / 5 - 15, screenW * 0.8*(splashTime/splashTimeStatic), 20);
        };

        var renderScoreInfo = function () {
            context.fillStyle = "#000000";
            context.textAlign = "start";
            context.font = "25px Arial";
            context.fillText("Level " + level, screenW * 0.1, 40, screenW*0.8);
            context.fillText("Score " + score, screenW * 0.1, 65, screenW*0.8);
            context.fillText("Life " + life, screenW * 0.1, 90, screenW*0.8);
        };

        var renderLifeMinusInfo = function () {
            drawRoundRect(screenW * 0.5, 50, screenW * 0.4, 50, 30);
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.font = '30px Arial';
            context.fillText('Life  -1', screenW * 0.7, 85);
        };

        var renderLevelCompleteOverlay = function () {
            drawRoundRect(screenW / 2 - screenW * 0.9 / 2, screenH / 2 - screenH * 0.6 / 2, screenW * 0.9, screenH * 0.6, 30);
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "40px Arial";
            context.fillText("Level Complete!", screenW / 2, screenH * 0.35, screenW);
            context.font = "30px Arial";
            context.fillText("Score + " + bounsScore, screenW / 2, screenH * 0.4 + 50, screenW);
            context.fillText("Life + " + thisLevelLife, screenW / 2, screenH * 0.4 + 85, screenW);
            context.fillText("Next Level >>", screenW / 2, screenH * 0.4 + 160, screenW);
        }

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
            var best = getCookie("doris_match_best_score");
            if (best.length < 1 || best < score) {
                document.cookie = "doris_match_best_score=" + score;
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

        var drawRoundRect = function (x, y, width, height, radius, isClicked) {
            context.strokeStyle = '#000000';
            if (isClicked) {
                context.fillStyle = '#8e8e8e';
            }
            else {
                context.fillStyle = '#ffffff';
            }
            if (width < 2 * radius) {
                radius = width / 2;
            }
            if (height < 2 * radius) {
                radius = height / 2;
            }
            context.beginPath();
            context.moveTo(x + radius, y);
            context.arcTo(x + width, y, x + width, y + height, radius);
            context.arcTo(x + width, y + height, x, y + height, radius);
            context.arcTo(x, y + height, x, y, radius);
            context.arcTo(x, y, x + width, y, radius);
            context.closePath();
            context.fill();
            context.stroke();
        };

        var renderBlocks = function () {
            var blockDeadNum = 0;
            var activeBlockNum = 0;
            $.each(blockItemList, function (i, item) {
                item.draw(context);
                item.logic();
                if (item.isDead) {
                    blockDeadNum++;
                }
                else if (item.isActive) {
                    activeBlockNum++;
                }
            });
            if (selectedBlockItems && selectedBlockItems.length >= 2 && selectedBlockItems[0].isActive && selectedBlockItems[1].isActive) {
                if (selectedBlockItems[0].value == selectedBlockItems[1].value) {
                    //if value match - success
                    selectedBlockItems[0].goToDie();
                    selectedBlockItems[1].goToDie();
                    score++;
                    score++;
                }
                else {
                    //if value not match - fail
                    selectedBlockItems[0].deActive();
                    selectedBlockItems[1].deActive();
                    score--;
                    life--;
                    gameState = 3;
                    lifeMinusTime = 15;
                }
                selectedBlockItems = new Array();
            }
            if (blockDeadNum == blockItemList.length) {
                gameState = 4;
                bounsScore = life * level;
                score += bounsScore;
                level++;
                initLevel();
            }
        };


        init();
        registerEvent();
        return {
            run:run
        };

    };
    
    $(function () {
        
        var canvas = new Canvas();
        canvas.run();
        
    });

})(jQuery);