"use client";

import { useState } from "react";
import { PageHead, Disclaimer } from "@/components/ui";
import MedicalDisclaimer from "@/components/MedicalDisclaimer";

interface ChatMessage {
  sender: "aria" | "patient";
  text: string;
  time: string;
  tag?: string;
  citations?: string[];
  isEmergency?: boolean;
}

const PRESET_QUERIES = [
  { label: "✈️ Flying Day 10 after Bypass?", text: "Why can't I fly home on Day 10 after coronary artery bypass surgery?" },
  { label: "🏥 Aravali Insurance Coverage", text: "Does Aravali Heart & Joint Institute accept international direct billing insurance?" },
  { label: "💊 Stopping Blood Thinners", text: "When should I stop taking blood thinners before surgery?" },
  { label: "💰 15% Outcome Escrow", text: "How does the 15% outcome escrow holdback protect me post-op?" },
  { label: "🛂 Medical Visa Delays", text: "What happens if my medical visa is delayed past my travel date?" },
];

const KNOWLEDGE_BASE: Record<string, string> = {
  thinners:
    "• Discontinue oral blood thinners (e.g. Warfarin, Apixaban) 5 to 7 days before surgery, strictly following your cardiologist's written instructions.\n• MedTour coordinates directly with your hospital team to arrange bridging low-molecular-weight heparin if clinically indicated.\n• Always keep original prescription bottles in your carry-on luggage.",
  visa:
    "• Medical Visa Support: Partner hospitals can provide invitation letters to support your visa application.\n• Flexible Scheduling: Coordinate with hospital admin if visa or travel delays affect your booking.\n• Coordinator Assistance: Your desk coordinator will contact the embassy medical attaché directly.",
  tracker:
    "• Real-Time Theatre Feed: Family members receive a private token link (no account registration needed).\n• Circulating Nurse Updates: Live status timestamps: Theatre Entry → Anaesthesia Induction → Procedure Underway → ICU / Recovery Transfer.\n• Direct Surgeon Briefing: A video briefing link is shared right after procedure completion.",
  doctor:
    "• Standardized Handover: Your treating surgeon generates an HL7/FHIR compliant electronic discharge summary.\n• Implant Records: Full 3D manufacturer lot numbers and sterile certifications are included.\n• Direct GP Sync: The summary is automatically dispatched to your home family doctor and saved in your encrypted Care Passport.",
};

export default function CoordinatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "aria",
      text: "Hello! I'm Aria, your 24/7 MedTour Care Coordinator powered by Google Gemini AI. I'm connected to your clinical travel file, treating hospital desks, and pre-op clearance protocols. How can I assist you or your family today?",
      time: "10:30 AM",
      tag: "Aria · Google Gemini AI",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activePlatform, setActivePlatform] = useState<"ios" | "android">("ios");
  const [phoneScreen, setPhoneScreen] = useState<"passport" | "vitals" | "sos">("passport");

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = {
      sender: "patient",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-4),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              sender: "aria",
              text: data.reply,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              tag: "Aria · Google Gemini RAG",
              citations: data.citations || [],
              isEmergency: data.isEmergency || false,
            },
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("AI chat API failed, falling back to local protocol engine:", err);
    }

    // Local deterministic fallback
    let reply = "I have noted that for your assigned human Care Coordinator (Dr. Rachel Vance, EMEA & Asia desk). Based on current clinical protocols, our 24/7 medical desk will confirm hospital instructions within 15 minutes.";
    const lower = text.toLowerCase();
    if (lower.includes("thinner") || lower.includes("medication") || lower.includes("aspirin")) {
      reply = KNOWLEDGE_BASE.thinners;
    } else if (lower.includes("visa") || lower.includes("embassy") || lower.includes("delay")) {
      reply = KNOWLEDGE_BASE.visa;
    } else if (lower.includes("family") || lower.includes("tracker") || lower.includes("companion")) {
      reply = KNOWLEDGE_BASE.tracker;
    } else if (lower.includes("doctor") || lower.includes("home") || lower.includes("gp") || lower.includes("record")) {
      reply = KNOWLEDGE_BASE.doctor;
    }

    setMessages((prev) => [
      ...prev,
      {
        sender: "aria",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tag: "Aria · Care Desk",
      },
    ]);
    setIsTyping(false);
  };

  return (
    <>
      <PageHead
        eyebrow="24/7 Care Coordination & Support"
        title="Human & AI Care Coordination Across Every Timezone"
      >
        A surgical journey across borders requires continuous care: from pre-travel medical clearance
        and visa coordination to live theatre tracking for family and post-return follow-ups.
      </PageHead>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <MedicalDisclaimer />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] items-start">
        {/* Left column: AI Care Coordinator & Family Tracker */}
        <div className="space-y-6">
          {/* Interactive Chat Console */}
          <div className="card p-5 sm:p-6 flex flex-col h-[560px]">
            <div className="flex items-center justify-between pb-3 border-b border-line flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h2 className="font-semibold text-sm">Aria · 24/7 Clinical Care Concierge</h2>
                  <p className="text-xs text-muted">Powered by Google Gemini 3.1 AI · Human surgical team on-call</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✨ Gemini 3.1 Live
                </span>
                <span className="text-xs bg-mint text-teal font-medium px-2.5 py-0.5 rounded-full">
                  Privacy-first
                </span>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "patient" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-muted">
                      {m.sender === "patient" ? "You" : m.tag}
                    </span>
                    <span className="text-[10px] text-muted">{m.time}</span>
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed whitespace-pre-line ${
                      m.sender === "patient"
                        ? "bg-teal text-white rounded-tr-none"
                        : "bg-sand/60 text-ink rounded-tl-none border border-line/60"
                    }`}
                  >
                    {m.text}

                    {/* Citations Grounding Badge */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-line/50 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] text-muted font-semibold uppercase tracking-wider">
                          📚 Sources:
                        </span>
                        {m.citations.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-white border border-line text-teal font-medium px-2 py-0.5 rounded-full shadow-xs"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Emergency Alert Card */}
                    {m.isEmergency && (
                      <div className="mt-3 p-3 rounded-xl bg-coral/10 border border-coral text-xs text-coral font-medium flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🚨</span>
                          <span>Immediate medical attention advised.</span>
                        </div>
                        <a
                          href="tel:+911126854100"
                          className="btn btn-primary !py-1 !px-3 text-xs bg-coral border-coral hover:bg-coral/90 shrink-0"
                        >
                          Call Emergency Desk
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex flex-col items-start animate-fade-in">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-muted">Aria · Google Gemini AI</span>
                    <span className="text-[10px] text-muted">Consulting clinical guidelines…</span>
                  </div>
                  <div className="bg-sand/60 text-ink rounded-2xl rounded-tl-none border border-line/60 p-3 flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-2 rounded-full bg-teal animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2 border-t border-line/60">
              <p className="text-[11px] text-muted mb-2 font-medium">Common patient questions (click to ask):</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRESET_QUERIES.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleSend(q.text)}
                    className="text-left text-[11px] bg-white border border-line hover:border-teal rounded-full px-2.5 py-1 text-muted hover:text-teal transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask Aria about travel safety, medications, surgeon notes…"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="field flex-1 !text-xs"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="btn btn-primary !py-2 !px-4 text-xs disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Live Family Companion Tracker Card */}
          <div className="card p-5 sm:p-6 bg-paper">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Real-Time Family Tracking</p>
                <h3 className="font-display text-xl mt-1">Live Surgical &amp; Recovery Feed</h3>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                LIVE UPDATES
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Family members access this live feed without an account via single-use encrypted token.
            </p>

            <div className="mt-5 space-y-4">
              {[
                {
                  status: "completed",
                  time: "07:30 AM",
                  title: "Inpatient Admission & Anaesthesia Clearance",
                  detail: "Patient prepped in Aravali Institute Suite 402. Vitals stable; pre-op dual check complete.",
                },
                {
                  status: "completed",
                  time: "09:00 AM",
                  title: "Transferred to Operating Suite 3",
                  detail: "Dr. Rajesh Sharma & surgical team initiated procedure. Circulating coordinator on intercom.",
                },
                {
                  status: "active",
                  time: "10:15 AM (Current)",
                  title: "Surgery Underway · Beating-Heart Bypass Complete",
                  detail: "Main distal anastomoses completed. Haemodynamics optimal. Estimated theatre exit in 45 min.",
                },
                {
                  status: "pending",
                  time: "Estimated 11:30 AM",
                  title: "Transfer to Cardiac Surgical ICU",
                  detail: "Surgeon will conduct a direct video briefing with nominated family contact immediately following transfer.",
                },
              ].map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`size-3 rounded-full mt-1 ${
                        step.status === "completed"
                          ? "bg-teal"
                          : step.status === "active"
                          ? "bg-coral animate-ping"
                          : "bg-line"
                      }`}
                    />
                    {idx < 3 && <span className="w-px h-10 bg-line mt-1" />}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-baseline justify-between">
                      <p className={`text-sm font-semibold ${step.status === "active" ? "text-coral font-bold" : ""}`}>
                        {step.title}
                      </p>
                      <span className="text-[11px] text-muted num">{step.time}</span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Multi-Platform Mobile Companion Simulator */}
        <div className="space-y-6">
          <div className="card p-5 sm:p-6 bg-gradient-to-b from-white to-sand/20">
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div>
                <p className="eyebrow">Multi-Platform Architecture</p>
                <h3 className="font-display text-xl">Mobile Patient Companion</h3>
              </div>
              <div className="flex rounded-full border border-line bg-white p-0.5 text-xs">
                <button
                  onClick={() => setActivePlatform("ios")}
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    activePlatform === "ios" ? "bg-teal text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  iOS
                </button>
                <button
                  onClick={() => setActivePlatform("android")}
                  className={`px-2.5 py-0.5 rounded-full font-medium ${
                    activePlatform === "android" ? "bg-teal text-white" : "text-muted hover:text-ink"
                  }`}
                >
                  Android
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted">
              Interactive simulation of the native MedTour patient app (Swift / Kotlin) engineered for
              offline availability during long-haul flights.
            </p>

            {/* Mobile Device Frame */}
            <div className="mt-5 mx-auto max-w-[310px] rounded-[36px] p-3.5 bg-ink text-white shadow-2xl border-4 border-slate-700">
              {/* Speaker & Camera notch */}
              <div className="flex justify-between items-center px-4 pt-1 pb-3 text-[10px] text-white/60">
                <span>9:41</span>
                <div className="w-20 h-4 bg-black rounded-full" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span className="size-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Inner phone screen */}
              <div className="bg-[#0f1f22] rounded-[26px] p-3.5 min-h-[460px] flex flex-col justify-between text-left text-white">
                {/* Screen Header Tabs */}
                <div>
                  <div className="flex justify-around border-b border-white/10 pb-2 mb-3 text-[11px]">
                    <button
                      onClick={() => setPhoneScreen("passport")}
                      className={`pb-1 font-semibold ${
                        phoneScreen === "passport" ? "text-mint border-b-2 border-mint" : "text-white/50"
                      }`}
                    >
                      Passport
                    </button>
                    <button
                      onClick={() => setPhoneScreen("vitals")}
                      className={`pb-1 font-semibold ${
                        phoneScreen === "vitals" ? "text-mint border-b-2 border-mint" : "text-white/50"
                      }`}
                    >
                      Vitals &amp; Meds
                    </button>
                    <button
                      onClick={() => setPhoneScreen("sos")}
                      className={`pb-1 font-semibold ${
                        phoneScreen === "sos" ? "text-coral border-b-2 border-coral" : "text-white/50"
                      }`}
                    >
                      SOS
                    </button>
                  </div>

                  {phoneScreen === "passport" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white/10 p-3 border border-white/15">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-mint font-bold">
                              Verified Digital Care Pass
                            </span>
                            <p className="text-sm font-semibold mt-0.5">Jane Doe · CABG Protocol</p>
                          </div>
                          <span className="text-[10px] bg-mint/20 text-mint px-1.5 py-0.5 rounded">
                            Day 4 Post-Op
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-white/70">
                          <div>
                            <p className="text-[9px] text-white/40">TREATING HOSPITAL</p>
                            <p className="font-medium text-white">Aravali Institute</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-white/40">FIT-TO-FLY GATE</p>
                            <p className="font-medium text-coral">Day 21 (Locked)</p>
                          </div>
                        </div>
                      </div>

                      {/* Mock QR Code */}
                      <div className="rounded-xl bg-white p-3 text-center text-ink">
                        <div className="size-28 mx-auto bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                          <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-white">
                            <span className="bg-black col-span-2 row-span-2" />
                            <span className="bg-black" />
                            <span className="bg-black" />
                            <span className="bg-black" />
                            <span className="bg-black col-span-2 row-span-2" />
                            <span className="bg-black" />
                          </div>
                        </div>
                        <p className="mt-2 text-[10px] font-mono text-muted">
                          TOKEN: 9f8a-cabg-aravali-verified
                        </p>
                        <p className="text-[9px] text-muted">
                          Scannable by airline gate staff &amp; emergency responders
                        </p>
                      </div>
                    </div>
                  )}

                  {phoneScreen === "vitals" && (
                    <div className="space-y-2.5">
                      <div className="rounded-xl bg-white/10 p-2.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-white/60">Morning Blood Pressure</span>
                          <span className="text-mint font-bold num">122 / 78 mmHg</span>
                        </div>
                        <div className="mt-1 flex justify-between text-[11px]">
                          <span className="text-white/60">Oxygen Saturation (SpO2)</span>
                          <span className="text-mint font-bold num">98%</span>
                        </div>
                      </div>

                      <div className="rounded-xl bg-white/10 p-2.5 text-xs">
                        <p className="text-[10px] text-mint font-semibold uppercase">Daily Prescriptions</p>
                        <div className="mt-1.5 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span>Aspirin 81mg (Antiplatelet)</span>
                            <span className="text-mint">✓ Taken</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Metoprolol 25mg (BP)</span>
                            <span className="text-coral">Due 8:00 PM</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Incentive Spirometry</span>
                            <span className="text-white/70">3 / 5 sets done</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-center text-[10px] text-white/70">
                        Daily log syncs to treating surgeon &amp; home GP.
                      </div>
                    </div>
                  )}

                  {phoneScreen === "sos" && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-coral/20 border border-coral/40 p-3 text-center">
                        <span className="text-coral text-lg font-bold">1-Touch Emergency Dispatch</span>
                        <p className="mt-1 text-[11px] text-white/80">
                          Connects immediately to local hospital rapid response &amp; English interpreter.
                        </p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-2.5 text-[11px] space-y-1">
                        <p className="text-[10px] text-white/40 uppercase">HOSPITAL EMERGENCY DESK</p>
                        <p className="font-semibold text-white">+91 11 2685 4100 (Ext. 99)</p>
                        <p className="text-[10px] text-muted">Aravali Heart Institute, New Delhi</p>
                      </div>

                      <div className="rounded-xl bg-white/10 p-2.5 text-[11px]">
                        <p className="text-[10px] text-white/40 uppercase">TAXI DRIVER EMERGENCY CARD</p>
                        <p className="font-bold text-mint text-xs mt-0.5">
                          कृपया मुझे अरावली हार्ट इंस्टीट्यूट के आपातकालीन विभाग ले जाएं
                        </p>
                        <p className="text-[9px] text-white/60 mt-0.5">
                          (Please take me to Aravali Heart Emergency Desk)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Phone Home Bar */}
                <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-2" />
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-4 text-xs text-muted">
              <span>✓ Offline encrypted storage</span>
              <span>✓ Wearable Bluetooth sync</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-12">
        <Disclaimer>
          MedTour 24/7 Care Coordination integrates human registered nurses with protocol-driven AI.
          Emergency escalation triggers hospital rapid response teams and international medical repatriation
          partners where medically required.
        </Disclaimer>
      </div>
    </>
  );
}
