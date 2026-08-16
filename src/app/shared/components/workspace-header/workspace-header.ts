import { Component, output, input } from '@angular/core';
import { InputIcon } from '../input-icon/input-icon';
import { User } from '../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-workspace-header',
  imports: [InputIcon, NgClass],
  templateUrl: './workspace-header.html',
  styleUrl: './workspace-header.scss',
})
export class WorkspaceHeader {
  user = input<User | null>();
  openOverlay = output<'profile' | 'edit-profile' | 'logout'>();
}
