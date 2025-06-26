// // supabase/functions/upload-csv/index.ts
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
// const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
// const OPEN_AI_KEY = Deno.env.get("OPEN_AI_KEY"); // Ensure this secret is set in Supabase!
// const BUCKET = "csv-uploads"; // Your storage bucket name
// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };
// // Helper function to parse CSV text
// function parseCsv(txt) {
//   const lines = txt.split(/\r?\n/).filter((line) => line.trim());
//   if (lines.length === 0) {
//     return {
//       headings: [],
//       rows: [],
//     };
//   }
//   const [headerLine, ...rowLines] = lines;
//   const headings = headerLine.split(",").map((h) => h.trim());
//   const rows = rowLines.map((line) => {
//     const values = line.split(",");
//     return headings.reduce((obj, key, index) => {
//       obj[key] = (values[index] ?? "").trim();
//       return obj;
//     }, {});
//   });
//   return {
//     headings,
//     rows,
//   };
// }
// // Fallback helper function to determine marker status (if AI fails or is not used)
// function getMarkerStatusFallback(
//   value,
//   normalLow,
//   normalHigh,
//   rawStatusFlag = null,
// ) {
//   if (rawStatusFlag && rawStatusFlag.toLowerCase() === "critical") {
//     return "critical"; // Prioritize explicit critical flag
//   }
//   if (normalLow !== null && value < normalLow) {
//     return "low";
//   }
//   if (normalHigh !== null && value > normalHigh) {
//     return "high";
//   }
//   return "normal";
// }
// Deno.serve(async (req) => {
//   // CORS preflight
//   if (req.method === "OPTIONS") {
//     return new Response(null, {
//       status: 204,
//       headers: CORS_HEADERS,
//     });
//   }
//   if (req.method !== "POST") {
//     return new Response("Method Not Allowed", {
//       status: 405,
//       headers: CORS_HEADERS,
//     });
//   }
//   try {
//     const form = await req.formData();
//     const file = form.get("file");
//     const admin_user_id = form.get("admin_user_id")?.toString();
//     const client_user_id = form.get("client_user_id")?.toString(); // client_user_id from frontend
//     if (!(file instanceof File) || !admin_user_id) {
//       return new Response(
//         JSON.stringify({
//           error:
//             "Missing required form fields (file, admin_user_id, or client_user_id).",
//         }),
//         {
//           status: 400,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     const filenameParts = file.name.split(".");
//     const ext = filenameParts.at(-1)?.toLowerCase();
//     if (ext !== "csv") {
//       return new Response(
//         JSON.stringify({
//           error: `Unsupported file type: .${ext}. Please upload a CSV file.`,
//           detail:
//             "XLSX parsing requires external libraries not suitable for direct Deno Edge Function execution.",
//         }),
//         {
//           status: 400,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     // 2️⃣ Upload CSV to Storage
//     const ts = Date.now();
//     const objPath = `${client_user_id}/${ts}_${file.name}`;
//     const uploadRes = await fetch(
//       `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${
//         encodeURIComponent(
//           objPath,
//         )
//       }`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//           "Content-Type": file.type,
//           "x-upsert": "false",
//         },
//         body: file.stream(),
//       },
//     );
//     if (!uploadRes.ok) {
//       const detail = await uploadRes.text();
//       console.error("Storage upload failed:", detail);
//       return new Response(
//         JSON.stringify({
//           error: "Storage upload failed",
//           detail,
//         }),
//         {
//           status: uploadRes.status,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     // 3️⃣ Record upload metadata in public.uploads
//     const metaRes = await fetch(`${SUPABASE_URL}/rest/v1/uploads`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//         apikey: SERVICE_ROLE_KEY,
//         "Content-Type": "application/json",
//         Prefer: "return=representation",
//       },
//       body: JSON.stringify({
//         admin_user_id,
//         client_user_id,
//         filename: objPath,
//       }),
//     });
//     if (!metaRes.ok) {
//       const detail = await metaRes.text();
//       console.error("Upload metadata insertion failed:", detail);
//       return new Response(
//         JSON.stringify({
//           error: "Failed to create upload record in database",
//           detail,
//         }),
//         {
//           status: 500,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     const [uploadRecord] = await metaRes.json();
//     const csvfile_id = uploadRecord.id;
//     // 4️⃣ Read & parse CSV text
//     const buf = await file.arrayBuffer();
//     const text = new TextDecoder().decode(buf);
//     const { headings, rows } = parseCsv(text);
//     if (rows.length === 0) {
//       return new Response(
//         JSON.stringify({
//           message: "CSV file is empty or malformed after parsing.",
//         }),
//         {
//           status: 400,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     // Use 5 sample rows for AI prompt
//     const sampleRows = rows.slice(0, Math.min(5, rows.length));
//     const aiPrompt = `
//       You are an expert medical data analyst. You are provided with a CSV file's headers and sample rows.
//       Your goal is to accurately map these to medical fields, extract numerical ranges and units, and provide a status calculation function.

//       CSV Headers: ${JSON.stringify(headings)}.

//       Sample Rows from the CSV (first 5):
//       ${JSON.stringify(sampleRows, null, 2)}

//       Your task consists of two parts:

//       1. **Column Mapping and Data Extraction Logic:**
//          Identify the CSV column name that best corresponds to each of the following medical fields.
//          **Crucially, prioritize accurate extraction for 'marker_name', 'marker_unit', 'normal_low', and 'normal_high'.**

//          * **marker_name**: This should be the *concise, exact name* of the medical marker (e.g., "Haemoglobin", "Ferritin AT"). **It must NOT include any units, normal range descriptions, or informational notes.** If a column contains both the name and other details, extract only the name.
//          * **panel_name**: The name of the panel or category the marker belongs to.
//          * **marker_value**: The numerical result of the marker test.
//          * **marker_unit**: The unit of measurement for the marker (e.g., "g/L", "mmol/L", "ug/L"). If the unit is not in a dedicated column but can be *derived* from the 'normal_range_text' column or is a common unit for the 'marker_name', infer it.
//          * **normal_range_text**: The full text description of the normal range, as it appears in the CSV (e.g., "3.35 - 4.12 mmol/L", "< 5", "> 10"). This is important for extracting 'normal_low' and 'normal_high'.
//          * **normal_low**: The lower bound of the normal range for the marker. This *must* be extracted as a numerical value from the 'normal_range_text' or other relevant column. If only an upper bound (e.g., "< X") is provided, this should be null. If no range, this should be null.
//          * **normal_high**: The upper bound of the normal range for the marker. This *must* be extracted as a numerical value from the 'normal_range_text' or other relevant column. If only a lower bound (e.g., "> X") is provided, this should be null. If no range, this should be null.
//          * **collection_date**: The date when the sample was collected.
//          * **report_date**: The date when the report was issued.
//          * **status_flag**: A text flag indicating the status (e.g., "Critical", "Low", "High", "Normal").
//          * **category**: (Optional) A general category for the panel or marker, if present in the CSV and related to product categories.

//          If a field is not directly present as a column, or if its value can be more accurately inferred/derived from other columns (e.g., normal_low/high from normal_range_text, or unit from common knowledge for the marker), you should provide the *derived value* in place of 'null' for that specific row in the output. The output for column mapping should have these exact keys.

//       2. **JavaScript Status Calculation Function:**
//          Return a JavaScript function (as a string) named \`calculateStatus\` that takes 4 parameters: \`value\` (number), \`normalLow\` (number or null), \`normalHigh\` (number or null), and \`rawStatusFlag\` (string from CSV). It should return one of: "low", "high", "critical", or "normal".

//          Use this exact logic:
//          - If 'rawStatusFlag' is explicitly "Critical" (case-insensitive) or clearly implies a critical state (e.g., "CRITICAL"), return "critical".
//          - If 'value' is less than 'normalLow' (and normalLow is not null), return "low".
//          - If 'value' is greater than 'normalHigh' (and normalHigh is not null), return "high".
//          - Otherwise, return "normal".

//       Return the entire output as a JSON object with two top-level keys: "column_mapping" and "status_logic_function".

//       Example Output Structure (important: normal_low/high and marker_unit can be inferred directly by AI if not explicitly mapped, and should be values not null if inferred):
//       {
//         "column_mapping": {
//           "marker_name": "Mapped CSV Column Name (e.g., 'Test Name')",
//           "panel_name": "Mapped CSV Column Name (e.g., 'Test Group') OR 'null'",
//           "marker_value": "Mapped CSV Column Name (e.g., 'Result')",
//           "marker_unit": "Mapped CSV Column Name (e.g., 'Units') OR 'g/L' (if inferred)",
//           "normal_range_text": "Mapped CSV Column Name (e.g., 'Reference Range')",
//           "normal_low": "Mapped CSV Column Name (e.g., 'Lower Limit') OR 1.2 (if inferred from 'normal_range_text')",
//           "normal_high": "Mapped CSV Column Name (e.g., 'Upper Limit') OR 5.6 (if inferred from 'normal_range_text')",
//           "collection_date": "Mapped CSV Column Name (e.g., 'Draw Date') OR 'null'",
//           "report_date": "Mapped CSV Column Name (e.g., 'Report Date') OR 'null'",
//           "status_flag": "Mapped CSV Column Name (e.g., 'Status') OR 'null'",
//           "category": "Mapped CSV Column Name (e.g., 'Category') OR 'null'"
//         },
//         "status_logic_function": "function calculateStatus(value, normalLow, normalHigh, rawStatusFlag) { /* ...logic... */ }"
//       }
//     `;
//     // 5️⃣ Call OpenAI API for column mapping and status logic
//     const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${OPEN_AI_KEY}`,
//       },
//       body: JSON.stringify({
//         model: "gpt-4o",
//         messages: [
//           {
//             role: "user",
//             content: aiPrompt,
//           },
//         ],
//         temperature: 0.2,
//         response_format: {
//           type: "json_object",
//         },
//       }),
//     });
//     if (!aiRes.ok) {
//       const errorText = await aiRes.text();
//       console.error("OpenAI API call failed:", aiRes.status, errorText);
//       return new Response(
//         JSON.stringify({
//           error: "Failed to get column mapping from AI API",
//           detail: errorText,
//         }),
//         {
//           status: 500,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     const aiJson = await aiRes.json();
//     console.log(
//       "AI Raw Response (Parsed JSON):",
//       JSON.stringify(aiJson, null, 2),
//     );
//     if (
//       !aiJson ||
//       !aiJson.choices ||
//       aiJson.choices.length === 0 ||
//       !aiJson.choices[0].message ||
//       !aiJson.choices[0].message.content
//     ) {
//       console.error("Unexpected or empty AI response structure:", aiJson);
//       return new Response(
//         JSON.stringify({
//           error:
//             "AI response did not contain expected content (choices[0].message.content).",
//           detail: aiJson.error
//             ? aiJson.error.message
//             : "No valid content or error message from AI.",
//         }),
//         {
//           status: 500,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     let aiContent;
//     try {
//       aiContent = JSON.parse(aiJson.choices[0].message.content);
//     } catch (parseError) {
//       console.error(
//         "Failed to parse AI message content as JSON:",
//         parseError,
//         aiJson.choices[0].message.content,
//       );
//       return new Response(
//         JSON.stringify({
//           error: "AI returned invalid JSON content.",
//           detail: "Check AI response format. " + parseError.message,
//         }),
//         {
//           status: 500,
//           headers: CORS_HEADERS,
//         },
//       );
//     }
//     const columnMapping = aiContent.column_mapping;
//     const calculateStatusAI = eval(`(${aiContent.status_logic_function})`); // WARNING: Eval is risky!

//     const categoryCache = new Map();
//     const panelCache = new Map();
//     const markerCache = new Map();

//     // 6️⃣ Process each row from the CSV
//     for (const row of rows) {
//       // --- Handle Category (if mapped) ---
//       const categoryName =
//         columnMapping.category && row[columnMapping.category]
//           ? row[columnMapping.category].trim()
//           : "General";
//       let category_id;

//       if (categoryCache.has(categoryName)) {
//         category_id = categoryCache.get(categoryName);
//       } else {
//         const catLookupRes = await fetch(
//           `${SUPABASE_URL}/rest/v1/product_categories?select=id&name=eq.${encodeURIComponent(
//             categoryName
//           )}`,
//           {
//             headers: {
//               Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//               apikey: SERVICE_ROLE_KEY,
//             },
//           }
//         );
//         const catExisting = await catLookupRes.json();

//         if (
//           catLookupRes.ok &&
//           Array.isArray(catExisting) &&
//           catExisting.length > 0
//         ) {
//           category_id = catExisting[0].id;
//         } else {
//           const catCreateRes = await fetch(
//             `${SUPABASE_URL}/rest/v1/product_categories`,
//             {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//                 apikey: SERVICE_ROLE_KEY,
//                 "Content-Type": "application/json",
//                 Prefer: "return=representation",
//               },
//               body: JSON.stringify({
//                 name: categoryName,
//                 description: `Auto-created from CSV upload for file: ${file.name}`,
//               }),
//             }
//           );
//           if (!catCreateRes.ok) {
//             console.error(
//               "Error creating category:",
//               await catCreateRes.text()
//             );
//             continue;
//           }
//           const createdCategory = await catCreateRes.json();
//           category_id = createdCategory[0].id;
//         }
//         categoryCache.set(categoryName, category_id);
//       }

//       // --- Handle Panel ---
//       const panelName =
//         columnMapping.panel_name && row[columnMapping.panel_name]
//           ? row[columnMapping.panel_name].trim()
//           : "Default Panel";
//       let panel_id;

//       if (panelCache.has(panelName)) {
//         panel_id = panelCache.get(panelName);
//       } else {
//         const panelLookupRes = await fetch(
//           `${SUPABASE_URL}/rest/v1/panels?select=id&name=eq.${encodeURIComponent(
//             panelName
//           )}`,
//           {
//             headers: {
//               Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//               apikey: SERVICE_ROLE_KEY,
//             },
//           }
//         );
//         const panelExisting = await panelLookupRes.json();

//         if (
//           panelLookupRes.ok &&
//           Array.isArray(panelExisting) &&
//           panelExisting.length > 0
//         ) {
//           panel_id = panelExisting[0].id;
//         } else {
//           const panelCreateRes = await fetch(`${SUPABASE_URL}/rest/v1/panels`, {
//             method: "POST",
//             headers: {
//               Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//               apikey: SERVICE_ROLE_KEY,
//               "Content-Type": "application/json",
//               Prefer: "return=representation",
//             },
//             body: JSON.stringify({
//               name: panelName,
//               description: `Auto-generated panel for ${panelName} from CSV upload.`,
//               category_id: category_id,
//             }),
//           });
//           if (!panelCreateRes.ok) {
//             console.error("Error creating panel:", await panelCreateRes.text());
//             continue;
//           }
//           const createdPanel = await panelCreateRes.json();
//           panel_id = createdPanel[0].id;
//         }
//         panelCache.set(panelName, panel_id);
//       }

//       // --- Extract Marker Details ---
//       const markerName =
//         columnMapping.marker_name && row[columnMapping.marker_name]
//           ? row[columnMapping.marker_name].trim()
//           : "Unknown Marker";
//       // AI is now expected to provide marker_unit, normal_low, normal_high directly in mapping if inferred
//       const markerUnit =
//         columnMapping.marker_unit && row[columnMapping.marker_unit]
//           ? row[columnMapping.marker_unit].trim()
//           : columnMapping.marker_unit === "null"
//           ? ""
//           : columnMapping.marker_unit; // Use AI-inferred if column_mapping is a direct value

//       const rawNormalRangeText =
//         columnMapping.normal_range_text && row[columnMapping.normal_range_text]
//           ? row[columnMapping.normal_range_text].trim()
//           : "";

//       let normal_low: number | null = null;
//       let normal_high: number | null = null;

//       // Prioritize AI-inferred normal_low/high if they are directly provided in columnMapping (i.e. not column names)
//       if (
//         typeof columnMapping.normal_low === "number" ||
//         (typeof columnMapping.normal_low === "string" &&
//           columnMapping.normal_low !== "null")
//       ) {
//         normal_low = parseFloat(columnMapping.normal_low);
//       } else if (rawNormalRangeText) {
//         const rangeMatch = rawNormalRangeText.match(
//           /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/
//         );
//         const lessThanMatch = rawNormalRangeText.match(/<\s*(\d+\.?\d*)/);
//         const greaterThanMatch = rawNormalRangeText.match(/>\s*(\d+\.?\d*)/);

//         if (rangeMatch) {
//           normal_low = parseFloat(rangeMatch[1]);
//           normal_high = parseFloat(rangeMatch[2]);
//         } else if (lessThanMatch) {
//           normal_high = parseFloat(lessThanMatch[1]);
//         } else if (greaterThanMatch) {
//           normal_low = parseFloat(greaterThanMatch[1]);
//         }
//       }

//       if (
//         typeof columnMapping.normal_high === "number" ||
//         (typeof columnMapping.normal_high === "string" &&
//           columnMapping.normal_high !== "null")
//       ) {
//         normal_high = parseFloat(columnMapping.normal_high);
//       } else if (rawNormalRangeText) {
//         // Re-parse if not explicitly mapped by AI, and rawNormalRangeText is available
//         const rangeMatch = rawNormalRangeText.match(
//           /(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/
//         );
//         const lessThanMatch = rawNormalRangeText.match(/<\s*(\d+\.?\d*)/);
//         const greaterThanMatch = rawNormalRangeText.match(/>\s*(\d+\.?\d*)/);

//         if (rangeMatch) {
//           normal_low = parseFloat(rangeMatch[1]); // Need to re-extract both if parsing from text again
//           normal_high = parseFloat(rangeMatch[2]);
//         } else if (lessThanMatch) {
//           normal_high = parseFloat(lessThanMatch[1]);
//         } else if (greaterThanMatch) {
//           normal_low = parseFloat(greaterThanMatch[1]);
//         }
//       }

//       // Construct a unique key for marker (panel_id is crucial for uniqueness along with other attributes)
//       const uniqueMarkerKey = `${panel_id}-${markerName}-${markerUnit}-${
//         normal_low ?? "null"
//       }-${normal_high ?? "null"}`;
//       let marker_id;

//       if (markerCache.has(uniqueMarkerKey)) {
//         marker_id = markerCache.get(uniqueMarkerKey);
//       } else {
//         let markerLookupUrl = `${SUPABASE_URL}/rest/v1/markers?select=id&marker=eq.${encodeURIComponent(
//           markerName
//         )}&unit=eq.${encodeURIComponent(markerUnit)}&panel_id=eq.${panel_id}`;

//         // Handle nulls for normal_low and normal_high in URL query parameters
//         if (normal_low !== null) {
//           markerLookupUrl += `&normal_low=eq.${normal_low}`;
//         } else {
//           markerLookupUrl += `&normal_low=is.null`;
//         }
//         if (normal_high !== null) {
//           markerLookupUrl += `&normal_high=eq.${normal_high}`;
//         } else {
//           markerLookupUrl += `&normal_high=is.null`;
//         }

//         const markerLookupRes = await fetch(markerLookupUrl, {
//           headers: {
//             Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//             apikey: SERVICE_ROLE_KEY,
//           },
//         });
//         const existingMarker = await markerLookupRes.json();

//         if (
//           markerLookupRes.ok &&
//           Array.isArray(existingMarker) &&
//           existingMarker.length > 0
//         ) {
//           marker_id = existingMarker[0].id;
//         } else {
//           console.log(
//             `DEBUG: Creating new marker for ${markerName} (Key: ${uniqueMarkerKey}) under panel ${panelName}`
//           );
//           const createMarkerRes = await fetch(
//             `${SUPABASE_URL}/rest/v1/markers`,
//             {
//               method: "POST",
//               headers: {
//                 Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//                 apikey: SERVICE_ROLE_KEY,
//                 "Content-Type": "application/json",
//                 Prefer: "return=representation",
//               },
//               body: JSON.stringify({
//                 panel_id,
//                 marker: markerName,
//                 unit: markerUnit,
//                 normal_low: normal_low,
//                 normal_high: normal_high,
//               }),
//             }
//           );
//           if (!createMarkerRes.ok) {
//             console.error(
//               "Error creating marker:",
//               await createMarkerRes.text()
//             );
//             continue;
//           }
//           const createdMarker = await createMarkerRes.json();
//           marker_id = createdMarker[0].id;
//         }
//         markerCache.set(uniqueMarkerKey, marker_id);
//       }

//       // --- Insert into patient_marker_values table ---
//       const markerValue = parseFloat(
//         row[columnMapping.marker_value || ""] || "0",
//       );
//       const rawStatusFlag =
//         columnMapping.status_flag && row[columnMapping.status_flag]
//           ? row[columnMapping.status_flag]
//           : "normal";
//       let finalStatus;
//       try {
//         finalStatus = calculateStatusAI(
//           markerValue,
//           normal_low,
//           normal_high,
//           rawStatusFlag,
//         );
//       } catch (e) {
//         console.warn(
//           "AI status calculation failed or invalid, falling back to heuristic:",
//           e,
//         );
//         finalStatus = getMarkerStatusFallback(
//           markerValue,
//           normal_low,
//           normal_high,
//           rawStatusFlag,
//         );
//       }
//       finalStatus = finalStatus || "normal";
//       const collectionDateStr =
//         columnMapping.collection_date && row[columnMapping.collection_date]
//           ? row[columnMapping.collection_date]
//           : null;
//       const reportedDateStr =
//         columnMapping.report_date && row[columnMapping.report_date]
//           ? row[columnMapping.report_date]
//           : null;
//       const patientMarkerPayload = {
//         csvfile_id,
//         user_id: client_user_id,
//         marker_id,
//         col_date: collectionDateStr
//           ? new Date(collectionDateStr).toISOString().split("T")[0]
//           : new Date().toISOString().split("T")[0],
//         rep_date: reportedDateStr
//           ? new Date(reportedDateStr).toISOString().split("T")[0]
//           : new Date().toISOString().split("T")[0],
//         value: markerValue,
//         status: finalStatus,
//       };
//       const insertPatientMarkerRes = await fetch(
//         `${SUPABASE_URL}/rest/v1/patient_marker_values`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
//             apikey: SERVICE_ROLE_KEY,
//             "Content-Type": "application/json",
//             Prefer: "return=minimal",
//           },
//           body: JSON.stringify(patientMarkerPayload),
//         },
//       );
//       if (!insertPatientMarkerRes.ok) {
//         const detail = await insertPatientMarkerRes.text();
//         console.error(
//           "Patient marker value insert failed for payload:",
//           patientMarkerPayload,
//           "Detail:",
//           detail,
//         );
//       }
//     }
//     return new Response(
//       JSON.stringify({
//         message: "File uploaded and data processed successfully!",
//         csvfile_id: csvfile_id,
//       }),
//       {
//         status: 201,
//         headers: CORS_HEADERS,
//       },
//     );
//   } catch (err) {
//     console.error("Unexpected error in upload-csv function:", err);
//     return new Response(
//       JSON.stringify({
//         error: "Internal Server Error",
//         detail: err.message,
//       }),
//       {
//         status: 500,
//         headers: CORS_HEADERS,
//       },
//     );
//   }
// });
