import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";

import { AuthService } from '../auth.service';
import { SignupRequest } from 'src/app/models/signup-request';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  signupRequest: SignupRequest;

  signupError: boolean;

  constructor(private auth: AuthService, private router: Router) {
    this.signupRequest = {
      firstName: undefined,
      lastName: undefined,
      userName: undefined,
      password: undefined,
    };
  }

  onSubmit(form: NgForm) {
    // Do not do anything if the form is invalid.
    if (form.invalid) {
      return;
    }

    // Hide any previous login error.
    this.signupError = false;

    // Perform the authentication request to the API.
    this.auth.signUp$(this.signupRequest).subscribe({
      next: () => this.router.navigateByUrl("/login"),
      error: (err) => {
        this.signupError = true;
        console.warn(`Registration failed: ${err.message}`);
      },
    });
  }
}
