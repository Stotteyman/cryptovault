export const CHARACTER_CLASSES = {
    noob: {
        id: 'noob',
        name: 'Noob',
        description: 'A fresh recruit. Free to create!',
        health: 60,
        attack: 5,
        defense: 3,
        cost: 0,
    },
    knight: {
        id: 'knight',
        name: 'Knight',
        description: 'Tanky close-range fighter.',
        health: 120,
        attack: 8,
        defense: 12,
        cost: 50000,
    },
    rogue: {
        id: 'rogue',
        name: 'Rogue',
        description: 'Fast attacker with high loot chance.',
        health: 80,
        attack: 15,
        defense: 5,
        cost: 50000,
    },
    mage: {
        id: 'mage',
        name: 'Mage',
        description: 'Powerful burst damage with fragile health.',
        health: 70,
        attack: 18,
        defense: 3,
        cost: 50000,
    },
    ranger: {
        id: 'ranger',
        name: 'Ranger',
        description: 'Balanced ranged damage and utility.',
        health: 90,
        attack: 12,
        defense: 6,
        cost: 50000,
    },
};
/**
 * Calculate VT cost for a character name based on length
 * 1 letter = 100,000 VT
 * 2 letters = 50,000 VT
 * 3 letters = 25,000 VT
 * 4 letters = 10,000 VT
 * 5 letters = 5,000 VT
 * 6+ letters = free (0 VT)
 */
export function calculateNameCost(name) {
    const length = name.trim().length;
    switch (length) {
        case 1:
            return 100000;
        case 2:
            return 50000;
        case 3:
            return 25000;
        case 4:
            return 10000;
        case 5:
            return 5000;
        default:
            return 0;
    }
}
/**
 * Calculate total cost to create a character with customizations
 */
export function calculateTotalCharacterCost(options) {
    const charClass = CHARACTER_CLASSES[options.classId];
    if (!charClass) {
        throw new Error('Invalid character class');
    }
    const classCost = charClass.cost;
    const nameCost = calculateNameCost('x'.repeat(options.nameLength));
    const colorCost = options.includeColor ? 10000 : 0;
    const effectCost = options.includeEffect ? 10000 : 0;
    const total = classCost + nameCost + colorCost + effectCost;
    return { classCost, nameCost, colorCost, effectCost, total };
}
/**
 * Validate character creation parameters
 */
export function validateCharacterCreation(options) {
    if (!options.name || options.name.trim().length === 0) {
        return { valid: false, error: 'Name is required' };
    }
    if (!CHARACTER_CLASSES[options.classId]) {
        return { valid: false, error: 'Invalid character class' };
    }
    if (options.name.length > 30) {
        return { valid: false, error: 'Name must be 30 characters or less' };
    }
    return { valid: true };
}
