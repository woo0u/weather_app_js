export const weekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const monthes = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 *
 * @param {number} dateUnix Unix date in seconds from 1972, 1, 1 00:00:00
 * @param {number} timeZone Timezone offset in seconds from UTC Standard Time
 * @returns {string} Formatted date e.g. 'Sunday, 10 Oct'
 */
export const getDate = function (dateUnix, timeZone) {
  const date = new Date((dateUnix + timeZone) * 1000);
  const weekDay = weekDays[date.getUTCDay()];
  const month = monthes[date.getUTCMonth()];
  // console.log(date);
  // console.log(weekDay);
  // console.log(month);
  return `${weekDay}, ${date.getUTCDate()} ${month}`;
};

// getDate(1633660800, 19800);

/**
 *
 * @param {number} timeUnix Unix date in seconds from 1972, 1, 1 00:00:00
 * @param {number} timeZone Timezone offset in seconds from UTC Standard Time
 * @returns {string} Formatted time e.g. 'HH:MM AM/PM'
 */
export const getTime = function (timeUnix, timeZone) {
  const date = new Date((timeUnix + timeZone) * 1000);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';

  return `${hours % 12 || 12}:${minutes} ${period}`;
};

/**
 *
 * @param {number} timeUnix Unix date in seconds from 1972, 1, 1 00:00:00
 * @param {number} timeZone Timezone offset in seconds from UTC Standard Time
 * @returns {string} Formatted time e.g. 'HH AM/PM'
 */
export const getHours = function (timeUnix, timeZone) {
  const date = new Date((timeUnix + timeZone) * 1000);
  const hours = date.getUTCHours();
  const period = hours >= 12 ? 'PM' : 'AM';

  return `${hours % 12 || 12} ${period}`;
};

/**
 *
 * @param {number} mps meters per second to kilometer per hour
 * @returns {number} kilometer per hour
 */
export const mps_to_kmh = function (mps) {
  const mph = mps * 3.6;
  return mph.toFixed(1);
};

export const airQualityMsg = {
  1: {
    level: 'Good',
    msg: '공기 질이 만족스럽고, 공기 질로 인해 건강에 영향을 받을 가능성이 거의 없습니다.',
  },

  2: {
    level: 'Fair',
    msg: '공기 질은 양호합니다. 하지만 공기 오염에 대해 비정상적으로 민감한 일부 그룹은 건강에 다소 해로울 수 있습니다.',
  },

  3: {
    level: 'Moderate',
    msg: '공기는 대체로 보통이지만 호흡기 등 질환이 있으면 건강을 해칠 수 있습니다. 일반 대중은 영향을 받지 않을 가능성이 높습니다.',
  },

  4: {
    level: 'Poor',
    msg: '공기질로 인해 건강을 해칠 수 있으며, 민감 그룹의 구성원들은 더 심각한 건강 효과를 경험할 수 있습니다.',
  },

  5: {
    level: 'Very Poor',
    msg: '공기질이 매우 나빠 건강을 해칠 수 있습니다. 외출을 자젷하고 실내 활동을 증가시키세요.',
  },
};
