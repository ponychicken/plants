var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};/* jshint esnext: true */

var clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};


var Plant = (function(){"use strict";var proto$0={};
  function Plant(rules ) {
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
  }DP$0(Plant,"prototype",{"configurable":false,"enumerable":false,"writable":false});


  // Rule is a substitution rule
  // Options contain the probability settings
  proto$0.addRule = function(rule, options) {

  };

  // draw function takes a position, draws, and returns new position
  proto$0.addDrawingElement = function (elementName, drawFunction) {

  };

  // Takes a weather object and calculates the plant happiness
  // Happiness :)
  // Happiness is maximumHappiness - reasonsForUnhappiness
  proto$0.updateEnvironment = function (curWeather) {
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
    for (var elem in this.rules) {
      var rules = this.rules[elem];

      var totalWeight = 0;

      // This element only has one outgoing rule,
      // no need to calculate any probabilities
      if (rules.length === 1) continue;

      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        var happinessDiff = Math.abs(this.happiness - rule.happiness);
        rule.weight = (1 - happinessDiff) +  rule.additionalWeight;
        totalWeight += rule.weight;
      }

      // Rules is actually an Array, but we can still assign arbitrary keys
      // without breaking it's iterating properties
      rules.totalWeight = totalWeight;
    }
  };

  // Get a (weighted)random rule for the given element
  // Be sure to run updateEnvironment before this
  proto$0.getRandomRule = function(elem) {
    var rules = this.rules[elem];

    // Just one, no need to roll dices
    if (rules.length == 1) return rules[0];

    var pointer = Math.random() * rules.totalWeight;

    for (var i = 0; i < rules.length; i++) {
      if (pointer < rules[i].weight)
        return rules[i];
      pointer -= rules[i].weight;
    }
  };


  // Takes the current string and applies the rules to it.
  // We need to replace all simultaneously
  // Therefore we walk through the string and push the replacements onto a new string
  proto$0.advance = function () {
    var newString = '';

    var l = this.string.length;

    for (var i = 0; i < l; i++) {
      var curElem = this.string[i];

      var curRule = this.getRandomRule(curElem);

      var part = curRule.output;

      // The element of DEATHHHHHH!
      // Cut everything that follows from here
      // FIXME: Is this ok with stacks
      if (part == '✝') return;

      newString += part;
    }

    this.string = newString;
  };

  proto$0.draw = function() {
    // Reset stack
    this.positionStack = [
      this.startPos
    ];

    // Helper function to get last from stack
    var getLast = function () {
      var indexOfLast = this.positionStack.length - 1;
      return this.positionStack[indexOfLast];
    };

    // Shortcut to tail of stack
    var curPos = getLast();

    var l = this.string.length;

    // Walk through string and draw each element
    for (var i = 0; i < l; i++) {

      var curElem = this.string[i];

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
      var drawfn = this.drawingElements[curElem];
      curPos = drawfn(curPos);
    }
  };
MIXIN$0(Plant.prototype,proto$0);proto$0=void 0;return Plant;})();

/* jshint esnext: true */

var Rule = (function(){"use strict";
  function Rule(input, output) {var happiness = arguments[2];if(happiness === void 0)happiness = 0.5;var additionalWeight = arguments[3];if(additionalWeight === void 0)additionalWeight = 0;
    this.input = input;
    this.output = output;
    this.regexp = new RegExp(input, "g");

    // Use this to add additional weight apart from environmental factors to rules
    this.additionalWeight = additionalWeight;

    // This is the happiness level at which the rule will be most likely to be picked
    this.happiness = 0.5;
  }DP$0(Rule,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return Rule;})();

/* jshint esnext: true */

var Climate = (function(){"use strict";
  function Climate() {
    // Ranges of environmental values
    this.ranges = {
      temp: [-15, 35],
      // The API returns -1 for 0. Whatever.
      sun: [-1, 13],
      // The API returns -1 for 0. Whatever.
      rain: [-1, 20]
    };
  }DP$0(Climate,"prototype",{"configurable":false,"enumerable":false,"writable":false});
;return Climate;})();


var Weather = (function(super$0){"use strict";var SP$0 = Object.setPrototypeOf||function(o,p){if(PRS$0){o["__proto__"]=p;}else {DP$0(o,"__proto__",{"value":p,"configurable":true,"enumerable":false,"writable":true});}return o};var OC$0 = Object.create;if(!PRS$0)MIXIN$0(Weather, super$0);var proto$0={};

  // Temp in degrees, sunshine in hours, precipiation in mm
  function Weather(temp, sun, rain) {
    super$0.call(this);

    this.temp = scaleValues(temp, 'temp');
    this.sun = scaleValues(sun, 'sun');
    this.rain = scaleValues(rain, 'rain');
  }if(super$0!==null)SP$0(Weather,super$0);Weather.prototype = OC$0(super$0!==null?super$0.prototype:null,{"constructor":{"value":Weather,"configurable":true,"writable":true}});DP$0(Weather,"prototype",{"configurable":false,"enumerable":false,"writable":false});

  // Scale environmental factors to ranges of 0..1
  proto$0.scaleValues = function(value, type) {
    var range = this.ranges[type];
    return (value - range[0]) / (range[1] - range[0]);
  };

  // Calculates the difference between two weathers
  // Returns a triplet (using internal scale)
  proto$0.diff = function(otherWeather) {
    return [
      this.temp - otherWeather.temp,
      this.sun - otherWeather.sun,
      this.rain - otherWeather.rain
    ];
  };
MIXIN$0(Weather.prototype,proto$0);proto$0=void 0;return Weather;})(Climate);
