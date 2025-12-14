import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
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
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.message = '';

      const credentials = {
        identifier: this.loginForm.value.identifier,
        password: this.loginForm.value.password
      };

      const result = this.authService.login(credentials);
      
      this.message = result.message;
      this.messageType = result.success ? 'success' : 'error';
      this.isLoading = false;

      if (result.success) {
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      }
    } else {
      this.markFormGroupTouched(this.loginForm);
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
    const control = this.loginForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      identifier: 'Employee ID / Email',
      password: 'Password'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  navigateToSignup(): void {
    this.router.navigate(['/signup']);
  }
}

