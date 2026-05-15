// backend/src/repositories/user.repository.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const UserRepository = {
  // Your existing sync method (used during login/signup)
  async syncUser(id, email, name, role, department) {
    return await prisma.user.upsert({
      where: { id },
      update: { email, name, department, role }, 
      create: { id, email, name, role, department }
    });
  },

  // 🌟 NEW: Fetch profile details
  async getUserProfile(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        department: true, 
        year: true, 
        batch: true,
        university_roll: true,     // 🌟 Added
        registration_number: true  // 🌟 Added
      }
    });
  },

  // 🌟 NEW: Update year, batch, and department
  async updateProfile(id, profileData) {
    return await prisma.user.update({
      where: { id },
      data: profileData,
      select: { // Return the updated fields so the frontend can update its state
        id: true,
        name: true,
        department: true,
        year: true,
        batch: true,
        university_roll: true,     // 🌟 Added
        registration_number: true  // 🌟 Added
      }
    });
  },

  // 🌟 NEW: Fetch only the emails of a specific student cohort
  async getTargetedStudents(department, year, batch) {
    return await prisma.user.findMany({
      where: {
        role: "STUDENT",
        department: department,
        year: year,
        batch: batch
      },
      select: { email: true } // Memory optimization: Only grab the email string!
    });
  }
};