/**
 * Frontend Logistics Constants
 * Must remain in sync with backend logistics.config.js
 */
export const LOGISTICS_CONFIG = {
    MAX_CLUSTER_DISTANCE_KM: 3.0,
    DISTANCE_BUFFER_KM: 0.05, // 50m precision buffer
    PRECISION_DECIMALS: 4    // 10cm precision standard
};

/**
 * Normalizes coordinate input into a standard { lat, lon } object.
 * Supports: [lon, lat], { coordinates: [lon, lat] }, { lat, lon }
 */
export const normalizeCoords = (input) => {
    if (!input || typeof input !== 'object') return null;

    // Handle already normalized format
    if ('lat' in input && 'lon' in input) {
        if (!isNaN(input.lat) && !isNaN(input.lon)) return input;
    }
    
    let lat, lon;

    if (Array.isArray(input)) {
        if (input.length !== 2) return null;
        [lon, lat] = input;
    } else if (input.coordinates && Array.isArray(input.coordinates)) {
        if (input.coordinates.length !== 2) return null;
        [lon, lat] = input.coordinates;
    } else {
        lat = input.lat ?? input.latitude;
        lon = input.lon ?? input.longitude;
    }

    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);

    if (isNaN(nLat) || isNaN(nLon)) return null;

    // Range Validation
    if (nLat < -90 || nLat > 90 || nLon < -180 || nLon > 180) return null;

    return { lat: nLat, lon: nLon };
};

/**
 * Precision-safe Haversine distance calculation.
 * Rounds to 4 decimal places (10cm) BEFORE comparison.
 */
export const calculateDistance = (p1Raw, p2Raw) => {
    const p1 = normalizeCoords(p1Raw);
    const p2 = normalizeCoords(p2Raw);
    
    if (!p1 || !p2 || (p1.lat === 0 && p1.lon === 0) || (p2.lat === 0 && p2.lon === 0)) {
        return Infinity;
    }

    const R = 6371; // Earth Radius in KM
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lon - p1.lon) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const rawDistance = R * c;

    // Deterministic Rounding: 4 decimal places
    const factor = Math.pow(10, LOGISTICS_CONFIG.PRECISION_DECIMALS);
    return Math.round(rawDistance * factor) / factor;
};

/**
 * Validates if target is within cluster radius of anchor.
 * Uses the exact same boundary logic as the backend.
 */
export const isWithinCluster = (anchorCoords, targetCoords) => {
    const roundedDistance = calculateDistance(anchorCoords, targetCoords);
    const threshold = LOGISTICS_CONFIG.MAX_CLUSTER_DISTANCE_KM + LOGISTICS_CONFIG.DISTANCE_BUFFER_KM;

    return roundedDistance <= threshold;
};
