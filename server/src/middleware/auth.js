import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing authorization token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "change_this_demo_secret");
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Demo mode: for the SIH prototype, the Authority routes are usable
// without login so judges can walk straight into the dashboard. Set
// REQUIRE_AUTH=true in the environment to enforce requireAuth instead.
export function optionalAuth(req, res, next) {
  if (process.env.REQUIRE_AUTH === "true") return requireAuth(req, res, next);
  next();
}
