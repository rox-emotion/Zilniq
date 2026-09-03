/**
 * In-memory draft for the chat input.
 *
 * Kept at module scope so the text survives navigating away from the chat
 * screen (which unmounts <ChatInput />) and back. It is intentionally NOT
 * persisted to disk, and must be cleared on sign-out so the next account
 * never sees the previous user's unsent text.
 */

let draft = '';

export function getChatDraft(): string {
  return draft;
}

export function setChatDraft(value: string): void {
  draft = value;
}

export function clearChatDraft(): void {
  draft = '';
}
