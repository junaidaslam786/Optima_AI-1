// Setup type definitions for built-in Supabase Runtime APIs
// supabase/functions/generate-panel-insights/index.ts
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
deno: Deno.serve(async (req)=>{
  // CORS preflight
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
  // Parse JSON
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
  const { user_id, panel_id } = body;
  if (!user_id || !panel_id) {
    return new Response(JSON.stringify({
      error: "Missing user_id or panel_id"
    }), {
      status: 400,
      headers: CORS
    });
  }
  // Fetch markers for given panel
  const markersRes = await fetch(`${SUPABASE_URL}/rest/v1/markers?` + `user_id=eq.${encodeURIComponent(user_id)}` + `&panel_id=eq.${encodeURIComponent(panel_id)}` + `&select=marker,value,unit,status,panel:panels(name)`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`
    }
  });
  const markers = await markersRes.json();
  // Build prompt
  const panelName = markers[0]?.panel?.name || "Selected Panel";
  const systemMsg = `
You are a board-certified clinical nutritionist and medical expert.
Provide concise, evidence-based recommendations for the "${panelName}" panel in three sections:
1) Key Takeaways
2) Dietary & Lifestyle Suggestions
3) Follow-Up Actions
Be clear, actionable, and patient-friendly.
`.trim();
  let userPrompt = `### Panel: ${panelName}\n`;
  for (const m of markers){
    userPrompt += `- ${m.marker}: ${m.value} ${m.unit} (status: ${m.status})\n`;
  }
  // Call OpenAI
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
  return new Response(content, {
    status: 200,
    headers: {
      ...CORS,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
});
