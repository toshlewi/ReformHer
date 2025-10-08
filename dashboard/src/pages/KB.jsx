export default function KB() {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="font-semibold mb-2">Chatbot Knowledge Base (Demo)</h2>
      <p className="text-sm text-slate-600">
        Ask questions via the USSD emulator → <b>9. Talk to AI</b>. The AI
        microservice returns a short answer (≤160 chars) for display, and longer
        responses can be sent via SMS if you wire that up.
      </p>
      <p className="text-xs text-slate-500 mt-2">
        Backend tables used: <code>ai_sessions</code> and <code>ai_messages</code> (for
        conversation history), plus <code>sms_outbox</code> if you choose to deliver longer
        replies over SMS.
      </p>
    </div>
  );
}
