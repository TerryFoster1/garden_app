import { CareTask, PlantInstance, PlantPhoto, PlantSpecies } from "../domain";

export type PruningTermKey =
  | "suckers"
  | "pinch back"
  | "deadhead"
  | "side shoot"
  | "node"
  | "true leaves"
  | "hardening off"
  | "transplant shock"
  | "blossom end rot"
  | "powdery mildew";

export type PruningTermExplainer = {
  term: PruningTermKey;
  title: string;
  summary: string;
  where: string;
  safeAction: string;
};

export type PruningGuidance = {
  title: string;
  detail: string;
  terms: PruningTermKey[];
  priority: CareTask["priority"];
  source: "local-rules" | "photo-aware-local" | "photo-ai";
};

export const pruningTermExplainers: Record<PruningTermKey, PruningTermExplainer> = {
  suckers: {
    term: "suckers",
    title: "Tomato suckers",
    summary: "A sucker is a small shoot that grows in the V between the main tomato stem and a side branch.",
    where: "Look where each leaf branch meets the main stem, especially on indeterminate tomatoes.",
    safeAction: "Pinch small suckers with clean fingers. Use clean scissors for thicker growth and avoid heavy pruning during heat stress."
  },
  "pinch back": {
    term: "pinch back",
    title: "Pinch back",
    summary: "Pinching back means removing soft new top growth so a plant branches instead of stretching tall.",
    where: "Look above a pair of healthy leaves or a visible node.",
    safeAction: "Pinch or snip just above the node. Basil and many herbs respond especially well."
  },
  deadhead: {
    term: "deadhead",
    title: "Deadhead",
    summary: "Deadheading means removing spent flowers so the plant can redirect energy into new blooms or growth.",
    where: "Find flowers that are faded, dry, or collapsing.",
    safeAction: "Snip the flower stem above a healthy leaf set. Leave seed heads only if you want seeds or wildlife food."
  },
  "side shoot": {
    term: "side shoot",
    title: "Side shoot",
    summary: "A side shoot is new growth coming from a main stem or vine. It can be useful or crowding depending on the plant.",
    where: "Follow the main stem or vine and look for smaller shoots growing outward.",
    safeAction: "Remove damaged or crowded side shoots first. Keep healthy growth when the plant has room and airflow."
  },
  node: {
    term: "node",
    title: "Node",
    summary: "A node is a growth point where leaves, roots, flowers, or side shoots can emerge.",
    where: "Look for the spot where a leaf or branch joins the stem.",
    safeAction: "When pruning, cut just above a healthy node so the plant can regrow cleanly."
  },
  "true leaves": {
    term: "true leaves",
    title: "True leaves",
    summary: "True leaves are the first leaves that look like the mature plant, after the simple seed leaves.",
    where: "On seedlings, look for the second set of leaves after the first smooth pair.",
    safeAction: "Use true leaves as a cue for gentle feeding, thinning, and transplant timing."
  },
  "hardening off": {
    term: "hardening off",
    title: "Hardening off",
    summary: "Hardening off gradually teaches indoor seedlings to handle outdoor sun, wind, and temperature swings.",
    where: "Use this before moving seedlings outdoors full time.",
    safeAction: "Start with short sheltered outdoor visits, then increase time over 7 to 10 days."
  },
  "transplant shock": {
    term: "transplant shock",
    title: "Transplant shock",
    summary: "Transplant shock is temporary stress after a plant is moved, often showing as wilting or stalled growth.",
    where: "Watch newly moved seedlings or plants for drooping, yellowing, or slow recovery.",
    safeAction: "Keep moisture steady, avoid heavy feeding right away, and protect from intense sun or wind."
  },
  "blossom end rot": {
    term: "blossom end rot",
    title: "Blossom end rot",
    summary: "Blossom end rot is a dark sunken patch on the bottom of tomato or pepper fruit, often linked to uneven watering.",
    where: "Check the blossom end, opposite the stem, on developing fruit.",
    safeAction: "Keep watering consistent, mulch soil, and avoid over-fertilizing with nitrogen."
  },
  "powdery mildew": {
    term: "powdery mildew",
    title: "Powdery mildew",
    summary: "Powdery mildew looks like pale powder on leaves and often appears when airflow is poor or humidity is high.",
    where: "Check cucumber, squash, herbs, and crowded leaves first.",
    safeAction: "Remove the worst affected leaves, improve airflow, water at soil level, and avoid composting infected leaves."
  }
};

export function getPruningGuidance(plant: PlantInstance, species?: PlantSpecies, latestPhoto?: PlantPhoto): PruningGuidance | null {
  const name = normalize(`${plant.nickname} ${species?.commonName ?? ""} ${species?.scientificName ?? ""} ${species?.family ?? ""}`);
  const stage = plant.stage ?? "established";
  const stressed = plant.healthStatus === "watch" || plant.healthStatus === "stressed";
  const hasRecentPhotoContext = Boolean(latestPhoto?.note || latestPhoto?.diagnosisId);

  if (matchesAny(name, ["tomato", "solanum lycopersicum"])) {
    return {
      title: "This tomato may need a quick sucker check.",
      detail: `${stressed ? "Go gently today. " : ""}Lower suckers may be ready to prune soon, especially if the plant feels dense near the soil line.`,
      terms: ["suckers", "side shoot", "node"],
      priority: stressed ? "high" : stage === "young" || stage === "mature" || stage === "flowering" || stage === "fruiting" ? "normal" : "low",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  if (matchesAny(name, ["basil", "ocimum", "mint", "thyme", "parsley", "cilantro", "rosemary", "oregano", "sage", "herb"])) {
    return {
      title: "Your herb may be ready for a little trim.",
      detail: matchesAny(name, ["basil", "ocimum"])
        ? "Pinch back top growth above a healthy node to encourage bushier basil."
        : "Trim lightly above a healthy node to keep growth compact and fresh.",
      terms: ["pinch back", "node"],
      priority: stage === "seed" || stage === "seedling" ? "low" : "normal",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  if (matchesAny(name, ["pepper", "capsicum", "jalapeño", "jalapeno"])) {
    return {
      title: "Check this pepper for crowded lower growth.",
      detail: "A quick trim of damaged side shoots can improve airflow without stressing the plant.",
      terms: ["side shoot", "node"],
      priority: stressed ? "high" : "low",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  if (matchesAny(name, ["cucumber", "cucumis", "vine", "vining", "squash", "pumpkin", "melon"])) {
    return {
      title: "Check vines and remove damaged leaves.",
      detail: "Vining plants appreciate airflow. Trim yellowing leaves and crowded side shoots, especially if powdery mildew risk is rising.",
      terms: ["side shoot", "node", "powdery mildew"],
      priority: stressed ? "high" : "normal",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  if (matchesAny(name, ["flower", "marigold", "zinnia", "petunia", "begonia", "hibiscus", "rose", "geranium"])) {
    return {
      title: "Spent blooms may be ready to tidy.",
      detail: "Deadhead faded flowers to encourage fresh growth and keep the plant looking cared for.",
      terms: ["deadhead", "node"],
      priority: "low",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  if (plant.locationType === "indoor-pot" && stressed) {
    return {
      title: "Remove yellowing or damaged leaves.",
      detail: "Trim damaged houseplant leaves with clean scissors so the plant can focus on healthy growth.",
      terms: ["node"],
      priority: "normal",
      source: hasRecentPhotoContext ? "photo-aware-local" : "local-rules"
    };
  }

  return null;
}

export function getPruningTermsInText(text: string): PruningTermKey[] {
  const normalized = normalize(text);
  return (Object.keys(pruningTermExplainers) as PruningTermKey[]).filter((term) => normalized.includes(normalize(term)));
}

export function hasRecentPruningActivity(tasks: CareTask[], plantId: string, withinDays = 1) {
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return tasks.some((task) => {
    if (task.plantInstanceId !== plantId || task.status !== "done" || (task.type !== "pruning" && task.type !== "deadheading")) {
      return false;
    }
    const completedAt = new Date(task.dueAt).getTime();
    return !Number.isNaN(completedAt) && completedAt >= cutoff;
  });
}

function matchesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(normalize(needle)));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}
