import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Movie } from '../src/models/Movie.js';
import { Theatre } from '../src/models/Theatre.js';
import { Screen } from '../src/models/Screen.js';
import { Show } from '../src/models/Show.js';
import { Booking } from '../src/models/Booking.js';
import { SeatHold } from '../src/models/SeatHold.js';
import { Payment } from '../src/models/Payment.js';
import { logger } from '../src/utils/logger.js';
import { config } from '../src/config/env.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Purging old data...');

    await User.deleteMany({});
    await Movie.deleteMany({});
    await Theatre.deleteMany({});
    await Screen.deleteMany({});
    await Show.deleteMany({});
    await Booking.deleteMany({});
    await SeatHold.deleteMany({});
    await Payment.deleteMany({});

    logger.info('Creating demo users...');
    const adminUser = await User.create({
      name: 'IMovies Chief Administrator',
      email: config.admin.email,
      password: config.admin.password,
      role: 'admin',
      phone: '+91 98765 43210'
    });

    const regularUser = await User.create({
      name: 'Alex Johnson',
      email: 'user@imovies.com',
      password: 'User@123456',
      role: 'user',
      phone: '+91 98123 45678'
    });

    logger.info('Creating cinematic movies...');
    const movies = await Movie.insertMany([
      {
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the universe.',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genres: ['Action', 'Adventure', 'Sci-Fi'],
        languages: ['English', 'Hindi'],
        duration: 166,
        releaseDate: new Date('2024-03-01'),
        certification: 'UA',
        cast: [
          { name: 'Timothée Chalamet', role: 'Paul Atreides', image: '' },
          { name: 'Zendaya', role: 'Chani', image: '' },
          { name: 'Rebecca Ferguson', role: 'Lady Jessica', image: '' }
        ],
        crew: [{ name: 'Denis Villeneuve', role: 'Director' }],
        rating: { score: 8.9, votes: 4120 },
        formats: ['2D', '3D', 'IMAX 2D', '4DX'],
        status: 'now_showing',
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Oppenheimer',
        slug: 'oppenheimer',
        synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genres: ['Biography', 'Drama', 'History'],
        languages: ['English', 'Hindi'],
        duration: 180,
        releaseDate: new Date('2023-07-21'),
        certification: 'A',
        cast: [
          { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', image: '' },
          { name: 'Emily Blunt', role: 'Katherine Oppenheimer', image: '' },
          { name: 'Robert Downey Jr.', role: 'Lewis Strauss', image: '' }
        ],
        crew: [{ name: 'Christopher Nolan', role: 'Director' }],
        rating: { score: 9.0, votes: 5630 },
        formats: ['2D', 'IMAX 2D'],
        status: 'now_showing',
        isFeatured: true,
        isTrending: true
      },
      {
        title: 'Spider-Man: Across the Spider-Verse',
        slug: 'spider-man-across-the-spider-verse',
        synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1920&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genres: ['Animation', 'Action', 'Adventure'],
        languages: ['English', 'Hindi', 'Tamil', 'Telugu'],
        duration: 140,
        releaseDate: new Date('2023-06-02'),
        certification: 'U',
        cast: [
          { name: 'Shameik Moore', role: 'Miles Morales (voice)', image: '' },
          { name: 'Hailee Steinfeld', role: 'Gwen Stacy (voice)', image: '' }
        ],
        crew: [{ name: 'Joaquim Dos Santos', role: 'Director' }],
        rating: { score: 8.7, votes: 3890 },
        formats: ['2D', '3D', 'IMAX 2D'],
        status: 'now_showing',
        isFeatured: false,
        isTrending: true
      },
      {
        title: 'Interstellar',
        slug: 'interstellar',
        synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
        posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1920&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genres: ['Adventure', 'Drama', 'Sci-Fi'],
        languages: ['English'],
        duration: 169,
        releaseDate: new Date('2014-11-07'),
        certification: 'UA',
        cast: [
          { name: 'Matthew McConaughey', role: 'Cooper', image: '' },
          { name: 'Anne Hathaway', role: 'Brand', image: '' },
          { name: 'Jessica Chastain', role: 'Murph', image: '' }
        ],
        crew: [{ name: 'Christopher Nolan', role: 'Director' }],
        rating: { score: 9.1, votes: 6800 },
        formats: ['2D', 'IMAX 2D'],
        status: 'now_showing',
        isFeatured: true,
        isTrending: false
      },
      {
        title: 'Gladiator II',
        slug: 'gladiator-ii',
        synopsis: 'Years after witnessing the death of the revered hero Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome.',
        posterUrl: 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=800&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1920&q=80',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genres: ['Action', 'Adventure', 'Drama'],
        languages: ['English', 'Hindi'],
        duration: 148,
        releaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next month
        certification: 'A',
        cast: [
          { name: 'Paul Mescal', role: 'Lucius', image: '' },
          { name: 'Pedro Pascal', role: 'Marcus Acacius', image: '' },
          { name: 'Denzel Washington', role: 'Macrinus', image: '' }
        ],
        crew: [{ name: 'Ridley Scott', role: 'Director' }],
        rating: { score: 8.4, votes: 950 },
        formats: ['2D', 'IMAX 2D', '4DX'],
        status: 'coming_soon',
        isFeatured: false,
        isTrending: true
      }
    ]);

    logger.info('Creating realistic theatres and screens...');
    const theatresData = [
      {
        name: 'IMovies Luxe Cinema - BKC',
        city: 'Mumbai',
        address: 'Bandra Kurla Complex, G Block, Bandra East',
        state: 'Maharashtra',
        facilities: ['Dolby Atmos', '4K Laser Projection', 'Gourmet Dining', 'Valet Parking', 'Recliner Lounges']
      },
      {
        name: 'IMovies IMAX Premier - Phoenix Marketcity',
        city: 'Bengaluru',
        address: 'Whitefield Main Road, Mahadevapura',
        state: 'Karnataka',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'In-Seat Service', 'EV Charging', 'Wheelchair Access']
      },
      {
        name: 'IMovies Gold Class - Select CITYWALK',
        city: 'Delhi',
        address: 'A-3 District Centre, Saket',
        state: 'Delhi',
        facilities: ['Gold Class Lounge', 'Dolby Atmos', 'Valet Parking', 'Fine Dining']
      },
      {
        name: 'IMovies Cineplex - Banjara Hills',
        city: 'Hyderabad',
        address: 'Road No. 1, Banjara Hills',
        state: 'Telangana',
        facilities: ['4K Dolby Atmos', 'Recliner Seats', 'Food Court', 'Free Parking']
      }
    ];

    const generateLayout = (rowsCount = 8, colsCount = 12) => {
      const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'].slice(0, rowsCount);
      const seats = [];

      rowLetters.forEach((rowLetter, rIndex) => {
        let category = 'Standard';
        if (rIndex >= rowsCount - 2) category = 'Recliner';
        else if (rIndex >= Math.floor(rowsCount / 2)) category = 'Premium';

        for (let c = 1; c <= colsCount; c++) {
          seats.push({
            seatNumber: `${rowLetter}${c}`,
            row: rowLetter,
            col: c,
            category,
            isAisle: c === 4 || c === 9,
            isActive: true
          });
        }
      });

      return { rows: rowsCount, columns: colsCount, seats };
    };

    const savedTheatres = [];

    for (const tData of theatresData) {
      const theatre = await Theatre.create(tData);

      // Create 2 screens for each theatre
      const screen1 = await Screen.create({
        theatre: theatre._id,
        name: 'Audi 1 (IMAX Laser)',
        screenNumber: 1,
        supportedFormats: ['IMAX 2D', '2D', '3D'],
        seatLayout: generateLayout(8, 12)
      });

      const screen2 = await Screen.create({
        theatre: theatre._id,
        name: 'Audi 2 (Dolby Atmos)',
        screenNumber: 2,
        supportedFormats: ['2D', '3D'],
        seatLayout: generateLayout(7, 10)
      });

      theatre.screens = [screen1._id, screen2._id];
      await theatre.save();
      savedTheatres.push({ theatre, screen1, screen2 });
    }

    logger.info('Scheduling upcoming shows...');
    const now = new Date();
    const createdShows = [];

    // Schedule shows for today and next 2 days
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      for (const t of savedTheatres) {
        // Dune shows
        const duneStart1 = new Date(now);
        duneStart1.setDate(now.getDate() + dayOffset);
        duneStart1.setHours(11, 30, 0, 0);

        const duneEnd1 = new Date(duneStart1);
        duneEnd1.setMinutes(duneEnd1.getMinutes() + 175);

        const show1 = await Show.create({
          movie: movies[0]._id, // Dune
          theatre: t.theatre._id,
          screen: t.screen1._id,
          startTime: duneStart1,
          endTime: duneEnd1,
          language: 'English',
          format: 'IMAX 2D',
          pricing: [
            { category: 'Standard', price: 260 },
            { category: 'Premium', price: 380 },
            { category: 'Recliner', price: 590 }
          ],
          bookedSeats: dayOffset === 0 ? ['D5', 'D6', 'E7', 'E8'] : []
        });
        createdShows.push(show1);

        // Oppenheimer shows
        const oppenStart = new Date(now);
        oppenStart.setDate(now.getDate() + dayOffset);
        oppenStart.setHours(15, 45, 0, 0);

        const oppenEnd = new Date(oppenStart);
        oppenEnd.setMinutes(oppenEnd.getMinutes() + 190);

        const show2 = await Show.create({
          movie: movies[1]._id, // Oppenheimer
          theatre: t.theatre._id,
          screen: t.screen1._id,
          startTime: oppenStart,
          endTime: oppenEnd,
          language: 'English',
          format: 'IMAX 2D',
          pricing: [
            { category: 'Standard', price: 280 },
            { category: 'Premium', price: 420 },
            { category: 'Recliner', price: 650 }
          ],
          bookedSeats: dayOffset === 0 ? ['C3', 'C4', 'G1', 'G2'] : []
        });
        createdShows.push(show2);

        // Spider-Man in Audi 2
        const spideyStart = new Date(now);
        spideyStart.setDate(now.getDate() + dayOffset);
        spideyStart.setHours(14, 0, 0, 0);

        const spideyEnd = new Date(spideyStart);
        spideyEnd.setMinutes(spideyEnd.getMinutes() + 150);

        const show3 = await Show.create({
          movie: movies[2]._id, // Spider-Man
          theatre: t.theatre._id,
          screen: t.screen2._id,
          startTime: spideyStart,
          endTime: spideyEnd,
          language: 'English',
          format: '2D',
          pricing: [
            { category: 'Standard', price: 220 },
            { category: 'Premium', price: 320 },
            { category: 'Recliner', price: 480 }
          ],
          bookedSeats: []
        });
        createdShows.push(show3);
      }
    }

    // Create a demo confirmed booking for the regular user so My Bookings has realistic data
    logger.info('Creating demo booking for regular user...');
    const demoShow = createdShows[0];
    const demoBooking = await Booking.create({
      bookingReference: 'IMV-20261022-DEMO1',
      user: regularUser._id,
      show: demoShow._id,
      movieSnapshot: {
        title: movies[0].title,
        posterUrl: movies[0].posterUrl,
        certification: movies[0].certification,
        language: demoShow.language,
        format: demoShow.format
      },
      theatreSnapshot: {
        name: savedTheatres[0].theatre.name,
        screenName: savedTheatres[0].screen1.name,
        city: savedTheatres[0].theatre.city,
        address: savedTheatres[0].theatre.address
      },
      showTime: demoShow.startTime,
      seats: [
        { seatNumber: 'D5', row: 'D', category: 'Premium', price: 380 },
        { seatNumber: 'D6', row: 'D', category: 'Premium', price: 380 }
      ],
      priceBreakdown: {
        subtotal: 760,
        convenienceFee: 60,
        tax: 10.8,
        total: 830.8
      },
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS',
      paymentId: 'pay_demo_seeded_9988',
      orderId: 'order_demo_seeded_7766'
    });

    logger.info('✨ Seed completed successfully!');
    logger.info(`Admin Credentials: ${config.admin.email} / ${config.admin.password}`);
    logger.info(`User Credentials: user@imovies.com / User@123456`);
  } catch (err) {
    logger.error('Seed script error:', err);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

seedDatabase();
