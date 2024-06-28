const polyarea = (function () {
    const R = 6371; // Earth's radius in kilometers

    // Convert degrees to radians
    function toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    // Spherical excess formula to calculate polygon area
    function sphericalExcess(vertices) {
        let totalArea = 0;
        const n = vertices.length;

        for (let i = 0; i < n; i++) {
            const lat1 = vertices[i].lat;
            const lon1 = vertices[i].lon;
            const lat2 = vertices[(i + 1) % n].lat;
            const lon2 = vertices[(i + 1) % n].lon;

            const a = haversine(lat1, lon1, lat2, lon2);

            const lat3 = vertices[(i + 2) % n].lat;
            const lon3 = vertices[(i + 2) % n].lon;

            const b = haversine(lat2, lon2, lat3, lon3);
            const c = haversine(lat3, lon3, lat1, lon1);

            const s = (a + b + c) / 2;
            const tanExcess = Math.tan(s / 2) * Math.tan((s - a) / 2) * Math.tan((s - b) / 2) * Math.tan((s - c) / 2);
            const excess = 4 * Math.atan(Math.sqrt(Math.abs(tanExcess)));

            totalArea += excess;
        }

        return totalArea * R * R;
    }

    // Haversine formula to calculate great-circle distance
    function haversine(lat1, lon1, lat2, lon2) {
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Helper method to calculate rectangle area given (lat, lon, width, height)
    function rectangleArea(lat, lon, width, height, useSphericalExcess) {
        const lat2 = lat + height;
        const lon2 = lon + width;
        const vertices = [
            { lat: lat, lon: lon },
            { lat: lat, lon: lon2 },
            { lat: lat2, lon: lon2 },
            { lat: lat2, lon: lon }
        ];

        if (useSphericalExcess) {
            return sphericalExcess(vertices);
        } else {
            // Fallback to shoelace formula (for smaller polygons)
            return shoelace(vertices);
        }
    }

    // Shoelace formula to calculate polygon area
    function shoelace(vertices) {
        let area = 0;
        const n = vertices.length;

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += vertices[i].lon * vertices[j].lat;
            area -= vertices[j].lon * vertices[i].lat;
        }

        area = Math.abs(area) / 2;
        return area;
    }

    return {
        rectangleArea,
        sphericalExcess
    };
})();
