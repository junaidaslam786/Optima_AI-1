// supabase/functions/generate-insights/index.ts
// Setup type definitions for Supabase Edge runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info"
};
Deno.serve(async (req)=>{
  // 1) CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: CORS
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: CORS
    });
  }
  // 2) Parse incoming payload
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response(JSON.stringify({
      error: "Invalid JSON"
    }), {
      status: 400,
      headers: CORS
    });
  }
  const user_id = body.user_id;
  if (!user_id) {
    return new Response(JSON.stringify({
      error: "Missing user_id"
    }), {
      status: 400,
      headers: CORS
    });
  }
  // 3) Fetch this user’s markers with panel names
  const markersRes = await fetch(`${SUPABASE_URL}/rest/v1/markers?user_id=eq.${encodeURIComponent(user_id)}&select=marker,value,unit,status,panel:panels(name)`, {
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  if (!markersRes.ok) {
    const detail = await markersRes.text();
    console.error("Fetch markers failed:", detail);
    return new Response(JSON.stringify({
      error: "Failed to fetch markers"
    }), {
      status: 500,
      headers: CORS
    });
  }
  const markers = await markersRes.json();
  // 4) Group by panel name
  const panelsMap = new Map();
  for (const m of markers){
    const panelName = m.panel.name || "General";
    if (!panelsMap.has(panelName)) panelsMap.set(panelName, []);
    panelsMap.get(panelName).push(m);
  }
  // 5) Build a single doctor-style prompt
  const systemMsg = `
You are a seasoned medical professional and nutritionist. 
A patient has the following lab panels, each with its associated markers and latest values.
For each panel, provide a detailed, friendly but expert-level set of recommendations:
— What dietary changes to consider
— Which lifestyle or exercise habits to adopt
— Any supplements or follow-up actions
Focus purely on “what to do” advice based on the marker names and values.
`.trim();
  let userPrompt = "";
  for (const [panelName, list] of panelsMap){
    userPrompt += `\n\n### Panel: ${panelName}\n`;
    for (const row of list){
      userPrompt += `• ${row.marker}: ${row.value} ${row.unit} (status: ${row.status})\n`;
    }
  }
  // 6) Call OpenAI
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-turbo",
      messages: [
        {
          role: "system",
          content: systemMsg
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    })
  });
  if (!aiRes.ok) {
    const detail = await aiRes.text();
    console.error("OpenAI error:", detail);
    return new Response(JSON.stringify({
      error: "AI request failed"
    }), {
      status: 500,
      headers: CORS
    });
  }
  const aiJson = await aiRes.json();
  const content = aiJson.choices?.[0]?.message?.content || "";
  // 7) Return the full narrative back to the client
  return new Response(JSON.stringify({
    insights: content
  }), {
    status: 200,
    headers: CORS
  });
});
