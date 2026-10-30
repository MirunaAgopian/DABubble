import { Component, input, output, signal } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

/**
 * Allows a user to update their profile name.
 *
 * Provides a simple editing workflow and emits
 * profile update actions to the parent overlay.
 */
@Component({
  selector: 'app-edit-profile',
  imports: [],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile {
  user = input<User | null>();
  clicked = output<void>();
  name = signal('');
  save = output<string>();

  onClick() {
    this.clicked.emit();
  }

  /**
   * Returns to the previous profile view.
   */
  onSave() {
    this.save.emit(this.name());
  }
}
