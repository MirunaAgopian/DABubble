import { Component, inject, input, output } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';
import { ChatStateService } from '../../../../core/services/chat-state.service';

/**
 * Displays information about another user and provides
 * actions related to that user.
 *
 * Allows starting a direct message conversation with
 * the selected user.
 */
@Component({
  selector: 'app-profile-secondary',
  imports: [NgClass],
  templateUrl: './profile-secondary.html',
  styleUrl: './profile-secondary.scss',
})
export class ProfileSecondary {
  user = input<User | null | undefined>(null);
  close = output();
  chatStateService = inject(ChatStateService);

  /**
   * Opens a direct message conversation with the
   * selected user and closes the overlay.
   */
  onClick() {
    const selectedUser = this.user();
    if (!selectedUser) return;
    this.chatStateService.openDM(selectedUser);
    this.close.emit();
  }
}
