import { Component, input } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-edit-profile',
  imports: [],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile {
  user = input<User | null>();
}
