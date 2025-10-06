import express from "express"; import {get,run} from "../db.js"; const r=express.Router();
r.post("/register",(req,res)=>{const {msisdn,locale,region,business_type,topics=[],delivery_window,consent}=req.body||{};
const t=(topics||[]).join(","); const e=get("SELECT * FROM users WHERE msisdn=?",[msisdn]);
if(e){run(`UPDATE users SET locale=?,region=?,business_type=?,topics=?,delivery_window=?,consent=? WHERE msisdn=?`,
[locale,region,business_type,t,delivery_window,consent?1:0,msisdn]);} else {
run(`INSERT INTO users(msisdn,locale,region,business_type,topics,delivery_window,consent) VALUES (?,?,?,?,?,?,?)`,
[msisdn,locale,region,business_type,t,delivery_window,consent?1:0]);}
res.json({ok:true,user:get("SELECT * FROM users WHERE msisdn=?",[msisdn])});}); export default r;
