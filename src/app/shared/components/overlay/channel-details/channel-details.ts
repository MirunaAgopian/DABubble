import { Component, output, input } from '@angular/core';
import { Channel } from '../../../../core/interfaces/channel.interface';

@Component({
  selector: 'app-channel-details',
  imports: [],
  templateUrl: './channel-details.html',
  styleUrl: './channel-details.scss',
})
export class ChannelDetails {
  close = output();
  channel = input<Channel | null>();

  onClose(){
    this.close.emit();
  }

  
}
