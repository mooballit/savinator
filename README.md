savinator
=========

An HTTP proxy which saves requested resources to disk

Installation
------------

Use ``npm install`` to install the dependencies

How to use
----------

Start the proxy using ``nodejs proxy.js``. Configure the browser to use http://localhost:8081 as a proxy. Browse.
The files requested by the browser during the browsing session will be saved in ``./sites/`` subdirectory.


Credits
-------

Based on "A HTTP Proxy Server in 20 Lines of node.js Code" by Peteris Krumins
(http://www.catonmat.net/http-proxy-in-nodejs/)
