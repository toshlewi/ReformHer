from flask import Flask, request, jsonify
import os
from chatbot import search, safe, short160
app=Flask(__name__)
@app.post("/chat")
def chat():
    data=request.get_json(silent=True) or {}
    q=(data.get("question") or "").strip()
    if not q: return jsonify({"short":"Ask a question like: How to treat diarrhea?"})
    intent,ans=search(q)
    ans=safe(q,ans)
    return jsonify({"intent":intent,"short":short160(ans),"full":ans})
if __name__=="__main__":
    app.run(host="0.0.0.0",port=int(os.getenv("PORT",5001)),debug=True)
