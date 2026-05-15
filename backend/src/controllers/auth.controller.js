import { AuthService } from '../services/auth.service.js';
import { sendMailAsync } from '../services/mail.service.js'; // 🌟 ADD
import { signupTemplate } from '../services/mail.templates.js';

export const AuthController = {
  async syncUser(req, res) {
    try {
      // req.user is guaranteed to exist because of requireAuth middleware
      const localUser = await AuthService.syncSupabaseUser(req.user);
      
      // console.log(`✅ [Auth] Database sync successful for: ${localUser.email}`);
      const isNewUser = Math.abs(new Date(localUser.created_at) - new Date(localUser.updated_at)) < 1000;
      
      if (isNewUser) {
        sendMailAsync({
          to: localUser.email,
          subject: "Welcome to Evalix AI 🚀",
          html: signupTemplate(localUser.name)
        });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "User synced to database successfully",
        user: localUser 
      });

    } catch (error) {
      console.error("❌ [Auth] Sync Controller Error:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to sync user to database" 
      });
    }
  }
};