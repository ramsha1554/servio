import { LOGISTICS_CONFIG } from '../config/logistics.config.js';
import logger from '../config/logger.js';

/**
 * Normalizes coordinate input into a standard { lat, lon } object.
 */
export const normalizeCoords = (input) => {
    if (input && typeof input === 'object' && 'lat' in input && 'lon' in input) {
        if (!isNaN(input.lat) && !isNaN(input.lon)) return input;
    }

    if (!input || typeof input !== 'object') return null;
    
    let lat, lon;

    if (Array.isArray(input)) {
        if (input.length !== 2) return null;
        [lon, lat] = input;
    } else if (input.coordinates && Array.isArray(input.coordinates)) {
        if (input.coordinates.length !== 2) return null;
        [lon, lat] = input.coordinates;
    } else {
        lat = input.lat !== undefined ? input.lat : input.latitude;
        lon = input.lon !== undefined ? input.lon : input.longitude;
    }

    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);

    if (isNaN(nLat) || isNaN(nLon)) return null;

    // Boundary Detection: Swapped Lat/Lon protection
    if (nLat < -90 || nLat > 90 || nLon < -180 || nLon > 180) {
        logger.error("Invalid Coordinate Range Rejected", { lat: nLat, lon: nLon });
        return null;
    }

    return { lat: nLat, lon: nLon };
};

/**
 * Deterministic Distance Calculation Contract:
 * 1. Calculate raw distance (Haversine)
 * 2. Round to 4 decimal places (10cm precision) BEFORE comparison
 * 3. Return rounded value
 */
export const calculateDistance = (p1Raw, p2Raw) => {
    const p1 = normalizeCoords(p1Raw);
    const p2 = normalizeCoords(p2Raw);
    
    if (!p1 || !p2 || (p1.lat === 0 && p1.lon === 0) || (p2.lat === 0 && p2.lon === 0)) {
        return Infinity;
    }

    const R = 6371; // Earth Mean Radius
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lon - p1.lon) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const rawDistance = R * c;

    // CONTRACT: Deterministic Rounding to 4 decimal places
    return Math.round(rawDistance * 10000) / 10000;
};

/**
 * Cluster Validation Policy Contract:
 * - Rounding occurs in calculateDistance.
 * - Epsilon buffer is added to the threshold.
 * - Final comparison is RoundedDistance <= Threshold.
 */
export const isWithinCluster = (anchorCoords, targetCoords) => {
    if (!LOGISTICS_CONFIG.ENABLE_CLUSTER_VALIDATION) return true;
    
    const roundedDistance = calculateDistance(anchorCoords, targetCoords);
    const threshold = LOGISTICS_CONFIG.MAX_CLUSTER_DISTANCE_KM + LOGISTICS_CONFIG.DISTANCE_BUFFER_KM;

    const isValid = roundedDistance <= threshold;

    if (!isValid) {
        logger.warn("Logistics Cluster Violation", {
            distance: roundedDistance,
            threshold,
            mode: LOGISTICS_CONFIG.VALIDATION_MODE
        });
    }

    return LOGISTICS_CONFIG.VALIDATION_MODE === 'MONITOR' ? true : isValid;
};
