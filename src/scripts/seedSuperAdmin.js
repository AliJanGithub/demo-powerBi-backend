// server/src/scripts/seedSuperAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import  {User}  from "../models/user.model.js"
import { connectDB } from "../configs/db.js";
import { config } from "../configs/secrets.js";

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    await connectDB()
    const passwordHash = await bcrypt.hash("SuperAdmin@123", 10);

    const exists = await User.findOne({ role: "SUPER_ADMIN" });
    if (exists) {
      console.log("✅ Super Admin already exists:", exists.email);
      process.exit(0);
    }

    const user = new User({
      name: "Main Super Admin",
      email: "alijan061333@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true
    });

    await user.save();
    console.log("🎉 Super Admin created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error creating Super Admin:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
