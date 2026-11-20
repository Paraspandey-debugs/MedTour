// Partner directory and published package pricing.
// Prices, rates and recovery windows are estimates, not medical or financial advice.

export type TreatmentId =
  | "knee"
  | "hip"
  | "cabg"
  | "spine"
  | "bariatric"
  | "dental"
  | "cataract"
  | "ivf"
  | "rhinoplasty"
  | "hair"
  | "gallbladder"
  | "valve"
  | "hernia"
  | "oncology"
  | "shoulder"
  | "lasik"
  | "angioplasty"
  | "breast"
  | "prostate"
  | "facelift";
export type CountryId = "IN" | "TH" | "TR" | "SG" | "MY" | "AE" | "MX" | "KR";
export type CoreHomeId = "US" | "UK" | "CA" | "AU" | "AE" | "NG";
export type HomeId =
  | CoreHomeId
  | "DE"
  | "FR"
  | "IE"
  | "NL"
  | "NZ"
  | "ZA"
  | "SG"
  | "SA"
  | "QA"
  | "KW"
  | "KE"
  | "GH"
  | "PH"
  | "IN"
  | "MX";
export type Specialty =
  | "Orthopaedics"
  | "Cardiac"
  | "Spine"
  | "Bariatric"
  | "Dental"
  | "Ophthalmology"
  | "Fertility"
  | "Cosmetics"
  | "General Surgery"
  | "Oncology";

export interface Treatment {
  id: TreatmentId;
  name: string;
  short: string;
  specialty: Specialty;
  hospitalDays: number; // inpatient nights
  localRecoveryDays: number; // supervised recovery near the hospital after discharge
  fitToFlyDay: number; // earliest day after the procedure for a long-haul flight
  fitToFlyWhy: string;
  followUps: number[]; // tele follow-ups, days after procedure
  baseComplication: number; // baseline complication probability
  revisionFactor: number; // cost of managing a complication, as a multiple of procedure price
  homeCost: Partial<Record<HomeId, number>> & Record<CoreHomeId, number>;
  price: Record<CountryId, number>;
  keywords: string[];
}

export const TREATMENTS: Treatment[] = [
  {
    id: "knee",
    name: "Total Knee Replacement",
    short: "Knee replacement",
    specialty: "Orthopaedics",
    hospitalDays: 4,
    localRecoveryDays: 10,
    fitToFlyDay: 14,
    fitToFlyWhy:
      "Clot (DVT) risk is elevated after lower-limb surgery; long flights wait until the wound check and mobility milestone are passed.",
    followUps: [14, 30, 90],
    baseComplication: 0.04,
    revisionFactor: 0.9,
    homeCost: { US: 35000, UK: 18000, CA: 22000, AU: 24000, AE: 16000, NG: 9000 },
    price: { IN: 6500, TH: 11000, TR: 8000, SG: 16000, MY: 9000, AE: 14000, MX: 10500, KR: 15000 },
    keywords: ["knee", "tkr", "kellgren", "osteoarthritis", "varus", "joint space"],
  },
  {
    id: "hip",
    name: "Total Hip Replacement",
    short: "Hip replacement",
    specialty: "Orthopaedics",
    hospitalDays: 4,
    localRecoveryDays: 10,
    fitToFlyDay: 14,
    fitToFlyWhy:
      "Dislocation and clot risk are highest in the first two weeks; seated long-haul travel waits for surgeon clearance.",
    followUps: [14, 30, 90],
    baseComplication: 0.035,
    revisionFactor: 1.0,
    homeCost: { US: 40000, UK: 17000, CA: 23000, AU: 26000, AE: 17000, NG: 9500 },
    price: { IN: 7000, TH: 12500, TR: 8500, SG: 17500, MY: 9500, AE: 15000, MX: 11500, KR: 16000 },
    keywords: ["hip", "avascular necrosis", "femoral head", "acetabul", "thr"],
  },
  {
    id: "cabg",
    name: "Coronary Artery Bypass (CABG)",
    short: "Heart bypass",
    specialty: "Cardiac",
    hospitalDays: 8,
    localRecoveryDays: 14,
    fitToFlyDay: 21,
    fitToFlyWhy:
      "The sternum and lungs need time to recover; cabin pressure changes are avoided until a cardiology review confirms stability.",
    followUps: [14, 30, 90, 180],
    baseComplication: 0.07,
    revisionFactor: 0.6,
    homeCost: { US: 120000, UK: 32000, CA: 45000, AU: 42000, AE: 38000, NG: 18000 },
    price: { IN: 7500, TH: 22000, TR: 12000, SG: 30000, MY: 14000, AE: 28000, MX: 25000, KR: 28000 },
    keywords: ["coronary", "cabg", "triple vessel", "angiograph", "lad", "angina", "ejection fraction", "bypass"],
  },
  {
    id: "spine",
    name: "Lumbar Spinal Fusion",
    short: "Spinal fusion",
    specialty: "Spine",
    hospitalDays: 5,
    localRecoveryDays: 12,
    fitToFlyDay: 16,
    fitToFlyWhy:
      "Prolonged sitting loads the fused segment; travel waits until pain is controlled and the wound is checked.",
    followUps: [14, 42, 90, 180],
    baseComplication: 0.06,
    revisionFactor: 0.8,
    homeCost: { US: 90000, UK: 28000, CA: 38000, AU: 40000, AE: 30000, NG: 14000 },
    price: { IN: 8500, TH: 16000, TR: 11000, SG: 26000, MY: 12500, AE: 24000, MX: 18000, KR: 20000 },
    keywords: ["lumbar", "spondylolisthesis", "disc", "l4", "l5", "sciatica", "spinal", "fusion"],
  },
  {
    id: "bariatric",
    name: "Gastric Sleeve Surgery",
    short: "Gastric sleeve",
    specialty: "Bariatric",
    hospitalDays: 3,
    localRecoveryDays: 7,
    fitToFlyDay: 10,
    fitToFlyWhy:
      "Staple-line leaks typically present in the first week; flying waits until the leak window has passed and fluids are tolerated.",
    followUps: [14, 30, 90, 180, 365],
    baseComplication: 0.045,
    revisionFactor: 0.9,
    homeCost: { US: 20000, UK: 12000, CA: 16000, AU: 15000, AE: 11000, NG: 7500 },
    price: { IN: 5500, TH: 9500, TR: 4500, SG: 13000, MY: 7500, AE: 9500, MX: 5000, KR: 10000 },
    keywords: ["bariatric", "sleeve", "morbid obesity", "obesity class", "weight loss surgery", "sleep apnoea", "sleep apnea"],
  },
  {
    id: "dental",
    name: "Full-Arch Dental Implants",
    short: "Dental implants",
    specialty: "Dental",
    hospitalDays: 0,
    localRecoveryDays: 7,
    fitToFlyDay: 3,
    fitToFlyWhy:
      "Swelling and bleeding settle within a few days; sinus-lift cases wait longer because of cabin pressure.",
    followUps: [10, 90, 180],
    baseComplication: 0.03,
    revisionFactor: 0.5,
    homeCost: { US: 28000, UK: 16000, CA: 22000, AU: 21000, AE: 14000, NG: 7000 },
    price: { IN: 5500, TH: 9000, TR: 6000, SG: 15000, MY: 7000, AE: 11000, MX: 8000, KR: 10500 },
    keywords: ["edentulous", "implant", "dental", "periodont", "all-on-4", "tooth loss", "teeth"],
  },
  {
    id: "cataract",
    name: "Cataract Surgery with Multifocal IOL",
    short: "Cataract surgery",
    specialty: "Ophthalmology",
    hospitalDays: 0,
    localRecoveryDays: 3,
    fitToFlyDay: 3,
    fitToFlyWhy:
      "Intraocular pressure stabilizes within 48 to 72 hours; cabin pressure changes are safe after post-op slit-lamp clearance.",
    followUps: [3, 14, 30],
    baseComplication: 0.015,
    revisionFactor: 0.4,
    homeCost: { US: 7500, UK: 4500, CA: 5000, AU: 4800, AE: 4200, NG: 2500 },
    price: { IN: 1200, TH: 2200, TR: 1600, SG: 4500, MY: 1800, AE: 3200, MX: 2000, KR: 2800 },
    keywords: ["cataract", "lens", "iol", "phacoemulsification", "vision", "blur", "eye", "glaucoma", "cornea", "retina", "ophthalmology"],
  },
  {
    id: "ivf",
    name: "In-Vitro Fertilization (IVF Cycle with ICSI)",
    short: "IVF treatment",
    specialty: "Fertility",
    hospitalDays: 0,
    localRecoveryDays: 10,
    fitToFlyDay: 7,
    fitToFlyWhy:
      "Ovarian hyperstimulation syndrome (OHSS) monitoring and embryo implantation window require local rest before flight.",
    followUps: [7, 14, 28],
    baseComplication: 0.025,
    revisionFactor: 0.6,
    homeCost: { US: 22000, UK: 11000, CA: 14000, AU: 13000, AE: 12000, NG: 6500 },
    price: { IN: 3800, TH: 7500, TR: 4200, SG: 11500, MY: 5800, AE: 8500, MX: 5500, KR: 8000 },
    keywords: ["ivf", "icsi", "fertility", "infertility", "embryo", "blastocyst", "ovarian", "follicle", "amh", "egg retrieval", "pregnancy"],
  },
  {
    id: "rhinoplasty",
    name: "Open Ultrasonic Rhinoplasty & Septoplasty",
    short: "Rhinoplasty",
    specialty: "Cosmetics",
    hospitalDays: 1,
    localRecoveryDays: 7,
    fitToFlyDay: 8,
    fitToFlyWhy:
      "Nasal splint removal and sinus barotrauma prevention mandate waiting until internal mucosal swelling subsides.",
    followUps: [7, 30, 90],
    baseComplication: 0.02,
    revisionFactor: 0.7,
    homeCost: { US: 12500, UK: 8500, CA: 9500, AU: 9000, AE: 8000, NG: 4500 },
    price: { IN: 2800, TH: 4200, TR: 3200, SG: 7800, MY: 3600, AE: 6000, MX: 3800, KR: 4800 },
    keywords: ["rhinoplasty", "nose", "septoplasty", "deviated septum", "nasal", "hump", "cartilage", "cosmetic", "plastic surgery"],
  },
  {
    id: "hair",
    name: "Sapphire FUE Hair Follicle Transplantation",
    short: "Hair transplant",
    specialty: "Cosmetics",
    hospitalDays: 0,
    localRecoveryDays: 4,
    fitToFlyDay: 4,
    fitToFlyWhy:
      "Grafts must anchor securely against cabin pressure and altitude fluctuations; first wash is supervised on day 3.",
    followUps: [3, 30, 180],
    baseComplication: 0.015,
    revisionFactor: 0.4,
    homeCost: { US: 14000, UK: 9000, CA: 11000, AU: 10500, AE: 8500, NG: 4000 },
    price: { IN: 1800, TH: 3200, TR: 2200, SG: 6500, MY: 2800, AE: 4500, MX: 2900, KR: 4200 },
    keywords: ["hair", "fue", "transplant", "follicle", "graft", "alopecia", "scalp", "balding", "norwood", "hairline"],
  },
  {
    id: "gallbladder",
    name: "Laparoscopic Cholecystectomy (Gallbladder Removal)",
    short: "Gallbladder removal",
    specialty: "General Surgery",
    hospitalDays: 1,
    localRecoveryDays: 6,
    fitToFlyDay: 7,
    fitToFlyWhy:
      "Carbon dioxide insufflation gas must resorb to avoid severe chest pain and subdiaphragmatic irritation in-flight.",
    followUps: [7, 30],
    baseComplication: 0.03,
    revisionFactor: 0.8,
    homeCost: { US: 24000, UK: 9500, CA: 12000, AU: 13000, AE: 10500, NG: 5500 },
    price: { IN: 3200, TH: 6200, TR: 4100, SG: 9800, MY: 4800, AE: 7500, MX: 4500, KR: 6800 },
    keywords: ["gallbladder", "cholecystectomy", "cholelithiasis", "gallstone", "biliary", "colic", "laparoscopic"],
  },
  {
    id: "valve",
    name: "Transcatheter Aortic Valve Replacement (TAVR)",
    short: "Heart valve replacement",
    specialty: "Cardiac",
    hospitalDays: 4,
    localRecoveryDays: 10,
    fitToFlyDay: 14,
    fitToFlyWhy:
      "Hemodynamic stability, conduction block monitoring, and vascular puncture healing must be confirmed by echo before flying.",
    followUps: [14, 30, 90, 180],
    baseComplication: 0.05,
    revisionFactor: 0.8,
    homeCost: { US: 85000, UK: 26000, CA: 36000, AU: 34000, AE: 31000, NG: 15000 },
    price: { IN: 11000, TH: 19500, TR: 14000, SG: 28000, MY: 16000, AE: 26000, MX: 21000, KR: 25000 },
    keywords: ["valve", "tavr", "tavi", "aortic stenosis", "mvr", "mitral", "prosthetic", "murmur", "stenosis", "heart valve"],
  },
  {
    id: "hernia",
    name: "Laparoscopic Inguinal Hernia Repair with Mesh",
    short: "Hernia repair",
    specialty: "General Surgery",
    hospitalDays: 1,
    localRecoveryDays: 5,
    fitToFlyDay: 6,
    fitToFlyWhy:
      "Intra-abdominal pressure during turbulence and lifting luggage risks mesh displacement if attempted too early.",
    followUps: [6, 30],
    baseComplication: 0.02,
    revisionFactor: 0.6,
    homeCost: { US: 15000, UK: 6500, CA: 8000, AU: 7800, AE: 7000, NG: 3800 },
    price: { IN: 2400, TH: 4800, TR: 3100, SG: 7500, MY: 3600, AE: 5800, MX: 3400, KR: 5200 },
    keywords: ["hernia", "inguinal", "umbilical", "mesh", "bulge", "groin", "herniorrhaphy"],
  },
  {
    id: "oncology",
    name: "Stereotactic CyberKnife & Proton Radiotherapy",
    short: "Targeted radiotherapy",
    specialty: "Oncology",
    hospitalDays: 0,
    localRecoveryDays: 14,
    fitToFlyDay: 10,
    fitToFlyWhy:
      "Acute radiation fatigue, blood count nadirs, and tumor response evaluations must stabilize before travel.",
    followUps: [14, 30, 90],
    baseComplication: 0.04,
    revisionFactor: 0.7,
    homeCost: { US: 95000, UK: 35000, CA: 48000, AU: 44000, AE: 40000, NG: 22000 },
    price: { IN: 8500, TH: 18000, TR: 11500, SG: 27000, MY: 13500, AE: 24000, MX: 19000, KR: 22000 },
    keywords: ["oncology", "radiation", "cyberknife", "proton", "tumor", "carcinoma", "neoplasm", "radiotherapy", "cancer", "chemotherapy"],
  },
  {
    id: "shoulder",
    name: "Rotator Cuff Repair & Shoulder Arthroscopy",
    short: "Shoulder surgery",
    specialty: "Orthopaedics",
    hospitalDays: 1,
    localRecoveryDays: 7,
    fitToFlyDay: 8,
    fitToFlyWhy:
      "Arm immobilisation and pressure changes require post-op clearance; risk of stiffness and swelling decreases after first week.",
    followUps: [7, 21, 60],
    baseComplication: 0.028,
    revisionFactor: 0.85,
    homeCost: { US: 26000, UK: 11000, CA: 15000, AU: 14000, AE: 12000, NG: 6000 },
    price: { IN: 4200, TH: 6800, TR: 5200, SG: 11500, MY: 5800, AE: 9500, MX: 6500, KR: 9200 },
    keywords: ["shoulder", "rotator cuff", "arthroscopy", "impingement", "subacromial", "labrum", "supraspinatus"],
  },
  {
    id: "lasik",
    name: "Custom Wavefront Femto-LASIK & SMILE",
    short: "LASIK eye surgery",
    specialty: "Ophthalmology",
    hospitalDays: 0,
    localRecoveryDays: 3,
    fitToFlyDay: 3,
    fitToFlyWhy:
      "Corneal flap requires stabilization in low-humidity cabin environment; protective eyewear and tear drops mandatory.",
    followUps: [1, 7, 30],
    baseComplication: 0.015,
    revisionFactor: 0.6,
    homeCost: { US: 4500, UK: 3200, CA: 3800, AU: 3600, AE: 3000, NG: 1800 },
    price: { IN: 950, TH: 1800, TR: 1400, SG: 3200, MY: 1500, AE: 2400, MX: 1600, KR: 2100 },
    keywords: ["lasik", "femtosecond", "smile", "refractive", "cornea", "myopia", "astigmatism", "prk", "vision correction"],
  },
  {
    id: "angioplasty",
    name: "Coronary Angioplasty & Drug-Eluting Stents (PTCA)",
    short: "Angioplasty & stent",
    specialty: "Cardiac",
    hospitalDays: 2,
    localRecoveryDays: 5,
    fitToFlyDay: 7,
    fitToFlyWhy:
      "Femoral or radial puncture site must heal fully without hematoma; cardiac telemetry and antiplatelet titration must be stable.",
    followUps: [7, 30, 90],
    baseComplication: 0.025,
    revisionFactor: 0.95,
    homeCost: { US: 42000, UK: 16000, CA: 22000, AU: 21000, AE: 18000, NG: 9000 },
    price: { IN: 5200, TH: 9500, TR: 7200, SG: 14500, MY: 7800, AE: 12500, MX: 8800, KR: 13000 },
    keywords: ["angioplasty", "stent", "ptca", "coronary", "ischemic", "atherosclerosis", "stenosis", "artery", "cardiac catheterization"],
  },
  {
    id: "breast",
    name: "Dual-Plane Breast Augmentation & Lift",
    short: "Breast surgery",
    specialty: "Cosmetics",
    hospitalDays: 1,
    localRecoveryDays: 6,
    fitToFlyDay: 7,
    fitToFlyWhy:
      "Pectoral tension and drain removal must be verified prior to air travel; compression garment compliance mandatory.",
    followUps: [7, 14, 45],
    baseComplication: 0.028,
    revisionFactor: 0.75,
    homeCost: { US: 11000, UK: 7500, CA: 8500, AU: 8200, AE: 7000, NG: 4000 },
    price: { IN: 3200, TH: 4800, TR: 3600, SG: 8500, MY: 4200, AE: 6500, MX: 4200, KR: 5800 },
    keywords: ["breast", "augmentation", "implants", "mastopexy", "mammoplasty", "breast lift", "silicone"],
  },
  {
    id: "prostate",
    name: "Robotic Da Vinci Prostatectomy",
    short: "Robotic prostatectomy",
    specialty: "Oncology",
    hospitalDays: 3,
    localRecoveryDays: 8,
    fitToFlyDay: 10,
    fitToFlyWhy:
      "Catheter removal and continence milestone must be verified; pelvic venous thrombosis risk monitored before long flight.",
    followUps: [14, 30, 90],
    baseComplication: 0.038,
    revisionFactor: 0.9,
    homeCost: { US: 65000, UK: 22000, CA: 30000, AU: 28000, AE: 26000, NG: 13000 },
    price: { IN: 7800, TH: 14500, TR: 10500, SG: 22000, MY: 11000, AE: 18500, MX: 14000, KR: 17500 },
    keywords: ["prostate", "prostatectomy", "da vinci", "robotic prostatectomy", "psa", "adenocarcinoma", "prostatic", "gleason"],
  },
  {
    id: "facelift",
    name: "Deep Plane SMAS Facelift & Neck Rejuvenation",
    short: "Facelift",
    specialty: "Cosmetics",
    hospitalDays: 1,
    localRecoveryDays: 8,
    fitToFlyDay: 9,
    fitToFlyWhy:
      "Facial tissue edema, suture line healing, and submental recovery require clinical inspection before cabin pressure changes.",
    followUps: [7, 14, 30],
    baseComplication: 0.024,
    revisionFactor: 0.7,
    homeCost: { US: 18000, UK: 12000, CA: 14000, AU: 13500, AE: 11500, NG: 6000 },
    price: { IN: 3800, TH: 5900, TR: 4200, SG: 11000, MY: 4900, AE: 8500, MX: 5400, KR: 7200 },
    keywords: ["facelift", "rhytidectomy", "smas", "neck lift", "jowls", "facial rejuvenation", "platysmaplasty"],
  },
];

export interface Country {
  id: CountryId;
  name: string;
  flag: string;
  visaDays: number;
  visaFee: number;
  hotelPerNight: number;
  language: string;
}

export const COUNTRIES: Record<CountryId, Country> = {
  IN: { id: "IN", name: "India", flag: "🇮🇳", visaDays: 5, visaFee: 80, hotelPerNight: 55, language: "Hindi" },
  TH: { id: "TH", name: "Thailand", flag: "🇹🇭", visaDays: 7, visaFee: 40, hotelPerNight: 65, language: "Thai" },
  TR: { id: "TR", name: "Türkiye", flag: "🇹🇷", visaDays: 3, visaFee: 60, hotelPerNight: 70, language: "Turkish" },
  SG: { id: "SG", name: "Singapore", flag: "🇸🇬", visaDays: 5, visaFee: 30, hotelPerNight: 160, language: "English" },
  MY: { id: "MY", name: "Malaysia", flag: "🇲🇾", visaDays: 4, visaFee: 25, hotelPerNight: 60, language: "Malay" },
  AE: { id: "AE", name: "UAE", flag: "🇦🇪", visaDays: 4, visaFee: 90, hotelPerNight: 120, language: "Arabic" },
  MX: { id: "MX", name: "Mexico", flag: "🇲🇽", visaDays: 1, visaFee: 0, hotelPerNight: 75, language: "Spanish" },
  KR: { id: "KR", name: "South Korea", flag: "🇰🇷", visaDays: 7, visaFee: 60, hotelPerNight: 110, language: "Korean" },
};

export interface Home {
  id: HomeId;
  name: string;
  flag: string;
  waitWeeks: number; // typical elective wait at home
  flight: Record<CountryId, number>; // return economy fare, USD
  hours: Record<CountryId, number>; // one-way travel time
}

export const HOMES: Record<HomeId, Home> = {
  US: {
    id: "US", name: "United States", flag: "🇺🇸", waitWeeks: 3,
    flight: { IN: 1200, TH: 1300, TR: 900, SG: 1400, MY: 1350, AE: 1100, MX: 400, KR: 1300 },
    hours: { IN: 17, TH: 20, TR: 11, SG: 19, MY: 21, AE: 14, MX: 4, KR: 14 },
  },
  UK: {
    id: "UK", name: "United Kingdom", flag: "🇬🇧", waitWeeks: 20,
    flight: { IN: 700, TH: 850, TR: 300, SG: 900, MY: 850, AE: 550, MX: 800, KR: 900 },
    hours: { IN: 9, TH: 12, TR: 4, SG: 13, MY: 13, AE: 7, MX: 11, KR: 12 },
  },
  CA: {
    id: "CA", name: "Canada", flag: "🇨🇦", waitWeeks: 28,
    flight: { IN: 1300, TH: 1400, TR: 1000, SG: 1500, MY: 1450, AE: 1200, MX: 500, KR: 1300 },
    hours: { IN: 16, TH: 19, TR: 11, SG: 19, MY: 21, AE: 14, MX: 5, KR: 13 },
  },
  AU: {
    id: "AU", name: "Australia", flag: "🇦🇺", waitWeeks: 14,
    flight: { IN: 800, TH: 600, TR: 1300, SG: 500, MY: 450, AE: 1100, MX: 1700, KR: 800 },
    hours: { IN: 13, TH: 9, TR: 18, SG: 8, MY: 8, AE: 14, MX: 19, KR: 10 },
  },
  AE: {
    id: "AE", name: "UAE", flag: "🇦🇪", waitWeeks: 2,
    flight: { IN: 300, TH: 500, TR: 400, SG: 600, MY: 550, AE: 0, MX: 1500, KR: 800 },
    hours: { IN: 3, TH: 6, TR: 5, SG: 7, MY: 7, AE: 0, MX: 20, KR: 9 },
  },
  NG: {
    id: "NG", name: "Nigeria", flag: "🇳🇬", waitWeeks: 6,
    flight: { IN: 900, TH: 1100, TR: 700, SG: 1200, MY: 1150, AE: 600, MX: 1600, KR: 1300 },
    hours: { IN: 12, TH: 15, TR: 7, SG: 16, MY: 16, AE: 8, MX: 20, KR: 18 },
  },
  DE: {
    id: "DE", name: "Germany", flag: "🇩🇪", waitWeeks: 8,
    flight: { IN: 650, TH: 800, TR: 280, SG: 880, MY: 820, AE: 520, MX: 850, KR: 880 },
    hours: { IN: 8, TH: 11, TR: 3, SG: 12, MY: 12, AE: 6, MX: 12, KR: 11 },
  },
  FR: {
    id: "FR", name: "France", flag: "🇫🇷", waitWeeks: 10,
    flight: { IN: 680, TH: 820, TR: 290, SG: 890, MY: 840, AE: 530, MX: 820, KR: 890 },
    hours: { IN: 9, TH: 12, TR: 4, SG: 13, MY: 13, AE: 7, MX: 11, KR: 12 },
  },
  IE: {
    id: "IE", name: "Ireland", flag: "🇮🇪", waitWeeks: 24,
    flight: { IN: 720, TH: 860, TR: 320, SG: 910, MY: 860, AE: 560, MX: 780, KR: 910 },
    hours: { IN: 10, TH: 13, TR: 4, SG: 13, MY: 14, AE: 8, MX: 10, KR: 12 },
  },
  NL: {
    id: "NL", name: "Netherlands", flag: "🇳🇱", waitWeeks: 12,
    flight: { IN: 660, TH: 810, TR: 290, SG: 870, MY: 830, AE: 510, MX: 830, KR: 870 },
    hours: { IN: 8, TH: 11, TR: 3, SG: 12, MY: 12, AE: 6, MX: 11, KR: 11 },
  },
  NZ: {
    id: "NZ", name: "New Zealand", flag: "🇳🇿", waitWeeks: 16,
    flight: { IN: 900, TH: 700, TR: 1400, SG: 600, MY: 550, AE: 1200, MX: 1600, KR: 850 },
    hours: { IN: 16, TH: 12, TR: 21, SG: 10, MY: 10, AE: 16, MX: 16, KR: 11 },
  },
  ZA: {
    id: "ZA", name: "South Africa", flag: "🇿🇦", waitWeeks: 6,
    flight: { IN: 750, TH: 850, TR: 650, SG: 900, MY: 850, AE: 550, MX: 1500, KR: 1100 },
    hours: { IN: 11, TH: 13, TR: 10, SG: 11, MY: 11, AE: 8, MX: 18, KR: 15 },
  },
  SG: {
    id: "SG", name: "Singapore", flag: "🇸🇬", waitWeeks: 1,
    flight: { IN: 350, TH: 180, TR: 650, SG: 0, MY: 120, AE: 450, MX: 1600, KR: 450 },
    hours: { IN: 5, TH: 2, TR: 11, SG: 0, MY: 1, AE: 7, MX: 20, KR: 6 },
  },
  SA: {
    id: "SA", name: "Saudi Arabia", flag: "🇸🇦", waitWeeks: 4,
    flight: { IN: 320, TH: 520, TR: 380, SG: 620, MY: 560, AE: 180, MX: 1550, KR: 820 },
    hours: { IN: 4, TH: 7, TR: 4, SG: 8, MY: 8, AE: 2, MX: 20, KR: 9 },
  },
  QA: {
    id: "QA", name: "Qatar", flag: "🇶🇦", waitWeeks: 3,
    flight: { IN: 310, TH: 510, TR: 390, SG: 610, MY: 550, AE: 120, MX: 1520, KR: 810 },
    hours: { IN: 4, TH: 7, TR: 4, SG: 8, MY: 8, AE: 1, MX: 20, KR: 9 },
  },
  KW: {
    id: "KW", name: "Kuwait", flag: "🇰🇼", waitWeeks: 3,
    flight: { IN: 330, TH: 530, TR: 370, SG: 630, MY: 570, AE: 150, MX: 1540, KR: 830 },
    hours: { IN: 4, TH: 7, TR: 4, SG: 8, MY: 8, AE: 2, MX: 20, KR: 9 },
  },
  KE: {
    id: "KE", name: "Kenya", flag: "🇰🇪", waitWeeks: 8,
    flight: { IN: 500, TH: 750, TR: 550, SG: 800, MY: 750, AE: 400, MX: 1700, KR: 1000 },
    hours: { IN: 6, TH: 9, TR: 7, SG: 10, MY: 10, AE: 5, MX: 22, KR: 13 },
  },
  GH: {
    id: "GH", name: "Ghana", flag: "🇬🇭", waitWeeks: 10,
    flight: { IN: 850, TH: 1050, TR: 650, SG: 1150, MY: 1100, AE: 650, MX: 1550, KR: 1250 },
    hours: { IN: 11, TH: 14, TR: 6, SG: 15, MY: 15, AE: 8, MX: 18, KR: 16 },
  },
  PH: {
    id: "PH", name: "Philippines", flag: "🇵🇭", waitWeeks: 8,
    flight: { IN: 450, TH: 220, TR: 750, SG: 180, MY: 150, AE: 550, MX: 1400, KR: 300 },
    hours: { IN: 6, TH: 3, TR: 12, SG: 3, MY: 4, AE: 9, MX: 17, KR: 4 },
  },
  IN: {
    id: "IN", name: "India", flag: "🇮🇳", waitWeeks: 2,
    flight: { IN: 0, TH: 250, TR: 450, SG: 300, MY: 280, AE: 250, MX: 1600, KR: 550 },
    hours: { IN: 0, TH: 4, TR: 7, SG: 5, MY: 5, AE: 3, MX: 22, KR: 7 },
  },
  MX: {
    id: "MX", name: "Mexico", flag: "🇲🇽", waitWeeks: 5,
    flight: { IN: 1600, TH: 1500, TR: 1200, SG: 1700, MY: 1650, AE: 1400, MX: 0, KR: 1400 },
    hours: { IN: 22, TH: 21, TR: 14, SG: 22, MY: 23, AE: 16, MX: 0, KR: 15 },
  },
};

export type Tier = "Platinum" | "Gold" | "Verified";

export const VERIFICATION_STEPS = [
  { key: "licence", label: "Licence & registration", detail: "Operating licence cross-checked with the national health regulator." },
  { key: "accreditation", label: "Accreditation validated", detail: "Certificate numbers confirmed directly with the accrediting body." },
  { key: "outcomes", label: "Outcome data audit", detail: "12 months of procedure-level outcomes submitted and sampled against records." },
  { key: "inspection", label: "On-site inspection", detail: "A MedTour clinical auditor walks the ICU, theatres and international desk." },
  { key: "pricelock", label: "Price-lock agreement", detail: "Published package price is contractually fixed for 90 days after quote." },
  { key: "escrow", label: "Milestone payment agreement", detail: "Hospital accepts staged payouts with a 15% holdback until a post-return check." },
] as const;

export interface Hospital {
  id: string;
  name: string;
  city: string;
  country: CountryId;
  specialties: Specialty[];
  accreditations: string[];
  priceIdx: number; // multiplier on the country base price
  riskIdx: number; // multiplier on baseline complication rate (lower is better)
  languages: string[];
  intlPatients: number; // per year
  rating: number;
  reviews: number;
  tier: Tier;
  stepsPassed: number; // of VERIFICATION_STEPS, in order
  lastAudit: string;
  blurb: string;
  hue: number;
}

export const HOSPITALS: Hospital[] = [
  {
    id: "aravali", name: "Aravali Heart & Joint Institute", city: "New Delhi", country: "IN",
    specialties: ["Cardiac", "Orthopaedics", "Spine", "General Surgery", "Oncology"], accreditations: ["JCI", "NABH"],
    priceIdx: 1.05, riskIdx: 0.75, languages: ["English", "Hindi", "Arabic"], intlPatients: 14000,
    rating: 4.8, reviews: 2140, tier: "Platinum", stepsPassed: 6, lastAudit: "2026-09-12",
    blurb: "High-volume cardiac and joint centre with a dedicated international wing and in-house rehab.", hue: 172,
  },
  {
    id: "sahyadri", name: "Sahyadri Multispeciality", city: "Mumbai", country: "IN",
    specialties: ["Orthopaedics", "Bariatric", "Dental", "Ophthalmology", "General Surgery"], accreditations: ["NABH"],
    priceIdx: 0.9, riskIdx: 0.95, languages: ["English", "Hindi"], intlPatients: 5200,
    rating: 4.5, reviews: 980, tier: "Gold", stepsPassed: 5, lastAudit: "2026-07-03",
    blurb: "Value-focused multispeciality hospital close to the airport, popular for bundled packages.", hue: 28,
  },
  {
    id: "kaveri", name: "Kaveri Spine & Ortho Centre", city: "Chennai", country: "IN",
    specialties: ["Spine", "Orthopaedics", "General Surgery"], accreditations: ["JCI", "NABH"],
    priceIdx: 0.95, riskIdx: 0.8, languages: ["English", "Tamil", "Bengali"], intlPatients: 7600,
    rating: 4.7, reviews: 1320, tier: "Platinum", stepsPassed: 6, lastAudit: "2026-10-01",
    blurb: "Specialist spine unit with navigation-assisted surgery and a step-down recovery residence.", hue: 205,
  },
  {
    id: "chaophraya", name: "Chao Phraya International", city: "Bangkok", country: "TH",
    specialties: ["Cardiac", "Orthopaedics", "Spine", "Bariatric", "Dental", "Ophthalmology", "Fertility", "Cosmetics", "General Surgery", "Oncology"], accreditations: ["JCI"],
    priceIdx: 1.1, riskIdx: 0.8, languages: ["English", "Thai", "Arabic", "Japanese"], intlPatients: 31000,
    rating: 4.8, reviews: 4410, tier: "Platinum", stepsPassed: 6, lastAudit: "2026-08-20",
    blurb: "One of the region's largest international hospitals, with interpreters for 20+ languages.", hue: 340,
  },
  {
    id: "andaman", name: "Andaman Wellness Hospital", city: "Phuket", country: "TH",
    specialties: ["Dental", "Bariatric", "Orthopaedics", "Cosmetics", "Ophthalmology"], accreditations: ["HA Thailand"],
    priceIdx: 0.9, riskIdx: 1.05, languages: ["English", "Thai", "Russian"], intlPatients: 6100,
    rating: 4.4, reviews: 760, tier: "Verified", stepsPassed: 4, lastAudit: "2026-05-14",
    blurb: "Resort-side recovery with a strong dental and bariatric programme.", hue: 190,
  },
  {
    id: "bosphorus", name: "Bosphorus Medical Park", city: "Istanbul", country: "TR",
    specialties: ["Bariatric", "Dental", "Orthopaedics", "Cardiac", "Cosmetics", "General Surgery"], accreditations: ["JCI"],
    priceIdx: 1.0, riskIdx: 0.9, languages: ["English", "Turkish", "Arabic", "German"], intlPatients: 18500,
    rating: 4.6, reviews: 2890, tier: "Gold", stepsPassed: 5, lastAudit: "2026-09-28",
    blurb: "Large private campus a short transfer from the airport, with fixed all-inclusive packages.", hue: 12,
  },
  {
    id: "anatolia", name: "Anatolia Smile & Surgery", city: "Antalya", country: "TR",
    specialties: ["Dental", "Bariatric", "Cosmetics", "Ophthalmology"], accreditations: ["TEMOS"],
    priceIdx: 0.85, riskIdx: 1.15, languages: ["English", "Turkish", "Russian"], intlPatients: 4300,
    rating: 4.3, reviews: 640, tier: "Verified", stepsPassed: 4, lastAudit: "2026-04-22",
    blurb: "Boutique clinic group known for aggressive pricing on dental and sleeve packages.", hue: 48,
  },
  {
    id: "merlion", name: "Merlion Specialist Centre", city: "Singapore", country: "SG",
    specialties: ["Cardiac", "Spine", "Orthopaedics", "Oncology", "Fertility"], accreditations: ["JCI"],
    priceIdx: 1.1, riskIdx: 0.65, languages: ["English", "Mandarin", "Malay", "Bahasa"], intlPatients: 9800,
    rating: 4.9, reviews: 1710, tier: "Platinum", stepsPassed: 6, lastAudit: "2026-10-19",
    blurb: "Premium tertiary centre with the lowest audited complication rates on the platform.", hue: 258,
  },
  {
    id: "penang", name: "Penang Straits Hospital", city: "George Town", country: "MY",
    specialties: ["Cardiac", "Orthopaedics", "Dental", "Ophthalmology", "Fertility"], accreditations: ["JCI", "MSQH"],
    priceIdx: 0.95, riskIdx: 0.85, languages: ["English", "Malay", "Mandarin", "Bahasa"], intlPatients: 11200,
    rating: 4.6, reviews: 1540, tier: "Gold", stepsPassed: 5, lastAudit: "2026-08-02",
    blurb: "Well-regarded heart centre with transparent, itemised billing.", hue: 150,
  },
  {
    id: "alnoor", name: "Al Noor Gulf Hospital", city: "Dubai", country: "AE",
    specialties: ["Orthopaedics", "Cardiac", "Bariatric", "Cosmetics", "General Surgery", "Fertility"], accreditations: ["JCI"],
    priceIdx: 1.0, riskIdx: 0.85, languages: ["English", "Arabic", "Urdu", "Hindi"], intlPatients: 8700,
    rating: 4.6, reviews: 1180, tier: "Gold", stepsPassed: 5, lastAudit: "2026-06-30",
    blurb: "Hub-airport convenience for patients from Africa, South Asia and the Gulf.", hue: 36,
  },
  {
    id: "baja", name: "Baja Pacific Surgical", city: "Tijuana", country: "MX",
    specialties: ["Bariatric", "Dental", "Cosmetics", "General Surgery"], accreditations: ["CSG Mexico"],
    priceIdx: 0.9, riskIdx: 1.1, languages: ["English", "Spanish"], intlPatients: 6900,
    rating: 4.4, reviews: 1020, tier: "Verified", stepsPassed: 4, lastAudit: "2026-03-18",
    blurb: "Cross-border bariatric and dental centre with shuttle transfers from San Diego.", hue: 300,
  },
  {
    id: "hanriver", name: "Han River University Hospital", city: "Seoul", country: "KR",
    specialties: ["Spine", "Cardiac", "Orthopaedics", "Cosmetics", "Oncology"], accreditations: ["JCI", "KOIHA"],
    priceIdx: 1.0, riskIdx: 0.7, languages: ["English", "Korean", "Mandarin", "Russian"], intlPatients: 10400,
    rating: 4.8, reviews: 1890, tier: "Platinum", stepsPassed: 6, lastAudit: "2026-09-05",
    blurb: "University teaching hospital with robotic spine and minimally-invasive cardiac programmes.", hue: 222,
  },
];

export const treatmentById = (id?: string | null) =>
  TREATMENTS.find((t) => t.id === id) ?? TREATMENTS[0];
export const hospitalById = (id?: string | null) => HOSPITALS.find((h) => h.id === id);
export const homeById = (id?: string | null): Home =>
  (id && HOMES[id as HomeId]) || HOMES.UK;
export const offers = (h: Hospital, t: Treatment) => h.specialties.includes(t.specialty);
export const priceAt = (h: Hospital, t: Treatment) =>
  Math.round((t.price[h.country] * h.priceIdx) / 50) * 50;
export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + "%";

/* ───────────────────────── 5. Specialists & Doctors ───────────────────────── */

export interface Doctor {
  id: string;
  name: string;
  title: string;
  hospitalId: string;
  specialties: Specialty[];
  experienceYears: number;
  surgeriesPerformed: number;
  auditedComplicationRate: number; // e.g. 0.016 = 1.6%
  credentials: string[];
  education: string;
  languages: string[];
  rating: number;
  reviewsCount: number;
  availableDaysNotice: number;
  bio: string;
}

export const DOCTORS: Doctor[] = [
  {
    id: "dr-sharma",
    name: "Dr. Rajesh Sharma",
    title: "Director of Cardiothoracic & Vascular Surgery",
    hospitalId: "aravali",
    specialties: ["Cardiac"],
    experienceYears: 24,
    surgeriesPerformed: 8200,
    auditedComplicationRate: 0.021,
    credentials: ["MS (Gen Surg)", "MCh (CTVS - AIIMS)", "Fellow, Cleveland Clinic (USA)"],
    education: "All India Institute of Medical Sciences (AIIMS) & Cleveland Clinic",
    languages: ["English", "Hindi"],
    rating: 4.9,
    reviewsCount: 640,
    availableDaysNotice: 5,
    bio: "Pioneered off-pump beating-heart coronary artery bypass surgery in South Asia with an audited 98.4% success rate across international cohorts.",
  },
  {
    id: "dr-kapoor",
    name: "Dr. Sunita Kapoor",
    title: "Chief of Joint Reconstruction & Orthopaedics",
    hospitalId: "aravali",
    specialties: ["Orthopaedics"],
    experienceYears: 19,
    surgeriesPerformed: 5400,
    auditedComplicationRate: 0.018,
    credentials: ["MS (Ortho)", "FRCS (Glasgow)", "Fellowship in Robotic Arthroplasty (UK)"],
    education: "Maulana Azad Medical College & Royal College of Surgeons, Glasgow",
    languages: ["English", "Hindi", "Punjabi"],
    rating: 4.8,
    reviewsCount: 480,
    availableDaysNotice: 4,
    bio: "Specializes in computer-navigated and robotic total knee and hip replacements with same-day assisted mobilisation protocols.",
  },
  {
    id: "dr-natarajan",
    name: "Dr. K. Natarajan",
    title: "Senior Spine & Neurosurgeon",
    hospitalId: "kaveri",
    specialties: ["Spine"],
    experienceYears: 22,
    surgeriesPerformed: 4900,
    auditedComplicationRate: 0.022,
    credentials: ["MCh (Neurosurgery)", "Fellow, Spinal Surgery (Stanford)", "AO Spine Faculty"],
    education: "Madras Medical College & Stanford University Medical Center",
    languages: ["English", "Tamil", "Hindi"],
    rating: 4.8,
    reviewsCount: 390,
    availableDaysNotice: 6,
    bio: "Internationally renowned for endoscopic spinal decompression and minimally invasive multi-level lumbar fusion with intraoperative neuromonitoring.",
  },
  {
    id: "dr-prasert",
    name: "Dr. Somchai Prasert",
    title: "Chief of Orthopaedic Robotic Center",
    hospitalId: "chaophraya",
    specialties: ["Orthopaedics"],
    experienceYears: 21,
    surgeriesPerformed: 6800,
    auditedComplicationRate: 0.016,
    credentials: ["MD (Mahidol)", "Fellow, American Academy of Orthopaedic Surgeons (FAAOS)"],
    education: "Siriraj Hospital, Mahidol University & Mayo Clinic",
    languages: ["English", "Thai", "Japanese"],
    rating: 4.9,
    reviewsCount: 920,
    availableDaysNotice: 7,
    bio: "Lead surgeon for over 1,200 foreign joint replacement patients annually, incorporating personalised kinematic alignment.",
  },
  {
    id: "dr-lim",
    name: "Dr. Marcus Lim",
    title: "Senior Consultant Cardiothoracic Surgeon",
    hospitalId: "merlion",
    specialties: ["Cardiac"],
    experienceYears: 26,
    surgeriesPerformed: 7100,
    auditedComplicationRate: 0.012,
    credentials: ["MBBS (NUS)", "FRCS (Edinburgh)", "FAMS (Cardiothoracic)"],
    education: "National University of Singapore & Royal Papworth Hospital, Cambridge",
    languages: ["English", "Mandarin", "Malay"],
    rating: 4.95,
    reviewsCount: 510,
    availableDaysNotice: 10,
    bio: "Maintains one of Asia's lowest verified CABG complication rates (1.2%), specializing in total arterial revascularization and high-risk complex re-dos.",
  },
  {
    id: "dr-yilmaz",
    name: "Dr. Mehmet Yilmaz",
    title: "Head of Bariatric & Metabolic Surgery",
    hospitalId: "bosphorus",
    specialties: ["Bariatric"],
    experienceYears: 18,
    surgeriesPerformed: 5100,
    auditedComplicationRate: 0.019,
    credentials: ["MD (Istanbul)", "Fellow, IFSO (International Federation for Surgery of Obesity)"],
    education: "Istanbul University Cerrahpasa Faculty of Medicine",
    languages: ["English", "Turkish", "German", "Arabic"],
    rating: 4.7,
    reviewsCount: 840,
    availableDaysNotice: 3,
    bio: "Pioneered single-incision laparoscopic sleeve gastrectomy in Istanbul with structured 12-month post-op nutritional tele-guidance.",
  },
  {
    id: "dr-rodriguez",
    name: "Dr. Carlos Rodriguez-Vera",
    title: "Director of Advanced Bariatric Institute",
    hospitalId: "baja",
    specialties: ["Bariatric"],
    experienceYears: 16,
    surgeriesPerformed: 4300,
    auditedComplicationRate: 0.024,
    credentials: ["MD (UNAM)", "FACS (Fellow, American College of Surgeons)", "ASMBS Member"],
    education: "Universidad Nacional Autonoma de Mexico & UC San Diego Visiting Fellow",
    languages: ["English", "Spanish"],
    rating: 4.6,
    reviewsCount: 620,
    availableDaysNotice: 4,
    bio: "Has performed over 4,000 bariatric procedures for US and Canadian patients with strict leak-test protocols and cross-border emergency transfer agreements.",
  },
  {
    id: "dr-park",
    name: "Dr. Ji-Hoon Park",
    title: "Professor & Chair of Minimally Invasive Spine Center",
    hospitalId: "hanriver",
    specialties: ["Spine"],
    experienceYears: 23,
    surgeriesPerformed: 5800,
    auditedComplicationRate: 0.015,
    credentials: ["MD, PhD (Seoul National Univ)", "Fellow, Johns Hopkins Spine Center"],
    education: "Seoul National University College of Medicine & Johns Hopkins",
    languages: ["English", "Korean", "Mandarin"],
    rating: 4.9,
    reviewsCount: 710,
    availableDaysNotice: 8,
    bio: "Pioneered biportal endoscopic lumbar interbody fusion (BE-LIF) allowing patients to walk 4 hours post-operatively.",
  },
  {
    id: "dr-almansoori",
    name: "Dr. Fatima Al-Mansoori",
    title: "Consultant Orthopaedic & Sports Medicine Surgeon",
    hospitalId: "alnoor",
    specialties: ["Orthopaedics"],
    experienceYears: 17,
    surgeriesPerformed: 3600,
    auditedComplicationRate: 0.020,
    credentials: ["MBChB (Edinburgh)", "FRCS Tr&Orth (UK)", "CCT (UK)"],
    education: "University of Edinburgh & Royal National Orthopaedic Hospital, Stanmore",
    languages: ["English", "Arabic", "French"],
    rating: 4.8,
    reviewsCount: 410,
    availableDaysNotice: 5,
    bio: "Expert in patient-specific 3D printed knee guides and joint preservation surgery for international patients across EMEA.",
  },
  {
    id: "dr-chatterjee",
    name: "Dr. Ananya Chatterjee",
    title: "Chief of Robotic Surgical Oncology",
    hospitalId: "aravali",
    specialties: ["Oncology", "General Surgery"],
    experienceYears: 20,
    surgeriesPerformed: 4100,
    auditedComplicationRate: 0.023,
    credentials: ["MS (Gen Surg)", "MCh (Surg Onco - Tata Memorial)", "Fellow, Memorial Sloan Kettering (USA)"],
    education: "Tata Memorial Hospital & Memorial Sloan Kettering Cancer Center",
    languages: ["English", "Hindi", "Bengali"],
    rating: 4.9,
    reviewsCount: 520,
    availableDaysNotice: 5,
    bio: "Pioneered nerve-sparing robotic radical prostatectomy and cytoreductive oncology with multi-disciplinary tumor board consensus.",
  },
  {
    id: "dr-somporn",
    name: "Dr. Somporn Vachiraphan",
    title: "Director of Aesthetic & Reconstructive Surgery",
    hospitalId: "chaophraya",
    specialties: ["Cosmetics"],
    experienceYears: 22,
    surgeriesPerformed: 6200,
    auditedComplicationRate: 0.014,
    credentials: ["MD (Chulalongkorn)", "Diplomate, American Board of Hair & Plastic Surgery", "ISAPS Member"],
    education: "Chulalongkorn University & Beverly Hills Plastic Surgery Fellowship",
    languages: ["English", "Thai"],
    rating: 4.9,
    reviewsCount: 780,
    availableDaysNotice: 4,
    bio: "Internationally renowned for deep-plane SMAS rhytidectomy, dual-plane breast reconstruction, and natural high-density FUE hair restoration.",
  },
  {
    id: "dr-kaya",
    name: "Dr. Zeynep Kaya",
    title: "Head of Cornea & Refractive Laser Centre",
    hospitalId: "anatolia",
    specialties: ["Ophthalmology"],
    experienceYears: 15,
    surgeriesPerformed: 7900,
    auditedComplicationRate: 0.011,
    credentials: ["MD (Hacettepe)", "Fellow, European Board of Ophthalmology (FEBO)", "ESCRS Member"],
    education: "Hacettepe Faculty of Medicine & Moorfields Eye Hospital, London",
    languages: ["English", "Turkish", "Russian"],
    rating: 4.85,
    reviewsCount: 690,
    availableDaysNotice: 2,
    bio: "Performs customized topography-guided Femto-LASIK, SMILE, and premium trifocal cataract lenses with 99.1% 20/20 visual recovery.",
  },
];

export const doctorsByHospital = (hospitalId: string) =>
  DOCTORS.filter((d) => d.hospitalId === hospitalId);

export const doctorsBySpecialty = (specialty: Specialty) =>
  DOCTORS.filter((d) => d.specialties.includes(specialty));

/* ───────────────────────── 6. Multi-Currency Engine ───────────────────────── */

export type CurrencyCode = "USD" | "EUR" | "GBP" | "AED" | "INR" | "CAD" | "AUD" | "SGD";

export interface CurrencyRate {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateFromUsd: number; // 1 USD = rate
}

export const CURRENCIES: Record<CurrencyCode, CurrencyRate> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", rateFromUsd: 1.0 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", rateFromUsd: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", rateFromUsd: 0.79 },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham", rateFromUsd: 3.67 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", rateFromUsd: 84.5 },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", rateFromUsd: 1.38 },
  AUD: { code: "AUD", symbol: "AU$", name: "Australian Dollar", rateFromUsd: 1.54 },
  SGD: { code: "SGD", symbol: "SG$", name: "Singapore Dollar", rateFromUsd: 1.34 },
};

export const formatCurrency = (usdAmount: number, currency: CurrencyCode = "USD") => {
  const c = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = Math.round(usdAmount * c.rateFromUsd);
  return `${c.symbol}${converted.toLocaleString("en-US")}`;
};

/* ───────────────────────── 7. Loyalty & Special Offers ───────────────────────── */

export interface SpecialPackage {
  id: string;
  title: string;
  hospitalId: string;
  treatmentId: TreatmentId;
  discountPct: number;
  perks: string[];
  expiresInDays: number;
  badge: string;
}

export const SPECIAL_PACKAGES: SpecialPackage[] = [
  {
    id: "pkg-bangkok-cardiac",
    title: "Bangkok Complete Cardiac & 14-Day River Recovery",
    hospitalId: "chaophraya",
    treatmentId: "cabg",
    discountPct: 12,
    perks: ["Complimentary VIP airport transfer", "14 nights 5-star recovery residence", "Post-op cardiology tele-review pack (12 mo)"],
    expiresInDays: 14,
    badge: "Most Popular",
  },
  {
    id: "pkg-delhi-robotic-knee",
    title: "Delhi Robotic Dual-Knee Fast-Track Package",
    hospitalId: "aravali",
    treatmentId: "knee",
    discountPct: 15,
    perks: ["Computer-navigated robotic surgery", "Daily physiotherapy at guest hotel", "Zero currency exchange markup"],
    expiresInDays: 21,
    badge: "Limited Seasonal",
  },
  {
    id: "pkg-seoul-robotic-spine",
    title: "Seoul Endoscopic Spine Fusion & Bio-Regen",
    hospitalId: "hanriver",
    treatmentId: "spine",
    discountPct: 10,
    perks: ["3D Biportal endoscopic instrumentation", "Personal English medical concierges", "Dedicated high-speed recovery suite"],
    expiresInDays: 9,
    badge: "Technological Frontier",
  },
];

export const SAMPLE_REPORTS: { label: string; text: string }[] = [
  {
    label: "Knee osteoarthritis",
    text: `Patient: 64-year-old female. Complaint: chronic bilateral knee pain, worse on stairs, 3 years.
X-ray both knees (AP/lateral, weight-bearing): marked medial joint space narrowing, osteophytes, varus deformity. Kellgren-Lawrence grade IV osteoarthritis right knee, grade III left.
History: Type 2 diabetes mellitus on metformin. HbA1c 7.8%. BP 148/92 mmHg. BMI 31.4. Non-smoker.
Labs: Hemoglobin 12.6 g/dL, Creatinine 0.9 mg/dL.
Impression: End-stage osteoarthritis right knee. Conservative management failed. Advised total knee replacement (TKR).`,
  },
  {
    label: "Coronary artery disease",
    text: `58 year old male, exertional angina class III. Smoker, 20 pack-years.
Coronary angiography: triple vessel disease - LAD 90% proximal stenosis, LCx 80%, RCA 85%. Left main 40%.
Echo: LV ejection fraction 38%, mild MR. BP 136/84 mmHg. BMI 27.2.
Labs: HbA1c 6.1%, Hemoglobin 13.9 g/dL, Creatinine 1.5 mg/dL.
Impression: Severe triple vessel coronary artery disease with reduced LV function. Recommended CABG (coronary bypass).`,
  },
  {
    label: "Severe obesity",
    text: `Patient: 41 yr female. Weight 128 kg, height 162 cm, BMI 48.8 - morbid obesity class III.
Co-morbidities: obstructive sleep apnea on CPAP, hypertension (BP 152/96), pre-diabetes HbA1c 6.3%.
Failed supervised diet programme x 2 years. Never smoked. Hemoglobin 10.4 g/dL.
Upper GI endoscopy: normal, no hiatus hernia.
Plan: Candidate for bariatric surgery - laparoscopic sleeve gastrectomy.`,
  },
  {
    label: "Cataract & Vision Loss",
    text: `Patient: 68-year-old male. History: Progressive visual blur in bilateral eyes, glare during night driving.
Slit-lamp exam: Nuclear sclerosis grade 3+ right eye, 2+ left eye. Posterior subcapsular opacity.
Intraocular pressure: 16 mmHg OD, 15 mmHg OS.
Vitals: BP 132/82 mmHg, HbA1c 6.4%, BMI 26.5.
Diagnosis: Bilateral senile cataracts.
Recommendation: Phacoemulsification with multifocal IOL (cataract surgery).`,
  },
  {
    label: "IVF / Fertility Consult",
    text: `Patient: 35-year-old female, nulligravida. Primary infertility for 3 years.
Hormonal profile: AMH 0.9 ng/mL (diminished ovarian reserve), FSH 11.2 mIU/mL, LH 6.8 mIU/mL.
Ultrasound: Antral follicle count 6. Uterine cavity normal, endometrial thickness 8.5mm.
Partner semen analysis: Moderate oligoasthenoteratozoospermia.
Plan: Indicated for IVF cycle with ICSI (Intracytoplasmic Sperm Injection) and blastocyst culture.`,
  },
  {
    label: "Gallstones (Cholelithiasis)",
    text: `Patient: 46-year-old female. Recurrent right upper quadrant postprandial biliary colic, nausea after fatty meals.
Abdominal Ultrasound: Multiple mobile gallstones in gallbladder lumen, maximum size 14mm. Gallbladder wall thickness 3.2mm. Common bile duct 5mm, clear.
Vitals: BP 128/78 mmHg, BMI 29.1, HbA1c 5.6%.
Impression: Symptomatic cholelithiasis.
Advice: Elective laparoscopic cholecystectomy (gallbladder removal).`,
  },
];
