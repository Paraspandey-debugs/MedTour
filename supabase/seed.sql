-- =========================================================================
-- MedTour Supabase Database Schema & Seed Data
-- Group No. 19 · Medical Tourism Decision & Risk Engine
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Hospitals Table
CREATE TABLE IF NOT EXISTS public.hospitals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    accreditations TEXT[] NOT NULL DEFAULT '{}',
    price_idx NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    risk_idx NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    languages TEXT[] NOT NULL DEFAULT '{}',
    intl_patients INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.5,
    reviews INTEGER NOT NULL DEFAULT 0,
    tier TEXT NOT NULL DEFAULT 'Verified',
    steps_passed INTEGER NOT NULL DEFAULT 4,
    last_audit DATE NOT NULL DEFAULT CURRENT_DATE,
    blurb TEXT NOT NULL,
    hue INTEGER NOT NULL DEFAULT 172,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for hospitals
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to hospitals" ON public.hospitals FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update to hospitals" ON public.hospitals FOR ALL USING (auth.role() = 'authenticated');

-- 3. Doctors & Specialists Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    hospital_id TEXT REFERENCES public.hospitals(id) ON DELETE CASCADE,
    specialties TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 10,
    surgeries_performed INTEGER NOT NULL DEFAULT 1000,
    audited_complication_rate NUMERIC(5,4) NOT NULL DEFAULT 0.02,
    credentials TEXT[] NOT NULL DEFAULT '{}',
    education TEXT NOT NULL,
    languages TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC(3,2) NOT NULL DEFAULT 4.8,
    reviews_count INTEGER NOT NULL DEFAULT 100,
    available_days_notice INTEGER NOT NULL DEFAULT 7,
    bio TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for doctors
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update to doctors" ON public.doctors FOR ALL USING (auth.role() = 'authenticated');

-- 4. Treatments Table
CREATE TABLE IF NOT EXISTS public.treatments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    hospital_days INTEGER NOT NULL,
    local_recovery_days INTEGER NOT NULL,
    fit_to_fly_day INTEGER NOT NULL,
    fit_to_fly_why TEXT NOT NULL,
    base_complication NUMERIC(5,4) NOT NULL,
    revision_factor NUMERIC(4,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for treatments
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to treatments" ON public.treatments FOR SELECT USING (true);

-- 5. Patient Care Dossiers (Links Authenticated Users to Surgical Files)
CREATE TABLE IF NOT EXISTS public.care_dossiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    treatment_id TEXT REFERENCES public.treatments(id),
    hospital_id TEXT REFERENCES public.hospitals(id),
    doctor_id TEXT REFERENCES public.doctors(id),
    risk_multiplier NUMERIC(4,2) DEFAULT 1.0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.care_dossiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own care dossier" ON public.care_dossiers 
    FOR ALL USING (auth.uid() = user_id);

-- =========================================================================
-- SEED DATA: 12 Audited International Hospitals
-- =========================================================================

INSERT INTO public.hospitals (id, name, city, country, specialties, accreditations, price_idx, risk_idx, languages, intl_patients, rating, reviews, tier, steps_passed, last_audit, blurb, hue)
VALUES
('aravali', 'Aravali Heart & Joint Institute', 'New Delhi', 'IN', ARRAY['Cardiac', 'Orthopaedics', 'Spine'], ARRAY['JCI', 'NABH'], 1.05, 0.75, ARRAY['English', 'Hindi', 'Arabic'], 14000, 4.80, 2140, 'Platinum', 6, '2026-09-12', 'High-volume cardiac and joint centre with a dedicated international wing and in-house rehab.', 172),
('sahyadri', 'Sahyadri Multispeciality', 'Mumbai', 'IN', ARRAY['Orthopaedics', 'Bariatric', 'Dental'], ARRAY['NABH'], 0.90, 0.95, ARRAY['English', 'Hindi'], 5200, 4.50, 980, 'Gold', 5, '2026-07-03', 'Value-focused multispeciality hospital close to the airport, popular for bundled packages.', 28),
('kaveri', 'Kaveri Spine & Ortho Centre', 'Chennai', 'IN', ARRAY['Spine', 'Orthopaedics'], ARRAY['JCI', 'NABH'], 0.95, 0.80, ARRAY['English', 'Tamil', 'Bengali'], 7600, 4.70, 1320, 'Platinum', 6, '2026-10-01', 'Specialist spine unit with navigation-assisted surgery and a step-down recovery residence.', 205),
('chaophraya', 'Chao Phraya International', 'Bangkok', 'TH', ARRAY['Cardiac', 'Orthopaedics', 'Spine', 'Bariatric', 'Dental'], ARRAY['JCI'], 1.10, 0.80, ARRAY['English', 'Thai', 'Arabic', 'Japanese'], 31000, 4.80, 4410, 'Platinum', 6, '2026-08-20', 'One of the region''s largest international hospitals, with interpreters for 20+ languages.', 340),
('andaman', 'Andaman Wellness Hospital', 'Phuket', 'TH', ARRAY['Dental', 'Bariatric', 'Orthopaedics'], ARRAY['HA Thailand'], 0.90, 1.05, ARRAY['English', 'Thai', 'Russian'], 6100, 4.40, 760, 'Verified', 4, '2026-05-14', 'Resort-side recovery with a strong dental and bariatric programme.', 190),
('bosphorus', 'Bosphorus Medical Park', 'Istanbul', 'TR', ARRAY['Bariatric', 'Dental', 'Orthopaedics', 'Cardiac'], ARRAY['JCI'], 1.00, 0.90, ARRAY['English', 'Turkish', 'Arabic', 'German'], 18500, 4.60, 2890, 'Gold', 5, '2026-09-28', 'Large private campus a short transfer from the airport, with fixed all-inclusive packages.', 12),
('anatolia', 'Anatolia Smile & Surgery', 'Antalya', 'TR', ARRAY['Dental', 'Bariatric'], ARRAY['TEMOS'], 0.85, 1.15, ARRAY['English', 'Turkish', 'Russian'], 4300, 4.30, 640, 'Verified', 4, '2026-04-22', 'Boutique clinic group known for aggressive pricing on dental and sleeve packages.', 48),
('merlion', 'Merlion Specialist Centre', 'Singapore', 'SG', ARRAY['Cardiac', 'Spine', 'Orthopaedics'], ARRAY['JCI'], 1.10, 0.65, ARRAY['English', 'Mandarin', 'Malay', 'Bahasa'], 9800, 4.90, 1710, 'Platinum', 6, '2026-10-19', 'Premium tertiary centre with the lowest audited complication rates on the platform.', 258),
('penang', 'Penang Straits Hospital', 'George Town', 'MY', ARRAY['Cardiac', 'Orthopaedics', 'Dental'], ARRAY['JCI', 'MSQH'], 0.95, 0.85, ARRAY['English', 'Malay', 'Mandarin', 'Bahasa'], 11200, 4.60, 1540, 'Gold', 5, '2026-08-02', 'Well-regarded heart centre with transparent, itemised billing.', 150),
('alnoor', 'Al Noor Gulf Hospital', 'Dubai', 'AE', ARRAY['Orthopaedics', 'Cardiac', 'Bariatric'], ARRAY['JCI'], 1.00, 0.85, ARRAY['English', 'Arabic', 'Urdu', 'Hindi'], 8700, 4.60, 1180, 'Gold', 5, '2026-06-30', 'Hub-airport convenience for patients from Africa, South Asia and the Gulf.', 36),
('baja', 'Baja Pacific Surgical', 'Tijuana', 'MX', ARRAY['Bariatric', 'Dental'], ARRAY['CSG Mexico'], 0.90, 1.10, ARRAY['English', 'Spanish'], 6900, 4.40, 1020, 'Verified', 4, '2026-03-18', 'Cross-border bariatric and dental centre with shuttle transfers from San Diego.', 300),
('hanriver', 'Han River University Hospital', 'Seoul', 'KR', ARRAY['Spine', 'Cardiac', 'Orthopaedics'], ARRAY['JCI', 'KOIHA'], 1.00, 0.70, ARRAY['English', 'Korean', 'Mandarin', 'Russian'], 10400, 4.80, 1890, 'Platinum', 6, '2026-09-05', 'University teaching hospital with robotic spine and minimally-invasive cardiac programmes.', 222)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    specialties = EXCLUDED.specialties,
    tier = EXCLUDED.tier,
    rating = EXCLUDED.rating;

-- =========================================================================
-- SEED DATA: Verified Specialist Surgeons
-- =========================================================================

INSERT INTO public.doctors (id, name, title, hospital_id, specialties, experience_years, surgeries_performed, audited_complication_rate, credentials, education, languages, rating, reviews_count, available_days_notice, bio)
VALUES
('dr-sharma', 'Dr. Rajesh Sharma', 'Director of Cardiothoracic & Vascular Surgery', 'aravali', ARRAY['Cardiac'], 24, 8200, 0.021, ARRAY['MS (Gen Surg)', 'MCh (CTVS - AIIMS)', 'Fellow, Cleveland Clinic (USA)'], 'All India Institute of Medical Sciences (AIIMS) & Cleveland Clinic', ARRAY['English', 'Hindi'], 4.90, 640, 5, 'Pioneered off-pump beating-heart coronary artery bypass surgery in South Asia with an audited 98.4% success rate across international cohorts.'),
('dr-kapoor', 'Dr. Sunita Kapoor', 'Chief of Joint Reconstruction & Orthopaedics', 'aravali', ARRAY['Orthopaedics'], 19, 5400, 0.018, ARRAY['MS (Ortho)', 'FRCS (Glasgow)', 'Fellowship in Robotic Arthroplasty (UK)'], 'Maulana Azad Medical College & Royal College of Surgeons, Glasgow', ARRAY['English', 'Hindi', 'Punjabi'], 4.80, 480, 4, 'Specializes in computer-navigated and robotic total knee and hip replacements with same-day assisted mobilisation protocols.'),
('dr-natarajan', 'Dr. K. Natarajan', 'Senior Spine & Neurosurgeon', 'kaveri', ARRAY['Spine'], 22, 4900, 0.022, ARRAY['MCh (Neurosurgery)', 'Fellow, Spinal Surgery (Stanford)', 'AO Spine Faculty'], 'Madras Medical College & Stanford University Medical Center', ARRAY['English', 'Tamil', 'Hindi'], 4.80, 390, 6, 'Internationally renowned for endoscopic spinal decompression and minimally invasive multi-level lumbar fusion with intraoperative neuromonitoring.'),
('dr-prasert', 'Dr. Somchai Prasert', 'Chief of Orthopaedic Robotic Center', 'chaophraya', ARRAY['Orthopaedics'], 21, 6800, 0.016, ARRAY['MD (Mahidol)', 'Fellow, American Academy of Orthopaedic Surgeons (FAAOS)'], 'Siriraj Hospital, Mahidol University & Mayo Clinic', ARRAY['English', 'Thai', 'Japanese'], 4.90, 920, 7, 'Lead surgeon for over 1,200 foreign joint replacement patients annually, incorporating personalised kinematic alignment.'),
('dr-lim', 'Dr. Marcus Lim', 'Senior Consultant Cardiothoracic Surgeon', 'merlion', ARRAY['Cardiac'], 26, 7100, 0.012, ARRAY['MBBS (NUS)', 'FRCS (Edinburgh)', 'FAMS (Cardiothoracic)'], 'National University of Singapore & Royal Papworth Hospital, Cambridge', ARRAY['English', 'Mandarin', 'Malay'], 4.95, 510, 10, 'Maintains one of Asia''s lowest verified CABG complication rates (1.2%), specializing in total arterial revascularization and high-risk complex re-dos.'),
('dr-yilmaz', 'Dr. Mehmet Yilmaz', 'Head of Bariatric & Metabolic Surgery', 'bosphorus', ARRAY['Bariatric'], 18, 5100, 0.019, ARRAY['MD (Istanbul)', 'Fellow, IFSO (International Federation for Surgery of Obesity)'], 'Istanbul University Cerrahpasa Faculty of Medicine', ARRAY['English', 'Turkish', 'German', 'Arabic'], 4.70, 840, 3, 'Pioneered single-incision laparoscopic sleeve gastrectomy in Istanbul with structured 12-month post-op nutritional tele-guidance.'),
('dr-rodriguez', 'Dr. Carlos Rodriguez-Vera', 'Director of Advanced Bariatric Institute', 'baja', ARRAY['Bariatric'], 16, 4300, 0.024, ARRAY['MD (UNAM)', 'FACS (Fellow, American College of Surgeons)', 'ASMBS Member'], 'Universidad Nacional Autonoma de Mexico & UC San Diego Visiting Fellow', ARRAY['English', 'Spanish'], 4.60, 620, 4, 'Has performed over 4,000 bariatric procedures for US and Canadian patients with strict leak-test protocols and cross-border emergency transfer agreements.'),
('dr-park', 'Dr. Ji-Hoon Park', 'Professor & Chair of Minimally Invasive Spine Center', 'hanriver', ARRAY['Spine'], 23, 5800, 0.015, ARRAY['MD, PhD (Seoul National Univ)', 'Fellow, Johns Hopkins Spine Center'], 'Seoul National University College of Medicine & Johns Hopkins', ARRAY['English', 'Korean', 'Mandarin'], 4.90, 710, 8, 'Pioneered biportal endoscopic lumbar interbody fusion (BE-LIF) allowing patients to walk 4 hours post-operatively.'),
('dr-almansoori', 'Dr. Fatima Al-Mansoori', 'Consultant Orthopaedic & Sports Medicine Surgeon', 'alnoor', ARRAY['Orthopaedics'], 17, 3600, 0.020, ARRAY['MBChB (Edinburgh)', 'FRCS Tr&Orth (UK)', 'CCT (UK)'], 'University of Edinburgh & Royal National Orthopaedic Hospital, Stanmore', ARRAY['English', 'Arabic', 'French'], 4.80, 410, 5, 'Expert in patient-specific 3D printed knee guides and joint preservation surgery for international patients across EMEA.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    rating = EXCLUDED.rating;

-- =========================================================================
-- SEED DATA: Treatments
-- =========================================================================

INSERT INTO public.treatments (id, name, short_name, specialty, hospital_days, local_recovery_days, fit_to_fly_day, fit_to_fly_why, base_complication, revision_factor)
VALUES
('knee', 'Total Knee Replacement', 'Knee replacement', 'Orthopaedics', 4, 10, 14, 'Clot (DVT) risk is elevated after lower-limb surgery; long flights wait until the wound check and mobility milestone are passed.', 0.040, 0.90),
('hip', 'Total Hip Replacement', 'Hip replacement', 'Orthopaedics', 4, 10, 14, 'Dislocation and clot risk are highest in the first two weeks; seated long-haul travel waits for surgeon clearance.', 0.035, 1.00),
('cabg', 'Coronary Artery Bypass (CABG)', 'Heart bypass', 'Cardiac', 8, 14, 21, 'The sternum and lungs need time to recover; cabin pressure changes are avoided until a cardiology review confirms stability.', 0.070, 0.60),
('spine', 'Lumbar Spinal Fusion', 'Spinal fusion', 'Spine', 5, 12, 16, 'Prolonged sitting loads the fused segment; travel waits until pain is controlled and the wound is checked.', 0.060, 0.80),
('bariatric', 'Gastric Sleeve Surgery', 'Gastric sleeve', 'Bariatric', 3, 7, 10, 'Staple-line leaks typically present in the first week; flying waits until the leak window has passed and fluids are tolerated.', 0.045, 0.90),
('dental', 'Full-Arch Dental Implants', 'Dental implants', 'Dental', 0, 7, 3, 'Swelling and bleeding settle within a few days; sinus-lift cases wait longer because of cabin pressure.', 0.030, 0.50)
ON CONFLICT (id) DO NOTHING;
