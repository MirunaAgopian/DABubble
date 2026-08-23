import { Component, output } from '@angular/core';

@Component({
  selector: 'app-create-channel',
  imports: [],
  templateUrl: './create-channel.html',
  styleUrl: './create-channel.scss',
})
export class CreateChannel {
  close = output<void>();

  closeClicked(){
    this.close.emit();
  }

  // ADD form controls for the inputs
  //disable button
  //control visibility of error messages!
}
