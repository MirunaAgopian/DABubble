import { Component } from '@angular/core';
import { Input } from '../../shared/components/input/input';


@Component({
  selector: 'app-sign-in',
  imports: [Input],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {}
