import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;

  if (!value) return null;

  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const hasMinLength = value.length >= 8;

  const isValid = hasUppercase && hasLowercase && hasNumber && hasSymbol && hasMinLength;

  return isValid ? null : { strongPassword: true };
}



