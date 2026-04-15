const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edujobs_scholars', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Define Models (will move to separate files later)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  savedOpportunities: [{ type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' }],
  onModel: { type: String, enum: ['University', 'Job'] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Basic Routes
app.get('/', (req, res) => {
  res.send('EduJobs Scholars API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
