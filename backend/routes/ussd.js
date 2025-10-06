import express from "express"; import fetch from "node-fetch"; import {get,run} from "../db.js";
const r=express.Router(),trim=s=>(s||"").slice(0,160),con=t=>`CON ${trim(t)}`,end=t=>`END ${trim(t)}`;
const parse=t=>(t||"").split("*").filter(Boolean); const pick=(a,i)=>a[Math.max(0,Math.min(a.length-1,(i|0)-1))];
const LANGS=["en","sw","fr"],BIZ=["kiosk","tailoring","food","beauty","retail","services"],TIMES=["morning","afternoon","evening"];
function saveSess(id,state,p={}){const row=get("SELECT session_id FROM sessions WHERE session_id=?",[id]); const j=JSON.stringify(p);
row?run("UPDATE sessions SET state=?,payload_json=?,updated_at=CURRENT_TIMESTAMP WHERE session_id=?",[state,j,id]):run("INSERT INTO sessions(session_id,state,payload_json) VALUES (?,?,?)",[id,state,j]);}
function loadSess(id){const row=get("SELECT * FROM sessions WHERE session_id=?",[id]); return row?{state:row.state,payload:JSON.parse(row.payload_json||"{}")}:{state:"HOME",payload:{}};}
r.post("/ussd",async (req,res)=>{const {sessionId,phoneNumber,text}=req.body||{}; const inputs=parse(text); const {payload}=loadSess(sessionId);
if(inputs.length===0){saveSess(sessionId,"HOME"); return res.send(con("Welcome to Reform Her\n1 Register/Update\n2 Learn Now\n3 Quiz & Progress\n4 Ask ReformHer\n5 Certifications\n6 Business Help\n7 Agriculture (by Region)\n8 Helpline\n9 Settings")); }
const c=inputs[0];
if(c==="1"){ if(inputs.length===1){saveSess(sessionId,"REG_LANG"); return res.send(con("Choose language:\n1 EN 2 SW 3 FR")); }
 if(inputs.length===2){payload.locale=LANGS[(inputs[1]|0)-1]||"en"; saveSess(sessionId,"REG_TOPICS",payload); return res.send(con("Topics:\n1 Medical 2 Business 3 Agriculture 4 All")); }
 if(inputs.length===3){const t={1:"medical",2:"business",3:"agri",4:"all"}[inputs[2]]||"all"; payload.topics=t==="all"?["medical","business","agri"]:[t];
   saveSess(sessionId,"REG_REGION",payload); return res.send(con("Enter region/county (e.g., Nairobi)")); }
 if(inputs.length===4){payload.region=trim(inputs[3]); saveSess(sessionId,"REG_BTYPE",payload); return res.send(con("Business type:\n1 Kiosk 2 Tailoring 3 Food 4 Beauty 5 Retail 6 Services")); }
 if(inputs.length===5){payload.business_type=pick(BIZ,(inputs[4]|0)); saveSess(sessionId,"REG_TIME",payload); return res.send(con("Delivery time:\n1 Morning 2 Afternoon 3 Evening")); }
 if(inputs.length===6){payload.delivery_window=pick(TIMES,(inputs[5]|0)); saveSess(sessionId,"REG_CONSENT",payload); return res.send(con("Receive daily SMS lessons?\n1 Yes 2 No")); }
 if(inputs.length>=7){const yes=inputs[6]==="1";
   const t=(payload.topics||[]).join(","); const row=get("SELECT * FROM users WHERE msisdn=?",[phoneNumber]);
   if(row){run(`UPDATE users SET locale=?,region=?,business_type=?,topics=?,delivery_window=?,consent=? WHERE msisdn=?`,
     [payload.locale||"en",payload.region,payload.business_type,t,payload.delivery_window||"evening",yes?1:0,phoneNumber]);}
   else {run(`INSERT INTO users(msisdn,locale,region,business_type,topics,delivery_window,consent) VALUES (?,?,?,?,?,?,?)`,
     [phoneNumber,payload.locale||"en",payload.region,payload.business_type,t,payload.delivery_window||"evening",yes?1:0]);}
   saveSess(sessionId,"HOME",{}); return res.send(end("Registered. Expect daily SMS. Dial again to learn.")); }}
if(c==="2"){ const u=get("SELECT * FROM users WHERE msisdn=?",[phoneNumber])||{locale:"en",topics:"medical,business,agri"};
 const tips={medical:{en:"Boil drinking water to prevent diarrhea.",sw:"Chemsha maji ya kunywa kuzuia kuhara.",fr:"Faites bouillir l’eau à boire."},
             business:{en:"Separate business & personal money; note daily sales.",sw:"Tenganisha pesa za biashara na binafsi; andika mauzo.",fr:"Séparez argent d’entreprise et personnel; notez ventes."},
             agri:{en:"Rotate maize with legumes to improve soil.",sw:"Badilisha mahindi na kunde kuboresha udongo.",fr:"Alternez maïs et légumineuses."}};
 const topic=(u.topics||"medical").split(",")[0]; const msg=(tips[topic]||tips.medical)[u.locale||"en"]; return res.send(con(`${msg}\n1 Next  0 Home`)); }
if(c==="3"){ if(inputs.length===1){saveSess(sessionId,"QUIZ_Q1"); return res.send(con("Q1: Prevent diarrhea?\n1 Clean water 2 Skip meals 3 Milk")); }
 if(inputs.length===2){payload.q1=inputs[1]==="1"?1:0; saveSess(sessionId,"QUIZ_Q2",payload); return res.send(con("Q2: Why rotate crops?\n1 Colors 2 Reduce pests/soil 3 Nothing")); }
 if(inputs.length>=3){const score=(payload.q1||0)+(inputs[2]==="2"?1:0); run("INSERT INTO quiz_attempts(msisdn,topic,score) VALUES (?,?,?)",[phoneNumber,"mixed",score]);
   saveSess(sessionId,"HOME",{}); return res.send(end(`You scored ${score}/2. Great job!`)); }}
if(c==="4"){ if(inputs.length===1){saveSess(sessionId,"CHAT_WAIT"); return res.send(con("Ask your question:")); }
 const q=inputs.slice(1).join(" "); try{ const ai=process.env.AI_URL||"http://localhost:5001";
   const rr=await fetch(`${ai}/chat`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({question:q,locale:"en"})});
   const data=await rr.json(); const short=(data.short||"Try again.").slice(0,160); saveSess(sessionId,"HOME",{});
   return res.send(con(`${short}\n1 New Q  0 Home`)); }catch(e){ saveSess(sessionId,"HOME",{}); return res.send(end("AI not available. Try later.")); }}
if(c==="5"){ return res.send(con("Certification L1 ready. 1 Start  0 Home")); }
if(c==="6"){ if(inputs.length===1) return res.send(con("Pick type:\n1 Kiosk 2 Tailoring 3 Food 4 Beauty 5 Retail 6 Services"));
 const b=pick(["Kiosk","Tailoring","Food","Beauty","Retail","Services"],(inputs[1]|0)); return res.send(con(`${b}: Keep records, price=cost+profit, market daily.`)); }
if(c==="7"){ if(inputs.length===1) return res.send(con("Enter your region (e.g., Nairobi):")); const rg=inputs[1]; return res.send(con(`${rg}: Mulch soil & rotate crops. Scout pests weekly.`)); }
if(c==="8"){ if(inputs.length===1) return res.send(con("1 Call me back  2 Send hotline via SMS  0 Home"));
 if(inputs[1]==="1") return res.send(end("We will call you. For emergencies, visit nearest clinic."));
 if(inputs[1]==="2") return res.send(end("Hotline sent by SMS (stub).")); }
if(c==="9"){ return res.send(con("Settings (stub). 0 Home")); }
return res.send(con("Choose:\n1 Register/Update\n2 Learn Now\n3 Quiz & Progress\n4 Ask ReformHer\n5 Certifications\n6 Business Help\n7 Agriculture\n8 Helpline\n9 Settings"));
});
export default r;
