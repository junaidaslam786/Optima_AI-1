// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
// const CORS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info"
// };
// Deno.serve(async (req)=>{
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: CORS
//     });
//   }
//   if (req.method !== "POST") {
//     return new Response("Method Not Allowed", {
//       status: 405,
//       headers: CORS
//     });
//   }
//   let body;
//   try {
//     body = await req.json();
//   } catch  {
//     return new Response(JSON.stringify({
//       error: "Invalid JSON"
//     }), {
//       status: 400,
//       headers: CORS
//     });
//   }
//   const user_id = body.user_id;
//   if (!user_id) {
//     return new Response(JSON.stringify({
//       error: "Missing user_id"
//     }), {
//       status: 400,
//       headers: CORS
//     });
//   }
//   // 🧠 1. Fetch patient_marker_values joined with markers and panels
//   const query = `
//     SELECT 
//       pmv.value,
//       pmv.status,
//       m.marker,
//       m.unit,
//       p.name AS panel_name
//     FROM patient_marker_values pmv
//     JOIN markers m ON m.id = pmv.marker_id
//     JOIN panels p ON p.id = m.panel_id
//     WHERE pmv.user_id = '${user_id}'
//   `;
//   const markersRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
//     method: "POST",
//     headers: {
//       apikey: SERVICE_ROLE_KEY,
//       Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       query
//     })
//   });
//   if (!markersRes.ok) {
//     const detail = await markersRes.text();
//     console.error("Fetch markers failed:", detail);
//     return new Response(JSON.stringify({
//       error: "Failed to fetch marker data"
//     }), {
//       status: 500,
//       headers: CORS
//     });
//   }
//   const markers = await markersRes.json();
//   // 🧠 2. Group by panel name
//   const panelsMap = new Map();
//   for (const row of markers){
//     const panelName = row.panel_name || "General";
//     if (!panelsMap.has(panelName)) panelsMap.set(panelName, []);
//     panelsMap.get(panelName)?.push(row);
//   }
//   // 📢 3. Define insight prompt format
//   const systemMsg = `
// You are a helpful assistant. Given the lab markers for one panel, provide a short, simple insight.
// Do NOT use a formal medical tone—be friendly but to the point.
// Start with a short and concise line about if the reports are normal or not and end the sentence there with a full stop (don't use any other sign to end the first sentence, don't use — or a !).
// Then a general detail about the panel's markers and a slight motivation with a little bit of detail.
// End with: "Click the panel to see more insights."
// `.trim();
//   // 🤖 4. For each panel, call OpenAI
//   const insights = [];
//   for (const [panelName, markerList] of panelsMap.entries()){
//     let userPrompt = `Panel: ${panelName}\n`;
//     for (const row of markerList){
//       userPrompt += `• ${row.marker}: ${row.value} ${row.unit} (status: ${row.status})\n`;
//     }
//     const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${OPENAI_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "gpt-4o",
//         messages: [
//           {
//             role: "system",
//             content: systemMsg
//           },
//           {
//             role: "user",
//             content: userPrompt
//           }
//         ],
//         temperature: 0.7,
//         max_tokens: 150
//       })
//     });
//     if (!aiRes.ok) {
//       const detail = await aiRes.text();
//       console.error(`OpenAI error for panel "${panelName}":`, detail);
//       return new Response(JSON.stringify({
//         error: "AI request failed"
//       }), {
//         status: 500,
//         headers: CORS
//       });
//     }
//     const aiJson = await aiRes.json();
//     const content = aiJson.choices?.[0]?.message?.content.trim() || "";
//     insights.push(`### ${panelName}\n${content}`);
//   }
//   const responseText = insights.join("\n\n");
//   return new Response(responseText, {
//     status: 200,
//     headers: {
//       ...CORS,
//       "Content-Type": "text/plain; charset=utf-8"
//     }
//   });
// });
