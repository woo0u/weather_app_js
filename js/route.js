import { updateWeather } from './main.js';

const defaultLocation = '#/weather?lat=37.55549&lon=126.9199'; // 어메이징 농카이 위치

const currentLocation = function () {
  window.navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      updateWeather(latitude, longitude);
    },
    (error) => {
      window.location.hash = defaultLocation;
    }
  );
};

/**
 *
 * @param {string} query Searched location query e.g. city name
 */
const searchedLocation = (query) => updateWeather(...query.split('&'));
// updateWeather("lat=37.51712", "lon=126.7159")

const routes = new Map([
  ['/current-location', currentLocation],
  ['/weather', searchedLocation],
]);

const checkHash = function () {
  const requestURL = window.location.hash.slice(1);
  console.log(requestURL);
  const [route, query] = requestURL.includes
    ? requestURL.split('?')
    : [requestURL, ''];
  routes.get(route) ? routes.get(route)(query) : 'Error 404';
};

window.addEventListener('hashchange', checkHash); // https://writingdeveloper.tistory.com/219
window.addEventListener('load', function () {
  if (!window.location.hash) {
    window.location.hash = '#/current-location';
  } else {
    checkHash();
  }

  console.log(window.location.hash);
});
