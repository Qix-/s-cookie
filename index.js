import S from 's-js';

const cookieSubscribers = {};

function parseCookies() {
	const res = {};

	document.cookie.split(/; +/g).forEach(cp => {
		const eidx = cp.indexOf('=');
		if (eidx === -1) {
			res[cp] = '';
		} else {
			res[cp.slice(0, eidx)] = cp.slice(eidx + 1);
		}
	});

	return res;
}

function checkCookies() {
	const cookies = parseCookies();

	S.freeze(() => {
		for (const name of Object.keys(cookieSubscribers)) {
			const value = name in cookies ? cookies[name] : null;
			cookieSubscribers[name].forEach(sub => sub(value));
		}
	});
}

if (typeof navigator === 'object' && 'cookieEnabled' in navigator && !navigator.cookieEnabled) {
	console.warn('Cookies are disabled; s-cookie will do nothing!');
} else {
	setInterval(checkCookies, 100);
}

export default (
	name,
	{
		init=null,
		factory=S.value,
		domain=null,
		path=null,
		secure=false
	} = {}
) => {
	if (typeof document !== 'object') {
		throw new Error('document could not be found! s-cookie does not work outside of browsers');
	}

	const cookie = factory(init);

	const metaChunks = [];
	if (domain) metaChunks.push(';domain=' + domain);
	if (path) metaChunks.push(';path=' + path);
	if (secure) metaChunks.push(';secure');
	const meta = metaChunks.join('');

	cookie.expireAt = date => {
		document.cookie = S.sample(cookie) + meta + ";expires=" + date.toUTCString();
	};

	cookie.expireIn = seconds => {
		document.cookie = S.sample(cookie) + meta + ";max-age=" + seconds;
	};

	const cookies = parseCookies();
	if (name in cookies) {
		cookie(cookies[name]);
	} else if (init !== null) {
		document.cookie = name + "=" + init + meta;
	}

	if (!cookieSubscribers[name]) cookieSubscribers[name] = [];
	cookieSubscribers[name].push(cookie);

	S.root(() => {
		S.on(cookie, () => {
			document.cookie = name + "=" + (
				cookie() === null
					? (meta + "; max-age=0")
					: (cookie() + meta)
			);
		}, null, true);
	});

	return cookie;
};
