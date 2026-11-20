import { CountryId } from "./data";

export interface RecoveryHotel {
  name: string;
  type: string; // e.g. "Serviced Medical Apartment", "5-Star Convalescent Resort", "Boutique Recovery Suite"
  pricePerNight: number;
  distanceToHospital: string;
  amenities: string[];
}

export interface GentleActivity {
  title: string;
  type: "Scenic" | "Cultural" | "Nature" | "Dining" | "Wellness";
  description: string;
  walkingLevel: "Minimal" | "Low" | "Moderate";
  wheelchairAccessible: boolean;
  idealRecoveryStage: "Early (Days 3-7)" | "Mid (Days 8-12)" | "Clearance Window (Days 13+)";
}

export interface CompanionDayPlan {
  day: number;
  phase: string;
  title: string;
  activity: string;
  patientStatus: string;
  tip: string;
}

export interface DestinationGuide {
  id: string; // e.g. "bangkok", "new-delhi", "istanbul"
  city: string;
  countryId: CountryId;
  countryName: string;
  flag: string;
  tagline: string;
  overview: string;
  heroImageGradient: string;
  companionFriendlyRating: number; // 1-5
  convalescenceScore: number; // 1-5
  valueRating: number; // 1-5
  vibe: "Tropical Recovery" | "Heritage & Culture" | "Modern Luxury" | "Scenic Seafront" | "Quick Cross-Border";
  
  // Weather & Climate
  climate: {
    bestMonths: string;
    avgTempC: string;
    humidity: string;
    recoveryAdvice: string;
  };

  // Visa & Entry Rules
  visa: {
    visaType: string;
    processingDays: number;
    feeUsd: number;
    validity: string;
    companionAttendantAllowed: boolean;
    companionAttendantQuota: number;
    fastTrackAirportImmigration: boolean;
    requirementsSummary: string;
  };

  // Practicalities
  practicalities: {
    airportName: string;
    airportCode: string;
    transferMinutesToMedicalDistrict: number;
    localCurrency: string;
    currencyCode: string;
    usdRateApprox: string;
    rideHailingApps: string[];
    simCardAdvice: string;
    englishFluencyLevel: "High" | "Very High" | "Moderate";
    emergencyPhone: {
      police: string;
      ambulance: string;
      touristPolice?: string;
    };
  };

  // Recovery Stays & Hotels
  recoveryHotels: RecoveryHotel[];

  // Gentle post-op sightseeing for patient
  gentleActivities: GentleActivity[];

  // 5-Day Companion Itinerary
  companionItinerary: CompanionDayPlan[];
}

export const DESTINATION_GUIDES: DestinationGuide[] = [
  {
    id: "bangkok",
    city: "Bangkok",
    countryId: "TH",
    countryName: "Thailand",
    flag: "🇹🇭",
    tagline: "World-class private medical hospitality with tropical convalescence",
    overview:
      "Bangkok blends legendary Thai hospitality with globally accredited private medical towers. Patients benefit from air-conditioned skywalks, dedicated hotel-hospital bridge links, and world-renowned service standards.",
    heroImageGradient: "from-emerald-700 via-teal-800 to-cyan-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 5,
    vibe: "Tropical Recovery",
    climate: {
      bestMonths: "November to February (dry, breezy, cooler evenings)",
      avgTempC: "27°C - 31°C",
      humidity: "Moderate to Tropical",
      recoveryAdvice: "Ideal winter recovery weather. Stay in climate-controlled serviced apartments during midday heat and enjoy serene riverside evenings.",
    },
    visa: {
      visaType: "Thailand Non-Immigrant (MT) Medical Tourist Visa & 60-Day Visa Exemption",
      processingDays: 5,
      feeUsd: 40,
      validity: "60 to 90 days, extendable with hospital certification",
      companionAttendantAllowed: true,
      companionAttendantQuota: 3,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Hospital confirmation letter, passport with 6+ months validity, proof of funds ($800 equivalent). Fast-track medical immigration lane at Suvarnabhumi Airport (BKK).",
    },
    practicalities: {
      airportName: "Suvarnabhumi Airport",
      airportCode: "BKK",
      transferMinutesToMedicalDistrict: 35,
      localCurrency: "Thai Baht (THB)",
      currencyCode: "THB",
      usdRateApprox: "1 USD ≈ 35 THB",
      rideHailingApps: ["Grab", "Bolt", "Hospital Private Chauffeur"],
      simCardAdvice: "AIS or True 5G tourist eSIM available at arrivals for $10 with unlimited high-speed data.",
      englishFluencyLevel: "High",
      emergencyPhone: {
        police: "191",
        ambulance: "1669",
        touristPolice: "1155 (English speaking)",
      },
    },
    recoveryHotels: [
      {
        name: "Aetas Residence & Convalescence Suites",
        type: "Serviced Medical Apartment",
        pricePerNight: 85,
        distanceToHospital: "0.4 km (5 min walk / wheelchair shuttle)",
        amenities: ["Roll-in shower", "Kitchenette", "On-call nurse visits", "Daily linen sanitization", "Quiet garden wing"],
      },
      {
        name: "Sindhorn Kempinski Wellness Haven",
        type: "5-Star Convalescent Resort",
        pricePerNight: 210,
        distanceToHospital: "1.8 km (10 min car transfer)",
        amenities: ["Hydrotherapy recovery pools", "Organic anti-inflammatory dining", "Hypoallergenic bedding", "Direct park access"],
      },
      {
        name: "Chao Phraya Riverside Serviced Suites",
        type: "Riverside Recovery Suite",
        pricePerNight: 110,
        distanceToHospital: "2.5 km (River shuttle / 12 min car)",
        amenities: ["River-view balcony", "Full kitchen", "Companion daybed", "Wheelchair ramp access", "24/7 concierge"],
      },
    ],
    gentleActivities: [
      {
        title: "Chao Phraya Sunset Air-Conditioned River Cruise",
        type: "Scenic",
        description: "Glide past illuminated temples on a seated, zero-strain luxury river catamaran with smooth boarding.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "Lumpini & Benjakitti Forest Park Wheelchair Boardwalk",
        type: "Nature",
        description: "Elevated, shaded ramps through serene lotus ponds and bamboo groves with frequent resting pavilions.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Jim Thompson House Garden & Silk Pavilion",
        type: "Cultural",
        description: "Lush tropical oasis with koi ponds, air-conditioned art galleries, and serene shaded teak architecture.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "Hospital Check-in & Orientation",
        activity: "Escort patient to private hospital room; register with international patient liaison; purchase local SIM and unpack in recovery suite.",
        patientStatus: "Pre-operative testing & surgical consultation",
        tip: "Download Grab app for seamless hospital-to-hotel rides and food delivery.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Peaceful Respite",
        activity: "Remain on hospital family lounge floor during procedure; take a relaxing walk through hospital rooftop healing garden; unwind at an authentic herbal tea house.",
        patientStatus: "Undergoing surgery & PACU monitoring",
        tip: "The hospital international desk provides real-time digital surgery milestone tracking.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1 Post-Op)",
        title: "IconSiam & Riverside Exploration",
        activity: "Spend morning by patient's bedside; take afternoon river ferry to IconSiam indoor cultural market for companion dining and light shopping.",
        patientStatus: "Initial in-bed mobilization & pain management",
        tip: "Bring back gentle fresh coconut water and soft tropical fruits for the patient.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2 Post-Op)",
        title: "Wat Pho & Old Town Heritage Walk",
        activity: "Visit the serene Reclining Buddha temple in the cool morning; enjoy a traditional Thai companion foot massage at the historic pavilion.",
        patientStatus: "Assisted corridor walking & physical therapy",
        tip: "Keep hospital visitor badge with you for 24/7 patient ward re-entry.",
      },
      {
        day: 5,
        phase: "Hospital Discharge",
        title: "Transfer to Convalescence Residence",
        activity: "Handle discharge documentation and medications; accompany patient via wheelchair-accessible transfer to serviced convalescent suite.",
        patientStatus: "Discharged to recovery suite with oral medications",
        tip: "Confirm post-op follow-up appointment date and fit-to-fly clearance schedule with surgeon.",
      },
    ],
  },
  {
    id: "new-delhi",
    city: "New Delhi",
    countryId: "IN",
    countryName: "India",
    flag: "🇮🇳",
    tagline: "Premier quaternary surgical hub with rich cultural grandeur and private chauffeur care",
    overview:
      "New Delhi offers India's most advanced tertiary medical institutions paired with dedicated international patient wings. World-class specialist surgeons, private nursing at a fraction of Western costs, and tranquil heritage gardens make it a preferred medical corridor.",
    heroImageGradient: "from-amber-800 via-orange-900 to-stone-950",
    companionFriendlyRating: 5,
    convalescenceScore: 4,
    valueRating: 5,
    vibe: "Heritage & Culture",
    climate: {
      bestMonths: "October to March (crisp, pleasant, sunny days with 18°C-24°C)",
      avgTempC: "18°C - 26°C",
      humidity: "Low (Autumn/Winter)",
      recoveryAdvice: "Autumn and winter are ideal for recovery. Air purifiers are standard in top recovery residences. Private chauffeured cars ensure seamless door-to-door comfort.",
    },
    visa: {
      visaType: "Indian e-Medical Visa & e-Medical Attendant Visa (MED / MED-X)",
      processingDays: 4,
      feeUsd: 80,
      validity: "60 days, triple entry, extendable via FRRO",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Hospital letterhead invitation letter with treatment plan, passport copy. Dedicated e-Medical immigration counters at IGI Airport Terminal 3.",
    },
    practicalities: {
      airportName: "Indira Gandhi International Airport",
      airportCode: "DEL",
      transferMinutesToMedicalDistrict: 30,
      localCurrency: "Indian Rupee (INR)",
      currencyCode: "INR",
      usdRateApprox: "1 USD ≈ 86 INR",
      rideHailingApps: ["Uber", "Ola", "Hospital Private Chauffeur"],
      simCardAdvice: "Airtel / Jio 5G tourist SIM provided at IGI T3 arrivals hall ($8 for 30 days).",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "112",
        ambulance: "102 / 108",
        touristPolice: "011-23363056",
      },
    },
    recoveryHotels: [
      {
        name: "The Roseate Serviced Recovery Villa",
        type: "Boutique Recovery Suite",
        pricePerNight: 95,
        distanceToHospital: "4.0 km (15 min private car)",
        amenities: ["Private tranquil garden", "Customized dietary chef", "Wheelchair accessible", "Full air filtration", "Private nursing on call"],
      },
      {
        name: "Fraser Suites Diplomatic Enclave",
        type: "Serviced Medical Apartment",
        pricePerNight: 120,
        distanceToHospital: "3.2 km (12 min car transfer)",
        amenities: ["Full modular kitchen", "Grab bars in bathrooms", "In-room laundry", "Quiet residential street", "Doctor-on-call"],
      },
      {
        name: "ITC Maurya Health Residence",
        type: "5-Star Convalescent Resort",
        pricePerNight: 180,
        distanceToHospital: "6.0 km (20 min car transfer)",
        amenities: ["Pioneering indoor air purification", "Ayurvedic wellness consultation", "24/7 medical concierge", "Specialist menu"],
      },
    ],
    gentleActivities: [
      {
        title: "Lodhi Art District & Heritage Gardens Gentle Stroll",
        type: "Cultural",
        description: "Paved, level walkways among 15th-century Mughal mausoleums, blooming winter roses, and open-air modern murals.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "National Gallery of Modern Art (NGMA) & Jaipur House",
        type: "Cultural",
        description: "Fully air-conditioned historic palace with elevators, wheelchair ramps, and tranquil outdoor fountain court.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Sunder Nursery Mughal Heritage Micro-Habitat",
        type: "Nature",
        description: "UNESCO-restored ecological park with gentle marble water streams, wide paved stone promenades, and bird sanctuaries.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "Smooth Delhi Arrival & Hospital Suite Settling",
        activity: "Private airport pickup arranged by hospital international desk; patient admission to deluxe suite; meet international clinical coordinator.",
        patientStatus: "Cardio clearance, MRI/CT scans, pre-anesthesia check",
        tip: "Download Uber India for instant, upfront-priced rides across South Delhi.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Peaceful Wait & South Delhi Highlights",
        activity: "Wait in comfortable hospital attendant suite; visit nearby Humayun's Tomb gardens for tranquil reflection; return for post-op ICU briefing.",
        patientStatus: "Undergoing surgery & post-op recovery monitoring",
        tip: "Hospital international desk provides complimentary Wi-Fi and hot beverage lounge.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Khan Market & Craft Bazaar Shopping",
        activity: "Support patient with morning breakfast; spend afternoon browsing boutique bookstores, artisanal tea shops, and cashmere boutiques in Khan Market.",
        patientStatus: "Surgical drain monitoring & assisted standing",
        tip: "Khan Market has world-class pharmacies and international gourmet groceries.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Qutub Minar & Mehrauli Heritage Promenade",
        activity: "Morning visit with patient; afternoon excursion with private chauffeur to Qutub Complex and contemporary Indian art galleries in Lado Sarai.",
        patientStatus: "Corridor physiotherapy with walker/crutches",
        tip: "Hire private chauffeur through hotel concierge ($35 for full 8-hour disposal).",
      },
      {
        day: 5,
        phase: "Hospital Discharge",
        title: "Discharge & Convalescence Check-In",
        activity: "Settle hospital tranches via escrow; collect medical records and surgical notes; transfer patient to serviced recovery apartment.",
        patientStatus: "Discharge clearance granted; oral pain management",
        tip: "Arrange for dedicated visiting nurse service for morning dressing checks ($15/day).",
      },
    ],
  },
  {
    id: "istanbul",
    city: "Istanbul",
    countryId: "TR",
    countryName: "Türkiye",
    flag: "🇹🇷",
    tagline: "Eurasian medical capital with thermal mineral wellness and Bosphorus sea breezes",
    overview:
      "Bridging Europe and Asia, Istanbul is a premier global hub for cosmetic surgery, orthopaedics, and hair transplantation. JCI-accredited medical cities offer comprehensive travel packages including VIP airport transfers, luxury recovery hotels, and Bosphorus convalescence.",
    heroImageGradient: "from-blue-900 via-sky-950 to-teal-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 5,
    vibe: "Scenic Seafront",
    climate: {
      bestMonths: "April to June & September to November (mild, sunny, sea breezes)",
      avgTempC: "19°C - 24°C",
      humidity: "Moderate",
      recoveryAdvice: "Bosphorus sea air is exceptionally restorative. Spring and autumn provide ideal outdoor strolling without summer crowds or winter chill.",
    },
    visa: {
      visaType: "Türkiye Electronic Visa (e-Visa) & USHAŞ Health Tourism Fast-Track",
      processingDays: 3,
      feeUsd: 60,
      validity: "90 days within 180 days (multiple entry)",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Online e-Visa application in 5 minutes. Accredited health tourism partner hospitals provide fast-track meet-and-greet at Istanbul Airport (IST).",
    },
    practicalities: {
      airportName: "Istanbul Grand Airport",
      airportCode: "IST",
      transferMinutesToMedicalDistrict: 35,
      localCurrency: "Turkish Lira (TRY)",
      currencyCode: "TRY",
      usdRateApprox: "1 USD ≈ 36 TRY",
      rideHailingApps: ["BiTaksi", "Uber", "Hospital VIP Mercedes Sprinter"],
      simCardAdvice: "Turkcell tourist SIM package at IST arrivals hall ($25 for 20 GB).",
      englishFluencyLevel: "High",
      emergencyPhone: {
        police: "155",
        ambulance: "112",
        touristPolice: "0212 527 4503",
      },
    },
    recoveryHotels: [
      {
        name: "Swissôtel The Bosphorus Convalescent Wing",
        type: "5-Star Convalescent Resort",
        pricePerNight: 195,
        distanceToHospital: "3.5 km (15 min VIP transfer)",
        amenities: ["Historic private gardens", "Holistic spa convalescence", "Seafront panoramic terrace", "Purovel wellness dining", "Wheelchair access"],
      },
      {
        name: "Radisson Blu Residence Maslak",
        type: "Serviced Medical Apartment",
        pricePerNight: 95,
        distanceToHospital: "1.2 km (5 min VIP shuttle)",
        amenities: ["Full kitchenette", "Walk-in shower with safety bars", "Direct mall connector", "24/7 room service", "Quiet high-floor suites"],
      },
      {
        name: "Bosphorus Waterfront Recovery Suites",
        type: "Boutique Recovery Suite",
        pricePerNight: 130,
        distanceToHospital: "4.0 km (18 min car transfer)",
        amenities: ["Private sea-view balcony", "Fresh sea air recuperation", "Companion sofa-bed", "Elevator to seaside promenade"],
      },
    ],
    gentleActivities: [
      {
        title: "Bosphorus Private Yacht Scenic Cruise",
        type: "Scenic",
        description: "Private cruise along Ottoman waterfront palaces with gentle sea breezes and zero walking required.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Emirgan Tulip Park Accessible Seafront Promenade",
        type: "Nature",
        description: "Seaside wooden boardwalk with benches every 20 metres, shade trees, and tranquil tea gardens overlooking the strait.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "Dolmabahçe Palace Gardens & Tea Pavilion",
        type: "Cultural",
        description: "Flat marble palace courtyard with ornate fountains and shaded seaside cafe looking across to the Asian shore.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "VIP Airport Meet & Hospital Suite Orientation",
        activity: "Chauffeured Mercedes transfer from IST airport; hospital check-in; complete pre-op consultation and bloodwork.",
        patientStatus: "Pre-operative blood tests, ECG, and surgical consultation",
        tip: "Download BiTaksi app for quick, card-paid yellow and turquoise cabs.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Cultural Solace in Sultanahmet",
        activity: "While patient is in surgery, visit Hagia Sophia and the Blue Mosque; relax at a historic Turkish hammam lounge with apple tea.",
        patientStatus: "Surgery performed & immediate PACU recovery",
        tip: "The hospital provides private family rooms with sofa-beds and multilingual nurse call buttons.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Grand Bazaar & Spice Market Tasting",
        activity: "Morning bedside check-in; afternoon visit to the covered Spice Bazaar for artisanal Turkish delight, mountain honey, and herbal teas.",
        patientStatus: "Drain management, gentle ambulation, liquid diet",
        tip: "Purchase pure sage (adaçayı) and chamomile tea to aid patient digestive comfort.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Asian Side Ferry & Kadıköy Food Walk",
        activity: "Take a 20-minute scenic ferry across to Kadıköy; enjoy fresh seafood and seaside promenade views before evening hospital visit.",
        patientStatus: "Dressings renewed; full solid diet resumed",
        tip: "Istanbulkart transit card works on all ferries, trams, and funiculars.",
      },
      {
        day: 5,
        phase: "Discharge & Convalescence",
        title: "Transfer to Bosphorus Recovery Suite",
        activity: "Final surgical inspection; discharge clearance; transfer to seaside serviced residence for restful recovery phase.",
        patientStatus: "Discharged; oral medications; light walking prescribed",
        tip: "Ensure patient sits on the right side of the car for comfortable leg stretching.",
      },
    ],
  },
  {
    id: "seoul",
    city: "Seoul",
    countryId: "KR",
    countryName: "South Korea",
    flag: "🇰🇷",
    tagline: "Ultra-advanced medical innovation with tranquil Han River healing and K-Wellness",
    overview:
      "Seoul stands at the pinnacle of robotic surgery, minimally invasive orthopaedics, and world-leading aesthetic medicine. In the upscale Gangnam and Songpa medical districts, patients experience precision medicine alongside high-tech recovery suites.",
    heroImageGradient: "from-slate-900 via-indigo-950 to-blue-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 4,
    vibe: "Modern Luxury",
    climate: {
      bestMonths: "September to November (crisp autumn foliage) & April to May (cherry blossom spring)",
      avgTempC: "15°C - 22°C",
      humidity: "Low to Moderate",
      recoveryAdvice: "Autumn and spring offer crisp, clean air and pleasant walking temperatures. Heated ondol floors in recovery suites provide comforting joint warmth.",
    },
    visa: {
      visaType: "South Korea C-3-3 Medical Tourist Visa & K-ETA Exemption",
      processingDays: 7,
      feeUsd: 60,
      validity: "90 days to 1 year, multiple entry",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Hospital Medical Tourism Invitation Certificate issued through Korea Health Industry Development Institute (KHIDI). Fast-track immigration at Incheon (ICN).",
    },
    practicalities: {
      airportName: "Incheon International Airport",
      airportCode: "ICN",
      transferMinutesToMedicalDistrict: 50,
      localCurrency: "South Korean Won (KRW)",
      currencyCode: "KRW",
      usdRateApprox: "1 USD ≈ 1,420 KRW",
      rideHailingApps: ["Kakao T", "Uber (UT)", "Hospital Limousine"],
      simCardAdvice: "SK Telecom or KT 5G eSIM purchased at ICN arrivals ($20 with unlimited data).",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "112",
        ambulance: "119",
        touristPolice: "1330 (24/7 multilingual helpline)",
      },
    },
    recoveryHotels: [
      {
        name: "Oakwood Premier Coex Center",
        type: "Serviced Medical Apartment",
        pricePerNight: 165,
        distanceToHospital: "2.0 km (8 min taxi / direct hospital liaison)",
        amenities: ["Full gourmet kitchen", "Ondol underfloor heating", "En-suite washing machine", "Direct Coex mall wheelchair access", "24/7 concierge"],
      },
      {
        name: "Signiel Seoul Lotte World Tower Suites",
        type: "5-Star Convalescent Resort",
        pricePerNight: 290,
        distanceToHospital: "1.5 km (6 min limousine)",
        amenities: ["Evian wellness spa", "Panoramic cloud-level recovery views", "Super-sanitized air exchange", "Custom recovery dietary service"],
      },
      {
        name: "Gangnam Medical Convalescence Residences",
        type: "Boutique Recovery Suite",
        pricePerNight: 120,
        distanceToHospital: "0.8 km (walking or private buggy)",
        amenities: ["Post-surgical lymphatic drainage partner", "Ice pack delivery service", "Step-free bathrooms", "Companion workspace"],
      },
    ],
    gentleActivities: [
      {
        title: "Cheonggyecheon Stream Gentle Promenade",
        type: "Nature",
        description: "Sunken urban stream with flat paved walking paths, stepping stones, serene water ripples, and elevator access from street level.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "Insadong Traditional Tea Houses & Hanok Courtyard",
        type: "Cultural",
        description: "Tranquil wooden courtyard cafes serving warm jujube and ginger tea with soothing instrumental music and zero climbing.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "National Museum of Korea Accessible Garden & Lake",
        type: "Cultural",
        description: "World-class cultural campus with expansive elevators, wheelchair-friendly marble galleries, and a scenic lotus reflection pond.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "Incheon Welcome & High-Tech Hospital Admission",
        activity: "AREX Express train or hospital limousine from Incheon; check into international ward; meet bilingual medical coordinator.",
        patientStatus: "Digital 3D imaging, precision robotic surgical planning",
        tip: "Download Kakao T app for automated taxi hailing with English interface.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Peaceful Mind in Bongeunsa Temple",
        activity: "While patient undergoes surgery, take a peaceful stroll through 1,200-year-old Bongeunsa Zen Temple in Gangnam; enjoy tea at the monastery.",
        patientStatus: "Surgery performed; transferred to private recovery ward",
        tip: "Hospital provides automated smartphone notifications at every surgical milestone.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Starfield Library & Coex Art Gallery Walk",
        activity: "Morning bedside visit; spend afternoon exploring the massive Starfield Coex Mall and high-end Korean skincare boutiques.",
        patientStatus: "Physiotherapy evaluation; specialized post-op nutrition",
        tip: "Pick up nourishing Korean ginseng extract and calming barley tea for the patient.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Gyeongbokgung Palace & Samcheong-dong Cafes",
        activity: "Witness the royal changing of the guard ceremony; stroll through peaceful hanok alleyways and contemporary art galleries.",
        patientStatus: "Mobilizing independently; surgical wound check",
        tip: "Subway stations in Seoul have extensive elevators and tactile paving for complete accessibility.",
      },
      {
        day: 5,
        phase: "Discharge & Convalescence",
        title: "Transfer to Serviced Recovery Apartment",
        activity: "Discharge clearance and prescription pickup; settle into Oakwood Premier residence with gentle underfloor heating.",
        patientStatus: "Discharged; post-op recovery timeline initiated",
        tip: "Use the heated ondol floors to soothe sore joints during afternoon relaxation.",
      },
    ],
  },
  {
    id: "penang",
    city: "George Town, Penang",
    countryId: "MY",
    countryName: "Malaysia",
    flag: "🇲🇾",
    tagline: "UNESCO heritage medical sanctuary with English fluency and tranquil sea breezes",
    overview:
      "Penang is renowned across Southeast Asia as the medical tourism capital of Malaysia. Patients enjoy seamless English communication, MHTC (Malaysia Healthcare Travel Council) VIP airport fast-tracks, and affordable seafront recuperation.",
    heroImageGradient: "from-teal-900 via-emerald-950 to-cyan-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 5,
    vibe: "Tropical Recovery",
    climate: {
      bestMonths: "December to April (warm, dry, pleasant coastal breezes)",
      avgTempC: "26°C - 30°C",
      humidity: "Moderate",
      recoveryAdvice: "Coastal sea breezes keep Penang comfortable year-round. Morning garden walks before 11 AM provide excellent vitamin D and gentle circulation.",
    },
    visa: {
      visaType: "Malaysia e-VISA (Medical Tourism Category) & MHTC Green Lane",
      processingDays: 4,
      feeUsd: 25,
      validity: "30 to 90 days, extendable by hospital",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "MHTC hospital appointment letter. Fast-track MHTC immigration lounge at Penang International Airport (PEN) and KLIA.",
    },
    practicalities: {
      airportName: "Penang International Airport",
      airportCode: "PEN",
      transferMinutesToMedicalDistrict: 25,
      localCurrency: "Malaysian Ringgit (MYR)",
      currencyCode: "MYR",
      usdRateApprox: "1 USD ≈ 4.45 MYR",
      rideHailingApps: ["Grab", "AirAsia Ride", "Hospital Concierge Car"],
      simCardAdvice: "Hotlink or Celcom tourist SIM available at arrivals ($8 for 30 days unlimited).",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "999",
        ambulance: "999",
        touristPolice: "04-261 5522",
      },
    },
    recoveryHotels: [
      {
        name: "Eastern & Oriental (E&O) Heritage Suites",
        type: "5-Star Convalescent Resort",
        pricePerNight: 145,
        distanceToHospital: "2.5 km (8 min car transfer)",
        amenities: ["Seafront seafront promenade", "Colonial garden courtyard", "Butler service", "Walk-in rain showers", "Quiet reading rooms"],
      },
      {
        name: "Mansion One Medical Serviced Suites",
        type: "Serviced Medical Apartment",
        pricePerNight: 65,
        distanceToHospital: "0.5 km (3 min walk / shuttle)",
        amenities: ["Direct sea view", "Equipped kitchen", "Wheelchair accessible", "Next door to major private hospitals"],
      },
      {
        name: "G Hotel Gurney Coastal Retreat",
        type: "Boutique Recovery Suite",
        pricePerNight: 110,
        distanceToHospital: "2.0 km (7 min car)",
        amenities: ["Gurney Bay park access", "Level step-free walkways", "Accessible bathrooms", "Organic dining options"],
      },
    ],
    gentleActivities: [
      {
        title: "Penang Botanical Gardens Wheelchair & Tram Route",
        type: "Nature",
        description: "Lush rainforest valley with electric tram rides, accessible paved paths, lotus gardens, and friendly macaque viewing.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Gurney Bay Seafront Promenade",
        type: "Scenic",
        description: "Modern seaside park with wide, smooth paved paths, cooling coastal breezes, and shaded viewing decks.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "Pinang Peranakan Mansion Heritage Tour",
        type: "Cultural",
        description: "Opulent 19th-century emerald green courtyard residence showcasing Straits Chinese culture and serene antique salons.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "MHTC Airport Lounge & Hospital Welcome",
        activity: "Fast-track immigration via MHTC Green Lane; transfer to private hospital ward; initial surgeon consult.",
        patientStatus: "Pre-surgery tests, blood matching, anesthesia consultation",
        tip: "All doctors, nurses, and administrative staff speak fluent English in Penang.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Heritage Architecture Walk",
        activity: "While patient undergoes surgery, explore the historic British colonial civic precinct and Clan Jetties stilt villages.",
        patientStatus: "Surgery performed; postoperative recovery",
        tip: "Hospital provides private companion sleeper recliners in single patient rooms.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Street Art Trail & Specialty Coffee",
        activity: "Bedside morning companionship; afternoon wander through Armenian Street to admire famous interactive murals and artisanal cafes.",
        patientStatus: "Wound inspection; early standing with physical therapist",
        tip: "Try local freshly steamed pau buns and mild ginger broth for easy digestion.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Penang Hill Funicular Train Experience",
        activity: "Ride the air-conditioned Swiss funicular train to Penang Hill summit (833m) for cool mountain air and panoramic island vistas.",
        patientStatus: "Walking down hospital corridors; pain well managed",
        tip: "The funicular train has priority boarding for seniors and medical attendants.",
      },
      {
        day: 5,
        phase: "Discharge & Convalescence",
        title: "Check-in to Seafront Recovery Suite",
        activity: "Collect medical clearance letters; settle into Eastern & Oriental suite overlooking the Andaman sea.",
        patientStatus: "Discharged; post-op medication schedule started",
        tip: "Sit on the seafront balcony in late afternoon for soothing maritime breeze.",
      },
    ],
  },
  {
    id: "dubai",
    city: "Dubai",
    countryId: "AE",
    countryName: "UAE",
    flag: "🇦🇪",
    tagline: "Ultra-luxurious healthcare city with world-class hospitality and seamless accessibility",
    overview:
      "Dubai Healthcare City (DHCC) represents one of the world's most modern dedicated medical free zones. With premier Western-trained surgeons, hospital suites rivaling 5-star hotels, and 100% barrier-free urban accessibility, Dubai provides unmatched luxury convalescence.",
    heroImageGradient: "from-amber-900 via-yellow-950 to-stone-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 4,
    vibe: "Modern Luxury",
    climate: {
      bestMonths: "November to March (warm, sunny, pleasant 22°C-28°C)",
      avgTempC: "23°C - 28°C",
      humidity: "Low (Winter)",
      recoveryAdvice: "Winter months provide perfect resort convalescence. 100% of buildings, vehicles, and metro stations are fully air-conditioned and wheelchair accessible.",
    },
    visa: {
      visaType: "Dubai Health Experience (DXH) Medical Tourist Visa & 30-Day Visa on Arrival",
      processingDays: 4,
      feeUsd: 90,
      validity: "90 days (extendable for medical treatment)",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Hospital sponsor letter through Dubai Health Authority (DHA). Fast-track DXH concierge at Dubai International (DXB).",
    },
    practicalities: {
      airportName: "Dubai International Airport",
      airportCode: "DXB",
      transferMinutesToMedicalDistrict: 15,
      localCurrency: "UAE Dirham (AED)",
      currencyCode: "AED",
      usdRateApprox: "1 USD ≈ 3.67 AED",
      rideHailingApps: ["Careem", "Uber", "Dubai Taxi Corporation (DTC)"],
      simCardAdvice: "Free 1 GB tourist SIM handed at DXB immigration; top up via du or Etisalat.",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "999",
        ambulance: "998 / 999",
        touristPolice: "901",
      },
    },
    recoveryHotels: [
      {
        name: "Hyatt Regency Dubai Healthcare City",
        type: "5-Star Convalescent Resort",
        pricePerNight: 175,
        distanceToHospital: "0.3 km (2 min walk or hospital buggy)",
        amenities: ["Located directly inside DHCC", "Wheelchair accessible bathrooms", "In-room clinical dietary options", "Tranquil outdoor pool and cabanas"],
      },
      {
        name: "Marriott Hotel Al Jaddaf Residences",
        type: "Serviced Medical Apartment",
        pricePerNight: 130,
        distanceToHospital: "2.1 km (7 min transfer)",
        amenities: ["Full kitchen", "Spacious companion living rooms", "Elevators and ramp access", "24/7 room dining"],
      },
      {
        name: "Palazzo Versace Convalescent Suites",
        type: "Boutique Recovery Suite",
        pricePerNight: 280,
        distanceToHospital: "2.8 km (8 min VIP transfer)",
        amenities: ["Dubai Creek waterfront", "Ultra-luxurious quiet suites", "Dedicated concierge", "Private balcony"],
      },
    ],
    gentleActivities: [
      {
        title: "Dubai Miracle Garden Accessible Buggy Tour",
        type: "Nature",
        description: "Spectacular 72,000 sqm floral display with flat paved avenues and chauffeured electric golf cart tours.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "Dubai Creek Traditional Abra Scenic Cruise",
        type: "Scenic",
        description: "Private wooden boat gliding past historic spice wharves and heritage windtowers on gentle calm waters.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Museum of the Future Level Access Visit",
        type: "Cultural",
        description: "Architectural masterpiece with seamless ramp and elevator circulation, immersive digital exhibits, and soothing soundscapes.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "DXH Concierge Meet & Hospital Check-in",
        activity: "Arrive at DXB; meet hospital medical concierge; private transfer to DHCC hospital suite.",
        patientStatus: "Clinical consultations, scans, and surgical planning",
        tip: "Careem app allows booking wheelchair-accessible 'Hala Max' vans.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Solace in Al Fahidi Historical Neighborhood",
        activity: "While patient undergoes surgery, explore traditional coral-stone windtower houses, art galleries, and serene coffee museums.",
        patientStatus: "Undergoing surgery & post-anesthetic monitoring",
        tip: "Hospital suites offer complimentary companion sleeper sofas and private bathrooms.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Dubai Mall Aquarium & Fountain Views",
        activity: "Morning bedside care; afternoon relaxing visit to Dubai Mall to watch the gentle giant aquarium and evening fountain show.",
        patientStatus: "Pain well controlled; first steps with nurse",
        tip: "Dubai Mall provides complimentary wheelchairs at all information desks.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Jumeirah Beach Walk & Palm Monorail",
        activity: "Take a scenic ride on the Palm Monorail overlooking Palm Jumeirah; relax at a seafront cafe with fresh mint lemonade.",
        patientStatus: "Independent ambulation; drain removal scheduled",
        tip: "Keep patient hydrated with high-electrolyte coconut water and fresh dates.",
      },
      {
        day: 5,
        phase: "Discharge & Convalescence",
        title: "Transfer to Healthcare City Convalescent Suite",
        activity: "Receive discharge summary and fit-to-fly timeline; transfer to Hyatt Regency DHCC for pampered recuperation.",
        patientStatus: "Discharged; post-op recovery protocol active",
        tip: "Enjoy sunset views over Dubai skyline from the tranquil hotel garden terrace.",
      },
    ],
  },
  {
    id: "tijuana",
    city: "Tijuana",
    countryId: "MX",
    countryName: "Mexico",
    flag: "🇲🇽",
    tagline: "Premier cross-border medical destination with FastPass border lanes and ocean breezes",
    overview:
      "Located minutes from San Diego, Tijuana is North America's top destination for bariatric, dental, and elective cosmetic surgeries. With the San Ysidro Medical Fast Pass lane, patients and companions cross back into the US in under 20 minutes.",
    heroImageGradient: "from-rose-900 via-stone-900 to-amber-950",
    companionFriendlyRating: 4,
    convalescenceScore: 4,
    valueRating: 5,
    vibe: "Quick Cross-Border",
    climate: {
      bestMonths: "Year-round Mediterranean climate (18°C-26°C with coastal breezes)",
      avgTempC: "19°C - 24°C",
      humidity: "Low",
      recoveryAdvice: "Mild Pacific coastal weather year-round makes recovery comfortable. Very low humidity prevents surgical dressing moisture build-up.",
    },
    visa: {
      visaType: "FMM Tourist Card (Instant entry at border) & Medical FastPass",
      processingDays: 1,
      feeUsd: 0,
      validity: "Up to 180 days",
      companionAttendantAllowed: true,
      companionAttendantQuota: 4,
      fastTrackAirportImmigration: true,
      requirementsSummary: "No visa required for US/Canadian/EU citizens. Hospital provides San Ysidro 'Fast Pass' medical lane voucher for rapid vehicle border crossing back to San Diego.",
    },
    practicalities: {
      airportName: "San Diego International (SAN) / Tijuana (TIJ)",
      airportCode: "SAN",
      transferMinutesToMedicalDistrict: 20,
      localCurrency: "Mexican Peso (MXN) & US Dollars (USD)",
      currencyCode: "USD / MXN",
      usdRateApprox: "US Dollars widely accepted everywhere",
      rideHailingApps: ["Uber", "DiDi", "Hospital Border Shuttle"],
      simCardAdvice: "US mobile plans (AT&T, Verizon, T-Mobile) include free roaming in Mexico.",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "911",
        ambulance: "066 / 911",
        touristPolice: "078",
      },
    },
    recoveryHotels: [
      {
        name: "Grand Hotel Tijuana Medical Recovery Tower",
        type: "Serviced Medical Apartment",
        pricePerNight: 90,
        distanceToHospital: "1.0 km (4 min hospital van)",
        amenities: ["Dedicated medical recovery floor", "Nursing station on floor", "Specialized bariatric/post-op menus", "Bilingual concierge", "Walk-in showers"],
      },
      {
        name: "Quartz Hotel & Spa Medical Convalescence",
        type: "5-Star Convalescent Resort",
        pricePerNight: 135,
        distanceToHospital: "0.2 km (connected via indoor skybridge)",
        amenities: ["Direct hospital skybridge connector", "Step-free wheelchair design", "Holistic wellness therapies", "Oxygenated rooms"],
      },
      {
        name: "Lucerna Hotel Tijuana Courtyard",
        type: "Boutique Recovery Suite",
        pricePerNight: 105,
        distanceToHospital: "1.5 km (5 min transfer)",
        amenities: ["Lush Mediterranean courtyard", "Quiet fountain garden", "Room service", "Spacious companion suites"],
      },
    ],
    gentleActivities: [
      {
        title: "Playas de Tijuana Oceanfront Boardwalk",
        type: "Scenic",
        description: "Paved seaside boardwalk overlooking Pacific waves with gentle ocean breezes, shaded benches, and sea turtle art.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "CECUT Tijuana Cultural Center & Botanical Garden",
        type: "Cultural",
        description: "Iconic spherical IMAX cultural campus with level terrazzo walkways, cactus gardens, and quiet indigenous art galleries.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Baja Culinary & Gentle Broth Tasting in Zona Río",
        type: "Dining",
        description: "Savor world-renowned Baja-Med mild culinary broths, fresh avocado, and herbal infusions in upscale Zona Río cafes.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "San Diego Airport Pickup & Fast Border Crossing",
        activity: "Hospital shuttle picks up companion and patient at San Diego Airport (SAN); smooth 25-minute drive across border to private medical center.",
        patientStatus: "Initial surgeon consultation, baseline lab panel",
        tip: "US phone plans work automatically in Tijuana with no roaming charges.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Relaxation in Zona Río",
        activity: "While patient undergoes procedure, stroll through peaceful Zona Río financial district; enjoy artisanal Mexican coffee and pastries.",
        patientStatus: "Procedure completed; monitored in PACU",
        tip: "Hospital provides private patient suites with companion sleeper couches and smart TVs.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "CECUT Cultural Walk & Desert Garden",
        activity: "Morning bedside visit; take a 5-minute Uber to CECUT Cultural Center to admire indigenous Baja art and desert botanical flora.",
        patientStatus: "Walking with nurse assistance; clear fluids begun",
        tip: "Uber Mexico works seamlessly on the same account as Uber US.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Pacific Boardwalk at Playas de Tijuana",
        activity: "Enjoy the morning ocean breeze along the Pacific boardwalk; grab fresh fruit with lime before returning for discharge meeting.",
        patientStatus: "Fluoroscopy leak test / incision check passed",
        tip: "Breathe the refreshing Pacific sea mist for calming relaxation.",
      },
      {
        day: 5,
        phase: "Discharge & Return / Recovery",
        title: "Transfer to Recovery Hotel or Fast Pass Return",
        activity: "Collect medical records and surgical certificates; check into Quartz Hotel medical recovery wing or use FastPass lane to return to San Diego.",
        patientStatus: "Discharged; post-op medication package received",
        tip: "The Medical Fast Pass lane saves 2 to 3 hours at the border crossing.",
      },
    ],
  },
  {
    id: "singapore",
    city: "Singapore",
    countryId: "SG",
    countryName: "Singapore",
    flag: "🇸🇬",
    tagline: "Gold-standard clinical precision with lush garden city healing and world-beating hygiene",
    overview:
      "Singapore is universally recognized for the highest clinical safety standards and sanitary excellence in global medicine. With climate-controlled indoor conservatories, barrier-free infrastructure everywhere, and top English-speaking surgical teams, it is the ultimate peace-of-mind destination.",
    heroImageGradient: "from-emerald-950 via-teal-950 to-slate-950",
    companionFriendlyRating: 5,
    convalescenceScore: 5,
    valueRating: 4,
    vibe: "Modern Luxury",
    climate: {
      bestMonths: "Year-round (consistent 27°C-31°C with gentle coastal air)",
      avgTempC: "27°C - 31°C",
      humidity: "Tropical",
      recoveryAdvice: "Stay in climate-controlled indoor skyways and conservatories. Singapore's world-leading air filtration makes it ideal for infection prevention.",
    },
    visa: {
      visaType: "Singapore SG Arrival Card & Hospital Medical Extension",
      processingDays: 5,
      feeUsd: 30,
      validity: "30 to 90 days with hospital endorsement",
      companionAttendantAllowed: true,
      companionAttendantQuota: 2,
      fastTrackAirportImmigration: true,
      requirementsSummary: "Electronic SG Arrival Card submitted within 3 days of arrival. Hospital International Patient Centre assists with ICA stay extensions.",
    },
    practicalities: {
      airportName: "Singapore Changi Airport",
      airportCode: "SIN",
      transferMinutesToMedicalDistrict: 25,
      localCurrency: "Singapore Dollar (SGD)",
      currencyCode: "SGD",
      usdRateApprox: "1 USD ≈ 1.35 SGD",
      rideHailingApps: ["Grab", "Gojek", "ComfortDelGro Taxi"],
      simCardAdvice: "Singtel or StarHub tourist SIM collected at Changi arrivals ($12 for 100 GB).",
      englishFluencyLevel: "Very High",
      emergencyPhone: {
        police: "999",
        ambulance: "995",
        touristPolice: "1800 255 0000",
      },
    },
    recoveryHotels: [
      {
        name: "Shangri-La Singapore Valley Wing Convalescence",
        type: "5-Star Convalescent Resort",
        pricePerNight: 260,
        distanceToHospital: "2.5 km (8 min car transfer)",
        amenities: ["15 acres of private botanical gardens", "Personal butler service", "In-room healthy dining", "Wheelchair accessible paths"],
      },
      {
        name: "Fraser Residence Orchard Medical Suites",
        type: "Serviced Medical Apartment",
        pricePerNight: 190,
        distanceToHospital: "1.2 km (5 min car or hospital shuttle)",
        amenities: ["Full modern kitchen", "Washer/dryer", "Grab bars in bathrooms", "Quiet residential enclave", "Direct elevator access"],
      },
      {
        name: "Novotel on Stevens Wellness Retreat",
        type: "Boutique Recovery Suite",
        pricePerNight: 155,
        distanceToHospital: "1.8 km (6 min transfer)",
        amenities: ["Lush garden campus", "Peaceful reflection pool", "Specialist convalescent meal menu", "Step-free accessibility"],
      },
    ],
    gentleActivities: [
      {
        title: "Gardens by the Bay Flower Dome & Cloud Forest",
        type: "Nature",
        description: "Enormous climate-controlled, air-conditioned indoor botanical domes with smooth, flat marble paths and zero sweat.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Early (Days 3-7)",
      },
      {
        title: "Singapore River Electric Catamaran Cruise",
        type: "Scenic",
        description: "Silent, zero-vibration electric boat through Clarke Quay, Marina Bay, and the historic civic district with shaded seating.",
        walkingLevel: "Minimal",
        wheelchairAccessible: true,
        idealRecoveryStage: "Mid (Days 8-12)",
      },
      {
        title: "National Gallery Singapore Air-Conditioned Art Promenade",
        type: "Cultural",
        description: "Transformed former Supreme Court and City Hall with wide elevators, step-free access, and rooftop views of Marina Bay.",
        walkingLevel: "Low",
        wheelchairAccessible: true,
        idealRecoveryStage: "Clearance Window (Days 13+)",
      },
    ],
    companionItinerary: [
      {
        day: 1,
        phase: "Arrival & Admission",
        title: "Jewel Changi Welcome & Hospital Suite Admission",
        activity: "Arrive at Changi; visit Jewel indoor waterfall; hospital concierge transfer to private medical suite; complete pre-op testing.",
        patientStatus: "Baseline diagnostics, anesthesia review, surgeon visit",
        tip: "Changi Airport has been voted world's best airport for seamless accessibility.",
      },
      {
        day: 2,
        phase: "Surgery Day",
        title: "Companion Serenity in Botanic Gardens",
        activity: "While patient undergoes surgery, explore the UNESCO Singapore Botanic Gardens and National Orchid Garden; unwind in shaded gazebos.",
        patientStatus: "Undergoing surgery & high-dependency unit monitoring",
        tip: "Hospital provides private VIP companion suites with work desk, Wi-Fi, and ensuite shower.",
      },
      {
        day: 3,
        phase: "Inpatient Recovery (Day 1)",
        title: "Marina Bay Sands Skyway & ArtScience Walk",
        activity: "Morning bedside check-in; afternoon visit to ArtScience Museum and gentle waterfront walk around Marina Bay.",
        patientStatus: "Pain control managed; initial physiotherapy initiated",
        tip: "English is the primary administrative language spoken by 100% of hospital staff.",
      },
      {
        day: 4,
        phase: "Inpatient Recovery (Day 2)",
        title: "Chinatown Heritage & Herbal Tea Tasting",
        activity: "Morning hospital visit; explore Chinatown Heritage Centre; sample traditional soothing bird's nest and herbal cooling tonics.",
        patientStatus: "Walking down hospital corridors; vital signs stable",
        tip: "Singapore tap water is 100% potable and meets highest WHO standards.",
      },
      {
        day: 5,
        phase: "Discharge & Convalescence",
        title: "Transfer to Valley Wing Convalescent Suite",
        activity: "Discharge instructions and fit-to-fly clearance window scheduled; transfer to Shangri-La Valley Wing suites.",
        patientStatus: "Discharged; post-op medication schedule in effect",
        tip: "The hotel's private 15-acre gardens offer shaded morning walks for gentle rehabilitation.",
      },
    ],
  },
];

export function getDestinationById(id: string): DestinationGuide | undefined {
  return DESTINATION_GUIDES.find((d) => d.id === id || d.countryId === id);
}

export function getDestinationByCountry(countryId: CountryId): DestinationGuide | undefined {
  return DESTINATION_GUIDES.find((d) => d.countryId === countryId);
}

export function calculateConvalescenceBudget(params: {
  destinationId: string;
  recoveryDays: number;
  companion: boolean;
  selectedHotelIndex?: number;
}) {
  const guide = getDestinationById(params.destinationId) || DESTINATION_GUIDES[0];
  const hotel = guide.recoveryHotels[params.selectedHotelIndex ?? 0] || guide.recoveryHotels[0];
  
  const hotelCost = hotel.pricePerNight * params.recoveryDays;
  const companionDailyFood = params.companion ? 45 * params.recoveryDays : 0;
  const patientPostOpMeals = 35 * params.recoveryDays;
  const airportConciergeTransfer = 60;
  const visaFees = guide.visa.feeUsd * (params.companion ? 2 : 1);
  const gentleActivitiesEstimate = 80;

  const total =
    hotelCost +
    companionDailyFood +
    patientPostOpMeals +
    airportConciergeTransfer +
    visaFees +
    gentleActivitiesEstimate;

  return {
    hotelCost,
    companionDailyFood,
    patientPostOpMeals,
    airportConciergeTransfer,
    visaFees,
    gentleActivitiesEstimate,
    total,
    currency: "USD",
  };
}
