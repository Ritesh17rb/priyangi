import app, { ensureServerReady } from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`✨ Priyangi server on http://localhost:${PORT}`));

async function tryConnect(attempt = 1) {
  try {
    await ensureServerReady();
    console.log('✅ Ready — open http://localhost:5173');
  } catch (error) {
    const reason = error?.message || String(error);
    console.error(
      `❌ MongoDB connection attempt #${attempt} failed:\n   ${reason}\n` +
        '   → Whitelist your IP in MongoDB Atlas (Network Access → Add Current IP Address)\n' +
        '   → Verify MONGODB_URI password in server/.env\n' +
        '   Retrying in 15s...'
    );
    setTimeout(() => tryConnect(attempt + 1), 15000);
  }
}

tryConnect();
