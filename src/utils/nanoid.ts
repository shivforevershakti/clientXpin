/** Minimal dependency-free unique id generator (avoids pulling in a uuid package). */
export function nanoid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
