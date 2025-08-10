export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*/.test(error.message);
}

export function getAuthToken(): string | null {
  return localStorage.getItem("fokushub_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("fokushub_token", token);
}

export function removeAuthToken(): void {
  localStorage.removeItem("fokushub_token");
}
