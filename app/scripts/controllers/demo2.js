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

        $scope.simMetric = $scope.simMetrics[5];

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

        $scope.algorithm = $scope.algorithms[1];

        $scope.appNames = {
            chrome: true,
            firefox: true,
            acroread: true,
            thunderbird: true,
            flashplayer: true,
            quicktime: true,
            msword: true,
            opera: true,
            safari: true,
            wireshark: true
        };


        $scope.updateMechanisms = [{
            label: 'Manual Update',
            selected: true,
            value: 'MU'
        }, {
            label: 'Prompted Download',
            selected: true,
            value: 'PD'
        }, {
            label: 'Prompted Install',
            selected: true,
            value: 'PI'
        }, {
            label: 'Silent Update',
            selected: true,
            value: 'SU'
        }];

        $scope.updateMechanismsForTimeSeries = [{
            label: 'Manual Update',
            selected: true,
            value: 'MU'
        }, {
            label: 'Prompted Download',
            selected: true,
            value: 'PD'
        }, {
            label: 'Prompted Install',
            selected: true,
            value: 'PI'
        }, {
            label: 'Silent Update',
            selected: true,
            value: 'SU'
        }];

        $scope.exploitableOnly = false;


        $scope.exploitableOnlyForTimeSeries = false;

        var clearCharts = function() {

            $scope.summaryMatrix = [];
            $scope.summaryOrderList = [];
        }


        $scope.loadData = function() {

            clearCharts();

            var url = 'https://lit-hollows-6344.herokuapp.com/getSimMatrix';

            var appNames = [];

            for (var key in $scope.appNames) {

                if ($scope.appNames.hasOwnProperty(key)) {

                    if ($scope.appNames[key]) {
                        appNames.push(key);
                    }

                }
            }

            var updateMechs = $scope.updateMechanisms.filter(function(d) {
                return d.selected;
            });

            updateMechs = updateMechs.map(function(d) {
                return d.value;
            });

            // console.log(updateMechs);

            var argument = {
                simMetric: $scope.simMetric.name,
                cAlgorithm: $scope.algorithm.name,
                appName: appNames,
                updateMech: updateMechs
            };

            if ($scope.exploitableOnly) {
                argument.exploitable = 'true';
            }


            $http.post(url, argument)
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

                    } else if (data.length === 2) {

                        summaryMatLabel = data[0];
                        summaryMat = data[1];

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

                        $scope.simMatrix = data;

                        var namesList = summaryMatLabel.map(function(d, i) {
                            return {
                                name: d.name,
                                count: 0,
                                group: 1,
                                index: i,
                                patches: d.patches
                            };
                        });

                        $scope.orderList = namesList;

                        $scope.noSummary = true;


                    }
                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                });

        };


        // loadData();
        var parsedData = [];
        $scope.orders = ['name', 'index', 'count', 'group'];

        var patchData;

        var updatePatches = function() {

            var url = 'https://lit-hollows-6344.herokuapp.com/getPatches';

            console.log($scope.selectedNames);

            $http.post(url, {
                    patchId: $scope.selectedNames
                })
                .success(function(data, status, headers, config) {
                    // d3.json("data/all.json", function(data) {

                    data = JSON.parse(data);

                    console.log(data);

                    patchData = [];

                    for (var i = 0; i < data.length; i++) {

                        for (var k in data[i]) {

                            if (data[i].hasOwnProperty(k)) {

                                var timeSeries = data[i][k].map(function(d, i) {
                                    return {
                                        x: i,
                                        y: d
                                    };
                                });

                                patchData.push({
                                    key: k,
                                    values: timeSeries
                                });
                            }
                        }
                    }

                    $scope.lineData = patchData;
                    $scope.showTimeSeries = true;

                    console.log(patchData);




                })
                .error(function(data, status, headers, config) {
                    console.log(status);
                    alert("Server API error");
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

            if (!newVals) {

                return;
            }

            updatePatches();



        }, true);

        $scope.$watch(function() {
            return $scope.updateMechanismsForTimeSeries;
        }, function(newVals, oldVals) {

            if (!$scope.selectedNames) {
                return;
            }

            filterPatches();

        }, true);

        $scope.$watch(function() {
            return $scope.exploitableOnlyForTimeSeries;
        }, function(newVals, oldVals) {

            if (!$scope.selectedNames) {
                return;
            }

            filterPatches();

        }, true);

        var filterPatches = function() {

            var filteredNames = $scope.selectedNames.filter(function(d) {
                var patch = originalLabel.filter(function(p) {
                    return p.name === d;
                })[0];

                var updateMech = $scope.updateMechanismsForTimeSeries.filter(function(d) {
                    return d.value === patch.updateMech;
                })[0];

                if ($scope.exploitableOnlyForTimeSeries && patch.exploitable === false) {
                    return false;
                }

                if (updateMech.selected) {
                    return true;
                } else {
                    return false;
                }
            });

            $scope.lineData = patchData.filter(function(d) {
                return filteredNames.indexOf(d.key) !== -1;
            });

        };



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

        $scope.selectAllAppNames = function () {
            $scope.appNames = {
                chrome: true,
                firefox: true,
                acroread: true,
                thunderbird: true,
                flashplayer: true,
                quicktime: true,
                msword: true,
                opera: true,
                safari: true,
                wireshark: true
            };
        };

        $scope.deselectAllAppNames = function() {
            $scope.appNames = {
                chrome: false,
                firefox: false,
                acroread: false,
                thunderbird: false,
                flashplayer: false,
                quicktime: false,
                msword: false,
                opera: false,
                safari: false,
                wireshark: false
            };
        };

        $scope.selectAllUpdateMechanisms = function() {

            $scope.updateMechanisms.forEach(function(d) {
                d.selected = true;
            });
        };

        $scope.deselectAllUpdateMechanisms = function() {

            $scope.updateMechanisms.forEach(function(d) {
                d.selected = false;
            });
        };

         $scope.selectAllUpdateMechanismsTimeSeries = function() {

            $scope.updateMechanismsForTimeSeries.forEach(function(d) {
                d.selected = true;
            });
        };

        $scope.deselectAllUpdateMechanismsTimeSeries = function() {

            $scope.updateMechanismsForTimeSeries.forEach(function(d) {
                d.selected = false;
            });
        };


    });
