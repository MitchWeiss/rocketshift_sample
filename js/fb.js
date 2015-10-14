FB_SCOPE = 'email,user_about_me,user_activities,user_birthday,user_education_history,user_interests,user_likes,user_location,user_work_history,friends_work_history';

function fb_ping(response) {
	if (response.status === 'connected') {
		access_token = response.authResponse.accessToken;
		user_id = response.authResponse.userID;
		$.ajax({
			type: 'GET',
			url: '/fb/ping',
			data: {'access_token': access_token, 'facebook_user_id': user_id},
			success: function (data) {
				if (data == 'redirect') {
					if (window.location.pathname == '/login') {
						var target = getQueryVariable('target') || '/user/home';
						window.location = target;
					} else {
						$('nav').load('/navbar');
					}
				}
			}
		});
	}
	return false;
}

window.fbAsyncInit = function() {
	FB.init({
		appId      : '448501635230298', // App ID
		channelUrl : '//www.rocketshift.com.au/channel.html', // Channel File
		status     : true, // check login status
		cookie     : true, // enable cookies to allow the server to access the session
		xfbml      : true  // parse XFBML
	});
	FB.Event.subscribe('auth.login', function() {return false;}); // Prevent page reload after login.
	FB.Event.subscribe('auth.authResponseChange', fb_ping);
};

(function(d){
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement('script'); js.id = id; js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

$(document).ready(function() {

	$('form.register-fb-form').submit(function () {
		FB.Event.unsubscribe('auth.authResponseChange', fb_ping);
		$submit = $(this).find('.submit-register-fb');
		$submit.attr('data-loading-text', "<i class='icon-spinner icon-spin icon-large'></i> Authenticating");
		$submit.button('loading');
		var job = $(this).find('#input-job').val();
		FB.login(function(response) {
			if (response.status === 'connected') {
				access_token = response.authResponse.accessToken;
				user_id = response.authResponse.userID;
				$submit.html("<i class='icon-spinner icon-spin icon-large'></i> Building Profile");
				$.ajax({
					type: 'GET',
					url: '/fb',
					data: {'access_token': access_token, 'facebook_user_id': user_id, 'job': job},
					success: function (data) {
						window.location = (getQueryVariable('target') || (window.location.pathname != '/' ? window.location.pathname : false) || '/user/home');
					}
				});
			} else {
				$submit.button('reset');
			}
		}, {scope: FB_SCOPE});
		return false;
	});

	$('form.login-fb-form').submit(function () {
		FB.Event.unsubscribe('auth.authResponseChange', fb_ping);
		$submit = $(this).find('.submit-login-fb');
		$submit.attr('data-loading-text', "<i class='icon-spinner icon-spin icon-large'></i> Authenticating with Facebook");
		$submit.button('loading');
		FB.login(function(response) {
			if (response.status === 'connected') {
				access_token = response.authResponse.accessToken;
				user_id = response.authResponse.userID;
				$submit.html("<i class='icon-spinner icon-spin icon-large'></i> Loading Rocketshift Profile");
				$.ajax({
					type: 'GET',
					url: '/fb',
					data: {'access_token': access_token, 'facebook_user_id': user_id},
					success: function (data) {
						window.location = (getQueryVariable('target') || (window.location.pathname != '/' ? window.location.pathname : false) || '/user/home');
					}
				});
			} else {
				$submit.button('reset');
			}
		}, {scope: FB_SCOPE});
		return false;
	});

	facebook_connect = function() {
		FB.Event.unsubscribe('auth.authResponseChange', fb_ping);
		$submit = $('.submit-connect-fb');
		$submit.attr('data-loading-text', "<i class='icon-spinner icon-spin icon-large'></i> Authenticating with Facebook");
		$submit.button('loading');
		FB.login(function(response) {
			if (response.status === 'connected') {
				access_token = response.authResponse.accessToken;
				user_id = response.authResponse.userID;
				$submit.html("<i class='icon-spinner icon-spin icon-large'></i> Updating Rocketshift Profile");
				$.ajax({
					type: 'GET',
					url: '/fb',
					data: {'access_token': access_token, 'facebook_user_id': user_id},
					success: function (data) {
						window.location.reload();
					}
				});
			}
		}, {scope: FB_SCOPE});
		return false;
	}

});
