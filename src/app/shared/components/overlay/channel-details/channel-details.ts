import { Component, output, input, inject } from '@angular/core';
import { Channel } from '../../../../core/interfaces/channel.interface';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../core/services/channel.service';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/interfaces/user.interface';

/**
 * Displays and manages channel information.
 *
 * Allows users to:
 * - View channel details
 * - Edit the channel name
 * - Edit the channel description
 * - Leave the channel
 *
 * Synchronizes channel updates with the shared chat state
 * to ensure changes are reflected immediately throughout
 * the workspace.
 */
@Component({
  selector: 'app-channel-details',
  imports: [FormsModule],
  templateUrl: './channel-details.html',
  styleUrl: './channel-details.scss',
})
export class ChannelDetails {
  close = output();
  channel = input<Channel | null>();
  channelService = inject(ChannelService);
  chatStateService = inject(ChatStateService);
  userService = inject(UserService);
  isEditingName = false;
  editedName = '';
  isEditingDescription = false;
  editedDescription = '';

  /**
   * Closes the channel details dialog.
   */
  onClose() {
    this.close.emit();
  }

  /**
   * Updates the channel name and syncronizes the
   * currently selected channel in the shared chat state
   *
   * This ensures the updated name is reflected immediately
   * across all components that consume the selected channel.
   */
  async saveName() {
    this.isEditingName = false;
    if (!this.channel()) return;
    await this.channelService.updateChannelData(
      this.channel()!.id,
      this.editedName.trim(),
      this.channel()!.description ?? '',
    );

    this.chatStateService.selectedChannel.set({
      ...this.channel()!,
      name: this.editedName.trim(),
    });
  }

  /**
   * Updates the channel name and syncronizes the
   * currently selected channel in the shared chat state
   *
   * This ensures that the updated descrition is reflected immediately
   * throught the workspace
   */
  async saveDescription() {
    this.isEditingDescription = false;
    if (!this.channel()) return;
    await this.channelService.updateChannelData(
      this.channel()!.id,
      this.channel()!.name,
      this.editedDescription.trim(),
    );

    this.chatStateService.selectedChannel.set({
      ...this.channel()!,
      description: this.editedDescription.trim(),
    });
  }

  /**
   * Removes the current user from the channel and
   * closes the channel details dialog.
   */
  async leaveChannel() {
    const channel = this.channel();
    const user = this.userService.authService.getCurrentUserId();
    if (!user) return;
    await this.channelService.removeMember(channel!.id, { id: user } as User);
    this.close.emit();
  }
}
