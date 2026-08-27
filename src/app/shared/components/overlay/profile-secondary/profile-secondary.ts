import { Component, input, output} from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-profile-secondary',
  imports: [NgClass],
  templateUrl: './profile-secondary.html',
  styleUrl: './profile-secondary.scss',
})
export class ProfileSecondary {
  user = input<User | null | undefined>(null);
  close = output();

  onClick(){
    this.close.emit()
  }
}
