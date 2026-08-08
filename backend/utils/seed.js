require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Country = require("../models/Country");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected for seeding...");

  const adminEmail = "admin@medicooverseas.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Super Admin",
      email: adminEmail,
      phone: "6301878730",
      password: "ChangeMe123!", // change immediately after first login
      role: "super_admin",
      isEmailVerified: true,
    });
    console.log(`Created super admin: ${adminEmail} / ChangeMe123!`);
  } else {
    console.log("Super admin already exists, skipping.");
  }
  const counsellorEmail = "counsellor@medicooverseas.com";

  const existingCounsellor = await User.findOne({
    email: counsellorEmail,
  });

  if (!existingCounsellor) {
    await User.create({
      name: "Demo Counsellor",
      email: counsellorEmail,
      phone: "8888888888",
      password: "ChangeMe123!",
      role: "counsellor",
      isEmailVerified: true,
    });

    console.log(`Created counsellor: ${counsellorEmail} / ChangeMe123!`);
  }

  const sampleCountries = [
    {
      name: "Russia",
      shortDescription:
        "Globally recognized medical education at affordable tuition fees.",
      overview:
        "Russia is one of the most popular MBBS-abroad destinations for Indian students...",
      eligibility: { minAge: 17, neetRequired: true, minAcademicPercent: 50 },
      livingCost: { monthlyEstimate: 200, currency: "USD" },
    },
    {
      name: "Georgia",
      shortDescription:
        "Modern curriculum with strong NMC recognition track record.",
      overview:
        "Georgia has become a fast-growing destination for MBBS aspirants...",
      eligibility: { minAge: 17, neetRequired: true, minAcademicPercent: 50 },
      livingCost: { monthlyEstimate: 250, currency: "USD" },
    },
  ];

  for (const c of sampleCountries) {
    const exists = await Country.findOne({ name: c.name });
    if (!exists) {
      await Country.create(c);
      console.log(`Seeded country: ${c.name}`);
    }
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
