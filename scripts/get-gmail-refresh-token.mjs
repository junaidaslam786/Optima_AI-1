#!/usr/bin/env node
/*
Generates a Gmail OAuth2 refresh token using googleapis.

Usage (PowerShell):
  node scripts/get-gmail-refresh-token.mjs \
    --client-id "<GMAIL_CLIENT_ID>" \
    --client-secret "<GMAIL_CLIENT_SECRET>" \
    --sender "you@gmail.com" \
    [--scope https://mail.google.com/]

It opens a browser to sign in and prints the refresh token.
*/

import http from "http";
import { URL } from "url";
import open from "open";
import { google } from "googleapis";
import dotenv from "dotenv";

// Load local env if present
dotenv.config({ path: ".env.local" });

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { scope: "https://mail.google.com/" };

  // Flags style
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const v = args[i + 1];
    if (a === "--client-id") opts.clientId = v;
    if (a === "--client-secret") opts.clientSecret = v;
    if (a === "--scope") opts.scope = v;
    if (a === "--sender") opts.sender = v;
  }

  // Positional fallback: node script.mjs <clientId> <clientSecret> [sender]
  if (!opts.clientId && args[0] && !args[0].startsWith("--")) opts.clientId = args[0];
  if (!opts.clientSecret && args[1] && !args[1].startsWith("--")) opts.clientSecret = args[1];
  if (!opts.sender && args[2] && !args[2].startsWith("--")) opts.sender = args[2];

  // ENV fallback
  if (!opts.clientId) opts.clientId = process.env.GMAIL_CLIENT_ID;
  if (!opts.clientSecret) opts.clientSecret = process.env.GMAIL_CLIENT_SECRET;
  if (!opts.sender) opts.sender = process.env.GMAIL_SENDER_EMAIL;

  if (!opts.clientId || !opts.clientSecret) {
    console.error("Missing client credentials. Provide via flags, positional args, or .env.local (GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET).");
    process.exit(1);
  }
  return opts;
}

async function main() {
  const opts = parseArgs();
  const PORT = 53210; // arbitrary free port
  const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

  const oAuth2Client = new google.auth.OAuth2(
    opts.clientId,
    opts.clientSecret,
    REDIRECT_URI
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [opts.scope],
  });

  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) return;
      const url = new URL(req.url, `http://localhost:${PORT}`);
      if (url.pathname !== "/oauth2callback") {
        res.writeHead(404).end("Not found");
        return;
      }
      const code = url.searchParams.get("code");
      if (!code) {
        res.writeHead(400).end("Missing code param");
        return;
      }

      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);

      console.log("\nAccess Token:", tokens.access_token || "<none>");
      console.log("Refresh Token:", tokens.refresh_token || "<none>");
      console.log("Token Type:", tokens.token_type);
      console.log("Expiry Date:", tokens.expiry_date);
      if (opts.sender) {
        console.log("Sender Email:", opts.sender);
      }

      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("You can close this tab now. Refresh token printed in terminal.\n");

      setTimeout(() => server.close(), 500);
    } catch (e) {
      console.error("OAuth callback error:", e);
      res.writeHead(500).end("Error. Check terminal.");
      setTimeout(() => server.close(), 500);
    }
  });

  server.listen(PORT, async () => {
    console.log("\nOpening browser to authorize Gmail...\n");
    console.log("If browser does not open, visit this URL manually:\n", authUrl, "\n");
    await open(authUrl);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
