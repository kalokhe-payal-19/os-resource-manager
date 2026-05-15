const ctx = document.getElementById('cpuChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["1","2","3","4","5"],
        datasets: [{
            label: 'CPU Usage',
            data: [20,40,30,60,50],
            borderColor: '#00F5FF',
        }]
    }
});