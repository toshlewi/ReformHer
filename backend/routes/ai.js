import express from "express"; import fetch from "node-fetch"; const r=express.Router();
r.post("/chat",async (req,res)=>{try{const u=process.env.AI_URL||"http://localhost:5001";
const rr=await fetch(`${u}/chat`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(req.body||{})});
res.json(await rr.json());}catch(e){res.status(500).json({error:"AI unreachable",detail:String(e)})}}); export default r;
