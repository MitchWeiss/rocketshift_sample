__stars_editable = false;
__rate_user = true;
disable_star_editing =  function() {
	__stars_editable = false;
	$('.star').css('cursor', 'default');
	
	$('.star_container').each(function() {
		value = $(this).find('input[type=hidden]').val();
		$(this).find('.star').each(function(index){
			$(this).removeAttr('title');
			if (index+1 <= value) {
				$(this).addClass('fullStar');
			}
		});
		set_title($(this), parseInt(value));
	});
}

enable_star_editing =  function() {
	__stars_editable = true;
	$('.star').css('cursor', 'pointer');
	
	$('.star_container').each(function() {
		$(this).find('.star').each(function(index){
			set_title($(this), index+1);
		});
	});
}

enable_user_rating = function() {
	__rate_user = true;
}

disable_user_rating = function() {
	__rate_user = false;
}


set_title = function (element, value) {
	switch(value) {
		case 1: 
			element.attr('title', 'Beginner');
			break;
		case 2:
			element.attr('title', 'Intermediate');
			break;
		case 3:
			element.attr('title', 'Expert');
			break;
		default:
			break;
	}
}

$(document).ready(function(){
	$(document).on('mouseenter', '.star', function () {
		if (!__stars_editable) return;
		$(this).addClass('tmp_fs').prevAll().addClass('tmp_fs');
		$(this).nextAll().addClass('tmp_es');
	});
	$(document).on('mouseleave', '.star', function () {
		if (!__stars_editable) return;
		$(this).removeClass('tmp_fs').prevAll().removeClass('tmp_fs');
	    $(this).nextAll().removeClass('tmp_es');
	});
	$(document).on('click', '.star', function () {
		if (!__stars_editable) return;
		hidden = $(this).parent().find('input[type=hidden]'); 
		hidden.val($(this).index()+1);
		if(__rate_user == true){
			$.ajax({
				type: 'POST',
				url: '/employee/rate_employee_skill',
				data: {'skill': hidden.attr('name'),
					'rating': hidden.val()}
			});
		}
		$(this).addClass('fullStar').prevAll().addClass('fullStar');
		$(this).nextAll().removeClass('fullStar');
	});
	disable_star_editing();
});
