let cpuData = [];
let memData = [];
let labels = [];

// ================= CPU CHART =================
let cpuChart = new Chart(document.getElementById("cpuChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "CPU %",
            data: cpuData,
            borderColor: "#00F5FF",
            fill: false
        }]
    }
});

// ================= MEMORY CHART =================
let memChart = new Chart(document.getElementById("memChart"), {
    type: "line",
    data: {
        labels: labels,
        datasets: [{
            label: "Memory %",
            data: memData,
            borderColor: "#00FF9C",
            fill: false
        }]
    }
});

// ================= PROCESS PIE =================
let procChart = new Chart(document.getElementById("procChart"), {
    type: "pie",
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: ["#00F5FF", "#00FF9C", "#FF3CAC", "#FFA500", "#FF3C3C"]
        }]
    }
});

// ================= FETCH DATA =================
async function updateAnalytics() {
    try {
        // CPU + Memory
        let res = await fetch("http://127.0.0.1:5000/data");
        let sys = await res.json();

        // Processes
        let pres = await fetch("http://127.0.0.1:5000/processes");
        let procs = await pres.json();

        let time = new Date().toLocaleTimeString();

        labels.push(time);
        cpuData.push(sys.cpu);
        memData.push(sys.memory);

        if (labels.length > 10) {
            labels.shift();
            cpuData.shift();
            memData.shift();
        }

        cpuChart.update();
        memChart.update();

        // PIE CHART (top 5 processes)
        let top = procs.slice(0, 5);

        procChart.data.labels = top.map(p => p.name);
        procChart.data.datasets[0].data = top.map(p => p.cpu);

        procChart.update();

        generateInsights(sys, procs);

    } catch (err) {
        console.error(err);
    }
}

// ================= SMART INSIGHTS =================
function generateInsights(sys, procs) {
    let list = document.getElementById("insights");
    list.innerHTML = "";

    if (sys.cpu > 80) {
        list.innerHTML += "<li>⚠️ High CPU usage detected</li>";
    }

    if (sys.memory > 75) {
        list.innerHTML += "<li>⚠️ Memory usage is high</li>";
    }

    let heavy = procs[0];
    if (heavy) {
        list.innerHTML += `<li>🔥 ${heavy.name} is consuming highest CPU</li>`;
    }

    if (sys.cpu < 50 && sys.memory < 50) {
        list.innerHTML += "<li>✅ System running optimally</li>";
    }
}

// ================= AUTO UPDATE =================
setInterval(updateAnalytics, 3000);
updateAnalytics();