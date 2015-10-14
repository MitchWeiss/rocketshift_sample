// vim:noet:sts=4:sw=4:

var tours;
$(document).ready(function(){
	$.get('/ajax/get_user_viewed_tours/' + $(location).attr('pathname').split("/")[2], function(data) {
		if (data.success === false) {
			return;
		}
		tours = data.tours;
		if($.inArray('main_tour', tours) == -1){
			hopscotch.startTour(main_tour);
		}
	});

	$(".edit-btn").click(function(){
		if($(this).hasClass('disabled')){
			return;
		}
		if($(this).hasClass('done')){
			if($('#editor').length){
				if(!confirm('Changes haven\'t been saved. Continue?')){
					return false;
				} else {
					$('#editor_cancel').click();
				}
			}
			$('.edit-btn').removeClass('disabled');
			$(this).removeClass('done');
			$(this).text('Edit');
			$(this).trigger('done');
		} else {
			$('.edit-btn').not(this).each(function(){
				$(this).addClass('disabled');
			})
			$(this).addClass('done');
			$(this).text('Done');
			$(this).trigger('editable');
		}
	});
	
	$("#about_edit").on('editable', function(){
		$('#no_about_msg').remove();
		$('#about_bio').hide();
		$('#about_bio').after('<textarea class="form-control" id="about_bio_edit" rows="6" style="resize:none;">' + 
			$('#about_bio').html().replace(/<br\s*[\/]?>/gi, '\n') + '</textarea>');
		
		if($.inArray('about_tour', tours) == -1){
			hopscotch.endTour(true);
			hopscotch.startTour(about_tour);
		}
		
	});
	
	$("#about_edit").on('done', function(){
		$.ajax({
			type: 'POST',
			url: '/employee/set_employee_about',
			data: {'about': $('#about_bio_edit').val()},
			success: function (data) {
				$('#about_bio').text($("#about_bio_edit").val())
					.html(function(index, old) { return old.replace(/\n/g, '<br />') });
				$("#about_bio").show();
				$('#about_bio_edit').remove();
			}
		});
	});
	
	$("#skills_edit").on('editable', function(){
		skills_edit();
	});

	skills_edit = function(show_tours) {
		show_tours = typeof show_tours !== 'undefined' ? show_tours : true;
		enable_star_editing();
		$('#skills_container > div.row > div.col-xs-5').prepend('<div class="pull-right"><i class="icon-minus-sign skill_remove" title="Remove Skill"></i></div>');

		$('#skills_container > div.row:last-child').show();

		var skills = [];
		$.ajax({
			url: '/skill',
			success: function (data) {
				skills = data;
			},
			async: false
		});
		$('.skills-typeahead').select2({
			minimumInputLength: 0,
			placeholder: 'Latte Art, Cocktail Making, etc',
			tags: skills,
			tokenSeparators: [',', '/', '\\']
		});
		function add_skill(skill) {
			$.ajax({
				type: 'POST',
				url: '/employee/add_employee_skill',
				data: {'skill': skill},
				success: function (data) {
					if (data == ''){
						return false;
					}
					var new_skill = '<div class="row"><div class="col-xs-7"><span class="badge">' +
						skill + '</span></div><div class="col-xs-5"><div class="pull-right"><i class="icon-minus-sign skill_remove"></i></div><div class="star_container pull-right"><a class="star fullStar"></a><a class="star"></a><a class="star"></a><input type="hidden" name="skill_' +
						data.toString() + '" value="<?=$skill->rating?>" /></div></div></div>';
					$(new_skill).insertBefore('#skills_container div.row:last-child');
					enable_star_editing();
					if (show_tours && $.inArray('skills_exp_tour', tours) == -1){
						hopscotch.endTour(true);
						hopscotch.startTour(skills_exp_tour);
					}
				}
			});
			$('.skills-typeahead').select2('val', '');
		}
		$('.skills-typeahead').on('change', function(e) {
			add_skill(e.added.text);
		});

		if (show_tours && $.inArray('skills_tour', tours) == -1){
			hopscotch.endTour(true);
			hopscotch.startTour(skills_tour);
		}

		$(document).on('click', '.skill_remove', function () {
			if (!confirm('Are you sure you want to remove this skill?')) {
				return;
			}
			$.ajax({
			type: 'POST',
			url: '/employee/hide_employee_skill',
			data: {'skill': $(this).parent().parent().find('input[type=hidden]').attr('name')}
			});
			$(this).parent().parent().parent().remove();
		});

	};
	
	$("#skills_edit").on('done', function() {
		skills_edit_done();
	});

	skills_edit_done = function() {
		disable_star_editing();
		$('.skill_remove').remove();
		$('#skills_container div.row:last-child').hide();
	};

	$("#work_edit").on('editable', function() {
		work_edit();
	});

	work_edit = function(registering){
		registering = typeof registering !== 'undefined' ? registering : false;
		$('#no_work_exp_msg').remove();
		if (registering) {
			var edit_remove_buttons = '<div class="col-sm-3" style="text-align:right;padding-top:8px;"><button class="btn btn-small btn-link item_edit" style="font-size: 14px;">Edit</button><button class="btn btn-small btn-link item_remove" style="font-size: 14px;">Delete</button></div>';
			$(edit_remove_buttons).insertAfter('#work_container .profile_item');
		} else {
			$('<i class="icon-edit item_edit" title="Edit"></i> <i class="icon-minus-sign item_remove" title="Remove"></i>').insertAfter('#work_container .profile_item b:nth-child(2)');
		}

		$('<div id="add_new" style="margin-left:8px; text-align:center; height:50px;"> \
			<a style="cursor: pointer;" class="btn btn-danger" id="add_new_btn">Add a new position</a></div>').insertBefore('#work_container');
		
		$('#add_new_btn').on('click', function(){
			$('#add_new').hide();
			create_editor(registering, $('#add_new').next(), 'work', null);
			$('.item_remove').addClass('disabled');
			$('.item_edit').addClass('disabled');
		});

		if(!$.trim($('#work_container').text()).length){
			$('#add_new_btn').click();
		}

		$(document).on('click', '.item_remove', function(){
			if($(this).hasClass('disabled')){
				return;
			}
			if (!confirm('Are you sure you want to remove this work experience?')) {
				return;
			}
			$.ajax({
				type: 'POST',
				url: '/employee/hide_employee_work_experience',
				data: {'work_exp': $(this).parent().parent().find('input[type=hidden]').val()}
			});
			
			$(this).parent().parent().remove();
		});
		
		$(document).on('click', '.item_edit', function(){
			if($(this).hasClass('disabled')){
				return;
			}
			var parent = $(this).parent().parent();
			var id = parent.find('input[type=hidden]').val();
			
			parent.hide();
			$('#add_new').hide();
			$('.item_remove').addClass('disabled');
			$('.item_edit').addClass('disabled');
			$.get('/ajax/get_employee_work_experience/' + id, function(data) {
				create_editor(registering, parent.parent(), 'work', data);
			});
			
		});
	};
	
	$('#work_edit').on('done', function(){
		work_edit_done();
	});

	work_edit_done = function(){
		$('#add_new').remove();
		$('#editor').remove();
		$('.item_edit').remove();
		$('.item_remove').remove();
		$(document).off('click', '.item_remove');
		$(document).off('click', '.item_edit');
	};

	$("#qualifications_edit").on('editable', function() {
		qualifications_edit();
	});

	qualifications_edit = function(registering) {
		registering = typeof registering !== 'undefined' ? registering : false;
		$('#no_quals_exp_msg').remove();
		if (registering) {
			var edit_remove_buttons = '<div class="col-sm-3" style="text-align:right;padding-top:8px;"><button class="btn btn-small btn-link item_edit" style="font-size: 14px;">Edit</button><button class="btn btn-small btn-link item_remove" style="font-size: 14px;">Delete</button></div>';
			$(edit_remove_buttons).insertAfter('#qualification_container .profile_item');
		} else {
			$('<i class="icon-edit item_edit" title="Edit"></i> <i class="icon-minus-sign item_remove" title="Remove"></i>').insertAfter('#qualification_container .profile_item b:nth-child(2)');
		}

		$('<div id="add_new" style="margin-left:8px; text-align:center; height:50px;"> \
			<a style="cursor: pointer;" class="btn btn-danger" id="add_new_btn">Add a new qualification</a></div>').insertBefore('#qualification_container');
		
		$('#add_new_btn').on('click', function(){
			$('#add_new').hide();
			create_editor(registering, $('#add_new').next(), 'qualification', null);
			$('.item_remove').addClass('disabled');
			$('.item_edit').addClass('disabled');
		});

		if(!$.trim($('#qualification_container').text()).length){
			$('#add_new_btn').click();
		}

		$(document).on('click', '.item_remove', function(){
			if($(this).hasClass('disabled')){
				return;
			}
			if (!confirm('Are you sure you want to remove this qualification?')) {
				return;
			}
			$.ajax({
				type: 'POST',
				url: '/employee/hide_employee_qualification',
				data: {'qualification': $(this).parent().parent().find('input[type=hidden]').val()}
			});
			
			$(this).parent().parent().remove();
		});
		
		$(document).on('click', '.item_edit', function(){
			if($(this).hasClass('disabled')){
				return;
			}
			var parent = $(this).parent().parent();
			var id = parent.find('input[type=hidden]').val();
			
			parent.hide();
			$('#add_new').hide();
			$('.item_remove').addClass('disabled');
			$('.item_edit').addClass('disabled');
			$.get('/ajax/get_employee_qualification/' + id, function(data) {
				create_editor(registering, parent.parent(), 'qualification', data);
			});
			
		});
	};
	
	$('#qualifications_edit').on('done', function(){
		qualifications_edit_done();
	});

	qualifications_edit_done = function() {
		$('#add_new').remove();
		$('#editor').remove();
		$('.item_edit').remove();
		$('.item_remove').remove();
		$(document).off('click', '.item_remove');
		$(document).off('click', '.item_edit');
	};

	$("#availability_edit").on('editable', function(){
		availability_edit();
	});
	availability_edit = function(show_tours){
		show_tours = typeof show_tours !== 'undefined' ? show_tours : true;
		$("#avail_table tr:not(:first-child) td:not(:first-child)").css('cursor', 'pointer');

		if(show_tours && $.inArray('availability_tour', tours) == -1){
			hopscotch.endTour(true);
			hopscotch.startTour(availability_tour);
		}
		
		$("#avail_table td").click(function() {
			if($(this).attr('id')){
				if($(this).hasClass('available')){
					$(this).removeClass('available');
					$(this).addClass('unavailable');
					$(this).attr('title', 'unavailable');
				} else {
					$(this).removeClass('unavailable');
					$(this).addClass('available');
					$(this).attr('title', 'available');
				}
				$.ajax({
					type: 'POST',
					url: '/employee/set_employee_availability',
					data: {'time_period': $(this).attr('id'),
						'available': $(this).hasClass('available')}
				});
			}
		});
	};
	
	$("#availability_edit").on('done', function(){
		availability_edit_done();
	});
	availability_edit_done = function(){
		$("#avail_table td").off();
		$("#avail_table td").css('cursor', 'default');
	};

	show_dp_edit = function() {
		$('#dp-edit').show();
	}
	hide_dp_edit = function() {
		$('#dp-edit').hide();
	}
	if ($('#dp-edit').css('display') == 'none') {
		$('#dp').hover(show_dp_edit, hide_dp_edit);
		$('#dp-edit').hover(show_dp_edit);
	} else {
		show_dp_edit();
	}

});
