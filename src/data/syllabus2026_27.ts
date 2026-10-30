/**
 * syllabus2026_27.ts
 *
 * Official academic curriculum & syllabus reference for Session 2026–27
 * Formulated under NEP 2020 / NCF-SE 2023 (Directorate of Education, GNCT of Delhi & CBSE)
 * For Classes 8th, 9th, 10th, 11th, and 12th.
 */

export interface ChapterInfo {
  number: string | number;
  name: string;
  topics: string[];
  keyCompetencies?: string[];
}

export interface SubjectSyllabus {
  curriculum: string;
  subject: string;
  code?: string;
  bookName?: string;
  chapters: ChapterInfo[];
}

export const SYLLABUS_2026_27: Record<string, Record<string, SubjectSyllabus>> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS 10 (2026-27)
  // ═══════════════════════════════════════════════════════════════════════════
  'Class 10th': {
    'Mathematics': {
      curriculum: 'Class 10th',
      subject: 'Mathematics',
      code: '041 & 241',
      chapters: [
        {
          number: 1,
          name: 'Real Numbers',
          topics: [
            'Fundamental Theorem of Arithmetic (statements, illustrations, real-life examples)',
            'Proofs of irrationality of √2, √3, √5, 3 + 2√5',
            'Applications of Fundamental Theorem to HCF, LCM and prime factorisation'
          ]
        },
        {
          number: 2,
          name: 'Polynomials',
          topics: [
            'Zeroes of a polynomial (geometrical and algebraic meaning)',
            'Relationship between zeroes and coefficients of quadratic polynomials'
          ]
        },
        {
          number: 3,
          name: 'Pair of Linear Equations in Two Variables',
          topics: [
            'Pair of linear equations and graphical method of solution',
            'Consistency and inconsistency conditions (unique solution, infinitely many, no solution)',
            'Algebraic solutions: Substitution Method and Elimination Method',
            'Simple situational and real-world word problems'
          ]
        },
        {
          number: 4,
          name: 'Quadratic Equations',
          topics: [
            'Standard form: ax² + bx + c = 0 (a ≠ 0)',
            'Solutions by factorization and by quadratic formula (-b ± √(b² - 4ac))/(2a)',
            'Discriminant D = b² - 4ac and nature of roots (two distinct real, equal real, no real roots)',
            'Situational problems based on day-to-day activities'
          ]
        },
        {
          number: 5,
          name: 'Arithmetic Progressions (AP)',
          topics: [
            'Motivation for studying AP',
            'Derivation and formula for the nth term: aₙ = a + (n-1)d',
            'Sum of the first n terms: Sₙ = n/2 [2a + (n-1)d] = n/2 [a + l]',
            'Applications of AP in solving daily life word problems'
          ]
        },
        {
          number: 6,
          name: 'Triangles',
          topics: [
            'Definitions and examples of similar figures vs congruent figures',
            'Basic Proportionality Theorem (Thales Theorem) with rigorous proof and converse',
            'Criteria for similarity of triangles: AAA/AA, SSS, and SAS (proofs & applications)'
          ]
        },
        {
          number: 7,
          name: 'Coordinate Geometry',
          topics: [
            'Cartesian coordinate plane review',
            'Distance formula: √((x₂ - x₁)² + (y₂ - y₁)²)',
            'Section formula (internal division): ((m₁x₂ + m₂x₁)/(m₁+m₂), (m₁y₂ + m₂y₁)/(m₁+m₂))',
            'Midpoint formula and collinearity applications'
          ]
        },
        {
          number: 8,
          name: 'Introduction to Trigonometry',
          topics: [
            'Trigonometric ratios of an acute angle of a right-angled triangle (sin, cos, tan, cot, sec, cosec)',
            'Values of trigonometric ratios of standard angles: 0°, 30°, 45°, 60°, 90°',
            'Trigonometric identities: Proof and applications of sin²A + cos²A = 1, 1 + tan²A = sec²A, 1 + cot²A = cosec²A'
          ]
        },
        {
          number: 9,
          name: 'Heights and Distances (Applications of Trigonometry)',
          topics: [
            'Angle of elevation and Angle of depression',
            'Simple real-life problems on heights and distances involving maximum two right triangles',
            'Angles restricted to 30°, 45°, and 60°'
          ]
        },
        {
          number: 10,
          name: 'Circles',
          topics: [
            'Tangent to a circle at point of contact',
            'Theorem proof: The tangent at any point is perpendicular to the radius through the point of contact',
            'Theorem proof: The lengths of tangents drawn from an external point to a circle are equal',
            'Applications of circle tangents'
          ]
        },
        {
          number: 11,
          name: 'Areas Related to Circles',
          topics: [
            'Perimeter (circumference) and area of a circle',
            'Area of sector of a circle (θ/360° × πr²)',
            'Area of segment of a circle (central angles restricted to 60°, 90°, and 120°)'
          ]
        },
        {
          number: 12,
          name: 'Surface Areas and Volumes',
          topics: [
            'Surface areas and volumes of combinations of two solids: cubes, cuboids, spheres, hemispheres, right circular cylinders and cones',
            'Conversion and combination problems'
          ]
        },
        {
          number: 13,
          name: 'Statistics',
          topics: [
            'Mean of grouped data: Direct method, Assumed mean method, Step deviation method',
            'Median of grouped frequency distribution using algebraic formula',
            'Mode of grouped frequency distribution (bimodal situations avoided)'
          ]
        },
        {
          number: 14,
          name: 'Probability',
          topics: [
            'Classical definition of theoretical probability: P(E) = Number of favourable outcomes / Total outcomes',
            'Elementary events, complementary events (P(E) + P(not E) = 1)',
            'Simple real-world problems on coins, dice, playing cards, and likelihood of everyday events'
          ]
        }
      ]
    },
    'Science': {
      curriculum: 'Class 10th',
      subject: 'Science',
      code: '086',
      chapters: [
        {
          number: 1,
          name: 'Chemical Reactions and Equations',
          topics: [
            'Chemical equation and writing balanced chemical equations',
            'Types of chemical reactions: Combination, Decomposition, Displacement, Double Displacement',
            'Precipitation reactions, Exothermic and Endothermic reactions',
            'Oxidation and Reduction (redox reactions), Corrosion and Rancidity'
          ]
        },
        {
          number: 2,
          name: 'Acids, Bases and Salts',
          topics: [
            'Definitions in terms of H⁺ and OH⁻ ions',
            'Chemical properties of acids and bases, reaction with metals, metal carbonates, metal oxides',
            'pH scale concept and importance of pH in everyday life (digestion, tooth decay, soil)',
            'Preparation, properties and uses of Sodium Hydroxide (Chlor-alkali process), Bleaching Powder (CaOCl₂), Baking Soda (NaHCO₃), Washing Soda (Na₂CO₃·10H₂O), Plaster of Paris (CaSO₄·½H₂O)'
          ]
        },
        {
          number: 3,
          name: 'Metals and Non-Metals',
          topics: [
            'Physical and chemical properties of metals and non-metals',
            'Reactivity series of metals',
            'Formation and properties of ionic compounds',
            'Basic metallurgical processes: extraction of metals (low, medium, high reactivity), roasting, calcination, refining',
            'Corrosion and its prevention (galvanisation, painting, alloying)'
          ]
        },
        {
          number: 4,
          name: 'Carbon and its Compounds',
          topics: [
            'Covalent bonding in carbon compounds',
            'Versatile nature of carbon (catenation, tetravalency)',
            'Saturated and unsaturated hydrocarbons (alkanes, alkenes, alkynes), Homologous series',
            'IUPAC nomenclature of functional groups: halogens, alcohols, ketones, aldehydes, carboxylic acids',
            'Chemical properties of carbon compounds: combustion, oxidation, addition, substitution',
            'Properties and uses of Ethanol and Ethanoic acid',
            'Soaps and detergents, cleansing action and micelle formation'
          ]
        },
        {
          number: 5,
          name: 'Life Processes',
          topics: [
            'Concept of living being and life processes overview',
            'Nutrition: Autotrophic (photosynthesis, stomata, light reaction) and Heterotrophic (human alimentary canal, digestive enzymes)',
            'Respiration: Aerobic vs anaerobic respiration, ATP production, human respiratory system',
            'Transportation: Human circulatory system (heart structure, double circulation, blood, lymph), plant transport (xylem and phloem)',
            'Excretion: Human excretory system (nephron structure and urine formation), excretion in plants'
          ]
        },
        {
          number: 6,
          name: 'Control and Co-ordination',
          topics: [
            'Tropic movements in plants (phototropism, geotropism, hydrotropism, chemotropism)',
            'Plant hormones: Auxin, Gibberellin, Cytokinin, Abscisic Acid',
            'Nervous system in animals: Neuron structure, neuromuscular junction, reflex action and reflex arc',
            'Human brain: Forebrain, midbrain, hindbrain and their functions',
            'Chemical coordination: Endocrine glands and animal hormones (thyroxin, growth hormone, insulin, adrenaline, testosterone, oestrogen)'
          ]
        },
        {
          number: 7,
          name: 'Reproduction (How do Organisms Reproduce?)',
          topics: [
            'Asexual reproduction: Fission, budding, spore formation, regeneration, fragmentation, vegetative propagation',
            'Sexual reproduction in flowering plants: Flower structure, pollination (self & cross), double fertilisation, seed and fruit formation',
            'Sexual reproduction in humans: Male and female reproductive systems, gamete formation, fertilisation and embryo development',
            'Menstrual cycle and reproductive health: Family planning methods, safe sex vs HIV/AIDS, child bearing and women’s health'
          ]
        },
        {
          number: 8,
          name: 'Heredity',
          topics: [
            'Heredity and inherited traits',
            'Mendel’s contributions: Monohybrid cross (3:1, 1:2:1) and Dihybrid cross (9:3:3:1), Laws of Inheritance',
            'Sex determination in humans (XX and XY chromosomes)'
          ]
        },
        {
          number: 9,
          name: 'Light: Reflection and Refraction',
          topics: [
            'Reflection of light by curved/spherical mirrors (concave and convex)',
            'Image formation, centre of curvature, principal axis, principal focus, focal length',
            'Mirror formula: 1/v + 1/u = 1/f and magnification m = -v/u',
            'Refraction of light, laws of refraction, Snell’s law, refractive index',
            'Refraction through spherical lenses (convex and concave), Lens formula: 1/v - 1/u = 1/f, magnification m = v/u, Power of lens: P = 1/f (dioptre)'
          ]
        },
        {
          number: 10,
          name: 'The Human Eye and the Colourful World',
          topics: [
            'Structure and functioning of the human eye lens, power of accommodation',
            'Defects of vision and their corrections: Myopia (concave lens), Hypermetropia (convex lens), Presbyopia',
            'Refraction of light through a triangular glass prism, dispersion of white light, spectrum, rainbow formation',
            'Atmospheric refraction: Twinkling of stars, advance sunrise and delayed sunset',
            'Scattering of light: Tyndall effect, why the sky is blue'
          ]
        },
        {
          number: 11,
          name: 'Electricity',
          topics: [
            'Electric current (I = Q/t), potential difference (V = W/Q), voltmeter and ammeter',
            'Ohm’s law: V = IR, resistance and factors affecting resistance (length, area, resistivity ρ)',
            'Resistors in series: Rₛ = R₁ + R₂ + R₃ and in parallel: 1/Rₚ = 1/R₁ + 1/R₂ + 1/R₃',
            'Heating effect of electric current, Joule’s law of heating: H = I²Rt',
            'Electric power: P = VI = I²R = V²/R, commercial unit of electric energy (kWh)'
          ]
        },
        {
          number: 12,
          name: 'Magnetic Effects of Electric Current',
          topics: [
            'Magnetic field and field lines around a bar magnet, characteristics of field lines',
            'Magnetic field due to a straight current-carrying conductor (Right-Hand Thumb Rule)',
            'Field due to a circular loop and solenoid',
            'Force on a current-carrying conductor in a magnetic field, Fleming’s Left-Hand Rule',
            'Direct current (DC) vs Alternating current (AC), frequency of AC in India (50 Hz), domestic electric circuits, earthing, fuse'
          ]
        },
        {
          number: 13,
          name: 'Our Environment',
          topics: [
            'Ecosystem: Biotic and abiotic components, producers, consumers, decomposers',
            'Food chains and food webs, 10% energy transfer law, biological magnification',
            'Environmental issues: Ozone layer depletion and CFCs, solid waste management (biodegradable vs non-biodegradable)'
          ]
        }
      ]
    },
    'Social Science': {
      curriculum: 'Class 10th',
      subject: 'Social Science',
      code: '087',
      chapters: [
        {
          number: 'Hist-1',
          name: 'The Rise of Nationalism in Europe',
          topics: ['French Revolution & the idea of the Nation', 'Making of Nationalism in Europe', 'The Age of Revolutions: 1830-1848', 'Unification of Germany and Italy', 'Visualising the Nation', 'Nationalism and Imperialism']
        },
        {
          number: 'Hist-2',
          name: 'Nationalism in India',
          topics: ['First World War, Khilafat and Non-Cooperation', 'Differing strands within the movement', 'Towards Civil Disobedience: Salt March and Dandi', 'Sense of Collective Belonging', 'Congress sessions and map work']
        },
        {
          number: 'Hist-3',
          name: 'The Making of a Global World',
          topics: ['Pre-modern world: Silk routes, conquest, disease and trade', 'Nineteenth century (1815-1914) global economy', 'Inter-war economy and the Great Depression', 'Post-war recovery and Bretton Woods institutions']
        },
        {
          number: 'Hist-5',
          name: 'Print Culture and the Modern World',
          topics: ['The first printed books in East Asia', 'Print comes to Europe & Gutenberg press', 'Print revolution and its impact', 'Reading mania and the public sphere', 'Print culture in India and religious/social reforms']
        },
        {
          number: 'Geo-1',
          name: 'Resources and Development',
          topics: ['Types of resources and resource planning in India', 'Land resources, land use pattern, land degradation and conservation', 'Soil types (Alluvial, Black, Red & Yellow, Laterite, Arid, Forest) and soil erosion']
        },
        {
          number: 'Geo-2',
          name: 'Forest and Wildlife Resources',
          topics: ['Flora and fauna in India, IUCN classification', 'Depletion of flora and fauna', 'Conservation of forest and wildlife, Project Tiger', 'Types of forests (Reserved, Protected, Unclassed), Community and conservation']
        },
        {
          number: 'Geo-3',
          name: 'Water Resources',
          topics: ['Water scarcity and need for conservation', 'Multi-purpose river projects (Bhakra Nangal, Tehri, Hirakud, Sardar Sarovar) and integrated water management', 'Rainwater harvesting techniques']
        },
        {
          number: 'Geo-4',
          name: 'Agriculture',
          topics: ['Types of farming: Primitive subsistence, Intensive subsistence, Commercial', 'Cropping pattern: Rabi, Kharif, Zaid', 'Major crops: Rice, Wheat, Millets, Pulses, Tea, Coffee, Sugarcane, Cotton, Jute', 'Technological and institutional reforms']
        },
        {
          number: 'Geo-5',
          name: 'Minerals and Energy Resources',
          topics: ['Occurrence and distribution of minerals (Iron ore, Manganese, Bauxite, Mica)', 'Conventional energy (Coal, Petroleum, Natural Gas, Thermal/Hydel)', 'Non-conventional energy (Solar, Wind, Biogas, Nuclear, Tidal, Geo-thermal)', 'Conservation of minerals and energy']
        },
        {
          number: 'Geo-6',
          name: 'Manufacturing Industries',
          topics: ['Importance and classification of manufacturing industries', 'Agro-based: Cotton, Jute, Sugar', 'Mineral-based: Iron and Steel, Aluminium smelting, Chemical, Fertilizer, Cement, Automobile, IT and Electronics', 'Industrial pollution and environmental degradation']
        },
        {
          number: 'Geo-7',
          name: 'Lifelines of National Economy',
          topics: ['Transport: Roadways (Golden Quadrilateral, National Highways), Railways, Pipelines, Waterways, Major Seaports and International Airports (Map work)']
        },
        {
          number: 'Civ-1',
          name: 'Power Sharing',
          topics: ['Case studies of Belgium and Sri Lanka', 'Majoritarianism in Sri Lanka vs Accommodation in Belgium', 'Why power sharing is desirable (Prudential and Moral reasons)', 'Forms of power sharing (horizontal, vertical, social groups, political parties)']
        },
        {
          number: 'Civ-2',
          name: 'Federalism',
          topics: ['What is Federalism? Key features', 'Coming together vs Holding together federations', 'What makes India a federal country? (Union, State, Concurrent lists)', 'How is federalism practiced in India? Linguistic states, language policy, Centre-State relations', 'Decentralisation in India: 73rd and 74th Constitutional Amendments']
        },
        {
          number: 'Civ-3',
          name: 'Gender, Religion and Caste',
          topics: ['Gender and politics: Public/private division, women’s political representation', 'Religion, communalism and politics: Communalism vs Secular state', 'Caste and politics: Caste inequalities, caste in politics and politics in caste']
        },
        {
          number: 'Civ-4',
          name: 'Political Parties',
          topics: ['Why do we need political parties? Meaning, functions, necessity', 'How many parties should we have? (One-party, two-party, multi-party)', 'National parties vs State parties in India', 'Challenges to political parties', 'How can parties be reformed?']
        },
        {
          number: 'Civ-5',
          name: 'Outcomes of Democracy',
          topics: ['How do we assess democracy’s outcomes?', 'Accountable, responsive and legitimate government', 'Economic growth and development', 'Reduction of inequality and poverty', 'Accommodation of social diversity', 'Dignity and freedom of the citizens']
        },
        {
          number: 'Eco-1',
          name: 'Development',
          topics: ['What development promises: Different people, different goals', 'Income and other goals', 'National development and comparing countries/states by Per Capita Income (PCI)', 'Income and other criteria (Infant Mortality Rate, Literacy Rate, Net Attendance Ratio)', 'Public facilities and Human Development Index (HDI)', 'Sustainability of development']
        },
        {
          number: 'Eco-2',
          name: 'Sectors of the Indian Economy',
          topics: ['Primary, Secondary, and Tertiary sectors', 'Comparing the three sectors: Historical changes and rising importance of the tertiary sector', 'Where are most people employed? Disguised unemployment in agriculture', 'How to create more employment? MGNREGA', 'Organised vs Unorganised sectors', 'Public vs Private sectors']
        },
        {
          number: 'Eco-3',
          name: 'Money and Credit',
          topics: ['Money as a medium of exchange, Barter system and double coincidence of wants', 'Modern forms of money: Currency, demand deposits, cheques', 'Loan activities of banks and terms of credit (collateral, interest rate, documentation)', 'Formal sector vs Informal sector credit in India, Role of RBI', 'Self-Help Groups (SHGs) for the poor']
        },
        {
          number: 'Eco-4',
          name: 'Globalization and the Indian Economy',
          topics: ['Production across countries and Multinational Corporations (MNCs)', 'Interlinking production across countries', 'Foreign trade and integration of markets', 'What is Globalization? Factors enabling globalization (technology, trade liberalisation, WTO)', 'Impact of globalization on India and the struggle for fair globalization']
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS 9 (2026-27 - NCF-SE 2023 REVISED SYLLABUS)
  // ═══════════════════════════════════════════════════════════════════════════
  'Class 9th': {
    'Mathematics': {
      curriculum: 'Class 9th',
      subject: 'Mathematics',
      code: '041',
      chapters: [
        {
          number: 1,
          name: 'Orienting Yourself: The Use of Coordinates',
          topics: [
            'Brief history of coordinate geometry and René Descartes',
            '2-D Cartesian coordinate system, axes, quadrants',
            'Distance between two points in the 2-D plane',
            'Midpoint of the line segment between two points',
            'Verifying geometric properties (straight line check, right-angled triangle) using coordinates'
          ]
        },
        {
          number: 2,
          name: 'Introduction to Linear Polynomials',
          topics: [
            'Algebraic expressions, definitions, terms, coefficients and degree of polynomials',
            'Introduction to linear polynomials and practical applications',
            'Modelling linear patterns, linear growth and linear decay',
            'Slope and y-intercept of a line y = ax + b, graphing linear equations in two variables'
          ]
        },
        {
          number: 3,
          name: 'The World of Numbers',
          topics: [
            'Rational numbers and representation on the number line',
            'Density of rational numbers and finding rationals between any two numbers',
            'Decimal representation of rational numbers (terminating and non-terminating recurring)',
            'Introduction to irrational numbers, proofs of irrationality of √2 and √3',
            'Construction of the square root spiral'
          ]
        },
        {
          number: 4,
          name: 'Exploring Algebraic Identities',
          topics: [
            'Visualising algebraic identities using geometrical models and algebra tiles',
            'Factorisation of algebraic and quadratic expressions using identities',
            'Identities: (a+b)², (a-b)², (a+b)(a-b), (x+a)(x+b), (a+b+c)², (a±b)³, a³±b³',
            'Simplifying rational algebraic expressions'
          ]
        },
        {
          number: 5,
          name: 'I’m Up and Down, and Round and Round (Circles)',
          topics: [
            'Circle definitions: centre, radius, diameter, chord, arc, segment, sector',
            'Unique circle through three non-collinear points, circum-circle and circum-centre',
            'Equal chords subtend equal angles at centre and converse',
            'Perpendicular from centre to chord bisects the chord and converse',
            'Angle subtended by an arc at centre is double the angle subtended at any point on remaining circle',
            'Angles in the same segment of a circle are equal, angle in a semi-circle is a right angle',
            'Concyclic points and cyclic quadrilaterals'
          ]
        },
        {
          number: 6,
          name: 'Measuring Space: Perimeter and Area',
          topics: [
            'Perimeter of shapes, circumference to diameter ratio, introduction to Pi (π) and historical approximations (Aryabhata, Archimedes)',
            'Area of shapes: rectangles, parallelograms, triangles',
            'Heron’s formula: Area = √(s(s-a)(s-b)(s-c)) and applications',
            'Squaring a rectangle: Proof from Baudhayana’s Sulbasutras',
            'Area of circle and area of sector of a circle',
            'Brahmagupta’s formula for area of cyclic quadrilateral and Heron’s formula as a special case'
          ]
        },
        {
          number: 7,
          name: 'The Mathematics of Maybe: Introduction to Probability',
          topics: [
            'Concept of probability, randomness, and the probability scale',
            'Empirical probability: analysing statistical experimental data',
            'Theoretical probability: sample space and events',
            'Representing probability through tree diagrams and tables'
          ]
        },
        {
          number: 8,
          name: 'Predicting What Comes Next: Exploring Sequences and Progressions',
          topics: [
            'Introduction to sequences, explicit and recursive rules',
            'Arithmetic Progressions (AP): nth term, visualising an AP, real-life contexts',
            'Sum of the first n natural numbers',
            'Geometric Progressions (GP): nth term, visualising a GP, applications in fractals and Tower of Hanoi puzzle'
          ]
        }
      ]
    },
    'Science': {
      curriculum: 'Class 9th',
      subject: 'Science',
      code: '086',
      chapters: [
        {
          number: 2,
          name: 'Cell: The Building Block of Life',
          topics: [
            'Discovery of cell, plant vs animal cells, prokaryotic vs eukaryotic cells',
            'Structure and function of organelles: nucleus, mitochondria, chloroplast, endoplasmic reticulum, Golgi apparatus, lysosomes, vacuoles, plasma membrane, cell wall',
            'Semi-permeability and osmosis/diffusion experiments',
            'Cell division: mitosis and meiosis overview'
          ]
        },
        {
          number: 3,
          name: 'Tissues in Action',
          topics: [
            'Levels of biological organisation in multicellular organisms',
            'Plant tissues: Meristematic (apical, intercalary, lateral) and Permanent (Parenchyma, Collenchyma, Sclerenchyma; Xylem and Phloem)',
            'Animal tissues: Epithelial, Connective (blood, bone, cartilage, ligament, tendon), Muscular (striated, smooth, cardiac), Nervous tissue',
            'Elementary idea of musculoskeletal system and posture care'
          ]
        },
        {
          number: 4,
          name: 'Describing Motion Around Us',
          topics: [
            'Distance vs displacement, speed vs velocity, acceleration',
            'Uniform and non-uniform motion along a straight line',
            'Graphical analysis: Position-time and Velocity-time graphs',
            'Derivation of kinematic equations: v = u + at, s = ut + ½at², v² = u² + 2as (by graphical method)',
            'Elementary idea of uniform circular motion'
          ]
        },
        {
          number: 5,
          name: 'Exploring Mixtures and their Separation',
          topics: [
            'Homogeneous and heterogeneous mixtures',
            'True solutions, suspensions, and colloids (properties, Tyndall effect, Brownian motion)',
            'Concentration expressions: mass/mass %, mass/volume %, volume/volume %',
            'Separation techniques: crystallisation, distillation, paper chromatography, sublimation, centrifugation, coagulation'
          ]
        },
        {
          number: 6,
          name: 'How Forces Affect Motion',
          topics: [
            'Balanced and unbalanced forces, friction',
            'Newton’s First Law of Motion and inertia',
            'Newton’s Second Law of Motion: F = ma, momentum p = mv, impulse',
            'Newton’s Third Law of Motion (action-reaction pairs) and everyday applications'
          ]
        },
        {
          number: 7,
          name: 'Work, Energy and Simple Machines',
          topics: [
            'Scientific definition of work done by a constant force: W = F·s·cosθ, Joule',
            'Work-Energy theorem',
            'Kinetic energy (Ek = ½mv²) and Gravitational potential energy (Ep = mgh) derivations',
            'Law of conservation of energy (freely falling body)',
            'Power (P = W/t, Watt), Simple machines and mechanical advantage (pulleys, levers, inclined planes)'
          ]
        },
        {
          number: 8,
          name: 'Journey Inside the Atom',
          topics: [
            'Discovery of subatomic particles: electrons, protons, neutrons',
            'Atomic models: Thomson’s model, Rutherford’s α-particle scattering experiment and nuclear model, Bohr’s model of hydrogen atom',
            'Distribution of electrons in shells (2n² rule: K, L, M, N), valency and valence electrons',
            'Atomic number (Z), Mass number (A), Isotopes and Isobars'
          ]
        },
        {
          number: 9,
          name: 'Atomic Foundations of Matter',
          topics: [
            'Laws of chemical combination: Law of conservation of mass, Law of constant proportions',
            'Dalton’s atomic theory and postulates',
            'Atoms, molecules, and ions (cations and anions)',
            'Writing chemical formulae using valency and criss-cross method',
            'Molecular mass and formula unit mass calculations'
          ]
        },
        {
          number: 10,
          name: 'Sound Waves: Characteristics and Applications',
          topics: [
            'Production of sound by vibrations, propagation as a longitudinal wave requiring a material medium',
            'Graphical representation of sound: crests, troughs, compressions, rarefactions',
            'Characteristics: wavelength (λ), frequency (f), time period (T), amplitude (A), speed v = fλ',
            'Human perception: pitch, loudness, audible range (20 Hz - 20,000 Hz)',
            'Reflection of sound: echoes, reverberation, echolocation and ultrasound applications'
          ]
        },
        {
          number: 11,
          name: 'Reproduction: How Life Continues',
          topics: [
            'Asexual vs sexual reproduction',
            'Types of asexual reproduction: budding, fission, spore formation',
            'Sexual reproduction in flowering plants: parts of flower, pollination, fertilisation, seed dispersal',
            'Sexual reproduction in humans: male and female reproductive systems, gamete formation, fertilisation, pregnancy and embryo development, menstrual cycle, reproductive health and contraception'
          ]
        },
        {
          number: 12,
          name: 'Patterns in Life: Diversity and Classification',
          topics: [
            'Need for classification of living organisms',
            'Five kingdom system of classification: Monera, Protista, Fungi, Plantae, Animalia',
            'Major divisions of plants (Thallophyta, Bryophyta, Pteridophyta, Gymnosperms, Angiosperms) and animals (Non-chordates and Chordates)',
            'Binomial nomenclature and rules (Carolus Linnaeus), acellular entities: viruses'
          ]
        },
        {
          number: 13,
          name: 'Earth as a System: Energy, Matter and Life',
          topics: [
            'Earth’s interconnected spheres: Biosphere, Geosphere, Hydrosphere, Cryosphere, Atmosphere',
            'Nature of solar energy, electromagnetic spectrum, differential heating of Earth’s surface causing winds and breezes',
            'Biogeochemical cycles: Water cycle, Carbon cycle, Nitrogen cycle, Oxygen cycle',
            'Human impacts on Earth’s balance'
          ]
        }
      ]
    },
    'Social Science': {
      curriculum: 'Class 9th',
      subject: 'Social Science',
      code: '087',
      bookName: 'Exploring Society: India and Beyond Part 1',
      chapters: [
        {
          number: 1,
          name: 'Understanding Social Science',
          topics: ['Meaning, scope and relevance of Social Science', 'Understanding Social Science from an Indian perspective', 'Interconnections between Geography, History, Political Science, Economics']
        },
        {
          number: 2,
          name: 'Shaping of the Earth’s Surface',
          topics: ['Theory of plate tectonics', 'Interior of the Earth', 'Weathering and erosion; agents of gradation (rivers, waves, wind, glaciers, groundwater)', 'Landforms and natural disasters (earthquakes, landslides, avalanches, GLOF, dust storms)']
        },
        {
          number: 3,
          name: 'Atmosphere and Climate',
          topics: ['Structure and composition of atmospheric layers', 'Elements of weather and climate', 'Seasons of India and monsoons', 'Climate change, floods, and carbon footprint']
        },
        {
          number: 4,
          name: 'Early Humans and Beginning of Civilisation',
          topics: ['Early human history and archaeological ages', 'Palaeolithic hunter-gatherers, Mesolithic transition, Neolithic revolution and farming', 'Harappan civilisation and urban development', 'Mesopotamian, Egyptian, and Chinese civilisations']
        },
        {
          number: 5,
          name: 'State and Society (upto 1000 CE)',
          topics: ['Vedic Age: geography, texts, social order and polity', 'Administrative structure of early empires (Mauryas, Guptas)', 'Educational heritage, ancient universities, knowledge traditions', 'Traders, trade routes, guilds and merchant corporations']
        },
        {
          number: 6,
          name: 'Democracy',
          topics: ['Meaning, features and types of democracy', 'Roots of early democratic traditions in India', 'Challenges to democracy in India', 'Parliamentary vs Presidential democratic systems across the world']
        },
        {
          number: 7,
          name: 'Elections',
          topics: ['Importance of elections in a democracy', 'Electoral systems and Representation of the People Acts', 'Election Commission of India (ECI) role and functions', 'Delimitation Commission, constituencies, electoral rolls', 'Party system, coalition governments, and Anti-Defection Law']
        },
        {
          number: 8,
          name: 'Building Blocks in Economics',
          topics: ['Scarcity of resources, opportunity cost and choice', 'What economists do', 'Three central problems of an economy: What to produce, How to produce, For whom to produce', 'Market, centrally planned, and mixed economic systems', 'Welfare economy and social safety nets']
        },
        {
          number: 9,
          name: 'The Price Puzzle: What Drives the Market',
          topics: ['Law of Demand and Law of Supply', 'Equilibrium price and quantity determination', 'Real-world deviations: necessities, luxury goods, perishable items', 'Price ceilings and shortages', 'Market failures: externalities, information asymmetry, public goods']
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS 8 (2026-27 - NEW NCERT / CURIOSITY CURRICULUM)
  // ═══════════════════════════════════════════════════════════════════════════
  'Class 8th': {
    'Mathematics': {
      curriculum: 'Class 8th',
      subject: 'Mathematics',
      chapters: [
        {
          number: 'T1-Ch1',
          name: 'A Square and A Cube',
          topics: ['Square numbers and patterns', 'Odd number properties and sum of odds', 'Finding square roots', 'Cubic numbers and cube roots', 'Historical context of squares and cubes']
        },
        {
          number: 'T1-Ch2',
          name: 'Power Play',
          topics: ['Experiencing power play and exponential notation', 'Laws of exponents for integer powers', 'Negative exponents and the other side of powers', 'Powers of 10 and scientific standard notation']
        },
        {
          number: 'T1-Ch3',
          name: 'A Story of Numbers',
          topics: ['Early number systems across civilizations', 'The idea of a base and base-10 systems', 'Place value representation and history of numerals']
        },
        {
          number: 'T1-Ch4',
          name: 'Quadrilaterals',
          topics: ['Rectangles and squares', 'Angle sum property of a quadrilateral (360°)', 'Parallelograms: opposite sides and opposite angles', 'Kite and Trapezium properties and verification']
        },
        {
          number: 'T1-Ch5',
          name: 'Number Play',
          topics: ['Factors and multiples properties', 'Divisibility rules for 3, 6, 9', 'Digital roots of numbers and number puzzles', 'Digits in disguise']
        },
        {
          number: 'T1-Ch6',
          name: 'We Distribute, Yet Things Multiply',
          topics: ['Properties of multiplication and Distributive property', 'Algebraic identities: (a+b)² = a² + 2ab + b²', '(a-b)² = a² - 2ab + b²', '(a+b)(a-b) = a² - b²', 'Geometric proofs by paper cutting']
        },
        {
          number: 'T1-Ch7',
          name: 'Proportional Reasoning-1',
          topics: ['Ratios and ratios in simplest form', 'Proportional reasoning and unit conversions', 'Sharing unequal quantities in a ratio']
        },
        {
          number: 'T2-Ch1',
          name: 'Fractions in Disguise',
          topics: ['Fractions as percentages and percentage calculations', 'Profit and loss percentage', 'Discount and GST applications', 'Simple and compound interest concepts']
        },
        {
          number: 'T2-Ch2',
          name: 'The Baudhayana-Pythagoras Theorem',
          topics: ['Right-angled triangles and hypotenuse relations', 'Doubling and halving a square', 'Baudhayana-Pythagoras triples and theorem verification', 'Real-world height and length measurements']
        },
        {
          number: 'T2-Ch3',
          name: 'Proportional Reasoning-2',
          topics: ['Proportionality recap and ratios with more than 2 terms', 'Ratios in maps and scale drawings', 'Dividing a whole in a given ratio', 'Pie charts and slice of the pie', 'Direct and inverse proportions']
        },
        {
          number: 'T2-Ch4',
          name: 'Exploring Some Geometric Themes',
          topics: ['Fractals in nature and art', 'Visualising 3D solids and nets of solids', 'Shortest paths on a cube', 'Isometric projections and drawing on isometric grids']
        },
        {
          number: 'T2-Ch5',
          name: 'Tales by Dots and Lines',
          topics: ['Measures of central tendency: Mean and Median with frequencies', 'Visualising and interpreting data with line graphs and infographics', 'Spreadsheets in data analysis']
        },
        {
          number: 'T2-Ch6',
          name: 'Algebra Play',
          topics: ['Thinking about "Think of a Number" tricks', 'Number pyramids and fun with grids', 'Finding largest products and decoding divisibility tricks']
        },
        {
          number: 'T2-Ch7',
          name: 'Area',
          topics: ['Area of rectangles, squares, and triangles', 'Triangles between parallel lines with a common base', 'Area of polygons: parallelograms, rhombuses, trapeziums', 'Dividing general polygons to compute area']
        }
      ]
    },
    'Science': {
      curriculum: 'Class 8th',
      subject: 'Science',
      bookName: 'Curiosity',
      chapters: [
        {
          number: 1,
          name: 'Exploring the Investigative World of Science',
          topics: ['Framing scientific questions from daily observations', 'Planning simple investigations and identifying variables (controllable vs measurable)', 'Systematic recording and interpreting of observations']
        },
        {
          number: 2,
          name: 'The Invisible Living World: Beyond Our Naked Eye',
          topics: ['Cell as the basic unit of life and main parts of the cell', 'Differentiating plant cells, animal cells, and bacterial cells', 'Microorganisms: classification and beneficial roles (curd, fermentation, compost, antibiotics)']
        },
        {
          number: 3,
          name: 'Health: The Ultimate Treasure',
          topics: ['Health as physical, mental, and social well-being', 'Communicable vs non-communicable diseases', 'Hygiene, sanitation, vector control, immunity, vaccination, and responsible use of antibiotics']
        },
        {
          number: 4,
          name: 'Electricity: Magnetic and Heating Effects',
          topics: ['Magnetic effect of electric current, compass deflection', 'Constructing electromagnets and factors affecting strength', 'Heating effect of electric current in household appliances', 'Cells, batteries, and voltaic cells']
        },
        {
          number: 5,
          name: 'Exploring Forces',
          topics: ['Force as a push or pull', 'Effects of force (speed, direction, shape)', 'Contact forces (muscular, frictional) and Non-contact forces (magnetic, electrostatic, gravitational)', 'Weight measurement using spring balance, upthrust and flotation']
        },
        {
          number: 6,
          name: 'Pressure, Winds, Storms, and Cyclones',
          topics: ['Pressure = Force / Area', 'Fluid pressure in liquids and gases (acts in all directions, increases with depth)', 'Differential air pressure causing winds, land breeze, and sea breeze', 'Storms, cyclones, and safety preparedness']
        },
        {
          number: 7,
          name: 'Particulate Nature of Matter',
          topics: ['Matter made of tiny particles (evidence from dissolution and diffusion)', 'Interparticle space and attraction in solids, liquids, and gases', 'Effects of heat and pressure on particle motion (melting, boiling, evaporation, compression)']
        },
        {
          number: 8,
          name: 'Nature of Matter: Elements, Compounds and Mixtures',
          topics: ['Classification into elements, compounds, and mixtures', 'Metals, non-metals, and metalloids characteristics', 'Separation methods: handpicking, sieving, sedimentation, decantation, filtration, evaporation']
        },
        {
          number: 9,
          name: 'The Amazing World of Solutes, Solvents and Solutions',
          topics: ['Solute, solvent, solution, and solubility', 'Saturated vs unsaturated solutions and temperature effect on solubility', 'Calculating density (mass/volume) and predicting sinking or floating']
        },
        {
          number: 10,
          name: 'Light: Mirrors and Lenses',
          topics: ['Plane, concave, and convex mirrors and image characteristics', 'Laws of reflection and ray paths', 'Convex and concave lenses (converging vs diverging light)', 'Practical applications of spherical mirrors and lenses']
        },
        {
          number: 11,
          name: 'Keeping Time with the Skies',
          topics: ['Phases of the Moon (waxing/Shukla Paksha and waning/Krishna Paksha)', 'Astronomical basis of solar day, lunar month, and year', 'Lunar, solar, and lunisolar calendars', 'Role of artificial satellites in communication and navigation']
        },
        {
          number: 12,
          name: 'How Nature Works in Harmony',
          topics: ['Biotic and abiotic components in ecosystems', 'Food chains, food webs, and trophic pyramids', 'Symbiotic interactions: mutualism and parasitism', 'Disruption of ecological balance and biodiversity conservation']
        },
        {
          number: 13,
          name: 'Our Home: Earth, a Unique Life Sustaining Planet',
          topics: ['Unique features of Earth: gravity, atmosphere, liquid water', 'Greenhouse effect, size, and magnetic field shield', 'Interdependence in biosphere, hydrosphere, geosphere', 'Reproduction processes in plants and animals']
        }
      ]
    },
    'Social Science': {
      curriculum: 'Class 8th',
      subject: 'Social Science',
      bookName: 'Exploring Society: India and Beyond Part-1',
      chapters: [
        {
          number: 1,
          name: 'Natural Resources and Their Use',
          topics: ['Distribution of natural resources', 'Renewable vs non-renewable resources', 'Conservation and sustainable use of resources', 'Mineral distribution on political map of India']
        },
        {
          number: 2,
          name: 'Reshaping India’s Political Map',
          topics: ['Reshaping boundaries between 11th and 17th centuries', 'Administrative setups: Delhi Sultanate, Deccan kingdoms, Vijayanagara, Mughals', 'Regional powers and resistance (Ahom paik system, Rajputs, Sikhs)']
        },
        {
          number: 3,
          name: 'The Rise of Marathas',
          topics: ['Factors contributing to the rise of Shivaji and Marathas', 'Administrative system of Marathas vs Mughals', 'Bhakti movement saints (Dnyaneshwar, Namdev, Tukaram, Ramdas)', 'Extent of Maratha Empire in 1759']
        },
        {
          number: 4,
          name: 'The Colonial Era in India',
          topics: ['European trading companies coming to India (1498-1858)', 'Colonial economic and political domination', 'Tribal and peasant resistance movements', 'Revolt of 1857 main centers (Delhi, Meerut, Kanpur, Lucknow, Jhansi, Barrackpore)']
        },
        {
          number: 5,
          name: 'Universal Franchise and India’s Electoral System',
          topics: ['Significance of Universal Adult Franchise in democracy', 'Stages of electoral process in India', 'Election of Lok Sabha, Rajya Sabha, and the President of India', 'Role of Election Commission']
        },
        {
          number: 6,
          name: 'The Parliamentary System: Legislature and Executive',
          topics: ['Structure and key functions of Parliament', 'Comparison between Lok Sabha and Rajya Sabha', 'Legislative vs Executive functions and how a bill becomes a law', 'Accountability and committees']
        },
        {
          number: 7,
          name: 'Factors of Production',
          topics: ['Four factors of production: Land, Labour, Capital, Entrepreneurship', 'Role of education, healthcare, and training in human capital', 'Sustainable production practices']
        }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS 11 (2026-27)
  // ═══════════════════════════════════════════════════════════════════════════
  'Class 11th': {
    'Physics': {
      curriculum: 'Class 11th',
      subject: 'Physics',
      code: '042',
      chapters: [
        { number: 1, name: 'Units and Measurements', topics: ['SI units, fundamental & derived units', 'Significant figures and uncertainty', 'Dimensions and dimensional analysis applications'] },
        { number: 2, name: 'Motion in a Straight Line', topics: ['Frame of reference, uniform and non-uniform motion', 'Calculus treatment: differentiation & integration for velocity and acceleration', 'Graphical analysis: v-t and x-t graphs', 'Kinematic relations for uniformly accelerated motion'] },
        { number: 3, name: 'Motion in a Plane', topics: ['Scalar and vector quantities, vector resolution in a plane', 'Scalar (dot) and vector (cross) products', 'Projectile motion', 'Uniform circular motion and centripetal acceleration'] },
        { number: 4, name: 'Laws of Motion', topics: ['Newton’s laws of motion, inertia, momentum and impulse', 'Conservation of linear momentum and applications', 'Equilibrium of concurrent forces, static & kinetic friction, laws of friction, rolling friction', 'Dynamics of circular motion: vehicle on level road and banked road'] },
        { number: 5, name: 'Work, Energy and Power', topics: ['Work by constant and variable force', 'Work-energy theorem, kinetic and potential energy of spring', 'Conservative and non-conservative forces, motion in vertical circle', 'Elastic and inelastic collisions in 1D and 2D'] },
        { number: 6, name: 'System of Particles and Rotational Motion', topics: ['Centre of mass of 2-particle system and rigid bodies', 'Torque, angular momentum, conservation of angular momentum', 'Equilibrium of rigid bodies and rotational kinematics', 'Moment of inertia and radius of gyration'] },
        { number: 7, name: 'Gravitation', topics: ['Kepler’s laws of planetary motion', 'Universal law of gravitation, variation of g with altitude & depth', 'Gravitational potential energy and gravitational potential', 'Escape speed, satellite orbital velocity and energy'] },
        { number: 8, name: 'Mechanical Properties of Solids', topics: ['Stress-strain relationship, Hooke’s law, Young’s modulus, bulk modulus, shear modulus, Poisson’s ratio, elastic energy'] },
        { number: 9, name: 'Mechanical Properties of Fluids', topics: ['Pascal’s law and hydraulic lift', 'Viscosity, Stokes’ law, terminal velocity, streamline & turbulent flow', 'Bernoulli’s theorem and Torricelli’s law', 'Surface tension, surface energy, angle of contact, capillary rise'] },
        { number: 10, name: 'Thermal Properties of Matter', topics: ['Thermal expansion of solids, liquids, gases, anomalous expansion of water', 'Calorimetry: specific and latent heat capacities', 'Heat transfer: conduction, convection, radiation', 'Wien’s displacement law, Stefan’s law'] },
        { number: 11, name: 'Thermodynamics', topics: ['Zeroth law, First law of thermodynamics (heat, work, internal energy)', 'Second law of thermodynamics, isothermal, adiabatic, reversible, irreversible, and cyclic processes'] },
        { number: 12, name: 'Kinetic Theory of Gases', topics: ['Equation of state, assumptions of kinetic theory, pressure of ideal gas', 'Kinetic interpretation of temperature and rms speed', 'Degrees of freedom, law of equipartition of energy, specific heats Cp and Cv, mean free path'] },
        { number: 13, name: 'Oscillations', topics: ['Simple harmonic motion (SHM), equations of motion, phase', 'Oscillations of loaded spring and simple pendulum derivation', 'Kinetic and potential energy in SHM'] },
        { number: 14, name: 'Waves', topics: ['Transverse and longitudinal waves, progressive wave equation', 'Superposition principle, standing waves in strings and organ pipes', 'Fundamental mode, harmonics, beats'] }
      ]
    },
    'Chemistry': {
      curriculum: 'Class 11th',
      subject: 'Chemistry',
      code: '043',
      chapters: [
        { number: 1, name: 'Some Basic Concepts of Chemistry', topics: ['Laws of chemical combination, Dalton’s atomic theory', 'Atomic, molecular, and molar masses, mole concept', 'Percentage composition, empirical and molecular formula, stoichiometry calculations'] },
        { number: 2, name: 'Structure of Atom', topics: ['Bohr’s model and hydrogen line spectra', 'Towards Quantum Mechanical Model: de Broglie relation, Heisenberg uncertainty principle', 'Quantum mechanical model: quantum numbers (n, l, m, s), shapes of s, p, d orbitals, Aufbau, Pauli, Hund rules'] },
        { number: 3, name: 'Classification of Elements and Periodicity in Properties', topics: ['Modern periodic law, periodic table structure (s, p, d, f blocks)', 'Periodic trends: atomic radii, ionic radii, ionization enthalpy, electron gain enthalpy, electronegativity, valency'] },
        { number: 4, name: 'Chemical Bonding and Molecular Structure', topics: ['Ionic bonding, covalent bonding, Lewis structures, bond parameters', 'VSEPR theory and molecular geometry', 'Valence bond theory, hybridization (sp, sp², sp³, sp³d, sp³d²)', 'Molecular orbital theory (homonuclear diatomics up to Ne), hydrogen bonding'] },
        { number: 5, name: 'Chemical Thermodynamics', topics: ['First law of thermodynamics: ΔU = q + w, work done, enthalpy ΔH, Hess’s law', 'Spontaneity, entropy ΔS, Gibbs free energy ΔG, ΔG° = -RT ln K'] },
        { number: 6, name: 'Equilibrium', topics: ['Dynamic equilibrium, law of mass action, Kc and Kp relationship', 'Le Chatelier’s principle', 'Ionic equilibrium: acids, bases, pH scale, ionization of weak acids/bases, buffer solutions, solubility product Ksp'] },
        { number: 7, name: 'Redox Reactions', topics: ['Oxidation and reduction concepts, oxidation numbers, balancing redox reactions (oxidation number and ion-electron methods)'] },
        { number: 8, name: 'Organic Chemistry: Some Basic Principles and Techniques', topics: ['Tetravalence of carbon, hybridization, IUPAC nomenclature of organic compounds', 'Isomerism: structural and stereoisomerism', 'Reaction mechanisms: inductive, electromeric, resonance, hyperconjugation, carbocations, carbanions, free radicals', 'Purification and qualitative/quantitative analysis'] },
        { number: 9, name: 'Hydrocarbons', topics: ['Alkanes: conformation of ethane, physical & chemical properties', 'Alkenes: geometrical isomerism, Markovnikov’s rule, ozonolysis', 'Alkynes: acidity of terminal alkynes, addition reactions', 'Aromatic hydrocarbons: benzene structure, aromaticity (Hückel’s rule), electrophilic substitution'] }
      ]
    },
    'Mathematics': {
      curriculum: 'Class 11th',
      subject: 'Mathematics',
      code: '041',
      chapters: [
        { number: 1, name: 'Sets', topics: ['Sets representation, types of sets, subsets of real numbers, intervals', 'Venn diagrams, operations: Union, Intersection, Difference, Complement of sets'] },
        { number: 2, name: 'Relations & Functions', topics: ['Cartesian product of sets, ordered pairs', 'Relations, domain, co-domain, range', 'Functions: types of functions (polynomial, rational, modulus, signum, greatest integer, exponential, logarithmic) and their graphs, algebra of functions'] },
        { number: 3, name: 'Trigonometric Functions', topics: ['Radian and degree measures', 'Trigonometric functions on unit circle, signs, domain, range, graphs', 'Compound angles: sin(x±y), cos(x±y), tan(x±y), multiple & submultiple angle formulas'] },
        { number: 4, name: 'Complex Numbers and Quadratic Equations', topics: ['Need for complex numbers (√-1), real and imaginary parts, Argand plane', 'Algebraic operations on complex numbers, quadratic equations with complex roots'] },
        { number: 5, name: 'Linear Inequalities', topics: ['Algebraic solutions of linear inequalities in one variable and number line representation'] },
        { number: 6, name: 'Permutations and Combinations', topics: ['Fundamental principle of counting, factorial n!', 'Derivation and applications of ⁿPᵣ and ⁿCᵣ formulas'] },
        { number: 7, name: 'Binomial Theorem', topics: ['Statement and proof for positive integral indices, Pascal’s triangle, applications'] },
        { number: 8, name: 'Sequence and Series', topics: ['Arithmetic Progression (AP) and Arithmetic Mean (AM)', 'Geometric Progression (GP), general term, sum of n terms, infinite GP, Geometric Mean (GM), AM-GM relationship'] },
        { number: 9, name: 'Straight Lines', topics: ['Slope of a line, angle between two lines', 'Equations of line: point-slope, slope-intercept, two-point, intercept form', 'Distance of a point from a line'] },
        { number: 10, name: 'Conic Sections', topics: ['Standard equations and properties of Circle, Parabola, Ellipse, and Hyperbola'] },
        { number: 11, name: 'Introduction to Three-Dimensional Geometry', topics: ['Coordinate axes and planes in 3D, coordinates of a point, distance between two points'] },
        { number: 12, name: 'Limits and Derivatives', topics: ['Intuitive idea of limit, limits of polynomials, rational, trigonometric, exponential, logarithmic functions', 'Derivative as rate of change, derivatives of polynomials and trigonometric functions using first principles and product/quotient rules'] },
        { number: 13, name: 'Statistics', topics: ['Measures of dispersion: Range, Mean deviation, Variance, Standard deviation for ungrouped and grouped data'] },
        { number: 14, name: 'Probability', topics: ['Events: mutually exclusive, exhaustive events, axiomatic probability, probability of A or B, A and B, not A'] }
      ]
    },
    'Biology': {
      curriculum: 'Class 11th',
      subject: 'Biology',
      code: '044',
      chapters: [
        { number: 1, name: 'The Living World', topics: ['Biodiversity, need for classification, three domains, taxonomic hierarchy, binomial nomenclature'] },
        { number: 2, name: 'Biological Classification', topics: ['Five kingdom classification, Monera, Protista, Fungi, Lichens, Viruses, Viroids'] },
        { number: 3, name: 'Plant Kingdom', topics: ['Algae, Bryophyta, Pteridophyta, Gymnosperms, Angiosperms characteristics'] },
        { number: 4, name: 'Animal Kingdom', topics: ['Non-chordates up to phyla, chordates up to classes'] },
        { number: 5, name: 'Morphology of Flowering Plants', topics: ['Root, stem, leaf, inflorescence, flower, fruit, seed, family Solanaceae'] },
        { number: 6, name: 'Anatomy of Flowering Plants', topics: ['Tissue systems in dicots and monocots (root, stem, leaf)'] },
        { number: 7, name: 'Structural Organisation in Animals', topics: ['Morphology, anatomy, and functions of digestive, circulatory, respiratory, nervous, and reproductive systems of frog'] },
        { number: 8, name: 'Cell: The Unit of Life', topics: ['Prokaryotic vs eukaryotic cells, cell membrane, cell wall, endomembrane system, mitochondria, ribosomes, plastids, cytoskeleton, nucleus'] },
        { number: 9, name: 'Biomolecules', topics: ['Proteins, carbohydrates, lipids, nucleic acids, enzyme action and properties'] },
        { number: 10, name: 'Cell Cycle and Cell Division', topics: ['Cell cycle phases, Mitosis, Meiosis and their significance'] },
        { number: 11, name: 'Photosynthesis in Higher Plants', topics: ['Light reaction, photophosphorylation, Calvin C3 cycle, Hatch-Slack C4 cycle, factors affecting photosynthesis'] },
        { number: 12, name: 'Respiration in Plants', topics: ['Glycolysis, fermentation, TCA (Krebs) cycle, ETS and ATP generation, respiratory quotient'] },
        { number: 13, name: 'Plant Growth and Development', topics: ['Phases of growth, growth regulators: auxin, gibberellin, cytokinin, ethylene, ABA'] },
        { number: 14, name: 'Breathing and Exchange of Gases', topics: ['Human respiratory system, mechanism of breathing, gas exchange and transport, respiratory volumes and disorders'] },
        { number: 15, name: 'Body Fluids and Circulation', topics: ['Blood composition, blood groups, lymph, human heart, cardiac cycle, ECG, double circulation, disorders'] },
        { number: 16, name: 'Excretory Products and Their Elimination', topics: ['Modes of excretion, human excretory system, nephron structure, urine formation, osmoregulation (RAAS, ADH), disorders'] },
        { number: 17, name: 'Locomotion and Movement', topics: ['Skeletal muscle, sliding filament theory, skeletal system, joints, muscular/skeletal disorders'] },
        { number: 18, name: 'Neural Control and Coordination', topics: ['Neuron, nerve impulse generation and conduction, central and peripheral nervous system'] },
        { number: 19, name: 'Chemical Coordination and Integration', topics: ['Endocrine glands (pituitary, thyroid, adrenal, pancreas, gonads), hormones, mechanism of hormone action, disorders'] }
      ]
    },
    'Computer Science': {
      curriculum: 'Class 11th',
      subject: 'Computer Science',
      code: '083',
      chapters: [
        { number: 1, name: 'Computer Systems and Organisation', topics: ['Hardware, software, memory hierarchy, Boolean logic, truth tables, number systems (binary, octal, hex conversions), encoding schemes (ASCII, Unicode)'] },
        { number: 2, name: 'Computational Thinking and Programming - I', topics: ['Problem-solving steps, Python syntax, tokens, data types, operators, flow of control (if-else, loops), strings, lists, tuples, dictionaries, Python modules (math, random, statistics)'] },
        { number: 3, name: 'Society, Law, and Ethics', topics: ['Digital footprints, cyber ethics, intellectual property rights, open source licenses, cybercrime, cyber safety, e-waste management, IT Act'] }
      ]
    },
    'Informatics Practices': {
      curriculum: 'Class 11th',
      subject: 'Informatics Practices',
      code: '065',
      chapters: [
        { number: 1, name: 'Introduction to Computer System', topics: ['Evolution of computers, I/O devices, memory, software types'] },
        { number: 2, name: 'Introduction to Python', topics: ['Python basics, control statements, lists, dictionaries, introduction to NumPy arrays'] },
        { number: 3, name: 'Database Concepts and SQL', topics: ['DBMS, relational model, DDL (CREATE, ALTER, DROP), DML (INSERT, UPDATE, DELETE), DQL (SELECT, WHERE, operators, NULL)'] },
        { number: 4, name: 'Introduction to Emerging Trends', topics: ['AI, Machine Learning, NLP, AR/VR, Robotics, Big Data, IoT, Cloud Computing, Blockchain'] }
      ]
    },
    'Accountancy': {
      curriculum: 'Class 11th',
      subject: 'Accountancy',
      code: '055',
      chapters: [
        { number: 1, name: 'Theoretical Framework', topics: ['Introduction to accounting, basic accounting terms, GAAP, accounting concepts (Business entity, Going concern, Accrual), GST characteristics'] },
        { number: 2, name: 'Accounting Process', topics: ['Vouchers, Journal, Ledger, Cash Book, Subsidiary books, Bank Reconciliation Statement (BRS), Depreciation (SLM & WDV), Provisions and Reserves, Trial Balance & Rectification of Errors'] },
        { number: 3, name: 'Financial Statements of Sole Proprietorship', topics: ['Trading and Profit & Loss Account, Balance Sheet with adjustments (closing stock, outstanding, prepaid, bad debts, depreciation), Incomplete records'] }
      ]
    },
    'Business Studies': {
      curriculum: 'Class 11th',
      subject: 'Business Studies',
      code: '054',
      chapters: [
        { number: 1, name: 'Evolution and Fundamentals of Business', topics: ['History of trade in India, business concept, objectives, industry and commerce classification'] },
        { number: 2, name: 'Forms of Business Organizations', topics: ['Sole proprietorship, Partnership, HUF, Cooperative societies, Company (Private/Public/OPC)'] },
        { number: 3, name: 'Public, Private and Global Enterprises', topics: ['Departmental undertakings, Statutory corporations, Government companies, Joint ventures, PPP'] },
        { number: 4, name: 'Business Services', topics: ['Banking services, e-banking, insurance principles and types, postal services'] },
        { number: 5, name: 'Emerging Modes of Business', topics: ['E-business scope and benefits, B2B, B2C, C2C'] },
        { number: 6, name: 'Social Responsibility of Business and Business Ethics', topics: ['Responsibility towards stakeholders, environmental protection, business ethics'] },
        { number: 7, name: 'Sources of Business Finance', topics: ['Owner’s funds (equity, preference, retained earnings), Borrowed funds (debentures, loans, ICD)'] },
        { number: 8, name: 'Small Business and Enterprises', topics: ['Entrepreneurship development, Start-up India, MSMED Act 2006, government schemes'] },
        { number: 9, name: 'Internal Trade', topics: ['Wholesale and retail trade, large-scale retailers, GST concept'] },
        { number: 10, name: 'International Trade', topics: ['Export and import procedures, documents, World Trade Organization (WTO)'] }
      ]
    },
    'History': {
      curriculum: 'Class 11th',
      subject: 'History',
      code: '027',
      chapters: [
        { number: 1, name: 'Writing and City Life', topics: ['Early urban centres in Iraq/Mesopotamia, nature of early urban society, uses of writing'] },
        { number: 2, name: 'An Empire Across Three Continents', topics: ['Roman Empire, political evolution, economic expansion, late antiquity, institution of slavery'] },
        { number: 3, name: 'Nomadic Empires', topics: ['The Mongols, Genghis Khan, nomadic state formation and conquest'] },
        { number: 4, name: 'The Three Orders', topics: ['Feudal society in Western Europe, clergy, nobility, peasantry, decline of feudalism'] },
        { number: 5, name: 'Changing Cultural Traditions', topics: ['European Renaissance, humanism, new trends in literature/arts, contribution of West Asia'] },
        { number: 6, name: 'Displacing Indigenous People', topics: ['European colonists in North America and Australia, impact on native populations'] },
        { number: 7, name: 'Paths to Modernization', topics: ['Militarization and economic growth in Japan, Communist movement in China'] }
      ]
    },
    'Geography': {
      curriculum: 'Class 11th',
      subject: 'Geography',
      code: '029',
      chapters: [
        { number: 1, name: 'Geography as a Discipline', topics: ['Approaches to geography, physical geography branches and importance'] },
        { number: 2, name: 'The Origin and Evolution of the Earth', topics: ['Origin of universe, Big Bang theory, evolution of lithosphere, atmosphere, oceans, life'] },
        { number: 3, name: 'Interior of the Earth', topics: ['Direct and indirect sources, earthquake waves, shadow zones, Earth structure, volcanoes'] },
        { number: 4, name: 'Distribution of Oceans and Continents', topics: ['Continental drift theory, plate tectonics, seafloor spreading'] },
        { number: 5, name: 'Geomorphic Processes', topics: ['Endogenic and exogenic processes, weathering, mass movements, soil formation'] },
        { number: 6, name: 'Landforms and their Evolution', topics: ['Running water, wind, glacial, coastal landforms (erosional and depositional)'] },
        { number: 7, name: 'Composition and Structure of Atmosphere', topics: ['Atmospheric layers, weather and climate elements'] },
        { number: 8, name: 'Solar Radiation, Heat Balance and Temperature', topics: ['Insolation, heat budget of Earth, temperature distribution and inversion'] },
        { number: 9, name: 'Atmospheric Circulation and Weather Systems', topics: ['Pressure belts, winds, air masses, tropical and extra-tropical cyclones'] },
        { number: 10, name: 'Water in the Atmosphere', topics: ['Humidity, condensation forms (dew, fog, clouds), precipitation types and distribution'] },
        { number: 11, name: 'Water (Oceans) and Movements', topics: ['Ocean floor topography, temperature, salinity, waves, tides, ocean currents'] },
        { number: 12, name: 'India: Location, Structure and Physiography', topics: ['Physiographic divisions of India, drainage systems (Himalayan and Peninsular)'] },
        { number: 13, name: 'Climate, Vegetation and Soil of India', topics: ['Indian monsoon mechanism, forest types, wildlife conservation'] }
      ]
    },
    'Political Science': {
      curriculum: 'Class 11th',
      subject: 'Political Science',
      code: '028',
      chapters: [
        { number: 1, name: 'Constitution: Why and How?', topics: ['Need for constitution, authority, Constituent Assembly, institutional design'] },
        { number: 2, name: 'Rights in the Indian Constitution', topics: ['Fundamental Rights, Directive Principles of State Policy, relationship between them'] },
        { number: 3, name: 'Election and Representation', topics: ['First Past the Post system vs Proportional Representation, Election Commission'] },
        { number: 4, name: 'Executive', topics: ['Parliamentary executive in India, powers of President, Prime Minister and Council of Ministers, Bureaucracy'] },
        { number: 5, name: 'Legislature', topics: ['Bicameral legislature, powers of Lok Sabha and Rajya Sabha, law-making procedure'] },
        { number: 6, name: 'Judiciary', topics: ['Independence of judiciary, jurisdiction of Supreme Court, judicial activism'] },
        { number: 7, name: 'Federalism', topics: ['Division of powers, Centre-State relations, demands for autonomy'] },
        { number: 8, name: 'Local Governments', topics: ['73rd and 74th Constitutional amendments, decentralization in India'] },
        { number: 9, name: 'Political Theory: An Introduction, Freedom, Equality, Social Justice, Rights, Nationalism, Secularism', topics: ['Foundational concepts in political theory, Harm principle, John Rawls’ theory of justice, types of equality, secularism in India vs West'] }
      ]
    },
    'Sociology': {
      curriculum: 'Class 11th',
      subject: 'Sociology',
      code: '039',
      chapters: [
        { number: 1, name: 'Sociology and Society', topics: ['Nature and scope of sociology, relationship with other social sciences'] },
        { number: 2, name: 'Terms, Concepts and their use in Sociology', topics: ['Social groups, stratification, status and role, social control'] },
        { number: 3, name: 'Understanding Social Institutions', topics: ['Family, marriage, kinship, work, economic, political, religious, and educational institutions'] },
        { number: 4, name: 'Culture and Socialization', topics: ['Defining culture, dimensions of culture, agencies of socialization'] },
        { number: 5, name: 'Social Change and Social Order in Rural and Urban Society', topics: ['Causes and consequences of social change, authority, law, contestation, crime'] },
        { number: 6, name: 'Introducing Western and Indian Sociologists', topics: ['Karl Marx, Emile Durkheim, Max Weber; G.S. Ghurye, D.P. Mukherjee, A.R. Desai, M.N. Srinivas'] }
      ]
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CLASS 12 (2026-27)
  // ═══════════════════════════════════════════════════════════════════════════
  'Class 12th': {
    'Physics': {
      curriculum: 'Class 12th',
      subject: 'Physics',
      code: '042',
      chapters: [
        { number: 1, name: 'Electric Charges and Fields', topics: ['Coulomb’s law, electric field and dipole, electric flux, Gauss’s theorem and applications (wire, sheet, spherical shell)'] },
        { number: 2, name: 'Electrostatic Potential and Capacitance', topics: ['Electric potential due to point charge and dipole, equipotential surfaces, capacitors, series/parallel combinations, energy stored in capacitor'] },
        { number: 3, name: 'Current Electricity', topics: ['Drift velocity, Ohm’s law, V-I characteristics, resistivity, temperature dependence, internal resistance, Kirchhoff’s rules, Wheatstone bridge'] },
        { number: 4, name: 'Moving Charges and Magnetism', topics: ['Biot-Savart law and circular loop, Ampere’s law, force on moving charge, force on current-carrying conductor, magnetic dipole, moving coil galvanometer'] },
        { number: 5, name: 'Magnetism and Matter', topics: ['Bar magnet as equivalent solenoid, magnetic field lines, diamagnetic, paramagnetic, ferromagnetic materials'] },
        { number: 6, name: 'Electromagnetic Induction', topics: ['Faraday’s laws of induction, induced EMF, Lenz’s law, self and mutual induction'] },
        { number: 7, name: 'Alternating Current', topics: ['Peak and RMS values, reactance and impedance, LCR series circuit, resonance, power in AC circuits, AC generator and transformer'] },
        { number: 8, name: 'Electromagnetic Waves', topics: ['Displacement current, characteristics of EM waves, electromagnetic spectrum (radio to gamma rays) and applications'] },
        { number: 9, name: 'Ray Optics and Optical Instruments', topics: ['Refraction at spherical surfaces, lens maker’s formula, thin lens formula, prism refraction, microscopes and astronomical telescopes'] },
        { number: 10, name: 'Wave Optics', topics: ['Huygens’ principle, reflection/refraction proof, Young’s double slit experiment, interference fringe width, single slit diffraction'] },
        { number: 11, name: 'Dual Nature of Radiation and Matter', topics: ['Photoelectric effect, Einstein’s photoelectric equation, de Broglie relation and matter waves'] },
        { number: 12, name: 'Atoms', topics: ['Alpha-particle scattering experiment, Rutherford’s model, Bohr’s hydrogen atom model, energy levels and spectral series'] },
        { number: 13, name: 'Nuclei', topics: ['Composition and size of nucleus, mass-energy relation, mass defect, binding energy per nucleon, nuclear fission and fusion'] },
        { number: 14, name: 'Semiconductor Electronics: Materials, Devices and Simple Circuits', topics: ['Energy bands, intrinsic and extrinsic semiconductors (p and n type), p-n junction diode I-V characteristics, diode as a rectifier'] }
      ]
    },
    'Chemistry': {
      curriculum: 'Class 12th',
      subject: 'Chemistry',
      code: '043',
      chapters: [
        { number: 1, name: 'Solutions', topics: ['Types of solutions, concentration expressions, Raoult’s law, ideal and non-ideal solutions, colligative properties (relative lowering of VP, elevation of BP, depression of FP, osmotic pressure), van ’t Hoff factor'] },
        { number: 2, name: 'Electrochemistry', topics: ['Galvanic cells, Nernst equation, electrolytic conductance, Kohlrausch’s law, electrolysis, batteries, fuel cells, corrosion'] },
        { number: 3, name: 'Chemical Kinetics', topics: ['Rate of reaction, factors influencing rate, rate law and order of reaction, integrated rate equations (zero and first order), Arrhenius equation, activation energy'] },
        { number: 4, name: 'The d- and f- Block Elements', topics: ['Transition elements electronic configuration, oxidation states, magnetic properties, catalytic properties, interstitial compounds, Lanthanoids and Actinoids'] },
        { number: 5, name: 'Coordination Compounds', topics: ['Werner’s theory, ligands, coordination number, IUPAC nomenclature, isomerism, Valence Bond Theory, Crystal Field Theory (CFT), metal carbonyls'] },
        { number: 6, name: 'Haloalkanes and Haloarenes', topics: ['Nomenclature, nature of C-X bond, preparation methods, SN1 and SN2 mechanism, polyhalogen compounds'] },
        { number: 7, name: 'Alcohols, Phenols and Ethers', topics: ['Classification, nomenclature, preparation, properties, acidity of phenols, Kolbe’s and Reimer-Tiemann reactions, Williamson ether synthesis'] },
        { number: 8, name: 'Aldehydes, Ketones and Carboxylic Acids', topics: ['Nomenclature, carbonyl group structure, nucleophilic addition, Aldol condensation, Cannizzaro reaction, acidity of carboxylic acids'] },
        { number: 9, name: 'Amines', topics: ['Structure, classification, basic character of amines, preparation methods, chemical reactions, diazonium salts and synthetic applications'] },
        { number: 10, name: 'Biomolecules', topics: ['Carbohydrates (monosaccharides, disaccharides, polysaccharides), Proteins (amino acids, peptide bond, structure, denaturation), Enzymes, Vitamins, Nucleic acids (DNA, RNA)'] }
      ]
    },
    'Mathematics': {
      curriculum: 'Class 12th',
      subject: 'Mathematics',
      code: '041',
      chapters: [
        { number: 1, name: 'Relations and Functions', topics: ['Types of relations: reflexive, symmetric, transitive, equivalence', 'One-to-one and onto functions'] },
        { number: 2, name: 'Inverse Trigonometric Functions', topics: ['Definition, range, domain, principal value branch, graphs'] },
        { number: 3, name: 'Matrices', topics: ['Matrix operations: addition, scalar multiplication, matrix multiplication, transpose, symmetric and skew-symmetric matrices, invertible matrices'] },
        { number: 4, name: 'Determinants', topics: ['Determinant of square matrix up to 3x3, minors and cofactors, adjoint and inverse, solving linear systems by matrix method'] },
        { number: 5, name: 'Continuity and Differentiability', topics: ['Continuity, chain rule, derivatives of inverse trigonometric, implicit, exponential and logarithmic functions, logarithmic differentiation, parametric differentiation, second order derivatives'] },
        { number: 6, name: 'Applications of Derivatives', topics: ['Rate of change of quantities, increasing and decreasing functions, maxima and minima (first and second derivative tests)'] },
        { number: 7, name: 'Integrals', topics: ['Integration as inverse of differentiation, substitution, partial fractions, integration by parts, evaluation of standard integrals, Fundamental Theorem of Calculus, definite integral properties'] },
        { number: 8, name: 'Applications of the Integrals', topics: ['Area under simple curves (lines, circles, parabolas, ellipses in standard form)'] },
        { number: 9, name: 'Differential Equations', topics: ['Order and degree, general and particular solutions, separation of variables, homogeneous differential equations, first order linear differential equations'] },
        { number: 10, name: 'Vectors', topics: ['Vectors and scalars, magnitude, direction cosines, scalar (dot) product, vector (cross) product and applications'] },
        { number: 11, name: 'Three-Dimensional Geometry', topics: ['Direction cosines and direction ratios of lines, Cartesian and vector equations of lines, skew lines, shortest distance between two lines'] },
        { number: 12, name: 'Linear Programming', topics: ['LPP terminology, graphical method of solution in two variables, feasible and infeasible regions, optimal feasible solutions'] },
        { number: 13, name: 'Probability', topics: ['Conditional probability, multiplication theorem, independent events, total probability, Bayes’ theorem'] }
      ]
    },
    'Biology': {
      curriculum: 'Class 12th',
      subject: 'Biology',
      code: '044',
      chapters: [
        { number: 1, name: 'Sexual Reproduction in Flowering Plants', topics: ['Flower structure, male and female gametophytes, pollination, double fertilization, endosperm and embryo development, apomixis'] },
        { number: 2, name: 'Human Reproduction', topics: ['Male and female reproductive systems, gametogenesis, menstrual cycle, fertilisation, blastocyst, implantation, pregnancy, parturition'] },
        { number: 3, name: 'Reproductive Health', topics: ['Need for reproductive health, contraception methods, MTP, STDs, assisted reproductive technologies (IVF, ZIFT, GIFT)'] },
        { number: 4, name: 'Principles of Inheritance and Variation', topics: ['Mendelian inheritance, incomplete dominance, co-dominance, multiple alleles, chromosome theory, linkage, sex determination, genetic disorders'] },
        { number: 5, name: 'Molecular Basis of Inheritance', topics: ['DNA as genetic material, DNA structure and packaging, replication, central dogma, transcription, genetic code, translation, lac operon, DNA fingerprinting'] },
        { number: 6, name: 'Evolution', topics: ['Origin of life, Darwinian evolution, natural selection, Hardy-Weinberg principle, human evolution'] },
        { number: 7, name: 'Human Health and Diseases', topics: ['Pathogens causing human diseases (malaria, typhoid, pneumonia, AIDS), basic immunology, vaccines, cancer, drug abuse'] },
        { number: 8, name: 'Microbes in Human Welfare', topics: ['Microbes in household products, industrial production, sewage treatment, biogas, biocontrol agents, biofertilizers'] },
        { number: 9, name: 'Biotechnology: Principles and Processes', topics: ['Recombinant DNA technology, restriction enzymes, cloning vectors, PCR, downstream processing'] },
        { number: 10, name: 'Biotechnology and its Applications', topics: ['Applications in health (insulin, gene therapy) and agriculture (Bt crops), transgenic animals, biosafety and biopiracy'] },
        { number: 11, name: 'Organisms and Populations', topics: ['Population attributes (birth/death rate, age distribution), population growth models, population interactions (mutualism, competition, predation, parasitism)'] },
        { number: 12, name: 'Ecosystem', topics: ['Ecosystem patterns, productivity, decomposition, energy flow, ecological pyramids'] },
        { number: 13, name: 'Biodiversity and its Conservation', topics: ['Biodiversity concept, patterns, loss, conservation hotspots, protected areas, red data book'] }
      ]
    },
    'Computer Science': {
      curriculum: 'Class 12th',
      subject: 'Computer Science',
      code: '083',
      chapters: [
        { number: 1, name: 'Computational Thinking and Programming - 2', topics: ['User-defined functions, parameters, scope, exception handling, text/binary/CSV file handling, data structure: Stack (push/pop using list)'] },
        { number: 2, name: 'Computer Networks', topics: ['Evolution of networking, data communication terminologies, transmission media, network devices, topologies, network protocols (HTTP, FTP, TCP/IP), web services'] },
        { number: 3, name: 'Database Management', topics: ['Relational data model, SQL DDL/DML commands, constraints, aggregate functions, GROUP BY, HAVING, Joins, Python-SQL connectivity using mysql.connector'] }
      ]
    },
    'Economics': {
      curriculum: 'Class 12th',
      subject: 'Economics',
      code: '030',
      chapters: [
        { number: 1, name: 'National Income and Related Aggregates', topics: ['Circular flow of income, methods of calculating National Income (Value Added, Income, Expenditure methods), GDP, GNP, NNP, Real vs Nominal GDP'] },
        { number: 2, name: 'Money and Banking', topics: ['Money supply, credit creation by commercial banks, Central Bank (RBI) and credit control tools (Bank rate, CRR, SLR, Repo rate, OMO)'] },
        { number: 3, name: 'Determination of Income and Employment', topics: ['Aggregate demand and supply, propensity to consume/save, investment multiplier, problems of excess and deficient demand'] },
        { number: 4, name: 'Government Budget and the Economy', topics: ['Government budget objectives, revenue and capital receipts/expenditure, measures of government deficit'] },
        { number: 5, name: 'Balance of Payments', topics: ['Balance of payments accounts (current & capital), foreign exchange rate determination, fixed vs flexible rates, managed floating'] },
        { number: 6, name: 'Development Experience (1947-90) & Economic Reforms since 1991', topics: ['State of Indian economy on eve of independence, Five Year Plans, 1991 LPG reforms (Liberalisation, Privatisation, Globalisation), Demonetization, GST'] },
        { number: 7, name: 'Current Challenges Facing Indian Economy', topics: ['Human Capital Formation, Rural Development, Employment growth and informalisation, Sustainable Economic Development'] },
        { number: 8, name: 'Development Experience of India: Comparison with Neighbours', topics: ['Comparative economic indicators of India, Pakistan, and China (growth, population, sectoral development, HDI)'] }
      ]
    },
    'Business Studies': {
      curriculum: 'Class 12th',
      subject: 'Business Studies',
      code: '054',
      chapters: [
        { number: 1, name: 'Nature and Significance of Management', topics: ['Management concept, objectives, importance, management as art/science/profession, levels, functions, coordination'] },
        { number: 2, name: 'Principles of Management', topics: ['Fayol’s 14 principles of management, Taylor’s scientific management principles and techniques'] },
        { number: 3, name: 'Business Environment', topics: ['Dimensions of business environment (economic, social, technological, political, legal), Demonetization'] },
        { number: 4, name: 'Planning', topics: ['Planning concept, importance, limitations, planning process, types of plans'] },
        { number: 5, name: 'Organizing', topics: ['Organizing process, organizational structure (functional and divisional), delegation and decentralization'] },
        { number: 6, name: 'Staffing', topics: ['Staffing process: recruitment, selection, training and development methods'] },
        { number: 7, name: 'Directing', topics: ['Elements of directing: supervision, motivation (Maslow’s hierarchy), leadership styles, communication and barriers'] },
        { number: 8, name: 'Controlling', topics: ['Controlling concept, relationship between planning and controlling, steps in control process'] },
        { number: 9, name: 'Financial Management', topics: ['Financial decisions (investment, financing, dividend), financial planning, capital structure, fixed and working capital'] },
        { number: 10, name: 'Financial Markets', topics: ['Money market instruments, capital market (primary and secondary), stock exchange trading procedure, SEBI role'] },
        { number: 11, name: 'Marketing Management', topics: ['Marketing mix (4 Ps: Product, Price, Place, Promotion), branding, packaging, channels of distribution, advertising'] },
        { number: 12, name: 'Consumer Protection', topics: ['Consumer Protection Act 2019, consumer rights and responsibilities, redressal machinery'] }
      ]
    },
    'Accountancy': {
      curriculum: 'Class 12th',
      subject: 'Accountancy',
      code: '055',
      chapters: [
        { number: 1, name: 'Accounting for Partnership Firms', topics: ['Partnership deed provisions, P&L Appropriation account, capital accounts (fixed vs fluctuating), past adjustments, goodwill valuation (average, super profit, capitalization)'] },
        { number: 2, name: 'Reconstitution and Dissolution of Partnership Firm', topics: ['Change in profit sharing ratio, admission of partner, retirement/death of partner, dissolution of partnership firm and realization account'] },
        { number: 3, name: 'Accounting for Share Capital and Debentures', topics: ['Issue and allotment of equity/preference shares, calls in advance/arrears, forfeiture and reissue of shares, issue of debentures (at par/premium/discount), redemption terms'] },
        { number: 4, name: 'Analysis of Financial Statements and Ratios', topics: ['Financial statements presentation (Schedule III), comparative and common size statements, accounting ratios (liquidity, solvency, activity, profitability)'] },
        { number: 5, name: 'Cash Flow Statement', topics: ['Cash and cash equivalents, operating, investing, and financing activities as per AS 3 (indirect method)'] }
      ]
    },
    'History': {
      curriculum: 'Class 12th',
      subject: 'History',
      code: '027',
      chapters: [
        { number: 1, name: 'Bricks, Beads and Bones', topics: ['Harappan Civilisation: urban centres, craft production, subsistence strategies, deciphering the script'] },
        { number: 2, name: 'Kings, Farmers and Towns', topics: ['Early states and economies (600 BCE - 600 CE), Mauryan Empire, Asokan inscriptions, land grants'] },
        { number: 3, name: 'Kinship, Caste and Class', topics: ['Social history using Mahabharata, caste, gender, kinship rules and social hierarchies'] },
        { number: 4, name: 'Thinkers, Beliefs and Buildings', topics: ['Vedic religion, Jainism, Buddhism (Sanchi Stupa), Puranic Hinduism, sculpture interpretation'] },
        { number: 5, name: 'Through the Eyes of Travellers', topics: ['Medieval society seen by Al-Biruni, Ibn Battuta, and Francois Bernier'] },
        { number: 6, name: 'Bhakti-Sufi Traditions', topics: ['Bhakti and Sufi saints, religious developments, devotional compositions'] },
        { number: 7, name: 'An Imperial Capital: Vijayanagara', topics: ['Vijayanagara architecture, temples, fortifications, discovery of Hampi'] },
        { number: 8, name: 'Peasants, Zamindars and the State', topics: ['Agrarian society under Mughal Empire, Ain-i-Akbari compilation and translation'] },
        { number: 9, name: 'Colonialism and the Countryside', topics: ['Revenue settlements (Permanent Settlement, Ryotwari), Buchanan’s accounts, Deccan Riots'] },
        { number: 10, name: 'Rebels and the Raj: 1857 Revolt', topics: ['Events of 1857, rebel proclamations, British repression and visual representations'] },
        { number: 11, name: 'Mahatma Gandhi and the Nationalist Movement', topics: ['Non-Cooperation, Civil Disobedience, Quit India, Gandhian mass mobilization'] },
        { number: 12, name: 'Framing the Constitution', topics: ['Independence, Constituent Assembly debates, vision of the Constitution'] }
      ]
    },
    'Political Science': {
      curriculum: 'Class 12th',
      subject: 'Political Science',
      code: '028',
      chapters: [
        { number: 1, name: 'The End of Bipolarity', topics: ['Soviet system, Gorbachev’s reforms, disintegration of USSR, shock therapy, new international entities'] },
        { number: 2, name: 'Contemporary Centers of Power', topics: ['European Union, ASEAN, rise of China as economic power, Japan and South Korea'] },
        { number: 3, name: 'Contemporary South Asia', topics: ['Democracy and military in Pakistan/Bangladesh, Nepal monarchy, Sri Lanka conflict, India-Pakistan relations'] },
        { number: 4, name: 'International Organizations', topics: ['Evolution and principal organs of UN, UN reforms, IMF, World Bank, WTO, NGOs'] },
        { number: 5, name: 'Security in the Contemporary World', topics: ['Traditional vs non-traditional notions of security, human security, global security'] },
        { number: 6, name: 'Environment and Natural Resources', topics: ['Global commons, common but differentiated responsibilities, environmental movements, indigenous rights'] },
        { number: 7, name: 'Globalisation', topics: ['Concept, economic, cultural and political consequences, India and globalisation'] },
        { number: 8, name: 'Challenges of Nation-Building', topics: ['Partition consequences, integration of princely states (Hyderabad, Manipur), reorganization of states'] },
        { number: 9, name: 'Era of One-Party Dominance & Planned Development', topics: ['Congress dominance, planning commission, five-year plans, industrialisation debate'] },
        { number: 10, name: 'India’s External Relations', topics: ['Non-Alignment policy, 1962 China war, 1965 & 1971 Pakistan wars, nuclear policy'] },
        { number: 11, name: 'Crisis of Democratic Order & Regional Aspirations', topics: ['Emergency of 1975, 1977 elections, regional issues in Punjab, Northeast, Jammu & Kashmir'] },
        { number: 12, name: 'Recent Developments in Indian Politics', topics: ['Era of coalitions, Mandal commission, rise of OBCs, political consensus'] }
      ]
    },
    'Physical Education': {
      curriculum: 'Class 12th',
      subject: 'Physical Education',
      code: '048',
      chapters: [
        { number: 1, name: 'Management of Sporting Events', topics: ['Functions of sports management, committees & responsibilities, tournament fixtures (knock-out, league), intramural & extramural'] },
        { number: 2, name: 'Children & Women in Sports', topics: ['WHO exercise guidelines, postural deformities (knock knee, flat foot, kyphosis, scoliosis), female athlete triad'] },
        { number: 3, name: 'Yoga as Preventive Measure for Lifestyle Diseases', topics: ['Asanas for obesity, diabetes, asthma, hypertension, arthritis, back pain'] },
        { number: 4, name: 'Physical Education & Sports for CWSN', topics: ['Divyang sports (Paralympics, Special Olympics), inclusion concepts and assistive strategies'] },
        { number: 5, name: 'Sports & Nutrition', topics: ['Macro & micro nutrients, nutritive vs non-nutritive components, weight control, food myths, sports diet'] },
        { number: 6, name: 'Test & Measurement in Sports', topics: ['SAI Khelo India fitness test, Harvard step test, Rikli & Jones senior citizen fitness test'] },
        { number: 7, name: 'Physiology & Injuries in Sports', topics: ['Effects of exercise on muscular and cardio-respiratory systems, aging, sports injury classification (soft tissue vs bone/joint)'] },
        { number: 8, name: 'Biomechanics & Sports', topics: ['Newton’s laws in sports, types of levers, equilibrium and centre of gravity, friction, projectile motion'] },
        { number: 9, name: 'Psychology & Sports', topics: ['Personality types (Big Five), motivation techniques, exercise adherence, aggression in sports'] },
        { number: 10, name: 'Training in Sports', topics: ['Talent identification, training cycles (micro, meso, macro), strength, endurance, speed, flexibility, circuit training'] }
      ]
    }
  }
};

/**
 * Normalizes subject names to match syllabus keys.
 * e.g., 'Science (Physics)' -> 'Science'
 * 'Social Science (History)' -> 'Social Science'
 * 'Computer Science (Python)' -> 'Computer Science'
 */
export function normalizeSubjectName(curriculum: string, subjectName: string): string {
  const norm = subjectName.trim().toLowerCase();
  
  if (curriculum === 'Class 8th' || curriculum === 'Class 9th' || curriculum === 'Class 10th') {
    if (norm.includes('math')) return 'Mathematics';
    if (norm.includes('science') && !norm.includes('social')) return 'Science';
    if (norm.includes('social')) return 'Social Science';
  }

  if (curriculum === 'Class 11th' || curriculum === 'Class 12th') {
    if (norm.includes('physic') && !norm.includes('education')) return 'Physics';
    if (norm.includes('chem')) return 'Chemistry';
    if (norm.includes('math')) return 'Mathematics';
    if (norm.includes('bio') && !norm.includes('biotech')) return 'Biology';
    if (norm.includes('computer')) return 'Computer Science';
    if (norm.includes('informatic')) return 'Informatics Practices';
    if (norm.includes('account')) return 'Accountancy';
    if (norm.includes('business')) return 'Business Studies';
    if (norm.includes('econom')) return 'Economics';
    if (norm.includes('histor')) return 'History';
    if (norm.includes('geograph')) return 'Geography';
    if (norm.includes('politic')) return 'Political Science';
    if (norm.includes('sociolog')) return 'Sociology';
    if (norm.includes('physical education')) return 'Physical Education';
  }

  return subjectName;
}

/**
 * Returns the official syllabus object for a given curriculum and subject, if available.
 */
export function getOfficialSyllabus(curriculum: string, subject: string): SubjectSyllabus | null {
  const normalizedCurriculum = curriculum.trim();
  const classSyllabus = SYLLABUS_2026_27[normalizedCurriculum];
  if (!classSyllabus) return null;

  const normalizedSubject = normalizeSubjectName(normalizedCurriculum, subject);
  
  // Direct match
  if (classSyllabus[normalizedSubject]) {
    return classSyllabus[normalizedSubject];
  }

  // Substring match fallback
  for (const key of Object.keys(classSyllabus)) {
    if (key.toLowerCase() === normalizedSubject.toLowerCase() ||
        normalizedSubject.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(normalizedSubject.toLowerCase())) {
      return classSyllabus[key];
    }
  }

  return null;
}

/**
 * Builds a strict, structured syllabus prompt fragment for the AI model to guarantee
 * that study plans, tutor answers, and quizzes adhere 100% to the official 2026-27 curriculum.
 */
export function getOfficialSyllabusPromptSnippet(curriculum: string, subject: string): string {
  const syllabus = getOfficialSyllabus(curriculum, subject);
  if (!syllabus) return '';

  const chapterList = syllabus.chapters.map(ch => 
    `• Chapter ${ch.number}: "${ch.name}"\n  Topics: ${ch.topics.join('; ')}`
  ).join('\n');

  return `
══════════════════════════════════════════════════════════════════════════════════
OFFICIAL SESSION 2026–27 SYLLABUS (DIRECTORATE OF EDUCATION / CBSE / NCF-SE 2023):
Target: ${syllabus.curriculum} — ${syllabus.subject} ${syllabus.code ? `(Code: ${syllabus.code})` : ''} ${syllabus.bookName ? `[Prescribed Book: ${syllabus.bookName}]` : ''}

STRICT MANDATORY COMPLIANCE RULES:
1. You MUST organize and reference ONLY the officially prescribed chapters and topics below.
2. Do NOT invent, assume, or hallucinate chapters from old or foreign curricula.
3. Every week and task of the study plan must map directly to these exact chapter titles and their official topics.

Official Chapters & Topics for 2026–27:
${chapterList}
══════════════════════════════════════════════════════════════════════════════════
`;
}
