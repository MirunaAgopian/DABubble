import { Component, input, output } from '@angular/core';
import { InputIcon } from '../input-icon/input-icon';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input',
  imports: [InputIcon],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {
  type = input<string>();
  placeholder = input<string>();
  controls = input<FormControl>();
  valueChange = output<string>();
  showError = false;

  // onBlur(event: FocusEvent) {
  //   const value = (event.target as HTMLInputElement).value.trim();
  //   this.showError = value === '';
  //   this.valueChange.emit(value);
  // }

  // onInput(event: Event) {
  //   const value = (event.target as HTMLInputElement).value.trim();
  //   this.showError = false;
  //   this.valueChange.emit(value);
  // }

    onBlur(event: FocusEvent) {
      const value = (event.target as HTMLInputElement).value.trim();

      const control: any = this.controls();
      control?.markAsTouched(); // ✔ tells Angular the user interacted
      control?.updateValueAndValidity(); // ✔ triggers validators

      this.showError = control?.invalid; // ✔ use real validation state
      this.valueChange.emit(value);
    }

    onInput(event: Event) {
      const value = (event.target as HTMLInputElement).value.trim();

      const control:any = this.controls();
      control?.setValue(value);
      control?.updateValueAndValidity(); // ✔ re-run validators

      this.showError = control.invalid && control.touched; // ✔ correct UX
      this.valueChange.emit(value);
    }
}
