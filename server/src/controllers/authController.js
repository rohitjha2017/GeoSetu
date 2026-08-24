import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Minimal in-memory demo auth so Authority Mode has a working login flow
// without requiring database/user-management setup. Not for production use.
const demoUsers = [
  {
    id: "u-1",
    name: "Demo Authority Officer",
    email: "officer@demo.bihar.gov.in",
    role: "authority",
    // password: "demo1234"
    passwordHash: "$2b$10$FMffFaSOvg5r74Ajlv8VwOXO/T5W54NOQDvpA3pE74sKe0t6Bevau"
  }
];

export async function login(req, res) {
  const { email, password } = req.body || {};
  const user = demoUsers.find((u) => u.email === email);
  const valid = user ? await bcrypt.compare(password || "", user.passwordHash) : false;

  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials. Use the demo account shown on the login screen." });
  }

  const token = jwt.sign(
    { sub: user.id, role: user.role, name: user.name },
    process.env.JWT_SECRET || "change_this_demo_secret",
    { expiresIn: "12h" }
  );
  res.json({ token, user: { name: user.name, role: user.role, email: user.email } });
}

export async function me(req, res) {
  res.json({ user: req.user || null });
}
