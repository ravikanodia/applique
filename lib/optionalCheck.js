/**
 * This class enforces conditionals.
 * checkFn: the function to run
 * expected: result to expect
 * name: the item being compared
 * level can be:
 *   'skip': the check is not executed (always passes)
 *   'warn': the check is executed. If it fails, a warning will be logged.
 *   'enforce': the check is executed. If it fails, an exception will be thrown.
 */
var optionalCheck = function(checkFn, expected, name, level) {
    if (level == 'skip') {
	return;
    }

    var result = checkFn();
    if (result == expected) {
	var successMessage = `got expected ${name} of ${expected}`;
	console.log(successMessage);
	return;
    }

    // Template literals don't work for message because they would be evaluated
    // in the scope of optionalCheck's caller. This is janky. Find a better way.
    var failMessage = `expected ${name} of ${expected} but got ${result}`;
    if (level == 'warn') {
	console.log(failMessage);
    }

    if (level == 'enforce') {
	throw new Error(failMessage);
    }
};

module.exports = optionalCheck;
