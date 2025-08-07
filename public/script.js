const firebaseConfig = {
  apiKey: "AIzaSyBiehIi38zFpJTE4HDAdTa9RMHY8pwrrOk",
    authDomain: "green-village-91449.firebaseapp.com",
    databaseURL: "https://green-village-91449-default-rtdb.firebaseio.com",
    projectId: "green-village-91449",
    storageBucket: "green-village-91449.firebasestorage.app",
    messagingSenderId: "346247076084",
    appId: "1:346247076084:web:5f57054a0aa5243c5226a1",
    measurementId: "G-W55V81G0ZM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const charts = {};

function createChart(id, sol) {
  const ctx = document.getElementById("chart" + id).getContext("2d");
  const color = sol < 30 ? '#e53935' : sol < 70 ? '#fdd835' : '#1e88e5';
  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [sol, 100 - sol],
        backgroundColor: [color, '#eee'],
        borderWidth: 2
      }]
    },
    options: {
      cutout: '70%',
      plugins: { legend: { display: false } },
      responsive: true
    }
  });
  charts[id] = chart;
}

function updateChart(id, sol) {
  const label = document.getElementById('sol' + id + 'Label');
  const color = sol < 30 ? '#e53935' : sol < 70 ? '#fdd835' : '#1e88e5';
  if (charts[id]) {
    charts[id].data.datasets[0].data = [sol, 100 - sol];
    charts[id].data.datasets[0].backgroundColor = [color, '#eee'];
    charts[id].update();
  }
  label.innerText = sol + '%';
}

function listenTerrain(id, index) {
  db.ref("terrains/" + id).on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    
    // Mettre à jour les valeurs
    document.getElementById("temp" + index).innerText = data.temp ?? '--';
    document.getElementById("hum" + index).innerText = data.humAir ?? '--';
    
    // Mettre à jour les barres de progression
    document.getElementById("tempProgress" + index).value = data.temp ?? 0;
    document.getElementById("humProgress" + index).value = data.humAir ?? 0;
    
    // Mettre à jour le statut de la pompe
    const pompe = document.getElementById("pompe" + index);
    pompe.innerText = data.pompe ?? '--';
    pompe.className = 'pump-status ' + ((data.pompe ?? '') === 'ON' ? 'on' : 'off');
    
    // Mettre à jour le graphique d'humidité du sol
    updateChart(index, data.sol ?? 0);
  });
  
  // Écouter le seuil
  db.ref("terrains/" + id + "/seuil").on("value", (snapshot) => {
    const seuil = snapshot.val();
    if (seuil !== null) {
      document.getElementById("threshold" + index).value = seuil;
    }
  });
}

function updateThreshold(terrainId) {
  const index = terrainId === 'terrain1' ? 1 : 2;
  const thresholdValue = document.getElementById("threshold" + index).value;
  if (thresholdValue >= 0 && thresholdValue <= 100) {
    db.ref("terrains/" + terrainId + "/seuil").set(parseInt(thresholdValue));
  } else {
    alert("Veuillez entrer une valeur entre 0 et 100");
  }
}

window.onload = function() {
  createChart(1, 0);
  createChart(2, 0);
  listenTerrain("terrain1", 1);
  listenTerrain("terrain2", 2);
  
  // Initialiser les valeurs par défaut
  db.ref("terrains/terrain1/seuil").once("value").then((snap) => {
    if (!snap.exists()) {
      db.ref("terrains/terrain1/seuil").set(40);
    }
  });
  
  db.ref("terrains/terrain2/seuil").once("value").then((snap) => {
    if (!snap.exists()) {
      db.ref("terrains/terrain2/seuil").set(40);
    }
  });
};