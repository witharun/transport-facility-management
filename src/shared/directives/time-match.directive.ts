import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, Validator } from '@angular/forms';

@Directive({
  selector: '[appTimeMatch]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: TimeMatchDirective,
      multi: true
    }
  ]
})
export class TimeMatchDirective implements Validator {
  @Input('appTimeMatch') currentTime?: string;

  validate(control: AbstractControl): { [key: string]: any } | null {
    if (!control.value || !this.currentTime) {
      return null;
    }

    const rideTime = this.timeToMinutes(control.value);
    const currentTimeMinutes = this.timeToMinutes(this.currentTime);
    const timeDifference = Math.abs(rideTime - currentTimeMinutes);

    // Time should be within +/- 60 minutes
    return timeDifference > 60 ? { timeMatch: { value: control.value } } : null;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
}

