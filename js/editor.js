create_editor = function(registering, location, editor_type, data){
	registering = typeof registering !== 'undefined' ? registering : false;
	$editor = $('<div id="editor"></div>');
	$editor.prependTo(location);
	$editor.load('/ajax/get_editor_form/' + editor_type + '?adding=' + (data == null), function (){

		if(data != null) {
			$('#editor_id').val(data['id']);
			$('#editor_title').val(unescapeHtml(data['title']));
			$('#editor_company').val(unescapeHtml(data['company']));
			$('#editor_desc').html(data['description'].replace(/<br\s*[\/]?>/gi, '\n'));
			
			var start_date = data['start_date'].split('-');
			$('#editor_start_year').val(start_date[0]);
			$('#editor_start_month').val(start_date[1].replace(/^0/, ''));

			var end_date = data['end_date'];
			if(end_date != null) {
				end_date = data['end_date'].split('-');
				$('#editor_end_year').val(end_date[0]);
				$('#editor_end_month').val(end_date[1].replace(/^0/, ''));
			} else {
				$('#editor_ongoing').prop('checked', true);
				$('#editor_end_year').prop('disabled', true);
				$('#editor_end_month').prop('disabled', true);
			}
		}

		$('#editor_title').select2({
			minimumInputLength: 0,
			placeholder: editor_type == 'work' ? 'Job Title' : 'Qualification',
			query: build_select2_query_function(editor_type == 'work' ? '/job' : '/qualification', true),
			initSelection: select2_default_init_selection
		});
		$('#editor_company').select2({
			minimumInputLength: 0,
			placeholder: editor_type == 'work' ? 'Company' : 'Institution',
			query: build_select2_query_function('/company', true),
			initSelection: select2_default_init_selection
		});

		$('#editor_title').blur(function(){
			if(!$(this).val()){
				$(this).parent().addClass('has-error');
			} else {
				$(this).parent().removeClass('has-error');
			}
		});
		
		$('#editor_company').blur(function(){
			if(!$(this).val()){
				$(this).parent().addClass('has-error');
			} else {
				$(this).parent().removeClass('has-error');
			}
		});

		$('#editor_start_year').blur(function(){
			if(!$(this).val() || !$(this).val().match(/^(19|20)[0-9]{2}$/)){
				$(this).parent().addClass('has-error');
			} else {
				$(this).parent().removeClass('has-error');
			}
		});

		$('#editor_end_year').blur(function(){
			if(!$(this).val() || !$(this).val().match(/^(19|20)[0-9]{2}$/)){
				$(this).parent().addClass('has-error');
			} else {
				$(this).parent().removeClass('has-error');
			}

			if($('#editor_ongoing').is(':checked')){
				$(this).parent().removeClass('has-error');
			}
		});

		$('#editor_ongoing').on('click', function() {
			if(this.checked) {
				$('#editor_end_year').prop('disabled', true);
				$('#editor_end_month').prop('disabled', true);
				$('#editor_end_year').blur();
			} else {
				$('#editor_end_year').prop('disabled', false);
				$('#editor_end_month').prop('disabled', false);
			}
		});

		$('#editor_save').on('click', function(){
			if(!$('#editor_title').val() || !$('#editor_company').val() ||
				!$('#editor_start_year').val()) {
				$('#editor_title').blur();
				$('#editor_company').blur();
				$('#editor_start_year').blur();
				$('#editor_end_year').blur();
				return;
			}

			var date_error = 0;
			if (!$('#editor_start_year').val().match(/^(19|20)[0-9]{2}$/)) {
			   $('#editor_start_year').blur();
			   date_error = 1;
			}

			if(!$('#editor_ongoing').is(':checked')){
				if (!$('#editor_end_year').val().match(/^(19|20)[0-9]{2}$/)) {
				   $('#editor_end_year').blur();
				   date_error = 1;
				}
			}

			if(date_error){
				return;
			}

			$.ajax({
				type: 'POST',
				url: '/employee/save_editor',
				data: {'data' : { 'id' : $('#editor_id').val(),
									'type' : editor_type,
									'title' : $('#editor_title').val(),
									'company' : $('#editor_company').val(),
									'start_month' : $('#editor_start_month').val(),
									'end_month' : $('#editor_end_month').val(),
									'ongoing' : $('#editor_ongoing').is(':checked'),
									'description' : $('#editor_desc').val(),
									'start_year' : $('#editor_start_year').val(),
									'end_year' : $('#editor_end_year').val()
					},
					'registering': registering
				},
				success: function (data) {
					$data = $(data);
					$data.find(".date").each(function(){
						$(this).text(format_date($(this).text()));
					});
					if (registering) {
						var edit_remove_buttons = '<div class="col-sm-3" style="text-align:right;padding-top:8px;"><button class="btn btn-small btn-link item_edit" style="font-size: 14px;">Edit</button><button class="btn btn-small btn-link item_remove" style="font-size: 14px;">Delete</button></div>';
						$data.append($(edit_remove_buttons));
					} else {
						$('<i class="icon-edit item_edit" title="Edit"></i> \
							<i class="icon-minus-sign item_remove" title="Remove"></i>').insertAfter($data.find('b:nth-child(2)'));
					}
					$data.prependTo(location);
					$('.container:hidden').remove();
				}
			});

			$('#add_new').show();
			$('#editor').remove();
			$('.item_remove').removeClass('disabled');
			$('.item_edit').removeClass('disabled');
		});

		$('#editor_cancel').on('click', function(){
			$('#add_new').show();
			$('#editor').remove();
			$('.item_remove').removeClass('disabled');
			$('.item_edit').removeClass('disabled');
			$('.container').show();
		});
	});
}
