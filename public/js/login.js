/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
	console.log(email, password);
	try {
		const res = await axios({
			method: 'POST',
			url: 'http://127.0.0.1:3000/api/v1/users/login',
			data: {
				email,
				password
			}
		});

		if (res.data.status === 'success') {
			showAlert('success', 'logged in successfully !!');
			window.setTimeout(() => {
				location.assign('/');
			}, 1200);
		}
		console.log(res);
	} catch (e) {
		showAlert('error', e.response.data.message);
	}
};

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: 'http://127.0.0.1:3000/api/v1/users/logout'
		});

		if ((res.data.status = 'success')) location.reload(true);
	} catch (error) {
		showAlert('error', 'error logged out, please try again');
	}
};
