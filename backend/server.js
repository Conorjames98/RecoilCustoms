require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// Uses SUPABASE_ANON_KEY — RLS handles row-level security

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

app.use('/api/users',        require('./routes/users'));
app.use('/api/communities',  require('./routes/communities'));
app.use('/api/sessions',     require('./routes/sessions'));
app.use('/api/rounds',       require('./routes/rounds'));
app.use('/api/teams',        require('./routes/teams'));
app.use('/api/discord',      require('./routes/discord'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Recoil backend on port ${PORT}`);
  if (process.env.DISCORD_TOKEN) {
    require('./discord/deploy-commands');
    require('./discord/index');
    console.log('Discord bot starting...');
  }
});
