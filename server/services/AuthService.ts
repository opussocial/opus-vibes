import bcrypt from "bcryptjs";
import { db } from "../db";
import { slugify } from "../utils";
import { IAuthService } from "./interfaces";
import { User } from "../../src/types";

export class AuthService implements IAuthService {
  async ensureUserProfile(userId: number, username: string): Promise<number | null> {
    const user = db.prepare("SELECT profile_element_id FROM users WHERE id = ?").get(userId) as any;
    if (user && user.profile_element_id) return user.profile_element_id;

    const profileType = db.prepare("SELECT id FROM element_types WHERE slug = 'profile'").get() as any;
    if (!profileType) return null;

    const slug = slugify(username) + "-profile-" + userId;
    const result = db.prepare("INSERT INTO elements (name, slug, type_id) VALUES (?, ?, ?)").run(
      `${username}'s Profile`,
      slug,
      profileType.id
    );
    const profileId = result.lastInsertRowid as number;

    db.prepare("UPDATE users SET profile_element_id = ? WHERE id = ?").run(profileId, userId);
    
    // Initialize modular data
    db.prepare("INSERT INTO content (element_id, body) VALUES (?, ?)").run(profileId, "");
    db.prepare("INSERT INTO place (element_id) VALUES (?)").run(profileId);
    db.prepare("INSERT INTO file (element_id) VALUES (?)").run(profileId);

    return profileId;
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
    const result = db.prepare("INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)").run(username, email, hashedPassword, viewerRole.id);
    const userId = result.lastInsertRowid as number;
    
    await this.ensureUserProfile(userId, username);
    
    return { id: userId, username, email } as User;
  }

  async login(identifier: string, password: string): Promise<User | null> {
    const user = db.prepare("SELECT * FROM users WHERE username = ? OR email = ?").get(identifier, identifier) as any;
    if (user && user.password && bcrypt.compareSync(password, user.password)) {
      await this.ensureUserProfile(user.id, user.username);
      return { id: user.id, username: user.username, email: user.email } as User;
    }
    return null;
  }

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user) {
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, user.id);
      return true;
    }
    return false;
  }

  async handleGoogleAuth(userInfo: { sub: string, email: string }): Promise<User> {
    let user = db.prepare("SELECT * FROM users WHERE google_id = ? OR email = ?").get(userInfo.sub, userInfo.email) as any;

    if (!user) {
      const viewerRole = db.prepare("SELECT id FROM roles WHERE name = 'Viewer'").get() as any;
      const username = userInfo.email.split("@")[0] + "_" + Math.random().toString(36).substring(7);
      const result = db.prepare("INSERT INTO users (username, email, google_id, role_id) VALUES (?, ?, ?, ?)").run(
        username, userInfo.email, userInfo.sub, viewerRole.id
      );
      user = { id: result.lastInsertRowid, username, email: userInfo.email };
      await this.ensureUserProfile(user.id, username);
    } else {
      if (!user.google_id) {
        db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(userInfo.sub, user.id);
      }
      await this.ensureUserProfile(user.id, user.username);
    }
    return user as User;
  }
}
