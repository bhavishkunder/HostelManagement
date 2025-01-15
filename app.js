import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import chiefRoutes from './routes/chief.js';
import wardenRoutes from './routes/warden.js';
import securityRoutes from './routes/security.js';
import studentRoutes from './routes/student.js';
import cleaningRoutes from './routes/cleaning.js';
import dotenv from 'dotenv';
// Load environment variables at the very beginning
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

mongoose.connect('process.env.MONGO_URI');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/HOSTELMan', express.static(path.join(__dirname, 'images')));
app.use('/chief', chiefRoutes);
app.use('/warden', wardenRoutes);
app.use('/security', securityRoutes);
app.use('/cleaning', cleaningRoutes);

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/student', studentRoutes);


app.get('/', (req, res) => {
  res.redirect('/security/dashboard');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

