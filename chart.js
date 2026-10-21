const drawChart = (canvas, type, data) => {
  const existingChart = Chart.getChart(canvas);

  if (existingChart && existingChart.config.type === type) {
    existingChart.data.labels = data.map((item) => item.category);
    existingChart.data.datasets[0].data = data.map((item) => item.totalExpense);

    existingChart.data.datasets[0].backgroundColor = data.map(
      (_, index) => `hsl(${(index * 360) / data.length}, 70%, 75%)`,
    );

    existingChart.update();
    return existingChart;
  }

  if (existingChart) {
    existingChart.destroy();
  }

  return new Chart(canvas, {
    type: type,
    data: {
      labels: data.map((item) => item.category),
      datasets: [
        {
          label: data.map((item) => item.category),
          data: data.map((item) => item.totalExpense),
          backgroundColor: data.map(
            (_, index) => `hsl(${(index * 360) / data.length}, 70%, 75%)`,
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        colors: {
          enabled: true,
        },
      },
      animations: {
        tension: {
          duration: 1000,
          easing: "linear",
          from: 1,
          to: 0,
          loop: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
};

export default drawChart;
