/**
 * Cognition Lab - Curriculum Knowledge Graph & Pedagogical Matrix
 * Targeted at Students Aged 13-15 (Classes 7, 8, and 9)
 */

export const CURRICULUM = {
  // 1. The 4 Core Criteria
  criteria: [
    {
      id: "cognitive",
      name: "1. Cognitive Dimension",
      short: "Cognitive",
      icon: "🧠",
      color: "#38bdf8",
      description: "Mapping every lesson to high-level thinking—Apply, Analyze, Design, and Evaluate—instead of rote memorization."
    },
    {
      id: "soft_skills",
      name: "2. Humanistic & Soft Skills",
      short: "Humanistic",
      icon: "🤝",
      color: "#34d399",
      description: "Embedding Critical Thinking, Ethics, Environmental Sustainability, Teamwork, and Lifelong Learning into daily challenges."
    },
    {
      id: "technical_mastery",
      name: "3. Technical Mastery",
      short: "Technical",
      icon: "⚙️",
      color: "#f59e0b",
      description: "Developing Deep Domain Expertise, Software/Hardware Tool Proficiencies, and industry-specific methodologies."
    },
    {
      id: "societal_vector",
      name: "4. Societal & Career Vector",
      short: "Societal",
      icon: "🚀",
      color: "#a855f7",
      description: "Pre-mapping Career Progression, Leadership Roles, Entrepreneurship, Professional Ethics, and direct contributions to society."
    }
  ],

  // 2. The 10 Revolutionary Teaching Methods
  methods: [
    {
      code: "a",
      name: "First Principles Thinking",
      tagline: "The Foundational Truths Method",
      description: "Breaking a complex problem down to its most basic, foundational truths and building a brand-new solution from scratch."
    },
    {
      code: "b",
      name: "Synthesis",
      tagline: "Multi-Variable Systems Method",
      description: "Highly complex simulations with hidden rules, changing variables, and no clear single answer."
    },
    {
      code: "c",
      name: "Ethical Radical",
      tagline: "Moral Gray Area Method",
      description: "Presenting heavy, real-world moral gray areas and structural debates where variables change midway."
    },
    {
      code: "d",
      name: "Project Based Learning",
      tagline: "The Physical Build Method",
      description: "Designing, engineering, and launching physical or conceptual models to solve targeted challenges (50% Physical Model)."
    },
    {
      code: "e",
      name: "Real Life Market Exposure",
      tagline: "Industry Immersion Method",
      description: "Direct field research, structural interactions, and operational case studies within active local enterprises."
    },
    {
      code: "g",
      name: "Reverse-Engineering",
      tagline: "The Deconstruction Method",
      description: "Dismantling complex finished products or systems to map out their internal architecture and diagnose issues."
    },
    {
      code: "h",
      name: "Time-Capsule Immersion",
      tagline: "Historical Constraints Method",
      description: "Placing students within a past era to rediscover breakthroughs using only the tools of that time."
    },
    {
      code: "i",
      name: "The Live Sandbox",
      tagline: "Skin in the Game Method",
      description: "Allocating small capital funds or real assets to student teams to experience authentic risk, reward, and accountability."
    },
    {
      code: "j",
      name: "Bio-Mimicry Auditing",
      tagline: "Nature-to-Tech Method",
      description: "Extracting biological data, patterns, and strategies from nature to design technology or engineering solutions."
    },
    {
      code: "k",
      name: "Blind-Variable Crises",
      tagline: "Chaos Management Method",
      description: "Intentionally removing critical data or injecting sudden environmental disruptions midway through execution."
    }
  ],

  // 3. The 5 Interdisciplinary Domains
  domains: [
    {
      id: "domain-1",
      number: 1,
      name: "The Bio-Tech & Living Systems Loop",
      color: "#10b981",
      subjects: ["Chemistry", "Biology", "Botany", "Zoology", "Genetics", "Biotechnology"],
      accent: "emerald"
    },
    {
      id: "domain-2",
      number: 2,
      name: "The Physical Build Loop",
      color: "#3b82f6",
      subjects: ["Pure Mathematics", "Applied Mathematics", "Physics", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering"],
      accent: "blue"
    },
    {
      id: "domain-3",
      number: 3,
      name: "The Earth, Society & Human Progress Loop",
      color: "#06b6d4",
      subjects: ["Earth Science", "Geography"],
      accent: "cyan"
    },
    {
      id: "domain-4",
      number: 4,
      name: "The Market Execution & Business Loop",
      color: "#f59e0b",
      subjects: ["Economics", "Business Administration", "Financial Management", "Mass Communication"],
      accent: "amber"
    },
    {
      id: "domain-5",
      number: 5,
      name: "The Digital Frontier & Security Loop",
      color: "#8b5cf6",
      subjects: ["Computer Science", "Software Engineering", "Information Technology", "Cybersecurity", "Artificial Intelligence"],
      accent: "purple"
    }
  ],

  // 4. All 6 Simulation Missions
  missions: [
    {
      id: "sim-plant-npk",
      title: "NPK Ecosystem Stability & Crisis",
      domainId: "domain-1",
      domainName: "Domain 1: The Bio-Tech & Living Systems Loop",
      subjects: ["Botany", "Chemistry", "Soil Ecology"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Nutrition in Plants, Soil Composition, Acids & Bases",
        class8: "Crop Production & Management, Microorganisms",
        class9: "Improvement in Food Resources, Natural Resources & Biogeochemical Cycles"
      },
      durationMinutes: 25,
      activeMethods: ["a", "k", "c", "d"],
      activeCriteria: ["cognitive", "soft_skills", "technical_mastery"],
      summary: "Diagnose soil chemical collapse after severe rainfall. Balance Nitrogen, Phosphorus, and Potassium under time pressure, navigate a sudden Potassium supply shock, and confront an ethical harvest dilemma.",
      pilotBadge: "Pilot Showcase Simulation"
    },
    {
      id: "sim-heart-pump",
      title: "Bio-Mimicry Heart Pump Design",
      domainId: "domain-1",
      domainName: "Domain 1: The Bio-Tech & Living Systems Loop",
      subjects: ["Biology", "Zoology", "Biotechnology", "Fluid Mechanics"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Transportation in Animals & Plants, Circulatory System",
        class8: "Cell Biology, Organ Systems",
        class9: "Life Processes, Heart Anatomy & Hemodynamics"
      },
      durationMinutes: 25,
      activeMethods: ["a", "j", "b", "d"],
      activeCriteria: ["cognitive", "technical_mastery", "societal_vector"],
      summary: "Interactive 4-chamber cardiovascular engine with blood flow dynamics. Calibrate heart rate, stroke volume, and arterial stenosis, then perform a bio-mimicry comparative audit against 2-chamber fish and 3-chamber frog hearts.",
      pilotBadge: "Mission 1"
    },
    {
      id: "sim-bridge-builder",
      title: "Himmatnagar-Ahmedabad Bridge Under Budget",
      domainId: "domain-2",
      domainName: "Domain 2: The Physical Build Loop",
      subjects: ["Physics", "Civil Engineering", "Applied Mathematics"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Force, Motion, Simple Machines",
        class8: "Pressure, Sound, Energy & Vibration",
        class9: "Work, Energy, Gravitation & Newton's Laws"
      },
      durationMinutes: 25,
      activeMethods: ["a", "b", "i", "d"],
      activeCriteria: ["cognitive", "technical_mastery", "societal_vector"],
      summary: "Engineer a structural truss bridge across a 30m chasm with a strict ₹700 virtual budget. Subject your design to 7 Vehicle stress tests with real-time tensor failure visualizations.",
      pilotBadge: "Mission 2"
    },
    {
      id: "sim-urban-heat",
      title: "Urban Heat Island: 1950s vs 2020s",
      domainId: "domain-3",
      domainName: "Domain 3: The Earth, Society & Human Progress Loop",
      subjects: ["Earth Science", "Geography", "Thermodynamics"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Heat, Climate & Weather, Natural Resources",
        class8: "Pollution of Air & Water, Land Utilization",
        class9: "Climate Systems, Natural Vegetation, Earth as a Heat Engine"
      },
      durationMinutes: 25,
      activeMethods: ["h", "a", "c", "d"],
      activeCriteria: ["cognitive", "soft_skills", "societal_vector"],
      summary: "Investigate microclimate divergence between 1950s vegetative cover and 2020s concrete sprawl. Manipulate albedo, canopy density, and anthropogenic emissions, then resolve an ethical municipal thermal zoning debate.",
      pilotBadge: "Mission 3"
    },
    {
      id: "sim-mandi-arbitrage",
      title: "The Sabarkantha Mandi Arbitrage Engine",
      domainId: "domain-4",
      domainName: "Domain 4: The Market Execution & Business Loop",
      subjects: ["Economics", "Financial Management", "Commercial Arithmetic"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Comparing Quantities, Percentage, Profit & Loss",
        class8: "Compound Interest, Proportions, Rational Quantities",
        class9: "Economics: Story of Village Palampur, Food Security in India"
      },
      durationMinutes: 25,
      activeMethods: ["e", "k", "a", "d"],
      activeCriteria: ["cognitive", "technical_mastery", "societal_vector"],
      summary: "Deliberately high-focus, authentic accounting ledger. Balance cold-storage electricity overhead, freight transport decay, and commodity spot margins. Solve sudden Mandi price-crash crises with verification locks.",
      pilotBadge: "Mission 4"
    },
    {
      id: "sim-ransomware",
      title: "Cybersecurity Crisis: Ransomware Defense",
      domainId: "domain-5",
      domainName: "Domain 5: The Digital Frontier & Security Loop",
      subjects: ["Computer Science", "Cybersecurity", "Network Architecture"],
      classes: [7, 8, 9],
      textbookLinks: {
        class7: "Digital Citizenship, Computer Networks & Safety",
        class8: "Cyber Security Fundamentals, Python Basics",
        class9: "Computer System Architecture, Cryptography & Network Protocols"
      },
      durationMinutes: 25,
      activeMethods: ["a", "k", "b", "d"],
      activeCriteria: ["cognitive", "technical_mastery", "soft_skills"],
      summary: "Defend an enterprise hospital network against a propagating ransomware worm. Toggle firewall rules, sever lateral infection links, deploy limited cryptographic decryptors, and initiate cold backups within a 25-minute timer.",
      pilotBadge: "Mission 5"
    }
  ]
};
