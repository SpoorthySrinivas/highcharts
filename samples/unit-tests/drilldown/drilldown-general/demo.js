QUnit.test('Drilldown methods', function (assert) {
    // Create the chart
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
            animation: false,
            width: 600
        },
        title: {
            text: 'Basic drilldown'
        },
        xAxis: {
            type: 'category'
        },

        series: [
            {
                name: 'Things',
                colorByPoint: true,
                data: [
                    {
                        name: 'Animals',
                        y: 5,
                        drilldown: 'animals'
                    },
                    {
                        name: 'Fruits',
                        y: 2,
                        drilldown: 'fruits'
                    },
                    {
                        name: 'Cars',
                        y: 4,
                        drilldown: 'cars'
                    }
                ]
            }
        ],
        drilldown: {
            animation: false,
            series: [
                {
                    id: 'animals',
                    data: [
                        ['The quick brown fox jumps over the lazy dog', 4],
                        ['Dogs', 2],
                        ['Cows', 1],
                        ['Sheep', 2],
                        ['Pigs', 1]
                    ]
                },
                {
                    id: 'fruits',
                    data: [
                        ['Apples', 4],
                        ['Oranges', 2]
                    ]
                },
                {
                    id: 'cars',
                    data: [
                        ['Toyota', 4],
                        ['Opel', 2],
                        ['Volkswagen', 2]
                    ]
                }
            ]
        }
    });

    // Expect no JS error (#7602)
    chart.drillUp();

    assert.deepEqual(
        chart.xAxis[0].names,
        ['Animals', 'Fruits', 'Cars'],
        'Initial categories'
    );

    chart.series[0].select(true);

    assert.strictEqual(
        chart.series[0].selected,
        true,
        'First series should be selected'
    );

    chart.series[0].points[0].doDrilldown();

    assert.deepEqual(
        chart.xAxis[0].names,
        [
            'The quick brown fox jumps over the lazy dog',
            'Dogs',
            'Cows',
            'Sheep',
            'Pigs'
        ],
        'xAxis.names after first drilldown'
    );
    assert.deepEqual(
        chart.xAxis[0].tickPositions.map(function (pos) {
            return chart.xAxis[0].ticks[pos].label.element.textContent.replace(
                /[ \u200B]/g,
                ''
            );
        }),
        [
            'Thequickbrownfoxjumpsoverthelazydog',
            'Dogs',
            'Cows',
            'Sheep',
            'Pigs'
        ],
        'xAxis.names after first drilldown'
    );
    assert.ok(
        chart.xAxis[0].ticks[0].label.element.getBBox().width < 120,
        'Long label should be wrapped (#8234)'
    );

    chart.drillUp();

    assert.deepEqual(
        chart.xAxis[0].names,
        ['Animals', 'Fruits', 'Cars'],
        'Initial categories again'
    );

    assert.strictEqual(
        chart.series[0].selected,
        true,
        'First series selected state should be preserved'
    );

    chart.drillUp(); // Just checking #7602

    // Now update
    chart.update({
        series: [
            {
                data: [
                    {
                        name: 'Animals2',
                        y: 6,
                        drilldown: 'animals2'
                    },
                    {
                        name: 'Fruits2',
                        y: 3,
                        drilldown: 'fruits2'
                    },
                    {
                        name: 'Cars2',
                        y: 5,
                        drilldown: 'cars2'
                    }
                ]
            }
        ],
        drilldown: {
            series: [
                {
                    id: 'animals2',
                    data: [
                        ['Cats2', 6],
                        ['Dogs2', 7],
                        ['Cows2', 2],
                        ['Sheep2', 3],
                        ['Pigs2', 2]
                    ]
                },
                {
                    id: 'fruits2',
                    data: [
                        ['Apples2', 5],
                        ['Oranges2', 3]
                    ]
                },
                {
                    id: 'cars2',
                    data: [
                        ['Toyota2', 5],
                        ['Opel2', 3],
                        ['Volkswagen2', 3]
                    ]
                }
            ]
        }
    });
    assert.deepEqual(
        chart.xAxis[0].names,
        ['Animals2', 'Fruits2', 'Cars2'],
        'Updated top level categories'
    );

    chart.series[0].points[0].doDrilldown();

    assert.deepEqual(
        chart.xAxis[0].names,
        ['Cats2', 'Dogs2', 'Cows2', 'Sheep2', 'Pigs2'],
        'First drilldown after update (#7600)'
    );

    chart.drillUp();
    chart.update({
        series: [{
            cropThreshold: 1
        }],
        xAxis: {
            min: 2
        }
    });
    assert.strictEqual(
        chart.xAxis[0].ddPoints[2][0].index,
        2,
        '#15771: Point should be at correct index in ddPoints'
    );

    chart.series[0].update({
        point: {
            events: {
                mouseOver() {
                    this.series.chart.addSeriesAsDrilldown(this, {
                        data: [1, 2, 3, 4]
                    });
                }
            }
        },
        data: [2, 5]
    });
    chart.series[0].points[0].onMouseOver();
    assert.ok(
        true,
        `Adding drill down series through mouseover should not
        generate errors in console, #16820.`
    );
});

QUnit.test('Chart type update after drilldown', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        series: [
            {
                data: [
                    {
                        y: 62,
                        drilldown: 'Chrome'
                    },
                    {
                        y: 10,
                        drilldown: 'Firefox'
                    },
                    {
                        y: 30,
                        drilldown: 'IE'
                    }
                ]
            }
        ],
        drilldown: {
            series: [
                {
                    id: 'Chrome',
                    data: [4, 3, 5]
                },
                {
                    id: 'Firefox',
                    data: [1, 1, 5]
                },
                {
                    id: 'IE',
                    data: [18, 1, 5]
                }
            ]
        }
    });

    chart.series[0].points[0].doDrilldown();
    chart.drillUp();

    chart.update({
        chart: {
            type: 'scatter'
        }
    });

    assert.strictEqual(
        chart.series[0].options.lineWidth,
        0,
        'Scatter line width should be 0 (#10597).'
    );
});

QUnit.test('activeDataLabelStyle', function (assert) {
    function getDataLabelFill(point) {
        return point.dataLabel.element.childNodes[0].style.fill;
    }
    var chart = Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        inside: true
                    }
                }
            },
            series: [
                {
                    data: [
                        {
                            drilldown: 'fruits',
                            y: 20,
                            color: '#000000'
                        }
                    ]
                }
            ],
            drilldown: {
                activeDataLabelStyle: {
                    color: 'contrast'
                },
                series: [
                    {
                        id: 'fruits',
                        data: [2]
                    }
                ]
            }
        }),
        series = chart.series[0],
        point = series.points[0];

    assert.ok(
        getDataLabelFill(point) === 'rgb(255, 255, 255)' ||
            getDataLabelFill(point) === '#ffffff',
        'activeDataLabelStyle.color contrast to black'
    );
    point.update({
        color: '#FFFFFF'
    });
    assert.ok(
        getDataLabelFill(point),
        getDataLabelFill(point) === 'rgb(0, 0, 0)' ||
            getDataLabelFill(point) === '#000000',
        'activeDataLabelStyle.color contrast to white'
    );

    chart.destroy();
    chart = Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        plotOptions: {
            series: {
                dataLabels: {
                    enabled: true,
                    inside: true
                }
            }
        },
        series: [
            {
                data: [
                    {
                        drilldown: 'fruits',
                        y: 20
                    }
                ]
            }
        ],
        drilldown: {
            activeDataLabelStyle: {
                color: '#FFFF00'
            },
            series: [
                {
                    id: 'fruits',
                    data: [2]
                }
            ]
        }
    });
    series = chart.series[0];
    point = series.points[0];
    assert.ok(
        getDataLabelFill(point) === 'rgb(255, 255, 0)' ||
            getDataLabelFill(point) === '#ffff00',
        'activeDataLabelStyle.color: "#FFFF00"'
    );
});

// Highcharts 3.0.10, Issue #2786
// Unable to drill up to top when multiple drilldowns
QUnit.test('Drill up exception (#2786)', function (assert) {
    var chart = Highcharts.chart('container', {
            chart: {
                height: 300,
                type: 'column',
                animation: false
            },
            title: {
                text: 'Drill up failed on top level'
            },
            xAxis: {
                categories: true
            },
            drilldown: {
                animation: false,
                series: [
                    {
                        id: 'fruits',
                        name: 'Fruits',
                        data: [
                            ['Apples', 4],
                            ['Pears', 6],
                            ['Oranges', 2],
                            ['Grapes', 8]
                        ]
                    },
                    {
                        id: 'cars',
                        name: 'Cars',
                        data: [
                            {
                                name: 'Toyota',
                                y: 4,
                                drilldown: 'toyota'
                            },
                            ['Volkswagen', 3],
                            ['Opel', 5]
                        ]
                    },
                    {
                        id: 'toyota',
                        name: 'Toyota',
                        data: [
                            ['RAV4', 3],
                            ['Corolla', 1],
                            ['Carina', 4],
                            ['Land Cruiser', 5]
                        ]
                    }
                ]
            },
            series: [
                {
                    name: 'Overview',
                    colorByPoint: true,
                    id: 'top',
                    data: [
                        {
                            name: 'Fruits',
                            y: 10,
                            drilldown: 'fruits'
                        },
                        {
                            name: 'Cars',
                            y: 12,
                            drilldown: 'cars'
                        },
                        {
                            name: 'Countries',
                            y: 8
                        }
                    ]
                }
            ]
        }),
        catchedException;

    assert.strictEqual(
        chart.series[0].points[1].name,
        'Cars',
        'Second point should be `Cars`.'
    );

    chart.series[0].points[1].doDrilldown();

    assert.strictEqual(
        chart.series[0].points[0].name,
        'Toyota',
        'First point should be `Toyota`.'
    );

    chart.series[0].points[0].doDrilldown();

    assert.strictEqual(
        chart.series[0].points[0].name,
        'RAV4',
        'First point should be `RAV4`.'
    );

    chart.drillUp();

    assert.strictEqual(
        chart.series[0].points[0].name,
        'Toyota',
        'First point should be `Toyota`.'
    );

    try {
        chart.drillUp();
    } catch (exception) {
        catchedException = exception;
    }

    assert.ok(
        !catchedException,
        'There should be not exception during drill up.'
    );

    assert.strictEqual(
        chart.series[0].points[1].name,
        'Cars',
        'Second point should be `Cars`.'
    );
});

QUnit.test('Named categories (#6704)', function (assert) {
    var chart = Highcharts.chart('container', {
        title: null,
        chart: {
            type: 'column'
        },
        credits: false,
        legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        },
        xAxis: {
            labels: {
                rotation: -90
            },
            type: 'category'
        },
        yAxis: {
            min: 0,
            title: {
                text: ''
            }
        },
        plotOptions: {
            series: {
                animation: false,
                showInLegend: true,
                dataLabels: {
                    enabled: false,
                    color: 'grey',
                    style: {
                        'text-shadow': '0 0 2px black'
                    }
                },
                stacking: null
            }
        },
        series: [
            {
                name: 'Products 2015',
                cropThreshold: 500,
                type: 'column',
                data: [
                    {
                        name: 'Product A',
                        y: 5056748,
                        drilldown: '0|Product A'
                    },
                    {
                        name: 'Product B',
                        y: 1976470,
                        drilldown: '0|Product B'
                    },
                    {
                        name: 'Product C',
                        y: 1247587,
                        drilldown: '0|Product C'
                    },
                    {
                        name: 'Product D',
                        y: 1169350,
                        drilldown: '0|Product D'
                    },
                    {
                        name: 'Product E',
                        y: 1125607,
                        drilldown: '0|Product E'
                    },
                    {
                        name: 'Product G',
                        y: 1012095,
                        drilldown: '0|Product G'
                    },
                    {
                        name: 'Product N',
                        y: 661557,
                        drilldown: '0|Product N'
                    },
                    {
                        name: 'Product O',
                        y: 532734,
                        drilldown: '0|Product O'
                    },
                    {
                        name: 'Product Q',
                        y: 487075,
                        drilldown: '0|Product Q'
                    },
                    {
                        name: 'Product F',
                        y: 433019,
                        drilldown: '0|Product F'
                    },
                    {
                        name: 'Product R',
                        y: 287757,
                        drilldown: '0|Product R'
                    },
                    {
                        name: 'Product H',
                        y: 282369,
                        drilldown: '0|Product H'
                    },
                    {
                        name: 'Product I',
                        y: 250762,
                        drilldown: '0|Product I'
                    },
                    {
                        name: 'Product T',
                        y: 193982,
                        drilldown: '0|Product T'
                    },
                    {
                        name: 'Product J',
                        y: 148530,
                        drilldown: '0|Product J'
                    },
                    {
                        name: 'Product K',
                        y: 75153,
                        drilldown: '0|Product K'
                    },
                    {
                        name: 'Product L',
                        y: 67039,
                        drilldown: '0|Product L'
                    },
                    {
                        name: 'Product M',
                        y: 5798,
                        drilldown: '0|Product M'
                    },
                    {
                        name: 'Product S',
                        y: 3,
                        drilldown: '0|Product S'
                    }
                ]
            },
            {
                name: 'Products 2016',
                cropThreshold: 500,
                type: 'column',
                data: [
                    {
                        name: 'Product A',
                        y: 4557089,
                        drilldown: '1|Product A'
                    },
                    {
                        name: 'Product F',
                        y: 2767747,
                        drilldown: '1|Product F'
                    },
                    {
                        name: 'Product E',
                        y: 2219421,
                        drilldown: '1|Product E'
                    },
                    {
                        name: 'Product B',
                        y: 1740546,
                        drilldown: '1|Product B'
                    },
                    {
                        name: 'Product C',
                        y: 1340365,
                        drilldown: '1|Product C'
                    },
                    {
                        name: 'Product D',
                        y: 1047968,
                        drilldown: '1|Product D'
                    },
                    {
                        name: 'Product G',
                        y: 938414,
                        drilldown: '1|Product G'
                    },
                    {
                        name: 'Product H',
                        y: 650382,
                        drilldown: '1|Product H'
                    },
                    {
                        name: 'Product M',
                        y: 547843,
                        drilldown: '1|Product M'
                    },
                    {
                        name: 'Product N',
                        y: 507996,
                        drilldown: '1|Product N'
                    },
                    {
                        name: 'Product O',
                        y: 461770,
                        drilldown: '1|Product O'
                    },
                    {
                        name: 'Product P',
                        y: 391027,
                        drilldown: '1|Product P'
                    },
                    {
                        name: 'Product Q',
                        y: 344812,
                        drilldown: '1|Product Q'
                    },
                    {
                        name: 'Product T',
                        y: 289371,
                        drilldown: '1|Product T'
                    },
                    {
                        name: 'Product S',
                        y: 253645,
                        drilldown: '1|Product S'
                    },
                    {
                        name: 'Product R',
                        y: 210877,
                        drilldown: '1|Product R'
                    },
                    {
                        name: 'Product I',
                        y: 148915,
                        drilldown: '1|Product I'
                    },
                    {
                        name: 'Product J',
                        y: 114315,
                        drilldown: '1|Product J'
                    },
                    {
                        name: 'Product K',
                        y: 112030,
                        drilldown: '1|Product K'
                    },
                    {
                        name: 'Product L',
                        y: 72621,
                        drilldown: '1|Product L'
                    }
                ]
            }
        ],
        drilldown: {
            series: [
                {
                    id: '0|Product A',
                    name: ['Products 2015 Product A'],
                    type: 'column',
                    data: [
                        ['CN', 1358043],
                        ['US', 936875],
                        ['GB', 534843],
                        ['DE', 314611],
                        ['NL', 266247],
                        ['IT', 193640],
                        ['CH', 171246],
                        ['FR', 130890],
                        ['V4R4', 117005],
                        ['BE', 104342],
                        ['ZA', 103738],
                        ['ES', 86952],
                        ['JP', 74807],
                        ['HK', 59821],
                        ['CA', 59677],
                        ['NO', 58936],
                        ['AT', 55685],
                        ['SE', 50912],
                        ['AU', 39341],
                        ['CZ', 34719],
                        ['PT', 32977],
                        ['FI', 30261],
                        ['DK', 27871],
                        ['BR', 27628],
                        ['MY', 26915],
                        ['V4R1', 23641],
                        ['IN', 22060],
                        ['SG', 20829],
                        ['PL', 16313],
                        ['GR', 14870],
                        ['NZ', 12156],
                        ['RU', 11415],
                        ['HU', 10745],
                        ['SK', 9665],
                        ['MX', 4590],
                        ['SI', 4364],
                        ['IE', 3285],
                        ['HR', 2175],
                        ['PDC', 1736],
                        ['V4R2', 1321],
                        ['ZDSO', 537],
                        ['CY', 0],
                        ['TH', -936]
                    ]
                },
                {
                    id: '0|Product B',
                    name: ['Products 2015 Product B'],
                    type: 'column',
                    data: [
                        ['US', 484980],
                        ['CN', 332379],
                        ['GB', 226451],
                        ['DE', 163071],
                        ['FR', 96412],
                        ['JP', 91594],
                        ['KR', 74915],
                        ['IT', 49341],
                        ['ES', 48847],
                        ['MX', 48380],
                        ['BE', 43796],
                        ['CH', 35821],
                        ['NL', 30803],
                        ['TH', 26701],
                        ['V4R2', 22033],
                        ['RU', 17600],
                        ['AU', 17555],
                        ['NO', 16404],
                        ['V4R4', 15482],
                        ['BR', 15186],
                        ['CA', 12641],
                        ['PL', 12430],
                        ['AT', 11430],
                        ['PH', 8535],
                        ['SE', 8509],
                        ['ZA', 8443],
                        ['ID', 7758],
                        ['V4R1', 6808],
                        ['GR', 6758],
                        ['PT', 6707],
                        ['PDC', 6693],
                        ['TW', 4887],
                        ['MY', 2944],
                        ['DK', 2002],
                        ['CZ', 1924],
                        ['HK', 1675],
                        ['BG', 1298],
                        ['ZJC', 1117],
                        ['NZ', 1041],
                        ['SK', 811],
                        ['CY', 661],
                        ['HR', 515],
                        ['ZDSO', 514],
                        ['SG', 447],
                        ['LT', 435],
                        ['HU', 429],
                        ['IN', 307],
                        ['IE', 285],
                        ['RO', 264],
                        ['AR', 145],
                        ['MT', 114],
                        ['FI', 110],
                        ['SI', 82]
                    ]
                },
                {
                    id: '0|Product C',
                    name: ['Products 2015 Product C'],
                    type: 'column',
                    data: [
                        ['ZDSO', 281307],
                        ['US', 220518],
                        ['CN', 145551],
                        ['DE', 126264],
                        ['RU', 67602],
                        ['JP', 62332],
                        ['GB', 49655],
                        ['FR', 39762],
                        ['CH', 26429],
                        ['IN', 20054],
                        ['BE', 19534],
                        ['V4R4', 14194],
                        ['IT', 12962],
                        ['AU', 12875],
                        ['KR', 11991],
                        ['MY', 10960],
                        ['AT', 10707],
                        ['PL', 10149],
                        ['TW', 8993],
                        ['BR', 7944],
                        ['NL', 7714],
                        ['DK', 7664],
                        ['LT', 6895],
                        ['ID', 6635],
                        ['SE', 6601],
                        ['V4R1', 5878],
                        ['ES', 5820],
                        ['ZJC', 4410],
                        ['TH', 4344],
                        ['CA', 4197],
                        ['PDC', 3952],
                        ['HK', 3551],
                        ['V4R2', 3513],
                        ['ZA', 3054],
                        ['MX', 2723],
                        ['SI', 1938],
                        ['NO', 1439],
                        ['PT', 1422],
                        ['CZ', 1414],
                        ['SG', 1152],
                        ['BG', 858],
                        ['GR', 706],
                        ['SK', 538],
                        ['HU', 359],
                        ['HR', 350],
                        ['RO', 264],
                        ['NZ', 185],
                        ['IE', 123],
                        ['MT', 105]
                    ]
                },
                {
                    id: '0|Product D',
                    name: ['Products 2015 Product D'],
                    type: 'column',
                    data: [
                        ['US', 427683],
                        ['DE', 333636],
                        ['FR', 77639],
                        ['IT', 59556],
                        ['GB', 52313],
                        ['CH', 40635],
                        ['NL', 26955],
                        ['BE', 22924],
                        ['ES', 17951],
                        ['AT', 14777],
                        ['CA', 13846],
                        ['BR', 11041],
                        ['KR', 7634],
                        ['AU', 5943],
                        ['PT', 5353],
                        ['TH', 5018],
                        ['MX', 4720],
                        ['SE', 4065],
                        ['NO', 3818],
                        ['GR', 3653],
                        ['RU', 3093],
                        ['V4R2', 2919],
                        ['PL', 2746],
                        ['DK', 2742],
                        ['JP', 1700],
                        ['V4R4', 1598],
                        ['V4R1', 1509],
                        ['CN', 1463],
                        ['ZA', 1096],
                        ['FI', 1055],
                        ['ID', 1034],
                        ['HK', 963],
                        ['SG', 920],
                        ['CZ', 896],
                        ['NZ', 890],
                        ['TW', 789],
                        ['SI', 697],
                        ['HR', 616],
                        ['MY', 560],
                        ['SK', 435],
                        ['HU', 407],
                        ['IN', 390],
                        ['AR', 386],
                        ['RO', 240],
                        ['PDC', 234],
                        ['IE', 207],
                        ['PH', 191],
                        ['BG', 186],
                        ['CY', 78],
                        ['MT', 70],
                        ['LT', 52],
                        ['ZDSO', 28]
                    ]
                },
                {
                    id: '0|Product E',
                    name: ['Products 2015 Product E'],
                    type: 'column',
                    data: [
                        ['NL', 236861],
                        ['GB', 200237],
                        ['DE', 193775],
                        ['CH', 154289],
                        ['CN', 64580],
                        ['BE', 41439],
                        ['IT', 33075],
                        ['AT', 25394],
                        ['PT', 25246],
                        ['SE', 21497],
                        ['V4R1', 17120],
                        ['ES', 13938],
                        ['CZ', 11828],
                        ['FR', 11363],
                        ['HK', 10557],
                        ['DK', 9947],
                        ['IE', 8028],
                        ['HU', 6993],
                        ['ZA', 6548],
                        ['MY', 5850],
                        ['NO', 5608],
                        ['JP', 4952],
                        ['FI', 3894],
                        ['PL', 2920],
                        ['SI', 2539],
                        ['BR', 1292],
                        ['GR', 1004],
                        ['TH', 997],
                        ['V4R4', 930],
                        ['IN', 779],
                        ['SK', 621],
                        ['PDC', 542],
                        ['ZDSO', 486],
                        ['HR', 407],
                        ['RO', 282],
                        ['MT', 175],
                        ['LT', 130],
                        ['RU', 120],
                        ['NZ', 76],
                        ['AU', 0],
                        ['US', -133],
                        ['CA', -579]
                    ]
                },
                {
                    id: '0|Product G',
                    name: ['Products 2015 Product G'],
                    type: 'column',
                    data: [
                        ['DE', 434528],
                        ['US', 133921],
                        ['RU', 63401],
                        ['GB', 63064],
                        ['CN', 61030],
                        ['JP', 46683],
                        ['CH', 26879],
                        ['FR', 22245],
                        ['IT', 18867],
                        ['IN', 15316],
                        ['BE', 11835],
                        ['NL', 11152],
                        ['CA', 10880],
                        ['KR', 9557],
                        ['AU', 8355],
                        ['AT', 8176],
                        ['ES', 7887],
                        ['SE', 5363],
                        ['TH', 5213],
                        ['V4R4', 4982],
                        ['ZA', 4559],
                        ['NO', 4196],
                        ['PL', 3989],
                        ['FI', 2898],
                        ['TW', 2546],
                        ['PT', 2423],
                        ['BR', 1833],
                        ['GR', 1788],
                        ['MX', 1732],
                        ['RO', 1581],
                        ['V4R1', 1514],
                        ['HK', 1368],
                        ['MY', 1277],
                        ['DK', 1166],
                        ['ID', 1130],
                        ['CZ', 1052],
                        ['V4R2', 765],
                        ['HU', 764],
                        ['SI', 763],
                        ['NZ', 724],
                        ['BG', 720],
                        ['PDC', 689],
                        ['LT', 648],
                        ['IE', 629],
                        ['CY', 592],
                        ['SK', 591],
                        ['SG', 330],
                        ['ZDSO', 294],
                        ['PH', 124],
                        ['ZJC', 40],
                        ['HR', 36]
                    ]
                },
                {
                    id: '0|Product N',
                    name: ['Products 2015 Product N'],
                    type: 'column',
                    data: [
                        ['DE', 198722],
                        ['GB', 114688],
                        ['US', 72739],
                        ['IT', 58272],
                        ['CH', 26816],
                        ['TH', 25213],
                        ['FR', 24733],
                        ['KR', 15625],
                        ['CN', 14332],
                        ['ES', 13716],
                        ['RU', 11270],
                        ['ID', 10890],
                        ['MX', 7931],
                        ['NL', 6674],
                        ['BE', 6330],
                        ['AT', 5343],
                        ['PL', 5221],
                        ['V4R4', 4189],
                        ['TW', 4176],
                        ['V4R1', 3660],
                        ['GR', 3599],
                        ['BR', 3504],
                        ['IN', 2427],
                        ['CZ', 2298],
                        ['SE', 1935],
                        ['V4R2', 1705],
                        ['PH', 1652],
                        ['PT', 1636],
                        ['HK', 1571],
                        ['NO', 1238],
                        ['MY', 1216],
                        ['SK', 1169],
                        ['DK', 1168],
                        ['ZA', 934],
                        ['HU', 808],
                        ['AU', 757],
                        ['HR', 703],
                        ['SI', 667],
                        ['PDC', 526],
                        ['ZJC', 518],
                        ['FI', 487],
                        ['RO', 453],
                        ['SG', 46]
                    ]
                },
                {
                    id: '0|Product O',
                    name: ['Products 2015 Product O'],
                    type: 'column',
                    data: [
                        ['DE', 151324],
                        ['IT', 67272],
                        ['TW', 28158],
                        ['CN', 25141],
                        ['GB', 22297],
                        ['BE', 22054],
                        ['RU', 21098],
                        ['FR', 17320],
                        ['V4R1', 15916],
                        ['DK', 15703],
                        ['V4R2', 14811],
                        ['ZJC', 13537],
                        ['ES', 11901],
                        ['CH', 11363],
                        ['KR', 10516],
                        ['IN', 9032],
                        ['AT', 7763],
                        ['SE', 6190],
                        ['PL', 6054],
                        ['MY', 5555],
                        ['JP', 4801],
                        ['NL', 4721],
                        ['ZA', 3728],
                        ['NO', 3664],
                        ['MX', 3296],
                        ['IE', 2914],
                        ['BR', 2741],
                        ['PT', 2644],
                        ['CZ', 2279],
                        ['PDC', 2234],
                        ['US', 1943],
                        ['V4R4', 1738],
                        ['ID', 1634],
                        ['TH', 1631],
                        ['GR', 1550],
                        ['CA', 1257],
                        ['RO', 1047],
                        ['SI', 876],
                        ['HU', 844],
                        ['SK', 822],
                        ['AR', 777],
                        ['AU', 597],
                        ['BG', 579],
                        ['PH', 502],
                        ['HR', 496],
                        ['FI', 195],
                        ['CY', 117],
                        ['SG', 39],
                        ['ZDSO', 36],
                        ['HK', 27]
                    ]
                },
                {
                    id: '0|Product Q',
                    name: ['Products 2015 Product Q'],
                    type: 'column',
                    data: [
                        ['DE', 126483],
                        ['JP', 64566],
                        ['RU', 46181],
                        ['US', 38106],
                        ['IT', 30247],
                        ['KR', 16742],
                        ['GB', 15001],
                        ['CH', 13090],
                        ['FR', 12873],
                        ['AT', 12796],
                        ['BE', 10517],
                        ['ES', 8675],
                        ['PL', 8394],
                        ['LT', 6983],
                        ['NL', 6859],
                        ['CN', 6653],
                        ['V4R1', 6279],
                        ['NO', 5768],
                        ['DK', 5573],
                        ['IN', 5332],
                        ['CZ', 4769],
                        ['CA', 4150],
                        ['V4R4', 2853],
                        ['PT', 2650],
                        ['TW', 2619],
                        ['AU', 2612],
                        ['HK', 2013],
                        ['MX', 1864],
                        ['SK', 1486],
                        ['SE', 1470],
                        ['RO', 1422],
                        ['GR', 1382],
                        ['ZA', 1343],
                        ['HR', 919],
                        ['MY', 867],
                        ['BG', 865],
                        ['HU', 812],
                        ['BR', 739],
                        ['FI', 734],
                        ['PDC', 674],
                        ['V4R2', 642],
                        ['ZDSO', 551],
                        ['ID', 486],
                        ['IE', 483],
                        ['SI', 396],
                        ['SG', 377],
                        ['TH', 265],
                        ['CY', 183],
                        ['MT', 152],
                        ['PH', 113],
                        ['NZ', 66]
                    ]
                },
                {
                    id: '0|Product F',
                    name: ['Products 2015 Product F'],
                    type: 'column',
                    data: [
                        ['JP', 133410],
                        ['DE', 94492],
                        ['US', 50050],
                        ['KR', 20958],
                        ['GB', 20729],
                        ['FR', 11532],
                        ['V4R4', 7563],
                        ['CH', 6868],
                        ['IT', 6545],
                        ['CN', 6417],
                        ['CA', 5843],
                        ['RU', 5718],
                        ['BR', 5509],
                        ['NL', 5216],
                        ['BE', 4987],
                        ['V4R1', 4352],
                        ['HK', 4013],
                        ['IN', 3916],
                        ['PL', 3482],
                        ['ES', 3422],
                        ['AU', 3381],
                        ['AT', 3102],
                        ['SE', 2306],
                        ['DK', 2016],
                        ['TW', 1670],
                        ['MX', 1633],
                        ['ZA', 1434],
                        ['ZDSO', 1406],
                        ['NO', 1406],
                        ['TH', 1373],
                        ['CZ', 1290],
                        ['GR', 1096],
                        ['V4R2', 1035],
                        ['MY', 777],
                        ['SI', 639],
                        ['LT', 442],
                        ['ID', 418],
                        ['PH', 361],
                        ['FI', 328],
                        ['HR', 288],
                        ['BG', 287],
                        ['PT', 273],
                        ['IE', 252],
                        ['HU', 230],
                        ['CY', 166],
                        ['SK', 111],
                        ['PDC', 89],
                        ['NZ', 85],
                        ['RO', 61],
                        ['MT', 42]
                    ]
                },
                {
                    id: '0|Product R',
                    name: ['Products 2015 Product R'],
                    type: 'column',
                    data: [
                        ['US', 95379],
                        ['CN', 62248],
                        ['DE', 50421],
                        ['IT', 25139],
                        ['GB', 11374],
                        ['FR', 7881],
                        ['ES', 6289],
                        ['CH', 4802],
                        ['AT', 3768],
                        ['BE', 3443],
                        ['ZJC', 3098],
                        ['CA', 2824],
                        ['V4R1', 2517],
                        ['CZ', 2022],
                        ['MX', 896],
                        ['KR', 860],
                        ['GR', 774],
                        ['PT', 770],
                        ['SE', 728],
                        ['SI', 658],
                        ['FI', 638],
                        ['PL', 628],
                        ['NL', 600]
                    ]
                },
                {
                    id: '0|Product H',
                    name: ['Products 2015 Product H'],
                    type: 'column',
                    data: [
                        ['DE', 137066],
                        ['GB', 23446],
                        ['RU', 17607],
                        ['CN', 12097],
                        ['KR', 11061],
                        ['IT', 8762],
                        ['FR', 8437],
                        ['NL', 8323],
                        ['JP', 7444],
                        ['CH', 6448],
                        ['DK', 5138],
                        ['AT', 5123],
                        ['US', 4663],
                        ['BE', 3907],
                        ['V4R1', 2951],
                        ['TW', 2492],
                        ['ES', 2139],
                        ['AU', 1978],
                        ['SE', 1867],
                        ['ZA', 1046],
                        ['SI', 992],
                        ['GR', 957],
                        ['CZ', 837],
                        ['PL', 828],
                        ['FI', 807],
                        ['PDC', 753],
                        ['HU', 750],
                        ['V4R2', 705],
                        ['RO', 660],
                        ['HR', 576],
                        ['TH', 574],
                        ['NO', 547],
                        ['ZJC', 298],
                        ['LT', 198],
                        ['PT', 197],
                        ['IN', 183],
                        ['MX', 86],
                        ['PH', 69],
                        ['SG', 68],
                        ['SK', 64],
                        ['MY', 62],
                        ['BG', 53],
                        ['NZ', 48],
                        ['HK', 44],
                        ['ID', 18]
                    ]
                },
                {
                    id: '0|Product I',
                    name: ['Products 2015 Product I'],
                    type: 'column',
                    data: [
                        ['DE', 244299],
                        ['AT', 5054],
                        ['IT', 840],
                        ['GB', 569]
                    ]
                },
                {
                    id: '0|Product T',
                    name: ['Products 2015 Product T'],
                    type: 'column',
                    data: [
                        ['DE', 65359],
                        ['US', 29898],
                        ['CH', 14748],
                        ['TW', 9412],
                        ['GB', 8670],
                        ['HK', 7856],
                        ['NO', 5349],
                        ['CZ', 5062],
                        ['CN', 4282],
                        ['SG', 4022],
                        ['ZJC', 4016],
                        ['PL', 3205],
                        ['SE', 2736],
                        ['SK', 2707],
                        ['V4R2', 2629],
                        ['V4R1', 2390],
                        ['FR', 2096],
                        ['GR', 1890],
                        ['AT', 1884],
                        ['BE', 1860],
                        ['JP', 1633],
                        ['PDC', 1580],
                        ['PH', 1264],
                        ['IT', 1258],
                        ['V4R4', 1085],
                        ['RO', 828],
                        ['NL', 788],
                        ['CA', 706],
                        ['DK', 666],
                        ['ZA', 597],
                        ['ES', 536],
                        ['LT', 464],
                        ['MY', 450],
                        ['FI', 408],
                        ['TH', 283],
                        ['IE', 269],
                        ['HU', 236],
                        ['SI', 208],
                        ['ZDSO', 196],
                        ['RU', 183],
                        ['CY', 155],
                        ['PT', 118]
                    ]
                },
                {
                    id: '0|Product J',
                    name: ['Products 2015 Product J'],
                    type: 'column',
                    data: [
                        ['DE', 41798],
                        ['US', 16839],
                        ['IN', 12222],
                        ['BE', 8771],
                        ['CH', 8017],
                        ['NL', 7390],
                        ['BR', 6503],
                        ['AU', 5321],
                        ['IT', 4879],
                        ['FR', 4787],
                        ['GB', 4617],
                        ['TW', 4514],
                        ['AT', 3396],
                        ['ES', 2640],
                        ['PL', 2141],
                        ['ZDSO', 1575],
                        ['V4R1', 1479],
                        ['SE', 1426],
                        ['V4R4', 1346],
                        ['V4R2', 1320],
                        ['DK', 1155],
                        ['CZ', 802],
                        ['FI', 780],
                        ['JP', 664],
                        ['PT', 615],
                        ['SK', 585],
                        ['CA', 500],
                        ['SG', 364],
                        ['BG', 318],
                        ['MX', 287],
                        ['ZA', 266],
                        ['PDC', 265],
                        ['NZ', 219],
                        ['TH', 204],
                        ['KR', 169],
                        ['IE', 133],
                        ['HU', 128],
                        ['NO', 95]
                    ]
                },
                {
                    id: '0|Product K',
                    name: ['Products 2015 Product K'],
                    type: 'column',
                    data: [
                        ['IT', 22826],
                        ['DE', 14508],
                        ['GB', 4074],
                        ['BR', 3983],
                        ['FR', 3683],
                        ['CH', 2668],
                        ['CZ', 2541],
                        ['V4R2', 2511],
                        ['NO', 2286],
                        ['CA', 2171],
                        ['KR', 1856],
                        ['AT', 1730],
                        ['BE', 1316],
                        ['SK', 924],
                        ['NL', 878],
                        ['PL', 834],
                        ['RU', 686],
                        ['AU', 616],
                        ['DK', 526],
                        ['ES', 510],
                        ['HK', 444],
                        ['ZJC', 405],
                        ['FI', 388],
                        ['US', 384],
                        ['SE', 300],
                        ['GR', 282],
                        ['PT', 246],
                        ['BG', 234],
                        ['IN', 218],
                        ['HU', 199],
                        ['CN', 193],
                        ['SG', 151],
                        ['V4R4', 140],
                        ['MX', 113],
                        ['ZA', 105],
                        ['LT', 100],
                        ['CY', 63],
                        ['V4R1', 61]
                    ]
                },
                {
                    id: '0|Product L',
                    name: ['Products 2015 Product L'],
                    type: 'column',
                    data: [
                        ['DE', 21502],
                        ['RU', 10015],
                        ['AT', 6691],
                        ['V4R1', 5628],
                        ['KR', 4876],
                        ['IN', 3575],
                        ['CN', 2310],
                        ['TW', 2237],
                        ['DK', 1736],
                        ['PL', 1247],
                        ['NL', 987],
                        ['SI', 915],
                        ['ES', 723],
                        ['IT', 642],
                        ['V4R4', 493],
                        ['LT', 434],
                        ['SK', 412],
                        ['RO', 369],
                        ['CZ', 322],
                        ['PT', 294],
                        ['V4R2', 277],
                        ['BE', 265],
                        ['HR', 226],
                        ['BG', 208],
                        ['CH', 194],
                        ['HU', 165],
                        ['GR', 113],
                        ['TH', 100],
                        ['ZJC', 98],
                        ['SE', 0],
                        ['US', -15]
                    ]
                },
                {
                    id: '0|Product M',
                    name: ['Products 2015 Product M'],
                    type: 'column',
                    data: [
                        ['DE', 2012],
                        ['RU', 480],
                        ['FR', 432],
                        ['CH', 394],
                        ['NL', 369],
                        ['IT', 338],
                        ['GB', 310],
                        ['BE', 280],
                        ['ES', 176],
                        ['PT', 166],
                        ['SE', 144],
                        ['V4R4', 123],
                        ['CZ', 93],
                        ['AT', 75],
                        ['NO', 72],
                        ['PL', 72],
                        ['HU', 62],
                        ['ZA', 38],
                        ['V4R1', 37],
                        ['MX', 26],
                        ['V4R2', 24],
                        ['CA', 23],
                        ['DK', 21],
                        ['RO', 18],
                        ['GR', 13]
                    ]
                },
                {
                    id: '0|Product S',
                    name: ['Products 2015 Product S'],
                    type: 'column',
                    data: [['ZDSO', 3]]
                },
                {
                    id: '1|Product A',
                    name: ['Products 2016 Product A'],
                    type: 'column',
                    data: [
                        ['NL', 660890],
                        ['DE', 513754],
                        ['GB', 492790],
                        ['US', 479429],
                        ['CH', 382961],
                        ['FR', 186906],
                        ['BE', 170607],
                        ['AT', 157467],
                        ['SE', 152775],
                        ['V4R4', 139965],
                        ['CA', 122975],
                        ['NO', 115259],
                        ['CN', 82864],
                        ['JP', 63803],
                        ['ES', 63643],
                        ['MX', 61253],
                        ['AU', 58885],
                        ['ZA', 58088],
                        ['IT', 53151],
                        ['PL', 53105],
                        ['FI', 45645],
                        ['V4R1', 34699],
                        ['CZ', 33821],
                        ['V4R2', 33258],
                        ['BR', 32333],
                        ['TH', 30872],
                        ['RO', 25541],
                        ['ZDSO', 25096],
                        ['PT', 24951],
                        ['SI', 23191],
                        ['SG', 21881],
                        ['PDC', 21557],
                        ['GR', 20537],
                        ['MY', 19419],
                        ['TW', 18849],
                        ['HU', 16372],
                        ['HK', 13102],
                        ['DK', 8767],
                        ['IN', 6215],
                        ['IE', 6040],
                        ['NZ', 5794],
                        ['BG', 4685],
                        ['SK', 4141],
                        ['CY', 2547],
                        ['RU', 2400],
                        ['HR', 1914],
                        ['PH', 1193],
                        ['ID', 870],
                        ['MT', 638],
                        ['ZJC', 191]
                    ]
                },
                {
                    id: '1|Product F',
                    name: ['Products 2016 Product F'],
                    type: 'column',
                    data: [
                        ['US', 903444],
                        ['DE', 396344],
                        ['JP', 347778],
                        ['IN', 160328],
                        ['RU', 103317],
                        ['KR', 96624],
                        ['IT', 70206],
                        ['GB', 66204],
                        ['V4R4', 58025],
                        ['CA', 46994],
                        ['CH', 44616],
                        ['BE', 33941],
                        ['V4R2', 30275],
                        ['BR', 29085],
                        ['AT', 28640],
                        ['PL', 27391],
                        ['V4R1', 25152],
                        ['NL', 24725],
                        ['FR', 24626],
                        ['CN', 23647],
                        ['AU', 21100],
                        ['ES', 20979],
                        ['MY', 20961],
                        ['TW', 13210],
                        ['TH', 12872],
                        ['SE', 12312],
                        ['MX', 12145],
                        ['ID', 11604],
                        ['ZA', 11108],
                        ['NO', 9656],
                        ['PDC', 9527],
                        ['DK', 9084],
                        ['CZ', 8661],
                        ['LT', 6683],
                        ['SG', 6382],
                        ['HK', 6160],
                        ['FI', 4988],
                        ['SI', 4543],
                        ['GR', 3591],
                        ['IE', 3169],
                        ['PT', 2468],
                        ['AR', 2297],
                        ['RO', 2276],
                        ['PH', 2006],
                        ['SK', 1950],
                        ['HU', 1432],
                        ['ZDSO', 1366],
                        ['CY', 902],
                        ['BG', 874],
                        ['HR', 807],
                        ['NZ', 648],
                        ['ZJC', 624]
                    ]
                },
                {
                    id: '1|Product E',
                    name: ['Products 2016 Product E'],
                    type: 'column',
                    data: [
                        ['NL', 558362],
                        ['DE', 424613],
                        ['GB', 265912],
                        ['BE', 171332],
                        ['CH', 113621],
                        ['AT', 109416],
                        ['SE', 89138],
                        ['IT', 71476],
                        ['FR', 60126],
                        ['PT', 58385],
                        ['DK', 43804],
                        ['CN', 39689],
                        ['NO', 35707],
                        ['FI', 25409],
                        ['ES', 21065],
                        ['HU', 19638],
                        ['MY', 18163],
                        ['HK', 17442],
                        ['IE', 15463],
                        ['V4R1', 12606],
                        ['SI', 9357],
                        ['PL', 6602],
                        ['CZ', 6563],
                        ['ZA', 4555],
                        ['V4R4', 3960],
                        ['JP', 3690],
                        ['RO', 3067],
                        ['SK', 2829],
                        ['GR', 2365],
                        ['ZDSO', 1603],
                        ['V4R2', 1041],
                        ['BG', 651],
                        ['MT', 407],
                        ['BR', 274],
                        ['HR', 271],
                        ['ID', 200],
                        ['US', 184],
                        ['RU', 161],
                        ['CA', 141],
                        ['PDC', 133]
                    ]
                },
                {
                    id: '1|Product B',
                    name: ['Products 2016 Product B'],
                    type: 'column',
                    data: [
                        ['CN', 290223],
                        ['US', 213323],
                        ['GB', 163015],
                        ['KR', 124235],
                        ['DE', 116645],
                        ['JP', 107699],
                        ['FR', 102366],
                        ['IT', 93826],
                        ['MX', 75945],
                        ['ES', 73006],
                        ['BE', 53536],
                        ['CH', 36160],
                        ['TH', 30761],
                        ['NL', 27283],
                        ['RU', 26444],
                        ['SE', 22089],
                        ['V4R1', 20625],
                        ['PL', 17032],
                        ['AU', 16193],
                        ['V4R4', 15238],
                        ['AT', 15048],
                        ['BR', 14258],
                        ['V4R2', 12024],
                        ['CA', 11588],
                        ['MY', 6247],
                        ['PT', 5922],
                        ['ZA', 5708],
                        ['NO', 5129],
                        ['ID', 4376],
                        ['DK', 4092],
                        ['SG', 3879],
                        ['IN', 3867],
                        ['IE', 2496],
                        ['SK', 2432],
                        ['PDC', 2416],
                        ['GR', 1801],
                        ['TW', 1733],
                        ['ZJC', 1547],
                        ['FI', 1462],
                        ['NZ', 1406],
                        ['BG', 1341],
                        ['HK', 1314],
                        ['CY', 937],
                        ['PH', 911],
                        ['CZ', 911],
                        ['HR', 740],
                        ['SI', 651],
                        ['RO', 497],
                        ['HU', 138],
                        ['LT', 31]
                    ]
                },
                {
                    id: '1|Product C',
                    name: ['Products 2016 Product C'],
                    type: 'column',
                    data: [
                        ['US', 474284],
                        ['DE', 137875],
                        ['JP', 98496],
                        ['FR', 78392],
                        ['IT', 71460],
                        ['RU', 67276],
                        ['GB', 61075],
                        ['ES', 47692],
                        ['KR', 33066],
                        ['CH', 31824],
                        ['IN', 25501],
                        ['V4R2', 23626],
                        ['AU', 16730],
                        ['BE', 16210],
                        ['DK', 15492],
                        ['NL', 15339],
                        ['AT', 14488],
                        ['PL', 10819],
                        ['BR', 8919],
                        ['SE', 8844],
                        ['V4R1', 8799],
                        ['MY', 8672],
                        ['CA', 7733],
                        ['MX', 7574],
                        ['LT', 5259],
                        ['V4R4', 4470],
                        ['PDC', 3656],
                        ['SG', 3524],
                        ['TH', 3114],
                        ['TW', 3101],
                        ['ID', 2735],
                        ['NO', 2563],
                        ['CZ', 2409],
                        ['ZA', 2002],
                        ['CN', 1923],
                        ['PT', 1911],
                        ['RO', 1593],
                        ['GR', 1550],
                        ['PH', 1444],
                        ['FI', 1323],
                        ['SK', 1265],
                        ['HU', 1242],
                        ['ZJC', 1237],
                        ['IE', 1225],
                        ['SI', 819],
                        ['HK', 681],
                        ['NZ', 576],
                        ['AR', 309],
                        ['HR', 248]
                    ]
                },
                {
                    id: '1|Product D',
                    name: ['Products 2016 Product D'],
                    type: 'column',
                    data: [
                        ['US', 329683],
                        ['DE', 317262],
                        ['FR', 72031],
                        ['IT', 65131],
                        ['GB', 44790],
                        ['CH', 35911],
                        ['NL', 25751],
                        ['BE', 21819],
                        ['ES', 17187],
                        ['AT', 15796],
                        ['CA', 14006],
                        ['CN', 9769],
                        ['TH', 8911],
                        ['AU', 8133],
                        ['BR', 7080],
                        ['KR', 6579],
                        ['PT', 4648],
                        ['SE', 4340],
                        ['MX', 4331],
                        ['GR', 3962],
                        ['RU', 3715],
                        ['V4R2', 2792],
                        ['NO', 2667],
                        ['PL', 2620],
                        ['DK', 2457],
                        ['V4R1', 1771],
                        ['JP', 1562],
                        ['V4R4', 1475],
                        ['ID', 1327],
                        ['SG', 1289],
                        ['ZA', 1275],
                        ['CZ', 1029],
                        ['SI', 646],
                        ['NZ', 618],
                        ['TW', 594],
                        ['PH', 575],
                        ['MY', 567],
                        ['FI', 465],
                        ['LT', 442],
                        ['HU', 438],
                        ['HK', 415],
                        ['IE', 370],
                        ['HR', 364],
                        ['SK', 291],
                        ['PDC', 278],
                        ['BG', 254],
                        ['RO', 212],
                        ['AR', 176],
                        ['CY', 112],
                        ['IN', 24],
                        ['ZDSO', 14],
                        ['MT', 14]
                    ]
                },
                {
                    id: '1|Product G',
                    name: ['Products 2016 Product G'],
                    type: 'column',
                    data: [
                        ['DE', 437216],
                        ['US', 98205],
                        ['RU', 72762],
                        ['GB', 52930],
                        ['JP', 37500],
                        ['CN', 35537],
                        ['IT', 29033],
                        ['IN', 19653],
                        ['CH', 19037],
                        ['FR', 17326],
                        ['HK', 16104],
                        ['NL', 14412],
                        ['AU', 8843],
                        ['KR', 7188],
                        ['BE', 6359],
                        ['ZA', 5633],
                        ['CA', 5606],
                        ['PL', 5363],
                        ['AT', 5208],
                        ['V4R4', 4911],
                        ['SE', 4664],
                        ['ES', 4455],
                        ['TH', 3895],
                        ['LT', 2932],
                        ['RO', 2875],
                        ['GR', 2326],
                        ['V4R1', 2195],
                        ['NO', 2056],
                        ['ZJC', 1694],
                        ['DK', 1688],
                        ['CZ', 1571],
                        ['SK', 1062],
                        ['IE', 981],
                        ['ID', 969],
                        ['PT', 896],
                        ['V4R2', 878],
                        ['SI', 869],
                        ['SG', 750],
                        ['MX', 681],
                        ['ZDSO', 652],
                        ['BG', 499],
                        ['NZ', 491],
                        ['MY', 437],
                        ['FI', 335],
                        ['AR', 333],
                        ['TW', 326],
                        ['HU', 321],
                        ['CY', 182],
                        ['PDC', 72],
                        ['HR', 72],
                        ['PH', 36],
                        ['MT', 36],
                        ['BR', -1641]
                    ]
                },
                {
                    id: '1|Product H',
                    name: ['Products 2016 Product H'],
                    type: 'column',
                    data: [
                        ['DE', 201370],
                        ['DK', 77469],
                        ['RU', 73786],
                        ['IT', 63095],
                        ['TW', 53433],
                        ['GB', 24505],
                        ['NL', 24335],
                        ['KR', 24321],
                        ['FR', 16088],
                        ['AT', 14102],
                        ['BE', 11368],
                        ['ES', 7793],
                        ['CN', 7208],
                        ['V4R2', 5628],
                        ['PT', 4988],
                        ['V4R1', 4979],
                        ['JP', 4741],
                        ['PL', 4308],
                        ['CH', 4012],
                        ['FI', 3493],
                        ['GR', 2730],
                        ['LT', 1829],
                        ['SI', 1433],
                        ['NO', 1299],
                        ['ZA', 1204],
                        ['RO', 1116],
                        ['V4R4', 1103],
                        ['IN', 993],
                        ['TH', 990],
                        ['CA', 889],
                        ['SE', 795],
                        ['HR', 649],
                        ['IE', 607],
                        ['AU', 550],
                        ['SK', 505],
                        ['US', 504],
                        ['BG', 456],
                        ['SG', 398],
                        ['NZ', 396],
                        ['CZ', 359],
                        ['HU', 304],
                        ['PH', 251]
                    ]
                },
                {
                    id: '1|Product M',
                    name: ['Products 2016 Product M'],
                    type: 'column',
                    data: [
                        ['DE', 130104],
                        ['US', 130092],
                        ['FR', 36989],
                        ['RU', 31613],
                        ['BE', 31319],
                        ['GB', 29121],
                        ['CH', 28973],
                        ['IT', 22823],
                        ['NL', 11430],
                        ['AT', 10552],
                        ['KR', 9796],
                        ['ES', 8934],
                        ['PL', 8487],
                        ['PT', 6786],
                        ['V4R1', 6048],
                        ['SE', 5882],
                        ['CZ', 4209],
                        ['GR', 3994],
                        ['CA', 3435],
                        ['HU', 3425],
                        ['IN', 2729],
                        ['SK', 2500],
                        ['ZA', 2022],
                        ['V4R4', 1729],
                        ['BG', 1628],
                        ['DK', 1585],
                        ['IE', 1281],
                        ['NO', 1251],
                        ['V4R2', 1005],
                        ['TH', 984],
                        ['MY', 922],
                        ['AU', 904],
                        ['BR', 808],
                        ['MX', 685],
                        ['RO', 614],
                        ['CY', 560],
                        ['NZ', 552],
                        ['SI', 496],
                        ['CN', 494],
                        ['PDC', 274],
                        ['FI', 248],
                        ['MT', 140],
                        ['HR', 140],
                        ['LT', 134],
                        ['TW', 69],
                        ['ZJC', 56],
                        ['PH', 21]
                    ]
                },
                {
                    id: '1|Product N',
                    name: ['Products 2016 Product N'],
                    type: 'column',
                    data: [
                        ['DE', 152700],
                        ['GB', 103790],
                        ['IT', 60587],
                        ['TH', 26909],
                        ['US', 26807],
                        ['FR', 20080],
                        ['KR', 17375],
                        ['CN', 15947],
                        ['CH', 15207],
                        ['ES', 9960],
                        ['NL', 5835],
                        ['ID', 5533],
                        ['BE', 5334],
                        ['MX', 4657],
                        ['RU', 4615],
                        ['AT', 4320],
                        ['MY', 3118],
                        ['PT', 2846],
                        ['V4R4', 2341],
                        ['PL', 2186],
                        ['V4R2', 2171],
                        ['IN', 1635],
                        ['HU', 1525],
                        ['V4R1', 1396],
                        ['GR', 1116],
                        ['BR', 1039],
                        ['SE', 944],
                        ['PH', 924],
                        ['RO', 803],
                        ['SI', 780],
                        ['DK', 777],
                        ['CA', 756],
                        ['ZA', 746],
                        ['CZ', 577],
                        ['IE', 528],
                        ['BG', 480],
                        ['NZ', 363],
                        ['TW', 344],
                        ['NO', 230],
                        ['PDC', 224],
                        ['ZJC', 154],
                        ['FI', 132],
                        ['LT', 103],
                        ['HK', 102]
                    ]
                },
                {
                    id: '1|Product O',
                    name: ['Products 2016 Product O'],
                    type: 'column',
                    data: [
                        ['DE', 107070],
                        ['TW', 53806],
                        ['IT', 27804],
                        ['GB', 22260],
                        ['ZJC', 18440],
                        ['RU', 18258],
                        ['CN', 14929],
                        ['FR', 14779],
                        ['DK', 14677],
                        ['CH', 13855],
                        ['BE', 13348],
                        ['AT', 12822],
                        ['V4R1', 11762],
                        ['V4R2', 8983],
                        ['ES', 7635],
                        ['KR', 6862],
                        ['SE', 6615],
                        ['JP', 6529],
                        ['PT', 6039],
                        ['ZA', 5348],
                        ['NL', 5302],
                        ['MY', 5120],
                        ['ZDSO', 5080],
                        ['PL', 4943],
                        ['IN', 4440],
                        ['NO', 3802],
                        ['US', 3390],
                        ['BR', 3277],
                        ['MX', 3005],
                        ['LT', 2731],
                        ['BG', 2670],
                        ['CZ', 2504],
                        ['CA', 2367],
                        ['IE', 2335],
                        ['PDC', 2257],
                        ['GR', 2042],
                        ['SI', 1912],
                        ['ID', 1751],
                        ['HU', 1614],
                        ['SK', 1594],
                        ['V4R4', 1507],
                        ['FI', 1206],
                        ['RO', 1121],
                        ['PH', 961],
                        ['AR', 859],
                        ['HR', 537],
                        ['HK', 470],
                        ['AU', 418],
                        ['TH', 316],
                        ['MT', 199],
                        ['SG', 146],
                        ['CY', 73]
                    ]
                },
                {
                    id: '1|Product P',
                    name: ['Products 2016 Product P'],
                    type: 'column',
                    data: [
                        ['DE', 254570],
                        ['SE', 95891],
                        ['FR', 14491],
                        ['NO', 6574],
                        ['NL', 4844],
                        ['ES', 2640],
                        ['DK', 2081],
                        ['IT', 1800],
                        ['AT', 1710],
                        ['PT', 1673],
                        ['PL', 1449],
                        ['CH', 1008],
                        ['FI', 412],
                        ['BE', 374],
                        ['SI', 366],
                        ['AU', 294],
                        ['GR', 219],
                        ['RU', 185],
                        ['CZ', 182],
                        ['V4R1', 146],
                        ['HU', 118]
                    ]
                },
                {
                    id: '1|Product Q',
                    name: ['Products 2016 Product Q'],
                    type: 'column',
                    data: [
                        ['DE', 79184],
                        ['RU', 45637],
                        ['JP', 41962],
                        ['IT', 24916],
                        ['US', 17479],
                        ['GB', 14780],
                        ['DK', 11052],
                        ['FR', 11025],
                        ['CH', 10270],
                        ['AT', 8742],
                        ['KR', 8544],
                        ['PL', 8182],
                        ['ES', 6976],
                        ['BE', 5808],
                        ['NL', 5073],
                        ['IN', 4524],
                        ['CZ', 3487],
                        ['CA', 3012],
                        ['V4R1', 2647],
                        ['NO', 2581],
                        ['AU', 2073],
                        ['SE', 1924],
                        ['RO', 1913],
                        ['LT', 1874],
                        ['V4R4', 1823],
                        ['PT', 1674],
                        ['V4R2', 1577],
                        ['GR', 1552],
                        ['TW', 1462],
                        ['HU', 1375],
                        ['BG', 1302],
                        ['FI', 1293],
                        ['ZA', 1238],
                        ['SK', 1186],
                        ['MX', 1126],
                        ['HR', 933],
                        ['IE', 905],
                        ['TH', 646],
                        ['CN', 603],
                        ['SI', 588],
                        ['ID', 493],
                        ['AR', 463],
                        ['ZDSO', 456],
                        ['MY', 158],
                        ['CY', 91],
                        ['PH', 68],
                        ['ZJC', 56],
                        ['MT', 46],
                        ['PDC', 45],
                        ['NZ', 27],
                        ['SG', 13],
                        ['BR', -52]
                    ]
                },
                {
                    id: '1|Product T',
                    name: ['Products 2016 Product T'],
                    type: 'column',
                    data: [
                        ['US', 123700],
                        ['DE', 42938],
                        ['IN', 25202],
                        ['KR', 19330],
                        ['IT', 13032],
                        ['FR', 8075],
                        ['GB', 7232],
                        ['V4R2', 6033],
                        ['CH', 5524],
                        ['PL', 5367],
                        ['BE', 3557],
                        ['SE', 3077],
                        ['CA', 2917],
                        ['GR', 2341],
                        ['AT', 2140],
                        ['HU', 2118],
                        ['TH', 1710],
                        ['V4R4', 1393],
                        ['MX', 1382],
                        ['ZA', 1242],
                        ['NO', 1226],
                        ['JP', 1222],
                        ['CZ', 1179],
                        ['NL', 1091],
                        ['SI', 1017],
                        ['ES', 996],
                        ['V4R1', 764],
                        ['PT', 654],
                        ['TW', 640],
                        ['RO', 526],
                        ['NZ', 408],
                        ['FI', 395],
                        ['BG', 338],
                        ['MY', 225],
                        ['DK', 222],
                        ['PH', 158],
                        ['CN', 0],
                        ['SK', 0]
                    ]
                },
                {
                    id: '1|Product S',
                    name: ['Products 2016 Product S'],
                    type: 'column',
                    data: [
                        ['US', 251742],
                        ['CA', 1045],
                        ['ZDSO', 858]
                    ]
                },
                {
                    id: '1|Product R',
                    name: ['Products 2016 Product R'],
                    type: 'column',
                    data: [
                        ['CN', 66666],
                        ['US', 39766],
                        ['KR', 29044],
                        ['IT', 24249],
                        ['DE', 22743],
                        ['AT', 5053],
                        ['ES', 3787],
                        ['FR', 3647],
                        ['NL', 3307],
                        ['GB', 2490],
                        ['GR', 2232],
                        ['BE', 1997],
                        ['PL', 1638],
                        ['V4R1', 1416],
                        ['CH', 1085],
                        ['PT', 774],
                        ['RU', 297],
                        ['V4R2', 285],
                        ['ZJC', 238],
                        ['DK', 161],
                        ['CA', 2],
                        ['AU', 0],
                        ['SE', 0]
                    ]
                },
                {
                    id: '1|Product I',
                    name: ['Products 2016 Product I'],
                    type: 'column',
                    data: [
                        ['DE', 146949],
                        ['AT', 1553],
                        ['ZDSO', 413]
                    ]
                },
                {
                    id: '1|Product J',
                    name: ['Products 2016 Product J'],
                    type: 'column',
                    data: [
                        ['DE', 31921],
                        ['US', 15013],
                        ['AU', 10433],
                        ['IN', 9649],
                        ['BE', 6520],
                        ['CH', 5730],
                        ['FR', 3834],
                        ['IT', 3493],
                        ['NL', 3152],
                        ['GB', 2499],
                        ['TW', 2485],
                        ['BR', 2394],
                        ['ES', 2267],
                        ['V4R2', 2243],
                        ['AT', 1828],
                        ['PL', 1824],
                        ['V4R4', 1380],
                        ['V4R1', 1187],
                        ['PDC', 1057],
                        ['NO', 706],
                        ['SE', 589],
                        ['KR', 506],
                        ['PT', 450],
                        ['DK', 421],
                        ['CA', 354],
                        ['HU', 328],
                        ['GR', 313],
                        ['HK', 286],
                        ['JP', 267],
                        ['BG', 217],
                        ['CZ', 200],
                        ['MX', 150],
                        ['IE', 136],
                        ['NZ', 117],
                        ['SK', 100],
                        ['FI', 97],
                        ['CY', 90],
                        ['SG', 79]
                    ]
                },
                {
                    id: '1|Product K',
                    name: ['Products 2016 Product K'],
                    type: 'column',
                    data: [
                        ['DE', 23248],
                        ['US', 22026],
                        ['IT', 12733],
                        ['GB', 8422],
                        ['FR', 4882],
                        ['CH', 4080],
                        ['KR', 3371],
                        ['CA', 3310],
                        ['RU', 2876],
                        ['BR', 2788],
                        ['CN', 2724],
                        ['BE', 2274],
                        ['PL', 2114],
                        ['NL', 1729],
                        ['AT', 1651],
                        ['SE', 1450],
                        ['V4R2', 1115],
                        ['ES', 984],
                        ['SK', 916],
                        ['NO', 833],
                        ['V4R4', 681],
                        ['AU', 637],
                        ['PT', 626],
                        ['ZA', 619],
                        ['ID', 539],
                        ['MX', 531],
                        ['HU', 487],
                        ['MY', 413],
                        ['RO', 398],
                        ['CZ', 396],
                        ['V4R1', 381],
                        ['BG', 368],
                        ['PH', 349],
                        ['IN', 327],
                        ['TW', 288],
                        ['SG', 273],
                        ['SI', 234],
                        ['GR', 211],
                        ['DK', 141],
                        ['ZJC', 135],
                        ['LT', 120],
                        ['PDC', 103],
                        ['IE', 95],
                        ['CY', 63],
                        ['FI', 47],
                        ['MT', 42]
                    ]
                },
                {
                    id: '1|Product L',
                    name: ['Products 2016 Product L'],
                    type: 'column',
                    data: [
                        ['DE', 16827],
                        ['RU', 8264],
                        ['IN', 7567],
                        ['DK', 6340],
                        ['MY', 4122],
                        ['IT', 3956],
                        ['V4R1', 3226],
                        ['AT', 2706],
                        ['ES', 2329],
                        ['MX', 2228],
                        ['KR', 1846],
                        ['TW', 1566],
                        ['BE', 1308],
                        ['NL', 1190],
                        ['V4R2', 1085],
                        ['US', 966],
                        ['CN', 832],
                        ['FR', 813],
                        ['GB', 667],
                        ['CA', 540],
                        ['ID', 454],
                        ['GR', 426],
                        ['TH', 397],
                        ['NO', 347],
                        ['HU', 330],
                        ['FI', 326],
                        ['JP', 323],
                        ['PL', 316],
                        ['PT', 294],
                        ['BG', 253],
                        ['CZ', 249],
                        ['SE', 227],
                        ['LT', 217],
                        ['PH', 60],
                        ['AU', 24]
                    ]
                }
            ]
        }
    });

    assert.strictEqual(
        chart.xAxis[0].tickPositions.length,
        20,
        'Initial category length'
    );

    chart.xAxis[0].drilldownCategory(1);
    assert.strictEqual(chart.xAxis[0].max, 52, 'Drilled category length');
});

QUnit.test('Wrong points after click on label (#12656)', function (assert) {
    var fireEvent = Highcharts.fireEvent,
        chart = Highcharts.chart('container', {
            chart: {
                type: 'column',
                inverted: true,
                events: {
                    drilldown: function () {
                        this.update({});
                    },
                    drillup: function () {
                        this.update({});
                    }
                }
            },
            xAxis: {
                type: 'category'
            },
            series: [
                {
                    name: 'Browsers',
                    data: [
                        {
                            name: 'Chrome',
                            y: 62.74,
                            drilldown: 'Chrome'
                        },
                        {
                            name: 'Firefox',
                            y: 10.57,
                            drilldown: 'Firefox'
                        },
                        {
                            name: 'Internet Explorer',
                            y: 7.23,
                            drilldown: 'Internet Explorer'
                        }
                    ]
                }
            ],
            drilldown: {
                series: [
                    {
                        name: 'Chrome',
                        id: 'Chrome',
                        data: [['v65.0', 0.1]]
                    },
                    {
                        name: 'Firefox',
                        id: 'Firefox',
                        data: [['v58.0', 1.5]]
                    },
                    {
                        name: 'Internet Explorer',
                        id: 'Internet Explorer',
                        data: [['v11.0', 6.2]]
                    }
                ]
            }
        });

    fireEvent(chart.xAxis[0].ticks[2].label.element, 'click');
    chart.drillUp();

    fireEvent(chart.xAxis[0].ticks[1].label.element, 'click');

    assert.ok(
        chart.series[0].name === 'Firefox' && chart.series[0].data[0].y === 1.5,
        'Points from Firefox should be visible (#12656).'
    );
});

QUnit.test('#14428: Update point.drilldown', assert => {
    const chart = Highcharts.chart('container', {
        series: [
            {
                type: 'column',
                data: [1, 2, 3]
            }
        ],
        drilldown: {
            series: [
                {
                    id: 'drill',
                    data: [3, 2, 1]
                }
            ]
        }
    });

    const point = chart.series[0].points[0];
    point.update({
        drilldown: 'drill'
    });
    Highcharts.fireEvent(point, 'click');

    assert.strictEqual(
        chart.series[0].points[0].y,
        3,
        'The chart should be drilled down'
    );
});

QUnit.test(
    '#14458: Drilling down 3d chart points with the same name threw',
    assert => {
        const chart = Highcharts.chart('container', {
            chart: {
                type: 'column',
                options3d: {
                    enabled: true,
                    alpha: 5,
                    beta: 5,
                    depth: 100
                }
            },
            xAxis: {
                type: 'category'
            },
            series: [
                {
                    data: [
                        {
                            y: 0,
                            name: '1'
                        },
                        {
                            y: 1,
                            name: '2',
                            drilldown: 'x'
                        }
                    ]
                }
            ],
            drilldown: {
                series: [
                    {
                        id: 'x',
                        data: [{ y: 0, name: '2' }]
                    }
                ]
            }
        });

        Highcharts.fireEvent(chart.series[0].points[1], 'click');

        assert.ok(true, 'Drilling down should not throw');
    }
);
