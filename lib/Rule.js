class Rule {
  constructor(input, output, happiness = 0.5, additionalWeight = 0) {
    this.input = input;
    this.output = output;

    // Use this to add additional weight apart from environmental factors to rules
    this.additionalWeight = additionalWeight;

    // This is the happiness level at which the rule will be most likely to be picked
    this.happiness = 0.5;
  }
}
