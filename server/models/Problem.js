import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  hidden: { type: Boolean, default: false },
  desc: { type: String, default: 'Test Case' }
}, { _id: false });

const hintSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  cost: { type: Number, default: 15 },
  text: { type: String, required: true }
}, { _id: false });

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  moduleId: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  syllabusRef: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Cadet', 'Explorer', 'Commander', 'Veteran'],
    default: 'Cadet'
  },
  xpReward: {
    type: Number,
    default: 100
  },
  description: {
    type: String,
    required: true
  },
  inputFormat: {
    type: String,
    default: ''
  },
  outputFormat: {
    type: String,
    default: ''
  },
  constraints: {
    type: String,
    default: ''
  },
  sampleInput: {
    type: String,
    default: ''
  },
  sampleOutput: {
    type: String,
    default: ''
  },
  hints: {
    type: [hintSchema],
    default: []
  },
  starterCode: {
    type: String,
    default: ''
  },
  solutionCode: {
    type: String,
    default: ''
  },
  testCases: {
    type: [testCaseSchema],
    default: []
  },
  isCustom: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

problemSchema.index({ moduleId: 1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
