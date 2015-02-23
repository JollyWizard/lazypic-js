LazyPic-JS
====

**A queued image loader for HTML Client Applications**

---

### Overview

#### The problem

HTML pages that become aware of a multiple image links will handle the acquisition of image data in ways that are difficult for the application developer to predict.  

Network latency and bandwidth create a horse race out of which images are available first and how quickly.  The performance of the page is tied closer to the end user and server performance than page design.

#### Design Considerations

Limiting the number and size of images on the page is a straightforward solution to potential problems, and can be handled from the design side.  There are downsides to this approach: 

* It takes work to prepare all of the images from higher resolution sources.

* It limits the potential amount and quality images on a given page, even if the images are intended to be displayed at separate times.

* It targets a specific bandwidth as the least common denominator.  Some systems still won't perform, leading to an inconsistent experience.

#### Server Side Solutions

There are various toolkits and libraries that minimize these costs with automatically prepared images and targeted performance profiles based on the user's browser information.

They are certainly steps in the right direction, regarding performance and effort, but they still have a cost in terms of time and process infrastructure.  Either the images have to be prepared in advance, or the server needs to be configured properly to handle the requests.

#### Lazy Loading - A Browser Based Approach

**LazyPic** approaches the impact of unpredictable image loading speed by managing the order in which the images are loaded from the browser side.  

JavaScript already has the facilities to trigger an image load programatically, and to respond to success and error cases.  HTML5 allows us to safely store meta-data in the HTML.  Using these facilities, we store the URL in the page, but 'hide' it, until it is ready to be loaded. 

* Image locations are stored as HTML5 friendly *data-src* attributes.  When it is time to load an image, the url is copied to the *src* tag, triggering the browser to load the image.  

* Images are loaded sequentially.  One starts when the previous image finishes.  
  * Important images can be prioritized.
  * Multiple sequences can be loaded in parallel, to direct the visual unfolding of the site.
  
* The order of image loading can be managed through through grouping and indexing of the target elements, or through custom programmatic triggers.  *not yet implemented*

* Event callbacks can be triggered to provide UI integration and error recovery.

Essentially, assumptions about the use case are leveraged to organize image loading into a queue, instead of a free for all.  By implementing this simple process, we get simple access to additional features.

#### User Perspective

Generally, a user would rather see one complete image over two incomplete images.  Once you move past the core image resources that define the look and feel of a site, users don't really need more than one image at a time to interact with.  The more likely a user is to transition through the images quickly, the more likely they are to have bandwidth that eliminates concerns.

For users with increased bandwidth, they may not see a difference in performance at all, or they may notice that the images unfold more coherently.  

Users starved for resources will have quicker access to the site in functional form, and and content will increase at a consistent rate.

Because the normal request cycle is still triggered, server-side approachs are still valid additions to the process, and unlike server side approachs, implementing lazypic provides immediate ajax/promise-like event hooks.

- - -

### Target Environment

**JQuery** is used for implementation, because of it's elegance, cross-browser uniformity, and inbuilt resources to handle the critical operations behind the process.

**RequireJS** support is intended (*not yet implemented*), to lay a baseline for module support, and minimize further impact on HTML code.

- - - 

### Deliverables

Non-development deliverables will be located in `/src/`

Currently, on the WIP api file is available.

* `scripts/lib`
	* `lazypic.js` : The main api, including jQuery plugin integration.

- - - 

### Test Suite

Tests are to be provided to guarantee the core contracts behave as expected.  

Tests are located under `/tests/`

Test Notes:

* Currently, tests are powered by QUnit, using remote resources.
* Currently, tests wait for the proper number of event triggers to finish.  The order of events, and relation to callback execution, must be checked manually.  This will probably be rectified with a more intelligent approach later.  Right now, the order of execution can be visually verified in the test assertions.

- - -

## Project Status

### API

Currently, the API support is in place for:

* jQuery Events for each state of the process ('img-load-*').
 * includes:
     * **img-load-queued** : fired when element asked to be added to the queue.
     * **img-load-start** : fired when the element loading starts.
     * **img-load-done** : fired when the element loading completes successfully.
     * **img-load-fail** : fired when the element loading fails.
     * **img-load-skip** : fired if the element is skipped because it's state would not allow a lazy load.
     * **img-load-always** : fired after all other *img-load-** events.  
* A Promise-like callback registry.
 * callback methods are executed when the matching event triggers on the element.  Accessing the promise installs the hooks to the event queue as an event listener.
 * includes:
     * **.done(callback)**
     * **.fail(callback)** 
     * **.skip(callback)**
     * **.start(callback)**
     * **.always(callback)**
* An image state object that wraps an image element and provides hooks to each stage of the process.
  * `state = imgLoadState(e)` 
  * `state.checks` : basic checks for readiness and image status
     * **.isLoaded()** checks if the image is already loaded.
     * **.isReady()** checks if the image is ready for a lazy load.
     * **.hasSrc()** checks to see if the source element exists beyond the default state.
     * **.hasDataSrc()** checks to see if a lazy load url is available on the object.
  * `state.promise` : gets the promise object (see above)
  * `state.trigger()` : initiates the lazy load on the element.
  * `state.queue()` : adds the item to the img-load queue.  *note* this will be changed to `add()`, with the queue providing access to the `queue()` object (for coherent triggering and integration with other tools).

Upcoming API features:

* a queue state object that can be used to deduce the queue site and control the process from the original image state object.
* a refractored trigger system that provides coherent public access to the functionality and makes internal code more readable.
* the kitchen sink...

- - -
## Examples

Examples will be forthcoming when the API is more coherent.

The test files provides the most coherent examples so far.