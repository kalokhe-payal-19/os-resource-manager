// ================== DATA STORAGE ==================
let cpuHistory = [];
let memHistory = [];

// ================== CHART SETUP ==================
const cpuCtx = document.getElementById("cpuChart").getContext("2d");
const memCtx = document.getElementById("memChart").getContext("2d");

const cpuChart = new Chart(cpuCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU Usage',
            data: [],
            borderColor: '#00F5FF',
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: { beginAtZero: true, max: 100 }
        }
    }
});

const memChart = new Chart(memCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Memory Usage',
            data: [],
            borderColor: '#00FF9C',
            borderWidth: 2,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: { display: false },
            y: { beginAtZero: true, max: 100 }
        }
    }
});

function showAlert(message) {
    let box = document.getElementById("alertBox");

    if (!box) return; // safety check

    box.innerText = message;
    box.style.display = "block";

    setTimeout(() => {
        box.style.display = "none";
    }, 3000);
}

// ================== MAIN ANALYZER ==================
async function analyzeSystem() {

    try {
        let res = await fetch("http://127.0.0.1:5000/data");
        let data = await res.json();

        let cpu = data.cpu;
        let mem = data.memory;

        // ================= HISTORY =================
        cpuHistory.push(cpu);
        memHistory.push(mem);

        if (cpuHistory.length > 10) cpuHistory.shift();
        if (memHistory.length > 10) memHistory.shift();

        // ================= UPDATE CHARTS =================
        cpuChart.data.labels = cpuHistory.map((_, i) => i);
        cpuChart.data.datasets[0].data = cpuHistory;
        cpuChart.update();

        memChart.data.labels = memHistory.map((_, i) => i);
        memChart.data.datasets[0].data = memHistory;
        memChart.update();

        // ================= ANALYSIS =================
        let score = 100;
        let issues = [];
        let suggestions = [];

        // CPU Logic
        if (cpu > 85) {
            score -= 35;
            issues.push("🔴 Critical CPU usage (" + cpu.toFixed(1) + "%)");
            suggestions.push("Close heavy applications immediately");
            showAlert("⚠️ Critical CPU usage!");
        } 
        else if (cpu > 65) {
            score -= 20;
            issues.push("🟠 High CPU usage (" + cpu.toFixed(1) + "%)");
            suggestions.push("Reduce multitasking");
        } 
        else if (cpu > 40) {
            score -= 10;
            issues.push("🟡 Moderate CPU usage");
        }

        // Memory Logic
        if (mem > 85) {
            score -= 35;
            issues.push("🔴 Critical Memory usage (" + mem.toFixed(1) + "%)");
            suggestions.push("Restart system to free memory");
        } 
        else if (mem > 65) {
            score -= 20;
            issues.push("🟠 High Memory usage (" + mem.toFixed(1) + "%)");
            suggestions.push("Close background apps");
        } 
        else if (mem > 45) {
            score -= 10;
            issues.push("🟡 Moderate Memory usage");
        }

        // Combined overload
        if (cpu > 75 && mem > 75) {
            score -= 10;
            issues.push("⚠️ System under heavy load");
            suggestions.push("Consider performance optimization");
        }

        // Trend detection
        if (cpuHistory.length >= 3) {
            let trend = cpuHistory[cpuHistory.length - 1] - cpuHistory[0];
            if (trend > 20) {
                issues.push("📈 CPU usage increasing trend");
            }
        }

        // No issues
        if (issues.length === 0) {
            issues.push("✅ System running optimally");
            suggestions.push("No action required");
        }

        // ================= SCORE COLOR =================
        let color = "#00FF9C"; // green
        if (score < 50) color = "#FF3C3C";
        else if (score < 75) color = "#FFA500";

        // ================= UPDATE UI =================

        // Circular meter
        let circle = document.querySelector(".health-circle");
        if (circle) {
            circle.style.background =
                `conic-gradient(${color} ${score}%, #111 ${score}%)`;
        }

        // Score text
        document.getElementById("healthScore").innerText = score + "%";
        document.getElementById("healthScore").style.color = color;

        // Issues
        document.getElementById("issues").innerHTML =
            issues.map(i => `<li>${i}</li>`).join("");

        // Suggestions
        document.getElementById("suggestionsList").innerHTML =
            suggestions.map(s => `<li>${s}</li>`).join("");

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// ================= AUTO REFRESH =================
setInterval(analyzeSystem, 2000);
analyzeSystem();