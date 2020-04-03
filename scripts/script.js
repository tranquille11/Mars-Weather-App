document.addEventListener('DOMContentLoaded', () => {

    const url = 'scripts/script.php';

    const prevSolContainer = document.querySelector('[data-previous-sols]');
    const template = document.querySelector('[data-previous-sol-template]');

    const previousWeatherToggle = document.querySelector('.show-previous-weather');
    const previousWeatherContainer = document.querySelector('.previous-weather');

    const currentSol = document.querySelector('[data-current-sol]');
    const currentDate = document.querySelector('[data-current-date]');

    const currentMaxTemp = document.querySelector('[data-current-temp-high]');
    const currentMinTemp = document.querySelector('[data-current-temp-low]');

    const windSpeed = document.querySelector('[data-wind-speed]');
    const windDirectionText = document.querySelector('[data-wind-direction-text]');
    const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]');

    const unitToggle = document.querySelector('[data-unit-toggle]');
    const metricRadio = document.getElementById('cel');
    const imperialRadio = document.getElementById('fah');

    $.ajax({
        url: url,
        type: 'GET',
        async: true,
        data: {
            'doc': 'ready'
        },
        success: function (res) {

            const data = JSON.parse(res);
            const lastSol = Object.keys(data)[Object.keys(data).length - 1];
            const lastElement = data[lastSol];

            displayValues(lastElement, lastSol);

            Object.entries(data).forEach((elem) => {

                const container = template.content.cloneNode(true);
                container.querySelector('[data-sol]').innerText = elem[0];
                container.querySelector('[data-date]').innerText = elem[1].date;
                container.querySelector('[data-temp-high]').innerText = elem[1].max_temp;
                container.querySelector('[data-temp-low]').innerText = elem[1].min_temp;
                container.querySelector('[data-select-button]').addEventListener('click', getOneSol);

                prevSolContainer.appendChild(container);
            });

        }
    });

    function getOneSol() {

        const sol = this.parentElement.firstElementChild.children[0].innerText;

        $.ajax({
            url: url,
            type: 'GET',
            async: true,
            data: {
                'sol': sol,
                'metric': isMetric()
            },
            success: (res) => {
                const response = JSON.parse(res);
                displayValues(response, sol);
            }
        })
    }

    function displayValues(element, sol) {

        currentSol.innerText = sol;
        currentDate.innerText = element.date;
        currentMinTemp.innerText = element.min_temp;
        currentMaxTemp.innerText = element.max_temp;

        windSpeed.innerText = element.wind_speed;
        windDirectionText.innerText = element.wind_dir_card;
        windDirectionArrow.style.setProperty('--direction', `${element.wind_dir_deg}deg`);

    }

    function updateUnits() {
        const speedUnits = document.querySelectorAll('[data-speed-unit]');
        const tempUnits = document.querySelectorAll('[data-temp-unit]');
        speedUnits.forEach(unit => {
            unit.innerText = isMetric() ? 'kph' : 'mph'
        });
        tempUnits.forEach(unit => {
            unit.innerText = isMetric() ? 'C' : 'F'
        });
    }

    function isMetric() {
        return metricRadio.checked
    }

    function changeValues(units) {

        const allTemps = document.querySelectorAll('[data-temp]');

        if (!units) {
            allTemps.forEach(function (elem) {
                elem.innerText = Math.round((parseInt(elem.innerText) - 32) * (5 / 9))
            });

            const windValue = parseFloat(windSpeed.innerText) * 0.6214;
            windSpeed.innerText = windValue.toFixed(2);
        }else {
            allTemps.forEach(function (elem) {
                elem.innerText = Math.round((parseInt(elem.innerText) * 9 / 5) + 32)
            });

            const windValue = parseFloat(windSpeed.innerText) * 1.610;
            windSpeed.innerText = windValue.toFixed(2);
        }
    }

    unitToggle.addEventListener('click', () => {

        let metricUnits = !isMetric();
        metricRadio.checked = metricUnits;
        imperialRadio.checked = !metricUnits;

        changeValues(metricUnits);
        updateUnits()
    });

    metricRadio.addEventListener('change', () => {
        changeValues(isMetric());
        updateUnits()
    });

    imperialRadio.addEventListener('change', () => {
        changeValues(isMetric());
        updateUnits()
    });

    previousWeatherToggle.addEventListener('click', () => {
        previousWeatherContainer.classList.toggle('show-weather');
    });

});




