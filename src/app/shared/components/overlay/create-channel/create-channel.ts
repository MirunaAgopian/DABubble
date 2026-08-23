import { Component, output, inject, signal, input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChannelService } from '../../../../core/services/channel.service';
import { User } from '../../../../core/interfaces/user.interface';
import { ReactiveFormsModule } from '@angular/forms';

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

  closeClicked() {
    this.close.emit();
  }

  async onSubmit() {
    if (!this.prepareAndValidate()) return;
    const { name, description } = this.form.value;
    if (await this.checkDuplicateName(name!)) return;
    await this.createChannel(name!, description ?? '');
  }

  private prepareAndValidate(): boolean {
    this.nameExists.set(false);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    this.loading.set(true);
    return true;
  }

  async checkDuplicateName(name: string) {
  if (!name) {
    this.nameExists.set(false);
    return;
  }

  const exists = await this.channelService.isChannelNameTaken(name);
  this.nameExists.set(exists);
  return exists;
}


  private async createChannel(name: string, description: string) {
    if (!this.user()) return;
    await this.channelService.createChannel(name, this.user()!.id, this.user()!.name, description);

    this.loading.set(false);
    this.close.emit();
  }

  ngOnInit() {
    this.form.controls.name.valueChanges.subscribe((name) => {
      this.checkDuplicateName(name ?? '');
    });
  }
}
