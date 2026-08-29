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
  addMembers = output<{ name: string; description: string }>();

  closeClicked() {
    this.close.emit();
  }

  async onSubmit() {
    if (!this.prepareAndValidate()) return;
    const { name, description } = this.form.value;

    if (await this.checkDuplicateName(name!)) return;
    this.addMembers.emit({
      name: name!,
      description: description ?? '',
    });
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

  ngOnInit() {
    this.form.controls.name.valueChanges.subscribe((name) => {
      this.checkDuplicateName(name ?? '');
    });
  }
}
