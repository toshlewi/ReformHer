from flask import Flask, request, jsonify
import os
from chatbot import search_kb, apply_safety, compress_160

app = Flask(__name__)

@app.post("/chat")
def chat():
    data = request.get_json(force=True, silent=True) or {}
    q = (data.get("question") or "").strip()
    if not q:
        return jsonify({"short": "Ask a question like: How to treat diarrhea?"})

    intent, ans = search_kb(q)
    safe = apply_safety(q, ans)
    short = compress_160(safe)
    return jsonify({"intent": intent, "short": short, "full": safe})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)
