// Returns the OTP the server logged for phoneNumber outside production, or
// undefined. logSpy is a vi.spyOn(console, "log").
export function loggedCode(logSpy, phoneNumber) {
  for (const args of logSpy.mock.calls) {
    const line = args.join(" ");
    if (!line.includes(phoneNumber)) continue;
    const match = line.match(/\b\d{6}\b/);
    if (match) return match[0];
  }
  return undefined;
}
