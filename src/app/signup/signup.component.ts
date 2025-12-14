import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  message: string = '';
  messageType: 'success' | 'error' = 'error';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
      return;
    }

    this.initializeForm();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      employeeId: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.message = '';

      const signupData = {
        employeeId: this.signupForm.value.employeeId,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        confirmPassword: this.signupForm.value.confirmPassword
      };

      const result = this.authService.signup(signupData);
      
      this.message = result.message;
      this.messageType = result.success ? 'success' : 'error';
      this.isLoading = false;

      if (result.success) {
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      }
    } else {
      this.markFormGroupTouched(this.signupForm);
      this.message = 'Please fill all required fields correctly.';
      this.messageType = 'error';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.signupForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      if (controlName === 'password') {
        return 'Password must be at least 6 characters';
      }
      if (controlName === 'employeeId') {
        return 'Employee ID must be at least 3 characters';
      }
    }
    // Check form-level password mismatch error
    if (controlName === 'confirmPassword' && this.signupForm.hasError('passwordMismatch') && control?.touched) {
      return 'Passwords do not match';
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      employeeId: 'Employee ID',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    if (controlName === 'confirmPassword' && this.signupForm.hasError('passwordMismatch') && control?.touched) {
      return true;
    }
    return !!(control && control.invalid && control.touched);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

