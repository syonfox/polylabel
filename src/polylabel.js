// included here becuse dont want to need a dependancy. and its tiny ;)
class TinyQueue {
    constructor(data = [], compare = defaultCompare) {
        this.data = data;
        this.length = this.data.length;
        this.compare = compare;

        if (this.length > 0) {
            for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }

    push(item) {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    }

    pop() {
        if (this.length === 0) return undefined;

        const top = this.data[0];
        const bottom = this.data.pop();
        this.length--;

        if (this.length > 0) {
            this.data[0] = bottom;
            this._down(0);
        }

        return top;
    }

    peek() {
        return this.data[0];
    }

    _up(pos) {
        const {data, compare} = this;
        const item = data[pos];

        while (pos > 0) {
            const parent = (pos - 1) >> 1;
            const current = data[parent];
            if (compare(item, current) >= 0) break;
            data[pos] = current;
            pos = parent;
        }

        data[pos] = item;
    }

    _down(pos) {
        const {data, compare} = this;
        const halfLength = this.length >> 1;
        const item = data[pos];

        while (pos < halfLength) {
            let left = (pos << 1) + 1;
            let best = data[left];
            const right = left + 1;

            if (right < this.length && compare(data[right], best) < 0) {
                left = right;
                best = data[right];
            }
            if (compare(best, item) >= 0) break;

            data[pos] = best;
            pos = left;
        }

        data[pos] = item;
    }
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}


//########################################################################################
// nieave approach one use the bbox center
//########################################################################################
// AABBColision.js

class Rectangle {
    static fromXYWH(x, y, width, height) {
        return new Rectangle(x, y, width, height);
    }
    static fromAABB(ax,ay, bx, by) {
        const x = Math.min(ll1.lon, ll2.lon);
        const y = Math.min(ll1.lat, ll2.lat);
        const width = Math.abs(ll1.lon - ll2.lon);
        const height = Math.abs(ll1.lat - ll2.lat);
        return new Rectangle(x, y, width, height);
    }
    static fromLatLon(ll1, ll2) {
        return Rectangle.fromAABB(ll1.lat, ll1.lon, ll2.lat, ll2.lon);
    }
    static fromLatLng(ll1, ll2) {
        return Rectangle.fromAABB(ll1.lat, ll1.lng, ll2.lat, ll2.lng);
    }

    constructor(x, y, width, height, mode='xywh') {
        if(mode === 'aabb') {

        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    getArea() {
        return this.width * this.height;
    }
    //https://stackoverflow.com/a/30316500/4530300 comments ;)
    //Haversine Formula in Javascript
    _distKM(lat1,lon1,lat2,lon2){
        let a=Math;
        let r=(lat2-lat1)*a.PI/180;
        let c=(lon2-lon1)*a.PI/180;
        let e=a.sin(r/2)*a.sin(r/2) +a.cos(lat1*a.PI/180)*a.cos(lat2*a.PI/180)*a.sin(c/2)*a.sin(c/2);
        let d=2*a.atan2(a.sqrt(e),a.sqrt(1-e))*6371;
        return d;
    }

    getTopLeft() {
        return { x: this.x, y: this.y };
    }

    getTopRight() {
        return { x: this.x + this.width, y: this.y };
    }

    getBottomLeft() {
        return { x: this.x, y: this.y + this.height };
    }

    getBottomRight() {
        return { x: this.x + this.width, y: this.y + this.height };
    }

    static isColliding(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    }

    static resolveCollision(rect1, rect2) {
        if (!AABB.isColliding(rect1, rect2)) {
            return null; // No collision
        }

        const area1 = rect1.getArea();
        const area2 = rect2.getArea();

        return area1 > area2 ? rect1 : rect2;
    }

    static fromLatLon(ll1, ll2) {
        const x = Math.min(ll1.lon, ll2.lon);
        const y = Math.min(ll1.lat, ll2.lat);
        const width = Math.abs(ll1.lon - ll2.lon);
        const height = Math.abs(ll1.lat - ll2.lat);

        return new AABB(x, y, width, height);
    }
}


//########################################################################################
// nieave approach 2 user the polygon centroid
//########################################################################################

function computeGeoJSONCentroids(featureCollection) {
    function computeCentroid(latlngs) {
        let xSum = 0, ySum = 0, areaSum = 0, n = latlngs.length;
        if (n === 1) return latlngs[0]; // Early out if length is one
        if (n === 2) {
            // For two points, return the midpoint
            return [(latlngs[0][0] + latlngs[1][0]) / 2, (latlngs[0][1] + latlngs[1][1]) / 2];
        }
        for (let i = 0; i < n; i++) {
            let lat1 = latlngs[i][1];
            let lng1 = latlngs[i][0];
            let lat2 = latlngs[(i + 1) % n][1];
            let lng2 = latlngs[(i + 1) % n][0];

            let a = lat1 * lng2 - lat2 * lng1; // Shoelace formula part
            xSum += (lat1 + lat2) * a; // Summing up x-coordinates
            ySum += (lng1 + lng2) * a; // Summing up y-coordinates
            areaSum += a; // Summing up areas
        }

        let area = areaSum / 2;
        let cx = xSum / (6 * area); // Centroid x-coordinate
        let cy = ySum / (6 * area); // Centroid y-coordinate

        return [cy, cx]; // Return as [latitude, longitude]
    }

    /*
    Mathematical proof for centroid:
    The centroid (Cx, Cy) of a simple polygon with vertices (x0, y0), (x1, y1), ..., (xn-1, yn-1) is given by:

    Cx = (1/6A) * Σ (xi + xi+1)(xi*yi+1 - xi+1*yi)
    Cy = (1/6A) * Σ (yi + yi+1)(xi*yi+1 - xi+1*yi)

    where A is the area of the polygon, calculated as:
    A = (1/2) * Σ (xi*yi+1 - xi+1*yi)

    This is derived from the shoelace formula for the area of a polygon and averaging the coordinates weighted by the area.
    */

    function computeClusterCentroid(centroids) {
        let xSum = 0, ySum = 0, n = centroids.length;

        centroids.forEach(centroid => {
            xSum += centroid[1];
            ySum += centroid[0];
        });

        return [ySum / n, xSum / n];
    }

    function processGeometry(geometry) {
        let type = geometry.type;
        let coordinates = geometry.coordinates;
        let centroids = [];
        console.log(type);
        if (type === 'Polygon') {
            let latlngs = coordinates[0]; // the exterior ring of the polygon. https://geojson.org/geojson-spec.html#polygon
            centroids.push(computeCentroid(latlngs));
        } else if (type === 'MultiPolygon') {
            coordinates.forEach(polygon => {
                let latlngs = polygon[0]; // like above
                centroids.push(computeCentroid(latlngs));
            });

        } else if (type === 'MultiLineString') {
            coordinates.forEach(line => {
                centroids.push(computeCentroid(line));
            });
        } else if (type === 'GeometryCollection') {
            geometry.geometries.forEach(geometry => {
                centroids.push(processGeometry(geometry).centroid)
            });
        } else if (type === 'LineString') {
            centroids.push(computeCentroid(coordinates));
        } else if (type === 'Point') {
            centroids.push([coordinates[1], coordinates[0]]);
        } else if (type === 'MultiPoint') {
            coordinates.forEach(point => {
                centroids.push([point[1], point[0]]);
            });

        }

        let centroid = computeCentroid(centroids)

        return {centroids, centroid};
    }

    let allCentroids = [];

    function proccessFeature(feature) {
        let {centroids, centroid} = processGeometry(feature.geometry);
        allCentroids.push(centroid);
    }

    if(featureCollection.type === "FeatureCollection") {
        featureCollection.features.forEach(proccessFeature);
    } else {
        console.warn("You have passed a single feature")
        proccessFeature(featureCollection)
    }


    return allCentroids
}


//########################################################################################
// cool solution to use the polw of inaccessibility aka the point of maximum distance from any edge
//########################################################################################



function polylabel(polygon, precision, debug, centroidWeight) {
    precision = precision || 1.0;
    centroidWeight = centroidWeight || 0;

    // find the bounding box of the outer ring
    var minX, minY, maxX, maxY;
    for (var i = 0; i < polygon[0].length; i++) {
        var p = polygon[0][i];
        if (!i || p[0] < minX) minX = p[0];
        if (!i || p[1] < minY) minY = p[1];
        if (!i || p[0] > maxX) maxX = p[0];
        if (!i || p[1] > maxY) maxY = p[1];
    }

    var width = maxX - minX;
    var height = maxY - minY;
    var cellSize = Math.min(width, height);
    var h = cellSize / 2;

    if (cellSize === 0) {
        var degeneratePoleOfInaccessibility = [minX, minY];
        degeneratePoleOfInaccessibility.distance = 0;
        return degeneratePoleOfInaccessibility;
    }

    // a priority queue of cells in order of their "potential" (max distance to polygon)
    var cellQueue = new TinyQueue(undefined, compareMax);

    var centroidCell = getCentroidCell(polygon);

    // take centroid as the first best guess
    var bestCell = centroidCell;

    // cover polygon with initial cells
    for (var x = minX; x < maxX; x += cellSize) {
        for (var y = minY; y < maxY; y += cellSize) {
            cellQueue.push(new Cell(x + h, y + h, h, polygon, centroidCell));
        }
    }

    // the fitness function to be maximized
    function fitness(cell) {
        return cell.d - cell.distanceToCentroid * centroidWeight;
    }

    // special case for rectangular polygons
    var bboxCell = new Cell(minX + width / 2, minY + height / 2, 0, polygon, centroidCell);
    if (fitness(bboxCell) > fitness(bestCell)) bestCell = bboxCell;

    var numProbes = cellQueue.length;

    while (cellQueue.length) {
        // pick the most promising cell from the queue
        var cell = cellQueue.pop();

        // update the best cell if we found a better one
        if (fitness(cell) > fitness(bestCell)) {
            bestCell = cell;
            if (debug) console.log('found best %d after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes);
        }

        // do not drill down further if there's no chance of a better solution
        if (cell.max - bestCell.d <= precision) continue;

        // split the cell into four cells
        h = cell.h / 2;
        cellQueue.push(new Cell(cell.x - h, cell.y - h, h, polygon, centroidCell));
        cellQueue.push(new Cell(cell.x + h, cell.y - h, h, polygon, centroidCell));
        cellQueue.push(new Cell(cell.x - h, cell.y + h, h, polygon, centroidCell));
        cellQueue.push(new Cell(cell.x + h, cell.y + h, h, polygon, centroidCell));
        numProbes += 4;
    }

    if (debug) {
        console.log('num probes: ' + numProbes);
        console.log('best distance: ' + bestCell.d);
    }

    var poleOfInaccessibility = [bestCell.x, bestCell.y];
    poleOfInaccessibility.distance = bestCell.d;
    return poleOfInaccessibility;
}

function compareMax(a, b) {
    return b.max - a.max;
}

function Cell(x, y, h, polygon, centroidCell) {
    this.x = x; // cell center x
    this.y = y; // cell center y
    this.h = h; // half the cell size
    this.d = pointToPolygonDist(x, y, polygon); // distance from cell center to polygon
    this.distanceToCentroid = centroidCell ? pointToPointDist(this, centroidCell) : 0;
    this.max = this.d + this.h * Math.SQRT2; // max distance to polygon within a cell
}

// distance between two cells
function pointToPointDist(cellA, cellB) {
    var dx = cellB.x - cellA.x;
    var dy = cellB.y - cellA.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x, y, polygon) {
    var inside = false;
    var minDistSq = Infinity;

    for (var k = 0; k < polygon.length; k++) {
        var ring = polygon[k];

        for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
            var a = ring[i];
            var b = ring[j];

            if ((a[1] > y !== b[1] > y) && (x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])) inside = !inside;

            minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b));
        }
    }

    return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq);
}

// get polygon centroid
function getCentroidCell(polygon) {
    var area = 0;
    var x = 0;
    var y = 0;
    var points = polygon[0];

    for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        var a = points[i];
        var b = points[j];
        var f = a[0] * b[1] - b[0] * a[1];
        x += (a[0] + b[0]) * f;
        y += (a[1] + b[1]) * f;
        area += f * 3;
    }
    if (area === 0) return new Cell(points[0][0], points[0][1], 0, polygon);
    return new Cell(x / area, y / area, 0, polygon);
}

// get squared distance from a point to a segment
function getSegDistSq(px, py, a, b) {

    var x = a[0];
    var y = a[1];
    var dx = b[0] - x;
    var dy = b[1] - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = b[0];
            y = b[1];

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

polylabel.TinyQueue = TinyQueue;
polylabel.Rectangle = Rectangle;

polylabel.computeGeoJSONCentroids = computeGeoJSONCentroids;
//########################################################################################
// final solution to stretch the polygon so that the label is best placed within an
// ellipse of inaccessibility therefore giving a nice placement.
//########################################################################################


/**
 * Thi effectively stretches the input polygon in order to calculate the ellipse of inaccessibility.
 *  note precision may be effected but should be mostly good enough.
 * @param rings - array of polygon rings (first is outer rest is inner)
 * @param ratio -
 * @return {*[]}
 */
polylabel.stretched = (rings, ratio=1.5) => {
    const polygon = [];
    for (const ring of rings) { // stretch the input
        const newRing = [];
        for (const [x, y] of ring) newRing.push([x / ratio, y]);
        polygon.push(newRing);
    }
    const result = polylabel(polygon, 0.5);
    result[0] *= ratio; // stretch the result back
    result.distance *= ratio;
    return result;
}

/**
 *
 * @param geometry - an geojson geometry
 * @return {*[]}
 */
polylabel.getLabelPos = (geometry, ratio = 1.5) => {
    let pos;
    if (geometry.type === 'MultiPolygon') {
        let maxDist = 0; // for multipolygons, pick the polygon with most available space
        for (const polygon of geometry.coordinates) {
            const p = polylabel.stretched(polygon, ratio);
            if (p.distance > maxDist) {
                pos = p;
                maxDist = p.distance;
            }
        }
    } else {
        pos = polylabel.stretched(geometry.coordinates, ratio);
    }
    return pos;
}

// export default polylabel;
// module.exports = polylabel;
//ensure there is one whitspace line ;)
