import { Component } from '@angular/core';
import { Input } from '../../shared/components/input/input';
import { Footer } from '../../shared/components/footer/footer';


@Component({
  selector: 'app-sign-in',
  imports: [Input, Footer],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {}
