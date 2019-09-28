define([
        "esri/Graphic",
        "esri/geometry/Point",
    ],
    function (Graphic, Point) {

        function point(graphicsLayer, coordinates) {
            var pointGraphic = new Graphic({
                geometry: {
                    type: "point",
                    longitude: coordinates[0],
                    latitude: coordinates[1]
                },
                symbol: {
                    type: "simple-marker",
                    color: "#4682b4",
                    outline: {
                        color: [255, 255, 255],
                        width: 2
                    }
                }
            });

            graphicsLayer.graphics.add(pointGraphic)
        };

        function line(centerGeometry, alertGeometry, lineGraphicslayer) {

            // First create a line geometry (this is the Keystone pipeline)
            var polyline = {
                type: "polyline", // autocasts as new Polyline()
                paths: [
                    [centerGeometry.longitude, centerGeometry.latitude],
                    [alertGeometry.longitude, alertGeometry.latitude]
                ]
            };

            // Create a symbol for drawing the line
            var lineSymbol = {
                type: "simple-line", // autocasts as SimpleLineSymbol()
                color: [226, 119, 40],
                width: 4
            };

            var polylineGraphic = new Graphic({
                geometry: polyline,
                symbol: lineSymbol
            });

            lineGraphicslayer.graphics.add(polylineGraphic)
        }

        function addPolygonExtentToOverview(extent, graphicsLayer){
            var polygonGraphic = new Graphic({
                geometry: extent,
                symbol: {
                    type: "simple-fill", // autocasts as new SimpleFillSymbol()
                    color: [247, 247, 247, 0.1],
                    outline: {
                        // autocasts as new SimpleLineSymbol()
                        color: [255, 255, 255, 0.2],
                        width: 1
                    }
                },
                spatialReference: {
                    wkid: 4326
                }
            });

            graphicsLayer.graphics.add(polygonGraphic)

        }

        //Stuff to make public
        return {
            point: point,
            line: line,
            addPolygonExtentToOverview: addPolygonExtentToOverview
        };

    })