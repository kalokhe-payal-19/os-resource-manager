// Time
setInterval(() => {
    document.getElementById("time").innerText =
        new Date().toLocaleTimeString();
}, 1000);

// real Data Update]

setInterval(async () => {

    let res = await fetch("http://127.0.0.1:5000/data");
    let data = await res.json();

    let cpu = Math.floor(data.cpu);
    let mem = Math.floor(data.memory);

    document.getElementById("cpuValue").innerText = cpu + "%";
    document.getElementById("memValue").innerText = mem + "%";

    document.querySelector(".circle").style.background =
        `conic-gradient(#00F5FF ${cpu}%, #111 ${cpu}%)`;

    document.querySelector(".mem").style.background =
        `conic-gradient(#00FF9C ${mem}%, #111 ${mem}%)`;

    let suggestion = "System stable ✅";

    if(cpu > 80) suggestion = "High CPU usage ⚠️";
    if(mem > 75) suggestion = "Memory almost full ⚠️";

    document.getElementById("suggestions").innerHTML =
        "<h3>Smart Suggestions</h3><p>" + suggestion + "</p>";

}, 2000);

async function loadDashboardProcesses() {
    try {
        let res = await fetch("http://127.0.0.1:5000/processes");
        let data = await res.json();

        let table = document.getElementById("dashboardProcesses");

        if (!table) return;

        table.innerHTML = `
            <tr>
                <th>Name</th>
                <th>CPU %</th>
                <th>Memory (MB)</th>
            </tr>
        `;

        // show top 10 processes (clean UI)
        data.slice(0, 10).forEach(p => {
            table.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.cpu}%</td>
                    <td>${p.memory}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error("Dashboard error:", err);
    }
}

// auto refresh
setInterval(loadDashboardProcesses, 3000);
loadDashboardProcesses();