import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();

// ================= REGISTER / SIGN UP =================
router.post('/register', async (req, res) => {
  try {
    const { role = 'student', mobileNo, rollNo, facultyId, name, password, passkey, avatar } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters long.' });
    }

    if (role === 'student') {
      const rawMobile = mobileNo || rollNo || '';
      const cleanMobile = rawMobile.toString().trim().replace(/[^0-9]/g, '');

      if (!cleanMobile || cleanMobile.length < 10) {
        return res.status(400).json({ 
          success: false, 
          error: 'Please enter a valid 10-digit mobile number for student registration.' 
        });
      }

      const existing = await User.findOne({ mobileNo: cleanMobile });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: `Mobile number "${cleanMobile}" is already registered. Please sign in.` 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        role: 'student',
        mobileNo: cleanMobile,
        name: name.trim(),
        password: hashedPassword,
        avatar: avatar || '/sprites/astronaut_idle.png',
        progress: {
          xp: 0,
          clearedProblems: [],
          attemptedProblems: [],
          unlockedSectors: [1],
          unlockedAchievements: []
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Cadet account created successfully!',
        user: {
          id: newUser._id,
          role: newUser.role,
          mobileNo: newUser.mobileNo,
          name: newUser.name,
          avatar: newUser.avatar,
          progress: newUser.progress
        }
      });
    } else if (role === 'admin') {
      const cleanId = (facultyId || mobileNo || '').toString().trim().toUpperCase();
      if (!cleanId) {
        return res.status(400).json({ success: false, error: 'Faculty / TA Identifier is required.' });
      }

      const existing = await User.findOne({ 
        $or: [
          { facultyId: cleanId },
          { mobileNo: cleanId }
        ] 
      });
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: `Faculty account "${cleanId}" is already registered. Please log in.` 
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = await User.create({
        role: 'admin',
        facultyId: cleanId,
        mobileNo: cleanId.replace(/[^0-9]/g, '') || undefined,
        name: name.trim(),
        password: hashedPassword,
        avatar: avatar || '/sprites/astronaut_typing.png',
        progress: {
          xp: 0,
          clearedProblems: [],
          attemptedProblems: [],
          unlockedSectors: [1, 2, 3, 4, 5, 6],
          unlockedAchievements: []
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Faculty account created successfully!',
        user: {
          id: newAdmin._id,
          role: newAdmin.role,
          facultyId: newAdmin.facultyId,
          mobileNo: newAdmin.mobileNo,
          name: newAdmin.name,
          avatar: newAdmin.avatar,
          progress: newAdmin.progress
        }
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid user role.' });
    }
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during registration.' });
  }
});

// ================= LOGIN / SIGN IN =================
router.post('/login', async (req, res) => {
  try {
    const { role = 'student', mobileNo, rollNo, facultyId, password } = req.body;

    if (!password || !password.trim()) {
      return res.status(400).json({ success: false, error: 'Please enter your password / passcode.' });
    }

    if (role === 'student') {
      const rawMobile = mobileNo || rollNo || '';
      const cleanMobile = rawMobile.toString().trim().replace(/[^0-9]/g, '');

      if (!cleanMobile) {
        return res.status(400).json({ success: false, error: 'Please enter your Mobile Number.' });
      }

      // Strictly find from database - NO demo hardcoded auto-provision
      const user = await User.findOne({ 
        $or: [
          { mobileNo: cleanMobile },
          { rollNo: rawMobile.trim().toUpperCase() }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Cadet with Mobile Number "${cleanMobile}" not found. Please create an account.`
        });
      }

      // Strictly verify password - NO bypass
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect passcode for this Cadet account.' });
      }

      return res.json({
        success: true,
        message: 'Login successful!',
        user: {
          id: user._id,
          role: 'student',
          mobileNo: user.mobileNo || cleanMobile,
          name: user.name,
          avatar: user.avatar,
          progress: user.progress || {
            xp: 0,
            clearedProblems: [],
            attemptedProblems: [],
            unlockedSectors: [1],
            unlockedAchievements: []
          }
        }
      });
    } else if (role === 'admin') {
      const cleanId = (facultyId || mobileNo || '').toString().trim().toUpperCase();
      if (!cleanId) {
        return res.status(400).json({ success: false, error: 'Please enter your Faculty / TA Identifier or Mobile Number.' });
      }

      // Strictly find from database - NO demo auto-provision
      const user = await User.findOne({ 
        $or: [
          { facultyId: cleanId },
          { mobileNo: cleanId.replace(/[^0-9]/g, '') }
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: `Faculty account "${cleanId}" not found. Please create an account.`
        });
      }

      // Strictly verify password - NO bypass
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid Faculty Security Passcode.' });
      }

      return res.json({
        success: true,
        message: 'Faculty Deck access granted!',
        user: {
          id: user._id,
          role: 'admin',
          facultyId: user.facultyId,
          mobileNo: user.mobileNo,
          name: user.name,
          avatar: user.avatar,
          progress: user.progress
        }
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error during login.' });
  }
});

// ================= USER PROGRESS SYNC =================
router.post('/progress', async (req, res) => {
  try {
    const { mobileNo, rollNo, facultyId, progress, avatar } = req.body;

    let filter = null;
    if (mobileNo) {
      const cleanMobile = mobileNo.toString().trim().replace(/[^0-9]/g, '');
      filter = {
        $or: [
          { mobileNo: cleanMobile },
          { rollNo: cleanMobile }
        ]
      };
    } else if (rollNo) {
      filter = { rollNo: rollNo.trim().toUpperCase() };
    } else if (facultyId) {
      filter = { facultyId: facultyId.trim().toUpperCase() };
    } else {
      return res.status(400).json({ success: false, error: 'User identifier required.' });
    }

    const update = {};
    if (progress) update.progress = progress;
    if (avatar) update.avatar = avatar;

    const user = await User.findOneAndUpdate(filter, { $set: update }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found to update progress.' });
    }

    return res.json({
      success: true,
      progress: user.progress,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('[Progress Sync Error]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
