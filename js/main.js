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

  const currentWeatherSection = document.querySelector(
    '[data-current-weather]'
  );
  const forecastSection = document.querySelector('[data-5-day-forecast]');

  currentWeatherSection.innerHTML = '';
  forecastSection.innerHTML = '';

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
    fetchData(url.forecast(lat, lon), function (data) {
      // console.log(data);
      const {
        city: { timezone },
        list: forecastList,
      } = data;

      forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
        <div class="card card-lg forecast-card">
          <ul></ul>
        </div>
      `;

      for (const [idx, listData] of forecastList.entries()) {
        if (idx > 4) break;
        const {
          weather,
          wind: { deg: windDirection, speed: windSpeed },
          main: { temp },
          dt: dateTimeUnix,
        } = listData;

        const [{ description, icon }] = weather;

        const forecastList = document.createElement('li');
        forecastList.classList.add('card-item');

        forecastList.innerHTML = `
          <div class="icon-wrapper">
            <img src="images/weather_icons/01n.png" alt="Overcast clouds" class="weather-icon">

            <span class="span">
              <p class="title-2">25</p>
            </span>
          </div>

          <p class="label-1">17 Feb</p>
          <p class="label-1">Friday</p>
        `;

        forecastSection.querySelector('ul').appendChild(forecastList);
      }
    });
  });
};
