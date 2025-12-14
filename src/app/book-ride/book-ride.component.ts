import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RideService } from '../../services/ride.service';
import { AuthService } from '../../services/auth.service';
import { Ride, VehicleType } from '../../models/ride.model';
import { Subscription } from 'rxjs';
import { RideCardComponent } from '../../shared/components/ride-card/ride-card.component';
import { FormInputComponent } from '../../shared/components/form-input/form-input.component';

@Component({
  selector: 'app-book-ride',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RideCardComponent, FormInputComponent],
  templateUrl: './book-ride.component.html',
  styleUrls: ['./book-ride.component.css']
})
export class BookRideComponent implements OnInit, OnDestroy {
  bookRideForm!: FormGroup;
  availableRides: Ride[] = [];
  filteredRides: Ride[] = [];
  vehicleTypes = Object.values(VehicleType);
  currentTime: string = '';
  minTime: string = '';
  selectedVehicleType: VehicleType | '' = '';
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  private subscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private rideService: RideService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setEmployeeId();
    this.setCurrentTime();
    this.loadAvailableRides();
    
    // Subscribe to ride updates
    this.subscription = this.rideService.rides$.subscribe(() => {
      this.loadAvailableRides();
    });

      // Subscribe to currentTime changes
    this.bookRideForm.get('currentTime')?.valueChanges.subscribe((value) => {
      if (value) {
        const selectedTime = this.timeToMinutes(value);
        const currentTimeMinutes = this.timeToMinutes(this.minTime);
        
        // If user selects a time less than current time, reset to current time
        if (selectedTime < currentTimeMinutes) {
          // Use setTimeout to ensure UI updates after validation
          setTimeout(() => {
            this.bookRideForm.get('currentTime')?.setValue(this.minTime, { emitEvent: false });
            this.cdr.detectChanges(); // Force change detection to update UI
            this.message = 'Cannot select a time in the past. Time has to be in the future.';
            this.messageType = 'error';
            setTimeout(() => {
              this.message = '';
            }, 3000);
          }, 0);
        } else {
          this.onTimeChange();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private initializeForm(): void {
    this.bookRideForm = this.fb.group({
      employeeId: [{ value: '', disabled: true }, [Validators.required]],
      currentTime: ['', [this.minTimeValidator.bind(this)]]
    });
  }

  private setEmployeeId(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.employeeId) {
      this.bookRideForm.patchValue({ employeeId: currentUser.employeeId });
    }
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

  private setCurrentTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
    this.minTime = this.currentTime;
    this.bookRideForm.patchValue({ currentTime: this.currentTime });
  }

  loadAvailableRides(): void {
    const time = this.bookRideForm.get('currentTime')?.value || this.currentTime;
    const vehicleType = this.selectedVehicleType || undefined;
    this.availableRides = this.rideService.getAvailableRides(time, vehicleType);
    this.filteredRides = [...this.availableRides];
  }

  onTimeChange(): void {
    this.loadAvailableRides();
  }

  onVehicleTypeFilter(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedVehicleType = selectElement.value as VehicleType | '';
    this.loadAvailableRides();
  }

  onBookRide(rideId: string): void {
    const employeeId = this.bookRideForm.get('employeeId')?.value;
    
    if (!employeeId) {
      this.message = 'Please enter your Employee ID first.';
      this.messageType = 'error';
      return;
    }

    const result = this.rideService.bookRide({
      employeeId: employeeId,
      rideId: rideId
    });

    this.message = result.message;
    this.messageType = result.success ? 'success' : 'error';

    if (result.success) {
      this.loadAvailableRides();
      setTimeout(() => {
        this.message = '';
      }, 3000);
    }
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.bookRideForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.bookRideForm.get(controlName);
    if (control?.hasError('minTime')) {
      return 'Cannot select a time in the past';
    }
    return '';
  }
}

