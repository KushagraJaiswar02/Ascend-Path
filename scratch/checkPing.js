const mongoose = require('mongoose');

const mongoUri = 'mongodb://localhost:27017/ascendPath';

const userSchema = new mongoose.Schema({
  name: String,
  role: String
});

const pingSchema = new mongoose.Schema({
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: String,
  status: String,
  response: String
});

const User = mongoose.model('User', userSchema);
const PingRequest = mongoose.model('PingRequest', pingSchema);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const pingId = '6a120c7985cceb556b7993ab';
    const ping = await PingRequest.findById(pingId).populate('fromUserId toUserId', 'name role');
    if (!ping) {
      console.log('Ping not found');
      return;
    }

    console.log('toUserId type:', typeof ping.toUserId);
    console.log('toUserId constructor:', ping.toUserId.constructor.name);
    console.log('toUserId stringified:', ping.toUserId.toString());
    console.log('toUserId _id:', ping.toUserId._id);
    
    // Test extraction logic
    const toUserIdStrSimple = ping.toUserId ? (typeof ping.toUserId === 'string' ? ping.toUserId : (ping.toUserId._id ? ping.toUserId._id.toString() : null)) : null;
    console.log('toUserIdStrSimple:', toUserIdStrSimple);

    const toUserIdStrHardened = ping.toUserId 
      ? (ping.toUserId._id ? ping.toUserId._id.toString() : ping.toUserId.toString())
      : null;
    console.log('toUserIdStrHardened:', toUserIdStrHardened);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
