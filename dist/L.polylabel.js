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
/**
 * class L.Labeler()
 *
 * extends L.GeoJSON
 * automatically labels features
 *
 * MIT License
 * Copyright (c) 2022 Gede Mátyás
 * https://github.com/samanbey/leaflet-labeler/tree/master
 */

// let L;
L.polylabelPrototype = {
    options: {
        labelProp: 'name',
        labelPos: 'auto',
        labelFunc: null,
        gap: 2,
        labelPane: 'tooltipPane',
        viewFilter: null,
        labelStyle: {},
        changingMarker: false,
        stretchRatio: 1.5, // less then one bias for 'tall' labels greater then on for 'long'
    },

    _labels: {},
    _visibleLayers: [],
    _posOrder: ['cc', 'r', 'l'],

    onAdd(map) {

        // these are the leaflet default animation setting we apply these to the labels
        this._zoomAnimated = map._zoomAnimated;
        this.__zoomDuration = 250;
        this.__zoomAnimation = "cubic-bezier(0,0,0.25,1)"
        //todo we should realy update labels while animation is hapening so we are ready to display after the fact.


        if (this.options.labelPos != 'auto')
            this._posOrder = [this.options.labelPos];

        L.GeoJSON.prototype.onAdd.call(this, map);
        // create label priority list
        this._priOrder = [];
        this._viewFilter = this.options.viewFilter;
        for (let l in this._labels) {
            let lab = this._labels[l]
            this._priOrder.push({id: l, p: lab.priority});
        }
        this._priOrder.sort((a, b) => (b.p - a.p));
        //console.log(this._priOrder);
        this._container = L.DomUtil.create('div', '', map.getPane(this.options.labelPane));
        this._update();
        return;
    },

    getEvents() {
        const events = {
            zoomend: this._update,
            moveend: this._update,
            viewreset: this._update,
        }
        if (this._zoomAnimated)
            events.zoomanim = this._zoomAnim;

        return events;
    },

    _addOffset(pos, labelPos, gap, label) {
        /** calculates the label position relative to the anchor point */
        let ls = label.span;
        switch (labelPos) {
            case 'r':
                pos.x += label.size[0] - label.anchor[0] + gap;
                pos.y += label.size[1] / 2 - label.anchor[1] - ls.clientHeight / 2;
                break;
            case 'l':
                pos.x -= label.anchor[0] + gap + ls.clientWidth;
                pos.y += label.size[1] / 2 - label.anchor[1] - ls.clientHeight / 2;
                break;
            case 'cc':
                pos.x -= label.anchor[0] + ls.clientWidth / 2;
                pos.y -= label.anchor[1] + ls.clientHeight / 2;
                break;
            default:
                pos.x = label.anchor[0];
                pos.y = label.anchor[1];
        }
    },

    /*  _zoomAnim(e) {
          for (let l in this._labels) {
              let lab = this._labels[l];
              let ls = lab.span;
              if (ls) {
                  let pos = this._map._latLngToNewLayerPoint(lab.latLng, e.zoom, e.center);
                  this._addOffset(pos, lab.pos, this.options.gap, lab);
                  ls.style.top = `${pos.y}px`;
                  ls.style.left = `${pos.x}px`;
              }
          }
      },*/

    // A function called when zoom animation is trigered.
    _zoomAnim(e) {
        this._zoom_trigger_time = Date.now()
        // console.log("zooming")
        // this.__hasUpdateded = false;
        // this._update();
        // return;

        // Calculate new positions for all labels
        // const newPositions = {};
        for (let l in this._labels) {
            let lab = this._labels[l];
            let ls = lab.span;
            if (ls) {
                let pos = this._map._latLngToNewLayerPoint(lab.latLng, e.zoom, e.center);
                this._addOffset(pos, lab.pos, this.options.gap, lab);
                // newPositions[l] = pos;
                if (this._zoomAnimated)  // Smooth animation using CSS transitions or requestAnimationFrame
                    ls.style.transition = `top ${this.__zoomDuration}ms ${this.__zoomAnimation}, left ${this.__zoomDuration}ms ${this.__zoomAnimation}`;
                ls.style.top = `${pos.y}px`;
                ls.style.left = `${pos.x}px`;
            }
        }
    },


    _intersects(bb1, bb2) {
        // checks if two bounding boxes intersect
        let b1 = L.bounds([[bb1.x1, bb1.y1], [bb1.x2, bb1.y2]]),
            b2 = L.bounds([[bb2.x1, bb2.y1], [bb2.x2, bb2.y2]]);
        return b1.intersects(b2);
    },

    addData(geojson) {
        L.GeoJSON.prototype.addData.call(this, geojson);
    },

    //internal function called when leaflet trigers update( after zoomend/ panend/ animation)
    _update() {
        // if(this.__hasUpdateded && this._zoomAnimated) {
        //     return;
        // } else {
        //     this.__hasUpdateded = true;
        // }
        this._update_trigger_time = Date.now()

        this._last_zoom_delta = this._update_trigger_time - this._zoom_trigger_time;
        console.log('updating, ms delta since zoom = ', this._last_zoom_delta);
        let t1 = Date.now();


        this._container.innerHTML = '';
        this._bbs = []; // array of bounding boxes.
        let bb;
        L.DomUtil.toFront(this._container);
        let maptr = this._map._panes.mapPane.style.transform.substring(12).split(', ');

        let mapx1 = -parseFloat(maptr[0]),
            mapy1 = -parseFloat(maptr[1]);

        let mapx2 = mapx1 + this._map._container.clientWidth,
            mapy2 = mapy1 + this._map._container.clientHeight;

        for (let i = 0; i < this._priOrder.length; i++) {
            let l = this._priOrder[i].id;
            let lab = this._labels[l];
            // use viewFilter if there is one/
            if (this._viewFilter)
                if (lab.layer && !this._viewFilter(lab.layer.feature)) {
                    lab.layer.remove();
                    continue;
                }
            // if `changingMarker` is true, markers may change after loading the layer, so they should be recreated on update
            if (this.options.changingMarker && this.options.pointToLayer) {
                let nl = this.options.pointToLayer(lab.layer.feature, lab.latLng);
                nl.feature = lab.layer.feature;
                if (lab.layer._map) {
                    lab.layer.remove();
                    nl.addTo(map);
                    delete lab.layer;
                }
                lab.layer = nl;
                lab.anchor = lab.layer.getIcon ? lab.layer.getIcon().options.iconAnchor : [lab.layer.getRadius(), lab.layer.getRadius()];
                lab.size = lab.layer.getIcon ? lab.layer.getIcon().options.iconSize : [lab.layer.getRadius() * 2, lab.layer.getRadius() * 2];
            }

            let pos = this._map.latLngToLayerPoint(lab.latLng);
            let markerbb = {
                x1: pos.x - lab.anchor[0],
                y1: pos.y - lab.anchor[1],
                x2: pos.x - lab.anchor[0] + lab.size[0],
                y2: pos.y - lab.anchor[1] + lab.size[1]
            }
            let fits = true;
            // check icon placing conflict for point features with markers
            if (lab.size[0] > 0 && lab.size[1] > 0)
                this._bbs.some(b => {
                    if (this._intersects(b, markerbb)) {
                        fits = false;
                        return true;
                    }
                });
            let ls = L.DomUtil.create('span', 'leaflet-labeler-label', this._container);
            // set custom label style
            let st = (typeof this.options.labelStyle == 'function') ? this.options.labelStyle(lab.layer.feature) : this.options.labelStyle;
            for (let r in st)
                ls.style[r] = st[r];
            ls.style.visibility = 'hidden'; // initially hidden, in case it cannot be displayed
            lab.span = ls;
            // if label text is created by a function, it may change
            if (this.options.labelFunc)
                lab.label = this.options.labelFunc(lab.layer);
            ls.innerHTML = lab.label;
            if (fits) {
                for (let posi in this._posOrder) {
                    fits = true;
                    let lp = this._posOrder[posi];
                    let p = {...pos}; // copy position for later
                    this._addOffset(pos, lp, this.options.gap, lab);
                    bb = {
                        x1: pos.x,
                        y1: pos.y,
                        x2: pos.x + ls.clientWidth,
                        y2: pos.y + ls.clientHeight
                    }
                    if (bb.x1 > mapx2 || bb.x2 < mapx1 || bb.y1 > mapy2 || bb.y2 < mapy1) {
                        fits = false;
                        //if (lab.layer._map) console.log(lab.label+' went out of view');
                    } else
                        this._bbs.some(b => {
                            if (this._intersects(b, bb)) {
                                fits = false;
                                return true;
                            }
                        });
                    if (fits) {
                        lab.pos = lp;
                        break;
                    }
                    pos = p; // if this position did not fit, return to original marker position and try next one
                }
            }
            if (fits) {
                //if (!lab.layer._map) console.log(lab.label+' came back to view');
                this._bbs.push(bb);
                this._bbs.push(markerbb);
                lab.span.style.top = `${pos.y}px`;
                lab.span.style.left = `${pos.x}px`;
                if (!lab.layer._map)
                    lab.layer.addTo(map);
            } else {
                this._container.removeChild(lab.span);
                if (lab.geomType == 'Point')
                    lab.layer.remove();
            }
        }
        this._container.childNodes.forEach(n => n.style.visibility = ''); // set all remaining label visible
        let t2 = Date.now();
        console.log('zoom to update delta: ' + this._zoom_delta + ' ms');
        console.log('update completed in ' + ((t2 - t1)).toFixed(1) + ' ms');
        console.log('number of labels: ' + this._bbs.length / 2);
    },

    update() {
        this._update();
    },

    addLayer(layer) {
        if (this.hasLayer(layer)) {
            return this;
        }
        const id = this.getLayerId(layer);

        this._layers[id] = layer;

        layer.addEventParent(this);

        let label = this.options.labelFunc ? this.options.labelFunc(layer) : layer.feature.properties[this.options.labelProp],
            layerId = layer._leaflet_id;
        // get icon size, anchor
        let anchor = [0, 0], size = [0, 0];
        let geomType = layer.feature.geometry.type;
        // for points with an icon or a circle, get symbol size and anchor point
        if (geomType == 'Point') {
            anchor = layer.getIcon ? layer.getIcon().options.iconAnchor : [layer.getRadius(), layer.getRadius()];
            size = layer.getIcon ? layer.getIcon().options.iconSize : [layer.getRadius() * 2, layer.getRadius() * 2];
        }
        let pri = this.options.priorityFunc ? this.options.priorityFunc(layer.feature) : this.options.priorityProp ? layer.feature.properties[this.options.priorityProp] - 0 : 0;
        if (!pri) pri = 0;
        // push label info to _labels array
        // let latLng = layer.getLatLng ? layer.getLatLng() :
        //     geomType.endsWith('Polygon') ? L.PolyUtil.polygonCenter(layer._defaultShape(), L.CRS.EPSG3857)
        //         : L.LineUtil.polylineCenter(layer._defaultShape(), L.CRS.EPSG3857);
        let latLng = layer.getLatLng ? layer.getLatLng() : polylabel.getLabelPos(layer.feature.geometry, this.options.stretchRatio).reverse()

        this._labels[layerId] = {
            label: label,
            latLng: latLng,
            anchor: anchor,
            size: size,
            layer: layer,
            priority: pri,
            geomType: geomType
        };

        return this.fire('layeradd', {layer});
    },

    removeLayer(layer) {
        if (this._labels.hasOwnProperty(layer._leaflet_id))
            delete this._labels[layer._leaflet_id];
        L.GeoJSON.prototype.removeLayer.call(this, layer);
    },

    onRemove(map) {
        this.eachLayer(map.removeLayer, map);
        this._container.remove();
    },

    setViewFilter(f) {
        this._viewFilter = f;
        this._update();
    }
}

L.Polylabel = L.GeoJSON.extend(L.polylabelPrototype);
L.polylabel = function (layers, options) {
    return new L.Polylabel(layers, options);
}