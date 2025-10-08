export default function Lessons() {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Lessons (Demo)</h2>
      <p className="text-sm text-slate-600">
        Use the USSD emulator → <b>2. Daily Lessons</b> to preview personalized
        content pulled from <code>lesson_catalog</code>. Each delivery is logged in
        <code> lesson_history</code> so users don’t get repeats.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        This admin page will later support CRUD and import/export for the lesson
        catalog, plus viewing history and resend tools.
      </p>
    </div>
  );
}
