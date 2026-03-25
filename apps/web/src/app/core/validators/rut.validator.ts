import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isValidRut } from '@condominios/shared/validators/rut.validator';

/**
 * Angular form validator for Chilean RUT.
 * Returns null if valid, or { invalidRut: true } if invalid.
 * Only validates when the value is non-empty (use Validators.required separately).
 */
export function rutValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  return isValidRut(value) ? null : { invalidRut: true };
}
