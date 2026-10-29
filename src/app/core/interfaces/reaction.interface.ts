/**
 * Represents a reaction attached to a
 * message or a thread reply.
 */

export interface Reaction {
  emoji: string;
  userIds: string[];
}
