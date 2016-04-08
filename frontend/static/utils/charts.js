
        function humanize(value) {
            return Math.floor(value / 86400) + 'pv ' + Math.floor((value % 86400) / 3600) + 'h';
        };

        var opts = {
            lines: 13 // The number of lines to draw
            , length: 28 // The length of each line
            , width: 14 // The line thickness
            , radius: 42 // The radius of the inner circle
            , scale: 1 // Scales overall size of the spinner
            , corners: 1 // Corner roundness (0..1)
            , color: '#000' // #rgb or #rrggbb or array of colors
            , opacity: 0.25 // Opacity of the lines
            , rotate: 0 // The rotation offset
            , direction: 1 // 1: clockwise, -1: counterclockwise
            , speed: 2 // Rounds per second
            , trail: 60 // Afterglow percentage
            , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
            , zIndex: 2e9 // The z-index (defaults to 2000000000)
            , className: 'spinner' // The CSS class to assign to the spinner
            , top: '50%' // Top position relative to parent
            , left: '50%' // Left position relative to parent
            , shadow: false // Whether to render a shadow
            , hwaccel: false // Whether to use hardware acceleration
            , position: 'absolute' // Element positioning
        }
        var target = document.getElementById('serviceStatistics');
        var spinner = new Spinner(opts).spin(target);


        $.getJSON("/api/v1/statistics/services/", function (data) {
            var services = ['x'];
            var total = ['kaikki'];
            var closed = ['suljetut'];
            var fixing_time_in_hours = ['Korjausaika päivissä ja tunneissa'];
            $.each(data, function (key, item) {
                services.push(item.service_name);
                total.push(item.total);
                closed.push(item.closed);
                fixing_time_in_hours.push(item.median_sec)
            });

            c3.generate({
                bindto: '#serviceStatistics',
                data: {
                    x: 'x',
                    columns: [
                        services,
                        total,
                        closed
                    ],
                    type: 'bar',
                },
                axis: {
                    x: {
                        type: 'category', // this needed to load string x value
                        tick: {
                            rotate: 75,
                            multiline: false
                        },
                        height: 130
                    }
                }
            });

            c3.generate({
                bindto: '#timeStatistics',
                data: {
                    x: 'x',
                    columns: [
                        services,
                        fixing_time_in_hours
                    ],
                    type: 'bar',
                    labels: {
                        format: humanize
                    }
                },
                axis: {
                    y: {
                        tick: {
                            format: function humanize(value) {
                                return Math.round(value / 86400);
                            }
                        }
                    },
                    x: {
                        type: 'category', // this needed to load string x value
                        tick: {
                            rotate: 75,
                            multiline: false
                        },
                        height: 130
                    }
                },
                tooltip: {
                    format: {
                        value: humanize
                    }
                }
            });
        });
        $.getJSON("/api/v1/statistics/agencies/", function (data) {
            var agencies = ['x'];
            var total = ['kaikki'];
            var closed = ['suljetut'];
            $.each(data, function (key, item) {
                if (key > 9) return;
                agencies.push(item.agency_responsible);
                total.push(item.total);
                closed.push(item.closed);
            });
            c3.generate({
                bindto: '#agencyStatistics',
                padding: {
                    right: 12,
                },
                data: {
                    x: 'x',
                    columns: [
                        agencies,
                        total,
                        closed
                    ],
                    type: 'bar',
                },
                zoom: {
                    enabled: true,
                    rescale: true
                },
                axis: {
                    x: {
                        type: 'category',// this needed to load string x value
                        tick: {
                            rotate: 75,
                            multiline: false
                        },
                        height: 160
                    }
                }
            });
        });
