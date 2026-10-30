import { Component, output, inject, signal, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelService } from '../../../../core/services/channel.service';
import { User } from '../../../../core/interfaces/user.interface';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * First step of the channel creation workflow.
 *
 * Collects and validates channel information before
 * continuing to member selection.
 *
 * Responsible for:
 * - Channel name validation
 * - Channel description input
 * - Duplicate name detection
 * - Forwarding valid channel data to the next step
 */
@Component({
  selector: 'app-create-channel',
  imports: [ReactiveFormsModule],
  templateUrl: './create-channel.html',
  styleUrl: './create-channel.scss',
})
export class CreateChannel {
  close = output<void>();
  user = input<User | null>();
  channelService = inject(ChannelService);
  nameExists = signal(false);
  loading = signal(false);
  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
    }),
    description: new FormControl('', {
      validators: [Validators.maxLength(200)],
    }),
  });
  addMembers = output<{ name: string; description: string }>();

  /**
   * Starts realtime validation for channel
   * name uniqueness as the user types.
   */
  ngOnInit() {
    this.form.controls.name.valueChanges.subscribe((name) => {
      this.checkDuplicateName(name ?? '');
    });
  }

  /**
   * Closes the channel creation dialog.
   */
  closeClicked() {
    this.close.emit();
  }

  /**
   * Validates the form, checks for duplicate
   * channel names and advances the channel
   * creation workflow when all requirements
   * are satisfied.
   */
  async onSubmit() {
    if (!this.prepareAndValidate()) return;
    const { name, description } = this.form.value;
    if (await this.checkDuplicateName(name!)) return;
    this.addMembers.emit({
      name: name!,
      description: description ?? '',
    });
  }

  /**
   * Prepares the form for submission and
   * validates all user input.
   *
   * Marks all controls as touched when
   * validation fails.
   */
  private prepareAndValidate(): boolean {
    this.nameExists.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    this.loading.set(true);
    return true;
  }

  /**
   * Checks whether a channel name is already
   * in use and updates the validation state.
   *
   * @param name Channel name to validate.
   */
  async checkDuplicateName(name: string) {
    if (!name) {
      this.nameExists.set(false);
      return;
    }
    const exists = await this.channelService.isChannelNameTaken(name);
    this.nameExists.set(exists);
    return exists;
  }
}
