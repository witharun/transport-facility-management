import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { AuthService } from '../../services/auth.service';
import { VehicleType } from '../../models/ride.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-add-ride',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormInputComponent],
  templateUrl: './add-ride.component.html',
  styleUrls: ['./add-ride.component.css']
})
export class AddRideComponent implements OnInit {
  addRideForm!: FormGroup;
  vehicleTypes = Object.values(VehicleType);
  minTime: string = '';
  message: string = '';
  messageType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private rideService: RideService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.setCurrentTime();
    this.initializeForm();
    this.setEmployeeId();
    this.setupTimeValidation();
  }

  private setCurrentTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.minTime = `${hours}:${minutes}`;
  }

  private initializeForm(): void {
    this.addRideForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }, [Validators.required, this.uniqueEmployeeValidator.bind(this)]],
      vehicleType: ['', [Validators.required]],
      vehicleNo: ['', [Validators.required]],
      vacantSeats: ['', [Validators.required, Validators.min(1)]],
      time: ['', [Validators.required, this.minTimeValidator.bind(this)]],
      pickUpPoint: ['', [Validators.required]],
      destination: ['', [Validators.required]]
    });
  }

  private setEmployeeId(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.employeeId) {
      this.addRideForm.patchValue({ employeeId: currentUser.employeeId });
    }
  }

  private setupTimeValidation(): void {
    // Subscribe to time changes
    this.addRideForm.get('time')?.valueChanges.subscribe((value) => {
      if (value) {
        const selectedTime = this.timeToMinutes(value);
        const currentTimeMinutes = this.timeToMinutes(this.minTime);
        
        // If user selects a time less than current time, reset to current time
        if (selectedTime < currentTimeMinutes) {
          // Use setTimeout to ensure UI updates after validation
          setTimeout(() => {
            this.addRideForm.get('time')?.setValue(this.minTime, { emitEvent: false });
            this.cdr.detectChanges(); // Force change detection to update UI
            this.message = 'Cannot select a time in the past. Time has to be in the future.';
            this.messageType = 'error';
            setTimeout(() => {
              this.message = '';
            }, 3000);
          }, 0);
        }
      }
    });
  }

  private minTimeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const selectedTime = this.timeToMinutes(control.value);
    const currentTimeMinutes = this.timeToMinutes(this.minTime);

    if (selectedTime < currentTimeMinutes) {
      return { minTime: { value: control.value } };
    }

    return null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private uniqueEmployeeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const rides = this.rideService.getAllRides();
    const employeeId = control.value;
    
    const existingRide = rides.find(r => r.employeeId === employeeId);
    return existingRide ? { uniqueEmployee: { value: control.value } } : null;
  }

  onSubmit(): void {
    if (this.addRideForm.valid) {
      const formValue = this.addRideForm.getRawValue();
      const result = this.rideService.addRide({
        employeeId: formValue.employeeId,
        vehicleType: formValue.vehicleType,
        vehicleNo: formValue.vehicleNo,
        vacantSeats: parseInt(formValue.vacantSeats, 10),
        time: formValue.time,
        pickUpPoint: formValue.pickUpPoint,
        destination: formValue.destination
      });

      this.message = result.message;
      this.messageType = result.success ? 'success' : 'error';

      if (result.success) {
        // Reset form but preserve employeeId
        const employeeId = this.addRideForm.get('employeeId')?.value;
        this.addRideForm.reset();
        if (employeeId) {
          this.addRideForm.patchValue({ employeeId: employeeId });
        }
        setTimeout(() => {
          this.message = '';
        }, 3000);
      }
    } else {
      this.markFormGroupTouched(this.addRideForm);
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
    const control = this.addRideForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(controlName)} is required`;
    }
    if (control?.hasError('uniqueEmployee')) {
      return 'Employee ID already exists';
    }
    if (control?.hasError('min')) {
      return 'Vacant seats must be at least 1';
    }
    if (control?.hasError('minTime')) {
      return 'Cannot select a time in the past';
    }
    return '';
  }

  private getFieldLabel(controlName: string): string {
    const labels: { [key: string]: string } = {
      employeeId: 'Employee ID',
      vehicleType: 'Vehicle Type',
      vehicleNo: 'Vehicle No',
      vacantSeats: 'Vacant Seats',
      time: 'Time',
      pickUpPoint: 'Pick-up Point',
      destination: 'Destination'
    };
    return labels[controlName] || controlName;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.addRideForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}

