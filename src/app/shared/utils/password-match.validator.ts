import { AbstractControl } from '@angular/forms';

export function passwordsMatchValidator(form: AbstractControl) {
  const password = form.get('password')?.value;
  const confirm = form.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordsMismatch: true };
}
