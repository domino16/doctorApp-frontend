import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Validation } from '../passwordValidators/validation';
import { StrongPasswordValidation } from '../passwordValidators/strongPasswordValidation';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/shared/models/user';
import { Store } from '@ngrx/store';
import { signUpStart } from '../store/auth.actions';
import { pageIsLoading } from 'src/app/shared/loading-spinner/store/loading-spinner.actions';
import { getLoadingSpinner } from 'src/app/shared/loading-spinner/store/loading-spinner.selector';
import {
  getErrorMessage,
} from 'src/app/shared/store/shared.selector';
import { Observable } from 'rxjs';
import { setCurrentChatUserStart } from 'src/app/shared/store/shared.actions';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  isLoading!: Observable<boolean>;
  authUser!: any;

  error!: Observable<string>;

  numberPattern = new RegExp('(?=.*[0-9])');
  uppercasePattern = new RegExp('(?=.*[A-Z])');
  lowercasePattern = new RegExp('(?=.*[a-z])');
  symbolsPattern = new RegExp('(?=.*[$@^!%*?&-.;:])');

  constructor(
    private store: Store
  ) {}

  signupForm: FormGroup = new FormGroup(
    {

      password: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          StrongPasswordValidation.patternValidator(this.numberPattern, {
            requiresnumber: true,
          }),
          StrongPasswordValidation.patternValidator(this.uppercasePattern, {
            requiresuppercase: true,
          }),
          StrongPasswordValidation.patternValidator(this.lowercasePattern, {
            requireslowercase: true,
          }),
          StrongPasswordValidation.patternValidator(this.symbolsPattern, {
            requiressymbol: true,
          }),
        ])
      ),
      firstname: new FormControl('', [Validators.required]),
      lastname: new FormControl('', [Validators.required]),
      repassword: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      acceptTerms: new FormControl(false, Validators.requiredTrue),
      ifDoctor: new FormControl(false)
    },
    Validation.match('password', 'repassword')
  );

  ngOnInit(): void {
    this.isLoading = this.store.select(getLoadingSpinner);

    this.error = this.store.select(getErrorMessage);
  }

  onSubmit() {
    if (!this.signupForm.valid) {
      return;
    } else {

      const email: string = this.signupForm.controls['email'].value;
      const password: string = this.signupForm.controls['password'].value;
      const defaultImgUrl: string =
        'https://cdn.pixabay.com/photo/2016/11/14/17/39/person-1824144__340.png';
      const ifDoctor: boolean = this.signupForm.controls['ifDoctor'].value;
      const firstName: string = this.signupForm.controls['firstname'].value;
      const lastName: string = this.signupForm.controls['lastname'].value;

      const user: User= {
        email: email,
        password: password,
        photoUrl: defaultImgUrl,
        firstName: firstName,
        lastName: lastName,
        doctor: ifDoctor,
        unReadChatsCounter: 0,
        visitNotificationsNumber: 0,
      };

      this.store.dispatch(pageIsLoading({ status: true }));
      this.store.dispatch(setCurrentChatUserStart());
      this.store.dispatch(signUpStart(user));
    }
  }
}
