import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ride, VehicleType, BookRideRequest } from '../models/ride.model';

@Injectable({
  providedIn: 'root'
})
export class RideService {
  private rides: Ride[] = [];
  private ridesSubject = new BehaviorSubject<Ride[]>([]);
  public rides$: Observable<Ride[]> = this.ridesSubject.asObservable();

  constructor() {
    this.loadRidesFromStorage();
  }

  private loadRidesFromStorage(): void {
    const stored = localStorage.getItem('rides');
    if (stored) {
      const parsedRides = JSON.parse(stored).map((ride: any) => ({
        ...ride,
        createdAt: new Date(ride.createdAt)
      }));
      this.rides = this.filterTodayRides(parsedRides);
      this.ridesSubject.next(this.rides);
    }
  }

  private saveRidesToStorage(): void {
    localStorage.setItem('rides', JSON.stringify(this.rides));
  }

  private filterTodayRides(rides: Ride[]): Ride[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return rides.filter(ride => {
      const rideDate = new Date(ride.createdAt);
      rideDate.setHours(0, 0, 0, 0);
      return rideDate.getTime() === today.getTime();
    });
  }

  addRide(ride: Omit<Ride, 'id' | 'bookedBy' | 'createdAt'>): { success: boolean; message: string } {
    // Check if employee ID already exists
    if (this.rides.some(r => r.employeeId === ride.employeeId)) {
      return { success: false, message: 'Employee ID already exists. Each employee can only add one ride per day.' };
    }

    const newRide: Ride = {
      ...ride,
      id: this.generateId(),
      bookedBy: [],
      createdAt: new Date()
    };

    this.rides.push(newRide);
    this.ridesSubject.next(this.rides);
    this.saveRidesToStorage();
    return { success: true, message: 'Ride added successfully!' };
  }

  bookRide(request: BookRideRequest): { success: boolean; message: string } {
    const ride = this.rides.find(r => r.id === request.rideId);
    
    if (!ride) {
      return { success: false, message: 'Ride not found.' };
    }

    if (ride.employeeId === request.employeeId) {
      return { success: false, message: 'You cannot book your own ride.' };
    }

    if (ride.bookedBy.includes(request.employeeId)) {
      return { success: false, message: 'You have already booked this ride.' };
    }

    if (ride.vacantSeats <= 0) {
      return { success: false, message: 'No vacant seats available.' };
    }

    ride.bookedBy.push(request.employeeId);
    ride.vacantSeats--;
    this.ridesSubject.next(this.rides);
    this.saveRidesToStorage();
    return { success: true, message: 'Ride booked successfully!' };
  }

  getAvailableRides(currentTime: string, vehicleType?: VehicleType): Ride[] {
    let availableRides = this.rides.filter(ride => ride.vacantSeats > 0);

    // Filter by vehicle type if provided
    if (vehicleType) {
      availableRides = availableRides.filter(ride => ride.vehicleType === vehicleType);
    }

    // Filter by time matching (current time to +60 minutes only)
    const currentTimeMinutes = this.timeToMinutes(currentTime);
    availableRides = availableRides.filter(ride => {
      const rideTimeMinutes = this.timeToMinutes(ride.time);
      // Only show rides that are at or after current time and within 60 minutes ahead
      return rideTimeMinutes >= currentTimeMinutes && (rideTimeMinutes - currentTimeMinutes) <= 60;
    });

    return availableRides;
  }

  getAllRides(): Ride[] {
    return [...this.rides];
  }

  getBookedRidesForUser(employeeId: string): Ride[] {
    return this.rides.filter(ride => ride.bookedBy.includes(employeeId));
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}


