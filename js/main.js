import { eventOnElmts } from './app.js';
import { url, fetchData } from './api.js';
import * as module from './module.js';

// 검색 화면 토글 기능
const searchView = document.querySelector('[data-search-view]'); // 속성 요소를 선택하는 방법
const searchTogglers = document.querySelectorAll('[data-search-toggler]');

function toggleSearch() {
  searchView.classList.toggle('active');
}

eventOnElmts(searchTogglers, 'click', toggleSearch);

// 검색어 입력 등 검색 기능
const searchField = document.querySelector('[data-search-field]');
const searchResult = document.querySelector('[data-search-result]');

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener('input', function () {
  // console.log(searchField.value);
  if (!searchField.value) {
    searchField.classList.remove('searching');
    searchResult.innerHTML = '';
  } else {
    searchField.classList.add('searching');
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      if (!searchField.value) return; // 글씨가 없을때 기능 멈춤

      fetchData(url.geocode(searchField.value), function (location) {
        searchResult.innerHTML = '<ul class="view-list" data-search-list></ul>';
        // console.log(location);
        /**
         * @type { Array } items : 검색 결과를 담을 배열
         */
        const items = [];

        for (let { name, lat, lon, country, state } of location) {
          const searchItem = document.createElement('li');
          searchItem.classList.add('view-item');
          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
            <div>
              <p class="item-title">${name}</p>
              <p class="label-2">${state || ''}, ${country}</p>
            </div>
            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" data-search-toggler></a>
          `;

          searchResult
            .querySelector('[data-search-list]')
            .appendChild(searchItem);

          items.push(searchItem.querySelector('[data-search-toggler]'));
        }

        eventOnElmts(items, 'click', function () {
          toggleSearch();
        });
      });

      searchField.classList.remove('searching');
    }, searchTimeoutDuration);
  }
});

const currentLocationBtn = document.querySelector(
  '[data-current-location-btn]'
);
const container = document.querySelector('[data-container]');
const loading = document.querySelector('[data-loading]');

/**
 * Render All Weather Data which is fetched from API
 *
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 */

export const updateWeather = function (lat, lon) {
  // console.log(lat, lon);
  // 현재 위치 버튼 활성화 토글

  if (window.location.hash === '#/current-location') {
    currentLocationBtn.setAttribute('disabled', '');
  } else {
    currentLocationBtn.removeAttribute('disabled');
  }

  loading.style.display = 'flex';

  const currentWeatherSection = document.querySelector(
    '[data-current-weather]'
  );
  const forecastSection = document.querySelector('[data-5-day-forecast]');
  const highlightSection = document.querySelector('[data-highlights]');
  const hourlySection = document.querySelector('[data-hourly-forecast]');

  currentWeatherSection.innerHTML = '';
  forecastSection.innerHTML = '';
  highlightSection.innerHTML = '';
  hourlySection.innerHTML = '';

  // 현재 기상 정보 호출
  fetchData(url.currentWeather(lat, lon), function (data) {
    // console.log(data);
    const {
      weather,
      name,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC, country },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = data;

    const [{ description, icon }] = weather;
    const card = document.createElement('div');
    card.classList.add('card', 'card-lg', 'current-weather-card');

    card.innerHTML = `
      <h2 class="title-2 card-title">Now</h2>
      <div class="wrapper">
        <p class="heading">
          ${parseInt(temp)}&deg;<sup>c</sup>
        </p>
        <img src="images/weather_icons/${icon}.png" alt="Overcast Clouds" class="weather-icon">
      </div>

      <p class="body-3">${description}</p>
      <ul class="meta-list">
        <li class="meta-item">
          <span class="m-icon">Calendar_today</span>
          <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
        </li>
        <li class="meta-item">
          <span class="m-icon">location_on</span>
          <p class="title-3 meta-text">${name}, ${country}</p>
        </li>
      </ul>
    `;

    currentWeatherSection.appendChild(card);

    // 5일 기상 예보
    fetchData(url.forecast(lat, lon), function (forecast) {
      const {
        city: { timezone },
        list: forecastList,
      } = forecast;

      forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
    `;

      for (let i = 7; i < forecastList.length; i += 8) {
        const {
          main: { temp_max },
          weather,
          dt_txt,
        } = forecastList[i];

        const [{ description, icon }] = weather;
        const date = new Date(dt_txt);

        const li = document.createElement('li');
        li.classList.add('card-item');

        li.innerHTML = `
          <div class="icon-wrapper">
            <img src="images/weather_icons/${icon}.png" alt="${description}" class="weather-icon">

            <span class="span">
              <p class="title-2">${parseInt(temp_max)}&deg;</p>
            </span>
          </div>

          <p class="label-1">${date.getDate()} ${
          module.monthes[date.getMonth()]
        }</p>
          <p class="label-1">${module.weekDays[date.getDay()]}</p>
        `;

        forecastSection.querySelector('[data-forecast-list]').appendChild(li);
      }

      hourlySection.innerHTML = `
        <h2 class="title-2">Today at</h2>
        <div class="slider-container">
          <ul class="slider-list" data-temp>
            
          </ul>
          <ul class="slider-list" data-wind>
            
          </ul>
        </div>
      `;

      // 시간대별 날씨 정보
      for (const [index, data] of forecastList.entries()) {
        // console.log(index, data);

        if (index > 7) break;

        const {
          dt: dateTimeUnix,
          main: { temp },
          weather,
          wind: { deg: windDirection, speed: windSpeed },
        } = data;

        const [{ icon, description }] = weather;

        const tempList = document.createElement('li');
        tempList.classList.add('slider-item');

        tempList.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img src="images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}" class="weather-icon" title="${description}">
            <p class="body-3">${parseInt(temp)}&deg;</p>
          </div>
        `;

        hourlySection.querySelector('[data-temp]').appendChild(tempList);

        const windList = document.createElement('li');
        windList.classList.add('slider-item');

        windList.innerHTML = `
          <div class="card card-sm slider-card">
            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>
            <img src="images/weather_icons/direction.png" width="48" height="48" loading="lazy" alt="direction" class="weather-icon" style="transform: rotate(${
              windDirection - 180
            }deg)">
            <p class="body-3">${module.mps_to_kmh(windSpeed)} km/h</p>
          </div>
        `;

        hourlySection.querySelector('[data-wind]').appendChild(windList);
      }
    });

    // 대기질 정보
    fetchData(url.airPollution(lat, lon), function (apData) {
      const [
        {
          main: { aqi },
          components: { no2, o3, so2, pm2_5 },
        },
      ] = apData.list;

      const card = document.createElement('div');
      card.classList.add('card', 'card-lg');

      card.innerHTML = `
        <h2 class="title-2" id="highlights-label">Todays Highlights</h2>

        <div class="highlight-list">
          <div class="card card-sm highlight-card one">
            <h3 class="title-3">Air Quality Index</h3>
            <div class="wrapper">
              <span class="m-icon">air</span>
              <div class="card-list">
                <li class="card-item">
                  <p class="title-1">${pm2_5.toPrecision(3)}</p>
                  <p class="label-1">PM<sub>2</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${so2.toPrecision(3)}</p>
                  <p class="label-1">SO<sub>2</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${no2.toPrecision(3)}</p>
                  <p class="label-1">NO<sub>2</sub></p>
                </li>
                <li class="card-item">
                  <p class="title-1">${o3.toPrecision(3)}</p>
                  <p class="label-1">O<sub>3</sub></p>
                </li>
              </div>
            </div>

            <span class="badge aqi-${aqi} label-${aqi}" title="${
        module.airQualityMsg[aqi].msg
      }">${module.airQualityMsg[aqi].level}</span>
          </div>

          <div class="card card-sm highlight-card two">
            <h3 class="title-3">Sunrise & Sunset</h3>
            <div class="card-list">
              <div class="card-item">
                <sapn class="m-icon">clear_day</sapn>
                <div>
                  <p class="label-1">Sunrise</p>
                  <p class="title-1">${module.getTime(
                    sunriseUnixUTC,
                    timezone
                  )}</p>
                </div>
              </div>
              <div class="card-item">
                <sapn class="m-icon">clear_night</sapn>
                <div>
                  <p class="label-1">Sunset</p>
                  <p class="title-1">${module.getTime(
                    sunsetUnixUTC,
                    timezone
                  )}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="card card-sm highlight-card">
            <h3 class="title-3">Humidity</h3>
            <div class="wrapper">
              <span class="m-icon">humidity_percentage</span>
              <p class="title-1">${humidity}<sub>%</sub></p>
            </div>
          </div>

          <div class="card card-sm highlight-card">
            <h3 class="title-3">Pressure</h3>
            <div class="wrapper">
              <span class="m-icon">airwave</span>
              <p class="title-1">${pressure}<sub>hPa</sub></p>
            </div>
          </div>

          <div class="card card-sm highlight-card">
            <h3 class="title-3">Visibility</h3>
            <div class="wrapper">
              <span class="m-icon">visibility</span>
              <p class="title-1">${visibility / 1000}<sub>km</sub></p>
            </div>
          </div>

          <div class="card card-sm highlight-card">
            <h3 class="title-3">Feels Like</h3>
            <div class="wrapper">
              <span class="m-icon">thermostat</span>
              <p class="title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
            </div>
          </div>
        </div>
      `;
      highlightSection.appendChild(card);
    });

    loading.style.display = 'none';
  });
};

// const a = [...Array(100).keys()];
// // console.log(a);
// // forEach
// // a.forEach((item) => {
// //   console.log(item);
// // });
// // for in
// // for (const item in a) {
// //   console.log(item);
// // }
// // for

// for (let i = 7; i < a.length; i += 8) {
//   console.log(a[i]);
// }

// let b = 1;
// // b = b + 1;
// // b = b + 1;
// // b = b + 1;

// // b += 1;
// // b += 1;
// // b += 1;

// b = b += 2;

// b++;
// b++;

// console.log(b);
// const bbb = 2;
// function a() {
//   const aaa = 1;
//   console.log(aaa);
//   console.log(bbb);
// }

// function b() {
//   console.log(bbb);
//   console.log(aaa);
// }

// a();
// b();

// function abc(a, b) {
//   return a + b;
// }

// console.log(abc(1, 2));
