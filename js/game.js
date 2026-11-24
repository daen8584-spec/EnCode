// The game layer: ranks, the daily mission and its chest.
import { increment } from "./firebase.js";
import { localDate, saveUserData, todayCounts } from "./progress.js";

export { baseXp, EXERCISE_XP, maxXp } from "./xp.js";

export const MASCOT_NAME = "Bit";

const svg = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;

export const RANKS = [
    { name: "Filhote", min: 0, color: "#d0844a", icon: svg('<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6.5" r="2"/><circle cx="17" cy="9" r="2"/><path d="M8 17c0-3 1.8-5 4-5s4 2 4 5c0 1.5-1.2 2.5-2.5 2.2-1-.2-2-.2-3 0C9.2 19.5 8 18.5 8 17z"/>') },
    { name: "Explorador", min: 60, color: "#1c9f62", icon: svg('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>') },
    { name: "Inventor", min: 180, color: "#2f6fe4", icon: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>') },
    { name: "Mestre", min: 400, color: "#c27c0a", icon: svg('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>') }
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
