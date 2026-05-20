/**
 * Chilean RUT (Rol Único Tributario) validator.
 * Validates format and verification digit using modulo 11 algorithm.
 *
 * Accepted formats: 12345678-9, 12.345.678-9
 * The verification digit can be 0-9 or K/k.
 */

/**
 * Cleans a RUT string removing dots and dashes, returns uppercase.
 * Example: "12.345.678-9" → "123456789"
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[.\-]/g, '').toUpperCase();
}

/**
 * Formats a clean RUT string to standard format: XX.XXX.XXX-V
 */
export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return rut;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${verifier}`;
}

/**
 * Calculates the verification digit for a RUT body using modulo 11.
 * @param body - The numeric body of the RUT (without verification digit)
 * @returns The expected verification digit as string ('0'-'9' or 'K')
 */
export function calculateRutVerifier(body: string): string {
  const digits = body.replace(/\D/g, '');
  let sum = 0;
  let multiplier = 2;

  for (let i = digits.length - 1; i >= 0; i--) {
    sum += parseInt(digits[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) return '0';
  if (remainder === 10) return 'K';
  return remainder.toString();
}

/**
 * Validates a Chilean RUT string (format + verification digit).
 * @param rut - The RUT to validate (e.g., "12.345.678-9" or "12345678-9")
 * @returns true if the RUT is valid
 */
export function isValidRut(rut: string): boolean {
  if (!rut || typeof rut !== 'string') return false;

  const cleaned = cleanRut(rut);

  // Must be 8-9 chars (7-8 digit body + 1 verifier)
  if (cleaned.length < 8 || cleaned.length > 9) return false;

  const body = cleaned.slice(0, -1);
  const verifier = cleaned.slice(-1);

  // Body must be all digits
  if (!/^\d+$/.test(body)) return false;

  // Verifier must be digit or K
  if (!/^[\dK]$/.test(verifier)) return false;

  return calculateRutVerifier(body) === verifier;
}
