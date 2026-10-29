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

  onOpenOverlayUser(user: User) {
    this.openOverlayUser.emit(user);
  }

  onOpenOverlayView(trigger: OverlayTrigger) {
    this.openOverlayView.emit(trigger);
  }

  onOpenChannelDetails(channel: Channel | null) {
    this.openChannelDetails.emit(channel);
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessagesContainer.nativeElement.scrollTop =
        this.chatMessagesContainer.nativeElement.scrollHeight;
    });
  }
}
