import { Component, input, signal } from '@angular/core';
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
  showError = false;

  onBlur(event: FocusEvent) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.showError = value === '';
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.showError = false;
    //add formControl later!! for e-mail validation
  }
}
