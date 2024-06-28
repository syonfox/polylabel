
# Leaflet Polylabel Plugin

A plugin by syonfox, with thanks to everyone behind Polylabel and Leaflet, and many more.

`MIT / WTFPL`

[![GitHub Repo](https://img.shields.io/badge/View%20on%20GitHub-gray?style=flat-square&logo=github)](https://github.com/syonfox/polylabel)
[![Example](https://img.shields.io/badge/See%20Example-blue?style=flat-square)](https://polylabel.pages.dev/example)
[![Npm](https://img.shields.io/badge/Npm-red?style=flat-square&logo=npm)](https://www.npmjs.com/package/leaflet-polylabel)


## Todo

- Clean up and document more

## Installation

```sh
npm install leaflet-polylabel
cp node_modules/endpoint-polylabel/dist/L.polylabel.js src/lib/L.polylabel.js
```

## Include

```html
<script src="/lib/L.polylabel.js"></script>
<div id="map"></div>
```

## Usage

```js
let map = L.map("#map");

// Function to fetch and label GeoJSON data
async function labelGeoJson(url) {
    let res = await fetch(url);
    let data = await res.json();

    window.ll = L.polylabel(data, {
        pointToLayer: (gj, ll) => L.circleMarker(ll, {
            radius: gj.properties.population ? Math.pow(gj.properties[order], 0.2) - 1 : 1
        }),
        labelProp: 'NAME',
        labelFunc: l => (`${l.feature.properties[field]} (${formatNumber(l.feature.properties[order])})`),
        labelPos: 'cc',
        labelStyle: { textTransform: 'uppercase', fontWeight: 'bold' },
        style: (f, l) => {
            return {
                color: "#000",
                weight: 2,
                fillColor: "#fff"
            };
        },
        priorityProp: order,
        stretchRatio: 1.5
    }).addTo(map).bindPopup(l => generateCountryCard(l.feature.properties));
}

// Call the function with your GeoJSON URL
labelGeoJson("https://ne.freemap.online/110m/physical/ne_110m_lakes.json");
```

## Options

### L.polylabel(data, options)

The `L.polylabel` function extends Leaflet's labeling capabilities using the Polylabel algorithm. It adds labels to your GeoJSON data with enhanced placement and styling options.

#### Options

- `pointToLayer`: Function to convert GeoJSON point feature to a leaflet layer.
- `labelProp`: Property name in GeoJSON features to use as the label text.
- `labelFunc`: Function to format the label text.
- `labelPos`: Position of the label. Default is 'cc' (center-center).
- `labelStyle`: CSS style for the label text.
- `style`: Function to style the feature layers.
- `priorityProp`: Property name to determine the rendering priority of labels.
- `stretchRatio`: Ratio to stretch the label for better fit. Default is 1.5.

## Example

```js
L.polylabel(data, {
    pointToLayer: (gj, ll) => L.circleMarker(ll, {
        radius: gj.properties.population ? Math.pow(gj.properties[order], 0.2) - 1 : 1
    }),
    labelProp: 'NAME',
    labelFunc: l => (`${l.feature.properties[field]} (${formatNumber(l.feature.properties[order])})`),
    labelPos: 'cc',
    labelStyle: { textTransform: 'uppercase', fontWeight: 'bold' },
    style: (f, l) => ({
        color: "#000",
        weight: 2,
        fillColor: "#fff"
    }),
    priorityProp: order,
    stretchRatio: 1.5
}).addTo(map).bindPopup(l => generateCountryCard(l.feature.properties));
```

This plugin enhances Leaflet's labeling capabilities by leveraging the Polylabel algorithm to ensure optimal label placement within complex polygons. The added `stretchRatio` option allows for better control over label stretching to fit within larger polygons.
## Other work 
https://plnkr.co/edit/grF2TZdRS6P9YqW9?preview
https://observablehq.com/@kotelnikov/labeling-with-stretched-polylabel-updated
https://ica-adv.copernicus.org/articles/4/8/2023/ica-adv-4-8-2023.pdf

## polylabel [![Build Status](https://travis-ci.org/mapbox/polylabel.svg?branch=master)](https://travis-ci.org/mapbox/polylabel)

A fast algorithm for finding polygon _pole of inaccessibility_,
the most distant internal point from the polygon outline (not to be confused with centroid),
implemented as a JavaScript library.
Useful for optimal placement of a text label on a polygon.

It's an iterative grid algorithm,
inspired by [paper by Garcia-Castellanos & Lombardo, 2007](https://sites.google.com/site/polesofinaccessibility/).
Unlike the one in the paper, this algorithm:

- guarantees finding **global optimum** within the given precision
- is many times faster (10-40x)

![](https://cloud.githubusercontent.com/assets/25395/16745865/864a0a30-47c0-11e6-87bc-58acac41a520.png)

### How the algorithm works

This is an iterative grid-based algorithm, which starts by covering the polygon with big square cells and then iteratively splitting them in the order of the most promising ones, while aggressively pruning uninteresting cells.

1. Generate initial square cells that fully cover the polygon (with cell size equal to either width or height, whichever is lower). Calculate distance from the center of each cell to the outer polygon, using negative value if the point is outside the polygon (detected by ray-casting).
2. Put the cells into a priority queue sorted by the maximum potential distance from a point inside a cell, defined as a sum of the distance from the center and the cell radius (equal to `cell_size * sqrt(2) / 2`).
3. Calculate the distance from the centroid of the polygon and pick it as the first "best so far".
4. Pull out cells from the priority queue one by one. If a cell's distance is better than the current best, save it as such.
Then, if the cell potentially contains a better solution that the current best (`cell_max - best_dist > precision`),
split it into 4 children cells and put them in the queue.
5. Stop the algorithm when we have exhausted the queue and return the best cell's center as the pole of inaccessibility.
It will be guaranteed to be a global optimum within the given precision.

![image](https://cloud.githubusercontent.com/assets/25395/16748630/e6b3336c-47cd-11e6-8059-0eeccf22cf6b.png)

### JavaScript Usage

Given polygon coordinates in
[GeoJSON-like format](http://geojson.org/geojson-spec.html#polygon)
and precision (`1.0` by default),
Polylabel returns the pole of inaccessibility coordinate in `[x, y]` format.

```js
var p = polylabel(polygon, 1.0);
```

### TypeScript

[TypeScript type definitions](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/concaveman)
are available via `npm install --save @types/polylabel`.

### C++ Usage

It is recommended to install polylabel via [mason](https://github.com/mapbox/mason). You will also need to install its dependencies: [geometry.hpp](https://github.com/mapbox/geometry.hpp) and [variant](https://github.com/mapbox/variant).

```C++
#include <mapbox/polylabel.hpp>

int main() {
    mapbox::geometry::polygon<double> polygon = readPolygon(); // Get polygon data from somewhere.
    mapbox::geometry::point<double> p = mapbox::polylabel(polygon, 1.0);
    return 0;
}
```

#### Ports to other languages

- [andrewharvey/geojson-polygon-labels](https://github.com/andrewharvey/geojson-polygon-labels) (CLI) 
- [Twista/python-polylabel](https://github.com/Twista/python-polylabel) (Python)
- [Shapely](https://github.com/Toblerity/Shapely/blob/master/shapely/algorithms/polylabel.py) (Python)
- [polylabelr](https://CRAN.R-project.org/package=polylabelr) (R)
- [polylabel-rs](https://github.com/urschrei/polylabel-rs) (Rust)
