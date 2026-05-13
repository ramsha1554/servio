import { z } from 'zod';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Strict boolean parser for DevOps-friendly environment variables.
 * Supports true/1/yes vs false/0/no (case-insensitive).
 */
const parseBool = (value) => {
    if (value === undefined || value === null || value.trim() === "") return false;
    const normalized = value.trim().toLowerCase();
    
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    
    // Invalid value behavior
    logger.warn(`Invalid boolean environment variable detected: "${value}". Defaulting to false.`);
    return false;
};

const LogisticsSchema = z.object({
    ENABLE_CLUSTER_VALIDATION: z.boolean(),
    MAX_CLUSTER_DISTANCE_KM: z.number().positive(),
    DISTANCE_BUFFER_KM: z.number().nonnegative(),
    VALIDATION_MODE: z.enum(['STRICT', 'MONITOR'])
});

const rawConfig = {
    ENABLE_CLUSTER_VALIDATION: parseBool(process.env.ENABLE_CLUSTER_VALIDATION),
    MAX_CLUSTER_DISTANCE_KM: parseFloat(process.env.MAX_CLUSTER_DISTANCE_KM || '3.0'),
    DISTANCE_BUFFER_KM: parseFloat(process.env.DISTANCE_BUFFER_KM || '0.05'),
    VALIDATION_MODE: (process.env.CLUSTER_VALIDATION_MODE || 'STRICT').toUpperCase()
};

let validatedConfig;
try {
    validatedConfig = LogisticsSchema.parse(rawConfig);
    logger.info("Logistics Config Locked", { 
        enabled: validatedConfig.ENABLE_CLUSTER_VALIDATION,
        mode: validatedConfig.VALIDATION_MODE,
        radius: validatedConfig.MAX_CLUSTER_DISTANCE_KM
    });
} catch (error) {
    console.error("FATAL: Invalid Logistics Configuration.");
    process.exit(1); 
}

export const LOGISTICS_CONFIG = validatedConfig;
