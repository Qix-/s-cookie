# s-cookie

`document.cookie` binding for S.js signals.

## Usage

```console
$ npm i --save @qix/s-cookie
```

> **CAVEAT:** There are (currently) no events to detect when a document's cookie
> value has changed. Thus, we elect to poll every 100 milliseconds. This means
> that multiple changes to a cookie may only update the signal with the final
> value. Further, we do not check previous values before updating - therefore,
> using `S.data` as the factory parameter (which otherwise defaults to `S.value`)
> will cause any dependent S computations to run 10 times a second, uncondtionally.
> Because of this, using the factory parameter is not recommended unless you have
> a _really_ good reason to use something other than `S.value`.

```javascript
import cookieSignal from '@qix/s-cookie';

const session_id = cookieSignal(
	'session_id', // cookie name to bind to
	'1234',       // (optional) initial value
	S.value       // (optional, not recommended) signal factory
	              //     (either S.value (the default) or S.data)
);

S.root(() => {
	// Signal -> Cookie binding
	console.log(document.cookie); //-> session_id=1234
	session_id("5678");
	console.log(document.cookie); //-> session_id=5678

	// Cookie -> Signal binding (latency: 100ms)
	console.log(session_id()); //-> 5678
	document.cookie = 'session_id=abcd';
	console.log(session_id()); //-> abcd (may take 100ms to show up)

	// Expiration (by signal)
	console.log(document.cookie) //-> session_id=abcd
	session_id(null);
	console.log(document.cookie) // <no output>

	// Expiration (via cookie expiration)
	//  (setting the age to max-age=0 forces expiration, but
	//  this will also be the case if the server sets an expiration
	//  date/time or a maximum age as well)
	session_id('wxyz');
	document.cookie = 'session_id=; max-age=0';
	console.log(session_id()); //-> null
});
```

# License
Copyright &copy; 2019 by Josh Junon. Released under the MIT License.
