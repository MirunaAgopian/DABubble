import { Component, inject, output, ViewChild, ElementRef } from '@angular/core';
import { ChatHeaderDm } from '../chat-header/chat-header-dm/chat-header-dm';
import { ChatHeaderGroup } from '../chat-header/chat-header-group/chat-header-group';
import { ChatHeaderNewMessage } from '../chat-header/chat-header-new-message/chat-header-new-message';
import { ChatMessages } from '../chat-messages/chat-messages';
import { ChatInput } from '../chat-input/chat-input';
import { User } from '../../../../core/interfaces/user.interface';
import { Channel } from '../../../../core/interfaces/channel.interface';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { OverlayTrigger } from '../../../../core/interfaces/overlay-trigger.interface';

/**
 * Main chat container that coordinates chat headers,
 * messages and input areas while forwarding events
 * to the workspace component.
 */
@Component({
  selector: 'app-chat-shell',
  imports: [ChatHeaderDm, ChatHeaderGroup, ChatHeaderNewMessage, ChatMessages, ChatInput],
  templateUrl: './chat-shell.html',
  styleUrl: './chat-shell.scss',
})
export class ChatShell {
  openOverlayUser = output<User>();
  openOverlayView = output<OverlayTrigger>();
  openChannelDetails = output<Channel | null>();
  chatState = inject(ChatStateService);
  @ViewChild('chatMessagesContainer')
  chatMessagesContainer!: ElementRef<HTMLDivElement>;

  /**
   * Emits a selected user event to open the corresponding user-profile overlay.
   * @param user Selected user.
   */
  onOpenOverlayUser(user: User) {
    this.openOverlayUser.emit(user);
  }

  /**
   * Emits a request to open an anchored overlay.
   * @param trigger Overlay configuration and anchor data.
   */
  onOpenOverlayView(trigger: OverlayTrigger) {
    this.openOverlayView.emit(trigger);
  }

  /**
   * Emits a request to display channel details.
   * @param channel Selected channel.
   */
  onOpenChannelDetails(channel: Channel | null) {
    this.openChannelDetails.emit(channel);
  }

  /**
   * Scrolls the message container to the latest message.
   */
  scrollToBottom() {
    setTimeout(() => {
      this.chatMessagesContainer.nativeElement.scrollTop =
        this.chatMessagesContainer.nativeElement.scrollHeight;
    });
  }
}
