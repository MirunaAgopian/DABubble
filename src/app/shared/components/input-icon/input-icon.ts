import { Component, input } from '@angular/core';

@Component({
  selector: 'app-input-icon',
  imports: [],
  templateUrl: './input-icon.html',
  styleUrl: './input-icon.scss',
})
export class InputIcon {
  type = input<string>();
}
