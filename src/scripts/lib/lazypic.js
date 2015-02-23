

/**
	This function will return a lazypic state object 
	wrapping the target element in API functionality 
*/
function imgLoadState(e) {
	var state = {
		/** The element the data targets */
		element : e,
		
		/** Utility check methods, wrapped around the element.	*/
		checks : imgLoadChecks(e),
		
		/** Execute a data-src image load.	*/
		trigger : function() {
			activateDataSrc(e)
		},
		
		/** Add the image to the queue */
		queue : function() {
			imgLoadQueue(e)
			return state.promise
		},
		
		/** Gets the promise regarding the image load event */
		promise : imgLoadPromise(e)
	};
	return state;
}

/**
	This function constructs an interface to perform state checks on the target element.
	It is intended to be shared by end users (state-object::checks) and the 
	internal utility functions (API).
	
*/
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

function imgLoadListeners(e) {
	var listeners = {
		isInstalled : function() {
			return $(e).data('img-load-listeners') == true
		},
		install : function() {
			$(e)
			.bind({
				"img-load-always" : function() {
					$(this).dequeue("img-load-always")
				},
				
				"img-load-done"	: function() {
					$(this).dequeue("img-load-done")
				},
				
				"img-load-fail" : function() {
					$(this).dequeue("img-load-fail")
				},
				
				"img-load-start" : function() {
					$(this).dequeue("img-load-start")
				},
				
				"img-load-skip" : function() {
					$(this).dequeue("img-load-skip")
				}
			});
			
			$(e).data('img-load-installed', true);
		},
		
		ensure : function() {
			if (!listeners.isInstalled())
				listeners.install()
		}
	}
	return listeners
}

/**
  Returns a set of triggers that execute the queue trigger events.
*/
function imgLoadTriggers(e) {
	
	function start	()	{$(e).trigger('img-load-start'  );}	
	function always	()	{$(e).trigger('img-load-always' );}
	function skip	()	{$(e).trigger('img-load-skip'	);always();}
	function done	() 	{$(e).trigger('img-load-done'	);always();}
	function fail	()	{$(e).trigger('img-load-fail'	);always();}
	
	function buildTrigger() {
		return {
			always	: always,
			done	: done,
			fail	: fail,
			start	: start,
			skip	: skip
		}
	}

	return buildTrigger();
}

/** 

Get a promise-like interface that caches callbacks 
intended to be triggered by the related event cycle
of the image loading process. 
*/
function imgLoadPromise(e) {	
	imgLoadListeners(e).ensure();
	var promise = {
		always : function(callback) {
			$(e).queue("img-load-always",callback)
			return promise;
		},
		done : function(callback) {
			$(e).queue("img-load-done", callback)
			return promise;
		},
		fail : function(callback) {
			$(e).queue("img-load-fail",callback)
			return promise;
		},
		start : function(callback) {
			$(e).queue("img-load-start", callback)
			return promise;
		},
		skip  : function(callback) {
			$(e).queue("img-load-skip", callback)
			return promise;
		}
	}
	return promise
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
		$(e).trigger('img-load-start');
	
		$(e).attr('src', datasrc)
			.attr('data-src',null);	
	} else {	
		// right now this is hooked on next
		// b/c duplicate events would be forwarded.
		// if skip were used.
		imgLoadTriggers(e).skip()
	}
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
	var triggers = imgLoadTriggers(e);
	
	$(e).one({
		load : triggers.done ,
		error : triggers.fail,
		start : triggers.start
	});
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
		}
	)
	$(e).trigger("img-load-queued");
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

