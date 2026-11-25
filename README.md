# CarRental

A full-stack car rental marketplace where customers discover and book vehicles, and car owners list their own cars and manage incoming bookings. The project is a two-part JavaScript application: a React storefront and owner dashboard, backed by an Express REST API with MongoDB persistence.

## Table of contents

- [What the product does](#what-the-product-does)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Data models](#data-models)
- [Notable implementation details](#notable-implementation-details)
- [Scripts](#scripts)
- [Current scope](#current-scope)
- [Contributing](#contributing)
- [License](#license)

## What the product does

CarRental connects two groups of users in one application:

- **Customers** browse a catalogue of available cars, filter them by location and rental dates, inspect vehicle details, reserve a car, and track their bookings.
- **Car owners** promote their vehicles, control when those vehicles can be rented, review reservation requests, and follow basic business metrics from a dashboard.

The catalogue is live data from MongoDB, not static content. Images are uploaded through the API and served through ImageKit with on-the-fly resizing and compression.

## Features

### Customer experience

- Responsive landing page with a search form for pickup location, pickup date, and return date.
- Dedicated cars page that filters by the requested location and rental window, plus a client-side text filter across make, model, category, and transmission.
- Car detail page with specifications, description, features, daily price, and a booking form.
- "My Bookings" page showing status, rental period, pickup location, total price, and booking date.
- Registration and login modal with validation feedback through toast notifications.
- Auth state persisted in `localStorage` and restored on page load.
- Animated transitions with Framer Motion, and a mobile navigation menu.

### Owner experience

- One-click role switch from a regular user to a car owner.
- Add a car with image upload, brand, model, year, category, transmission, fuel type, seating capacity, daily price, location, and description.
- Manage listed cars: toggle availability or unlist a car, with an ownership check on the server before either action.
- Manage bookings: see all requests for the owner's cars and update a request from pending to confirmed or cancelled.
- Dashboard with total cars, total bookings, pending and confirmed bookings, recent activity, and revenue from confirmed bookings.
- Editable owner profile picture, also stored through ImageKit.

### Platform behavior

- Passwords hashed with bcrypt; authenticated routes protected by JWT verification middleware.
- Availability is calculated against existing bookings for the requested date range, not just a boolean flag.
- Booking prices are computed on the server from the rental duration and the car's daily rate.
- Ownership is verified server-side before car updates, unlisting, and booking status changes.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4, Framer Motion, Axios, React Hot Toast |
| Backend | Node.js, Express 5, Mongoose 9, JSON Web Tokens, bcrypt, Multer |
| Database | MongoDB (database name: `car-rental`) |
| Media | ImageKit (upload, folder organisation, resize/compress/webp transforms) |
| Tooling | ESLint 9, Nodemon |

## Architecture

```
Browser (React SPA)
   |  Axios, base URL from VITE_BASE_URL
   |  JWT sent in the Authorization header
   v
Express API (server.js)
   |-- /api/user       authentication, profile, public car catalogue
   |-- /api/owner      role switch, car listing, dashboard, profile image
   `-- /api/bookings   availability search, booking creation and management
   |
   |-- Mongoose models -> MongoDB
   `-- Multer + ImageKit -> optimised image URLs
```

The client and server are separate packages with their own `package.json` files and environment configuration. The server exposes a health check at `GET /` that returns `Server is running`.

## Project structure

```
car-rental/
├── client/
│   ├── public/                     Static assets
│   └── src/
│       ├── assets/                  Images, icons, navigation config, sample data
│       ├── components/              Navbar, Hero, CarCard, Login, Footer, etc.
│       │   └── owner/               Owner navbar and sidebar
│       ├── context/AppContext.jsx   Global auth, car, date and UI state
│       ├── pages/                   Home, Cars, CarDetails, MyBookings
│       │   └── owner/               Dashboard, AddCar, ManageCars, ManageBookings, Layout
│       ├── App.jsx                  Route definitions
│       ├── index.css                Tailwind theme and font setup
│       └── main.jsx                 Application entry point
└── server/
    ├── configs/
    │   ├── db.js                    MongoDB connection
    │   └── imageKit.js              ImageKit client
    ├── controllers/                 Request handlers for users, owners and bookings
    ├── middleware/
    │   ├── auth.js                  JWT protection middleware
    │   └── multer.js                Multipart upload configuration
    ├── models/                      User, Car and Booking schemas
    ├── routes/                      API route definitions
    ├── server.js                    Express app bootstrap
    └── package.json
```

## Getting started

### Prerequisites

- Node.js 20.19+ or 22.12+ (required by Vite 7) with npm
- A MongoDB connection URI (local or Atlas)
- An ImageKit account with public key, private key, and URL endpoint

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment files

Create `server/.env` in the server folder:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
JWT_SECRET=replace-with-a-long-random-string
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
PORT=3000
```

Create `client/.env` in the client folder:

```env
VITE_BASE_URL=http://localhost:3000
VITE_CURRENCY=$
```

`MONGODB_URI` is the connection base only. The server appends `/car-rental` when connecting, as defined in `server/configs/db.js`. Environment files are ignored by Git.

### 3. Run in development

In one terminal:

```bash
cd server
npm run server
```

In another terminal:

```bash
cd client
npm run dev
```

The API starts on port `3000` by default and the Vite dev server prints its local URL (usually `http://localhost:5173`).

### 4. Build for production

```bash
cd client
npm run build
npm run preview
```

For the API, `npm start` runs `server.js` with plain Node instead of Nodemon.

## Environment variables

| Variable | Location | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | `server/.env` | MongoDB connection base URI |
| `JWT_SECRET` | `server/.env` | Secret used to sign and verify auth tokens |
| `IMAGEKIT_PUBLIC_KEY` | `server/.env` | ImageKit client public key |
| `IMAGEKIT_PRIVATE_KEY` | `server/.env` | ImageKit client private key |
| `IMAGEKIT_URL_ENDPOINT` | `server/.env` | ImageKit delivery URL endpoint |
| `PORT` | `server/.env` | API port; falls back to `3000` |
| `VITE_BASE_URL` | `client/.env` | Base URL for all Axios requests |
| `VITE_CURRENCY` | `client/.env` | Currency symbol rendered across the UI |

## API reference

Protected endpoints expect the JWT in the `Authorization` header. The client sends the raw token value, without a `Bearer` prefix.

### Users — `/api/user`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | No | Register with name, email and password (minimum 8 characters); returns a token |
| POST | `/login` | No | Verify credentials with bcrypt; returns a token |
| GET | `/data` | Yes | Return the authenticated user, excluding the password |
| GET | `/cars` | No | List all cars marked available |

### Owners — `/api/owner`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/change-role` | Yes | Change the current user's role to `owner` |
| POST | `/add-car` | Yes | Upload an image and create a car listing for the current owner |
| GET | `/cars` | Yes | List cars belonging to the current owner |
| POST | `/toggle-car` | Yes | Flip the availability flag on one of the owner's cars |
| POST | `/delete-car` | Yes | Unlist a car by clearing its owner and setting availability to false |
| GET | `/dashboard` | Yes | Return counts, recent bookings and revenue for the owner |
| POST | `/update-image` | Yes | Upload and save a new profile image |

Car image and profile image requests use `multipart/form-data`: an `image` file field plus, for new cars, a `carData` JSON string field.

### Bookings — `/api/bookings`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/check-availability` | No | Given location, pickup date and return date, return cars with no overlapping bookings |
| POST | `/create` | Yes | Recheck availability, calculate the price and create a booking |
| GET | `/user` | Yes | List the current user's bookings with car details |
| GET | `/owner` | Yes | List bookings for the current owner's cars (owner role required) |
| POST | `/change-status` | Yes | Set a booking to `pending`, `confirmed` or `cancelled` (owner must own the booking) |

## Data models

**User** — `name`, `email` (unique), `password` (hashed), `role` (`user` or `owner`, default `user`), `image`, plus timestamps.

**Car** — `owner` (User reference), `brand`, `model`, `image`, `year`, `category`, `seating_capacity`, `fuel_type`, `transmission`, `pricePerDay`, `location`, `description`, `isAvailable` (default `true`), plus timestamps.

**Booking** — `car`, `user`, `owner`, `pickupDate`, `returnDate`, `status` (`pending`, `confirmed`, `cancelled`; default `pending`), `price`, plus timestamps.

## Notable implementation details

- **Date-overlap availability search.** A car is excluded if an existing booking starts on or before the requested return date and ends on or after the requested pickup date. This prevents double-booking across overlapping date ranges.
- **Server-side pricing.** The number of days is the ceiling of the milliseconds between pickup and return divided by one day, multiplied by `pricePerDay`. The client never submits a price.
- **Two-stage availability check.** Search results are filtered first, and `create` verifies availability again before writing the booking.
- **Ownership checks.** Toggling a car, unlisting a car, and changing a booking status all compare the resource owner with the authenticated user before allowing the change.
- **Image pipeline.** Multer receives the upload, the controller reads it into a buffer, ImageKit stores it in `/cars` or `/users`, and the generated URL applies width, `quality: auto`, and `webp` transformations (1280px for cars, 400px for profile images).
- **Client state.** `AppContext` holds the token, user, owner flag, login modal state, selected rental dates, and the car catalogue, so search criteria survive navigation from the search form to the booking form.
- **Soft unlisting.** Deleting a car clears its `owner` and sets `isAvailable` to `false` rather than removing the document.

## Scripts

### Server (`cd server`)

| Command | Description |
| --- | --- |
| `npm run server` | Start the API with Nodemon for development |
| `npm start` | Start the API with Node |

### Client (`cd client`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the client source |

## Current scope

A few parts of the interface are presentational rather than wired to a backend flow: the newsletter signup, the navbar search field, the footer links, and the "offline" payment label on the owner bookings table. Testimonials and the owner banner are static content. There is no automated test suite in the repository yet.

The dashboard's revenue figure sums the price of all confirmed bookings for the owner; it is not filtered to a calendar month despite the UI label.

## Contributing

Issues and pull requests are welcome. When changing API behavior, keep the client and server updates together, and run `npm run lint` in `client` before opening a pull request.

## License

No license file is currently included in this repository.
