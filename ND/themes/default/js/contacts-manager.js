/// <reference path="lib/backbone.js" />
/// <reference path="lib/jquery-1.7.1.js" />
/// <reference path="lib/underscore.js" />
(function ($) {

    var contacts = [
        { name: "Doris 1", address: "1, a street, a town, a city, ABCD 1", tel: "021-111111", email: "doris-1@d.com", type: "family" },
        { name: "Doris 2", address: "2, b street, b town, b city, ABCD 2", tel: "021-222222", email: "doris-2@d.com", type: "family" },
        { name: "Doris 3", address: "3, c street, c town, c city, ABCD 3", tel: "021-333333", email: "doris-3@d.com", type: "friend" },
        { name: "Doris 4", address: "4, d street, d town, d city, ABCD 4", tel: "021-444444", email: "doris-4@d.com", type: "colleague" },
        { name: "Doris 5", address: "5, e street, e town, e city, ABCD 5", tel: "021-555555", email: "doris-5@d.com", type: "Family" },
        { name: "Doris 6", address: "6, f street, f town, f city, ABCD 6", tel: "021-666666", email: "doris-6@d.com", type: "colleague" },
        { name: "Doris 7", address: "7, g street, g town, g city, ABCD 7", tel: "021-777777", email: "doris-7@d.com", type: "friend" },
        {  address: "8, h street, h town, h city, ABCD 8", tel: "021-888888", email: "doris-8@d.com", type: "family" }
    ];

    //  <%=photo %>  =>  {{photo}}
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "Demo/BackboneJS/Contact Manager/img/placeholder.png",
            name: "Unknown",
            address: "",
            tel: "",
            email: "",
            type:"others"
        }
    });

    var Directory = Backbone.Collection.extend({
        model:Contact
    });

    var ContactView = Backbone.View.extend({
        tagName: "article",
        className: "contact-container",
        template: $("#contactTemplate").html(),
        editTemplate: _.template($("#contactEditTemplate").html()),

        render: function () {
            var tmpl = _.template(this.template);
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "deleteContact",
            "click button.edit":"editContact",
            "change select.type": "addType",
            "click button.save": "saveEdit",
            "click button.cancel":"cancelEdit"
        },

        deleteContact: function (e) {
            //e.preventDefault();

            var removeType = this.model.get("type").toLowerCase();
            this.model.destroy();
            this.remove();
            if (_.indexOf(directory.getTypes(), removeType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removeType + "']").remove();
            }
            //directory.$el.find("#filter select").remove();
            //directory.$el.find("#filter").append(directory.createSelect());
        },

        editContact: function () {
            this.$el.html(this.editTemplate(this.model.toJSON()));

            var newOpt = $("<option/>", {
                html: "<em>Add new ...</em>",
                value:"addType"
            });

            this.select = directory.createSelect().addClass("type")
                .val(this.$el.find("#type").val())
                .append(newOpt)
                .insertAfter(this.$el.find(".name"));
            this.select.find("option").first().remove();
            this.$el.find("input[type='hidden']").remove();
        },

        addType: function () {
            if (this.select.val() === "addType") {
                this.select.remove();
                $("<input/>", {
                    "class": "type",
                    "placeholder": "type"
                }).insertAfter(this.$el.find(".name")).focus();
            }
        },

        saveEdit: function (e) {
            e.preventDefault();

            var formData = {};
            
            $(e.target).closest("form").find(":input").not("button").each(function () {
                var el = $(this);
                formData[el.attr("class")] = el.val();
            });

            if (formData.photo === "") {
                delete formData.photo;
            }

            this.model.set(formData);

            var prev = this.model.previousAttributes();

            this.render();

            if (prev.photo === "Demo/BackboneJS/img/placeholder.png") {
                delete prev.photo;
            }

            _.each(contacts, function (contact) {
                if (_.isEqual(contact, prev)) {
                    contacts.splice(_.indexOf(contacts, contact), 1, formData);
                }
            });
        },

        cancelEdit: function (e) {
            e.preventDefault();
            this.render();
        }
        
    });

    var DirectoryView = Backbone.View.extend({
        el: $("#contacts"),

        initialize: function () {
            this.collection = new Directory(contacts);
            this.render();
            this.$el.find("#filter").append(this.createSelect());
            this.on("changeFilterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
        },

        render: function () {
            this.$el.find("article").remove();
            var that = this;
            _.each(this.collection.models, function (item) {
               that.renderContact(item);
            },this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({
                model:item
            });
            this.$el.append(contactView.render().el);
        },

        getTypes: function () {
            //return _.uniq(this.collection.pluck("type"), false, function (type) {
            //    return type.toLowerCase();
            //});
            return _.uniq((new Directory(contacts)).pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },

        createSelect: function () {
            //var filter = this.$el.find("#filter");
            var select = $("<select/>", {
                    html: "<option>All</option>"
                    //class: "test",
                    //id:"test"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                });
                option.appendTo(select);
            });

            return select;
        },

        events: {
            "change #filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm":"showForm"
        },

        setFilter: function (e) {
            this.filterType = e.currentTarget.value.toLowerCase();
            this.trigger("changeFilterType");
        },

        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");
            }
            else {
                this.collection.reset(contacts, { silent: true });
                var filterType=this.filterType,
                    filtered = _.filter(this.collection.models, function (item) {
                        return item.get("type").toLowerCase() === filterType;
                    });
                this.collection.reset(filtered);
                contactsRouter.navigate("filter/" + filterType);
            }
        },

        addContact: function (e) {
            e.preventDefault();

            //var newModel = {};
            var newModel = new Contact();
            $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() != "") {
                    //newModel[el.id] = $(el).val();
                    newModel.set(el.id, $(el).val());
                }
            });

            contacts.push(newModel.toJSON());

            this.$el.find("#filter select").remove();
            this.$el.find("#filter").append(this.createSelect());

            this.collection.add(newModel);

            //this.collection.add(new Contact(newModel));
            //if (_.indexOf(this.getTypes(), newModel.type) === -1) {
            //    this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
            //}
        },

        removeContact: function (removedModel) {
            var removed = removedModel.attributes;
            //if (removed.photo === "Demo/BackboneJS/img/placeholder.png") {
            //    delete removed.photo;
            //}
            _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },

        showForm: function (e) {
            e.preventDefault();
            this.$el.find("#addContact").slideToggle();
        }
        
    });

    var ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type":"urlFilter"
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("changeFilterType");
        }
    });

    //$(document).ready(function () {
        var directory = new DirectoryView();
        var contactsRouter = new ContactsRouter();
        Backbone.history.start();
    //});
    

}(jQuery));