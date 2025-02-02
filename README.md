
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


# Guide

### **Options**

Here’s a detailed breakdown of the available options in `L.Labeler`:

1. **`pointToLayer`** *(Function)*  
   Converts a GeoJSON point feature into a Leaflet layer. This is useful for customizing how each point is rendered on the map.
    - **Example**:
      ```js
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, { radius: 8, color: 'red' });
      }
      ```

2. **`labelProp`** *(String)*  
   The property name in the GeoJSON feature to use as the label text. By default, this is the `name` property, but you can specify another property.
    - **Example**:
      ```js
      labelProp: 'title'  // Use the 'title' property for labels.
      ```

3. **`labelFunc`** *(Function)*  
   A custom function to format the label text. This function receives the feature as an argument and returns a string that will be used as the label.
    - **Example**:
      ```js
      labelFunc: function(feature) {
          return `${feature.properties.name} (${feature.properties.population})`;
      }
      ```

4. **`labelPos`** *(String)*  
   The position of the label relative to the point. Default is `'cc'` (center-center). Other options include `'t'` (top), `'b'` (bottom), `'l'` (left), `'r'` (right).
    - **Example**:
      ```js
      labelPos: 't'  // Position the label above the point.
      ```

5. **`labelStyle`** *(Object|Function)*  
   Defines the CSS style for the label text. This can either be a static object or a function that returns a style object based on the feature properties.
    - **Example 1 (Static Object)**:
      ```js
      labelStyle: {
          textTransform: 'uppercase',
          fontWeight: 'bold',
          color: 'red',
          backgroundColor: 'white',
          padding: '2px',
          borderRadius: '3px',
      }
      ```
    - **Example 2 (Dynamic Style Function)**:
      ```js
      labelStyle: function(feature) {
          return {
              textTransform: 'uppercase',
              fontWeight: 'bold',
              color: feature.properties.population_density > 100 ? 'red' : 'green',
              backgroundColor: 'white',
              padding: '2px',
              borderRadius: '3px',
          };
      }
      ```

6. **`style`** *(Function)*  
   A function that returns the style object for the feature layers. It receives the feature as an argument and can be used to customize the layer's appearance (e.g., color, opacity).
    - **Example**:
      ```js
      style: function(feature) {
          return {
              color: feature.properties.population_density > 100 ? 'red' : 'green',
              weight: 2,
              opacity: 0.5
          };
      }
      ```

7. **`priorityProp`** *(String)*  
   The property name in the feature used to determine the priority of labels. Features with a higher value in this property will be rendered first. This can be used to control label overlaps.
    - **Example**:
      ```js
      priorityProp: 'importance'  // Labels with higher 'importance' values are rendered first.
      ```

8. **`stretchRatio`** *(Number)*  
   A ratio to stretch the label for better fitting. This is useful when labels have varying lengths, and you want them to fit neatly without clipping. The default value is `1.5`.
    - **Example**:
      ```js
      stretchRatio: 2  // Stretch the label by a factor of 2 to fit.
      ```

---

### **Styling Labels Guide**

You can style labels dynamically and consistently by leveraging the `labelStyle` option. Below are some guidelines and examples to help you style labels effectively.

#### **Static Styles**
To apply the same style to all labels, use a static object. This object follows standard CSS properties that are applied directly to the label's `<span>` element.

- **Example**:
  ```js
  labelStyle: {
      textTransform: 'uppercase',
      fontWeight: 'bold',
      color: 'black',
      backgroundColor: 'yellow',
      padding: '3px',
      borderRadius: '5px',
  }
  ```

- **Resulting HTML**:
  ```html
  <span class="leaflet-labeler-label" style="text-transform: uppercase; font-weight: bold; color: black; background-color: yellow; padding: 3px; border-radius: 5px;">
      Central African Rep. (9p/km²) (570$/p) (165875)
  </span>
  ```

#### **Dynamic Styles with Functions**
For dynamic styling based on feature properties, use a function that returns a style object. This allows you to create custom styles based on any aspect of the feature (e.g., population density, region, etc.).

- **Example**:
  ```js
  labelStyle: function(feature) {
      return {
          textTransform: 'uppercase',
          fontWeight: 'bold',
          color: feature.properties.population_density > 100 ? 'red' : 'green',
          backgroundColor: 'white',
          padding: '2px',
          borderRadius: '3px',
      };
  }
  ```

- **Resulting HTML (example for high population density)**:
  ```html
  <span class="leaflet-labeler-label" style="text-transform: uppercase; font-weight: bold; color: red; background-color: white; padding: 2px; border-radius: 3px;">
      Central African Rep. (9p/km²) (570$/p) (165875)
  </span>
  ```

#### **Using `labelPos` for Placement**
You can control the label's position relative to its feature using the `labelPos` option. Use values like `'cc'`, `'t'`, `'b'`, `'l'`, `'r'` to position the label at the center, top, bottom, left, or right of the feature.

- **Example**:
  ```js
  labelPos: 't'  // Position the label above the point.
  ```

#### **Stretching Labels**
If your labels are of varying lengths, use the `stretchRatio` option to make them fit better within a defined area. The default value is `1.5`, but you can adjust it to suit your needs.

- **Example**:
  ```js
  stretchRatio: 2  // Stretch the label to fit better.
  ```

#### **Complete Example**
Here’s a full example that combines all of the options to style a label dynamically:

```js
L.labeler({
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, { radius: 8, color: 'red' });
    },
    labelProp: 'name',
    labelFunc: function(feature) {
        return `${feature.properties.name} (${feature.properties.population_density}p/km²)`;
    },
    labelPos: 'cc',
    labelStyle: function(feature) {
        return {
            textTransform: 'uppercase',
            fontWeight: 'bold',
            color: feature.properties.population_density > 100 ? 'red' : 'green',
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '3px',
        };
    },
    style: function(feature) {
        return {
            color: feature.properties.population_density > 100 ? 'red' : 'green',
            weight: 2,
            opacity: 0.7,
        };
    },
    priorityProp: 'importance',
    stretchRatio: 1.5,
});
```

In this setup, labels will be:
- Styled dynamically based on population density.
- Positioned at the center of each feature.
- Styled with a bold, uppercase, and color-coded scheme.
- Labels will be stretched with a `stretchRatio` of `1.5` to fit better.


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
