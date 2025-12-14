import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';
import { RideService } from '../../services/ride.service';

@Directive({
  selector: '[appUniqueEmployee]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: UniqueEmployeeDirective,
      multi: true
    }
  ]
})
export class UniqueEmployeeDirective implements Validator {
  @Input('appUniqueEmployee') excludeRideId?: string;

  constructor(private rideService: RideService) {}

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value) {
      return null;
    }

    const rides = this.rideService.getAllRides();
    const employeeId = control.value;
    
    // Check if employee ID already exists (excluding current ride if editing)
    const existingRide = rides.find(r => 
      r.employeeId === employeeId && 
      (!this.excludeRideId || r.id !== this.excludeRideId)
    );

    return existingRide ? { uniqueEmployee: { value: control.value } } : null;
  }
}

