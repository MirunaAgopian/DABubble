import { Component, input } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

/**
 * Displays the current user's profile information.
 */
@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  user = input<User | null>();
}
