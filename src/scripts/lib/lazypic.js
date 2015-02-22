

/**
	This function will return a lazypic state object 
	wrapping the target element in API functionality 
*/
function imgLoadState(e) {
	var state = {
		/** The element the data targets */
		element : e,
		
		checks : imgLoadChecks(e),
		
		/** Execute a data-src image load.	*/
		trigger : function() {
			activateDataSrc(e);
		}
	};
	return state;
}

function imgLoadChecks(e) {
	var checks = {
		/** true if the src attribute exists and is not empty */
		hasSrc 		: function () {
			return e.src != '' && e.src != undefined
		},
		
		/** true if data-src is defined on the element. */
		hasDataSrc	: function () {
			return $(e).data('src') != null
		},
		
		/** true if the image is already in a valid load state.*/
		isLoaded : function() {
			var complete = e.complete;
			return checks.hasSrc() && complete;
		},
		
		/** true if the image can be lazy loaded and if it is not already loaded*/
		isReady : function() {
			return !checks.isLoaded() && checks.hasDataSrc();
		}
	}
	return checks;
}


/**
A queue needs to continue when the image loads or fails.
It isn't a normal jquery promise, so we can't use always().

This function provides a quick wrapper to proceed the queue.

TODO extend this to execute queues that provide
	 promise functionality on the image element 
	 before continuing the queue.
*/
function attachImageQueueHooks(e) {
	var triggers = imgLoadPromiseTriggers(e);
	imgLoadPromise(e).always(function() {imgLoadNext()});
	
	$(e).one({
		load : triggers.success ,
		error : triggers.error ,
		skip : triggers.always
	});
}

/**
Ensures that there are event listeners installed that convert events 
into queue actions.  

Returns an object which can be used to trigger those events,
and in turn, activate the promise features.
---
We want diagnostic events to propagate like DOM events,
so that the process can be easily extended, 
but we also want to trigger the dedicated event function queue 
that drives the promise backend. This function links them together. 

The relative order of execution regarding queued events and listeners,
depends on the point at which this function is called.

TODO: add an uninstall process, so the trigger can be reordered.
*/
function imgLoadPromiseTriggers(e) {
	
	/* The listeners convert bubble events into queue actions
	*/
	function ensureListeners() {
		//Detect if image has triggers installed
		var triggers = $(e).data('img-load-installed')
		
		//if no triggers, install
		if (!triggers) {
			$(e)
			.bind("img-load-always", function() {
				$(this).dequeue("img-load-always")
			})
			.bind("img-load-success", function() {
				$(this).dequeue("img-load-success")
			})
			.bind("img-load-error", function() {
				$(this).dequeue("img-load-error")
			});
			
			$(e).data('img-load-installed', true);
		}	
	}
	
	/* The triggers initiate the bubble events in the appropriate sequence.
	*/
	function buildTrigger() {
		function always	() {$(e).trigger('img-load-always' );imgLoadNext();}
		function success() {$(e).trigger('img-load-success');always();}
		function error	() {$(e).trigger('img-load-error'  );always();}
		return {
			always	: always,
			success	: success,
			error	: error
		}
	}
	
	ensureListeners();
	return buildTrigger();
}

/** Get a promise that responds to imgLoad events. 

Note this promise will not work if imgLoadPromiseTriggers 
has not been called on the element.
*/
function imgLoadPromise(e) {	
	return {
		always : function(callback) {
			$(e).queue("img-load-always",callback)
		},
		success : function(callback) {
			$(e).queue("img-load-success", callback)
		},
		error : function(callback) {
			$(e).queue("img-load-success",callback)
		}
	};
}



/**
	Triggers the loading of the image.
	
	* Data is copied from *data-src* to *src*.
	
	* When the *src* element is populated,
	  the browser loading of data is triggered.
	  
	* Event (load|error) triggers upon completion
	  handlers must be configured before calling this method.
	  
	* This method should ignore bad use cases and safely proceed the queue.
*/
function activateDataSrc(e) {
	var datasrc = $(e).data('src');
	if(imgLoadChecks(e).isReady()) {
		// act on expected state
		$(e).attr('src', datasrc)
			.attr('data-src',null);	
	} else {	
		// ensure queue proceeds on ignored elements.
		// TODO add descriptive data here, so that clients can digest the cause.
		$(e).trigger('skip')
	}
}


/**
	Adds an element to the image load queue.

	* All queue triggers are stored in: `$(body).queue("lazypic")`
	* Event triggers are attached, to start the next queue item on completion
*/
function imgLoadQueue(e) {
	$("body").queue("lazypic", 
		function() {
			attachImageQueueHooks(e);
			activateDataSrc(e);
			$(e).trigger("img-load-queued");
		}
	)
}

/** Adds every img to the page for processing. */
function imgLoadQueueAll(e) {
	$("img").each(function(index, e) {queueImageLoad(e)})
}


/** This is the trigger for the default queue.*/
function imgLoadNext() {
	$("body").dequeue("lazypic");
}


/**
Trigger all images on the page to be loaded in sequence.
*/  
function imgLoadAuto() {
	imgLoadQueueAll()
	nextImageLoad()
}

