'use strict';

/**
 * @ngdoc function
 * @name timegrouperApp.controller:Demo2Ctrl
 * @description
 * # Demo2Ctrl
 * Controller of the timegrouperApp
 */
angular.module('timegrouperApp')
    .controller('Demo2Ctrl', function($scope, $http) {

        var summaryMatLabel, summaryMat, originalLabel, originalMat;
        $scope.summaryRange = [];
        $scope.simMetrics = [{
            name: 'euclidean',
            detail: 'euclidean distance based on input data'
        }, {
            name: 'pca_euc',
            detail: '#extract feature vector from input based on PCA, then use Euclidean distance PCA: principle component analysis'
        }, {
            name: 'nmf_euc',
            detail: '#extract feature based on NMF, then use Euclidean distance, NMF: non-negative matrix factorization'
        }, {
            name: 'ica_euc',
            detail: '#extract feature based on ICA, then use Euclidean distance, ICA: independent component analysis'
        }, {
            name: 'cosine',
            detail: '#cosine distance based on input data'
        }, {
            name: 'pca_cos',
            detail: '#extract feature based on PCA, then use cosine distance'
        }, {
            name: 'nmf_cos',
            detail: '#extract feature based on NMF, then use cosine distance'
        }, {
            name: 'ica_cos',
            detail: '#extract feature based on ICA, then use cosine distance'
        }];

        $scope.simMetric = 'nmf_euc';

        $scope.algorithms = [{
            name: 'kmeans',
            detail: '#kmeans clustering'
        }, {
            name: 'ap',
            detail: '#affinity propagation'
        }, {
            name: 'meanshift',
            detail: '#means shift'
        }, {
            name: 'spectral',
            detail: '#spectral clustering'
        }, {
            name: 'hc',
            detail: '#hierarchical clustering'
        }, {
            name: 'dbscan',
            detail: '# DBSCAN'
        }];

        $scope.algorithm = 'kmeans';

        $scope.loadData = function() {

            var url = 'https://lit-hollows-6344.herokuapp.com/getSimMatrix';


            $http.post(url, {
                    simMetric: $scope.simMetric.name,
                    cAlgorithm: $scope.algorithm.name,
                    appName: ['chrome', 'firefox', 'acroread', 'thunderbird', 'flashplayer', 'quicktime', 'msword', 'opera', 'safari', 'wireshark']
                })
                .success(function(data, status, headers, config) {
                    // d3.json("data/all.json", function(data) {

                    console.log(data);

                    if (data.length === 4) {

                        summaryMatLabel = data[0];
                        summaryMat = data[1];
                        originalLabel = data[2];
                        originalMat = data[3];

                        summaryMatLabel.splice(summaryMat.length, summaryMatLabel.length - summaryMat.length);



                        var data = summaryMat.map(function(row, i) {
                            return row.map(function(value, j) {
                                return {
                                    x: j,
                                    y: i,
                                    z: +value
                                };
                            });
                        });

                        $scope.summaryMatrix = data;

                        var namesList = summaryMatLabel.map(function(d, i) {
                            return {
                                name: d.name,
                                count: 0,
                                group: 1,
                                index: i,
                                patches: d.patches
                            };
                        });

                        $scope.summaryOrderList = namesList;

                        // $scope.$apply();


                    }
                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                });

        };


        // loadData();
        var parsedData = [];
        $scope.orders = ['name', 'index', 'count', 'group'];

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

                data.forEach(function(d, i) {

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



                    tempObject.values.push({
                        x: +d.a_date,
                        y: +d.a_hazard
                    });


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

        $scope.lineOptions = {
            chart: {
                type: 'lineWithFocusChart',
                height: 450,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Date since deployed',
                    tickFormat: function(d) {
                        return d3.format(',f')(d);
                    }
                },
                x2Axis: {
                    tickFormat: function(d) {
                        return d3.format(',f')(d);
                    }
                },
                yAxis: {
                    axisLabel: 'Patch Rate',
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    },
                    rotateYLabel: false
                },
                y2Axis: {
                    tickFormat: function(d) {
                        return d3.format(',.2f')(d);
                    }
                }

            }
        };


        $scope.lineData = [];

        $scope.$watch(function() {
            return $scope.selectedNames;
        }, function(newVals, oldVals) {

            updatePatches();



        }, true);

        function updatePatches() {

            
            var temp = [];

            for (var i = 0; i < parsedData.length; i++) {
                if ($scope.selectedNames.indexOf(parsedData[i].key) !== -1) {
                    temp.push(parsedData[i]);
                }
            }


            console.log(temp);

            $scope.lineData = temp;
        }



        $scope.$watch(function() {
            return $scope.selectedGroups;
        }, function(newVals, oldVals) {

            var temp = [];

            var selectedPatches = [];

            if (!newVals || newVals.length === 0) {
                return;
            }

            for (var i = 0; i < newVals.length; i++) {
                var j = parseInt(newVals[i].slice(5));
                var patches = summaryMatLabel[j].patches;
                for (var k = 0; k < patches.length; k++) {

                    if (selectedPatches.indexOf(patches[k]) === -1) {

                        selectedPatches.push(patches[k]);

                    }
                }

            }



            console.log(selectedPatches);

            function isSelectedPatches(d, i) {
                if (selectedPatches.indexOf(originalLabel[i].name) === -1) {
                    return false;
                } else {
                    return true;
                }
            }

            var filteredMat = originalMat.filter(isSelectedPatches);

            var filteredMat = filteredMat.map(function(d) {
                return d.filter(isSelectedPatches);
            });

            console.log(filteredMat);

            var data = filteredMat.map(function(row, i) {
                return row.map(function(value, j) {
                    return {
                        x: j,
                        y: i,
                        z: +value
                    };
                });
            });

            $scope.simMatrix = data;

            var namesList = selectedPatches.map(function(d, i) {
                return {
                    name: d,
                    count: 0,
                    group: 1,
                    index: i
                };
            });

            $scope.orderList = namesList;

            // $scope.$apply();



        }, true);

        // $scope.$watch(function() {
        //     return $scope.summaryRange;
        // }, function(newVals, oldVals) {

        //     var temp = [];

        //     var selectedPatches = [];

        //     if (!newVals || newVals.length === 0) {
        //         return;
        //     }

        //     for (var i = 0; i < newVals.length; i++) {
        //         var j = parseInt(newVals[i].slice(5));
        //         var patches = summaryMatLabel[j].patches;
        //         for (var k = 0; k < patches.length; k++) {
        //             selectedPatches.push(patches[k]);
        //         }



        //     }

        //     console.log(selectedPatches);



        // }, true);

        // loadData();
        loadTimeSeriesData();



    });
