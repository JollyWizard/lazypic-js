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

QUnit.test("Lazypic state object : trigger", function(assert) {
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
	
	var target = targetState();

	target.trigger();
	assert.ok(target.checks.isLoaded(), "target.trigger() -> target.isLoaded()")
	assert.ok(!target.checks.isReady(), "target.trigger() -> !target.isReady()")
});

function helper(assert) {
	function asyncCounter( limit, type) {
		var count = 0;
		var done = assert.async();
		return function() {
			if(++count == limit) {
				assert.ok(true,"events complete: " + type + "(" + limit + ")" );
				done();
			}
		}
	}

	function debugEvents(type, e) {
		var message = "Image Event : " + type + ": " + e.outerHTML;
		console.log(message);
		assert.ok(true, message);
	}

	function debugQueue(type, e) {
		var message = "Image Callback : " + type + ": " + e.outerHTML;
		console.log(message);
		assert.ok(true, message);
	}
	return {
		debugEvents : debugEvents,
		debugQueue : debugQueue,
		asyncCounter : asyncCounter
	}
}

QUnit.test("Lazypic state object : events / queue", function(assert) {
	with (helper(assert)) {
		var queueNext = asyncCounter( 4, "queued");
		$(document.body).bind("img-load-queued", function(e) {
			debugEvents("Queued", e.target);
			queueNext();
		});
		
		var startNext = asyncCounter( 4, "start");
		$(document.body).bind("img-load-start", function(e) {
			debugEvents("start", e.target);
			startNext();
		})
		
		var loadedNext = asyncCounter( 4, "done");
		$(document.body).bind("img-load-done", function(e) {
			debugEvents("done", e.target);
			loadedNext();
		})
		
		var alwaysNext = asyncCounter( 4, "always");
		$(document.body).bind("img-load-always", function(e) {
			debugEvents("always", e.target);
			alwaysNext();
		})
		
		// 
		
		var targets = $(".local img")
		targets.each( function(index, e){
			imgLoadState(e).queue();
			
			imgLoadState(e).promise.always(function(next) {
				debugQueue("always",e);
				next();
			})
			imgLoadState(e).promise.done(function(next) {
				debugQueue("done",e);
				next();
			})
			imgLoadState(e).promise.start(function(next) {
				debugQueue("start",e);
				next();
			})
		})
		
		//
		
		$(document.body).bind("img-load-always", function(e) {
			imgLoadNext();
		});
		
		imgLoadNext();	
		
	}
	
});

function clearBindings() {
	$(document.body)
	.unbind("img-load-always")
	.unbind("img-load-done")
	.unbind("img-load-fail")
	.unbind("img-load-start")
}

QUnit.test("Lazypic state object : errors & skip", function(assert) {
	clearBindings();
	with (helper(assert)) {
		var targets = $(".invalid img");
		
		var errorNext = asyncCounter( 3, "error")
		$(document.body).bind("img-load-fail", function(e) {
			debugEvents("fail", e.target)
			errorNext()
		})
		
		$(document.body).bind("img-load-skip", function(e) {
			debugEvents("skip", e.target)
		})
		
		var alwaysNext = asyncCounter( 4, "always")
		$(document.body).bind("img-load-always", function(e) {
			debugEvents("always", e.target)
			alwaysNext()
		})
		
		targets.each( function(index, e) {
			imgLoadState(e)
			.queue()
			.always(function()	{
				debugQueue("always", e)
				$(e).css('border','thin solid red')
			})
			.fail(function() {
				debugQueue("fail", e)
				$(e).css('background-color','red')
			})
			.fail(function() {
				debugQueue("fail-2", e)
				$(e).css('font-style', 'italic')
			})
			.skip(function() {
				debugQueue("skip", e)
				$(e).css('background-color','cyan')
			})
		})
		
		$(document.body).bind("img-load-always", function(e) {
			imgLoadNext();
		});
		
		imgLoadNext();
	}
})