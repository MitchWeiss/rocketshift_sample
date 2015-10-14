contact_generic = function(element_id, id, input_selector){
	var element = $('#'+element_id);
	var label = element.text();
	var name = label.split(" ")[1].trim();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	$.get("/employers/get_credits", function(data){
		if(data.success === true){
			$(input_selector).val(id);
			$('.applicant_name').text(name);
			if(data['credits'] > 0){
				$('#contact-modal').modal('show');
				element.text(label);
			} else {
				$('#purchase-modal').modal('show');
				element.text(label);
			}
		} else {
			if(data.error == 'login'){
				window.location = '/employers/lor?target=' + window.location.pathname +
				'?modal=' + element_id;
			}
		}
	});
};

$(document).ready(function() {
	if (window.location.search.indexOf('?modal=') > -1) {
		var data = window.location.search.replace('?modal=', '');
		$('#' + data).click();
	}
});

contact_match = function(element, match_id){
	return contact_generic(element.attr('id'), match_id, 'input[name="match"]');
};

contact_employee = function(element, employee_id){
	return contact_generic(element.attr('id'), employee_id, 'input[name="employee"]');
};

employer_reject_match = function(element, match_id){
	element.addClass('disabled');
	var btn_text = element.text();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	$.get("/request/employer_reject_match/" + match_id, function(data) {
		if(data['success']){
			element.closest('div.col-sm-4').children().find('h2, h3, p, span, td').css('color', '#aaa');
			element.closest('div.col-sm-4').find('td.available').css('background-color', '#aaa');
			element.closest('div.col-sm-4').find('td.unavailable').css('background-color', '#777');
			element.text(btn_text);
			element.parent().prev().children(':first').addClass('disabled');
			element.parent().prev().prev().children(':first').addClass('disabled');
			element.blur();
			var name = element.parent().prev().children(':first').text().split(" ")[1].trim();
			$('.applicant_name').text(name);
			$('input[name="match"]').val(match_id);
			$('#reject-modal').modal('show');
		} else {
			element.removeClass('disabled');
			element.text(btn_text);
			alert("ERROR: " + data['error']);
		}
	});
	
};

employee_accept_match = function(element, match_id){
	element.addClass('disabled');
	var btn_text = element.text();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	$.get("/matches/accept_employee_match/" + match_id, function(data) {
		if(data['success']){
			element.text('Application lodged');
			var cancel_btn = element.parent().next().children(':first');
			cancel_btn.text('Cancel application');
			cancel_btn.attr('onClick', cancel_btn.attr('onClick').replace('reject', 'cancel'));
			element.blur();
		} else {
			element.removeClass('disabled');
			element.text(btn_text);
			alert("ERROR: " + data['error']);
		}
	});
	return false;
};

employee_cancel_match = function(element, match_id){
	element.addClass('disabled');
	var btn_text = element.text();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	$.get("/matches/cancel_employee_match/" + match_id, function(data) {
		if(data['success']){
			var previous = element.parent().prev().children(':first');
			previous.removeClass('disabled');
			previous.text('Apply to this position');
			element.text('Reject position');
			element.removeClass('disabled');
			element.attr('onClick', element.attr('onClick').replace('cancel', 'reject'));
			element.blur();
		} else {
			element.removeClass('disabled');
			element.text(btn_text);
			alert("ERROR: " + data['error']);
		}
	});
	return false;
};

employee_reject_match = function(element, match_id){
	$('input[name="match"]').val(match_id);
	element.addClass('disabled');
	var btn_text = element.text();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	$.get("/matches/reject_employee_match/" + match_id, function(data) {
		if(data['success']){
			element.closest('div.col-sm-4').children().find('h2, h3, p, span, td').css('color', '#aaa');
			element.closest('div.col-sm-4').find('td.available').css('background-color', '#aaa');
			element.closest('div.col-sm-4').find('td.unavailable').css('background-color', '#777');
			element.addClass('disabled');
			element.text(btn_text);
			element.parent().prev().children(':first').addClass('disabled');
			element.blur();
			$('#reject-match-modal').modal('show');
		} else {
			element.removeClass('disabled');
			element.text(btn_text);
			alert("ERROR: " + data['error']);
		}
	});
	return false;
};

$('#purchase-credits-form button[type="submit"]').on('click', function(){
	$('#purchase-credits-form button[type="submit"]').addClass('disabled');
	$.post($('#purchase-credits-form').attr('action'), {'purchase':$(this).val()}, function(){
		$('#contact-confirm-form').submit();
	});
	return false;
});

$('#reject-modal').on('hidden.bs.modal', function () {
	$('select[name="reason"] option:first-child').attr('selected', true);
	$('#other-container').hide();
	$('#other-container input').val('');
	$('#input-permanent').prop('checked', false);
});

$('select[name="reason"]').change(function(){
	if($(this).find(':selected').val() == 'other'){
		$('#other-container').slideDown();
	} else {
		$('#other-container').slideUp();
	}
});

$('#purchased-users > div.row:first-child').remove();
cancel_request = function(element, request_id){
	element.addClass('disabled');
	var btn_text = element.text();
	element.html("<i class='icon-spinner icon-spin icon-large'></i>");
	if (!confirm('Are you sure you want to close this request?')) {
		element.blur();
		return;
	}
	$.get("/request/cancel_candidate_request/" + request_id, function(data) {
		if(data['success']){
			element.closest('div.col-sm-4').children().find('h2, h3, p, span, td').css('color', '#aaa');
			element.closest('div.col-sm-4').find('td.available').css('background-color', '#aaa');
			element.closest('div.col-sm-4').find('td.unavailable').css('background-color', '#777');
			element.text(btn_text);
			element.parent().prev().children(':first').addClass('disabled');
			element.blur();
			$.get("/request/get_request_pushed_or_purchased_candidates/" + request_id, function(data) {
				$('#purchased-users').empty();
				if(data['candidates'].length === 0){
					return;
				}
				if(data['purchased'] === 0){
					
				} else {
					$.each(data['candidates'], function(i, v){
						if(!v['purchased']){
							return;
						}
						//var template = $('#purchased-users > div.row:first-child').clone()[0].outerHTML;
						var temp = template.replace(/_([a-z-]+)_/g, '$1-' + v['match_id']);
						temp = $(temp);
						temp.find('.applicant_name').text(v['name']);
						temp.find('.profile_img').attr('src', v['profile_img_url']);
						$('#purchased-users').append(temp);
					});
					//$('#purchased-users > div.row:first-child').remove();
					$('#close-purchase-modal').modal({keyboard: false, backdrop: 'static'});
					$('#close-purchase-modal').modal('show');
				}
			});
		} else {
			element.removeClass('disabled');
			element.text(btn_text);
			alert("ERROR: " + data['error']);
		}
	});
};

$(document).on('change', 'input:radio[name^=hired]', function(){
	if($(this).val() == '0'){
		$(this).parents().eq(5).next().slideDown();
		console.log($(this).parents().eq(5).next());
	} else {
		$(this).parents().eq(5).next().slideUp();
	}
});

$(document).on('change', 'select[name^=reason]', function(){
	if($(this).val() == 'other'){
		$(this).parents().eq(3).next().slideDown();
	} else {
		$(this).parents().eq(3).next().slideUp();
	}
});
