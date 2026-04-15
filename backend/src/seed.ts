import mongoose from 'mongoose';
import dotenv from 'dotenv';
import University from './models/University';
import Program from './models/Program';
import Job from './models/Job';
import Guidance from './models/Guidance';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edujobs_scholars';

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await University.deleteMany({});
    await Program.deleteMany({});
    await Job.deleteMany({});
    await Guidance.deleteMany({});

    // Seed Universities
    const uni1 = await University.create({
      name: 'University of Rwanda (UR)',
      country: 'Rwanda',
      website: 'https://ur.ac.rw',
      description: 'The largest higher education institution in Rwanda, offering a wide range of programs across multiple colleges.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/University_of_Rwanda_logo.png/220px-University_of_Rwanda_logo.png'
    });

    const uni2 = await University.create({
      name: 'Carnegie Mellon University Africa',
      country: 'Rwanda',
      website: 'https://www.africa.engineering.cmu.edu',
      description: 'A world-class engineering school offering masters degrees in IT and Electrical and Computer Engineering.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Carnegie_Mellon_University_wordmark.svg/1200px-Carnegie_Mellon_University_wordmark.svg.png'
    });

    // Seed Programs
    await Program.create([
      {
        universityId: uni1._id,
        name: 'BSc in Computer Science',
        requirements: 'Advanced Level certificate with at least 2 principal passes in Physics and Mathematics.',
        deadline: new Date('2025-08-30'),
        applicationLink: 'https://ur.ac.rw/apply',
        fieldOfStudy: 'Engineering',
        duration: '4 years'
      },
      {
        universityId: uni2._id,
        name: 'MS in Information Technology',
        requirements: 'Bachelors degree in relevant field with high GPA and GRE scores.',
        deadline: new Date('2025-01-15'),
        applicationLink: 'https://www.africa.engineering.cmu.edu/admissions',
        fieldOfStudy: 'IT',
        duration: '2 years'
      }
    ]);

    // Seed Jobs
    await Job.create([
      {
        title: 'Junior Web Developer',
        company: 'Irembo',
        type: 'job',
        requirements: 'Knowledge of React, Node.js and basic database management.',
        deadline: new Date('2025-05-20'),
        link: 'https://irembo.com/careers',
        location: 'Kigali, Rwanda'
      },
      {
        title: 'Digital Marketing Intern',
        company: 'MTN Rwanda',
        type: 'internship',
        requirements: 'Recent graduate in Marketing or Communication. Passion for social media.',
        deadline: new Date('2025-04-10'),
        link: 'https://mtn.co.rw/careers',
        location: 'Kigali, Rwanda'
      }
    ]);

    // Seed Guidance
    await Guidance.create([
      {
        title: 'University Application Process',
        category: 'university_applications',
        content: 'Apply to universities requires careful preparation of documents...',
        tags: ['Research programs', 'Prepare documents', 'Submit application', 'Track status']
      },
      {
        title: 'CV & Cover Letter Writing',
        category: 'cv_writing',
        content: 'Your CV is your first impression. Make it count by...',
        tags: ['Choose a format', 'Highlight skills', 'Quantify results', 'Proofread carefully']
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
