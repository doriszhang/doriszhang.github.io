(function ($) {

    var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    var screenW = 450, screenH = 550,
        inputsY = screenH * 0.25, inputsH = 0,
        score=0,
        gameState = 0;  // 0 -> ready, 1 -> start, 2 -> startLevelWin, 3 -> startHistory, 4 -> end

    var Key = function (index,value) {

        this.value = '';
        this.width = screenW / 5;
        this.height = this.width;
        this.x = 0;
        this.y = 0;
        this.isClicked = false;

        this.init = function () {
            this.value = value;
            this.x = (index % 5) * this.width;
            this.y = screenH - this.height * 2 + parseInt(index / 5) * this.height;
        };

        this.init();

    };

    var Input = function (index, totalNum) {

        this.value = '';
        this.width = 80;
        this.height = 80;
        this.x = 0;
        this.y = 0;
        this.active = false;

        this.init = function () {
            if (index == 0) { this.active = true; }
            var margin = 20;
            if (totalNum >= 5) {
                margin = 5;
                this.width = screenW / totalNum - margin * 2;
                this.height = this.width;
            }
            var totalW = (this.width + margin) * totalNum;
            this.x = screenW / 2 - totalW / 2 + index * (this.width + margin) + margin / 2;
            this.y = inputsY;

            inputsH = this.height;
        };

        this.init();

    };

    var Button = function (value) {

        this.value = '';
        this.width = 100;
        this.height = 50;
        this.x = 0;
        this.y = 0;
        this.hide = false;
        this.isClicked = false;
        this.event = null;

        this.init = function () {
            this.value = value;
        };

        this.init();
    };

    var Hist = function (inputArray,rightNumber,rightPosition) {
        
        this.value = '';
        this.result = '';
        this.rightNumber = 0;
        this.rightPosition = 0;

        this.init = function () {
            this.rightNumber = rightNumber;
            this.rightPosition = rightPosition;
            this.result = rightNumber + '(A)' + rightPosition + '(B)';
            var v = '';
            $.each(inputArray, function (i, item) {
                v += item + ' ';
            });
            this.value = v;
        };

        this.init();

    };

    var Canvas = function () {

        var canvas = null,
            context = null,
            keyboards = null,
            inputCount = 0,
            userInputs = null,
            inputLog = null,
            level = 1,
            secretNumber = null,
            buttonList = null,
            historyList = null,
            stepCount = 10;

        var init = function () {
            canvas = $('#mainCanvas');
            if (canvas != null) {
                context = canvas.get(0).getContext('2d');
                context.canvas.width = screenW;
                context.canvas.height = screenH;
                canvas.css('max-width', $(window).innerWidth() - 10);
                canvas.css('max-height', $(window).innerHeight() - 10);
            }
            
            //init keyboards
            keyboards = new Array();            
            for (var i = 0; i <= 9; i++) {
                var key = new Key(i, i);
                keyboards.push(key);
            }

            //init level
            initLevel();

            

            //init buttons
            buttonList = new Array();
            initButtons();

            stepCount = 10;            
            score = 0;

            render();
        };

        var initLevel = function () {
            if (level <= 1) { inputCount = 2; }
            else if (level <= 3) { inputCount = 3; }
            else if (level <= 5) { inputCount = 4; }
            else if (level <= 8) { inputCount = 5; }
            else { inputCount = 6; }
            //init inputs
            userInputs = new Array();
            for (var i = 0; i < inputCount; i++) {
                var input = new Input(i, inputCount);
                userInputs.push(input);
            }
            inputLog = new Array();
            historyList = new Array();
            //init secret number
            secretNumber = getSecretNumber(inputCount);
            console.log(secretNumber);
        };

        var getSecretNumber = function (count) {
            var temp = numbers;
            temp.sort(function () { return (Math.random() - 0.5); });
            var ranOrd=Math.round(Math.random() * (temp.length - count));
            var output = temp.slice(ranOrd, ranOrd+count);
            return output.sort(function () { return (Math.random() - 0.5); });
        };

        var initButtons = function () {
            //submit
            var submit = new Button('Confirm');
            submit.width = 150;
            submit.height = 40;
            submit.x = screenW / 2 - submit.width / 2;
            submit.y = inputsY + inputsH + 30;
            submit.event = function () { btnClick_Confirm(submit); };
            buttonList.push(submit);
            //del
            var del = new Button('<<');
            del.width = 80;
            del.height = 40;
            del.x = screenW - 100;
            del.y = inputsY + inputsH + 30;
            del.event = function () { btnClick_Del();};
            buttonList.push(del);
            //history
            var history = new Button('History');
            history.width = 180;
            history.height = 40;
            history.x = 30;
            history.y = 30;
            history.event = function () { btnClick_Hist();};
            buttonList.push(history);
        };

        var btnClick_Hist = function () {
            if (historyList.length > 0) {
                gameState = 3;
                renderHistoryOverlay();
            }
            else {
                renderButtons();
            }
        };

        var btnClick_Del = function () {
            var activeIndex = -1;
            $.each(userInputs, function (i,item) {
                if (item.active) {
                    if (item.value == '' && i>0) {
                        item.active = false;
                        activeIndex = i;
                    }
                    else {
                        item.value = '';
                    }
                    inputLog.pop();
                    console.log(inputLog);
                }
            });
            if (activeIndex > 0) {
                userInputs[activeIndex - 1].active = true;
                userInputs[activeIndex - 1].value = '';
            }
            renderInputs();
            renderButtons();
        };

        var btnClick_Confirm = function (btn) {
            if (inputLog.length == inputCount) {
                var rightNumber = 0;
                var rightPosition = 0;
                $.each(inputLog, function (i, value) {
                    var index = $.inArray(value, secretNumber);
                    if (index >= 0) {
                        rightNumber++;
                        if (index == i) {
                            rightPosition++;
                        }
                    }
                });
                $.each(userInputs, function (i, item) {
                    item.value = '';
                    item.active = false;
                });
                userInputs[0].active = true;
                renderInputs();
                console.log(rightNumber + ',' + rightPosition);

                var history = new Hist(inputLog, rightNumber, rightPosition);
                historyList.push(history);
                inputLog.splice(0, inputLog.length);
                renderConfirmResults(history, false);

                if (rightNumber == inputCount && rightPosition == inputCount) {
                    gameState = 2;
                    score += (stepCount*level);                                        
                    renderLevelCompleteOverlay();
                    level++;
                    stepCount = 10;
                }
                else {
                    stepCount--;
                    renderInfo();
                    if (stepCount <= 0) {
                        gameState = 4;
                        render();
                    }
                    else {
                        renderButtons();
                    }
                }
            }
            else {
                renderButtons();
            }
        };

        var renderLevelCompleteOverlay = function () {
            drawRoundRect(screenW / 2 - screenW * 0.9 / 2, screenH / 2 - screenH * 0.6 / 2, screenW * 0.9, screenH * 0.6, 30);
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "40px Arial";
            context.fillText("Level Complete!", screenW / 2, screenH * 0.4, screenW);
            context.font = "30px Arial";
            context.fillText("Score + " + stepCount*level, screenW / 2, screenH * 0.4 + 50, screenW);
            context.fillText("Next Level >>", screenW / 2, screenH * 0.4 + 100, screenW);
        };

        var renderHistoryOverlay = function () {
            drawRoundRect(screenW / 2 - screenW * 0.8 / 2, 0, screenW * 0.8, screenH, 30);
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "40px Arial";
            context.fillText("~ History ~", screenW / 2, 50, screenW);
            context.font = "25px Arial";
            $.each(historyList, function (i, item) {
                context.fillText((i+1)+".   "+item.value+"        "+item.result, screenW / 2, 150+i*40,screenW);
            });
        };

        var render = function () {
            if (canvas && context) {

                context.clearRect(0, 0, screenW, screenH);
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, screenW, screenH);
                context.strokeStyle = '#000000';
                context.strokeRect(0, 0, screenW, screenH);

                if (gameState == 0) {
                    renderStartScreen();
                }
                else if (gameState == 4) {
                    renderEndScreen();
                }
                else {
                    renderKeyboards();
                    renderInputs();
                    renderButtons();
                    renderInfo();
                }
            }
        };

        var renderInfo = function () {
            context.fillStyle = '#ffffff';
            context.fillRect(screenW * 0.5, 15, screenW*0.45, 90);
            context.fillStyle = '#000000';
            context.font = '25px Arial';
            context.textAlign = 'start';
            context.fillText('Level   ' + level, screenW * 0.55, 40);
            context.fillText('Score   ' + score, screenW * 0.55, 65);
            context.fillText('Step    ' + stepCount, screenW * 0.55, 90);
        };

        var renderStartScreen = function () {
            context.fillStyle = "#000000";
            context.textAlign = "center";
            context.font = "60px Arial";
            context.fillText("Bulls and Cows", screenW / 2, screenH * 0.3, screenW);
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
            var best = getCookie("doris_number_best_score");
            if (best.length < 1 || best < score) {
                document.cookie = "doris_number_best_score=" + score;
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

        var renderInputs = function () {
            context.fillStyle = '#ffffff';
            context.fillRect(10, inputsY, screenW - 20, inputsH);
            $.each(userInputs, function (i, item) {
                if (item.active) {
                    context.strokeStyle = '#000000';
                }
                else {
                    context.strokeStyle = '#a2a2a2';
                }
                context.strokeRect(item.x, item.y, item.width, item.height);
                if (item.value!='') {
                    context.fillStyle = '#000000';
                    context.font = '30px Arial';
                    context.textAlign = 'center';
                    context.fillText(item.value, item.x + item.width / 2, item.y + item.height / 2+10);
                }
            });
        };

        var renderKeyboards = function () {
            context.fillStyle = '#ffffff';
            context.fillRect(0, screenH - screenW / 5 * 2, screenW, screenW / 5 * 2);
            $.each(keyboards, function (i, item) {

                if (item.isClicked) {
                    context.fillStyle = '#8e8e8e';
                    context.fillRect(item.x, item.y, item.width, item.height);
                    setTimeout(function () {
                        item.isClicked = false;
                        renderKeyboards();
                    }, 100);
                }

                context.strokeStyle = '#000000';
                context.strokeRect(item.x, item.y, item.width, item.height);

                context.fillStyle = '#000000';
                context.font = '20px Arial';
                context.textAlign = 'center';
                context.fillText(item.value, item.x + item.width / 2, item.y + item.height / 2);

            });
        };

        var renderButtons = function () {
            $.each(buttonList, function (i, button) {
                context.fillStyle = '#ffffff';
                context.fillRect(button.x-1, button.y-1, button.width+2, button.height+2);
                if (!button.hide) {
                    drawRoundRect(button.x, button.y, button.width, button.height, 30, button.isClicked);
                    context.fillStyle = '#000000';
                    context.font = '25px Arial';
                    context.textAlign = 'center';
                    context.fillText(button.value, button.x + button.width / 2, button.y + button.height / 2 + 8);
                    if (button.isClicked) {
                        setTimeout(function () {
                            button.isClicked = false;
                            renderButtons();
                        }, 100);
                    }
                }
            });
        };

        var drawRoundRect = function (x, y, width, height, radius,isClicked) {
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

        var renderConfirmResults = function (history,ishide) {
            context.fillStyle = '#ffffff';
            context.fillRect(5, screenH - screenW / 5 * 2-80, screenW - 10, 70);
            if (!ishide && history) {
                context.fillStyle = '#000000';
                context.font = '20px Arial';
                context.textAlign = 'center';
                context.fillText(history.value + "     " + history.result, screenW / 2, screenH - screenW / 5 * 2 - 60);
                context.fillText('Right Number: ' + history.rightNumber + ' (A)', screenW / 2, screenH - screenW / 5 * 2 - 40);
                context.fillText('Right Position: ' + history.rightPosition + ' (B)', screenW / 2, screenH - screenW / 5 * 2 - 20);
            }
        };

        var event = function () {
            //window size changes event
            $(window).resize(function () {
                if (canvas != null) {
                    canvas.css('max-width', $(window).innerWidth() - 10);
                    canvas.css('max-height', $(window).innerHeight() - 10);
                }
            });

            if (canvas && context) {
                canvas.on('touchstart click', function (e) {
                    e.stopPropagation(); e.preventDefault();

                    if (gameState === 0) {
                        init();
                        gameState = 1;
                        render();
                    }
                    else if (gameState === 1) {
                        var rect = this.getBoundingClientRect();
                        var clientX = (e.clientX ? e.clientX : e.originalEvent.changedTouches[0].clientX) - rect.left;
                        var clientY = (e.clientY ? e.clientY : e.originalEvent.changedTouches[0].clientY) - rect.top;
                        var x = clientX * screenW / canvas.width();
                        var y = clientY * screenH / canvas.height();

                        var value = '';

                        if (y >= screenH - screenW / 5 * 2) {
                            $.each(keyboards, function (i, item) {
                                if (item.x < x && item.x + item.width > x && item.y < y && item.y + item.height > y) {
                                    value = item.value;
                                    item.isClicked = true;
                                    renderKeyboards();
                                    if (inputLog.length < inputCount && $.inArray(value, inputLog) < 0) {
                                        inputLog.push(value);
                                        console.log(inputLog);
                                        var activeIndex = -1;
                                        $.each(userInputs, function (n, target) {
                                            if (target.active) {
                                                target.value = value + '';
                                                if (n < inputCount - 1) {
                                                    target.active = false;
                                                    activeIndex = n;
                                                }
                                            }
                                        });
                                        if (activeIndex >= 0 && activeIndex < (inputCount - 1)) {
                                            userInputs[activeIndex + 1].active = true;
                                        }
                                        renderInputs();
                                    }
                                }
                            });
                            renderConfirmResults(null, true);
                        }
                        else {
                            $.each(buttonList, function (i, item) {
                                if (!item.hide && item.x < x && item.x + item.width > x && item.y < y && item.y + item.height > y) {
                                    item.isClicked = true;                                    
                                    if (item.event && $.isFunction(item.event)) {
                                        item.event.call(this);
                                    }
                                }
                            });
                        }
                    }
                    else if (gameState === 2) {
                        gameState = 1;
                        initLevel();
                        render();
                    }
                    else if (gameState === 3) {
                        gameState = 1;
                        render();
                    }
                    else {
                        gameState = 0;
                        render();
                    }

                });
            }
        };

        init();
        event();

    };
       

    $(function () {

        //Doris.Wechat.init({
        //    "tTitle": "Game - Bulls and Cows (Guess Numbers)",
        //    "tContent": "Doris canvas training"
        //});
        
        Canvas();
        
    });

})(jQuery);