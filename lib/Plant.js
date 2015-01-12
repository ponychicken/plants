/* jshint esnext: true, undef: true */
var clone = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};


class Plant {
  constructor(x = 0, y = 0, angleStep = 12, axiom = '') {
    // The axiom is the start string
    this.string = axiom;

    this.startPosition = {
      pos: new Point(x, y),
      angle: 0
    };

    // Default angle step in deg
    this.angleStep = angleStep;

    // A new plant is a happy plant
    this.happiness = 1;

    // These are conditions the plant is most happy with
    this.optimalConditions = new Weather(20, 6, 2);

    // General setup
    this.drawingElements = {};
    this.positionStack = [];
    this.rules = {};
  }


  // Rule is a substitution rule
  addRule(rule) {
    if (!this.rules[rule.input]) this.rules[rule.input] = [];
    this.rules[rule.input].push(rule);
  }

  // draw function takes a position, draws, and returns new position
  addDrawingElement(elementName, drawFunction) {
    this.drawingElements[elementName] = drawFunction;
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

  // Check
  hasRuleFor(elem) {
    return !!this.rules[elem];
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
  advance() {
    var newString = '';

    let l = this.string.length;

    for (let i = 0; i < l; i++) {
      let curElem = this.string[i];

      if (!this.hasRuleFor(curElem)) {
        newString += curElem;
        continue;
      }

      let curRule = this.getRandomRule(curElem);

      let part = curRule.output;

      // The element of DEATHHHHHH!
      // Cut everything that follows from here
      // FIXME: Is this ok with stacks
      if (part == '✝') return;

      newString += part;
    }

    this.string = newString;
    return this.string;
  }

  draw() {
    // Reset stack
    this.positionStack = [
      this.startPosition
    ];

    // Helper function to get last from stack
    var getLast = function () {
      let indexOfLast = this.positionStack.length - 1;
      return this.positionStack[indexOfLast];
    };
    
    // Helper function to clone a position
    var clonePos = function (pos) {
      return {
        angle: pos.angle,
        pos: new Point(pos.pos)
      }; 
    };

    getLast = getLast.bind(this);

    // Shortcut to tail of stack
    var curPos = getLast();

    let l = this.string.length;

    // Walk through string and draw each element
    for (let i = 0; i < l; i++) {

      let curElem = this.string[i];

      // Necessary for branching
      if (curElem == '[') {
        var clonedPos = clonePos(curPos);
        this.positionStack.push(clonedPos);
        //console.log('Pushing stack', clonedPos);
        //console.log('CurStack', this.positionStack);
        curPos = getLast();
        continue;
      }

      if (curElem == ']') {
        this.positionStack.pop();
        curPos = getLast();
        //console.log('Popping stack', curPos);
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
      // Not all elements are drawn
      if (drawfn) {
        //console.log("Position before:", curPos);
        curPos = drawfn(curPos);
        //console.log("Position after:", curPos);
      }

    }
  }
}
