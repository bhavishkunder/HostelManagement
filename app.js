import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import chiefRoutes from './routes/chief.js';
import wardenRoutes from './routes/warden.js';
import securityRoutes from './routes/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

mongoose.connect('mongodb://localhost:27017/mini');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/chief', chiefRoutes);
app.use('/warden', wardenRoutes);
app.use('/security', securityRoutes);

app.get('/', (req, res) => {
  res.redirect('/security/dashboard');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

