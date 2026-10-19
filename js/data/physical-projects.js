/**
 * 50% Physical Model: Hands-on Classroom Physical Engineering Builds
 * Every digital simulation is paired with an authentic physical build project.
 */

export const PHYSICAL_PROJECTS = {
  "sim-plant-npk": {
    simTitle: "NPK Ecosystem Stability & Crisis",
    projectTitle: "The Closed-Loop Hydroponic Wick Column & Colorimetric Titration Lab",
    domain: "Domain 1: Bio-Tech & Living Systems",
    duration: "45-60 Minutes Lab Session",
    materials: [
      "2x Clear 1-liter plastic bottles (cut into inverted funnel reservoirs)",
      "Braided untreated cotton wicks (15cm)",
      "Inert substrate: Coco-coir & perlite mix (neutral pH)",
      "NPK stock nutrient solutions: Urea (N), Single Super Phosphate (P), Muriate of Potash (K)",
      "Universal liquid pH indicator & soil NPK test capsule strips",
      "Sprouted Mung bean (Vigna radiata) seedlings",
      "50mL graduated syringes and safety gloves"
    ],
    engineeringProtocol: [
      "Step 1 (Reservoir Fabrication): Invert top half of bottle into bottom base, thread cotton wick through cap hole into root bed.",
      "Step 2 (Nutrient Formulation): Calculate exact dilution ratios derived from the digital simulation (Target: 50ppm N, 30ppm P, 20ppm K).",
      "Step 3 (The Leaching Crisis Trigger): Pour 250mL of simulated acidic rain (water + diluted vinegar pH 4.5) through one test column to physically induce potassium leaching.",
      "Step 4 (Colorimetric Audit): Extract run-off leachate into test tubes, add chemical reagent drops, and compare against standard color cards.",
      "Step 5 (Bio-buffering Intervention): Formulate an emergency organic compost-tea amendment to restore root zone cation exchange without chemical K."
    ],
    testingRig: "Daily root elongation measurement grid (mm) and leaf chlorophyll color chart tracking over 7 days.",
    firstPrinciplesConnection: "Physical roots cannot instantly uptake chemical ions without osmotic equilibrium. Students physically witness how salt concentration burns root hairs when P & K exceed threshold limits.",
    safetyNotes: "Wear protective splash goggles when handling nutrient salts and acid titrants."
  },

  "sim-heart-pump": {
    simTitle: "Bio-Mimicry Heart Pump Design",
    projectTitle: "The Dual-Chamber Syringe & Ball-Valve Mechanical Hemodynamic Rig",
    domain: "Domain 1: Bio-Tech & Living Systems",
    duration: "45-60 Minutes Lab Session",
    materials: [
      "2x 50mL Luer-lock plastic syringes (acting as Atrium and Ventricle)",
      "2x One-way inline aquarium check valves (acting as Mitral and Aortic valves)",
      "50cm Clear surgical silicone tubing (ID 6mm)",
      "T-connectors and screw pinch clamps (for adjustable arterial stenosis/blockage)",
      "Colored fluid: Blue water (venous return reservoir) and Red water (arterial discharge)",
      "Clear plastic manometer tube with centimeter measurement scale",
      "Mechanical desktop push-lever or hand-pump trigger mechanism",
      "Stopwatch and measuring beaker"
    ],
    engineeringProtocol: [
      "Step 1 (Valvular Circuitry): Assemble syringes in series with one-way check valves oriented to permit unidirectional forward flow.",
      "Step 2 (Stroke Volume Calibration): Draw 30mL fluid into the ventricle syringe, cycle the plunger, and measure expelled volume per stroke into the beaker.",
      "Step 3 (Pressure Derivation): Connect the vertical manometer tube downstream. Pump at 60 BPM and measure liquid column height (cm H2O) converted to mmHg ($P = \rho g h$).",
      "Step 4 (Simulating Stenosis): Tighten the screw clamp to restrict tube diameter by 50% and 80%. Observe the sudden spike in upstream pressure and pump resistance.",
      "Step 5 (Bio-Mimicry Comparison): Reconfigure circuit into a single-loop fish model (one valve, one syringe) to contrast work energy required vs the dual mammalian system."
    ],
    testingRig: "Manometer pressure column height and volumetric flow rate ($Q = V / \Delta t$) measured with graduated cylinder.",
    firstPrinciplesConnection: "Connects Boyle's Law ($P_1V_1 = P_2V_2$) and Poiseuille's Law of laminar flow resistance ($R \propto 1/r^4$), showing why 50% stenosis increases resistance 16-fold!",
    safetyNotes: "Ensure all hose clamps are tightened before cycling to prevent pressurized fluid spray."
  },

  "sim-bridge-builder": {
    simTitle: "Himmatnagar-Ahmedabad Bridge Under Budget",
    projectTitle: "The Balsa & Gusset-Plate Shake-Table Truss Challenge",
    domain: "Domain 2: Physical Build",
    duration: "60-90 Minutes Lab Session",
    materials: [
      "Standard birch/balsa craft sticks (114mm x 10mm x 2mm)",
      "Quick-setting PVA wood glue & cardstock gusset plates",
      "30cm foam-board abutments (spanning a 25cm physical canyon)",
      "Budget currency ledger: Sticks cost ₹10 each, Gusset joints cost ₹5 each (Max ₹700 cap)",
      "Motorized variable-speed DC eccentric motor shake-table (or smartphone vibration accelerometer rig)",
      "1kg calibrated lead weights / sand bags",
      "Precision digital scale and dial caliper"
    ],
    engineeringProtocol: [
      "Step 1 (Budget Audit): Formulate cutting schedule and bill of materials within the ₹700 physical currency limit.",
      "Step 2 (Truss Assembly): Construct identical left and right planar trusses (Warren, Pratt, or Howe configuration) using triangle geometry.",
      "Step 3 (Cross-Bracing & Decking): Connect trusses with transverse sway struts and tension cross-ties to prevent torsional buckling.",
      "Step 4 (Static Load Verification): Place bridge across abutments. Incrementally load 500g and 1000g center weights; measure deflection with ruler.",
      "Step 5 (Seismic Shake-Table Test): Mount bridge on the shake table. Ramp motor frequency from 2 Hz (Richter 4 equivalent) up to 8 Hz resonance. Record failure mode (buckling vs joint shear)."
    ],
    testingRig: "Shake-table with accelerometer logging frequency (Hz) and g-force until structural catastrophic rupture.",
    firstPrinciplesConnection: "Demonstrates vector equilibrium ($\Sigma F_x = 0, \Sigma F_y = 0, \Sigma M = 0$) and highlights how triangles transfer loads exclusively through pure tension and compression rather than bending.",
    safetyNotes: "Keep hands clear of the vibrating table during high-frequency resonance testing."
  },

  "sim-urban-heat": {
    simTitle: "Urban Heat Island: 1950s vs 2020s",
    projectTitle: "The Multi-Surface Albedo & Microclimate Calorimeter Chamber",
    domain: "Domain 3: Earth, Society & Progress",
    duration: "45-60 Minutes Lab Session",
    materials: [
      "3x Insulated cardboard miniature urban pavilions (15cm x 15cm x 15cm)",
      "Roof Surface 1 (Modern Asphalt): Black tar-paper roofing",
      "Roof Surface 2 (Cool-Roof Mitigation): Titanium white reflective acrylic coating",
      "Roof Surface 3 (1950s Biophilic): Living moss/sedum green vegetative carpet",
      "150W Infrared heat lamp (simulating intense solar insolation)",
      "Digital dual-probe thermistor thermometers (internal air temp & surface temp)",
      "Infrared laser non-contact thermometer",
      "Small 5V micro-fan (simulating urban wind canyon effect)"
    ],
    engineeringProtocol: [
      "Step 1 (Chamber Setup): Install internal temperature probes inside each of the 3 miniature buildings at identical depths.",
      "Step 2 (Baseline Equilibrium): Record ambient baseline temperature across all three chambers under ambient classroom lighting.",
      "Step 3 (Solar Radiation Cycle): Position infrared lamp 40cm equidistant above the models. Turn on lamp for 15 minutes.",
      "Step 4 (Thermal Logging): Record surface and internal temperatures every 60 seconds. Plot heating curves in lab notebooks.",
      "Step 5 (Thermal Mass & Dissipation): Turn off heat lamp. Measure thermal retention decay rate over 10 minutes to verify night-time urban heat island effect.",
      "Step 6 (Ethical Policy Mapping): Calculate cost of painting 10,000 sq ft of roofs in local municipal zones vs planting urban trees."
    ],
    testingRig: "Dual digital thermistors + IR non-contact pyrometer logging $\Delta T$ ($^\circ\text{C}$) over time.",
    firstPrinciplesConnection: "Validates the Stefan-Boltzmann radiation law ($j^* = \epsilon \sigma T^4$) and sensible vs latent heat flux via plant evapotranspiration.",
    safetyNotes: "Do not touch the heat lamp bulb during or immediately following operation."
  },

  "sim-mandi-arbitrage": {
    simTitle: "The Sabarkantha Mandi Arbitrage Engine",
    projectTitle: "The Live Commodity Pit & Cold-Chain Perishability Ledger",
    domain: "Domain 4: Market Execution & Business",
    duration: "45-60 Minutes Lab Session",
    materials: [
      "Tokenized commodity vouchers (Castor, Groundnut, Cotton, Wheat)",
      "Physical double-entry printed ledger balance sheets",
      "Play capital currency notes (₹50,000 seed fund per student team)",
      "Physical commodity sample jars (actual grains/seeds for moisture testing)",
      "Dice-roll disruption deck: Diesel price hike, Mandi strike, sudden flash rain, highway toll blockade",
      "Digital kitchen scale (to measure actual moisture evaporation loss in wet grain samples)",
      "Wall market ticker chalkboard and countdown bell"
    ],
    engineeringProtocol: [
      "Step 1 (Capital Allocation): Teams receive ₹50,000 capital and analyze the opening APMC Mandi commodity spot quotes.",
      "Step 2 (Freight & Cold Chain Route Planning): Teams calculate transport route costs (₹12/km/quintal) vs warehouse cold-storage refrigeration rates.",
      "Step 3 (The Unseasonal Price Shock): Roll the crisis dice: A sudden Mandi market dump slashes spot wheat prices by 35%!",
      "Step 4 (Ledger Settlement Lock): Teams must physically compute Gross Margin %, Net Profit/Loss %, Break-even Price, and Return on Capital Invested (ROCI).",
      "Step 5 (Arbitrage Clearance): Settle contracts with the Mandi Commission Agent desk. Teams with ledger calculation errors pay penalty interest."
    ],
    testingRig: "Reconciled double-entry financial audit sheet verified against classroom market clearing prices.",
    firstPrinciplesConnection: "Transforms abstract algebra and percentages into survival arithmetic: students feel the visceral consequences of cash flow, carrying cost, and compound inventory loss.",
    safetyNotes: "Keep grain samples sealed in jars to prevent classroom spills."
  },

  "sim-ransomware": {
    simTitle: "Cybersecurity Crisis: Ransomware Defense",
    projectTitle: "The Air-Gapped Physical Network Topology & Fail-Safe Cut-Switch",
    domain: "Domain 5: Digital Frontier & Security",
    duration: "45-60 Minutes Lab Session",
    materials: [
      "Solderless electronics breadboard & 9V battery with snap connector",
      "6x Bi-color LEDs (Red/Green) representing servers, firewall, and workstations",
      "Push-button micro-switches (acting as manual subnet isolation switches)",
      "Rotary potentiometer (simulating network bandwidth & encryption propagation rate)",
      "1k-ohm current limiting resistors and jumper wires",
      "Physical Paper Cryptographic Cipher Strips (Caesar/Vigenère substitution wheels)",
      "Red acrylic laser pointer and countdown stopwatch"
    ],
    engineeringProtocol: [
      "Step 1 (Topology Breadboarding): Wire 6 LED nodes in a networked tree topology on the breadboard. When powered, all nodes glow green.",
      "Step 2 (Infection Propagation): Connect a cascading transistor/capacitor circuit that triggers an automated sequential LED color shift to red every 15 seconds.",
      "Step 3 (Emergency Cut-Off): Students must rapidly locate the specific jumper wire corresponding to the infected subnet and disconnect it before the main database LED turns red.",
      "Step 4 (Cryptographic Key Decryption): Solve a real physical modular arithmetic cipher challenge ($C \equiv P^e \pmod n$) to unlock the paper backup safe key.",
      "Step 5 (Fail-Safe Verification): Restore power through an isolated secondary rail to prove data recovery without reinfecting the network."
    ],
    testingRig: "Breadboard circuit continuity test with multimeter; stopwatch tracking incident response latency.",
    firstPrinciplesConnection: "Demonstrates physical air-gapping, electrical and logical segmentation, and the mathematical irreversibility of one-way trapdoor functions in asymmetric cryptography.",
    safetyNotes: "Ensure 9V battery clips are properly oriented to prevent reverse polarity and LED damage."
  }
};
