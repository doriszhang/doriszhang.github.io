/// <reference path="lib/backbone.js" />
/// <reference path="lib/jquery-1.7.1.js" />
/// <reference path="lib/underscore.js" />
/// <reference path="../../../Demo/BackboneJS/Todos/js/backbone-localstorage.js" />
$(function () {

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    var countModel = Backbone.Model.extend({

        defaults: {
            title: "empty count...",
            name: "",
            mouth: 0,
            eye: 0,
            leg: 0
        },

        initialize: function () {
            if (!this.get("title")) {
                this.set({ "title": this.defaults.title });
            }
        },

        clear: function () {
            counts.localStorage.destroy(this);
            //this.destory();
            //counts.destory();
        }

    });

    var countList = Backbone.Collection.extend({

        model: countModel,

        localStorage: new Store("count-backbone")
        
    });

    var counts = new countList;
    //counts.add(new countModel({ title: "count1", name: "forg", mouth: 1, eye: 2, leg: 4, id: "123" }));
    //counts.add(new countModel({ title: "count2", name: "forg", mouth: 1, eye: 2, leg: 4, id: "124" }));
    //counts.add(new countModel({ title: "count3", name: "forg", mouth: 1, eye: 2, leg: 4, id: "125" }));

    var titleView = Backbone.View.extend({

        tagName: "div",
        className: "title",
        templateSelector:"",
        
        render: function () {
            var tmpl = _.template($(this.templateSelector).html());
            if (this.model == null || this.model == undefined)
                this.$el.html(tmpl);
            else
                this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },

        events: {
            "click span.back": "backToHome",
            "click span.edit":"goToEdit"
        },

        backToHome: function () {
            listView.render();
            router.navigate("");
        },

        goToEdit: function () {
            if (this.model != null && this.model != undefined) {
                editView.editModel = this.model;
                editView.render();
                router.navigate("edit/"+this.model.id);
            }
        }

    });

    var controllerView = Backbone.View.extend({

        tagName: "div",
        className: "controllers",
        templateSelector: "",
        
        render: function () {
            var tmpl = _.template($(this.templateSelector).html());
            this.$el.html(tmpl);
            var $tagNum = $(this.$el.find(".num"));
            if ($tagNum != null && $tagNum != undefined)
                $tagNum.html(countNumber);
            return this;
        },

        events: {
            "click button#add": "addNewCount",
            "click button#save": "saveEdit",
            "click button#cancel": "cancelEdit",
            "click button#minus": "countMinus",
            "click button#plus": "countPlus",
            "dblclick span.num": "countEdit",
            "keypress input.num": "countUpdate",
            "blur input.num":"countCancel"
        },

        addNewCount: function () {
            editView.editModel = new countModel();
            editView.render();
            router.navigate("edit");
        },

        saveEdit: function (e) {
            listView.trigger("saveEdit");
        },

        cancelEdit: function () {
            listView.render();
            router.navigate("");
        },

        countMinus: function () {
            if (countNumber > 1) {
                countNumber--;
            }
            detailView.render();
        },

        countPlus: function () {
            if (countNumber > 0)
                countNumber++;
            else
                countNumber = 1;
            detailView.render();
        },

        countEdit: function () {
            var $span = $(this.$el.find("span.num"));
            var $input = $(this.$el.find("input.num"));
            if ($span != null && $span != undefined && $input != null && $input != undefined) {
                $span.hide();
                $input.show();
                $input.val(countNumber); 
                $input.focus();
            }
        },

        countUpdate: function (e) {
            var $input = $(this.$el.find("input.num"));
            if (e.keyCode == 13) {
                if (parseInt($input.val()) > 0)
                    countNumber = parseInt($input.val());
                detailView.render();
            }
        },

        countCancel: function () {
            var $span = $(this.$el.find("span.num"));
            var $input = $(this.$el.find("input.num"));
            $span.show();
            $input.hide();
        }

    });

    var listItemView = Backbone.View.extend({

        tagName: "li",
        template: $("#listItemTemplate").html(),

        initialize: function () {
            //_.bindAll(this, 'render','remove');
            //this.model.bind('destory', this.remove);
        },

        render: function () {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },

        events: {
            "click span.edit": "editThisCount",
            "click span.delete": "deleteThisCount",
            "click span.view":"showDetail"
        },

        editThisCount: function (e) {
            e.preventDefault();
            editView.editModel = this.model;
            editView.render();
            router.navigate("edit/" + this.model.get("id"));
        },

        deleteThisCount: function (e) {
            //this.model.destory();
            this.model.clear();
            this.remove();
        },

        showDetail: function () {
            countNumber = 1;
            detailView.detailModel = this.model;
            detailView.render();
            router.navigate("view/" + this.model.get("id"));
        }

    });

    var listAppendView = Backbone.View.extend({
        
        el: $("#container"),
        
        initialize: function () {
            this.on("saveEdit", this.saveEdit, this);
        },

        render: function () {
            thisEL = this.$el;
            thisEL.empty();
            //render title
            var listTitle = new titleView();
            listTitle.templateSelector = "#listTitleTemplate";
            thisEL.append(listTitle.render().el);
            //render content
            thisEL.append("<div id='itemlist' class='itemlist'><ul></ul></div>");
            _.each(counts.localStorage.data, function (item) {
                var countItem = new listItemView({ model: new countModel(item) });
                thisEL.find(".itemlist ul").append(countItem.render().el);
            });
            //render controllers
            var controllers = new controllerView();
            controllers.templateSelector = "#listControllersTemplate";
            thisEL.append(controllers.render().el);
        },

        saveEdit: function () {            

            if (editView.editModel.get("id") == null || editView.editModel.get("id") == undefined) {
                var newCount = {};
                $("#container .itemlist").find("input").each(function (i, el) {
                    if ($(el).val() != "") {
                        newCount[el.id] = el.value;
                    }
                });
                newCount["id"] = Math.floor(Math.random() * 10000000);
                counts.localStorage.create(newCount);
            }
            else {
                var find = counts.localStorage.find(editView.editModel);
                $("#container .itemlist").find("input").each(function (i, el) {
                    if ($(el).val() != "") {
                        find[el.id] = el.value;
                    }
                });
            }

            counts.localStorage.save();
            this.render();
            router.navigate("");
        }

    });

    var editContentView = Backbone.View.extend({

        tagName: "div",
        className: "itemlist",
        template:$("#editContentTemplate").html(),

        render: function () {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }

    });

    var editAppendView = Backbone.View.extend({

        el: $("#container"),

        initialize: function () {
            this.editModel = new countModel();
        },

        render: function () {
            thisEL = this.$el;
            thisEL.empty();
            //renderTitle
            var listTitle = new titleView();
            listTitle.templateSelector = "#editTitleTemplate";
            thisEL.append(listTitle.render().el);
            //render content
            var editContent = new editContentView();
            editContent.model = this.editModel;
            thisEL.append(editContent.render().el);
            //render controllers
            var controllers = new controllerView();
            controllers.templateSelector = "#editControllersTemplate";
            thisEL.append(controllers.render().el);
        }

    });

    var detailContentView = Backbone.View.extend({
        
        tagName: "div",
        className: "itemlist",
        template: $("#showContentTemplate").html(),

        render: function () {
            this.$el.empty();
            var tmpl = _.template(this.template);
            var num = countNumber, action = '';
            for (var i = 1; i <= countNumber; i++) {
                action += "扑通 ";
            }
            this.model.set({ num: num,action:action });
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        }

    });

    var detailAppendView = Backbone.View.extend({

        el: $("#container"),

        initialize: function () {
            
        },

        render: function () {
            thisEL = this.$el;
            thisEL.empty();
            //renderTitle
            var listTitle = new titleView({ model: detailView.detailModel });
            listTitle.templateSelector = "#showTitleTemplate";
            thisEL.append(listTitle.render().el);
            //render content
            var contentDetail = new detailContentView({ model: detailView.detailModel });
            thisEL.append(contentDetail.render().el);
            //render controllers
            var controllers = new controllerView();
            controllers.templateSelector = "#showControllersTemplate";
            thisEL.append(controllers.render().el);
        }

    });

    
    var Router = Backbone.Router.extend({
        
        routes: {
            "": "navToListPage",
            "edit": "navToEditPage",
            "edit/:modelID": "navToEditPage",
            "view/:modelID":"navToViewPage"
        },

        navToListPage: function () {
            listView.render();
        },

        navToEditPage: function (modelID) {
            //var editmodel = counts.find(function (item) {
            //    if (item.id == modelID)
            //        return true;
            //});
            var editmodel = counts.localStorage.find({ id: modelID });
            if (editmodel != null && editmodel != undefined)
                editView.editModel = new countModel(editmodel);
            else
                editView.editModel = new countModel();
            editView.render();
        },

        navToViewPage: function (modelID) {
            countNumber = 1;
            var viewmodel = counts.localStorage.find({id:modelID});
            if (viewmodel != null && viewmodel != undefined) {
                detailView.detailModel = new countModel(viewmodel);
                detailView.render();
            }
        }

    });

    var listView = new listAppendView();
    var editView = new editAppendView();
    var detailView = new detailAppendView();
    var router = new Router();
    var countNumber = 1;
    Backbone.history.start();

    Doris.Wechat.init({
        "tTitle": 'Doris Count Forgs - Share',
        "tContent": 'Doris canvas training',
        "timeLineLink": "http://ndwechat2.staging.nextdigital.com/doris/pj/CountForgs.html"
    });

});