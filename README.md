# Transport Facility Management System

A web application for employees to schedule, book pick-up and drop-off transport facility provided by the company.

## Features

1. **Add a New Ride** - Employees can add rides with the following information:
   - Employee ID (Mandatory, Unique)
   - Vehicle Type (Bike, Car)
   - Vehicle No (Mandatory)
   - Vacant Seats (Mandatory)
   - Time (Mandatory)
   - Pick-up Point (Mandatory)
   - Destination (Mandatory)

2. **Book a Ride** - Employees can book available rides:
   - Enter Employee ID
   - View rides matching current time (±60 minutes buffer)
   - Filter by Vehicle Type
   - Automatic seat count update on booking

3. **Business Rules**:
   - Only current day rides are shown
   - Time matching with ±60 minutes buffer
   - Same employee cannot book their own ride
   - Same employee cannot book a ride twice
   - Vacant seats automatically decrease on booking
   - Each employee can only add one ride per day

## Project Structure

```
src/
├── app/
│   ├── add-ride/          # Add ride component
│   ├── book-ride/         # Book ride component
│   └── app.component.*   # Main app component
├── shared/
│   ├── components/        # Reusable components
│   │   ├── button/
│   │   ├── form-input/
│   │   └── ride-card/
│   └── directives/        # Custom directives
│       ├── unique-employee.directive.ts
│       └── time-match.directive.ts
├── services/
│   └── ride.service.ts    # Ride management service
└── models/
    └── ride.model.ts      # Data models
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## Technology Stack

- Angular 18 (Standalone Components)
- TypeScript 5.4
- RxJS 7.8
- Reactive Forms
- LocalStorage for data persistence

## Reusable Components

All reusable components are located in `src/shared/components/`:
- **Button Component** - Reusable button with different styles
- **Form Input Component** - Reusable form input with validation
- **Ride Card Component** - Display ride information in a card format

## Custom Directives

- **UniqueEmployeeDirective** - Validates unique employee ID
- **TimeMatchDirective** - Validates time matching within ±60 minutes

## Development

The application uses:
- **Standalone Components** - Modern Angular architecture without NgModules
- Clean code principles
- Reusable components in `src/shared/components/`
- Custom standalone directives for validation
- Service-based architecture
- Reactive forms for form handling
- TypeScript strict mode

## Architecture

This project uses Angular's standalone components architecture (Angular 18+), which means:
- Each component is self-contained with its own imports
- Better tree-shaking and smaller bundle sizes
- More modular and maintainable code structure

