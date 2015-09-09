/// <reference path="lib/angular.min.js" />

(function ($) {

    var appTest = angular.module('MyTutorialApp', []);

    appTest.controller('MainController', function ($scope) {
        $scope.includeTemplateURL='overlay.html';
        $scope.understand = "i now understand how the scope works..";
        //$scope.inputValue = "";           //can add or delete

        //$scope.selectedPeople = 0;        //can add or delete
        //$scope.selectedGenre = null;      //can add or delete
        $scope.people = [
            {
                id: 0,
                name: 'Doe',
                music: ['Rock', 'Metal', 'Dubstep', 'Electro'],
                live:true
            },
            {
                id: 1,
                name: 'Chris',
                music: ['Indie', 'Drumstep', 'Dubstep', 'Electro'],
                live:true
            },
            {
                id: 2,
                name: 'Harry',
                music: ['Rock', 'Metal', 'Thrash Metal', 'Heavy Metal'],
                live:false
            },
            {
                id: 3,
                name: 'Allyce',
                music: ['Pop', 'RnB', 'Hip Hop'],
                live:true
            }
        ];
        $scope.newPerson = null;
        $scope.addNew = function () {
            if ($scope.newPerson != null && $scope.newPerson != '') {
                $scope.people.push({
                    id: $scope.people.length,
                    name: $scope.newPerson,
                    live: true,
                    music:[]
                });
            }
            $scope.newPerson = null;
        }

    });

}(jQuery));
