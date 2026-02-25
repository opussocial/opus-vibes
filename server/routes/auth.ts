import express from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db";

const router = express.Router();

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
    const result = db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run(username, email, hashedPassword, viewerRole.id);
    res.json({ id: result.lastInsertRowid, username, email });
  } catch (err: any) {
    res.status(400).json({ error: "Username or email already exists" });
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (user && bcrypt.compareSync(password, user.password)) {
    res.cookie("session_id", user.id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });
    res.json({ id: user.id, username: user.username, email: user.email });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("session_id", { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ success: true });
});

router.post("/reset-password", (req, res) => {
  const { email, newPassword } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  if (user) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, user.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

// Google OAuth
const getGoogleClient = (req: any) => {
  const origin = req.get('origin') || process.env.APP_URL || `http://localhost:3000`;
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${origin}/api/auth/google/callback`
  );
};

router.get("/google/url", (req, res) => {
  const client = getGoogleClient(req);
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
  });
  res.json({ url });
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Code missing");

  try {
    const client = getGoogleClient(req);
    const { tokens } = await client.getToken(code as string);
    client.setCredentials(tokens);

    const userInfoRes = await client.request({ url: "https://www.googleapis.com/oauth2/v3/userinfo" }) as any;
    const userInfo = userInfoRes.data;

    let user = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(userInfo.sub, userInfo.email) as any;

    if (!user) {
      const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
      const username = userInfo.email.split("@")[0] + "_" + Math.random().toString(36).substring(7);
      const result = db.prepare("INSERT INTO users (username, email, google_id, role_id) VALUES (?, ?, ?, ?)").run(
        username, userInfo.email, userInfo.sub, viewerRole.id
      );
      user = { id: result.lastInsertRowid, username, email: userInfo.email };
    } else if (!user.google_id) {
      db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(userInfo.sub, user.id);
    }

    res.cookie("session_id", user.id.toString(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(500).send("Authentication failed");
  }
});

export default router;
