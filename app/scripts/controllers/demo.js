'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:DemoCtrl
 * @description
 * # DemoCtrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
    .controller('DemoCtrl', function($scope) {


        var loadData = function() {

            d3.text('data/SimMat.csv', function(text) {
                var data = d3.csv.parseRows(text).map(function(row, i) {
                    return row.map(function(value, j) {
                        return {
                            x: j,
                            y: i,
                            z: +value
                        };
                    });
                });

                $scope.simMatrix = data;

                d3.text('data/PatchName.csv', function(text) {
                    var names = d3.csv.parseRows(text);

                    var namesList = names.map(function(d, i) {
                        return {
                            name: d[0],
                            count: 0,
                            group: 1,
                            index: i
                        };
                    });

                    $scope.orderList = namesList;

                    $scope.$apply();
                });
            });

        };


        loadData();


    });
