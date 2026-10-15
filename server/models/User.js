import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
    required: true
  },
  mobileNo: {
    type: String,
    trim: true
  },
  rollNo: {
    type: String,
    uppercase: true,
    trim: true
  },
  facultyId: {
    type: String,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: '/sprites/astronaut_idle.png'
  },
  progress: {
    xp: { type: Number, default: 0 },
    clearedProblems: { type: [String], default: [] },
    attemptedProblems: { type: [String], default: [] },
    unlockedSectors: { type: [Number], default: [1] },
    unlockedAchievements: { type: [String], default: [] }
  }
}, {
  timestamps: true
});

userSchema.index({ mobileNo: 1 }, { unique: true, sparse: true });
userSchema.index({ rollNo: 1 }, { unique: true, sparse: true });
userSchema.index({ facultyId: 1 }, { unique: true, sparse: true });

const User = mongoose.model('User', userSchema);

export default User;
