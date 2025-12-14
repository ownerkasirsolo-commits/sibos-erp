
import { UnitType } from '../types';

// Categories for compatibility check
const MASS_UNITS = [UnitType.KG, UnitType.GRAM];
const VOLUME_UNITS = [UnitType.LITER, UnitType.ML, UnitType.TBS, UnitType.TSP];
const COUNT_UNITS = [UnitType.PCS, UnitType.BOX, UnitType.PORTION];

// Helper to determine unit type
export const getUnitCategory = (unit: UnitType): 'MASS' | 'VOLUME' | 'COUNT' | 'UNKNOWN' => {
    if (MASS_UNITS.includes(unit)) return 'MASS';
    if (VOLUME_UNITS.includes(unit)) return 'VOLUME';
    if (COUNT_UNITS.includes(unit)) return 'COUNT';
    return 'UNKNOWN';
};

// Get compatible units for dropdown
export const getCompatibleUnits = (baseUnit: UnitType): UnitType[] => {
    const category = getUnitCategory(baseUnit);
    if (category === 'MASS') return MASS_UNITS;
    if (category === 'VOLUME') return VOLUME_UNITS;
    return [baseUnit]; // For count, mostly just same unit or need special conversion logic
};

// The core conversion logic
// Converts 'fromAmount' in 'fromUnit' -> 'toUnit'
export const convertUnit = (amount: number, fromUnit: UnitType, toUnit: UnitType): number => {
    if (fromUnit === toUnit) return amount;

    const category = getUnitCategory(fromUnit);
    if (category !== getUnitCategory(toUnit)) {
        console.error(`Incompatible unit conversion: ${fromUnit} to ${toUnit}`);
        return 0; // Cannot convert Mass to Volume without density (Simple version)
    }

    // --- MASS CONVERSION ---
    if (category === 'MASS') {
        // Base: GRAM
        let grams = amount;
        if (fromUnit === UnitType.KG) grams = amount * 1000;
        
        // Convert to Target
        if (toUnit === UnitType.KG) return grams / 1000;
        return grams; // Default Gram
    }

    // --- VOLUME CONVERSION ---
    if (category === 'VOLUME') {
        // Base: ML
        let ml = amount;
        if (fromUnit === UnitType.LITER) ml = amount * 1000;
        if (fromUnit === UnitType.TBS) ml = amount * 15;
        if (fromUnit === UnitType.TSP) ml = amount * 5;

        // Convert to Target
        if (toUnit === UnitType.LITER) return ml / 1000;
        if (toUnit === UnitType.TBS) return ml / 15;
        if (toUnit === UnitType.TSP) return ml / 5;
        return ml; // Default ML
    }

    return amount; // Fallback
};