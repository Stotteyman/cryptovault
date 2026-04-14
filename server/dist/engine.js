export class CombatEngine {
    calculateDamage(attacker, defender) {
        const base = attacker.attack - defender.defense * 0.5;
        const variance = Math.random() * 4 - 2;
        return Math.max(1, Math.round(base + variance));
    }
    resolveTurn(player, enemy, action) {
        const playerDamage = this.calculateDamage(player, enemy);
        const enemyHealth = Math.max(0, enemy.health - playerDamage);
        const enemyAction = enemyHealth > 0 ? 'attack' : 'defeat';
        const enemyDamage = enemyAction === 'attack' ? this.calculateDamage(enemy, player) : 0;
        const playerHealth = Math.max(0, player.health - enemyDamage);
        const winner = enemyHealth === 0 ? 'player' : playerHealth === 0 ? 'enemy' : 'ongoing';
        return {
            winner,
            playerHealth,
            enemyHealth,
            playerDamage,
            enemyDamage,
            actionTaken: action,
        };
    }
}
export class LootGenerator {
    generateLoot(difficulty) {
        const cvtReward = Math.max(1, Math.round(difficulty * (2 + Math.random() * 2)));
        const items = [];
        if (Math.random() < 0.35) {
            items.push({ id: `item-${Date.now()}`, name: `Rare Component`, rarity: 'Rare' });
        }
        return { items, cvtReward };
    }
}
export class MatchmakingEngine {
    findOpponent(playerElo) {
        const opponent = {
            name: `Opponent_${Math.floor(Math.random() * 1000)}`,
            elo: Math.max(800, playerElo + Math.round((Math.random() - 0.5) * 200)),
        };
        return { opponent, message: 'Opponent found. Prepare for battle.' };
    }
}
export function spinSlots(wager) {
    const roll = Math.random();
    if (roll < 0.45) {
        return { reward: 0, message: `No win this time. You lost ${wager} VT.` };
    }
    if (roll < 0.75) {
        return { reward: wager * 0.5, message: `Small return: you won ${wager * 0.5} VT back.` };
    }
    if (roll < 0.93) {
        return { reward: wager * 1.5, message: `Nice! You won ${wager * 1.5} VT.` };
    }
    return {
        reward: wager * 4,
        item: { id: `gear-${Date.now()}`, name: 'Lucky Vault Gear', rarity: 'Epic' },
        message: `Jackpot! You won ${wager * 4} VT and Epic gear!`,
    };
}
export function spinWheel(wager) {
    const roll = Math.random();
    if (roll < 0.4) {
        return { reward: 0, bonus: 'No prize', message: `The wheel landed on a miss. Lose ${wager} VT.` };
    }
    if (roll < 0.7) {
        return { reward: wager * 1.2, bonus: 'Small boost', message: `You won ${wager * 1.2} VT.` };
    }
    if (roll < 0.9) {
        return { reward: wager * 2, bonus: 'Double back', message: `Great! You won ${wager * 2} VT.` };
    }
    return { reward: wager * 5, bonus: 'Legendary prize', message: `Legendary! You won ${wager * 5} VT and a rare cosmetic reward.` };
}
