import { calculateReputation } from "@/lib/domain/logic";
import { UserRole } from "@/lib/domain/types";

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";

  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return parseAdminEmails().includes(email.toLowerCase());
}

export function buildProfilePayload(user: {
  id: string;
  email?: string;
  created_at: string;
  user_metadata?: { full_name?: string; name?: string };
  app_metadata?: { provider?: string };
}) {
  const reputationScore = 0;
  const role: UserRole = isAdminEmail(user.email) ? "admin" : "active";

  return {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? "Utilizador",
    email: user.email ?? "",
    auth_provider: user.app_metadata?.provider ?? "email",
    reputation_score: reputationScore,
    reputation_weight: calculateReputation({ reputationScore }),
    role,
    created_at: user.created_at
  };
}
