import mongoose from 'mongoose';
import dotenv from 'dotenv';
import University from './models/University';
import Program from './models/Program';
import Job from './models/Job';
import Guidance from './models/Guidance';
import User from './models/User';
import HeroImage from './models/HeroImage';
import SuccessStory from './models/SuccessStory';
import Service from './models/Service';

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
    await HeroImage.deleteMany({});
    await SuccessStory.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({ email: 'esront21@gmail.com' });

    await User.create({
      name: 'EduJobs Admin',
      email: 'esront21@gmail.com',
      password: 'Admin123!',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    // Seed Universities
    const uni1 = await University.create({
      name: 'University of Rwanda (UR)',
      country: 'Rwanda',
      website: 'https://ur.ac.rw',
      description: 'The largest higher education institution in Rwanda, offering a wide range of programs across multiple colleges.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/University_of_Rwanda_logo.png/220px-University_of_Rwanda_logo.png',
      featured: true
    });

    const uni2 = await University.create({
      name: 'Carnegie Mellon University Africa',
      country: 'Rwanda',
      website: 'https://www.africa.engineering.cmu.edu',
      description: 'A world-class engineering school offering masters degrees in IT and Electrical and Computer Engineering.',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Carnegie_Mellon_University_wordmark.svg/1200px-Carnegie_Mellon_University_wordmark.svg.png',
      featured: true
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
        location: 'Kigali, Rwanda',
        fieldOfStudy: 'Software Engineering',
        salary: 'Competitive',
        description: 'Build and maintain citizen-facing digital services.',
        featured: true
      },
      {
        title: 'Digital Marketing Intern',
        company: 'MTN Rwanda',
        type: 'internship',
        requirements: 'Recent graduate in Marketing or Communication. Passion for social media.',
        deadline: new Date('2025-04-10'),
        link: 'https://mtn.co.rw/careers',
        location: 'Kigali, Rwanda',
        fieldOfStudy: 'Marketing',
        salary: 'Internship stipend',
        description: 'Support campaign planning, content creation, and reporting.',
        featured: true
      }
    ]);

    await HeroImage.create([
      {
        imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
        altText: 'Graduates celebrating on campus',
        category: 'graduation',
        university: 'University of Rwanda',
        order: 1,
        isActive: true
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
        altText: 'Young professionals collaborating at work',
        category: 'workers',
        country: 'Rwanda',
        order: 2,
        isActive: true
      }
    ]);

    await SuccessStory.insertMany([
      {
        type: 'student',
        fullName: 'Aline Uwase',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
        howTheyKnow: 'I found EduJobs Scholars while searching for scholarship guidance.',
        howHelped: 'The platform helped me compare programs and prepare my application documents.',
        university: 'University of Rwanda',
        country: 'Rwanda',
        order: 1,
        isActive: true
      },
      {
        type: 'worker',
        fullName: 'Jean Niyonsenga',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        howTheyKnow: 'A friend shared a job opportunity listed on EduJobs Scholars.',
        howHelped: 'I used the guidance resources to improve my CV and track applications.',
        jobTitle: 'Junior Web Developer',
        country: 'Rwanda',
        order: 2,
        isActive: true
      }
    ]);

    // Seed Guidance
    await Guidance.insertMany([
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

    // Seed Services
    await Service.insertMany([
      {
        title: "Application Support Services",
        iconName: "GraduationCap",
        features: [
          "University and college applications (Rwanda and international)",
          "Scholarship, Loan applications and self-sponsored",
          "Mifotra applications and other government applications",
        ],
        order: 1
      },
      {
        title: "Irembo Services Assistance",
        iconName: "Landmark",
        features: [
          "Birth, marriage, and death certificates",
          "Criminal record (police clearance)",
          "Passport application guidance",
          "Driving test registration",
          "Other government e-services support"
        ],
        order: 2
      },
      {
        title: "Document Services",
        iconName: "FileEdit",
        features: [
          "Writing formal letters",
          "CV preparation",
          "Document editing & proofreading",
          "Formatting documents for submission"
        ],
        order: 3
      },
      {
        title: "Opportunities & Guidance",
        iconName: "Compass",
        features: [
          "Job and scholarship updates",
          "Guidance through WhatsApp community",
          "Step-by-step application support"
        ],
        order: 4
      },
      {
        title: "Design Services",
        iconName: "Palette",
        features: [
          "Posters and flyers design",
          "Event and announcement designs",
          "Social media graphics",
          "Best branding for businesses"
        ],
        order: 5
      },
      {
        title: "Web & Mobile Development",
        iconName: "Code",
        features: [
          "Websites for e-commerce, business and more",
          "Mobile App development",
          "Google Forms for data collection and correction"
        ],
        order: 6
      }
    ]);

    console.log('Database seeded successfully!');
    console.log('Admin login: esront21@gmail.com / Admin123!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
