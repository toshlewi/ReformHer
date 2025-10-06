# Simple retrieval + safety compression (no heavy deps)
from difflib import SequenceMatcher

KB = [
    # Health
    ("health", "how to treat diarrhea", 
     "Use clean water and ORS by small sips. Go to a clinic if blood, fever, or dehydration."),
    ("health", "safe drinking water", 
     "Boil water or use chlorine tabs. Use clean containers with lids."),
    # Business
    ("business", "keep records", 
     "Separate business and personal money; note daily sales and costs."),
    ("business", "pricing", 
     "Price = cost + fair profit. Review weekly and avoid underpricing."),
    # Agriculture
    ("agri", "rotate crops", 
     "Rotate maize with legumes to improve soil and reduce pests."),
    ("agri", "mulch", 
     "Mulch retains moisture, reduces weeds, and protects soil.")
]

RED_FLAGS = ["bleeding", "convulsion", "bloody stool", "high fever", "unconscious", "severe pain", "dehydration"]

def similarity(a, b):
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def search_kb(q):
    best = (0.0, None)
    for intent, question, answer in KB:
        score = similarity(q, question)
        if score > best[0]:
            best = (score, (intent, answer))
    return best[1] if best[1] else ("generic", "Please consult a clinician for urgent concerns.")

def apply_safety(q, text):
    if any(flag in q.lower() for flag in RED_FLAGS):
        return "Seek a clinician urgently. " + text
    return text

def compress_160(text):
    return text[:160]
