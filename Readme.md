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

These are certainly steps in the right direction, but they still have a cost in terms of time and process infrastructure.  Either the images have to be prepared in advance, or the server needs to be configured properly to handle the requests.



#### Lazy Loading - A Browser Based Approach

**LazyPic** approaches the impact of unpredictable image loading speed by managing the order in which the images are loaded from the browser side.  

* Image locations are stored as HTML5 friendly *data-src* attributes.  When it is time to load an image, the url is copied to the *src* tag, triggering the browser to load the image.  

* Images are loaded sequentially.  One starts when the previous image finishes.  This allows images to be prioritized and clients to maximize the availability of the next image.  Multiple sequences can be loaded in parallel, when doing so is not expected to affect performance.
 
* The order of image loading can be managed through through grouping and indexing. 

* Event callbacks can be triggered to provide UI integration and error recovery.

Essentially, assumptions about the use case are leveraged to organize image loading into a queue, instead of a free for all.  By implementing this simple process, we get simple access to additional features.

Generally, a user would rather see one complete image over two incomplete images.  Once you move past the core image resources that define the look and feel of a site, users don't really need more than one image at a time to interact with.  The more likely a user is to transition through the images quickly, the more likely they are to have bandwidth that eliminates concerns.

Those users won't generally see the difference that sequential loading makes, but users starved for resources will have access to the site in functional form, and and content will increase at a consistent rate.

Because the normal request cycle is still triggered, server-side approachs are still valid additions to the process, and unlike server side approachs, implementing lazypic provides immediate ajax/promise event hooks.

- - -

### Target Environment

**JQuery** is used for implementation, because of it's elegance and inbuilt resources to handle the critical operations behind the process.

**RequireJS** is supported, to lay a baseline for module support, and minimize further impact on HTML code.


