// supabase/functions/generate-insights/index.ts
// Setup type definitions for Supabase Edge runtime
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
const CORS = {
  "Access-Control-Allow-Origin": "*",
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
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`
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
  // 5) Define a simple system prompt for concise insights
  const systemMsg = `
You are a helpful assistant. Given the lab markers for one panel, provide a short, simple insight.
Do NOT use a formal medical tone—be friendly but to the point. 
End with "Click the panel to see more insights."
  `.trim();
  // 6) For each panel, build a small prompt and call OpenAI
  const insights = [];
  for (const [panelName, list] of panelsMap){
    // Build a user prompt listing only this panel's markers
    let userPrompt = `Panel: ${panelName}\n`;
    for (const row of list){
      userPrompt += `• ${row.marker}: ${row.value} ${row.unit} (status: ${row.status})\n`;
    }
    // Call OpenAI for this panel
    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemMsg
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text();
      console.error(`OpenAI error for panel "${panelName}":`, detail);
      return new Response(JSON.stringify({
        error: "AI request failed"
      }), {
        status: 500,
        headers: CORS
      });
    }
    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content.trim() || "";
    // Prefix the insight with the panel name (optional)
    insights.push(`### ${panelName}\n${content}`);
  }
  // 7) Return all per-panel insights back to the client, separated by blank lines
  const fullResponseText = insights.join("\n\n");
  return new Response(fullResponseText, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
});
