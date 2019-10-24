import * as Surplus from 'surplus';
import S from 's-js';
import data from 'surplus-mixin-data';

import cookieSignal from '.';

const Root = ({error, errorInput, cookieString}) => (
	<div>
		<div style={{
			background: (error() ? '#f88' : '#ddd'),
			color: (error() ? 'inherit' : '#b00'),
			font: '14pt "Trebuchet MS"',
			padding: '1rem'
		}}>
			{error()}
		</div>
		<div>
			<label for="error">Error:</label>&nbsp;<input type="text" id="error" fn={data(errorInput)} />
		</div>
		<div>
			<button onClick={() => {error(null)}}>Force expire</button>
			<button onClick={() => {document.cookie = 'error_message=;max-age=0'}}>Force expire (low level)</button>
		</div>
		<div>
			Cookie string:&nbsp;
			<code>
				{cookieString()}
			</code>
		</div>
	</div>
);

S.root(() => {
	const error = cookieSignal('error_message', 'This is an error message!');

	// We have to do this because spaces typed in the
	// input box will get removed by the cookie handler
	// because cookies cannot have trailing spaces.
	const errorInput = S.value(error());
	S(() => error(errorInput()));
	S(() => error() === null && errorInput(null));

	const cookieString = S.value(document.cookie);
	setInterval(() => cookieString(document.cookie), 20);

	document.body.appendChild(Root({error, errorInput, cookieString}));
});
