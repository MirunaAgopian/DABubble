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

  onBlur(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value.trim();
    const control: any = this.controls();
    control?.markAsTouched();
    control?.updateValueAndValidity();
    this.showError = control?.invalid;
    this.valueChange.emit(value);
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    const control: any = this.controls();
    control?.setValue(value);
    control?.updateValueAndValidity();
    this.showError = control.invalid && control.touched;
    this.valueChange.emit(value);
  }
}
