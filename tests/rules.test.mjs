// Firestore security rules, run against the emulator: `npm run test:rules` in this folder.
import { after, before, beforeEach, test } from "node:test";
import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment } from "@firebase/rules-unit-testing";

const RULES = readFileSync(new URL("../firestore.rules", import.meta.url), "utf8");
const ANA = "ana";
const BIA = "bia";

let env;
const as = (uid) => env.authenticatedContext(uid).firestore();
const userDoc = (db, uid) => db.collection("users").doc(uid);

// What js/progress.js writes after a lesson.
const session = (xp) => ({
    xp,
    streak: 1,
    lastPlayed: "2026-11-24",
    mistakes: ["py-1:0"],
    today: { date: "2026-11-24", mission: "first", xp, lessons: 1, reviews: 0 },
    completedLessons: ["py-1"]
});

before(async () => {
    env = await initializeTestEnvironment({ projectId: "demo-encoder", firestore: { rules: RULES } });
});
beforeEach(() => env.clearFirestore());
after(() => env?.cleanup());

const seed = (data) => env.withSecurityRulesDisabled((context) => userDoc(context.firestore(), ANA).set(data));

test("a student can create, read and update only their own document", async () => {
    await assertSucceeds(userDoc(as(ANA), ANA).set(session(16)));
    await assertSucceeds(userDoc(as(ANA), ANA).get());
    await assertFails(userDoc(as(BIA), ANA).get());
    await assertFails(userDoc(as(BIA), ANA).set({ xp: 1 }, { merge: true }));
    await assertFails(userDoc(env.unauthenticatedContext().firestore(), ANA).get());
});

test("a lesson saved in a transaction is accepted", async () => {
    await seed({ ...session(20), xp: 120 });
    const db = as(ANA);
    await assertSucceeds(db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(userDoc(db, ANA));
        transaction.set(userDoc(db, ANA), { ...session(0), xp: snapshot.data().xp + 32 }, { merge: true });
    }));
});

test("one save adds at most 50 XP and never takes XP away", async () => {
    await assertFails(userDoc(as(ANA), ANA).set({ xp: 51 }));
    await seed({ xp: 100 });
    await assertSucceeds(userDoc(as(ANA), ANA).set({ xp: 150 }, { merge: true }));
    await assertFails(userDoc(as(ANA), ANA).set({ xp: 201 }, { merge: true }));
    await assertFails(userDoc(as(ANA), ANA).set({ xp: 149 }, { merge: true }));
});

test("fields are limited to known names, types and sizes", async () => {
    await seed({ xp: 0 });
    const ana = userDoc(as(ANA), ANA);
    await assertFails(ana.set({ admin: true }, { merge: true }));
    await assertFails(ana.set({ streak: "7" }, { merge: true }));
    await assertFails(ana.set({ displayName: "a".repeat(61) }, { merge: true }));
    await assertFails(ana.set({ today: { date: "2026-11-24", bonus: 1 } }, { merge: true }));
    await assertSucceeds(ana.set({ displayName: "Ana", onboarded: true, chestOpened: "2026-11-24" }, { merge: true }));
});

test("documents with fields from older versions can still be updated", async () => {
    await seed({ xp: 10, legacy: "kept" });
    await assertSucceeds(userDoc(as(ANA), ANA).set({ xp: 20 }, { merge: true }));
});

test("nobody can delete a student's document", async () => {
    await seed({ xp: 10 });
    await assertFails(userDoc(as(ANA), ANA).delete());
});
