'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:Demo2Ctrl
 * @description
 * # Demo2Ctrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
  .controller('Demo2Ctrl', function ($scope,$http) {

        var loadData = function() {

            var url = 'https://lit-hollows-6344.herokuapp.com/getSimMatrix';

            $http.post(url, {simMetric:'nmf_euc', cAlgorithm:'kmeans', appName:'chrome'}).success( function(data, status, headers, config) {
                console.log(data);
            }).error(function(data,status,headers, config) {
                console.log(status);
            });





            // d3.text('data/SimMatLarge.csv', function(text) {
            //     var data = d3.csv.parseRows(text).map(function(row, i) {
            //         return row.map(function(value, j) {
            //             return {
            //                 x: j,
            //                 y: i,
            //                 z: +value
            //             };
            //         });
            //     });

            //     $scope.simMatrix = data;

            //     d3.text('data/PatchNameLarge.csv', function(text) {
            //         var names = d3.csv.parseRows(text);

            //         var namesList = names.map(function(d, i) {
            //             return {
            //                 name: d[0],
            //                 count: 0,
            //                 group: 1,
            //                 index: i
            //             };
            //         });

            //         $scope.orderList = namesList;

            //         $scope.$apply();
            //     });
            // });

        };


        loadData();


    });
