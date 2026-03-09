import express from "express";
import { OAuth2Client } from "google-auth-library";
import { authService } from "../services";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await authService.register(username, email, password);
    res.json(user);
  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(400).json({ error: "Username or email already exists" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await authService.login(username, password);
    if (user) {
      res.cookie("session_id", user.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000
      });
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("session_id", { httpOnly: true, secure: true, sameSite: "none" });
  res.json({ success: true });
});

router.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const success = await authService.resetPassword(email, newPassword);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err: any) {
    res.status(500).json({ error: "Reset failed" });
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

    const user = await authService.handleGoogleAuth({ sub: userInfo.sub, email: userInfo.email });

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
