'use strict';

/**
 * @ngdoc directive
 * @name timegrouperApp.directive:similaritymatrix
 * @description
 * # similaritymatrix
 */
angular.module('timegrouperApp')
    .directive('similaritymatrix', function() {
        return {
            restrict: 'EAC',
            scope: {
                similarity: "=",
                orderlist: "=",
                selectednames: '=',
                myorder: "=",
            },

            link: function postLink(scope, element, attrs) {

                // var trendData = parseData(scope.data);

                var margin = {
                        top: 80,
                        right: 0,
                        bottom: 10,
                        left: 80
                    },
                    width = 720,
                    height = 720;

                scope.$watch('similarity', function(newVals, oldVals) {

                    if (!newVals) {
                        return
                    }

                    if (newVals.length > 0 && scope.orderlist) {

                        return renderDataChange(scope.similarity, scope.orderlist);

                    } else {

                        return
                    }


                }, true);

                scope.$watch('myorder', function(newVals, oldVals) {

                    if (!newVals) {
                        return
                    }


                    return order(newVals);



                }, true);



                scope.$watch('orderList', function(newVals, oldVals) {

                    if (!newVals) {

                        return;
                    }

                    renderDataChange(scope.similarity, scope.orderlist);

                }, true);

                // scope.$watch(function() {
                //     return angular.element(window)[0].innerWidth;
                // }, function() {
                //     return parseData(scope.data);
                // });

                var x, z, color,orders,svg;

                function renderDataChange(simMat, orderList) {

                    x = d3.scale.ordinal().rangeBands([0, width]);
                    z = d3.scale.linear().domain([0, 4]).clamp(true);
                    color = d3.scale.linear().range(['red', 'green']);

                    var brush = d3.svg.brush()
                        .x(x)
                        .y(x)
                        .on('brushstart', brushstart)
                        .on("brush", brushed)
                        .on('brushend', brushend);


                    var max = d3.max(simMat, function(d) {
                        return d3.max(d, function(h) {
                            return h.z;
                        });
                    });

                    var min = d3.min(simMat, function(d) {
                        return d3.min(d, function(h) {
                            return h.z;
                        });
                    });

                    color.domain([min, max]);

                    svg = d3.select(element[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .style("margin-left", -margin.left + "px")
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var matrix = simMat,
                        nodes = orderList,
                        n = nodes.length;

                    // Precompute the orders.
                    orders = {
                        name: d3.range(n).sort(function(a, b) {
                            return d3.ascending(nodes[a].name, nodes[b].name);
                        }),
                        count: d3.range(n).sort(function(a, b) {
                            return nodes[b].count - nodes[a].count;
                        }),
                        group: d3.range(n).sort(function(a, b) {
                            return nodes[b].group - nodes[a].group;
                        }),
                        index: d3.range(n).sort(function(a, b) {
                            return nodes[a].index - nodes[b].index;
                        })
                    };

                    // The default sort order.
                    x.domain(orders.name);


                    svg.append("rect")
                        .attr("class", "background")
                        .attr("width", width)
                        .attr("height", height);

                    var row = svg.selectAll(".row")
                        .data(matrix)
                        .enter().append("g")
                        .attr("class", "row")
                        .attr("transform", function(d, i) {
                            return "translate(0," + x(i) + ")";
                        })
                        .each(row);

                    row.append("line")
                        .attr("x2", width);

                    row.append("text")
                        .attr("x", -6)
                        .attr("y", x.rangeBand())
                        .attr("dy", ".01em")
                        .classed('patchtext', true)
                        .attr("text-anchor", "end")
                        .text(function(d, i) {
                            return nodes[i].name;
                        });

                    var column = svg.selectAll(".column")
                        .data(matrix)
                        .enter().append("g")
                        .attr("class", "column")
                        .attr("transform", function(d, i) {
                            return "translate(" + x(i) + ")rotate(-90)";
                        });

                    column.append("line")
                        .attr("x1", -width);

                    column.append("text")
                        .attr("x", 6)
                        .attr("y", x.rangeBand())
                        .attr("dy", ".01em")
                        .classed('patchtext', true)
                        .attr("text-anchor", "start")
                        .text(function(d, i) {
                            return nodes[i].name;
                        });

                    function row(row) {
                        var cell = d3.select(this).selectAll(".cell")
                            // .data(row.filter(function(d) {
                            //     return d.z;
                            // }))
                            .data(row)
                            .enter().append("rect")
                            .attr("class", "cell")
                            .attr("x", function(d) {
                                return x(d.x);
                            })
                            .attr("width", x.rangeBand())
                            .attr("height", x.rangeBand())
                            // .style("fill-opacity", function(d) {
                            //     return z(d.z);
                            // })
                            .style("fill", function(d) {
                                return color(d.z);
                            })
                            .on("mouseover", mouseover)
                            .on("mouseout", mouseout);
                    }

                    function mouseover(p) {
                        d3.selectAll(".row text").classed("active", function(d, i) {
                            return i == p.y;
                        });
                        d3.selectAll(".column text").classed("active", function(d, i) {
                            return i == p.x;
                        });
                    }

                    function mouseout() {
                        d3.selectAll("text").classed("active", false);
                    }





                    var gBrush = svg.append('g')
                        .attr("class", 'brush')
                        .call(brush);

                    function brushed() {
                        var extent0 = brush.extent(),
                            extent1;

                        // console.log(extent0);
                        d3.selectAll('.cell').classed('selected', function(d) {
                            if (extent0[0][0] <= (x(d.x + 1)) && x(d.x) <= extent0[1][0]) {

                                if (extent0[0][1] <= (x(d.y + 1)) && x(d.y) <= extent0[1][1]) {

                                    return true;
                                }

                            }

                            return false;
                        });

                    }

                    function brushstart() {
                        d3.selectAll('.cell')
                            .classed("selecting", true);
                    }

                    function brushend() {
                        d3.selectAll('.cell').classed("selecting", !d3.event.target.empty());
                        var extent0 = brush.extent(),
                            extent1;
                        var selectedNames = [];

                        d3.selectAll('.cell').classed('selected', function(d) {
                            if (extent0[0][0] <= (x(d.x + 1)) && x(d.x) <= extent0[1][0]) {

                                if (extent0[0][1] <= (x(d.y + 1)) && x(d.y) <= extent0[1][1]) {

                                    if (selectedNames.indexOf(nodes[d.x].name) === -1) {
                                        selectedNames.push(nodes[d.x].name);
                                    }

                                    if (selectedNames.indexOf(nodes[d.y].name) === -1) {
                                        selectedNames.push(nodes[d.y].name);
                                    }

                                    return true;
                                }

                            }


                            return false;
                        });


                        scope.selectednames = selectedNames;
                        // console.log(selectedNames);
                        scope.$apply();

                    }

                }

                function order(value) {
                    x.domain(orders[value]);

                    var t = svg.transition().duration(2500);

                    t.selectAll(".row")
                        .delay(function(d, i) {
                            return x(i) * 4;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(0," + x(i) + ")";
                        })
                        .selectAll(".cell")
                        .delay(function(d) {
                            return x(d.x) * 4;
                        })
                        .attr("x", function(d) {
                            return x(d.x);
                        });

                    t.selectAll(".column")
                        .delay(function(d, i) {
                            return x(i) * 4;
                        })
                        .attr("transform", function(d, i) {
                            return "translate(" + x(i) + ")rotate(-90)";
                        });
                }

            }
        };
    });
