export function validateBookmarkTitle(title: string): void {
  if (title.trim().length === 0) {
    throw new Error("Bookmark title cannot be empty.");
  }
}

export function validateBookmarkUrl(url: string): void {
  try {
    new URL(url);
  } catch {
    throw new Error("Bookmark URL is invalid.");
  }
}