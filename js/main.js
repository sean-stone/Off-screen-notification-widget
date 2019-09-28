require([
    "esri/Map",
    "esri/Graphic",
    "esri/views/MapView",
    "esri/geometry/Circle",
    "esri/geometry/geometryEngine",
    "esri/layers/GraphicsLayer",
    "esri/geometry/support/webMercatorUtils",
    "./js/modules/addGraphics.js"
], function (Map, Graphic, MapView, Circle, geometryEngine, GraphicsLayer, webMercatorUtils, addGraphics) {

    /*
        This is a small proof of concept application to showcase a widget that can handle objects moving off screen.
    */


    // full screen map
    var mainMap = new Map({
        basemap: "gray-vector"
    });

    // overview map (widget map)
    var overviewMap = new Map({
        basemap: "dark-gray-vector"
    });

    // full screen view
    var mainView = new MapView({
        container: "viewDiv",
        map: mainMap,
        center: [-0.7986251, 51.8175963],
        zoom: 10
    });

    // widget view
    var overviewView = new MapView({
        container: "overviewDiv",
        map: overviewMap
    });

    // remove any ui elements from ui widget
    overviewView.ui.components = []; // Remove the default widgets

    // creating graphics layers
    var centerPoint = new GraphicsLayer();
    var alertPoints = new GraphicsLayer();
    var alertPointsB = new GraphicsLayer();
    var extentGraphics = new GraphicsLayer();
    var circleGraphics = new GraphicsLayer();

    mainMap.add(alertPoints);
    overviewMap.addMany([extentGraphics, alertPointsB]);

    overviewView.when(function () {
        document.getElementById("center-point").addEventListener("click", goToPoint);

        // animating point
        var num = 0 // frame counter

        // starting point a and b for animating point
        var pointA = [-0.7986251, 51.8175963];
        var pointB = [-0.7936200, 51.8171900];

        // in order to animate it, we work with the difference between the points.
        var longDifference = pointB[0] - pointA[0];
        var lattDifference = pointB[1] - pointA[1];

        function updateLocation(a, b) {
            pointA = b;
            pointB = [a[0] + (Math.random() - 0.5) / 2, a[1] + (Math.random() - 0.5) / 2];
            longDifference = pointB[0] - pointA[0];
            lattDifference = pointB[1] - pointA[1];
        }

        requestAnimationFrame(animatePoint)

        function animatePoint() {
            alertPoints.graphics.removeAll();
            alertPointsB.graphics.removeAll();

            addPoints(pointA[0] + (longDifference / 500) * num, pointA[1] + (lattDifference / 500) * num);

            if (num < 500) {
                num ++
            } else {
                updateLocation(pointA, pointB);
                num = 0
            }
            updateOverview();
            requestAnimationFrame(animatePoint);
        }

        function addPoints(long, lat) {
            addGraphics.point(alertPoints, [long, lat])
            addGraphics.point(alertPointsB, [long, lat])
        };

        function goToPoint() {
            mainView.goTo(alertPoints.graphics.items[0].geometry)
        }
        // finish setup of animating points

        function updateOverview() {
            overviewView.extent = mainView.extent; // so it automatically updates
            overviewView.rotation = mainView.rotation; // so it automatically updates
            overviewView.scale += overviewView.scale; // we're zooming out a bit

            createCircle(overviewView.extent.height / 2, overviewView.center);
        }

        function createCircle(widthInKM, center) {
            var pointGraphic = new Graphic({
                geometry: {
                    type: "point",
                    longitude: center.longitude,
                    latitude: center.latitude
                },
                spatialReference: {
                    wkid: 4326
                }
            });

            var circle = new Circle({
                center: center,
                radius: Math.round(widthInKM) //widthInKM

            });

            var path = []

            for (i = 0; i < circle.rings[0].length; i++) {
                path.push(convertxy(circle.rings[0][i][0], circle.rings[0][i][1]))
            }

            var polygonGraphic = new Graphic({
                geometry: {
                    type: "polygon",
                    rings: [
                        path
                    ]
                },
                symbol: {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: [227, 139, 79, 0.5],
                    outline: {
                        // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255],
                        width: 1
                    }
                },
                spatialReference: {
                    wkid: 4326
                }
            });

            // clear graphics
            circleGraphics.graphics.removeAll();
            centerPoint.graphics.removeAll();

            centerPoint.graphics.add(pointGraphic);
            circleGraphics.graphics.add(polygonGraphic);

            addPointToMinimap();
        };

        function addPointToMinimap() {
            // if the geometry SHOULD be show on the edge of the div...
            if (!geometryEngine.contains(circleGraphics.graphics.items[0].geometry, alertPoints.graphics.items[0].geometry)) {
                document.getElementById("center-point").style.display = "block";
                var p1 = {
                    x: alertPoints.graphics.items[0].geometry.longitude,
                    y: alertPoints.graphics.items[0].geometry.latitude
                };

                var p2 = {
                    x: overviewView.extent.center.longitude,
                    y: overviewView.extent.center.latitude
                };

                // angle in degrees
                var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
                document.getElementById("center-point").style.transform = "rotate(" + (180 - angleDeg + overviewView.rotation) + "deg)";
            } else {
                document.getElementById("center-point").style.display = "none";
            }
        }
    });

    //converts x y to long latt
    function convertxy(x, y) {
        return webMercatorUtils.xyToLngLat(x, y)
    }

});