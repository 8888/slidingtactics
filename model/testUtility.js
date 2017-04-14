'use strict';

let testUtility = {};
testUtility.assertStringTypeErrorText = "Value must be of type string";
testUtility.assertStringTypeValueText = "Value must not be empty";
testUtility.assertString = function(value) {
  if (typeof value !== "string") {
        throw new Error(testUtility.assertStringTypeErrorText);
  } else if (value.length === 0) {
        throw new Error(testUtility.assertStringTypeValueText);
  }
};

testUtility.assertIntegerPositiveTypeErrorText = "Value must be of type integer";
testUtility.assertIntegerPositiveValueErrorText = "Value must be greater than zero";
testUtility.assertIntegerPositive = function(value) {
    if (!Number.isInteger(value)) {
        throw new Error(testUtility.assertIntegerPositiveTypeError);
    } else if (value < 0) {
        throw new Error(testUtility.assertIntegerPositiveValueError);
    }
};

testUtility.assertIntegerGreaterThanZeroErrorText = "Value must be positive";
testUtility.assertIntegerGreaterThanZero = function(value) {
    testUtility.assertIntegerPositive(value);
    if (value === 0) {
        throw new Error(testUtility.assertIntegerGreaterThanZeroErrorText);
    }
};

testUtility.defaultValue = function(object, value) {
    return typeof object !== 'undefined' ? object : value;
};

module.exports = testUtility;