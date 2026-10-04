import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { Channel } from '../interfaces/channel.interface';
import { ChannelService } from './channel.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  mode = signal<'new' | 'dm' | 'self' | 'channel'>('new');
  selectedUser = signal<User | null>(null);
  selectedChannel = signal<Channel | null>(null);
  showSendTo = signal(false);
  mentionSomeone = signal<'user' | 'channel' | 'email' | null>(null);
  channelService = inject(ChannelService);
  private channelSubscription?: Subscription;

  openDM(user: User) {
    this.mode.set('dm');
    this.selectedUser.set(user);
    this.selectedChannel.set(null);
  }

  openSelf(user: User) {
    this.mode.set('self');
    this.selectedUser.set(user);
    this.selectedChannel.set(null);
  }

  openChannel(channel: Channel) {
    this.channelSubscription?.unsubscribe();
    this.mode.set('channel');
    this.selectedUser.set(null);
    this.channelSubscription = this.channelService
      .fetchChannelById(channel.id)
      .subscribe((updatedChannel) => {
        this.selectedChannel.set(updatedChannel);
      });
  }

  startNewMessage() {
    this.mode.set('new');
    this.selectedUser.set(null);
    this.selectedChannel.set(null);
  }

  placeholder = computed(() => {
    switch (this.mode()) {
      case 'dm':
        return `Nachricht an @${this.selectedUser()?.name}`;
      case 'self':
        return 'Notiz an dich selbst…';
      case 'channel':
        return `Nachricht an #${this.selectedChannel()?.name}`;
      case 'new':
        return 'Starte eine neue Nachricht';
      default:
        return '';
    }
  });

  toggleSendTo(show: boolean) {
    this.showSendTo.set(show);
  }

  setMentionedEntity(mode: 'user' | 'channel' | 'email' | null) {
    this.mentionSomeone.set(mode);
  }
}
