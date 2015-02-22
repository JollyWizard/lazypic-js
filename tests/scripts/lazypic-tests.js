QUnit.test( "Test Runner Active", function( assert ) {
	assert.ok( 1 == "1", "Test Runner displays at least one finished test." );
});


QUnit.test("JQuery active in tests", function(assert) {
	assert.ok(window.jQuery, "JQuery variable (window.jQuery) detected");
});

//

function targetImage() {
	var img = $('.target')[0]
	return img;
}

function targetState() {
	return imgLoadState(targetImage());
}

function controlImage() {
	return $('.control')[0];
}

function controlState() {
	return imgLoadState(controlImage());
}

QUnit.test("Lazypic state object : detect state", function(assert) {
	var control = controlState();
	var target = targetState();
	
	assert.ok(control, "Control Image State Acquired");
	assert.ok(target, "Target Image State Acquired");
	
	assert.ok(!target.checks.isLoaded(), "!target.loaded");
	assert.ok(control.checks.isLoaded(), "control.loaded == true, even if hidden.");
	
	assert.ok(target.checks.isReady(), "target.isReady()");
	assert.ok(!control.checks.isReady(), "!control.isReady()");
	
	$(".invalid img").each(function(index, e) {
		assert.equal(false, imgLoadState(e).checks.isLoaded(), "!invalid-"+index + ".loaded")
	})
});

QUnit.test("Lazypic state object : trigger", function(assert) {
	var control = controlState()
	var target = targetState()
		
	target.trigger()
	assert.ok(target.checks.isLoaded(), "target.trigger() -> target.isLoaded()")
	assert.ok(!target.checks.isReady(), "target.trigger() -> !target.isReady()")
});