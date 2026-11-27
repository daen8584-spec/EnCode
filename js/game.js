// The game layer: ranks, the daily mission and its chest.
import { pixelIcon } from "./vale-icons.js";
import { increment } from "./firebase.js";
import { localDate, saveUserData, todayCounts } from "./progress.js";

export { baseXp, EXERCISE_XP, maxXp } from "./xp.js";

export const MASCOT_NAME = "Bit";

const svg = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

export const RANKS = [
    { name: "Filhote", min: 0, color: "#d0844a", icon: pixelIcon("hare") },
    { name: "Explorador", min: 60, color: "#1c9f62", icon: pixelIcon("map") },
    { name: "Inventor", min: 180, color: "#2f6fe4", icon: pixelIcon("lightbulb") },
    { name: "Mestre", min: 400, color: "#c27c0a", icon: pixelIcon("crown") }
];

export function rankOf(xp) {
    const index = RANKS.findLastIndex((rank) => xp >= rank.min);
    const rank = RANKS[index];
    const next = RANKS[index + 1];
    return {
        ...rank,
        index,
        next,
        progress: next ? (xp - rank.min) / (next.min - rank.min) : 1,
        toNext: next ? next.min - xp : 0
    };
}

export const MISSIONS = {
    first: { title: "Complete sua primeira aula", goal: 1, key: "lessons", unit: "aula" },
    xp: { title: "Ganhe 20 XP", goal: 20, key: "xp", unit: "XP" },
    lessons: { title: "Complete 2 aulas", goal: 2, key: "lessons", unit: "aulas" },
    review: { title: "Faça um treino de revisão", goal: 1, key: "reviews", unit: "treino" }
};

export function dailyMission(data) {
    const today = todayCounts(data);
    const mission = MISSIONS[today.mission];
    const value = Math.min(today[mission.key], mission.goal);
    return { ...mission, id: today.mission, value, done: value >= mission.goal, chestOpened: data.chestOpened === localDate() };
}

const CHEST_REWARDS = [10, 15, 20, 25];

export async function openChest() {
    const reward = CHEST_REWARDS[Math.floor(Math.random() * CHEST_REWARDS.length)];
    await saveUserData({ xp: increment(reward), chestOpened: localDate() });
    return reward;
}
