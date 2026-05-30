import { useAuth } from "./useAuth";
import { canSeeSensitiveCommercials, verificarPermissaoUsuario } from "../utils/permissions";
import { Roles } from "../types";

export function usePermissions() {
  const { user } = useAuth();
  return {
    has: (permission: string) => verificarPermissaoUsuario(user, permission),
    canSeeSensitive: canSeeSensitiveCommercials(user),
    isAdmin: user?.role === Roles.Admin,
    user
  };
}
