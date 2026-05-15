// backend/src/controllers/user.controller.js
import { UserRepository } from '../repositories/user.repository.js';

export const UserController = {
  
  // GET: /api/user/profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id; 
      const user = await UserRepository.getUserProfile(userId);
      
      if (!user) return res.status(404).json({ error: "User profile not found." });
      return res.status(200).json({ user });
    } catch (error) {
      console.error("[UserController] Fetch Profile Error:", error);
      return res.status(500).json({ error: "Failed to fetch profile." });
    }
  },

  // PUT: /api/user/profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      
      // 1. Fetch existing user to determine their role
      const existingUser = await UserRepository.getUserProfile(userId);
      if (!existingUser) return res.status(404).json({ error: "User not found." });

      // 2. Extract frontend data
      const { department, year, batch, university_roll, registration_number } = req.body;

      // 3. Build the Payload based on Role (The Controller Shield)
      let updateData = {};

      if (existingUser.role === 'TEACHER') {
        // Teachers only get to update their department
        updateData = { department };
      } else {
        // Students get the full academic profile
        updateData = {
          department,
          year,
          batch,
          university_roll,
          registration_number
        };
      }

      // 4. Update the Database
      const updatedUser = await UserRepository.updateProfile(userId, updateData);

      return res.status(200).json({
        message: "Profile updated successfully.",
        user: updatedUser
      });

    } catch (error) {
      console.error("[UserController] Update Profile Error:", error);
      
      // 🌟 NEW: Catch the "Unique Constraint" Error for Roll/Registration Numbers
      if (error.code === 'P2002') {
         return res.status(400).json({ 
           error: "This University Roll or Registration Number is already registered to another student." 
         });
      }
      
      // Catch Enum Typos
      if (error.message.includes('Invalid enum value')) {
         return res.status(400).json({ error: "Invalid Year, Batch, or Department selected." });
      }
      
      return res.status(500).json({ error: "Failed to update profile." });
    }
  }
};