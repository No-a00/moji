import mongoose from 'mongoose';

async function checkDB() {
  await mongoose.connect('mongodb://localhost:27017/moji_db');
  
  const userSchema = new mongoose.Schema({ username: String, displayName: String });
  const User = mongoose.model('User', userSchema);
  
  const convoSchema = new mongoose.Schema({ type: String, group: Object, participant: Array });
  const Conversation = mongoose.model('Conversation', convoSchema);
  
  const users = await User.find({});
  console.log('All Users:', users.map(u => u.username));
  
  const zero = users.find(u => u.username === 'Zero' || (u.displayName && u.displayName.includes('Zero')));
  if (zero) {
    console.log('Zero ID:', zero._id);
    const convos = await Conversation.find({ 'participant.userId': zero._id });
    console.log('Zero Convos:', convos.map(c => ({
      id: c._id,
      type: c.type,
      name: c.group ? c.group.name : 'Direct',
      participants: c.participant
    })));
  } else {
    console.log('Zero not found');
  }

  const u111 = users.find(u => u.username === '111');
  if (u111) {
    console.log('111 ID:', u111._id);
    const convos = await Conversation.find({ 'participant.userId': u111._id });
    console.log('111 Convos:', convos.map(c => ({
      id: c._id,
      type: c.type,
      name: c.group ? c.group.name : 'Direct',
      participants: c.participant
    })));
  } else {
    console.log('111 not found');
  }
  
  process.exit(0);
}

checkDB().catch(err => {
  console.error(err);
  process.exit(1);
});
