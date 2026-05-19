import { PlantSpecies } from "../domain";

export type PlantKnowledge = {
  commonName: string;
  scientificName?: string;
  visual: string;
  lightNeeds: string;
  watering: string;
  feeding: string;
  soil: string;
  spacing?: string;
  companions: string[];
  badCompanions: string[];
  pestsDiseases: string[];
  naturalControls: string[];
  seedTransplantNotes?: string;
  pruningHarvestNotes?: string;
  toxicity?: string;
};

const fallbackKnowledge: PlantKnowledge = {
  commonName: "Garden Plant",
  visual: "G",
  lightNeeds: "Match placement to the plant tag and observe stress after weather changes.",
  watering: "Check soil moisture before watering.",
  feeding: "Feed lightly during active growth.",
  soil: "Well-draining garden soil with organic matter.",
  companions: ["basil", "marigold", "chives"],
  badCompanions: [],
  pestsDiseases: ["aphids", "mildew", "transplant shock"],
  naturalControls: ["inspect leaves", "improve airflow", "remove damaged growth"]
};

export const plantKnowledge: Record<string, PlantKnowledge> = {
  basil: {
    commonName: "Basil",
    scientificName: "Ocimum basilicum",
    visual: "B",
    lightNeeds: "Full sun to part sun; protect from cold wind.",
    watering: "Moderate, even moisture. Avoid letting young plants dry hard.",
    feeding: "Light feeder. Too much nitrogen can reduce flavor.",
    soil: "Rich, well-drained soil or container mix.",
    spacing: "8-12 in apart.",
    companions: ["tomato", "pepper", "marigold"],
    badCompanions: ["sage"],
    pestsDiseases: ["aphids", "downy mildew", "cold stress"],
    naturalControls: ["pinch regularly", "water soil not leaves", "increase airflow"],
    seedTransplantNotes: "Transplant outdoors after nights stay reliably warm.",
    pruningHarvestNotes: "Pinch above leaf pairs to branch; harvest before flowering."
  },
  tomato: {
    commonName: "Tomato",
    scientificName: "Solanum lycopersicum",
    visual: "T",
    lightNeeds: "Full sun, 6-8+ hours.",
    watering: "High, consistent moisture. Avoid wet/dry swings.",
    feeding: "Heavy feeder once flowering begins.",
    soil: "Compost-rich, well-drained soil.",
    spacing: "18-24 in apart depending on support.",
    companions: ["basil", "marigold", "chives", "parsley"],
    badCompanions: ["brassicas", "fennel"],
    pestsDiseases: ["hornworms", "early blight", "septoria leaf spot"],
    naturalControls: ["stake early", "prune lower leaves", "mulch", "remove spotted leaves"],
    seedTransplantNotes: "Transplant deep after hardening off.",
    pruningHarvestNotes: "Harvest when colored and slightly soft; support vines before heavy fruit."
  },
  "cherry tomato": {
    commonName: "Cherry Tomato",
    scientificName: "Solanum lycopersicum var. cerasiforme",
    visual: "T",
    lightNeeds: "Full sun; trellis placement matters for shade.",
    watering: "High and consistent, especially in containers or raised beds.",
    feeding: "Moderate to heavy once flowering.",
    soil: "Compost-rich raised bed mix.",
    spacing: "18-24 in apart with support.",
    companions: ["basil", "marigold", "chives"],
    badCompanions: ["brussels sprouts", "cabbage", "fennel"],
    pestsDiseases: ["hornworms", "blight", "leaf spot", "splitting"],
    naturalControls: ["trellis early", "mulch", "water at soil level", "keep airflow open"],
    seedTransplantNotes: "Harden off gradually and plant after frost risk.",
    pruningHarvestNotes: "Pick regularly to keep production moving."
  },
  "red pepper": {
    commonName: "Red Pepper",
    scientificName: "Capsicum annuum",
    visual: "P",
    lightNeeds: "Full sun and warm sheltered placement.",
    watering: "Moderate; keep evenly moist during flowering and fruiting.",
    feeding: "Moderate feeder; avoid excessive nitrogen.",
    soil: "Warm, fertile, well-drained soil.",
    spacing: "14-18 in apart.",
    companions: ["basil", "marigold", "onion"],
    badCompanions: ["fennel"],
    pestsDiseases: ["aphids", "sunscald", "blossom end rot"],
    naturalControls: ["mulch", "avoid overhead watering", "support heavy stems"],
    seedTransplantNotes: "Needs warm soil and hardened-off transplants.",
    pruningHarvestNotes: "Harvest green or fully red when mature."
  },
  "yellow pepper": {
    commonName: "Yellow Pepper",
    scientificName: "Capsicum annuum",
    visual: "P",
    lightNeeds: "Full sun and warmth.",
    watering: "Moderate, even moisture.",
    feeding: "Moderate feeder during fruit set.",
    soil: "Warm, fertile soil with drainage.",
    spacing: "14-18 in apart.",
    companions: ["basil", "marigold", "onion"],
    badCompanions: ["fennel"],
    pestsDiseases: ["aphids", "sunscald", "blossom end rot"],
    naturalControls: ["mulch", "stake if heavy", "inspect leaf undersides"],
    seedTransplantNotes: "Protect from cold nights after planting.",
    pruningHarvestNotes: "Harvest once yellow and glossy."
  },
  jalapeno: {
    commonName: "Jalapeno",
    scientificName: "Capsicum annuum",
    visual: "J",
    lightNeeds: "Full sun.",
    watering: "Moderate; avoid soggy roots.",
    feeding: "Moderate feeder.",
    soil: "Well-drained fertile soil.",
    spacing: "12-18 in apart.",
    companions: ["basil", "marigold", "onion"],
    badCompanions: ["fennel"],
    pestsDiseases: ["aphids", "mites", "sunscald"],
    naturalControls: ["inspect new growth", "avoid overhead watering", "support fruit-heavy plants"],
    seedTransplantNotes: "Harden off slowly; peppers dislike cold.",
    pruningHarvestNotes: "Harvest green or red depending on flavor preference."
  },
  cucumber: {
    commonName: "Cucumber",
    scientificName: "Cucumis sativus",
    visual: "C",
    lightNeeds: "Full sun with good airflow.",
    watering: "High and consistent. Dry swings make bitter fruit.",
    feeding: "Moderate feeder.",
    soil: "Rich, moist, well-drained soil.",
    spacing: "12 in apart on trellis, more if sprawling.",
    companions: ["marigold", "lettuce", "dill"],
    badCompanions: ["potato", "sage"],
    pestsDiseases: ["cucumber beetles", "powdery mildew", "bacterial wilt"],
    naturalControls: ["trellis", "increase airflow", "inspect flowers/leaves", "remove diseased leaves"],
    seedTransplantNotes: "Direct sow or transplant carefully without root disturbance.",
    pruningHarvestNotes: "Harvest often while fruit is tender."
  },
  lettuce: {
    commonName: "Lettuce",
    scientificName: "Lactuca sativa",
    visual: "L",
    lightNeeds: "Part sun in heat; appreciates afternoon shade.",
    watering: "Moderate and consistent.",
    feeding: "Light feeder.",
    soil: "Cool, fertile, moisture-retentive soil.",
    spacing: "6-10 in apart depending on type.",
    companions: ["cucumber", "onion", "strawberry"],
    badCompanions: [],
    pestsDiseases: ["slugs", "aphids", "bolting"],
    naturalControls: ["shade cloth in heat", "harvest outer leaves", "keep evenly moist"],
    seedTransplantNotes: "Succession sow in cool windows.",
    pruningHarvestNotes: "Harvest outer leaves or whole heads before heat bolting."
  },
  cilantro: {
    commonName: "Cilantro",
    scientificName: "Coriandrum sativum",
    visual: "C",
    lightNeeds: "Part sun in warm weather.",
    watering: "Moderate and even.",
    feeding: "Light feeder.",
    soil: "Loose, well-drained soil.",
    spacing: "4-6 in apart.",
    companions: ["lettuce", "spinach", "tomato"],
    badCompanions: ["fennel"],
    pestsDiseases: ["bolting", "aphids"],
    naturalControls: ["succession sow", "give afternoon shade", "harvest frequently"],
    seedTransplantNotes: "Direct sow; dislikes transplanting.",
    pruningHarvestNotes: "Harvest leaves young; flowers support beneficial insects."
  },
  "green onion": {
    commonName: "Green Onion",
    scientificName: "Allium fistulosum",
    visual: "O",
    lightNeeds: "Full sun to part sun.",
    watering: "Moderate.",
    feeding: "Light to moderate.",
    soil: "Loose, fertile soil.",
    spacing: "2-4 in apart.",
    companions: ["lettuce", "pepper", "strawberry"],
    badCompanions: ["beans", "peas"],
    pestsDiseases: ["onion maggot", "thrips"],
    naturalControls: ["rotate beds", "keep weeds low", "avoid waterlogged soil"],
    pruningHarvestNotes: "Harvest stems as needed."
  },
  "brussels sprouts": {
    commonName: "Brussels Sprouts",
    scientificName: "Brassica oleracea var. gemmifera",
    visual: "B",
    lightNeeds: "Full sun.",
    watering: "Moderate and consistent.",
    feeding: "Heavy feeder.",
    soil: "Fertile, firm soil with compost.",
    spacing: "18-24 in apart.",
    companions: ["onion", "garlic", "dill", "chives"],
    badCompanions: ["tomato", "strawberry"],
    pestsDiseases: ["cabbage worms", "aphids", "clubroot"],
    naturalControls: ["inspect undersides", "use row cover", "encourage beneficial insects"],
    seedTransplantNotes: "Best as a cool-season transplant.",
    pruningHarvestNotes: "Harvest sprouts from bottom up when firm."
  },
  garlic: {
    commonName: "Garlic",
    scientificName: "Allium sativum",
    visual: "G",
    lightNeeds: "Full sun.",
    watering: "Moderate in spring; reduce near harvest.",
    feeding: "Moderate spring feeding.",
    soil: "Loose, well-drained soil.",
    spacing: "4-6 in apart.",
    companions: ["tomato", "pepper", "strawberry"],
    badCompanions: ["beans", "peas"],
    pestsDiseases: ["rust", "onion maggot", "rot"],
    naturalControls: ["avoid soggy soil", "rotate alliums", "remove infected leaves"],
    seedTransplantNotes: "Plant cloves in fall for summer harvest.",
    pruningHarvestNotes: "Harvest when lower leaves brown; cure before storage."
  },
  onion: {
    commonName: "Onion",
    scientificName: "Allium cepa",
    visual: "O",
    lightNeeds: "Full sun.",
    watering: "Moderate; consistent during bulbing.",
    feeding: "Moderate feeder.",
    soil: "Loose fertile soil.",
    spacing: "4-6 in apart.",
    companions: ["lettuce", "pepper", "brussels sprouts"],
    badCompanions: ["beans", "peas"],
    pestsDiseases: ["thrips", "onion maggot", "neck rot"],
    naturalControls: ["weed well", "rotate beds", "avoid overhead watering"],
    pruningHarvestNotes: "Harvest when tops fall and begin drying."
  },
  shallot: {
    commonName: "Shallot",
    scientificName: "Allium cepa aggregatum",
    visual: "S",
    lightNeeds: "Full sun.",
    watering: "Moderate.",
    feeding: "Moderate.",
    soil: "Loose, well-drained soil.",
    spacing: "6 in apart.",
    companions: ["lettuce", "pepper", "strawberry"],
    badCompanions: ["beans", "peas"],
    pestsDiseases: ["thrips", "rot", "onion maggot"],
    naturalControls: ["rotate alliums", "avoid soggy soil", "weed consistently"],
    pruningHarvestNotes: "Harvest when tops yellow and fall."
  },
  asparagus: {
    commonName: "Asparagus",
    scientificName: "Asparagus officinalis",
    visual: "A",
    lightNeeds: "Full sun.",
    watering: "Moderate during establishment.",
    feeding: "Compost or balanced feeding in spring.",
    soil: "Deep, well-drained perennial bed.",
    spacing: "12-18 in apart.",
    companions: ["parsley", "basil", "tomato"],
    badCompanions: ["onion", "garlic"],
    pestsDiseases: ["asparagus beetles", "rust"],
    naturalControls: ["hand-pick beetles", "keep bed clean", "support ferns"],
    seedTransplantNotes: "Crowns need patience; avoid disturbing roots.",
    pruningHarvestNotes: "Harvest lightly after establishment; let ferns feed crowns."
  },
  chives: {
    commonName: "Chives",
    scientificName: "Allium schoenoprasum",
    visual: "C",
    lightNeeds: "Full sun to part sun.",
    watering: "Moderate.",
    feeding: "Light feeder.",
    soil: "Average well-drained soil.",
    spacing: "8-12 in clumps.",
    companions: ["strawberry", "tomato", "carrot"],
    badCompanions: ["beans", "peas"],
    pestsDiseases: ["thrips", "rot"],
    naturalControls: ["divide clumps", "trim after flowering", "avoid soggy soil"],
    pruningHarvestNotes: "Cut leaves from the outside; flowers are edible."
  },
  strawberry: {
    commonName: "Strawberry",
    scientificName: "Fragaria x ananassa",
    visual: "S",
    lightNeeds: "Full sun for best fruit.",
    watering: "Moderate and consistent during flowering/fruiting.",
    feeding: "Moderate; avoid overfeeding before fruit.",
    soil: "Rich, well-drained soil with mulch.",
    spacing: "12-18 in apart.",
    companions: ["chives", "lettuce", "borage"],
    badCompanions: ["brassicas"],
    pestsDiseases: ["slugs", "gray mold", "leaf spot"],
    naturalControls: ["mulch berries", "improve airflow", "remove moldy fruit"],
    pruningHarvestNotes: "Harvest ripe berries often; manage runners."
  },
  hibiscus: {
    commonName: "Hibiscus",
    scientificName: "Hibiscus rosa-sinensis",
    visual: "H",
    lightNeeds: "Bright light to full sun.",
    watering: "High in active growth; containers dry fast.",
    feeding: "Moderate flowering plant feed.",
    soil: "Rich, well-drained potting mix.",
    companions: ["begonia", "herbs"],
    badCompanions: [],
    pestsDiseases: ["aphids", "whiteflies", "spider mites"],
    naturalControls: ["rinse leaves", "inspect buds", "prune airy shape"],
    pruningHarvestNotes: "Deadhead flowers; prune lightly for shape.",
    toxicity: "Generally considered non-toxic, but avoid pet chewing."
  },
  begonia: {
    commonName: "Begonia",
    scientificName: "Begonia spp.",
    visual: "B",
    lightNeeds: "Bright indirect light or part shade.",
    watering: "Moderate; avoid wet leaves and soggy soil.",
    feeding: "Light feeder.",
    soil: "Loose potting mix with drainage.",
    companions: ["shade herbs", "ferns"],
    badCompanions: [],
    pestsDiseases: ["powdery mildew", "stem rot", "mealybugs"],
    naturalControls: ["improve airflow", "water soil", "remove damaged leaves"],
    toxicity: "Toxic to pets if eaten, especially roots/tubers."
  },
  lily: {
    commonName: "Lily",
    scientificName: "Lilium spp.",
    visual: "L",
    lightNeeds: "Sun to part sun.",
    watering: "Moderate; avoid waterlogged bulbs.",
    feeding: "Light spring feeding.",
    soil: "Well-drained soil with cool root zone.",
    companions: ["chives", "low perennials"],
    badCompanions: [],
    pestsDiseases: ["lily beetles", "botrytis", "aphids"],
    naturalControls: ["inspect leaves", "hand-remove beetles", "remove diseased foliage"],
    pruningHarvestNotes: "Deadhead flowers; leave foliage until yellow.",
    toxicity: "Highly toxic to cats."
  },
  "snake plant": {
    commonName: "Snake Plant",
    scientificName: "Dracaena trifasciata",
    visual: "S",
    lightNeeds: "Low to bright indirect light.",
    watering: "Low. Let soil dry thoroughly.",
    feeding: "Very light feeding in growing season.",
    soil: "Fast-draining cactus/succulent mix.",
    companions: ["pothos", "parlor palm"],
    badCompanions: [],
    pestsDiseases: ["root rot", "mealybugs"],
    naturalControls: ["avoid overwatering", "wipe leaves", "isolate pests"],
    toxicity: "Toxic to cats and dogs if eaten."
  },
  "parlor palm": {
    commonName: "Parlor Palm",
    scientificName: "Chamaedorea elegans",
    visual: "P",
    lightNeeds: "Medium to low indirect light.",
    watering: "Moderate; let top soil dry slightly.",
    feeding: "Light spring/summer feeding.",
    soil: "Well-draining indoor potting mix.",
    companions: ["snake plant", "calathea"],
    badCompanions: [],
    pestsDiseases: ["spider mites", "brown tips", "root rot"],
    naturalControls: ["increase humidity", "wipe fronds", "avoid soggy soil"],
    toxicity: "Pet safe in typical references."
  },
  rosemary: {
    commonName: "Rosemary",
    scientificName: "Salvia rosmarinus",
    visual: "R",
    lightNeeds: "Full sun or very bright indoor light.",
    watering: "Low to moderate; let dry between watering.",
    feeding: "Light feeder.",
    soil: "Very well-drained gritty mix.",
    spacing: "18-24 in outdoors.",
    companions: ["thyme", "sage", "cabbage family"],
    badCompanions: ["basil"],
    pestsDiseases: ["powdery mildew", "root rot", "spider mites"],
    naturalControls: ["prune for airflow", "avoid overwatering", "give bright light"],
    pruningHarvestNotes: "Harvest sprigs; avoid cutting into old bare wood."
  },
  thyme: {
    commonName: "Thyme",
    scientificName: "Thymus vulgaris",
    visual: "T",
    lightNeeds: "Full sun.",
    watering: "Low; drought tolerant once established.",
    feeding: "Light feeder.",
    soil: "Lean, well-drained soil.",
    spacing: "8-12 in apart.",
    companions: ["strawberry", "rosemary", "brassicas"],
    badCompanions: [],
    pestsDiseases: ["root rot", "spider mites"],
    naturalControls: ["avoid wet feet", "trim after bloom", "keep airflow"],
    pruningHarvestNotes: "Harvest lightly and regularly."
  },
  parsley: {
    commonName: "Parsley",
    scientificName: "Petroselinum crispum",
    visual: "P",
    lightNeeds: "Full sun to part sun.",
    watering: "Moderate and even.",
    feeding: "Light feeder.",
    soil: "Rich, moisture-retentive soil.",
    spacing: "6-8 in apart.",
    companions: ["tomato", "asparagus", "chives"],
    badCompanions: ["mint"],
    pestsDiseases: ["parsley worms", "aphids", "leaf spot"],
    naturalControls: ["share some foliage with swallowtail caterpillars", "harvest outer stems"],
    pruningHarvestNotes: "Cut outer stems from the base."
  },
  haworthia: {
    commonName: "Haworthia",
    scientificName: "Haworthia spp.",
    visual: "H",
    lightNeeds: "Bright indirect light.",
    watering: "Low. Water deeply, then dry fully.",
    feeding: "Very light succulent feeding.",
    soil: "Fast-draining succulent mix.",
    companions: ["echeveria", "snake plant"],
    badCompanions: [],
    pestsDiseases: ["root rot", "mealybugs"],
    naturalControls: ["dry-down", "gritty soil", "inspect crown"],
    toxicity: "Generally considered non-toxic."
  },
  echeveria: {
    commonName: "Echeveria",
    scientificName: "Echeveria spp.",
    visual: "E",
    lightNeeds: "Bright light with some direct sun.",
    watering: "Low. Let soil fully dry.",
    feeding: "Very light.",
    soil: "Gritty succulent mix.",
    companions: ["haworthia", "sedum"],
    badCompanions: [],
    pestsDiseases: ["stretching", "mealybugs", "root rot"],
    naturalControls: ["increase light gradually", "avoid water in rosette", "dry-down fully"],
    toxicity: "Generally considered non-toxic."
  },
  palm: {
    commonName: "Palm",
    visual: "P",
    lightNeeds: "Bright indirect to medium light depending on species.",
    watering: "Moderate; avoid soggy soil.",
    feeding: "Light during active growth.",
    soil: "Well-draining indoor mix.",
    companions: ["snake plant", "ferns"],
    badCompanions: [],
    pestsDiseases: ["spider mites", "scale", "brown tips"],
    naturalControls: ["wipe leaves", "increase humidity", "avoid cold drafts"]
  }
};

export function getPlantKnowledge(species?: PlantSpecies, nickname?: string): PlantKnowledge {
  const names = [species?.commonName, nickname]
    .filter(Boolean)
    .map((name) => name!.toLowerCase());

  for (const name of names) {
    if (plantKnowledge[name]) {
      return plantKnowledge[name];
    }

    const partial = Object.keys(plantKnowledge).find((key) => name.includes(key) || key.includes(name));
    if (partial) {
      return plantKnowledge[partial];
    }
  }

  return {
    ...fallbackKnowledge,
    commonName: species?.commonName ?? nickname ?? fallbackKnowledge.commonName,
    scientificName: species?.scientificName
  };
}

export function getKnowledgeOptions() {
  return Object.values(plantKnowledge);
}

