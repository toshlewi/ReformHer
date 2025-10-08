export default function Quizzes() {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Quizzes (Demo)</h2>
      <p className="text-sm text-slate-600">
        Use the USSD emulator → <b>3. Quizzes</b> to take short 2-question quizzes.
        Results are recorded in <code>quiz_attempts</code> and aggregated in the Analytics dashboard.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        This admin section will later include question management, localization (EN/SW/FR),
        and leaderboard features.
      </p>
    </div>
  );
}
