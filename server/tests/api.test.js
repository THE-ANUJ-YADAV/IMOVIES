import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Movie } from '../src/models/Movie.js';
import { Theatre } from '../src/models/Theatre.js';
import { Screen } from '../src/models/Screen.js';
import { Show } from '../src/models/Show.js';
import { Booking } from '../src/models/Booking.js';
import { SeatHold } from '../src/models/SeatHold.js';

describe('IMovies API End-to-End Test Suite', () => {
  let userToken = '';
  let adminToken = '';
  let sampleMovieId = '';
  let sampleShowId = '';
  let sampleScreenId = '';
  let sampleTheatreId = '';
  let sessionToken = 'test-session-token-123';

  beforeAll(async () => {
    await connectDB();
    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Screen.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    await SeatHold.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin Tester',
      email: 'admin.test@imovies.com',
      password: 'Password@123',
      role: 'admin'
    });

    // Login Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin.test@imovies.com', password: 'Password@123' });
    adminToken = adminRes.body.data.token;
  }, 20000);

  afterAll(async () => {
    await disconnectDB();
  });

  describe('1. Authentication & Security', () => {
    it('should register a new user successfully with role user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password@123',
          phone: '9988776655'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.token).toBeDefined();
      userToken = res.body.data.token;
    });

    it('should reject registration with existing email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Jane Clone',
          email: 'jane@example.com',
          password: 'Password@123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should login user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'jane@example.com', password: 'Password@123' });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'jane@example.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user profile on GET /auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('jane@example.com');
    });
  });

  describe('2. Movies & Theatres Module', () => {
    it('should allow admin to create a movie', async () => {
      const res = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Inception 2026',
          synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology.',
          posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401',
          genres: ['Sci-Fi', 'Action'],
          languages: ['English'],
          duration: 148,
          releaseDate: new Date(),
          certification: 'UA',
          status: 'now_showing'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.movie.title).toBe('Inception 2026');
      sampleMovieId = res.body.data.movie._id;
    });

    it('should prevent non-admin from creating a movie', async () => {
      const res = await request(app)
        .post('/api/v1/movies')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Hacker Movie' });

      expect(res.status).toBe(403);
    });

    it('should create theatre and screen as admin', async () => {
      const theatreRes = await request(app)
        .post('/api/v1/theatres')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'IMovies Grand Mumbai',
          address: 'Nariman Point',
          city: 'Mumbai'
        });

      expect(theatreRes.status).toBe(201);
      sampleTheatreId = theatreRes.body.data.theatre._id;

      const screenRes = await request(app)
        .post('/api/v1/theatres/screens')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          theatre: sampleTheatreId,
          name: 'Screen 1 IMAX',
          screenNumber: 1
        });

      expect(screenRes.status).toBe(201);
      sampleScreenId = screenRes.body.data.screen._id;
    });
  });

  describe('3. Show Scheduling & Conflict Safeguards', () => {
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    it('should schedule a show', async () => {
      const res = await request(app)
        .post('/api/v1/shows')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          movie: sampleMovieId,
          theatre: sampleTheatreId,
          screen: sampleScreenId,
          startTime,
          endTime,
          language: 'English',
          format: 'IMAX 2D',
          pricing: [
            { category: 'Standard', price: 250 },
            { category: 'Premium', price: 380 },
            { category: 'Recliner', price: 550 }
          ]
        });

      expect(res.status).toBe(201);
      sampleShowId = res.body.data.show._id;
    });

    it('should reject overlapping show on the same screen (Conflict detection)', async () => {
      const overlapStart = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 mins inside
      const overlapEnd = new Date(overlapStart.getTime() + 2 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/shows')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          movie: sampleMovieId,
          theatre: sampleTheatreId,
          screen: sampleScreenId,
          startTime: overlapStart,
          endTime: overlapEnd,
          language: 'English',
          format: '2D',
          pricing: [{ category: 'Standard', price: 200 }]
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('4. Seat Selection, Holds & Concurrency Protection', () => {
    it('should retrieve seat map with accurate states', async () => {
      const res = await request(app)
        .get(`/api/v1/shows/${sampleShowId}/seats?sessionToken=${sessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.seats).toBeInstanceOf(Array);
      expect(res.body.data.seats[0].state).toBe('AVAILABLE');
    });

    it('should create a temporary seat hold for user', async () => {
      const res = await request(app)
        .post(`/api/v1/shows/${sampleShowId}/holds`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seats: ['A1', 'A2'],
          sessionToken
        });

      expect(res.status).toBe(201);
      expect(res.body.data.seats).toEqual(['A1', 'A2']);
      expect(res.body.data.expiresAt).toBeDefined();
    });

    it('should reject another customer from holding already held seats (Concurrency prevention)', async () => {
      const res = await request(app)
        .post(`/api/v1/shows/${sampleShowId}/holds`)
        .set('Authorization', `Bearer ${adminToken}`) // different user/session
        .send({
          seats: ['A2', 'A3'],
          sessionToken: 'another-session-999'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('5. Booking Lifecycle & Payment Verification', () => {
    let bookingId = '';

    it('should create a pending booking using server-side calculations', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          showId: sampleShowId,
          seats: ['A1', 'A2'],
          sessionToken
        });

      expect(res.status).toBe(201);
      expect(res.body.data.booking.bookingReference).toMatch(/^IMV-/);
      expect(res.body.data.booking.priceBreakdown.total).toBeGreaterThan(0);
      bookingId = res.body.data.booking.id;
    });

    it('should create a payment order for the booking', async () => {
      const res = await request(app)
        .post('/api/v1/payments/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookingId });

      expect(res.status).toBe(200);
      expect(res.body.data.orderId).toBeDefined();
      expect(res.body.data.amount).toBeGreaterThan(0);
    });

    it('should verify payment and confirm booking idempotently with QR ticket', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookingId,
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_456',
          razorpay_signature: 'mock_simulated_signature'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.booking.bookingStatus).toBe('CONFIRMED');
      expect(res.body.data.booking.qrCode).toBeDefined();

      // Second call (idempotent verify)
      const repeatRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookingId,
          razorpay_order_id: 'order_test_123',
          razorpay_payment_id: 'pay_test_456',
          razorpay_signature: 'mock_simulated_signature'
        });

      expect(repeatRes.status).toBe(200);
      expect(repeatRes.body.data.alreadyConfirmed).toBe(true);
    });

    it('should reflect confirmed booking in user booking history', async () => {
      const res = await request(app)
        .get('/api/v1/bookings/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.bookings.length).toBeGreaterThan(0);
      expect(res.body.data.bookings[0]._id).toBe(bookingId);
    });
  });

  describe('6. Admin Dashboard & Metrics', () => {
    it('should return metrics for admin dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalBookings).toBeGreaterThanOrEqual(1);
      expect(res.body.data.metrics.confirmedRevenue).toBeGreaterThan(0);
    });
  });
});
