/**
 * MedicalDisclaimer — a small inline banner that appears on all clinical pages.
 * Informational only; not a regulatory compliance statement.
 */
export default function MedicalDisclaimer() {
  return (
    <div className="rounded-xl border border-sand bg-terracottaSoft px-4 py-3 text-sm text-muted leading-snug">
      <span className="font-semibold text-terracotta">ℹ️ Informational only —</span>{" "}
      not medical advice. Costs and risk figures are estimates based on published partner pricing. Always consult a qualified
      healthcare professional before making treatment decisions.
    </div>
  );
}
