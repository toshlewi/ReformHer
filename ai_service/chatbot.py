from difflib import SequenceMatcher
KB=[("health","how to treat diarrhea","Use clean water and ORS by small sips. Go to a clinic if blood, fever, or dehydration."),
    ("business","keep records","Separate business and personal money; note daily sales and costs."),
    ("agri","rotate crops","Rotate maize with legumes to improve soil and reduce pests.")]
RED_FLAGS=["bleeding","convulsion","bloody stool","high fever","unconscious","severe pain","dehydration"]
def sim(a,b): return SequenceMatcher(None,a.lower(),b.lower()).ratio()
def search(q): best=(0,("generic","Please consult a clinician for urgent concerns.")); 

def search(q):
    best=(0,("generic","Please consult a clinician for urgent concerns."))
    for intent,question,answer in KB:
        s=sim(q,question)
        if s>best[0]:
            best=(s,(intent,answer))
    return best[1]

def safe(q,text):
    return ("Seek a clinician urgently. "+text) if any(f in q.lower() for f in RED_FLAGS) else text

def short160(t): return t[:160]
