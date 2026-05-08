const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/college-notes');
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'sidhmangal@gmail.com' },
    { $set: { role: 'superadmin', isApproved: true } }
  );
  console.log("SUCCESS!");
  process.exit(0);
}

run().catch(console.error);
