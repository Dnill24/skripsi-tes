// js/versus-network.js

window.myRole = '';
window.roomCode = '';
window.roomRef = null;
window.myEventsRef = null;
window.oppEventsRef = null;

window.conn = {
  send: (data) => {
    if (window.myEventsRef) window.myEventsRef.push(data);
  },
  close: () => {
    if (window.roomRef && window.myRole === 'host') window.roomRef.remove();
  }
};

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

elements.btnHost.onclick = () => {
  if (typeof db === 'undefined') return showToast("Firebase not connected!");
  window.roomCode = generateRoomCode();
  window.myRole = 'host';
  window.roomRef = db.ref('rooms/' + window.roomCode);
  window.myEventsRef = db.ref('rooms/' + window.roomCode + '/hostEvents');
  window.oppEventsRef = db.ref('rooms/' + window.roomCode + '/clientEvents');
  
  window.roomRef.set({ status: 'waiting', hostConnected: true });
  window.roomRef.onDisconnect().remove(); // Delete room if host leaves
  
  elements.lobbySetup.classList.add('hidden');
  elements.lobbyWaiting.classList.remove('hidden');
  elements.displayRoomCode.textContent = window.roomCode;
  
  window.roomRef.on('value', snap => {
    if (!snap.exists()) return;
    const data = snap.val();
    if (data.clientConnected && data.status === 'playing') {
      window.roomRef.off('value');
      setupConnection();
    }
  });
};

elements.btnJoin.onclick = () => {
  if (typeof db === 'undefined') return showToast("Firebase not connected!");
  const code = elements.joinCodeInput.value.trim().toUpperCase();
  if (!code) return showToast("Enter a room code!");
  
  window.roomCode = code;
  window.myRole = 'client';
  window.roomRef = db.ref('rooms/' + window.roomCode);
  window.myEventsRef = db.ref('rooms/' + window.roomCode + '/clientEvents');
  window.oppEventsRef = db.ref('rooms/' + window.roomCode + '/hostEvents');
  
  window.roomRef.once('value', snap => {
    if (snap.exists() && snap.val().status === 'waiting') {
      window.roomRef.update({ clientConnected: true, status: 'playing' });
      window.roomRef.onDisconnect().update({ clientConnected: false }); // Flag if client leaves
      setupConnection();
    } else {
      showToast("Room not found or already full!");
    }
  });
};

function setupConnection() {
  window.conn.open = true;
  setTimeout(() => {
    window.conn.send({ type: 'handshake', name: user, skin: skinEmojis[selectedSkin] || '🧍', mmr: Math.floor(playerMMR) });
    
    elements.lobbyModal.classList.remove('show');
    elements.gameArena.classList.remove('hidden');
    elements.gameArena.classList.add('flex');
    
    window.startGame();
  }, 500);
  
  window.oppEventsRef.on('child_added', snap => {
    handleNetworkData(snap.val());
  });
  
  window.roomRef.on('value', snap => {
    if (!snap.exists()) {
      if (window.gameActive) window.endGame("Opponent Fled!", true);
    } else {
      const data = snap.val();
      if (data.status === 'playing' && data.clientConnected === false) {
        if (window.gameActive) window.endGame("Opponent Fled!", true);
      }
    }
  });
}

function handleNetworkData(data) {
  if (data.type === 'handshake') {
    elements.opponentName.textContent = data.name;
    const oppSkin = data.skin || '🧍';
    elements.enemySprite.textContent = oppSkin;
    if (elements.lblOpponentMMR) elements.lblOpponentMMR.textContent = data.mmr ? (window.getRankFromMMR ? window.getRankFromMMR(data.mmr) : `MMR: ${data.mmr}`) : (window.getRankFromMMR ? window.getRankFromMMR(0) : '🪨 Iron');
  } else if (data.type === 'update') {
    window.opponentHP = data.hp;
    window.opponentCombo = data.combo;
    elements.lblOpponentHp.textContent = `${window.opponentHP}/100`;
    elements.barOpponentHp.style.width = `${Math.max(0, window.opponentHP)}%`;
    
    if (window.opponentCombo > 1) {
      elements.opponentCombo.textContent = `${window.opponentCombo}x`;
      elements.opponentCombo.classList.remove('hidden');
    } else {
      elements.opponentCombo.classList.add('hidden');
    }
  } else if (data.type === 'attack') {
    if (typeof triggerEnemyAttack !== 'undefined') triggerEnemyAttack();
    setTimeout(() => {
      window.takeDamage(data.damage);
    }, 250);
  } else if (data.type === 'gameover') {
    window.endGame(getTranslation('txt_you_win', settings.language), true);
  } else if (data.type === 'rematch') {
    window.opponentRematchReady = true;
    if (window.myRematchReady) {
      window.startGame();
    } else {
      elements.rematchStatus.textContent = getTranslation('txt_opponent_rematch', settings.language);
      elements.rematchStatus.classList.remove('hidden');
    }
  } else if (data.type === 'forfeit') {
    window.endGame("Opponent Forfeited!", true);
  }
}

window.broadcastUpdate = function() {
  if (window.conn && window.conn.open) {
    window.conn.send({ type: 'update', hp: window.playerHP, combo: window.combo });
  }
}
