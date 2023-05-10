const water_graph = document.getElementById("water-graph");
const humidity_graph = document.getElementById("humidity-graph");
const temperature_graph = document.getElementById("temperature-graph");
const moisture_graph = document.getElementById("moisture-graph");
const motor_graph = document.getElementById("motor-graph");

let water, humidity, temperature, moisture, motor, time;

async function onGraphDismount() {
  const result = await fetch("http://localhost:5000/database", {
    mode: "no-cors",
  }).then((res) => res.json());
  water = result.map((ele) => ele.water);
  humidity = result.map((ele) => ele.humidity);
  temperature = result.map((ele) => ele.temperature);
  moisture = result.map((ele) => ele.moisture);
  motor = result.map((ele) => ele.motor);
  time = result
    .map((ele) => ele.time)
    .map((time) => {
      const date = new Date(time);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const hours = ("0" + date.getHours()).slice(-2);
      const minutes = ("0" + date.getMinutes()).slice(-2);
      const seconds = ("0" + date.getSeconds()).slice(-2);
      return (year +"-" +month +"-" +day +" " +hours +":" +minutes +":" +seconds);
    });
  
  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            family: "Poppins",
          },
        },
      },
    },
  }
  
  const water_data = {
    datasets: [
      {
        label: "Water Level",
        data: [
          { x: time[0], y: water[0] },
          { x: time[1], y: water[1] },
          { x: time[2], y: water[2] },
          { x: time[3], y: water[3] },
          { x: time[4], y: water[4] },
          { x: time[5], y: water[5] },
          { x: time[6], y: water[6] },
        ].reverse(),
        fill: false,
        borderColor: "rgb(0, 107, 141)",
        pointHoverRadius: 10,
      },
    ],
  };

  const humid_data = {
    datasets: [
      {
        label: "Humidity",
        data: [
          { x: time[0], y: humidity[0] },
          { x: time[1], y: humidity[1] },
          { x: time[2], y: humidity[2] },
          { x: time[3], y: humidity[3] },
          { x: time[4], y: humidity[4] },
          { x: time[5], y: humidity[5] },
          { x: time[6], y: humidity[6] },
        ].reverse(),
        fill: false,
        borderColor: "rgb(10, 145, 107)",
        pointHoverRadius: 10,
      },
    ],
  };

  const temp_data = {
    datasets: [
      {
        label: "Temperature",
        data: [
          { x: time[0], y: temperature[0] },
          { x: time[1], y: temperature[1] },
          { x: time[2], y: temperature[2] },
          { x: time[3], y: temperature[3] },
          { x: time[4], y: temperature[4] },
          { x: time[5], y: temperature[5] },
          { x: time[6], y: temperature[6] },
        ].reverse(),
        fill: false,
        borderColor: "rgb(161, 64, 11)",
        pointHoverRadius: 10,
      },
    ],
  };

  const mois_data = {
    datasets: [
      {
        label: "Moisture",
        data: [
          { x: time[0], y: moisture[0] },
          { x: time[1], y: moisture[1] },
          { x: time[2], y: moisture[2] },
          { x: time[3], y: moisture[3] },
          { x: time[4], y: moisture[4] },
          { x: time[5], y: moisture[5] },
          { x: time[6], y: moisture[6] },
        ].reverse(),
        fill: false,
        borderColor: "rgb(10, 145, 107)",
        pointHoverRadius: 10,
      },
    ],
  };

  const motor_data = {
    datasets: [
      {
        label: "Motor Status",
        data: [
          { x: time[0], y: motor[0] },
          { x: time[1], y: motor[1] },
          { x: time[2], y: motor[2] },
          { x: time[3], y: motor[3] },
          { x: time[4], y: motor[4] },
          { x: time[5], y: motor[5] },
          { x: time[6], y: motor[6] },
        ].reverse(),
        fill: false,
        borderColor: "rgb(0, 107, 141)",
        pointHoverRadius: 10,
      },
    ],
  };

  const water_config = {
    type: "line",
    data: water_data,
    options: options
  };

  const humid_config = {
    type: "line",
    data: humid_data,
    options: options
  };

  const temp_config = {
    type: "line",
    data: temp_data,
    options: options
  };

  const mois_config = {
    type: "line",
    data: mois_data,
    options: options
  };

  const motorChartOptions = {
    plugins: {
      legend: {
        labels: {
          font: {
            family: "Poppins",
          },
        },
      },
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          max: 1,
          stepSize: 1,
          callback: function(value, index, values) {
            return (value == 1) ? 'on' : 'off';
          }
        }
      }]
    }
  };

  const motor_config = {
    type: "line",
    data: motor_data,
    options: motorChartOptions
  };
  
  new Chart(water_graph, water_config);
  new Chart(humidity_graph, humid_config);
  new Chart(temperature_graph, temp_config);
  new Chart(moisture_graph, mois_config);
  new Chart(motor_graph, motor_config);
}

onGraphDismount();

