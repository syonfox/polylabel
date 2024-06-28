
//Taken and consendes from turf

// Constants for spherical calculations
const PI_OVER_180 = Math.PI / 180;
const EARTH_RADIUS = 6371; // Earth's average radius in kilometers

/**
 * Calculates the total area of a GeoJSON object.
 * @param {Object} geojson The GeoJSON object to calculate area from.
 * @param {Number} radius Optional. Earth's radius in kilometers. Defaults to Earth's average radius.
 * @returns {Number} The total area in square kilometers.
 */
function geomArea(geojson, radius = EARTH_RADIUS) {
    let totalArea = 0;

    // Iterate over each geometry in the GeoJSON object
    geomEach(geojson, function(geometry) {
        // Calculate area based on geometry type
        switch (geometry.type) {
            case "Polygon":
                totalArea += polygonArea(geometry.coordinates, radius);
                break;
            case "MultiPolygon":
                geometry.coordinates.forEach(coords => {
                    totalArea += polygonArea(coords, radius);
                });
                break;
            default:
                // Ignore other geometry types (Point, LineString, etc.)
                break;
        }
    });

    return totalArea;
}

/**
 * Calculates the area of a polygon using its coordinates.
 * @param {Array} coords The coordinates of the polygon.
 * @param {Number} radius Earth's radius in kilometers for spherical calculations.
 * @returns {Number} The area of the polygon in square kilometers.
 */
function polygonArea(coords, radius) {
    let total = 0;

    if (coords && coords.length > 0) {
        coords.forEach(ring => {
            total += ringArea(ring, radius);
        });
    }

    return Math.abs(total);
}

/**
 * Calculates the area of a ring (linear ring) using its coordinates.
 * @param {Array} coords The coordinates of the ring.
 * @param {Number} radius Earth's radius in kilometers for spherical calculations.
 * @returns {Number} The area of the ring in square kilometers.
 */
function ringArea(coords, radius) {
    let total = 0;
    const coordsLength = coords.length;

    if (coordsLength > 2) {
        for (let i = 0; i < coordsLength; i++) {
            const lower = coords[i];
            const middle = coords[(i + 1) % coordsLength];
            const upper = coords[(i + 2) % coordsLength];

            const lowerX = lower[0] * PI_OVER_180;
            const middleY = middle[1] * PI_OVER_180;
            const upperX = upper[0] * PI_OVER_180;

            total += (upperX - lowerX) * Math.sin(middleY);
        }

        return total * (radius * radius / 2);
    }

    return 0;
}

/**
 * Iterates over each geometry in a GeoJSON object and applies a callback function.
 * @param {Object} geojson The GeoJSON object to iterate over.
 * @param {Function} callback Function to be called for each geometry.
 */
function geomEach(geojson, callback) {
    const isFeatureCollection = geojson.type === "FeatureCollection";
    const isFeature = geojson.type === "Feature";

    if (isFeatureCollection) {
        geojson.features.forEach(feature => {
            if (feature.geometry) {
                callback(feature.geometry);
            }
        });
    } else if (isFeature) {
        if (geojson.geometry) {
            callback(geojson.geometry);
        }
    } else {
        callback(geojson);
    }
}
