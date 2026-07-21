const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const MedicalReport = require('../models/MedicalReport');
const Feedback = require('../models/Feedback');
const Message = require('../models/Message');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicare_plus');
    console.log('Database connected for seeding...');
  } catch (err) {
    console.error(`Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    await Service.deleteMany();
    await Appointment.deleteMany();
    await MedicalReport.deleteMany();
    await Feedback.deleteMany();
    await Message.deleteMany();

    console.log('Cleared existing database records.');

    // 1. Create Admin User
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@medicareplus.test',
      password: 'password123',
      role: 'admin',
      phone: '+1 800 555 0199',
      gender: 'Male',
      address: '100 Medical Center Way, Suite 500',
    });

    // 2. Create Doctors
    const docUser1 = await User.create({
      name: 'Dr. Ozella Reinger',
      email: 'ozella@medicareplus.test',
      password: 'password123',
      role: 'doctor',
      phone: '+1 555 012 3456',
      gender: 'Female',
      address: '742 Evergreen Terrace',
    });

    const docUser2 = await User.create({
      name: 'Dr. Kelsi Mitchell',
      email: 'kelsi@medicareplus.test',
      password: 'password123',
      role: 'doctor',
      phone: '+1 555 098 7654',
      gender: 'Female',
      address: '123 Health Ave',
    });

    const docUser3 = await User.create({
      name: 'Dr. Germaine Kirlin DDS',
      email: 'germaine@medicareplus.test',
      password: 'password123',
      role: 'doctor',
      phone: '+1 555 234 5678',
      gender: 'Male',
      address: '456 Clinic Lane',
    });

    const doctor1 = await Doctor.create({
      user: docUser1._id,
      specialization: 'Dermatology',
      qualifications: 'MD, Board Certified Dermatologist',
      experience_years: 15,
      availability_days: ['MON', 'WED', 'FRI'],
      consultation_fee: 150,
      rating_avg: 5.0,
      rating_count: 1,
      about: 'Specialist in clinical dermatology, skin rejuvenation, and laser treatments.',
    });

    const doctor2 = await Doctor.create({
      user: docUser2._id,
      specialization: 'Neurology',
      qualifications: 'MD, PhD in Neurological Sciences',
      experience_years: 8,
      availability_days: ['TUE', 'THU', 'SAT'],
      consultation_fee: 180,
      rating_avg: 4.9,
      rating_count: 1,
      about: 'Expert in treatment of migraines, movement disorders, and neuro-rehabilitation.',
    });

    const doctor3 = await Doctor.create({
      user: docUser3._id,
      specialization: 'Orthopedics',
      qualifications: 'MS Orthopedics, FRCS',
      experience_years: 12,
      availability_days: ['MON', 'TUE', 'WED', 'THU'],
      consultation_fee: 200,
      rating_avg: 4.8,
      rating_count: 1,
      about: 'Specialized in joint replacement, sports injury recovery, and arthroscopic surgery.',
    });

    // 3. Create Patients
    const patient1 = await User.create({
      name: 'Ollie Watsica',
      email: 'ollie@medicareplus.test',
      password: 'password123',
      role: 'patient',
      phone: '+1 555 777 8888',
      gender: 'Male',
      address: '88 Lakeview Drive',
    });

    const patient2 = await User.create({
      name: 'Grace Quigley Sr.',
      email: 'grace@medicareplus.test',
      password: 'password123',
      role: 'patient',
      phone: '+1 555 999 0000',
      gender: 'Female',
      address: '14 Sunshine Boulevard',
    });

    // 4. Create Services
    await Service.create([
      {
        category: 'Radiology',
        name: 'Paste-Up Worker Care / MRI Scan',
        description: 'Advanced magnetic resonance imaging for detailed soft tissue diagnosis.',
        icon: 'heroicon-o-camera',
      },
      {
        category: 'Dermatology',
        name: 'Skin Health & Laser Therapy',
        description: 'Comprehensive skin examinations and dermatological procedures.',
        icon: 'heroicon-o-sparkles',
      },
      {
        category: 'Orthopedics',
        name: 'Joint & Spine Assessment',
        description: 'Evaluation and therapeutic intervention for musculoskeletal conditions.',
        icon: 'heroicon-o-user',
      },
      {
        category: 'Pediatrics',
        name: 'Childhood Immunization & Care',
        description: 'Routine wellness exams, growth tracking, and vaccinations.',
        icon: 'heroicon-o-heart',
      },
    ]);

    // 5. Create Sample Appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const app1 = await Appointment.create({
      doctor: doctor1._id,
      patient: patient1._id,
      appointment_date: tomorrow,
      appointment_time: '10:30 AM',
      status: 'approved',
      notes: 'Routine skin checkup',
    });

    const app2 = await Appointment.create({
      doctor: doctor2._id,
      patient: patient2._id,
      appointment_date: nextWeek,
      appointment_time: '02:00 PM',
      status: 'pending',
      notes: 'Consultation for chronic headaches',
    });

    // 6. Create Medical Report
    await MedicalReport.create({
      doctor: docUser1._id,
      patient: patient1._id,
      report_type: 'Dermatology Consultation Summary',
      description: 'Patient presented with mild eczema. Prescribed topical ointment.',
      file_path: '/uploads/reports/sample_report.pdf',
      original_filename: 'Consultation_Summary_2026.pdf',
    });

    // 7. Create Feedback
    await Feedback.create({
      doctor: doctor1._id,
      patient: patient1._id,
      rating: 5,
      comment: 'Dr. Ozella was extremely thorough and attentive to my concerns!',
    });

    // 8. Create Messages
    await Message.create({
      sender: patient1._id,
      receiver: docUser1._id,
      message: 'Hello Dr. Ozella, I have a question regarding my prescription ointment.',
      read_status: true,
    });

    await Message.create({
      sender: docUser1._id,
      receiver: patient1._id,
      message: 'Hello Ollie, please apply it twice daily after washing the area with water.',
      read_status: false,
    });

    console.log('✅ Demo data seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Admin Account: admin@medicareplus.test / password123');
    console.log('Doctor Account: ozella@medicareplus.test / password123');
    console.log('Patient Account: ollie@medicareplus.test / password123');
    console.log('----------------------------------------------------');

    process.exit();
  } catch (err) {
    console.error(`Seeding error: ${err.message}`);
    process.exit(1);
  }
};

importData();
