
var CountForgsAngular = angular.module('countForgs', ['ngRoute']);  //depends on 'ngRoute' \lib\angular-route.min.js

CountForgsAngular.constant('routeConstants', {
	home: {
		path: '/',
		controller: 'listController',
		template: function () {
		    return $('#list-page-template').html();
		}
	},
	detail: {
		path: '/model/:modelid/detail',
		controller: 'detailController',
		template: function () {
		    return $('#detail-page-template').html();
		}
	},
	edit: {
		path: '/model/:modelid/edit',
		controller: 'editController',
		template: function () {
		    return $('#edit-page-template').html();
		}
	},
	create: {
		path: '/create',
		controller: 'editController',
		template: function () {
		    return $('#edit-page-template').html();
		}
	}
});

CountForgsAngular.config(['$routeProvider', 'routeConstants', function ($routeProvider, routeConstants) {
    $routeProvider.when(routeConstants.home.path, {
        template: routeConstants.home.template,
        controller: routeConstants.home.controller
    }).when(routeConstants.detail.path, {
        template: routeConstants.detail.template,
        controller: routeConstants.detail.controller
    }).when(routeConstants.edit.path, {
        template: routeConstants.edit.template,
        controller: routeConstants.edit.controller
    }).when(routeConstants.create.path, {
        template: routeConstants.create.template,
        controller: routeConstants.create.controller
    }).otherwise({
        redirectTo: routeConstants.home.path
    });
}]);

CountForgsAngular.value('appValue', {
    models: []
});

CountForgsAngular.factory('webAPI', ['$http', '$q', 'appValue', function ($http, $q, appValue) {
    var cache = {},
        services = {
            get: function (appValueName) {
                if (services.isCached(appValueName)) {
                    var defer = $q.defer();
                    var cachedData = services.cached(appValueName);
                    defer.resolve(cachedData);
                    return defer.promise;
                }
                else {
                    var defer = $q.defer();     // 声明延后执行，表示要去监控后面的执行
                    if ($('#modelData-default').length > 0) {
                        var cachedData = JSON.parse($('#modelData-default').html());
                        services.store(appValueName, cachedData);
                        appValue[appValueName] = cachedData;
                        defer.resolve(cachedData);      // 声明执行成功，即http请求数据成功，可以返回数据了
                    }
                    else {
                        defer.reject();     // 声明执行失败，即服务器返回错误
                    }
                    return defer.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API 
                }
            },
            store: function (name, value) {
                cache[name] = value;
            },
            cached: function (name) {
                return cache[name];
            },
            isCached: function (name) {
                return angular.isDefined(cache[name]) && cache[name] != null;
            },
            deleteModel: function (modelId) {
                try {
                    appValue.models = $.grep(appValue.models, function (m, i) {
                        return !(m.id == modelId);
                    });
                    services.store('models', appValue);
                    return true;
                }
                catch (e) {
                    console.log(e.message);
                    return false;
                }
            },
            addModel: function (model) {
                try {
                    appValue.models.push(model);
                    services.store('models', appValue);
                    return true;
                }
                catch (e) {
                    console.log(e.message);
                    return false;
                }
            }
        },
        publicServices = {
            getModels: function () {
                return services.get('models');
            },
            deleteModel: function (modelid) {
                return services.deleteModel(modelid);
            },
            addModel: function (model) {
                return services.addModel(model);
            }
        };
    return publicServices;
}]);

CountForgsAngular.directive('pageTitle', [function () { //注意命名 pageTitle -> <div page-title=''/>
    return {
        restrict: 'A',
        //E - 元素名称： <page-title></page-title>
        //A - 属性名： <div page-title=”exp”></div>
        //C - class名： <div class=”page-title:exp;”></div>
        //M - 注释 ： <!-- directive: page-title exp -->
        replace: true,
        //如果设置为true，那么模版将会替换当前元素，而不是作为子元素添加到当前元素中。（注：为true时，模版必须有一个根节点）
        template: function () {
            return $('#title-template').html();
        },
        link: function (scope, element, attr) {
        },
        controller: ['$scope', 'appValue', function ($scope, appValue) {
            $scope.appValue = appValue;
        }]
    }
}]);

CountForgsAngular.filter('countNumber', function () {
    return function (input) {
        if (angular.isDefined(input) && input != null && typeof (input)==='number') {
            return input;
        }
        return 0;
    };
});

CountForgsAngular.controller('listController', ['$scope', '$location', 'routeConstants','webAPI', 'appValue', function ($scope, $location, routeConstants,webAPI, appValue) {
    $scope.appValue = appValue;
    webAPI.getModels().then(function () {
        console.log(appValue.models);
    });
    $scope.goToDetailPage = function (model, $event) {
        $event.preventDefault(); $event.stopPropagation();
        $location.path(routeConstants.detail.path.replace(':modelid', model.id));
    };
    $scope.goToEditPage = function (model, $event) {
        $event.preventDefault(); $event.stopPropagation();
        $location.path(routeConstants.edit.path.replace(':modelid', model.id));
    };
    $scope.deleteModel = function (model,$event) {
        $event.preventDefault(); $event.stopPropagation();
        webAPI.deleteModel(model.id);
        console.log(appValue.models);
    };
    $scope.goToCreatePage = function () {
        $location.path(routeConstants.create.path);
    };
}]);

CountForgsAngular.controller('detailController', ['$scope','$filter', '$location', '$routeParams','routeConstants', 'webAPI', 'appValue', function ($scope,$filter, $location,$routeParams, routeConstants, webAPI, appValue) {
    var init = function () {
        $scope.num = 1;
        $scope.action = getActionString($scope.num);
        $scope.appValue = appValue;
        $scope.selectedModel = getSelectedModel($routeParams.modelid, appValue.models);
    },
    fetchModel = function () {
        if (appValue.models.length === 0) {
            webAPI.getModels().then(function () {
                init();
            });
        }
        else {
            init();
        }
    },
    getSelectedModel = function (modelid, models) {
        var result = null;
        if (modelid && modelid.length && models && models.length) {
            $.each(models, function (i, m) {
                if (m.id.toString() === modelid.toString()) {
                    result = m;
                    return false; //break
                }
            });
        }
        return result;
    },
    getActionString = function (num) {
        var action = '扑通';
        var str = '';
        for (var i = 0; i < num; i++) {
            str += action + ' ';
        }
        return str;
    };
    fetchModel();
    $scope.numMinus = function () {
        if ($scope.num > 1) {
            $scope.num--;
        }
        $scope.action = getActionString($scope.num);
    };
    $scope.numPlus = function () {
        $scope.num++;
        $scope.action = getActionString($scope.num);
    };
    $scope.numChange = function () {
        $scope.action = getActionString($scope.num);
        $scope.num = $filter('countNumber')($scope.num);
    };
    $scope.goToListPage = function () {
        $location.path(routeConstants.home.path);
    };
    $scope.goToEditPage = function () {
        $location.path(routeConstants.edit.path.replace(':modelid', $scope.selectedModel.id));
    };
}]);

CountForgsAngular.controller('editController', ['$scope', '$filter', '$location', '$routeParams', 'routeConstants', 'webAPI', 'appValue', function ($scope, $filter, $location, $routeParams, routeConstants, webAPI, appValue) {
    var fetchModel = function () {
        $scope.isNew = true;
        webAPI.getModels().then(function () {
            $scope.appValue = appValue;
            $scope.editModel = getSelectedModel($routeParams.modelid, appValue.models);
        });
    },
    getSelectedModel = function (paramId,models) {
        if (paramId && paramId.length && models && models.length) {
            for (var i = 0; i < models.length; i++) {
                if (paramId.toString() === models[i].id.toString()) {
                    $scope.isNew = false;
                    targetModel = models[i];
                    return $.extend({}, models[i]);
                }
            }
        }
        return {
            "title": '',
            "name": '',
            "mouth": 0,
            "eye": 0,
            "leg": 0,
            "id": Math.floor(Math.random() * 10000000)
        };
    };

    fetchModel();

    $scope.saveModel = function () {
        if ($scope.editModel.title.length > 0 &&
            $scope.editModel.name.length > 0 &&
            parseInt($scope.editModel.mouth) >= 0 &&
            parseInt($scope.editModel.eye) >= 0 &&
            parseInt($scope.editModel.leg) >= 0) {
            console.log('good');
            if ($scope.isNew) {
                webAPI.addModel($scope.editModel);
                $location.path(routeConstants.home.path);
            }
            else {
                for (var i = 0; i < appValue.models.length; i++) {
                    if ($scope.editModel.id == appValue.models[i].id) {
                        appValue.models[i] = $scope.editModel;
                        break;
                    }
                }
                $location.path(routeConstants.home.path);
            }
        }
        else {
            console.log('bad');
            alert('invalid inputs');
        }
    };
    $scope.cancelEdit = function () {
        $location.path(routeConstants.home.path);
    };
    $scope.numChange = function (value,name) {
        $scope.editModel.mouth = $filter('countNumber')($scope.editModel.mouth);
        $scope.editModel.eye = $filter('countNumber')($scope.editModel.eye);
        $scope.editModel.leg = $filter('countNumber')($scope.editModel.leg);
    }
}]);

(function ($) {
    
    angular.element(document).ready(function () {
        //app starts in #container
        angular.bootstrap($('#container'), ['countForgs']);
    });

}(jQuery));