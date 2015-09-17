
var CountForgsIonic = angular.module('countForgs',['ionic']);

CountForgsIonic.config(['$stateProvider','$urlRouterProvider','$ionicConfigProvider',function($stateProvider,$urlRouterProvider,$ionicConfigProvider){
    $urlRouterProvider.otherwise('/list');
    $stateProvider
        .state('list',{
            url:'/list',
            templateUrl:'list.html',
            controller:'listController'
        })
        .state('detail',{
            url:'/detail/:itemid',
            templateUrl:'detail.html',
            controller:'detailController'
        })
        .state('edit',{
            url:'/edit/:itemid',
            templateUrl:'editOrNew.html',
            controller:'editOrNewController'
        })
        .state('add',{
            url:'/add',
            templateUrl:'editOrNew.html',
            controller:'editOrNewController'
        });
    $ionicConfigProvider.views.maxCache(0);
}]);

CountForgsIonic.run(['$rootScope','$ionicNavBarDelegate', '$ionicHistory', 'appValue', function($rootScope,$ionicNavBarDelegate,$ionicHistory,appValue){
    $rootScope.$on('showNavBackButton',function(e,isShow){
        $ionicNavBarDelegate.showBackButton(isShow);
    });
    if(!appValue || !appValue.models || appValue.models.length==0){
        appValue.models=JSON.parse(window.localStorage['CountForgsModels'] || '[]');
    }
}])

CountForgsIonic.value('appValue',{
    models:[
        //{ "title": "数青蛙", "name": "青蛙", "img":"media/tiger.jpg", "mouth": 1, "eye": 2, "leg": 4, 'isJump':true, "id":12314 },
        //{ "title": "数螃蟹", "name": "螃蟹", "img":"media/tiger.jpg", "mouth": 1, "eye": 2, "leg": 8, 'isJump':false, "id":424532 }
    ]
});

CountForgsIonic.factory('webAPI',['appValue',function(appValue){
    var saveOneItem=function(item){
        var isFound=false;
        var models=[];
        $.each(appValue.models,function(i,v){
            if(v.id==item.id){
                isFound=true;
                models.push(item)
            }else{
                models.push(v);
            }
        })
        appValue.models=models;
        updateLocalStorage()
        return isFound;
    },
    addOneItem=function(item){
        $.extend(item,{
            img:"media/tiger.jpg",
            id:Math.floor(Math.random() * 10000000)
        })
        appValue.models.push(item);
        updateLocalStorage();
    },
    deleteOneItem=function(item){
        var index=appValue.models.indexOf(item);
        appValue.models.splice(index,1);
    },
    moveOneItem=function(item,fromIndex,toIndex){
        appValue.models.splice(fromIndex,1)
        appValue.models.splice(toIndex,0,item);
    },
    updateLocalStorage=function(){
        window.localStorage['CountForgsModels'] = JSON.stringify(appValue.models);
    };

    return {
        saveOneItem:saveOneItem,
        addOneItem:addOneItem,
        deleteOneItem:deleteOneItem,
        moveOneItem:moveOneItem
    }
}])

CountForgsIonic.controller('listController',['$scope','$state', 'appValue','webAPI', '$ionicListDelegate', function($scope,$state,appValue,webAPI,$ionicListDelegate){
    console.log('list');
    $scope.pageName="数青蛙";
    $scope.lists=appValue.models || [];
    $scope.isShowReorder=false;
    $scope.isShowDelete=false;
    $scope.goToDetailPage=function(itemid){
        $state.go('detail',{itemid:itemid})
    };
    $scope.showDelete=function(){
        $scope.isShowDelete=!$scope.isShowDelete;
        $scope.isShowReorder=false;
    };
    $scope.showReorder=function(){
        $scope.isShowReorder=!$scope.isShowReorder;
        $scope.isShowDelete=false;
    };
    $scope.goToAddPage=function(){
        $state.go('add');
    };
    $scope.delete=function(item){
        webAPI.deleteOneItem(item);
        $ionicListDelegate.closeOptionButtons();
    };
    $scope.move=function(item,from,to){
        webAPI.moveOneItem(item,from,to);
        console.log(appValue.models)
    }
}]);

CountForgsIonic.controller('detailController',['$scope','$state','appValue',function($scope,$state,appValue){
    console.log('detail')
    $scope.$emit('showNavBackButton',true)
    $scope.pageName="detail";
    $scope.item=null;
    $scope.count=1;
    var qsid=$state.params ? $state.params.itemid : null;
    $.each(appValue.models,function(i,v){
        if(v.id==qsid){
            $scope.item=v;
            $scope.pageName=v.title;
            return false;
        }
    });

    $scope.updateCount=function(isMinus){
        if(isMinus){
            if($scope.count>1)
                $scope.count-=1;
            else
                $scope.count=1;
        }else{
            $scope.count+=1;
        }
    };
    $scope.getJumpStr=function(count,one){
        var str=[];
        for(var i=0;i<count;i++){
            str.push(one)
        }
        return str.join(',')
    };
    $scope.goToEditPage=function(){
        $state.go('edit',{itemid:$scope.item.id})
    }

}]);

CountForgsIonic.controller('editOrNewController',['$scope','$state', 'appValue', 'webAPI', function($scope,$state,appValue,webAPI){
    console.log('edit')
    $scope.$emit('showNavBackButton',false)
    $scope.isEdit=$state.is('edit');
    $scope.item={
        mouth:1,
        eye:2,
        leg:4,
        isJump:true
    };
    var itemid=null;
    if($scope.isEdit){
        itemid=$state.params.itemid;
        if(itemid){
            $.each(appValue.models,function(i,v){
                if(v.id==itemid){
                    $scope.item=angular.copy(v);
                    return false;
                }
            })
        }
        if(!$scope.item){
            alert('not found!')
        }
    }
    $scope.save=function(){
        if($scope.isEdit){
            webAPI.saveOneItem($scope.item);
        }else{
            webAPI.addOneItem($scope.item);
        }
        $state.go('list');
    }
    $scope.toToHomePage=function(){
        $state.go('list');
    }
    $scope.onNameChange=function(){
        $scope.item.title='数'+$scope.item.name;
    }
}]);


(function($){
    angular.element(document).ready(function(){
        angular.bootstrap($('#container'),['countForgs'])
    })
})(jQuery)