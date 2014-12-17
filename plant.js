/* jshint esnext: true */

var clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

class Plant {
  constructor(rules ) {
    this.string = '';
    this.drawingElements = {};
    this.startPosition = {
      x: 0,
      y: 0,
      angle: 0
    };

    // Default angle step in deg
    this.angleStep = 12;

    // A new plant is a happy plant
    this.happiness = 1;

    // These are conditions the plant is most happy with
    this.optimalConditions = new Weather(20, 6, 2);

    this.positionStack = [];
  }


  // Rule is a substitution rule
  // Options contain the probability settings
  addRule(rule, options) {

  }

  // draw function takes a position, draws, and returns new position
  addDrawingElement (elementName, drawFunction) {

  }

  // Takes a weather object and calculates the plant happiness
  // Happiness :)
  // Happiness is maximumHappiness - reasonsForUnhappiness
  updateEnvironment (curWeather) {
    var distanceFromOptimal = this.optimalConditions.diff(curWeather);

    // Sum triplet
    var distanceSummed = distanceFromOptimal.reduce(function(previousValue, currentValue) {
        return previousValue + currentValue;
    });

    // Fudge distanceSummed, values of >2 will be very rare
    distanceSummed = Math.max(2, distanceSummed);

    // Set new happiness, smoothed by half
    var newHappiness = 1 - (distanceSummed / 2);
    this.happiness = (this.happiness + newHappiness) / 2;

    // Loop trough rules, updating their probability
    // Every rule has a happiness where it's most likely to occur.
    // Rules that trigger growth will be most likely around happiness = 1
    // Rules that trigger stagnation or death will need lower happiness values
    for (let elem in this.rules) {
      let rules = this.rules[elem];

      let totalWeight = 0;

      // This element only has one outgoing rule,
      // no need to calculate any probabilities
      if (rules.length === 1) continue;

      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];
        let happinessDiff = Math.abs(this.happiness - rule.happiness);
        rule.weight = (1 - happinessDiff) +  rule.additionalWeight;
        totalWeight += rule.weight;
      }

      // Rules is actually an Array, but we can still assign arbitrary keys
      // without breaking it's iterating properties
      rules.totalWeight = totalWeight;
    }
  }

  // Get a (weighted)random rule for the given element
  // Be sure to run updateEnvironment before this
  getRandomRule(elem) {
    var rules = this.rules[elem];

    // Just one, no need to roll dices
    if (rules.length == 1) return rules[0];

    var pointer = Math.random() * rules.totalWeight;

    for (let i = 0; i < rules.length; i++) {
      if (pointer < rules[i].weight)
        return rules[i];
      pointer -= rules[i].weight;
    }
  }


  // Takes the current string and applies the rules to it.
  // We need to replace all simultaneously
  // Therefore we walk through the string and push the replacements onto a new string
  advance () {
    var newString = '';

    let l = this.string.length;

    for (let i = 0; i < l; i++) {
      let curElem = this.string[i];

      let curRule = this.getRandomRule(curElem);

      let part = curRule.output;

      // The element of DEATHHHHHH!
      // Cut everything that follows from here
      // FIXME: Is this ok with stacks
      if (part == '✝') return;

      newString += part;
    }

    this.string = newString;
  }

  draw() {
    // Reset stack
    this.positionStack = [
      this.startPos
    ];

    // Helper function to get last from stack
    var getLast = function () {
      let indexOfLast = this.positionStack.length - 1;
      return this.positionStack[indexOfLast];
    };

    // Shortcut to tail of stack
    var curPos = getLast();

    let l = this.string.length;

    // Walk through string and draw each element
    for (let i = 0; i < l; i++) {

      let curElem = this.string[i];

      // Necessary for branching
      if (curElem == '[') {
        this.positionStack.push(clone(curPos));
        curPos = getLast();
        continue;
      }

      if (curElem == ']') {
        this.positionStack.pop();
        curPos = getLast();
        continue;
      }

      // Angle increase/decrease
      if (curElem == '-') {
        curPos.angle -= this.angleStep;
        continue;
      }

      if (curElem == '+') {
        curPos.angle += this.angleStep;
        continue;
      }

      // Normal element
      let drawfn = this.drawingElements[curElem];
      curPos = drawfn(curPos);
    }
  }
}


class Rule {
  constructor(input, output, happiness = 0.5, additionalWeight = 0) {
    this.input = input;
    this.output = output;
    this.regexp = new RegExp(input, "g");

    // Use this to add additional weight apart from environmental factors to rules
    this.additionalWeight = additionalWeight;

    // This is the happiness level at which the rule will be most likely to be picked
    this.happiness = 0.5;
  }
}

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