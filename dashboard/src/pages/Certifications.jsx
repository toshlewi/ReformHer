export default function Certifications() {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Certifications</h2>
      <p className="text-sm text-slate-600">
        To test certifications in the emulator, dial <b>*500#</b> and choose <b>4. Certifications</b>.
        You’ll see your current quiz count and average score, and (if eligible) you can claim a badge.
        The full 5-question exam and badge issuance can be wired up later without changing this UI.
      </p>
    </div>
  );
}
