import { Component, input, output, signal } from '@angular/core';
import { InputIcon } from '../input-icon/input-icon';


@Component({
  selector: 'app-input',
  imports: [InputIcon],
  templateUrl: './input.html',
  styleUrl: './input.scss',
})
export class Input {
  type = input<string>();
  placeholder = input<string>();
  valueChange = output<string>();
  showError = false;

  onBlur(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.showError = value === '';
    this.valueChange.emit(value);
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.showError = false;
    this.valueChange.emit(value);
  }
}
