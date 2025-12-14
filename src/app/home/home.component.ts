import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddRideComponent } from '../add-ride/add-ride.component';
import { BookRideComponent } from '../book-ride/book-ride.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { RideService } from '../../services/ride.service';
import { Ride } from '../../models/ride.model';
import { Subscription } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, AddRideComponent, BookRideComponent, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  title = APP_CONFIG.title;
  description = APP_CONFIG.description;
  activeTab: 'add' | 'book' = 'add';
  bookedRides: Ride[] = [];
  private subscription?: Subscription;

  constructor(
    private authService: AuthService,
    private rideService: RideService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updateBookedRides();
    // Subscribe to ride updates
    this.subscription = this.rideService.rides$.subscribe(() => {
      this.updateBookedRides();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateBookedRides(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.employeeId) {
      this.bookedRides = this.rideService.getBookedRidesForUser(currentUser.employeeId);
    } else {
      this.bookedRides = [];
    }
  }

  setActiveTab(tab: 'add' | 'book'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getCurrentUser(): any {
    return this.authService.getCurrentUser();
  }
}

