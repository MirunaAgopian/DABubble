import { Component, output, input, inject } from '@angular/core';
import { Channel } from '../../../../core/interfaces/channel.interface';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../../../core/services/channel.service';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/interfaces/user.interface';

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

  onClose() {
    this.close.emit();
  }

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

  async leaveChannel() {
    const channel = this.channel();
    const user = this.userService.authService.getCurrentUserId();
    if (!user) return;

    await this.channelService.removeMember(channel!.id, { id: user } as User);
    this.chatStateService.selectedChannel.set(null);
    this.close.emit();
  }
}
