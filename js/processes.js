let processData = [];

async function loadProcesses() {
    let res = await fetch("http://127.0.0.1:5000/processes");
    processData = await res.json();
    render(processData);
}

function render(data) {
    let table = document.getElementById("procTable");
    table.innerHTML = `
        <tr>
            <th>Name</th>
            <th>PID</th>
            <th>CPU %</th>
            <th>Memory (MB)</th>
        </tr>
    `;

    data.forEach(p => {
        table.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.pid}</td>
                <td>${p.cpu}</td>
                <td>${p.memory}</td>
            </tr>
        `;
    });
}

function sortBy(type) {
    let sorted = [...processData].sort((a, b) => b[type] - a[type]);
    render(sorted);
}

document.getElementById("search").addEventListener("input", (e) => {
    let val = e.target.value.toLowerCase();
    let filtered = processData.filter(p => p.name.toLowerCase().includes(val));
    render(filtered);
});

setInterval(loadProcesses, 3000);
loadProcesses();