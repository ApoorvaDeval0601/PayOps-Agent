import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, AlertTriangle, CheckCircle, XCircle, Clock, Shield, RotateCcw, Zap, TrendingDown, Eye, Brain, Target, Play, Square, ChevronDown, ChevronUp } from "lucide-react";

// ══════════════════════════════════════════════════════════════════
// MODULE: SIMULATOR
// ══════════════════════════════════════════════════════════════════
const ISSUERS = ['Chase','Citi','BoA','Wells','Amex','Capital1','Discover','HSBC'];
const METHODS = ['credit_card','debit_card','digital_wallet','bank_transfer','buy_now_pay_later'];
const MERCHANTS = ['ShopFast','TravelPlus','FoodDelivery','GameStore','HealthHub','FashionX','AutoParts','ElectroMart'];
const ERROR_CODES = { ISSUER_DECLINE:'ERR_ISSUER_DECLINE', TIMEOUT:'ERR_TIMEOUT', INSUFFICIENT_FUNDS:'ERR_INSUFFICIENT_FUNDS', NETWORK_ERROR:'ERR_NETWORK_ERROR', RATE_LIMITED:'ERR_RATE_LIMITED', BANK_UNAVAILABLE:'ERR_BANK_UNAVAILABLE', RETRY_EXHAUSTED:'ERR_RETRY_EXHAUSTED', METHOD_UNSUPPORTED:'ERR_METHOD_UNSUPPORTED' };

let txIdCounter = 100000;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const clamp = (v,mn,mx) => Math.max(mn, Math.min(mx, v));

function createSimulator() {
  let scenarios = {
    issuer_degradation: { active:false, issuer:'Chase', failureRate:0.78, startedAt:null },
    retry_storm: { active:false, merchant:'ShopFast', retryMultiplier:8, startedAt:null },
    network_latency_spike: { active:false, spikeLatency:3400, affectedIssuers:['Citi','Wells'], startedAt:null },
    method_fatigue: { active:false, method:'digital_wallet', degradeCurve:0.14, startedAt:null },
    bank_outage: { active:false, bank:'HSBC', startedAt:null }
  };

  function generateTransaction() {
    const issuer = pick(ISSUERS), method = pick(METHODS), merchant = pick(MERCHANTS);
    const amount = parseFloat((Math.random()*450+10).toFixed(2));
    let latency = 120 + Math.floor(Math.random()*200), status='success', errorCode=null, retryCount=0;

    if(scenarios.issuer_degradation.active && issuer===scenarios.issuer_degradation.issuer && Math.random()<scenarios.issuer_degradation.failureRate){
      status='failed'; errorCode = Math.random()<0.6?ERROR_CODES.ISSUER_DECLINE:ERROR_CODES.TIMEOUT; latency+=Math.floor(Math.random()*800);
    }
    if(scenarios.bank_outage.active && issuer===scenarios.bank_outage.bank){
      status='failed'; errorCode=ERROR_CODES.BANK_UNAVAILABLE; latency=5000+Math.floor(Math.random()*2000);
    }
    if(scenarios.network_latency_spike.active && scenarios.network_latency_spike.affectedIssuers.includes(issuer)){
      latency = scenarios.network_latency_spike.spikeLatency+Math.floor(Math.random()*800);
      if(latency>4500 && Math.random()<0.4){ status='failed'; errorCode=ERROR_CODES.TIMEOUT; }
    }
    if(scenarios.method_fatigue.active && method===scenarios.method_fatigue.method){
      const elapsed=(Date.now()-(scenarios.method_fatigue.startedAt||Date.now()))/60000;
      if(Math.random()<clamp(scenarios.method_fatigue.degradeCurve*elapsed,0,0.82)){ status='failed'; errorCode=ERROR_CODES.METHOD_UNSUPPORTED; }
    }
    if(scenarios.retry_storm.active && merchant===scenarios.retry_storm.merchant && status==='failed'){
      retryCount=Math.floor(Math.random()*scenarios.retry_storm.retryMultiplier);
      if(retryCount>=5) errorCode=ERROR_CODES.RATE_LIMITED;
    }
    if(status==='success' && Math.random()<0.04){
      status='failed'; errorCode=pick([ERROR_CODES.INSUFFICIENT_FUNDS,ERROR_CODES.NETWORK_ERROR]);
      if(errorCode===ERROR_CODES.NETWORK_ERROR) latency+=Math.floor(Math.random()*500);
    }
    return { id:`TXN-${++txIdCounter}`, timestamp:Date.now(), issuer, method, merchant, amount, status, errorCode, latency, retryCount, region:pick(['US-East','US-West','EU','APAC']) };
  }

  return {
    generateBatch(n=40){ return Array.from({length:n},()=>generateTransaction()); },
    activateScenario(name){ if(scenarios[name]){ scenarios[name].active=true; scenarios[name].startedAt=Date.now(); return true; } return false; },
    deactivateScenario(name){ if(scenarios[name]){ scenarios[name].active=false; scenarios[name].startedAt=null; return true; } return false; },
    getScenarios(){ return scenarios; },
    isActive(name){ return scenarios[name]?.active; }
  };
}

// ══════════════════════════════════════════════════════════════════
// MODULE: MEMORY
// ══════════════════════════════════════════════════════════════════
function createMemory() {
  let txBuffer=[], patternLog=[], actionLog=[], outcomeLog=[];
  let issuerProfiles={}, methodProfiles={};
  let suppressions={ issuers:new Map(), methods:new Map() };

  function updateProfiles(t){
    if(!issuerProfiles[t.issuer]) issuerProfiles[t.issuer]={total:0,successes:0,failures:0,totalLat:0,errors:{}};
    const p=issuerProfiles[t.issuer]; p.total++; p.totalLat+=t.latency;
    if(t.status==='success') p.successes++; else { p.failures++; if(t.errorCode) p.errors[t.errorCode]=(p.errors[t.errorCode]||0)+1; }
    if(!methodProfiles[t.method]) methodProfiles[t.method]={total:0,successes:0,failures:0,totalLat:0,errors:{}};
    const m=methodProfiles[t.method]; m.total++; m.totalLat+=t.latency;
    if(t.status==='success') m.successes++; else { m.failures++; if(t.errorCode) m.errors[t.errorCode]=(m.errors[t.errorCode]||0)+1; }
  }

  return {
    addTransactions(txns){ txns.forEach(t=>{ txBuffer.push(t); updateProfiles(t); }); if(txBuffer.length>600) txBuffer.splice(0,txBuffer.length-600); },
    getBuffer(){ return txBuffer; },
    getRecent(ms=60000){ const c=Date.now()-ms; return txBuffer.filter(t=>t.timestamp>=c); },
    addPattern(p){ patternLog.push({...p,detectedAt:Date.now()}); if(patternLog.length>200) patternLog.shift(); },
    getPatterns(n=10){ return patternLog.slice(-n); },
    addAction(a){ actionLog.push({...a,executedAt:a.executedAt||Date.now()}); if(actionLog.length>100) actionLog.shift(); },
    getActions(n=15){ return actionLog.slice(-n); },
    getActiveActions(){ return actionLog.filter(a=>a.status==='active'); },
    addOutcome(o){ outcomeLog.push({...o,evaluatedAt:Date.now()}); },
    getOutcomes(n=5){ return outcomeLog.slice(-n); },
    suppressIssuer(issuer,reason,dur=300000){ suppressions.issuers.set(issuer,{reason,suppressedAt:Date.now(),expiresAt:Date.now()+dur}); },
    suppressMethod(method,reason,dur=300000){ suppressions.methods.set(method,{reason,suppressedAt:Date.now(),expiresAt:Date.now()+dur}); },
    unsuppressIssuer(i){ suppressions.issuers.delete(i); },
    unsuppressMethod(m){ suppressions.methods.delete(m); },
    isIssuerSuppressed(i){ const s=suppressions.issuers.get(i); if(!s) return false; if(Date.now()>s.expiresAt){ suppressions.issuers.delete(i); return false; } return true; },
    isMethodSuppressed(m){ const s=suppressions.methods.get(m); if(!s) return false; if(Date.now()>s.expiresAt){ suppressions.methods.delete(m); return false; } return true; },
    getSuppressions(){ const now=Date.now(); for(const[k,v] of suppressions.issuers) if(now>v.expiresAt) suppressions.issuers.delete(k); for(const[k,v] of suppressions.methods) if(now>v.expiresAt) suppressions.methods.delete(k); return {issuers:Object.fromEntries(suppressions.issuers),methods:Object.fromEntries(suppressions.methods)}; },
    getSummary(){
      const r=this.getRecent(60000), tot=r.length, suc=r.filter(t=>t.status==='success').length;
      const errFreq={};
      r.filter(t=>t.errorCode).forEach(t=>{ errFreq[t.errorCode]=(errFreq[t.errorCode]||0)+1; });
      const byIssuer={};
      r.forEach(t=>{ if(!byIssuer[t.issuer]) byIssuer[t.issuer]={total:0,failed:0,lat:0}; byIssuer[t.issuer].total++; byIssuer[t.issuer].lat+=t.latency; if(t.status==='failed') byIssuer[t.issuer].failed++; });
      Object.values(byIssuer).forEach(s=>{ s.avgLat=(s.lat/s.total).toFixed(0); s.failRate=(s.failed/s.total*100).toFixed(1)+'%'; });
      const byMethod={};
      r.forEach(t=>{ if(!byMethod[t.method]) byMethod[t.method]={total:0,failed:0}; byMethod[t.method].total++; if(t.status==='failed') byMethod[t.method].failed++; });
      Object.values(byMethod).forEach(s=>{ s.failRate=(s.failed/s.total*100).toFixed(1)+'%'; });
      return { window:'60s', total:tot, successRate:tot>0?(suc/tot*100).toFixed(1)+'%':'N/A', failureRate:tot>0?((tot-suc)/tot*100).toFixed(1)+'%':'N/A', avgLatency:tot>0?(r.reduce((s,t)=>s+t.latency,0)/tot).toFixed(0)+'ms':'0ms', errorFreq:errFreq, byIssuer, byMethod, suppressions:this.getSuppressions(), recentPatterns:this.getPatterns(5), recentActions:this.getActions(3), recentOutcomes:this.getOutcomes(3) };
    }
  };
}

// ══════════════════════════════════════════════════════════════════
// MODULE: PATTERN DETECTOR
// ══════════════════════════════════════════════════════════════════
function detectPatterns(txns) {
  const patterns=[], cutoff=Date.now()-60000, recent=txns.filter(t=>t.timestamp>=cutoff);
  if(recent.length<8) return patterns;
  const byIssuer={}, byMethod={}, byMerchant={};
  recent.forEach(t=>{
    (byIssuer[t.issuer]=byIssuer[t.issuer]||[]).push(t);
    (byMethod[t.method]=byMethod[t.method]||[]).push(t);
    (byMerchant[t.merchant]=byMerchant[t.merchant]||[]).push(t);
  });
  const issuerFailRates={};
  for(const[issuer,txs] of Object.entries(byIssuer)){
    if(txs.length<6) continue;
    const fr=txs.filter(t=>t.status==='failed').length/txs.length;
    issuerFailRates[issuer]=fr;
    if(fr>0.35){
      const errs={};
      txs.filter(t=>t.errorCode).forEach(t=>{ errs[t.errorCode]=(errs[t.errorCode]||0)+1; });
      const dom=Object.entries(errs).sort((a,b)=>b[1]-a[1])[0];
      patterns.push({ type:'ISSUER_DEGRADATION', severity:fr>0.6?'critical':'high', issuer, failureRate:(fr*100).toFixed(1)+'%', sampleSize:txs.length, dominantError:dom?{code:dom[0],count:dom[1]}:null, avgLatency:(txs.reduce((s,t)=>s+t.latency,0)/txs.length).toFixed(0)+'ms', hypothesis:`Issuer ${issuer} degraded at ${(fr*100).toFixed(1)}%. Dominant error: ${dom?dom[0]:'mixed'}. Likely issuer-side throttling or outage.` });
    }
  }
  for(const[issuer,txs] of Object.entries(byIssuer)){
    if(txs.length<6) continue;
    const avg=txs.reduce((s,t)=>s+t.latency,0)/txs.length;
    if(avg>2000) patterns.push({ type:'LATENCY_SPIKE', severity:avg>4000?'critical':'high', issuer, avgLatency:avg.toFixed(0)+'ms', sampleSize:txs.length, timeouts:txs.filter(t=>t.errorCode==='ERR_TIMEOUT').length, hypothesis:`Issuer ${issuer} latency at ${avg.toFixed(0)}ms. Possible network congestion. Timeouts: ${txs.filter(t=>t.errorCode==='ERR_TIMEOUT').length}.` });
  }
  for(const[merchant,txs] of Object.entries(byMerchant)){
    if(txs.length<8) continue;
    const totalRetries=txs.reduce((s,t)=>s+t.retryCount,0), avgR=totalRetries/txs.length, rl=txs.filter(t=>t.errorCode==='ERR_RATE_LIMITED').length;
    if(avgR>4||rl>=3) patterns.push({ type:'RETRY_STORM', severity:rl>=5?'critical':'high', merchant, avgRetries:avgR.toFixed(1), rateLimited:rl, sampleSize:txs.length, hypothesis:`Merchant ${merchant} generating retry storm (avg ${avgR.toFixed(1)} retries). Rate limits hit: ${rl}. Aggressive retry config suspected.` });
  }
  for(const[method,txs] of Object.entries(byMethod)){
    if(txs.length<8) continue;
    const fr=txs.filter(t=>t.status==='failed').length/txs.length;
    if(fr>0.30){
      const errs={};
      txs.filter(t=>t.errorCode).forEach(t=>{ errs[t.errorCode]=(errs[t.errorCode]||0)+1; });
      patterns.push({ type:'METHOD_FATIGUE', severity:fr>0.5?'critical':'high', method, failureRate:(fr*100).toFixed(1)+'%', sampleSize:txs.length, errorBreakdown:errs, hypothesis:`Payment method '${method}' degraded at ${(fr*100).toFixed(1)}%. Provider-side issues likely. Reroute to alternatives recommended.` });
    }
  }
  const failing=Object.entries(issuerFailRates).filter(([_,r])=>r>0.2).map(([i])=>i);
  const totalActive=Object.keys(byIssuer).filter(i=>byIssuer[i].length>=6).length;
  if(totalActive>=3 && failing.length/totalActive>0.25) patterns.push({ type:'CORRELATED_FAILURE', severity:'critical', affectedIssuers:failing, coverage:(failing.length/totalActive*100).toFixed(1)+'%', hypothesis:`Correlated failure across ${failing.join(', ')}. Shared infrastructure issue likely. Escalation recommended.` });
  return patterns;
}

// ══════════════════════════════════════════════════════════════════
// MODULE: GUARDRAILS
// ══════════════════════════════════════════════════════════════════
function evaluateAction(action, memory) {
  const supps=memory.getSuppressions();
  switch(action.type){
    case 'suppress_issuer': {
      if(Object.keys(supps.issuers).length>=2) return {allowed:false, tier:'BLOCKED', reason:'Max 2 simultaneous issuer suppressions reached.'};
      if(memory.isIssuerSuppressed(action.issuer)) return {allowed:false, tier:'BLOCKED', reason:`${action.issuer} already suppressed.`};
      const dur=clamp(action.duration||300000,30000,600000);
      action.duration=dur;
      const recent=memory.getRecent(60000);
      const vol=recent.filter(t=>t.issuer===action.issuer).length;
      if(vol>100) return {allowed:true, tier:'HUMAN_GATE', reason:`High-volume issuer (${vol} txns). Requires approval.`};
      return {allowed:true, tier:'GUARDED', reason:'Suppression approved with auto-rollback monitoring.'};
    }
    case 'suppress_method': {
      if(Object.keys(supps.methods).length>=1) return {allowed:false, tier:'BLOCKED', reason:'Max 1 simultaneous method suppression reached.'};
      action.duration=clamp(action.duration||300000,30000,600000);
      return {allowed:true, tier:'GUARDED', reason:'Method suppression approved (guarded).'};
    }
    case 'adjust_retry': {
      const prop=clamp(action.proposedRetryCount||2,1,5);
      action.proposedRetryCount=prop;
      const curr=action.currentRetryCount||5;
      if(curr>0 && (curr-prop)/curr>0.5) return {allowed:false, tier:'BLOCKED', reason:'Retry reduction >50% not allowed in single step.'};
      return {allowed:true, tier:'AUTONOMOUS', reason:'Retry adjustment within bounds.'};
    }
    case 'reroute_traffic': return {allowed:true, tier:'GUARDED', reason:'Traffic reroute approved (guarded, incremental).'};
    case 'alert_ops': return {allowed:true, tier:'AUTONOMOUS', reason:'Alerting always permitted.'};
    default: return {allowed:false, tier:'BLOCKED', reason:`Unknown action: ${action.type}`};
  }
}

// ══════════════════════════════════════════════════════════════════
// MODULE: EXECUTOR
// ══════════════════════════════════════════════════════════════════
let actIdCounter=1000;
function executeAction(action, memory) {
  const id=`ACT-${++actIdCounter}`, now=Date.now();
  switch(action.type){
    case 'suppress_issuer':
      memory.suppressIssuer(action.issuer, action.reason, action.duration);
      return { actionId:id, type:'suppress_issuer', status:'active', executedAt:now, tier:action._tier, details:{ issuer:action.issuer, reason:action.reason, duration:action.duration+'ms', expiresAt:new Date(now+action.duration).toISOString(), message:`Suppressed "${action.issuer}" for ${action.duration/1000}s` }};
    case 'suppress_method':
      memory.suppressMethod(action.method, action.reason, action.duration);
      return { actionId:id, type:'suppress_method', status:'active', executedAt:now, tier:action._tier, details:{ method:action.method, reason:action.reason, duration:action.duration+'ms', message:`Suppressed method "${action.method}" for ${action.duration/1000}s` }};
    case 'adjust_retry':
      return { actionId:id, type:'adjust_retry', status:'active', executedAt:now, tier:action._tier, details:{ target:action.merchant||action.issuer||'Global', prev:action.currentRetryCount, next:action.proposedRetryCount, message:`Retries: ${action.currentRetryCount}→${action.proposedRetryCount} (${action.merchant||action.issuer||'Global'})` }};
    case 'reroute_traffic':
      return { actionId:id, type:'reroute_traffic', status:'active', executedAt:now, tier:action._tier, details:{ from:action.fromIssuer, to:action.toIssuers, pct:action.percentage+'%', message:`Reroute ${action.percentage}% from "${action.fromIssuer}"` }};
    case 'alert_ops':
      return { actionId:id, type:'alert_ops', status:'sent', executedAt:now, tier:action._tier, details:{ severity:action.severity, title:action.title, body:action.body, message:`[${action.severity?.toUpperCase()}] ${action.title}` }};
    case 'rollback':
      if(action.originalAction?.issuer) memory.unsuppressIssuer(action.originalAction.issuer);
      if(action.originalAction?.method) memory.unsuppressMethod(action.originalAction.method);
      return { actionId:id, type:'rollback', status:'executed', executedAt:now, tier:'AUTONOMOUS', details:{ originalActionId:action.originalActionId, reason:action.reason, message:`ROLLBACK: ${action.originalActionId} — ${action.reason}` }};
    default:
      return { actionId:id, type:action.type, status:'failed', executedAt:now, details:{ error:'Unknown action' }};
  }
}

// ══════════════════════════════════════════════════════════════════
// MODULE: AGENT LOOP
// ══════════════════════════════════════════════════════════════════
const SYSTEM_PROMPT = `You are PayOps-Agent, an AI payment operations manager. Analyze payment metrics, detected patterns, and previous action outcomes. Make informed intervention decisions.

AVAILABLE ACTIONS:
- suppress_issuer: { type:"suppress_issuer", issuer:"<name>", duration:<ms 30000-600000>, reason:"<string>" }
- suppress_method: { type:"suppress_method", method:"<name>", duration:<ms>, reason:"<string>" }
- adjust_retry: { type:"adjust_retry", merchant:"<name>", issuer:"<name>", currentRetryCount:<n>, proposedRetryCount:<n 1-5>, rationale:"<string>" }
- reroute_traffic: { type:"reroute_traffic", fromIssuer:"<name>", toIssuers:["<names>"], percentage:<n> }
- alert_ops: { type:"alert_ops", severity:"low|medium|high|critical", title:"<string>", body:"<string>" }

GUARDRAIL CONSTRAINTS:
- Max 2 simultaneous issuer suppressions
- Max 1 simultaneous method suppression
- Suppression duration: 30000ms–600000ms
- Retry count range: 1–5
- Single-step retry reduction max 50%

DECISION RULES:
- Only act when pattern confidence is HIGH (strong statistical signal)
- If ambiguous → alert_ops only, do NOT suppress
- Consider load balancing: suppressing one issuer increases load on others
- If previous similar action had NEGATIVE outcome, do NOT repeat it
- Prefer targeted interventions over broad actions
- Always include alert_ops alongside suppression actions for traceability

Respond with ONLY a valid JSON object:
{
  "reasoning": "<step-by-step analysis of current state>",
  "confidence": <0.0-1.0>,
  "detectedIssues": ["<issue1>"],
  "recommendedActions": [<action objects>],
  "monitoringNotes": "<what to watch next cycle>",
  "learningInsight": "<lesson from previous outcomes>"
}`;

// ══════════════════════════════════════════════════════════════════
// AI PROVIDER INTEGRATION (SUPPORTS MULTIPLE FREE APIS)
// ══════════════════════════════════════════════════════════════════

async function callAI(context) {
  const provider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'groq'; // groq, gemini, huggingface, openrouter
  const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY;
  
  if (!apiKey) {
    throw new Error('AI_API_KEY not configured');
  }

  const prompt = `${SYSTEM_PROMPT}

CONTEXT:
${JSON.stringify(context, null, 2)}

Respond with ONLY valid JSON matching the schema.`;

  let response;
  
  switch(provider) {
    case 'groq':
      // Groq - FREE tier: 30 req/min, llama-3.3-70b
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      break;
      
    case 'gemini':
      // Google Gemini - FREE tier: 60 req/min
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
        })
      });
      break;
      
    case 'huggingface':
      // Hugging Face - FREE tier available
      response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 1000, temperature: 0.3 }
        })
      });
      break;
      
    case 'openrouter':
      // OpenRouter - Access to free models
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.2-3b-instruct:free', // Free model
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1000
        })
      });
      break;
      
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  let text;
  
  // Parse response based on provider
  switch(provider) {
    case 'groq':
    case 'openrouter':
      text = data.choices?.[0]?.message?.content || '{}';
      break;
    case 'gemini':
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      break;
    case 'huggingface':
      text = data[0]?.generated_text || data.generated_text || '{}';
      break;
    default:
      text = '{}';
  }
  
  // Clean and parse JSON response
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

async function runAgentCycle(memory) {
  const txns = memory.getBuffer();
  const summary = memory.getSummary();
  const patterns = detectPatterns(txns);
  patterns.forEach(p => memory.addPattern(p));

  const context = { currentMetrics: summary, detectedPatterns: patterns, previousOutcomes: memory.getOutcomes(5), activeSuppressions: memory.getSuppressions() };

  let llmResponse;
  try {
    llmResponse = await callAI(context);
  } catch(e) {
    llmResponse = { reasoning:`LLM call error: ${e.message}. Falling back to pattern-driven alerts only.`, confidence:0.3, detectedIssues: patterns.filter(p=>p.severity==='critical').map(p=>p.hypothesis), recommendedActions: patterns.filter(p=>p.severity==='critical').map(p=>({type:'alert_ops',severity:'high',title:`[Fallback] ${p.type}`,body:p.hypothesis})), monitoringNotes:'Operating in alert-only fallback mode until LLM recovers.', learningInsight:'N/A — fallback mode' };
  }

  // Guardrail evaluation and execution
  const approved=[], blocked=[], humanGate=[], executed=[];
  for(const action of (llmResponse.recommendedActions||[])){
    const eval_ = evaluateAction(action, memory);
    action._tier = eval_.tier;
    if(!eval_.allowed){ blocked.push({action,eval_}); continue; }
    if(eval_.tier==='HUMAN_GATE'){ humanGate.push({action,eval_}); memory.addAction({actionId:`PENDING-${Date.now()}`,type:action.type,status:'pending_approval',executedAt:Date.now(),tier:'HUMAN_GATE',details:{...action,message:`⏳ Pending approval: ${eval_.reason}`}}); continue; }
    approved.push({action,eval_});
    const result = executeAction(action, memory);
    executed.push(result);
    memory.addAction(result);
  }

  // Learning loop: evaluate past active actions
  const pastActions = memory.getActions(8);
  for(const pa of pastActions){
    if(pa.status!=='active' || pa._evaluated) continue;
    if(Date.now()-pa.executedAt<35000) continue;
    const r=memory.getRecent(60000), tot=r.length;
    const sr=tot>0?(r.filter(t=>t.status==='success').length/tot*100):100;
    const al=tot>0?(r.reduce((s,t)=>s+t.latency,0)/tot):0;
    const outcome = { actionId:pa.actionId, actionType:pa.type, successRateAfter:sr, avgLatencyAfter:al, assessment:sr<88?'negative':al>1800?'negative':'positive' };
    memory.addOutcome(outcome);
    pa._evaluated=true;
    if(outcome.assessment==='negative' && pa.type!=='alert_ops' && pa.type!=='rollback'){
      const rb = { type:'rollback', originalActionId:pa.actionId, originalAction:pa.details||{}, reason:`Negative outcome detected (SR=${sr.toFixed(1)}%, Lat=${al.toFixed(0)}ms)` };
      const rbResult = executeAction(rb, memory);
      memory.addAction(rbResult);
      executed.push(rbResult);
    }
  }

  return { cycleId:`CYCLE-${Date.now()}`, llmReasoning:llmResponse.reasoning, confidence:llmResponse.confidence, detectedIssues:llmResponse.detectedIssues, monitoringNotes:llmResponse.monitoringNotes, learningInsight:llmResponse.learningInsight, patterns, approved, blocked, humanGate, executed };
}

// ══════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════
export default function PayOpsAgentDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState({ successRate:96.2, failureRate:3.8, avgLatency:245, totalTxns:0 });
  const [issuerHealth, setIssuerHealth] = useState({});
  const [methodHealth, setMethodHealth] = useState({});
  const [agentLog, setAgentLog] = useState([]);
  const [actionLog, setActionLog] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [suppressions, setSuppressions] = useState({issuers:{},methods:{}});
  const [activeScenarios, setActiveScenarios] = useState({});
  const [expandedReasoning, setExpandedReasoning] = useState(null);
  const [cycleCount, setCycleCount] = useState(0);
  const [errorTimeline, setErrorTimeline] = useState([]);

  const simRef = useRef(null);
  const memRef = useRef(null);
  const loopRef = useRef(null);
  const simLoopRef = useRef(null);
  const totalTxnRef = useRef(0);

  useEffect(() => {
    simRef.current = createSimulator();
    memRef.current = createMemory();
  }, []);

  const startAgent = useCallback(() => {
    if(isRunning) return;
    setIsRunning(true);

    simLoopRef.current = setInterval(() => {
      if(!simRef.current || !memRef.current) return;
      const batch = simRef.current.generateBatch(38);
      memRef.current.addTransactions(batch);
      totalTxnRef.current += batch.length;

      const summary = memRef.current.getSummary();
      const sr = parseFloat(summary.successRate) || 96;
      const fr = parseFloat(summary.failureRate) || 4;
      const lat = parseInt(summary.avgLatency) || 245;
      setMetrics({ successRate:sr, failureRate:fr, avgLatency:lat, totalTxns:totalTxnRef.current });
      setIssuerHealth(summary.byIssuer||{});
      setMethodHealth(summary.byMethod||{});
      setSuppressions(summary.suppressions||{issuers:{},methods:{}});
      setActiveScenarios(simRef.current.getScenarios());

      const errBatch = batch.filter(t=>t.errorCode).slice(0,4);
      if(errBatch.length>0) setErrorTimeline(prev => [...prev.slice(-28), ...errBatch]);
    }, 800);

    loopRef.current = setInterval(async () => {
      if(!simRef.current || !memRef.current) return;
      try {
        const result = await runAgentCycle(memRef.current);
        setCycleCount(c=>c+1);
        setAgentLog(prev => [result, ...prev].slice(0,12));
        setPatterns(result.patterns||[]);
        setActionLog(prev => [...(result.executed||[]), ...prev].slice(0,22));
        setSuppressions(memRef.current.getSuppressions());
      } catch(e){ console.error('Cycle error:',e); }
    }, 8000);
  }, [isRunning]);

  const stopAgent = useCallback(() => {
    setIsRunning(false);
    if(simLoopRef.current) clearInterval(simLoopRef.current);
    if(loopRef.current) clearInterval(loopRef.current);
  }, []);

  useEffect(() => () => {
    if(simLoopRef.current) clearInterval(simLoopRef.current);
    if(loopRef.current) clearInterval(loopRef.current);
  }, []);

  const toggleScenario = (name) => {
    if(!simRef.current) return;
    if(simRef.current.isActive(name)) simRef.current.deactivateScenario(name);
    else simRef.current.activateScenario(name);
    setActiveScenarios({...simRef.current.getScenarios()});
  };

  const getSRColor = r => r>=95?'#22c55e':r>=85?'#f59e0b':'#ef4444';
  const getSevColor = s => ({critical:'#ef4444',high:'#f59e0b',medium:'#3b82f6',low:'#6b7280'}[s]||'#6b7280');
  const getTierColor = t => ({AUTONOMOUS:'#22c55e',GUARDED:'#f59e0b',HUMAN_GATE:'#8b5cf6',BLOCKED:'#ef4444'}[t]||'#6b7280');
  const getActIcon = t => {
    const m={suppress_issuer:Shield,suppress_method:Shield,adjust_retry:RotateCcw,reroute_traffic:Zap,alert_ops:AlertTriangle,rollback:RotateCcw};
    const Ic=m[t]||Activity; return <Ic size={12}/>;
  };

  const scenarioList = [
    { key:'issuer_degradation', label:'Issuer Degradation', desc:'Chase: 78% failure rate', icon:TrendingDown },
    { key:'bank_outage', label:'Bank Outage', desc:'HSBC: fully unavailable', icon:XCircle },
    { key:'network_latency_spike', label:'Latency Spike', desc:'Citi+Wells: 3.4s+ latency', icon:Clock },
    { key:'method_fatigue', label:'Method Fatigue', desc:'Digital wallet: progressive decay', icon:TrendingDown },
    { key:'retry_storm', label:'Retry Storm', desc:'ShopFast: 8x retry loops', icon:RotateCcw },
  ];

  // ─── Styles ───
  const S = {
    page: { background:'#080c1a', color:'#e2e8f0', minHeight:'100vh', fontFamily:"'SF Mono','Fira Code',monospace", fontSize:11.5 },
    header: { background:'linear-gradient(135deg,#0f1526 0%,#111b2e 100%)', borderBottom:'1px solid #1a2540', padding:'14px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 },
    card: { background:'#0e1420', borderRadius:9, border:'1px solid #1a2540', overflow:'hidden' },
    cardHead: { padding:'9px 13px', borderBottom:'1px solid #1a2540', display:'flex', alignItems:'center', gap:6 },
    cardHeadLabel: { fontSize:10, fontWeight:600, color:'#64748b', textTransform:'uppercase', letterSpacing:0.8 },
    metricCard: { background:'#0e1420', borderRadius:9, border:'1px solid #1a2540', padding:'13px 15px', position:'relative', overflow:'hidden' },
    btn: { border:'none', borderRadius:6, padding:'7px 16px', fontFamily:'"Inter",sans-serif', fontSize:12.5, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:34,height:34,borderRadius:8,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 12px #6366f140'}}>
            <Brain size={18} color="white"/>
          </div>
          <div>
            <div style={{fontFamily:'"Inter",sans-serif',fontSize:14.5,fontWeight:700,color:'#f1f5f9',letterSpacing:'-0.3px'}}>PayOps Agent</div>
            <div style={{fontSize:9.5,color:'#4a5568',display:'flex',gap:10,alignItems:'center'}}>
              <span style={{display:'flex',alignItems:'center',gap:4}}><span style={{width:6,height:6,borderRadius:'50%',background:isRunning?'#22c55e':'#4a5568',boxShadow:isRunning?'0 0 6px #22c55e':'none',display:'inline-block'}}/>{isRunning?'LIVE':'IDLE'}</span>
              <span>·</span><span>Cycles: {cycleCount}</span>
              <span>·</span><span>{totalTxnRef.current.toLocaleString()} txns</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:7}}>
          {!isRunning ? (
            <button onClick={startAgent} style={{...S.btn,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',boxShadow:'0 2px 10px #6366f140'}}>
              <Play size={12}/> Start Agent
            </button>
          ) : (
            <button onClick={stopAgent} style={{...S.btn,background:'#1a2540',border:'1px solid #2a3a5c',color:'#cbd5e1'}}>
              <Square size={12}/> Stop
            </button>
          )}
        </div>
      </div>

      {/* Top Metrics */}
      <div style={{padding:'14px 18px 0',display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,maxWidth:1380,margin:'0 auto'}}>
        {[
          { label:'Success Rate', value:`${metrics.successRate}%`, color:getSRColor(metrics.successRate), sub:'last 60s', Icon:CheckCircle },
          { label:'Avg Latency', value:`${metrics.avgLatency}ms`, color:metrics.avgLatency>2000?'#ef4444':metrics.avgLatency>700?'#f59e0b':'#6366f1', sub:'p50 estimate', Icon:Clock },
          { label:'Active Patterns', value:`${patterns.length}`, color:patterns.some(p=>p.severity==='critical')?'#ef4444':patterns.length>0?'#f59e0b':'#22c55e', sub:patterns.length?patterns[0]?.type:'All clear', Icon:AlertTriangle },
        ].map((m,i)=>(
          <div key={i} style={S.metricCard}>
            <div style={{position:'absolute',top:-10,right:-10,width:55,height:55,borderRadius:'50%',background:`${m.color}08`}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
              <span style={{fontSize:9.5,color:'#4a5568',textTransform:'uppercase',letterSpacing:0.8}}>{m.label}</span>
              <m.Icon size={15} color={m.color}/>
            </div>
            <div style={{fontSize:21,fontWeight:700,color:m.color,marginTop:5,fontFamily:'"Inter",sans-serif',letterSpacing:'-0.5px'}}>{m.value}</div>
            <div style={{fontSize:9,color:'#374151',marginTop:2}}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{padding:'10px 18px 18px',display:'grid',gridTemplateColumns:'1.05fr 0.95fr',gap:10,maxWidth:1380,margin:'0 auto'}}>
        {/* Left Column */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>

          {/* Scenario Controls */}
          <div style={S.card}>
            <div style={S.cardHead}><Zap size={12} color="#6366f1"/><span style={S.cardHeadLabel}>Failure Scenarios</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>Toggle to inject</span></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr'}}>
              {scenarioList.map((s,idx)=>{
                const active=activeScenarios[s.key]?.active;
                const Icon=s.icon;
                return (
                  <button key={s.key} onClick={()=>toggleScenario(s.key)} style={{background:active?'rgba(99,102,241,0.1)':'transparent',border:'none',padding:'9px 11px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:7,textAlign:'left',borderBottom:'1px solid #1a2540',borderRight:idx%2===0?'1px solid #1a2540':'none',transition:'background 0.15s'}}>
                    <div style={{marginTop:1,color:active?'#a78bfa':'#374151'}}><Icon size={13}/></div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10.5,color:active?'#c4b5fd':'#94a3b8',fontWeight:active?600:400}}>{s.label}</div>
                      <div style={{fontSize:8.5,color:'#374151',marginTop:1}}>{s.desc}</div>
                    </div>
                    <div style={{width:7,height:7,borderRadius:'50%',background:active?'#ef4444':'#2a3a5c',boxShadow:active?'0 0 5px #ef4444':'none',flexShrink:0,marginTop:3}}/>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issuer Health */}
          <div style={S.card}>
            <div style={S.cardHead}><Shield size={12} color="#6366f1"/><span style={S.cardHeadLabel}>Issuer Health</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>{Object.keys(issuerHealth).length} issuers</span></div>
            <div style={{padding:7}}>
              {Object.keys(issuerHealth).length>0 ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:3}}>
                  {Object.entries(issuerHealth).sort((a,b)=>parseFloat(b[1].failRate)-parseFloat(a[1].failRate)).map(([issuer,data])=>{
                    const fr=parseFloat(data.failRate)||0;
                    const sup=suppressions.issuers[issuer];
                    const barCol=sup?'#6366f1':fr>35?'#ef4444':fr>15?'#f59e0b':'#22c55e';
                    return (
                      <div key={issuer} style={{background:'#080c1a',borderRadius:6,padding:'7px 9px',border:sup?'1px solid #6366f140':'1px solid #1a2540',position:'relative'}}>
                        {sup&&<span style={{position:'absolute',top:3,right:5,fontSize:7.5,color:'#a78bfa',background:'#1e1b4b',padding:'1px 4px',borderRadius:2,fontWeight:600}}>SUPPRESSED</span>}
                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                          <span style={{fontSize:10.5,color:'#cbd5e1',fontWeight:600}}>{issuer}</span>
                          <span style={{fontSize:9,color:barCol}}>{data.failRate}</span>
                        </div>
                        <div style={{height:3,background:'#1a2540',borderRadius:1.5,overflow:'hidden'}}>
                          <div style={{height:'100%',width:`${Math.min(fr*2.5,100)}%`,background:barCol,borderRadius:1.5,transition:'width 0.5s ease'}}/>
                        </div>
                        <div style={{fontSize:8,color:'#374151',marginTop:2}}>Lat {data.avgLat}ms · {data.total} txns</div>
                      </div>
                    );
                  })}
                </div>
              ) : <div style={{color:'#374151',fontSize:10,padding:'14px',textAlign:'center'}}>Start agent to populate issuer data</div>}
            </div>
          </div>

          {/* Method Health */}
          <div style={S.card}>
            <div style={S.cardHead}><Activity size={12} color="#6366f1"/><span style={S.cardHeadLabel}>Payment Methods</span></div>
            <div style={{padding:'7px 11px'}}>
              {Object.keys(methodHealth).length>0 ? Object.entries(methodHealth).map(([method,data],i)=>{
                const fr=parseFloat(data.failRate)||0;
                const sup=suppressions.methods[method];
                return (
                  <div key={method} style={{display:'flex',alignItems:'center',gap:7,padding:'4px 0',borderBottom:i<Object.keys(methodHealth).length-1?'1px solid #1a2540':'none'}}>
                    <div style={{width:82,fontSize:9.5,color:sup?'#a78bfa':'#94a3b8',display:'flex',alignItems:'center',gap:3}}>
                      {sup&&<Shield size={8}/>}
                      {method.replace(/_/g,' ')}
                    </div>
                    <div style={{flex:1,height:5,background:'#1a2540',borderRadius:2.5,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${Math.min(fr*3.2,100)}%`,background:sup?'#6366f1':fr>30?'#ef4444':fr>12?'#f59e0b':'#22c55e',borderRadius:2.5,transition:'width 0.4s'}}/>
                    </div>
                    <span style={{width:40,textAlign:'right',fontSize:9,color:fr>30?'#ef4444':'#94a3b8'}}>{data.failRate}</span>
                  </div>
                );
              }) : <div style={{color:'#374151',fontSize:10,padding:'8px',textAlign:'center'}}>No data</div>}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>

          {/* Agent Reasoning */}
          <div style={S.card}>
            <div style={S.cardHead}><Brain size={12} color="#8b5cf6"/><span style={S.cardHeadLabel}>Agent Reasoning</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>every 8s</span></div>
            <div style={{maxHeight:280,overflowY:'auto',padding:6}}>
              {agentLog.length>0 ? agentLog.map((entry,i)=>{
                const expanded=expandedReasoning===i;
                const cc=entry.confidence>=0.8?'#22c55e':entry.confidence>=0.5?'#f59e0b':'#ef4444';
                return (
                  <div key={entry.cycleId||i} style={{background:'#0a1020',borderRadius:6,marginBottom:3,border:'1px solid #1a2540'}}>
                    <button onClick={()=>setExpandedReasoning(expanded?null:i)} style={{width:'100%',background:'none',border:'none',padding:'7px 9px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,textAlign:'left'}}>
                      <div style={{width:18,height:18,borderRadius:4,background:'#1e1b4b',display:'flex',alignItems:'center',justifyContent:'center'}}><Eye size={9} color="#8b5cf6"/></div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:9.5,color:'#64748b',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                          <span style={{color:cc,fontWeight:600}}>Conf {(entry.confidence*100).toFixed(0)}%</span>
                          {entry.detectedIssues?.length>0&&<span style={{color:'#f59e0b'}}>{entry.detectedIssues.length} issue{entry.detectedIssues.length>1?'s':''}</span>}
                          {entry.executed?.length>0&&<span style={{color:'#6366f1'}}>{entry.executed.length} action{entry.executed.length>1?'s':''}</span>}
                          {entry.humanGate?.length>0&&<span style={{color:'#8b5cf6'}}>{entry.humanGate.length} pending</span>}
                        </div>
                      </div>
                      {expanded?<ChevronUp size={9} color="#374151"/>:<ChevronDown size={9} color="#374151"/>}
                    </button>
                    {expanded&&(
                      <div style={{padding:'0 9px 9px',borderTop:'1px solid #1a2540'}}>
                        <div style={{marginTop:7,fontSize:9.5,color:'#94a3b8',lineHeight:1.65,whiteSpace:'pre-wrap'}}>{entry.llmReasoning}</div>
                        {entry.monitoringNotes&&<div style={{marginTop:6,fontSize:8.5,color:'#6366f1',background:'#1e1b4b20',padding:'4px 7px',borderRadius:4,border:'1px solid #1e1b4b40'}}><strong>Monitor:</strong> {entry.monitoringNotes}</div>}
                        {entry.learningInsight&&entry.learningInsight!=='N/A'&&entry.learningInsight!=='N/A — fallback mode'&&<div style={{marginTop:3,fontSize:8.5,color:'#22c55e',background:'#052e1620',padding:'4px 7px',borderRadius:4,border:'1px solid #052e1640'}}><strong>Learn:</strong> {entry.learningInsight}</div>}
                        {entry.blocked?.length>0&&<div style={{marginTop:4,fontSize:8,color:'#ef4444',background:'#450a0a20',padding:'3px 7px',borderRadius:4}}><strong>Blocked:</strong> {entry.blocked.length} action{entry.blocked.length>1?'s':''} by guardrails</div>}
                      </div>
                    )}
                  </div>
                );
              }) : <div style={{color:'#374151',fontSize:10,padding:'22px',textAlign:'center'}}>Start the agent to see reasoning output.<br/><span style={{color:'#2a3a5c'}}>The agent will observe, reason, and act every 8 seconds.</span></div>}
            </div>
          </div>

          {/* Action Log */}
          <div style={S.card}>
            <div style={S.cardHead}><Target size={12} color="#6366f1"/><span style={S.cardHeadLabel}>Action Log</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>{actionLog.length} actions</span></div>
            <div style={{maxHeight:195,overflowY:'auto',padding:6}}>
              {actionLog.length>0 ? actionLog.map((a,i)=>{
                const tc=getTierColor(a.tier||a.details?.tier);
                const isRollback=a.type==='rollback';
                return (
                  <div key={a.actionId||i} style={{display:'flex',alignItems:'flex-start',gap:7,padding:'5px 7px',background:isRollback?'#1a0e00':'#0a1020',borderRadius:5,marginBottom:2,border:`1px solid ${isRollback?'#f59e0b20':'#1a2540'}`}}>
                    <div style={{color:isRollback?'#f59e0b':'#6366f1',marginTop:1}}>{getActIcon(a.type)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9.5,color:isRollback?'#fbbf24':'#e2e8f0',fontWeight:isRollback?600:400,wordBreak:'break-word'}}>{a.details?.message||a.type}</div>
                      <div style={{display:'flex',gap:4,marginTop:2,flexWrap:'wrap'}}>
                        <span style={{fontSize:7.5,color:tc,background:`${tc}12`,padding:'1px 5px',borderRadius:2,fontWeight:600}}>{a.tier||a.details?.tier||'?'}</span>
                        <span style={{fontSize:7.5,color:isRollback?'#f59e0b':a.status==='active'?'#22c55e':a.status==='sent'?'#6366f1':'#64748b'}}>{a.status}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : <div style={{color:'#374151',fontSize:10,padding:'14px',textAlign:'center'}}>No actions yet</div>}
            </div>
          </div>

          {/* Detected Patterns */}
          <div style={S.card}>
            <div style={S.cardHead}><Eye size={12} color="#f59e0b"/><span style={S.cardHeadLabel}>Detected Patterns</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>{patterns.length} active</span></div>
            <div style={{padding:6,maxHeight:160,overflowY:'auto'}}>
              {patterns.length>0 ? patterns.map((p,i)=>{
                const sc=getSevColor(p.severity);
                return (
                  <div key={i} style={{background:'#0a1020',borderRadius:5,padding:'6px 8px',marginBottom:2,border:`1px solid ${sc}25`}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:9.5,fontWeight:600,color:sc}}>{p.type}</span>
                      <span style={{fontSize:7.5,color:sc,background:`${sc}12`,padding:'1px 5px',borderRadius:2,textTransform:'uppercase',fontWeight:600}}>{p.severity}</span>
                    </div>
                    <div style={{fontSize:8.5,color:'#64748b',marginTop:2.5,lineHeight:1.45}}>{p.hypothesis}</div>
                  </div>
                );
              }) : <div style={{color:'#374151',fontSize:10,padding:'10px',textAlign:'center'}}>No patterns detected</div>}
            </div>
          </div>

          {/* Error Stream */}
          <div style={S.card}>
            <div style={S.cardHead}><XCircle size={12} color="#ef4444"/><span style={S.cardHeadLabel}>Error Stream</span><span style={{marginLeft:'auto',fontSize:9,color:'#374151'}}>live</span></div>
            <div style={{padding:5,maxHeight:110,overflowY:'auto'}}>
              {errorTimeline.length>0 ? errorTimeline.slice(-10).reverse().map((e,i)=>(
                <div key={i} style={{display:'flex',gap:7,padding:'2.5px 5px',alignItems:'center',opacity:1-i*0.08}}>
                  <span style={{fontSize:8.5,color:'#374151',width:52,flexShrink:0}}>{new Date(e.timestamp).toLocaleTimeString('en',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
                  <span style={{fontSize:7.5,color:'#ef4444',background:'#3a0808',padding:'1px 5px',borderRadius:2,minWidth:78,textAlign:'center',fontWeight:600}}>{e.errorCode?.replace('ERR_','')}</span>
                  <span style={{fontSize:8.5,color:'#94a3b8'}}>{e.issuer}</span>
                  <span style={{fontSize:8.5,color:'#374151',marginLeft:'auto'}}>${e.amount?.toFixed(2)}</span>
                </div>
              )) : <div style={{color:'#374151',fontSize:10,padding:'8px',textAlign:'center'}}>No errors</div>}
            </div>
          </div>
        </div>
      </div>
  );
}
