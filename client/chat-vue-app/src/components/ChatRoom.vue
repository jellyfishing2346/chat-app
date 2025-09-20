<template>
  <div class="chat-room">
    <h2>Group Chat</h2>
    <div class="presence">
      <span v-for="user in users" :key="user.id" class="user">🟢 {{ user.name }}</span>
    </div>
    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <strong>{{ msg.user }}:</strong> {{ msg.text }}
      </div>
    </div>
    <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
    <button @click="sendMessage">Send</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import socket from '../socket';

const messages = ref([]);
const newMessage = ref('');
const users = ref([]);

onMounted(() => {
  // Firebase messages
  const q = query(collection(db, 'messages'), orderBy('createdAt'));
  onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  });

  // WebSocket: user presence
  socket.emit('join-room', { room: 'global' });
  socket.on('users', (userList) => {
    users.value = userList;
  });
});

onUnmounted(() => {
  socket.off('users');
});

async function sendMessage() {
  if (!newMessage.value.trim()) return;
  await addDoc(collection(db, 'messages'), {
    text: newMessage.value,
    user: 'Anonymous', // Replace with actual user
    createdAt: new Date()
  });
  socket.emit('message', { text: newMessage.value, user: 'Anonymous' });
  newMessage.value = '';
}
</script>

<style scoped>
.chat-room { max-width: 400px; margin: 0 auto; }
.messages { height: 300px; overflow-y: auto; border: 1px solid #ccc; margin-bottom: 10px; padding: 10px; }
.message { margin-bottom: 8px; }
.presence { margin-bottom: 10px; }
.user { margin-right: 8px; color: green; }
</style>
