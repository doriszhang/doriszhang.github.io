/// <reference path="lib/backbone.js" />
/// <reference path="lib/jquery-1.7.1.js" />
/// <reference path="lib/underscore.js" />
$(function () {

    var ManModel = Backbone.Model.extend({

        maxSpeedY: 25,
        tempY: 0,  //same as maxSpeedY
        speedX:0,
        decrementY:1.2,
        manWidth:64,
        manHeight: 120,
        isGoingUp: false,
        state: "stay",  //"stay", "jump"
        position:{
            bottom: 0,
            left:200
        },
        alongwithModel: null,  //PlatformModel

        initialize: function () {
            this.state = "stay";
            this.tempY = this.maxSpeedY;
            this.position.bottom = 0;
            this.position.left = 200;
            this.alongwithModel = null;
        },

        maxJumpHeight: function () {
            var h = 0, s = this.maxSpeedY;
            while (s >= 0) {
                h += s;
                s -= this.decrementY;
            }
            return h;
        },

        logic: function () {
            if (this.state == "jump") {
                this.speedX = 0;
                if (this.tempY >= 0)
                    this.isGoingUp = true;
                else
                    this.isGoingUp = false;
                this.position.bottom += this.tempY;
                this.tempY -= this.decrementY;

                //if (this.position.bottom < 0 || this.position.bottom + this.tempY < 0) {
                //    this.state = "stay";
                //    this.position.bottom = 0;
                //}
            }
            else if (this.state == "stay") {
                if (this.alongwithModel && this.alongwithModel.get("speedX")) {
                    this.speedX = this.alongwithModel.get("speedX");
                    this.position.left += this.speedX;
                }
                isAdjusting = this.position.bottom > 220 ? true : false;
                if (isAdjusting) {
                    this.position.bottom -= adjustSpeedY;
                }
            }
        }

    });

    var PlatformModel = Backbone.Model.extend({
        
        pfWidth: 80,
        pfHeight: 8,

        defaults:{            
            bottom: 0,
            left:0,
            isMoving: false,
            speedX:5
        },

        initialize: function () {
        },

        logic: function () {
            if (this.get("bottom") > 0 && this.get("bottom") < 800 && !this.get("isMoving"))
                this.set({ "isMoving": true });
            if (this.get("isMoving")) {
                this.set({ "left": this.get("left") + this.get("speedX") });
                if (this.get("left") <= 0) {
                    this.set({ "speedX": -this.get("speedX") });
                    this.set({ "left": 0 });
                }
                else if (this.get("left") + this.pfWidth >= 480) {
                    this.set({ "speedX": -this.get("speedX") });
                    this.set({ "left": 480 - this.pfWidth });
                }                    
            }

            if (man.state=="stay" && isAdjusting)
                this.set({ "bottom": this.get("bottom") - adjustSpeedY });
            
            if (this.get("bottom") < -10) {
                var maxBottom = _.max(platforms.pluck("bottom"));
                this.set({ "bottom": maxBottom + pfMargin });
            }
            
        }

    });

    var PlatformCollection = Backbone.Collection.extend({

        model:PlatformModel

    });

    var MainView = Backbone.View.extend({

        el: $("#container"),
        
        initialize: function () {
            this.collection = platforms;
        },

        render: function () {
            if (gameStart) {
                this.$el.find(".endScreen").hide();
                man.logic();
                this.updateManPosition(man);
                this.renderPlatforms();
                //check hit
                this.checkHit();
                if (man.position.bottom < -man.manHeight) {
                    //clearInterval(run);
                    gameStart = false;
                }
                this.$el.find("span.score").html("Score: " + score);
            }
            else {
                this.$el.find(".endScreen").show();
                this.$el.find(".endScreen span").html("Score: " + score);
            }
        },

        updateManPosition: function (model) {
            var $man = this.$el.find(".man");
            $man.css({ "bottom": man.position.bottom + "px", "left": man.position.left + "px" });
        },

        renderPlatforms: function () {
            var self = this;
            _.each(this.collection.models, function (pf) {
                pf.logic();
                self.updateSinglePlatform(pf);
            });
        },

        updateSinglePlatform: function (model) {
            var $pf = this.$el.find("img#" + model.id);
            if (!$pf || $pf.length <= 0) {
                this.$el.find(".platforms").append("<img src='themes/default/img/balckline.png' id='" + model.id + "'/>");
                $pf = this.$el.find("img#" + model.id)
            }
            if ($pf && $pf.length > 0) {
                $pf.css({ "bottom": model.get("bottom") + "px", "left": model.get("left") + "px" });
            }
        },

        checkHit: function () {
            var $this = this;
            if (!man.isGoingUp && man.state == "jump") {
                _.each(this.collection.models, function (pf) {
                    if (man.position.bottom <= (pf.get("bottom") + pf.pfHeight)
                        && (man.position.bottom + 20) >= (pf.get("bottom") + pf.pfHeight)
                        && ((man.position.left >= pf.get("left") && man.position.left <= (pf.get("left") + pf.pfWidth)) || ((man.position.left + man.manWidth) >= pf.get("left") && (man.position.left + man.manWidth) <= (pf.get("left") + pf.pfWidth)))
                        ) {
                        man.alongwithModel = pf;
                        man.position.bottom = pf.get("bottom") + pf.pfHeight;
                        man.state = "stay";
                        score++;
                        console.log(pf);
                        return;
                    }
                    
                });
            }
        }


    });

    var man = new ManModel();
    var platforms = new PlatformCollection();
    var startY = 180;
    var pfMargin=180;
    for (var i = 1; i <= 8; i++) {
        var pf = new PlatformModel();
        pf.set({ "bottom": startY, "left": Math.random() * 380 });
        pf.id = Math.floor(Math.random() * 10000000);
        startY += pfMargin;
        platforms.add(pf);
    }

    var mainView = new MainView();

    var isAdjusting = false;
    var adjustSpeedY = 10;

    var score = 0;
    var gameStart = true;
    
    $(document).on("click touchstart", function () {
        if (gameStart) {
            if (man.state == "stay") {
                man.state = "jump";
                man.tempY = man.maxSpeedY;
            }
        }
        else {
            gameStart = true;
            score = 0;

            man.initialize();
            
            startY = 180;
            _.each(platforms.models, function (pf) {
                pf.set({ "bottom": startY, "left": Math.random() * 380 });
                startY += pfMargin;
            });            

            //$("#container .platforms").empty();
        }
    });
    var run=setInterval(function () { mainView.render() }, 20);

    
    
});