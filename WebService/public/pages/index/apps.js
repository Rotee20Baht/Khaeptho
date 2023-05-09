const wave = document.querySelector('.wave');
const wave_bottom = document.querySelector('.wave-bottom');
const water_amount = document.querySelector('#water_amount');
const humidity_text = document.querySelector('#humidity-text');
const temperature_text = document.querySelector('#temperature-text');
const motor_toggle = document.querySelector('#motor-toggle');
const motor_status = document.querySelector('#motor-status');
const moisture_level = document.querySelector('#moisture-level');
const moisture_text = document.querySelector('#moisture-text');

motor_toggle.addEventListener('change', (e) => {
    // Send GET request to mcu
    // console.log(motor_toggle.closest('.badge'))
    const badgeParent = motor_toggle.closest('.badge');
    motor_status.innerText = motor_status.innerText == "OFF" ? "ON" : "OFF";
    const currentState = motor_status.innerText.toLowerCase();
    badgeParent.classList.toggle('deactive');

    fetch(`http://192.168.137.151/motor/${currentState}`, {mode: 'no-cors'})
    .then(response => {
        response.json()
    })
    .catch(err => {
        console.log(err);
    })
})

let fetchInterval = setInterval(() => {
    fetch('http://localhost:5000/data')
    .then(res => res.json())
    .then(data => {
        const { water, humidity, temperature, moisture } = data;
        // console.log(water, humidity);
        let volume;
        if(!water)
            volume = 0;
        else
            volume = ((22 - parseFloat(water)) * 25 * 42).toFixed(2);
        let height = Math.abs(((22 - water) / 22) * 100 - 7);

        wave.style.bottom = `${volume > 0 ? height : 0}%`;
        wave.style.display = `${volume > 0 ? 'block' : 'none'}`
        wave_bottom.style.height = `${volume > 0 ? height : 0}%`;
        water_amount.innerHTML = `${volume > 0 ? volume+' ml.' : 'No Water'}`

        // if(humidity == null || temperature == null) {
        //     humidity = 0;
        //     temperature = 0;
        // }

        humidity_text.innerHTML = `${parseFloat(humidity).toFixed(2)} %`;
        temperature_text.innerHTML = `${parseFloat(temperature).toFixed(2)} %`;

        moisture_level.innerText = moisture;
        const moistureBadge = moisture_level.closest('.badge');

        if(moisture > 3975){
            moisture_text.innerText = "Not In Soil";
            moistureBadge.classList.add('cyan');
        }
        if(moisture < 3975){
            moisture_text.innerText = "Dry";
            moistureBadge.classList.add('brown');
        }
        if(moisture < 2631){
            moisture_text.innerText = "Humid";
            moistureBadge.setAttribute("class", "badge");
        }
        if(moisture < 1780){
            moisture_text.innerText = "In Water";
            moistureBadge.classList.add('cyan');
        }
        if(moisture <= 0){
            moisture_text.innerText = "No Data";
            moistureBadge.classList.add('cyan');
        }
        

    })
    .catch(err => {
        console.log(err);
    })
}, 1000);

// 4095 - MAX
// 3975 - 4095 - Not in soil -- blue
// 2631 - 3975 - Dry  -- Brown
// 1780 - 2631 - Humid  -- Green
// < 1780 - sensor in the water -- blue