export const hasAccess = (userRoles, allowedRoles) => {
  if (!userRoles) return false;

  const roles = Array.isArray(userRoles) ? userRoles : [userRoles];

  return roles.some((role) => allowedRoles.includes(role));
};
