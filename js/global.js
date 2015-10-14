function escapeHtml(text) {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function unescapeHtml(text) {
	return text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&#039;/g, "'");
}

function getQueryVariable(variable) {
	var query = window.location.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		if (decodeURIComponent(pair[0]) == variable) {
			return decodeURIComponent(pair[1]);
		}
	}
	return null;
}

$(document).ready(function() {
	$(window).resize(function(){
		$('.th-vertical').height(function(){
			$(this).height($(this).next().width());
		});
	});
	$(window).resize();

	var classes = [];
	$('[class^=equal-height-]').each(function() {
		var class_name = $.grep($(this).attr('class').split(" "), function(v, i){
			return v.indexOf('equal-height') === 0;
		}).join();
		if($.inArray(class_name, classes) == -1){
			classes.push(class_name);
		}
	});
	$.each(classes, function(i, v) {
		var max_height = 0;
		$('.' + v).each(function() {
			var height = parseInt($(this).css('height'));
			if(height > max_height){
				max_height = height;
			}
		});
		$('.' + v).each(function() {
			var current_height = parseInt($(this).css('height'));
			$(this).css('padding-top', (max_height - current_height) / 2);
			$(this).css('padding-bottom', (max_height - current_height) / 2);
		});
	});

	$('.progress-bar').css('width', $("input:hidden[name='profile_score']").val() + '%');

	build_select2_query_function = function (url, insert_query_term) {
		return function (query) {
			$.ajax({
				url: url,
				data: {'q': query.term},
				success: function (data) {
					var results = [];
					for (var i = 0; i < data.length; i++) {
						results.push({id: data[i], text: data[i]});
					}
					if (insert_query_term && query.term) {
						results.push({id: query.term, text: query.term});
					}
					query.callback({'results': results});
				}
			});
		};
	};
	select2_default_init_selection = function (element, callback) {
		var data = {id: element.val(), text: element.val()};
		callback(data);
	};

	$('.suburb-typeahead').select2({
		minimumInputLength: 0,
		placeholder: 'Your location',
		query: build_select2_query_function('/suburb'),
		initSelection: select2_default_init_selection
	});

	$('.position-typeahead').select2({
		minimumInputLength: 0,
		placeholder: 'Bartender, Chef, etc.',
		query: build_select2_query_function('/job', true),
		initSelection: select2_default_init_selection
	});

	var jobs = [];
	$.ajax({
		url: '/job',
		success: function (data) {
			jobs = data;
		},
		async: false
	});
	$(".job-typeahead").select2({
		minimumInputLength: 0,
		placeholder: 'Bartender, Chef, etc.',
		tags: jobs,
		tokenSeparators: [',', '/', '\\']
	});

	rs_ajax_form = function (form, on_success, on_error) {
		$(form).submit(function () {
			$(form).find('button[type=submit]').button('loading');
			$.ajax({
				type: $(form).attr('method'),
				url: $(form).attr('action'),
				data: $(form).serialize(),
				success: function (data) {
					$(form).find('.control-error span').html('');
					if (data.success) {
						var do_normal_success_handling = true;
						if (typeof on_success === 'function') {
							if (on_success(data) === false) {
								do_normal_success_handling = false;
							}
						}
						if (do_normal_success_handling) {
							if (data.target) {
								window.location = data.target;
							} else {
								$(form).find('button[type=submit]').button('reset');
							}
						} else {
							$(form).find('button[type=submit]').button('reset');
						}
					} else {
						var do_normal_error_handling = true;
						if (typeof on_error === 'function') {
							if (on_error(data) === false) {
								do_normal_error_handling = false;
							}
						}
						if (do_normal_error_handling) {
							if (!$.isArray(data.errors)) {
								$.each(data.errors, function(key, value) {
									$(form).find('#'+key+'-error').html(value);
								});
								$(form).find('[id^=input-]').each(function (i, element) {
									var key = element.id.replace('input-', '');
									$(element).change(function() {
										$(form).find('#'+key+'-error').html('');
									});
									if (key in data.errors) {
										if ($(element).data('select2') !== undefined && $(element).data('select2') !== null) {
											$(element).select2('open');
										} else {
											$(element.focus());
										}
										data.errors = {};
									}
								});
							} else {
								console.log('ERROR: data.success is false but no errors are defined. Response: ' + JSON.stringify(data));
							}
						}
						$(form).find('button[type=submit]').button('reset');
					}
				}
			});
			return false;
		});
	};

	rs_ajax_form('#contact-form',
		function() {
			$('#contact-alert').show();
			$('#contact-form').trigger("reset");
		},
		function() {
			$('#contact-alert').hide();
		}
	);
	rs_ajax_form('#recovery-form',
		function() {
			$('#recovery-alert').show();
			$('#recovery-form').trigger("reset");
		},
		function() {
			$('#recovery-alert').hide();
		}
	);
	rs_ajax_form('#reset-form');
	rs_ajax_form('#login-form');
	rs_ajax_form('#login-header-form');
	rs_ajax_form('#register-form');
	rs_ajax_form('#settings-form',
		function() {
			$('#settings-alerts').html('<div class="alert alert-success">Settings Updated</div>');
			$('body').animate({ scrollTop: 0 }, 'slow');
		},
		function() {
			$('#settings-alerts').html('');
		}
	);
	rs_ajax_form('#password-change-form',
		function() {
			$('#password-change-alerts').html('<div class="alert alert-success">Password Updated</div>');
			$('#password-change-form').trigger('reset');
			$('body').animate({ scrollTop: 0 }, 'slow');
		},
		function() {
			$('#password-change-alerts').html('');
			return true;
		}
	);
	rs_ajax_form('#register-step-1-form');
	rs_ajax_form('#register-step-4-form');
	rs_ajax_form('#request-staff-form');
	rs_ajax_form('#employer-reject-form',
		function() {
			$('#reject-modal').modal('hide');
		}
	);
	rs_ajax_form('#contact-confirm-form',
		function() {
			window.location = window.location.pathname;
		},
		function() {
			$('#contact-modal').modal('hide');
		}
	);
	rs_ajax_form('#employee-reject-form',
		function() {
			$('#reject-match-modal').modal('hide');
		},
		function() {
			$('#reject-match-modal').modal('hide');
		}
	);
	rs_ajax_form('#employer-close-form',
		function() {
			$('#close-purchase-modal').modal('hide');
		},
		function() {
			$('#close-purchase-modal').modal('hide');
		}
	);

	$('.btn-register-email').click(function() {
		var $form = $(this).closest('form');
		var job = $form.find('#input-job').val();
		window.location = 'hire_me.html';
		return false;
	});

	$('.submit-register-fb').click(function() {
		var $form = $(this).closest('form');
		var job = $form.find('#input-job').val();
		window.location = 'hire_me.html';
		return false;
	});

	$('.toggle-button').on('click', function() {
		$('.input-toggle').prop('checked', false);
		$(this).children().prop('checked', true);
	});

	check_notification = function() {
		$.get("/ajax/get_notifications", function(data) {
			$('.notification-menu').empty();
			if (data.success == false) {
				setTimeout(check_notification, 600000);
			} else {
				setTimeout(check_notification, 60000);
			}
			if(data.success == false || data.notifications.length == 0){
				$('.notification-menu').append('<li class="notification-item">No notifications</li>');
			} else {
				var unread_count = 0;
				$.each(data.notifications, function(){
					var notification = '<li id="note_' + $(this)[0]['id'] + '" class="notification-item' + (($(this)[0]['seen'] == 0) ? " unread" : "") +'">' + 
									$(this)[0]['note'] +
									'<br/><abbr class="timeago" title="' + $(this)[0]['date'] + '">' + $(this)[0]['nicedate'] + '</abbr></li>';
					$('.notification-menu').append(notification);
					if(($(this)[0]['seen'] == 0)){
						unread_count++;
					}
				});
			}
			$("abbr.timeago").timeago();
			if(unread_count > 0){
				$('.notification-badge').text(unread_count);
				$('.notification-badge').show();
			}
		});
	};

	check_notification();

	mark_notifications_read = function() {
		var unread = new Array();
		$('.notification-item').each(function(){
			if($(this).hasClass('unread')){
				unread.push(parseInt($(this).attr('id').split('_')[1]));
			}
		});
		if(unread.length > 0){
			$.post("/ajax/mark_notifications_read", {unread : JSON.stringify(unread)});
		}
	};

	$('.notifications').on('click', function() {
		//If not open as the open class is only added after this function is run
		if(!$(this).hasClass('open')){
			mark_notifications_read();
		}
	});

	$('.notifications').on('hidden.bs.dropdown', function () {
		$('.notification-item').removeClass('unread');
		$('.notification-badge').text(0);
		$('.notification-badge').hide();
	});
});
