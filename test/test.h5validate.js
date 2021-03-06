
/*global window, $, module, test, ok, equal, exports */
(function (exports) {
	'use strict';
	function runTests() {
		module('h5Validate');

		test('h5Validate basics', function () {
			ok((typeof $('<div>').h5Validate === 'function'), 'h5Validate exists');
		});

		test('Required:', function () {
			var $input = $('#name');
			ok((!$input.h5Validate('isValid')), 'Required input should be invalid when empty.');
			$input.val('Bob');
			ok(($input.h5Validate('isValid')), 'Required input should be valid when not empty.');
			$input.val('');
		});

		test('Pattern attribute:', function () {
			var $input = $('#birthdate');
			ok(($input.h5Validate('isValid')), 'Optional input should be valid when empty.');
			$input.val('01/01/2010');
			ok(($input.h5Validate('isValid')), 'Input should be valid when given valid input.');
			$input.val('foo');
			ok((!$input.h5Validate('isValid')), 'Input should be invalid when given invalid input.');
		});

		test('Pattern library:', function () {
			var $input = $('#email');
			$input.val('test@example.com');
			ok(($input.h5Validate('isValid')), 'Input should be valid when given valid input.');
			$input.val('invalid email');
			ok((!$input.h5Validate('isValid')), 'Input should be invalid when given invalid input.');
		});

		test('Error messages:', function () {
			var $input = $('#FirstName'),
				$errordiv = $('#invalid-FirstName');
			ok($errordiv.is(':hidden'), 'Error message is hidden when input is valid');
			$input.h5Validate('isValid');
			ok($errordiv.is(':visible'), 'Error message displays when input is invalid');
		});

		test('Instance safe for method calls:', function () {
			var $form = $('<form>', {
					id: 'instanceTest'
				}),
				test1;

			$form.html('<input required id="instance-input"/>'
				+ '<select type="select" name="BillingCountry" id="BillingCountry" required="required">'
				+ '<option value="">-- Choose Country --</option>'
				+ '<option value="SE">Sweden</option>'
				+ '<option value="AX">Aland islands</option>'
				+ '<option value="DK">Denmark</option>'
				+ '<option value="FI">Finland</option>'
				+ '<option value="NO">Norway</option>'
				+ '</select>')
				.appendTo('body');

			$form.bind('instance', function (event, data) {
				ok(data, 'Instance create event works.');
			});

			$form.h5Validate({
				allValidSelectors: 'select'
			});

			$("#BillingCountry option:eq(2)").attr("selected", "selected");

			test1 = $form.h5Validate('allValid');
			ok(test1, 'Methods are instance safe.');
		});

		test('Validated events:', function () {
			var $form = $('<form>', {
					id: 'eventTest'
				}),
				$input;

			$form.html('<input required id="event-input"/>')
				.appendTo('body');

			$input = $('#event-input');

			$form.h5Validate();

			$form.bind('formValidate', function (event, data) {
				ok(data, 'formValidate triggers.');
				ok(data.settings, 'A copy of the settings is passed.');
			});

			$input.bind('validated', function (event, data) {
				ok(data, 'Validated event triggers.');
				equal(data.element, $input[0], 'Element is correct.');
				equal(data.valid, true, 'Element is valid.');
			});

			$form.bind('formValidated', function (event, data) {
				ok(data, 'formValidated triggers.');
				equal(data.elements[0].element, $input[0], 'Form element 0 is correct.');
				equal(data.elements[0].valid, true, 'Element is valid.');
			});

			$input.val('test');
			$form.h5Validate('allValid');
		});

		module('Submit handler');

		test('Disabled', 1, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input1 = $('#checked-at-submit-1');

			$form.h5Validate({
				submit: false
			});

			$input1.bind('validated', function (event, data) {
				fail('Validation should not run.');
			});

			$form.submit(function(evt){

				ok(evt.isDefaultPrevented() !== true, 'Default should not be prevented, despite the invalid fields.');

				// Make sure not to submit in the test code
				evt.preventDefault();
				return false;
			});

			$form.submit();

			$form.remove();
		});

		test('Enabled, all fields valid', 2, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input1 = $('#checked-at-submit-1');

			$form.h5Validate();

			$input1.bind('validated', function (event, data) {
				ok(data, 'Validation triggered on submit. #' +  data.element.id);
			});

			$form.submit(function(evt) {

				ok(!evt.isDefaultPrevented(), 'Default should not be prevented, all fields are valid.');

				// Make sure not to submit in the test code
				evt.preventDefault();
				return false;
			});

			$form.submit();

			$form.remove();
		});

		test('Enabled, some fields invalid', 2, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1;

			$('<input required id="checked-at-submit-1" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input1 = $('#checked-at-submit-1');

			$form.h5Validate();

			$input1.bind('validated', function (event, data) {
				ok(data, 'Validation triggered on submit. #' +  data.element.id);
			});

			$form.submit(function(evt) {

				ok(evt.isDefaultPrevented(), 'Default should be prevented, at least one field is invalid.');

				// Make sure not to submit in the test code
				evt.preventDefault();
				return false;
			});

			$form.submit();

			$form.remove();
		});

		test('Submit time validation disabled', 1, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input1 = $('#checked-at-submit-1');

			$form.h5Validate({
					validateOnSubmit: false
				});

			$input1.bind('validated', function (event, data) {
				ok(false, 'Validation should not run. #' +  data.element.id);
			});

			$form.submit(function(evt) {

				equal(evt.isDefaultPrevented(), true, 'Form submission should be prevented since validation has not been performed.');

				// Make sure not to submit in the test code
				evt.preventDefault();
				return false;
			});

			$form.submit();

			$form.remove();
		});

		test('Submit time validation disabled', 2, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1,
				validationShouldRun = false;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input1 = $('#checked-at-submit-1');

			$form.h5Validate({
					validateOnSubmit: false
				});

			$input1.bind('validated', function (event, data) {
				if(validationShouldRun) {
					ok(true, 'Validation should run when called manually. #' +  data.element.id);
				} else {
					ok(false, 'Validation should not run on submit. #' +  data.element.id);
				}
			});

			$form.submit(function(evt) {

				equal(evt.isDefaultPrevented(), false, 'Form submission should not be prevented since validation has been performed manually.');

				// Make sure not to submit in the test code
				evt.preventDefault();
				return false;
			});

			validationShouldRun = true;
			$form.h5Validate('allValid');

			validationShouldRun = false;
			$form.submit();

			$form.remove();
		});

		test('Focus invalid enabled', 2, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1,
				$input2,
				$input3,
				$focused;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$('<input required id="checked-at-submit-2" />')
				.appendTo($form);

			$('<input required id="checked-at-submit-3" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input3 = $('#checked-at-submit-3');

			// Using default settings
			$form.h5Validate();

			// Move focus to get a baseline
			$input3.focus();

			$form.submit();

			$focused = $(':focus');
			equal($focused.length, 1, 'One element should be focused.');
			equal($focused.attr('id'), 'checked-at-submit-2', 'The second field is invalid and should be focused.');

			$form.remove();
		});

		test('Focus invalid disabled', 2, function () {
			var $form = $('<form />', {
					id: 'submitTest'
				}),
				$input1,
				$input2,
				$input3,
				$focused;

			$('<input required id="checked-at-submit-1" value="abc123" />')
				.appendTo($form);

			$('<input required id="checked-at-submit-2" />')
				.appendTo($form);

			$('<input required id="checked-at-submit-3" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$input3 = $('#checked-at-submit-3');

			$form.h5Validate({
				focusFirstInvalidElementOnSubmit: false
			});

			// Move focus to get a baseline
			$input3.focus();

			$form.submit();

			$focused = $(':focus');
			equal($focused.length, 1, 'One element should be focused.');
			equal($focused.attr('id'), 'checked-at-submit-3', 'The third field should be still focused.');

			$form.remove();
		});

		module('Issues');

		test('Issue #29: Disabled fields gum up the works.', function () {
			var $form = $('<form>', {
					id: 'disabledTest'
				}),
				$input;

			$form.html('<input required id="disabled-input" disabled required /><input />')
				.appendTo('body');

			$input = $('#disabled-input');

			$form.h5Validate();

			ok($form.h5Validate('allValid'), 'Disabled fields get skipped.');
		});

		test('Issue #26: Need a .novalidate class.', function () {
			var $form = $('<form>', {
					id: 'novalidateTest'
				}),
				$input;

			$form.html('<input required id="novalidate-input" class="novalidate" required /><input />')
				.appendTo('body');

			$input = $('#novalidate-input');

			$form.h5Validate();

			ok($form.h5Validate('allValid'), '.novalidate fields get skipped.');
			
		});

		// Validate radio buttons correctly. (Any checked field satisfies required)
		test('Issue #27: Validate radio buttons correctly.', function () {
			var $radioTest = $('[name="radio-test"]'),
				isEmptyInvalid = true,
				isCheckedValid = true,
				$checkme;

			// Perform validation on each of the radio buttons
			$radioTest.h5Validate('isValid');

			$radioTest.each(function(){
				// Get validation results without performing validation again
				isEmptyInvalid = isEmptyInvalid && !$(this).h5Validate('isValid', { revalidate: false });
			});

			$checkme = $('.checkme');
			ok(isEmptyInvalid, 'All radio buttons should be invalid when empty.');
			$checkme.attr('checked', 'checked');

			// Call .change() to trigger validation
			$checkme.change();

			$radioTest.each(function(){
				// Get validation results without performing validation again
				isCheckedValid = isCheckedValid && $(this).h5Validate('isValid', { revalidate: false });
			});

			ok(isCheckedValid,
				'All radio buttons should be valid as soon as any one is selected');
		});

		// Validate radio buttons correctly. (Any checked field satisfies required)
		test('Issue #27: Validate radio buttons correctly (again).', function () {
			var $form = $('<form />', {
					id: 'radio-test2-form'
				}),
				$radioTest,
				isEmptyValid = 0,
				isCheckedValid = 0,
				$checkme;

			$('<input type="radio" required id="radio-test2-1" name="radio-test2" value="abc123" />')
				.appendTo($form);

			$('<input type="radio" required id="radio-test2-2" name="radio-test2" value="def456" />')
				.appendTo($form);

			$('<input type="radio" required id="radio-test2-3" name="radio-test2" value="ghi789" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$form.h5Validate();

			$radioTest = $('[name="radio-test2"]', $form);

			equal($radioTest.length, 3, 'Three radio buttons with the same name exist');
			equal($radioTest.filter(':checked').length, 0, 'None is checked');

			$radioTest.each(function(){
					isEmptyValid += $(this).h5Validate('isValid', { revalidate: false }) ? 1 : 0;
				});

			equal(isEmptyValid, 0, 'Radio should be invalid when empty.');

			$checkme = $('#radio-test2-2');
			$checkme.attr('checked', 'checked');
			equal($radioTest.filter(':checked').length, 1, 'One is checked');
			
			// Trigger change event to trigger validation
			$checkme.change();
			
			$radioTest.each(function(){
					isCheckedValid += $(this).h5Validate('isValid', { revalidate: false }) ? 1 : 0;
				});

			equal(isCheckedValid, 3,
				'Radio should be valid as soon as any one is selected');

			$form.remove();
		});

		test('Pull request #39: Each radio button is only validated once in allValid', 3, function () {
			var $form = $('<form />', {
					id: 'radio-test3-form'
				}),
				$radioTest,
				isEmptyValid = 0,
				isCheckedValid = 0,
				$checkme;

			$('<input type="radio" required id="radio-test3-1" name="radio-test3" value="abc123" />')
				.appendTo($form);

			$('<input type="radio" required id="radio-test3-2" name="radio-test3" value="def456" />')
				.appendTo($form);

			$('<input type="radio" required id="radio-test3-3" name="radio-test3" value="ghi789" />')
				.appendTo($form);

			$form
				.appendTo('body');

			$form.h5Validate();

			$form.on("validated.radio-test3", function(evt, data){
				ok(evt.target.name === "radio-test3", "Validated a radio button, " + evt.target.id)
			});

			$form.h5Validate("allValid");

			$form.off(".radio-test3");

			$form.remove();
		});

		// Todo: test allValid. Make sure to call it more than once and ensure that
		// behavior remains consistent.
	}
	exports.runTests = runTests;
}((typeof exports !== 'undefined') ? exports : window));
