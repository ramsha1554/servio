import { cityData, allCities } from './data/cityData.js';
import { menuTemplates, restaurantNames } from './data/menuTemplates.js';

/**
 * Validates that every specialty in cityData has a corresponding 
 * entry in menuTemplates and restaurantNames.
 */
export const runDiagnostics = () => {
    const diagnostics = {
        cities: Object.keys(cityData).length,
        cuisines: Object.keys(menuTemplates).length,
        namingTemplates: Object.keys(restaurantNames).length,
        errors: []
    };

    // Check for missing mappings
    Object.entries(cityData).forEach(([city, info]) => {
        if (!info.specialties || !Array.isArray(info.specialties)) {
            diagnostics.errors.push(`City [${city}] is missing specialties array.`);
            return;
        }
        
        info.specialties.forEach(spec => {
            if (!menuTemplates[spec]) {
                diagnostics.errors.push(`Missing menuTemplate for specialty: [${spec}] (found in ${city})`);
            }
            if (!restaurantNames[spec]) {
                diagnostics.errors.push(`Missing restaurantNames for specialty: [${spec}] (found in ${city})`);
            }
        });
    });

    return diagnostics;
};

export { cityData, allCities, menuTemplates, restaurantNames };
