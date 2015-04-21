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

        $scope.loading = 1;
        $scope.maxLoading = 100;


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

        var parsedData = []; 
        $scope.orders = ['name','index','count','group'];

        var loadTimeSeriesData = function() {

            $scope.isLoading = true;

            d3.csv("data/hazard_alg.csv", function(data) {
                //do stuff with data
                // console.log(data);

                var tempObject = {
                    "key": "start",
                    'values': []
                };

                $scope.maxLoading = data.length;

                data.forEach(function(d,i) {

                    if (tempObject.key != d.a_id) {

                        parsedData.push(angular.copy(tempObject));

                        tempObject = {
                            "key": "start",
                            'values': []
                        };

                        tempObject.key = d.a_id;
                        // $scope.loading = i;
                        // $scope.$apply();

                    }

                    // if (i%100000 === 0) {


                    // $scope.loading = Math.floor(i/100000);
                    // $scope.$apply();
                    // console.log($scope.loading + '/' + $scope.maxLoading);
                    // }



                    tempObject.values.push([+d.a_date, +d.a_hazard]);


                })

                $scope.isLoading = false;
                $scope.$apply();

            }).on("progress", function(event) {
                //update progress bar
                if (d3.event.lengthComputable) {
                    var percentComplete = Math.round(d3.event.loaded * 100 / d3.event.total);
                    console.log(percentComplete);
                }
            });


        };


        $scope.exampleData = [];

        $scope.$watch(function() {
            return $scope.selectedNames;
        }, function(newVals, oldVals) {

            console.log(parsedData);
            var temp = [];

            for (var i =0; i<parsedData.length; i++) {
                if ($scope.selectedNames.indexOf(parsedData[i].key) !== -1) {
                    temp.push(parsedData[i]);
                } 
            }

            $scope.exampleData = temp;

        }, true);

        loadData();
        loadTimeSeriesData();


    });
