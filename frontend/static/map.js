"use strict";

var markersLayer = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    disableClusteringAtZoom: 12
});
// Coordinates for Heatmap
var markerCoordinates = [];
var heatLayer = null;
var userLocation = null;

// Icon style definitions
var centerIcon = L.MakiMarkers.icon({icon: "circle", color: "#0072C6", size: "l"});
var newFeedbackIcon = L.MakiMarkers.icon({icon: "circle", color: "#FFC61E", size: "l"});
var feedbackIconOpen = L.MakiMarkers.icon({icon: "circle", color: "#D4251C", size: "m"});
var feedbackIconClosed = L.MakiMarkers.icon({icon: "circle", color: "#16A427", size: "m"});

var HelsinkiCoord = {lat: 60.17067, lng: 24.94152};

var map = initMap();
// Localisation initiation for datepickers
moment.locale('fi');

function defaultQuery() {
    // Initial query is the same than the attributes in the sidebar
    // I.e. all open feedback from one year ago until the current date 
    var params = {};

    var start_date = moment().subtract(12, 'months').toISOString();
    params["start_date"] = start_date;

    var end_date = moment().toISOString();
    params["end_date"] = end_date;

    params["status"] = "open";

    getData(params, true);
}

function initMap() {
    // Bounds from Helsinki's Servicemap code (https://github.com/City-of-Helsinki/servicemap/)
    var bounds = L.bounds(L.point(-548576, 6291456), L.point(1548576, 8388608));

    var crs = function () {
        var bounds, crsName, crsOpts, originNw, projDef;
        crsName = 'EPSG:3067';
        projDef = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
        bounds = L.bounds(L.point(-548576, 6291456), L.point(1548576, 8388608));
        originNw = [bounds.min.x, bounds.max.y];
        crsOpts = {
            resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
            bounds: bounds,
            transformation: new L.Transformation(1, -originNw[0], -1, originNw[1])
        };
        return new L.Proj.CRS(crsName, projDef, crsOpts);
    }

    var map = L.map('map', {
        crs: crs(),
        zoomControl: false,
        maxZoom: 15
    }).setView([HelsinkiCoord.lat, HelsinkiCoord.lng], 11);

    map.addControl(L.control.zoom({position: 'topright'}));

    L.tileLayer("http://geoserver.hel.fi/mapproxy/wmts/osm-sm/etrs_tm35fin/{z}/{x}/{y}.png", {
        attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        maxZoom: 18,
        continuousWorld: true,
        tms: false
    }).addTo(map);

    return map;
}

// Takes mode parameter. 1 == main map, 2 == feedback form map etc. Only 2 used now.
function addLegend(mode) {
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "map-legend");
        div.innerHTML += "<h5 class='text-center' style='margin: 3px 0px'>Selite</h5>"
        div.innerHTML += "<i style='background: #D4251C'></i>" + "Avoin palaute<br>";
        div.innerHTML += "<i style='background: #16A427'></i>" + "Suljettu palaute<br>";
        div.innerHTML += "<i style='background: #0072C6'></i>" + "Sijaintisi<br>";
        if (mode == 2) {
            div.innerHTML += "<i style='background: #FFC61E'></i>" + "Uusi palaute<br>";
        }
        return div;
    }.bind(this);

    legend.addTo(map);
}

function clearMarkers() {
    // Coordinates for Heatmap
    if (markerCoordinates.length > 0) {
        markerCoordinates.length = 0;
    }

    if (heatLayer) {
        map.removeLayer(heatLayer);
    }

    markersLayer.clearLayers();
}

function getData(params, markersVisible, heatmapVisible, onSuccess) {
    $.getJSON("/api/v1/requests.json/?", params, function (data) {
        clearMarkers();

        $.each(data, function (key, feedback) {
            var popupOptions =
                {
                    'maxWidth': '250',
                    'maxHeight': '250',
                    'className' : 'custom',
                    'autoPanPadding': L.point(10, 25)
                }

            // Generate popup-window content
            var popupContent = "";

            popupContent += "<h4 id=\"feedback_title\"></h4>" +
                "<div id=\"feedback_requested_datetime\"></div>" +
                "<p id=\"feedback_description\"></p>" +
                "<a id=\"feedback_details\" href=\"\"></a>";

            // Initiate marker of feedback
            var marker = L.marker([feedback.lat, feedback.long]).bindPopup(popupContent, popupOptions).addTo(markersLayer);
            marker.feedback = feedback;
            markerCoordinates.push([feedback.lat, feedback.long]);
            // Assign colour to marker based on status
            if (feedback.status === "open") {
                marker.setIcon(feedbackIconOpen);
            }
            else {
                marker.setIcon(feedbackIconClosed);
            }

            // On click, fill the popup with feedback details
            marker.on('click', function (e) {
                // Truncate feedback details so that they fit the popup window
                var title = e.target.feedback.title;
                title = truncate_string(title, 30);

                $('#feedback_title').text(title);
                $('.feedback_list_vote_badge').text(e.target.feedback.vote_counter);
                $('.feedback_list_vote_icon').attr("id", e.target.feedback.service_request_id);
                var datetime = moment(e.target.feedback.requested_datetime).fromNow();
                $('#feedback_requested_datetime').text("Lisätty: " + datetime);

                var desc = e.target.feedback.description;
                desc = truncate_string(desc, 170);

                $('#feedback_description').text(desc);
                var feedback_url = "/feedbacks/" + e.target.feedback.id;
                $('#feedback_details').text("Lisää");
                $('#feedback_details').attr("href", feedback_url);
                $('#feedback_info').css("visibility", "visible");
            });
        });
    }).always(function () {
        if (onSuccess) {
            onSuccess();
        }
    }).done(function () {
        if (markersVisible) {
            showMarkers(markersVisible);
        }

        if (heatmapVisible) {
            showHeatmap(heatmapVisible);
        }
    });
}

function truncate_string(string, max_length) {
    if(string.length > max_length) {
        return string.substring(0,max_length) + "...";
    }

    return string;
}

function getUserLocation(e) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var newLocation = L.latLng(position.coords.latitude, position.coords.longitude);
            if (userLocation) {
                userLocation.setLatLng(newLocation);
            }
            else {
                userLocation = new L.marker(newLocation, {icon: centerIcon}).addTo(map);
            }
            map.panTo(newLocation);
        }.bind(this));
    }
    else {
        console.error("Geolocation is not supported by this browser.");
    }
}

function showMarkers(show) {
    if (show) {
        map.addLayer(markersLayer);
    }
    else {
        if (map.hasLayer(markersLayer)) {
            map.removeLayer(markersLayer);
        }
    }
}

function showHeatmap(show) {
    if (heatLayer) {
        map.removeLayer(heatLayer);
    }

    if (show) {
        heatLayer = L.heatLayer(markerCoordinates, {
            minOpacity: 0.4,
            maxZoom: 18
        }).addTo(map);
    }
}

function onToggleMenu() {
    $("#sidebar-wrapper").toggleClass("toggled");
    $("#toggleButtonContainer").toggleClass("toggled");
    $("#toggleButtonIcon").toggleClass("glyphicon-chevron-left glyphicon-chevron-right");
}