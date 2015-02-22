QUnit.test( "Test Runner Active", function( assert ) {
	assert.ok( 1 == "1", "Test Runner displays at least one finished test." );
});


QUnit.test("JQuery active in tests", function(assert) {
	assert.ok(window.jQuery, "JQuery variable (window.jQuery) detected");
});

//

function firstImage() {
	var img = $('img')[0]
	return img;
}

function firstState() {
	return imgLoadState(firstImage());
}

function controlImage() {
	return $('.normal img')[0];
}

function controlState() {
	return imgLoadState(controlImage());
}

QUnit.test("Lazypic state object : detect state", function(assert) {
	var control = controlState();
	var target = firstState();
	
	assert.ok(control, "Control Image State Acquired");
	assert.ok(target, "Target Image State Acquired");
	
	assert.ok(!target.checks.isLoaded(), "!target.loaded");
	assert.ok(control.checks.isLoaded(), "control.loaded == true, even if hidden.");
	
	assert.ok(target.checks.isReady(), "target.isReady()");
	assert.ok(!control.checks.isReady(), "!control.isReady()");
	
	target.trigger();
});