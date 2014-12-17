/* jshint esnext: true */

class Climate {
  constructor() {
    // Ranges of environmental values
    this.ranges = {
      temp: [-15, 35],
      // The API returns -1 for 0. Whatever.
      sun: [-1, 13],
      // The API returns -1 for 0. Whatever.
      rain: [-1, 20]
    };
  }
}


class Weather extends Climate {

  // Temp in degrees, sunshine in hours, precipiation in mm
  constructor(temp, sun, rain) {
    super();

    this.temp = scaleValues(temp, 'temp');
    this.sun = scaleValues(sun, 'sun');
    this.rain = scaleValues(rain, 'rain');
  }

  // Scale environmental factors to ranges of 0..1
  scaleValues(value, type) {
    var range = this.ranges[type];
    return (value - range[0]) / (range[1] - range[0]);
  }

  // Calculates the difference between two weathers
  // Returns a triplet (using internal scale)
  diff(otherWeather) {
    return [
      this.temp - otherWeather.temp,
      this.sun - otherWeather.sun,
      this.rain - otherWeather.rain
    ];
  }
}
