import { Component, ViewChild, ElementRef, ViewEncapsulation, HostListener } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-chat-input',
  imports: [PickerComponent],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChatInput {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('pickerContainer') pickerContainer!: ElementRef;
  @ViewChild('emojiButton') emojiButton!: ElementRef;
  emojiPickerOpen = false;

  addEmoji(event: any) {
    this.textarea.nativeElement.value += event.emoji.native;
    this.emojiPickerOpen = false;
  }

  toggleEmojiPicker() {
    this.emojiPickerOpen = !this.emojiPickerOpen;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.emojiPickerOpen) return;
    const clickedInsidePicker = this.pickerContainer?.nativeElement.contains(event.target);
    const clickedEmojiButton = this.emojiButton?.nativeElement.contains(event.target);
    if (!clickedInsidePicker && !clickedEmojiButton) {
      this.emojiPickerOpen = false;
    }
  }
}
