import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ride } from '../../../models/ride.model';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-ride-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './ride-card.component.html',
  styleUrls: ['./ride-card.component.css']
})
export class RideCardComponent {
  @Input() ride!: Ride;
  @Input() showBookButton: boolean = true;
  @Output() bookRide = new EventEmitter<string>();

  onBookRide(): void {
    this.bookRide.emit(this.ride.id);
  }
}

