// // supabase/functions/marker-details/index.ts
// // Setup type definitions for Supabase Edge runtime
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
// const CORS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, apikey"
// };
// Deno.serve(async (req)=>{
//   // 1) Handle CORS preflight
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
//   // 2) Parse JSON body
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
//   const panelName = body.panel_name;
//   const markerName = body.marker_name;
//   if (!panelName || !markerName) {
//     return new Response(JSON.stringify({
//       error: "Missing panel_name or marker_name"
//     }), {
//       status: 400,
//       headers: CORS
//     });
//   }
//   // 3) Build prompts for OpenAI
//   const systemMsg = `
// You are a helpful assistant. Given a panel name and a single marker name, explain why this marker is important for that panel. Be concise, friendly, and to the point. Use simple language suitable for a general audience.
//   `.trim();
//   const userPrompt = `Panel: ${panelName}
// Marker: ${markerName}

// Explain why "${markerName}" is important for the "${panelName}" panel.
//   `;
//   // 4) Call OpenAI Chat Completion
//   const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${OPENAI_KEY}`,
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify({
//       model: "gpt-4o",
//       messages: [
//         {
//           role: "system",
//           content: systemMsg
//         },
//         {
//           role: "user",
//           content: userPrompt
//         }
//       ],
//       temperature: 0.7,
//       max_tokens: 150
//     })
//   });
//   if (!aiRes.ok) {
//     const detail = await aiRes.text();
//     console.error(`OpenAI error for marker "${markerName}":`, detail);
//     return new Response(JSON.stringify({
//       error: "AI request failed"
//     }), {
//       status: 500,
//       headers: CORS
//     });
//   }
//   const aiJson = await aiRes.json();
//   const content = aiJson.choices?.[0]?.message?.content.trim() || "";
//   // 5) Return the explanation as plain text
//   return new Response(content, {
//     status: 200,
//     headers: {
//       ...CORS,
//       "Content-Type": "text/plain; charset=utf-8"
//     }
//   });
// });
