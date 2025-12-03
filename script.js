// --- Variabel DOM ---
const loadingScreen = document.getElementById('loading-screen');
const loginPopup = document.getElementById('login-popup');
const dashboardContainer = document.getElementById('dashboard-container');
const googleBtn = document.getElementById('google-login-btn');
const dummyBtn = document.getElementById('dummy-login-btn');
const prodNumDisplay = document.getElementById('prod-num');
const salesNumDisplay = document.getElementById('sales-num');

// --- LOGIKA 1: LOADING SCREEN TIMER (10 Detik) ---
window.addEventListener('load', () => {
    setTimeout(() => {
        // Setelah 10 detik, sembunyikan loading, tampilkan login
        loadingScreen.classList.add('hidden');
        loginPopup.classList.remove('hidden');
        // Mulai animasi salju setelah halaman login muncul
        initSnowAnimation();
    }, 10000); // 10000 milidetik = 10 detik
});


// --- LOGIKA 2: SIMULASI LOGIN ---
function masukDashboard() {
    loginPopup.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    document.body.style.overflow = 'auto'; // Izinkan scroll di dashboard
    // Mulai update data grafik secara realtime setelah masuk dashboard
    startRealtimeData();
}

// Klik tombol simulasi
googleBtn.addEventListener('click', masukDashboard);
dummyBtn.addEventListener('click', masukDashboard);


// --- LOGIKA 3: ANIMASI SALJU INTERAKTIF (Canvas) ---
let snowCanvas, ctx;
let particles = [];
let mouse = { x: 0, y: 0 };

function initSnowAnimation() {
    snowCanvas = document.getElementById('snow-canvas');
    ctx = snowCanvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // Event listener untuk krusor
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Buat partikel salju awal
    for(let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
    animateSnow();
}

function resizeCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * snowCanvas.width;
        this.y = Math.random() * snowCanvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 + 0.5;
    }
    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        
        // Interaksi dengan mouse (hempasan angin)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 100) {
            this.x -= dx * 0.01;
            this.y -= dy * 0.01;
        }

        // Reset posisi jika keluar layar
        if (this.y > snowCanvas.height) this.y = 0;
        if (this.x > snowCanvas.width || this.x < 0) {
            this.x = Math.random() * snowCanvas.width;
        }
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animateSnow() {
    ctx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    if(!loginPopup.classList.contains('hidden')) {
        requestAnimationFrame(animateSnow);
    }
}


// --- LOGIKA 4: GRAFIK REALTIME DUMMY (Chart.js) ---
let mainChart;
let totalProd = 0;
let totalSales = 0;

function startRealtimeData() {
    const ctxChart = document.getElementById('mainChart').getContext('2d');
    
    // Data awal kosong
    const initialData = {
        labels: [],
        datasets: [
            {
                label: 'Produksi (Kg)',
                borderColor: '#a6e7ff',
                backgroundColor: 'rgba(166, 231, 255, 0.2)',
                data: [],
                fill: true,
                tension: 0.4
            },
            {
                label: 'Penjualan (Ribu IDR)',
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.2)',
                data: [],
                fill: true,
                tension: 0.4
            }
        ]
    };

    mainChart = new Chart(ctxChart, {
        type: 'line',
        data: initialData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            animation: { duration: 500 } // Animasi update halus
        }
    });

    // Update data setiap 2 detik
    setInterval(addData, 2000);
}

function addData() {
    const now = new Date();
    const timeLabel = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

    // --- MEMBUAT ANGKA ACAK (DUMMY) ---
    const newProd = Math.floor(Math.random() * 50) + 10; // Random 10-60 Kg
    const newSales = Math.floor(Math.random() * 500) + 100; // Random 100-600 Ribu

    // Update Data Total di Kartu Atas
    totalProd += newProd;
    totalSales += newSales * 1000;
    prodNumDisplay.innerText = totalProd + " Kg";
    salesNumDisplay.innerText = "Rp " + totalSales.toLocaleString('id-ID');

    // Masukkan data ke grafik
    if (mainChart.data.labels.length > 10) {
        // Hapus data terlama jika sudah lebih dari 10 titik agar grafik bergerak
        mainChart.data.labels.shift();
        mainChart.data.datasets[0].data.shift();
        mainChart.data.datasets[1].data.shift();
    }

    mainChart.data.labels.push(timeLabel);
    mainChart.data.datasets[0].data.push(newProd);
    mainChart.data.datasets[1].data.push(newSales);
    mainChart.update();
}
