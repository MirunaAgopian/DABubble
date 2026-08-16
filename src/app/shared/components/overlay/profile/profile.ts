import { Component, input} from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  user = input<User| null>();
}
