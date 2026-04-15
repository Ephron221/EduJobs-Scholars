import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edujobs_scholars';

const studentsData = [
  {
    _id: new mongoose.Types.ObjectId("68dcd972a7344883fe741bff"),
    firstName: "Moises",
    lastName: "IMBAHAFI",
    email: "mosesimbahafi@gmail.com",
    phoneNumber: "+250733397799",
    registrationNumber: "25RP27604",
    password: "Moise21%",
    dateOfBirth: new Date("2005-04-12T00:00:00.000+00:00"),
    gender: "Male",
    nationalId: "1200580126370019",
    address: "Huye-Kinazi-Gahana-Cyegera",
    level: "Level 1",
    institution: "UR",
    admissionDate: new Date("2025-09-30T00:00:00.000+00:00"),
    status: "active",
    guardianName: "Ndayisaba Emmanuel",
    guardianPhone: "+250780849789",
    guardianEmail: "",
    documents: [],
    createdAt: new Date("2025-10-01T07:34:10.898+00:00"),
    updatedAt: new Date("2026-01-06T09:36:43.966+00:00"),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId("68dcf093d75bb519e98dbc5c"),
    firstName: "Regis",
    lastName: "Byiringiro",
    email: "byiringirooregis1@gmail.com",
    phoneNumber: "0795650234",
    registrationNumber: "25RP26971",
    password: "Regis21%",
    dateOfBirth: new Date("2006-07-23T00:00:00.000+00:00"),
    gender: "Male",
    nationalId: "1200680253807047",
    address: "Huye-Kinazi-Gitovu-Karambo",
    level: "Level 1",
    institution: "RP",
    admissionDate: new Date("2025-09-30T00:00:00.000+00:00"),
    status: "pending",
    guardianName: "HAKIZIMANA Isaie",
    guardianPhone: "0738455466",
    guardianEmail: "",
    documents: [],
    createdAt: new Date("2025-10-01T09:12:52.008+00:00"),
    updatedAt: new Date("2025-10-01T09:12:52.008+00:00"),
    __v: 0
  },
  {
    _id: new mongoose.Types.ObjectId("68de598f549443b0ca9ed58f"),
    firstName: "daniel",
    lastName: "Imananibyose",
    email: "imananibyosedaniel@gmail.com",
    phoneNumber: "+250796826909",
    registrationNumber: "25RP29129",
    password: "Daniel21%",
    dateOfBirth: new Date("2006-01-01T00:00:00.000+00:00"),
    gender: "Male",
    nationalId: "1200680009958064",
    address: "Huye-kinazi-Gahana-Cyegera",
    level: "Level 1",
    institution: "RP",
    admissionDate: new Date("2025-10-02T00:00:00.000+00:00"),
    status: "active",
    guardianName: "Nyiratabaruka eliminate",
    guardianPhone: "+250785035067",
    guardianEmail: "",
    documents: [],
    createdAt: new Date("2025-10-02T10:53:03.050+00:00"),
    updatedAt: new Date("2026-01-06T09:37:01.046+00:00"),
    __v: 0
  }
];

const seedStudents = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for student seeding...');

    // Clear existing students
    await Student.deleteMany({});
    console.log('Existing students cleared.');

    // Seed students
    for (const studentData of studentsData) {
      await Student.create(studentData);
    }
    
    console.log('Students seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();
