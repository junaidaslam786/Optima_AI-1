// // supabase/functions/get-panel-insights/index.ts
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const OPENAI_KEY = Deno.env.get("OPEN_AI_KEY"); // Ensure this secret is set in Supabase secrets as OPEN_AI_KEY
// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization"
// };

// // Ensure required environment variables are present and are strings
// if (!SUPABASE_URL) throw new Error("SUPABASE_URL environment variable is not set.");
// if (!SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY environment variable is not set.");
// if (!OPENAI_KEY) throw new Error("OPEN_AI_KEY environment variable is not set.");
// Deno.serve(async (req)=>{
//   // CORS preflight request handling
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: CORS_HEADERS
//     });
//   }
//   // Only allow POST requests
//   if (req.method !== "POST") {
//     console.warn(`Method Not Allowed: ${req.method}`);
//     return new Response("Method Not Allowed", {
//       status: 405,
//       headers: CORS_HEADERS
//     });
//   }
//   let body;
//   try {
//     body = await req.json();
//     console.log("Request Body Parsed:", body);
//   } catch (err) {
//     console.error("Invalid JSON in request body:", err);
//     return new Response(JSON.stringify({
//       error: "Invalid JSON in request body",
//       detail: typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : String(err)
//     }), {
//       status: 400,
//       headers: CORS_HEADERS
//     });
//   }
//   const user_id = body.user_id;
//   if (!user_id) {
//     console.error("Missing user_id in request body.");
//     return new Response(JSON.stringify({
//       error: "Missing user_id in request body"
//     }), {
//       status: 400,
//       headers: CORS_HEADERS
//     });
//   }
//   // --- 1. Fetch patient_marker_values with nested relationships ---
//   let markers = [];
//   try {
//     // FIX: Combined markers selection into a single block
//     const markersLookupUrl = `${SUPABASE_URL}/rest/v1/patient_marker_values?select=value,status,markers(marker,unit,normal_low,normal_high,panels(name))&user_id=eq.${user_id}`;
//     console.log("Fetching markers from URL:", markersLookupUrl);
//     const markersRes = await fetch(markersLookupUrl, {
//       method: "GET",
//       headers: {
//         apikey: SERVICE_ROLE_KEY,
//         Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//         "Content-Type": "application/json"
//       }
//     });
//     if (!markersRes.ok) {
//       const detail = await markersRes.text();
//       console.error("Failed to fetch markers from PostgREST:", markersRes.status, detail);
//       return new Response(JSON.stringify({
//         error: "Failed to fetch marker data from database",
//         detail: detail
//       }), {
//         status: 500,
//         headers: CORS_HEADERS
//       });
//     }
//     markers = await markersRes.json();
//     console.log("Successfully fetched Markers:", JSON.stringify(markers, null, 2));
//     if (!Array.isArray(markers)) {
//       console.error("Fetched markers data is not an array:", markers);
//       return new Response(JSON.stringify({
//         error: "Invalid data structure fetched from markers table."
//       }), {
//         status: 500,
//         headers: CORS_HEADERS
//       });
//     }
//     if (markers.length === 0) {
//       console.log("No marker data found for user_id:", user_id);
//       return new Response(JSON.stringify({
//         message: "No marker data found for this user."
//       }), {
//         status: 200,
//         headers: {
//           ...CORS_HEADERS,
//           "Content-Type": "application/json"
//         }
//       });
//     }
//   } catch (err) {
//     console.error("Error fetching markers or parsing response:", err);
//     return new Response(JSON.stringify({
//       error: "Internal server error during marker data retrieval",
//       detail: typeof err === "object" && err !== null && "message" in err ? (err as { message: string }).message : String(err)
//     }), {
//       status: 500,
//       headers: CORS_HEADERS
//     });
//   }
//   // 🧠 2. Group by panel name
//   const panelsMap = new Map();
//   for (const row of markers){
//     // Safely access nested properties using optional chaining
//     const panelName = row.markers?.panels?.name || "General Panel"; // Default if panel name is missing
//     const marker = row.markers?.marker || "Unknown Marker";
//     const unit = row.markers?.unit || "";
//     const value = row.value ?? null; // Use null if value is undefined/null
//     if (value === null) {
//       console.warn(`Skipping row for marker '${marker}' in panel '${panelName}' due to null value.`);
//       continue; // Skip rows where marker value is null, as AI prompt needs values
//     }
//     if (!panelsMap.has(panelName)) {
//       panelsMap.set(panelName, []);
//     }
//     panelsMap.get(panelName)?.push({
//       value: value,
//       status: row.status || "normal",
//       marker: marker,
//       unit: unit,
//       // Pass normal_low and normal_high to the AI prompt for richer context
//       normal_low: row.markers?.normal_low ?? null,
//       normal_high: row.markers?.normal_high ?? null
//     });
//   }
//   console.log("Grouped Panels:", JSON.stringify(Object.fromEntries(panelsMap), null, 2));
//   if (panelsMap.size === 0) {
//     console.log("No panels found after grouping markers.");
//     return new Response(JSON.stringify({
//       message: "No panels with valid marker data found for this user."
//     }), {
//       status: 200,
//       headers: {
//         ...CORS_HEADERS,
//         "Content-Type": "application/json"
//       }
//     });
//   }
//   // 📢 3. Define insight prompt format
//   const systemMsg = `
// You are a friendly and encouraging health assistant. Given the lab markers for one panel, provide a short, simple insight.
// Do NOT use a formal medical tone—be friendly but to the point.
// Start with a short and concise line about if the reports are normal or not and end the sentence there with a full stop (don't use any other sign to end the first sentence, don't use — or a !).
// Then provide a general detail about the panel's markers and offer slight encouragement or actionable advice with a little bit of detail.
// Conclude your response with the exact phrase: "Click the panel to see more insights."
// `.trim(); // Updated system prompt for clarity and tone adherence
//   // 🤖 4. For each panel, call OpenAI
//   const insights = [];
//   for (const [panelName, markerList] of panelsMap.entries()){
//     let userPrompt = `Panel: ${panelName}\n\n`;
//     for (const row of markerList){
//       userPrompt += `• ${row.marker}: ${row.value} ${row.unit} (status: ${row.status}`;
//       // Add normal range to the prompt for AI to consider
//       if (row.normal_low !== null && row.normal_high !== null) {
//         userPrompt += `, Normal Range: ${row.normal_low} - ${row.normal_high}`;
//       } else if (row.normal_low !== null) {
//         userPrompt += `, Normal > ${row.normal_low}`;
//       } else if (row.normal_high !== null) {
//         userPrompt += `, Normal < ${row.normal_high}`;
//       }
//       userPrompt += `)\n`;
//     }
//     console.log(`OpenAI User Prompt for ${panelName}:\n${userPrompt}`);
//     try {
//       const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${OPENAI_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           model: "gpt-4o",
//           messages: [
//             {
//               role: "system",
//               content: systemMsg
//             },
//             {
//               role: "user",
//               content: userPrompt
//             }
//           ],
//           temperature: 0.7,
//           max_tokens: 200
//         })
//       });
//       if (!aiRes.ok) {
//         const detail = await aiRes.text();
//         console.error(`OpenAI API error for panel "${panelName}":`, aiRes.status, detail);
//         // Do not return a 500 here, instead log and continue for other panels if possible
//         insights.push(`### ${panelName}\nFailed to generate insight: ${detail}`);
//         continue; // Continue to the next panel if one fails
//       }
//       const aiJson = await aiRes.json();
//       console.log(`OpenAI Raw Response for ${panelName}:`, JSON.stringify(aiJson, null, 2));
//       const content = aiJson.choices?.[0]?.message?.content.trim() || "";
//       insights.push(`### ${panelName}\n${content}`);
//     } catch (err) {
//       console.error(`Error during OpenAI API call for panel "${panelName}":`, err);
//       // Log error and add a fallback message to insights
//       insights.push(`### ${panelName}\nFailed to generate insight due to an internal error.`);
//     }
//   }
//   // If no insights were generated at all, return an appropriate message
//   if (insights.length === 0) {
//     return new Response(JSON.stringify({
//       message: "Could not generate any insights for the provided data."
//     }), {
//       status: 200,
//       headers: {
//         ...CORS_HEADERS,
//         "Content-Type": "application/json"
//       }
//     });
//   }
//   const responseText = insights.join("\n\n");
//   console.log("Final Response Text:", responseText); // Log the final response
//   // The client side expects a JSON response, not plain text, if it's doing `await response.json()`
//   // The original client code was expecting a string, so let's send a JSON object with a string property
//   return new Response(JSON.stringify(responseText), {
//     status: 200,
//     headers: {
//       ...CORS_HEADERS,
//       "Content-Type": "application/json"
//     }
//   });
// });
