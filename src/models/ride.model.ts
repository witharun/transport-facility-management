export enum VehicleType {
  Bike = 'Bike',
  Car = 'Car'
}

export interface Ride {
  id: string;
  employeeId: string;
  vehicleType: VehicleType;
  vehicleNo: string;
  vacantSeats: number;
  time: string;
  pickUpPoint: string;
  destination: string;
  bookedBy: string[];
  createdAt: Date;
}

export interface BookRideRequest {
  employeeId: string;
  rideId: string;
}



