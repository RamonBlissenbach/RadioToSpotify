import express from 'express';
import crypto from 'node:crypto';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
const SCOPES = 'playlist-read-private playlist-modify-private playlist-modify-public';

const verifier = crypto.randomBytes(32).toString('base64url');
const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');

const app = express();

if (!CLIENT_ID) throw new Error('SPOTIFY_CLIENT_ID fehlt');

app.get('/login', (req, res) => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: SCOPES
  });
  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

app.get('/callback', async (req, res) => {
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier
    })
  });
  const token = await tokenRes.json();
  console.log('Refresh Token:', token.refresh_token);
  res.send('Fertig, du kannst das Fenster schließen.');
});

app.listen(3000, () => console.log('http://127.0.0.1:3000/login'));