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



                function renderDataChange(simMat, orderList) {

                    var x = d3.scale.ordinal().rangeBands([0, width]),
                        z = d3.scale.linear().domain([0, 4]).clamp(true),
                        c = d3.scale.category10().domain(d3.range(10));

                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .style("margin-left", -margin.left + "px")
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                    var matrix = simMat,
                        nodes = orderList,
                        n = nodes.length;

                    // Precompute the orders.
                    var orders = {
                        name: d3.range(n).sort(function(a, b) {
                            return d3.ascending(nodes[a].name, nodes[b].name);
                        }),
                        count: d3.range(n).sort(function(a, b) {
                            return nodes[b].count - nodes[a].count;
                        }),
                        group: d3.range(n).sort(function(a, b) {
                            return nodes[b].group - nodes[a].group;
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
                        .attr("y", x.rangeBand() / 2)
                        .attr("dy", ".32em")
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
                        .attr("y", x.rangeBand() / 2)
                        .attr("dy", ".32em")
                        .attr("text-anchor", "start")
                        .text(function(d, i) {
                            return nodes[i].name;
                        });

                    function row(row) {
                        var cell = d3.select(this).selectAll(".cell")
                            .data(row.filter(function(d) {
                                return d.z;
                            }))
                            .enter().append("rect")
                            .attr("class", "cell")
                            .attr("x", function(d) {
                                return x(d.x);
                            })
                            .attr("width", x.rangeBand())
                            .attr("height", x.rangeBand())
                            .style("fill-opacity", function(d) {
                                return z(d.z);
                            })
                            .style("fill", function(d) {
                                return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
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

                    d3.select("#order").on("change", function() {
                        clearTimeout(timeout);
                        order(this.value);
                    });

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

                    var timeout = setTimeout(function() {
                        order("group");
                        d3.select("#order").property("selectedIndex", 2).node().focus();
                    }, 5000);


                }



            }
        };
    });



function simMatChart() {

    var margin = {
            top: 50,
            right: 30,
            bottom: 50,
            left: 50
        },
        width = 720,
        height = 720;

    var x = d3.scale.ordinal().rangeBands([0, width]),
        z = d3.scale.linear().domain([0, 4]).clamp(true),
        c = d3.scale.category10().domain(d3.range(10));



    function chart(div) {


        div.each(function() {
            var div = d3.select(this);

            div.selectAll('*').remove();

            var svg = div.select("g");

            // Create the skeletal chart.
            if (svg.empty()) {

                svg = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .style("margin-left", -margin.left + "px")
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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


            }

        });

        function row(row) {
            var cell = d3.select(this).selectAll(".cell")
                .data(row.filter(function(d) {
                    return d.z;
                }))
                .enter().append("rect")
                .attr("class", "cell")
                .attr("x", function(d) {
                    return x(d.x);
                })
                .attr("width", x.rangeBand())
                .attr("height", x.rangeBand())
                .style("fill-opacity", function(d) {
                    return z(d.z);
                })
                .style("fill", function(d) {
                    return nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;
                })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
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


    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    return chart;


};
