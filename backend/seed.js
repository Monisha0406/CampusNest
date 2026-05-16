const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Fee = require('./models/Fee');
const Complaint = require('./models/Complaint');
const connectDB = require('./config/db');

dotenv.config();

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding huge dataset...');

  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Fee.deleteMany({}),
    Complaint.deleteMany({}),
  ]);

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@smartstay.com',
    password: 'admin123',
    role: 'admin',
    phone: '9876543210',
  });

  const studentNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Diya', 'Ananya', 'Kiara', 'Aadhya', 'Saanvi', 'Riya', 'Myra', 'Navya', 'Avni', 'Sara', 'Kavya', 'Rohan', 'Kabir', 'Dev', 'Dhruv', 'Yash', 'Pooja', 'Neha', 'Sneha', 'Swati'];
  const courses = ['B.Tech CSE', 'B.Tech ECE', 'B.Tech ME', 'MCA', 'MBA', 'BBA', 'B.Sc IT'];
  const addresses = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore', 'Pune', 'Hyderabad', 'Ahmedabad'];

  const studentsData = studentNames.map((name, i) => ({
    name: `${name} ${['Sharma', 'Patel', 'Kumar', 'Singh', 'Nair', 'Reddy', 'Gupta', 'Verma'][i % 8]}`,
    email: `student${i + 1}@smartstay.com`,
    password: 'student123',
    role: 'student',
    phone: `98765${40000 + i}`,
    gender: i < 10 ? 'Male' : i < 20 ? 'Female' : 'Male', // mixed
    course: courses[i % courses.length],
    admissionYear: 2022 + (i % 3),
    address: addresses[i % addresses.length],
    emergencyContact: `99999${40000 + i}`,
    dateOfBirth: new Date(`200${1 + (i % 4)}-0${1 + (i % 9)}-15`),
  }));

  const students = await User.insertMany(studentsData);
  console.log(`✅ ${students.length} students created`);

  const roomTypes = [
    { type: 'Single', cap: 1, rent: 5000 },
    { type: 'Double', cap: 2, rent: 4000 },
    { type: 'Triple', cap: 3, rent: 3000 },
    { type: 'Dormitory', cap: 6, rent: 2000 },
  ];

  const roomsData = [];
  let block = 'A';
  for (let i = 1; i <= 20; i++) {
    if (i > 10) block = 'B';
    const floor = i % 5 === 0 ? 5 : i % 5;
    const rt = roomTypes[i % 4];
    roomsData.push({
      roomNumber: `${block}-${100 * floor + (i % 10)}`,
      type: rt.type,
      capacity: rt.cap,
      floor, block,
      monthlyRent: rt.rent,
      amenities: ['WiFi', 'Bed', 'Table'].concat(rt.type === 'Single' ? ['AC'] : []),
      occupants: [],
      status: 'Available'
    });
  }

  const rooms = await Room.insertMany(roomsData);
  
  // Assign students to rooms
  let studentIdx = 0;
  for (let room of rooms) {
    while (room.occupants.length < room.capacity && studentIdx < students.length) {
      room.occupants.push(students[studentIdx]._id);
      studentIdx++;
    }
    room.status = room.occupants.length >= room.capacity ? 'Full' : 'Available';
    await room.save();
  }
  console.log(`✅ ${rooms.length} rooms created and assigned`);

  // Fees spanning last 6 months
  const months = ['November 2023', 'December 2023', 'January 2024', 'February 2024', 'March 2024', 'April 2024', 'May 2024'];
  const feeRecords = [];
  for (const student of students) {
    const room = rooms.find(r => r.occupants.includes(student._id));
    const amount = room ? room.monthlyRent : 4000;
    
    for (let m = 0; m < months.length; m++) {
      // 90% paid, recent ones might be pending
      const isPending = m === months.length - 1 && Math.random() > 0.5;
      feeRecords.push({
        student: student._id,
        room: room?._id,
        month: months[m],
        amount,
        dueDate: new Date(2023 + (m >= 2 ? 1 : 0), (m + 10) % 12, 5),
        paidAmount: isPending ? 0 : amount,
        status: isPending ? 'Pending' : 'Paid',
        paymentHistory: isPending ? [] : [{ amount, paidOn: new Date(2023 + (m >= 2 ? 1 : 0), (m + 10) % 12, 2), method: 'Online' }],
      });
    }
  }
  await Fee.insertMany(feeRecords);
  console.log(`✅ ${feeRecords.length} fee records created`);

  // Complaints
  const complaintTitles = ['WiFi slow', 'Leaking tap', 'Room cleaning skipped', 'Fan making noise', 'AC not cooling', 'Loud neighbors', 'Window latch broken', 'Mosquitoes in room'];
  const complaintCategories = ['Internet', 'Maintenance', 'Cleanliness', 'Maintenance', 'Maintenance', 'Noise', 'Security', 'Other'];
  
  const complaintsData = [];
  for (let i = 0; i < 20; i++) {
    const student = students[i % students.length];
    const isResolved = i % 3 === 0;
    complaintsData.push({
      student: student._id,
      title: complaintTitles[i % complaintTitles.length],
      category: complaintCategories[i % complaintCategories.length],
      description: 'Please fix this issue as soon as possible. It is causing a lot of inconvenience.',
      status: isResolved ? 'Resolved' : i % 2 === 0 ? 'Pending' : 'In Progress',
      priority: i % 4 === 0 ? 'High' : 'Medium',
      adminRemarks: isResolved ? 'Fixed by maintenance team.' : '',
      resolvedAt: isResolved ? new Date() : null,
      resolvedBy: isResolved ? admin._id : null
    });
  }
  await Complaint.insertMany(complaintsData);
  console.log(`✅ ${complaintsData.length} complaints created`);

  console.log('\n🎉 Database heavily seeded successfully!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
