/**
 * Get initials from a full name
 * @param name Full name of the user
 * @returns Initials (e.g., "Max Var" -> "MV")
 */
export const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return '?';

    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';

    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }

    const firstInitial = parts[0].charAt(0).toUpperCase();
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
};
