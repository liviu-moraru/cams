(function($, task) {
"use strict";

function Events1() { // CleanRoom 

	function on_page_loaded(task) {
		
		$("title").text(task.item_caption);
		$("#title").text(task.item_caption);
		  
		if (task.safe_mode) {
			$("#user-info").text(task.user_info.role_name + ' ' + task.user_info.user_name);
			$('#log-out')
			.show() 
			.click(function(e) {
				e.preventDefault();
				task.logout();
			}); 
		}
	
		if (task.full_width) {
			$('#container').removeClass('container').addClass('container-fluid');
		}
		$('#container').show();
		
		if (task.server('get_user_role') == 'Administrator') {
			task.authentication.visible = true;
			task.users.visible	 = true;
			task.roles.visible	 = false;
			task.step_type.visible = true;
			task.costs.visible	 = true;
		}
		else {
			task.authentication.visible = false;
			task.users.visible	 = false;
			task.roles.visible	 = false;
			task.step_type.visible = false;
			task.costs.visible	 = false;
		}
	
		task.create_menu($("#menu"), $("#content"), {
			// splash_screen: '<h1 class="text-center">Application</h1>',
			view_first: true
		});
	
		if (task.change_password.can_view()) {
			$("#menu-right #pass a").click(function(e) {
				e.preventDefault();
				task.change_password.open({open_empty: true});
				task.change_password.append_record();
			});
		}
		else {
			$("#menu-right #pass a").hide();
		}
		
		// $(document).ajaxStart(function() { $("html").addClass("wait"); });
		// $(document).ajaxStop(function() { $("html").removeClass("wait"); });
	} 
	
	function on_view_form_created(item) {
		var table_options_height = item.table_options.height,
			table_container;
	
		item.clear_filters();
		
		item.view_options.table_container_class = 'view-table';
		item.view_options.detail_container_class = 'view-detail';
		item.view_options.open_item = true;
		
		if (item.view_form.hasClass('modal')) {
			item.view_options.width = 1060;
			item.table_options.height = $(window).height() - 300;
		}
		else {
			if (!item.table_options.height) {
				item.table_options.height = $(window).height() - $('body').height() - 20;
			}
		}
		
		if (item.can_create()) {
			item.view_form.find("#new-btn").on('click.task', function(e) {
				e.preventDefault();
				if (item.master) {
					item.append_record();
				}
				else {
					item.insert_record();
				}
			});
		}
		else {
			item.view_form.find("#new-btn").prop("disabled", true);
		}
	
		item.view_form.find("#edit-btn").on('click.task', function(e) {
			e.preventDefault();
			item.edit_record();
		});
	
		if (item.can_delete()) {
			item.view_form.find("#delete-btn").on('click.task', function(e) {
				e.preventDefault();
				item.delete_record();
			});
		}
		else {
			item.view_form.find("#delete-btn").prop("disabled", true);
		}
		
		create_print_btns(item);
	
		task.view_form_created(item);
		
		if (!item.master && item.owner.on_view_form_created) {
			item.owner.on_view_form_created(item);
		}
	
		if (item.on_view_form_created) {
			item.on_view_form_created(item);
		}
		
		item.create_view_tables();
		
		if (!item.master && item.view_options.open_item) {
			item.open(true);
		}
	
		if (!table_options_height) {
			item.table_options.height = undefined;
		}
		return true;
	}
	
	function on_view_form_shown(item) {
		item.view_form.find('.dbtable.' + item.item_name + ' .inner-table').focus();
	}
	
	function on_view_form_closed(item) {
		if (!item.master && item.view_options.open_item) {	
			item.close();
		}
	}
	
	function on_edit_form_created(item) {
		item.edit_options.inputs_container_class = 'edit-body';
		item.edit_options.detail_container_class = 'edit-detail';
		
		item.edit_form.find("#cancel-btn").on('click.task', function(e) { item.cancel_edit(e) });
		item.edit_form.find("#ok-btn").on('click.task', function() { item.apply_record() });
		if (!item.is_new() && !item.can_modify) {
			item.edit_form.find("#ok-btn").prop("disabled", true);
		}
		
		task.edit_form_created(item);
		
		if (!item.master && item.owner.on_edit_form_created) {
			item.owner.on_edit_form_created(item);
		}
	
		if (item.on_edit_form_created) {
			item.on_edit_form_created(item);
		}
			
		item.create_inputs(item.edit_form.find('.' + item.edit_options.inputs_container_class));
		item.create_detail_views(item.edit_form.find('.' + item.edit_options.detail_container_class));
	
		return true;
	}
	
	function on_edit_form_close_query(item) {
		var result = true;
		if (item.is_changing()) {
			if (item.is_modified()) {
				item.yes_no_cancel(task.language.save_changes,
					function() {
						item.apply_record();
					},
					function() {
						item.cancel_edit();
					}
				);
				result = false;
			}
			else {
				item.cancel_edit();
			}
		}
		return result;
	}
	
	function on_filter_form_created(item) {
		item.filter_options.title = item.item_caption + ' - filters';
		item.create_filter_inputs(item.filter_form.find(".edit-body"));
		item.filter_form.find("#cancel-btn").on('click.task', function() {
			item.close_filter_form(); 
		});
		item.filter_form.find("#ok-btn").on('click.task', function() { 
			item.set_order_by(item.view_options.default_order);
			item.apply_filters(item._search_params); 
		});
	}
	
	function on_param_form_created(item) {
		item.create_param_inputs(item.param_form.find(".edit-body"));
		item.param_form.find("#cancel-btn").on('click.task', function() { 
			item.close_param_form();
		});
		item.param_form.find("#ok-btn").on('click.task', function() { 
			item.process_report();
		});
	}
	
	function on_before_print_report(report) {
		var select;
		report.extension = 'pdf';
		if (report.param_form) {
			select = report.param_form.find('select');
			if (select && select.val()) {
				report.extension = select.val();
			}
		}
	}
	
	function on_view_form_keyup(item, event) {
		if (event.keyCode === 45 && event.ctrlKey === true){
			if (item.master) {
				item.append_record();
			}
			else {
				item.insert_record();				
			}
		}
		else if (event.keyCode === 46 && event.ctrlKey === true){
			item.delete_record(); 
		}
	}
	
	function on_edit_form_keyup(item, event) {
		if (event.keyCode === 13 && event.ctrlKey === true){
			item.edit_form.find("#ok-btn").focus(); 
			item.apply_record();
		}
	}
	
	function create_print_btns(item) {
		var i,
			$ul,
			$li,
			reports = [];
		if (item.reports) {
			for (i = 0; i < item.reports.length; i++) {
				if (item.reports[i].can_view()) {
					reports.push(item.reports[i]);
				}
			}
			if (reports.length) {
				$ul = item.view_form.find("#report-btn ul");
				for (i = 0; i < reports.length; i++) {
					$li = $('<li><a href="#">' + reports[i].item_caption + '</a></li>');
					$li.find('a').data('report', reports[i]);
					$li.on('click', 'a', function(e) {
						e.preventDefault();
						$(this).data('report').print(false);
					});
					$ul.append($li);
				}
			}
			else {
				item.view_form.find("#report-btn").hide();
			}
		}
		else {
			item.view_form.find("#report-btn").hide();
		}
	}
	this.on_page_loaded = on_page_loaded;
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_view_form_closed = on_view_form_closed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_filter_form_created = on_filter_form_created;
	this.on_param_form_created = on_param_form_created;
	this.on_before_print_report = on_before_print_report;
	this.on_view_form_keyup = on_view_form_keyup;
	this.on_edit_form_keyup = on_edit_form_keyup;
	this.create_print_btns = create_print_btns;
}

task.events.events1 = new Events1();

function Events6() { // CleanRoom.journals.run 

	function on_edit_form_created(item) {
		//item.edit_form.find('.form-footer').hide();
	}
	
	
	function on_view_form_created(item) {
		if (!item.lookup_field) {
			var clone_btn = item.add_view_button('Clone run', {image: 'icon-repeat'});
			clone_btn.click(function() { clone_run(item) });
			
			var running_btn = item.add_view_button('Show only running', {image: 'icon-eye-close'});
			running_btn.click(function() { filter_running(item) });
			
			var all_btn = item.add_view_button('Show all', {image: 'icon-eye-open'});
			all_btn.click(function() { filter_all(item) });
		}
		else {
		   //item.edit_form.find('.form-footer').hide(); 
		   item.view_form.find("#edit-btn").hide();
		   item.view_form.find("#new-btn").hide();
		}
		//$("#delete-btn").removeClass("btn").addClass("btn-red");
		item.filters.archived.value=0;
	}
	
	
	function clone_run(item) {
		let id = item.id.value,
			run_name = item.run_name.value,
			author = item.author.value;
		item.append();	
		item.run_name.value = run_name;
		item.author.value = author;
		item.post();
		item.apply();
		item.server('clone_run', [id, item.id.value]);
		item.refresh_record();
		item.edit_options.title = 'Run copy';
		item.edit_record();
	}
	
	
	function filter_running(item) {
		item.open({where: {running: true}});
	}
	
	
	function filter_all(item) {
		item.open();
	}
	
	
	function on_before_open(item, params) {
		// moved to on_view_form_created, works better
		//item.filters.archived.value=0;
		//item.filters.archived.value=0;
	}
	
	function on_before_delete(item) {
		/*let steps = item.steps;
		steps.open();
		if (steps.rec_count) {
			item.alert("For safety reasons, deleting full runs is disabled.\nDelete all steps first.");
			throw new Error('For safety reasons, deleting full runs is disabled. Delete all steps first.' );
		}*/
	}
	
	
	function on_field_changed(field, lookup_item) {
		// we need to check if the field "Run name" has changed, and in
		// case propagate the new name to ALL the steps of the run... ugly!
		if (field.field_name=='run_name') {
			let msg = field.owner.message('Changing run-name in all steps.',
				{title: 'Please wait...', margin: 0, text_center: true });
			setTimeout(function() {
				change_run_name_in_steps(field, msg);
			}, 200);
		}
	}
	
	
	function change_run_name_in_steps(field, msg) {
			var old_rec_no=-1;
			field.owner.details.steps.each(function(step) {
				if (step.rec_no==old_rec_no) { return false; }
				//console.log(" > changing step "+step.description.value);
				step.edit();
				step.step_run_name.value = field.value;
				old_rec_no = step.rec_no;
			});
			field.owner.hide_message(msg);
	}
	
	
	function on_edit_form_close_query(item) {
		//if (item.edit_form.container)
		if(item.edit_form.find("#new-btn").length>0) { console.log("button exists, exiting!"); return; }
		console.log(item.steps.step_number.value);
		console.log(item.id.value);
		item.task.week_embedded.copy();
		item.task.week_embedded.open();
		item.task.week_embedded.append();
		item.task.week_embedded.run.value   = item.id.value;
		item.task.week_embedded.run.lookup_value   = item.run_name.value;
		item.task.week_embedded.step_ID.value = item.steps.id.value;
		item.task.week_embedded.step_description.value = item.steps.description.value;
		item.task.week_embedded.create_edit_form();
	}
	
	
	function on_after_open(item) {
		//item.rec_no=null;
	}
	this.on_edit_form_created = on_edit_form_created;
	this.on_view_form_created = on_view_form_created;
	this.clone_run = clone_run;
	this.filter_running = filter_running;
	this.filter_all = filter_all;
	this.on_before_open = on_before_open;
	this.on_before_delete = on_before_delete;
	this.on_field_changed = on_field_changed;
	this.change_run_name_in_steps = change_run_name_in_steps;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_after_open = on_after_open;
}

task.events.events6 = new Events6();

function Events13() { // CleanRoom.details.steps 

	function on_view_form_created(item) {
		item.view_form.find('.form-footer').hide();
		//item.paginate = false;
		//var print_btn = item.add_view_button('Print', {image: 'icon-print'});
		//print_btn.click(function() { print(item) });
	}
	
	
	function on_edit_form_created(item) {
		
		item.edit_form.find('#step-tabs a').click(function (e) {
		  //e.preventDefault();
		  $(this).tab('show');
		});
		
		item.create_inputs(item.edit_form.find("#edit-main-left"), {
			fields: ['main_image']
		});
		item.create_inputs(item.edit_form.find("#edit-main-right"), {
			fields: ['description', 'step_type', 'operator', 'wafers', 'planned_date', 'important', 'done']
		});
		item.create_inputs(item.edit_form.find("#edit-comments"), {
			fields: ['comments', 'comments_after'] 
		});
		item.create_inputs(item.edit_form.find("#edit-timing"), {
			fields: ['operator_start_time', 'operator_end_time', 'equipment_start_time', 'equipment_end_time'] 
		});
		item.create_inputs(item.edit_form.find("#edit-attachments"), {
			fields: ['attachment_1', 'attachment_2'] 
		});
		
		if (!item.is_new()) {
			let st = task.step_type.copy();
			st.set_where({id: item.step_type.value});
			st.open();
			let step = task.item_by_ID(st.step_type.value).copy();
			step.set_where({id: item.step_rec_id.value});
			step.open();
			step.edit();
			step.create_inputs(item.edit_form.find('.edit-step'));
			step.on_field_changed = function(s) {
				let rec_id = item.step_rec_id.value;  
				item.step_rec_id.value = 0;
				item.step_rec_id.value = rec_id;
			};
			item.cur_step = step;
		}
		else {
			item.step_number.value = item.record_count();
		}
	}
	
	
	
	function on_field_changed(field, lookup_item) {
		let item = field.owner;	
		if ((field.field_name === 'step_number')&&(!item.is_new()))
		{
			if (!inverted) {
				inverted = true;
				field.value = -field.value;
				//console.log("Inverted!");
			}
	
		}
		else if (field.field_name === 'step_type') {
			if (field.value) {
				let step = task.item_by_ID(lookup_item.step_type.value).copy();
				step.open({open_empty: true});
				step.append();
				step.create_inputs(item.edit_form.find('.edit-step'));
				item.room.value = lookup_item.room.value;
				item.cur_step = step;
			}
			else {
				item.edit_form.find('.edit-step').empty();
				item.cur_step = undefined;
			}
		}
	}
	
	
	function on_edit_form_shown(item) {
		item.edit_form.find('label.main_image').parent().parent().parent().removeClass('row-fluid well form-horizontal');
		item.edit_form.find('label.main_image').remove();
		item.edit_form.find("#edit-main-left").width('38%');
		item.edit_form.find("#edit-main-right").width('58%');
		item.edit_form.find('input.important').css('color', 'red');
		item.edit_form.find('input.important').css('font-weight', 'bold');
	}
	
	
	function on_before_open(item, params) {
		var now = new Date();
		now.setHours(0,0,0,0);
		item.set_where({'done': false, 'planned_date__ge': now});
		//item.set_where({'done': false});
	}
	
	
	function on_edit_form_closed(item) {
		item.refresh_page();
	}
	this.on_view_form_created = on_view_form_created;
	this.on_edit_form_created = on_edit_form_created;
	this.on_field_changed = on_field_changed;
	this.on_edit_form_shown = on_edit_form_shown;
	this.on_before_open = on_before_open;
	this.on_edit_form_closed = on_edit_form_closed;
}

task.events.events13 = new Events13();

function Events14() { // CleanRoom.journals.run.steps 

	var show_thumbs = false;
	var copy_blocks = 0;		// 0=idle; 1=selecting; 2=...
	var copy_blocks_item;
	
	function on_view_form_created(item) {
		if (!item.lookup_field) {
			var clone_btn = item.add_view_button('Split step', {image: 'icon-repeat', btn_id: 'clone-btn'});
			clone_btn.click(function() { split_step(item) });
			var thumb_btn = item.add_view_button('Toggle thumbnail view', {image: 'icon-eye-open', btn_id: 'toggle-btn'});
			thumb_btn.click(function() { toggle_thumbs(item) });
			var copyBlocks_btn = item.add_view_button('Start copying blocks', {image: 'icon-share-alt', btn_id: 'copyBlocks-btn'});
			copyBlocks_btn.click(function() { copy_blocks_pressed(item) });
		}
		else {
		   //item.edit_form.find('.form-footer').hide(); 
		   item.view_form.find("#edit-btn").hide();
		   item.view_form.find("#new-btn").hide();
		}
		var cols = [];
		var rlc=1;
		if (show_thumbs) {
			cols = ['step_number', 'done', 'main_image', 'description', 'step_type', 'planned_date', 'operator', 'wafers'];
			rlc=3;
		}
		else {
			cols = ['step_number', 'done', 'description', 'step_type', 'planned_date', 'operator', 'wafers'];
		}
		item.table_options.fields = cols;
		item.table_options.row_line_count = rlc;
		item.rec_no = 0;
		//console.log(item.table_options.multiselect);
	}
	
	function abort_copy() {
		console.log(copy_blocks_item);
		copy_blocks_item.table_options.multiselect = false;
		copy_blocks_item._selections = undefined;
		copy_blocks_item.owner.create_detail_views(copy_blocks_item.owner.edit_form.find(".edit-detail"));
		copy_blocks_item = undefined;
		copy_blocks=0;
		return;
	}
	
	function copy_blocks_pressed(item) {
		if (copy_blocks===0) {
			copy_blocks_item = item;
			let msg = item.message('Please note that you must know the position (the<br><b>step number</b>) at which you want to paste the steps in the destination run.<br>'+
				'If you don\'t know the step number yet, please press abort, open the destination run and find the position first.',
				{title: 'Warning', margin: 0, text_center: false, buttons: {"OK": undefined, "Abort":abort_copy} });
			console.log("Copy blocks 0->1");
			copy_blocks = 1;
			item.table_options.multiselect = true;
			item.owner.create_detail_views(item.owner.edit_form.find(".edit-detail"));
			item.view_form.find("#copyBlocks-btn").html("<span class='icon-hand-right'></span> Select destination");
		} else if (copy_blocks==1) {
			console.log("Copy blocks 1->0");
			copy_blocks=0;
			copy_blocks_item = undefined;
			var selected = item.selections;
			item.view_form.find("#copyBlocks-btn").html("<span class='icon-share-alt'></span> Done!");
			item.table_options.multiselect = false;
			item._selections = undefined;
			item.owner.create_detail_views(item.owner.edit_form.find(".edit-detail"));
			copy_blocks_item = undefined;
			if (selected.length) {
				var st="";
				selected.forEach(function (t) {
					//console.log(t);
					st+=t+", ";
				});
				var r=item.task.copy_blocks.copy();
				r.open();
				r.append();
				r.selection.value=st;
				r.create_edit_form();
				item.owner.close_edit_form();
			} else { console.log("Nothing to do!"); }
		}
	}
	
	function toggle_thumbs(item) {
		show_thumbs = !show_thumbs;
		item.owner.create_detail_views(item.owner.edit_form.find(".edit-detail"));
	}
	
	function split_step(item) {
		var selected = item.rec_no;
		let id = item.id.value;
		let run_id = item.master_rec_id.value;
		item.server('split_step', [id, run_id]);
		item.owner.steps.set_order_by(['step_number']);
		item.owner.steps.open();
		change_order(item);
		item.owner.post();
		item.owner.apply();
		item.owner.steps.set_order_by(['step_number']);
		item.owner.steps.open();
		item.rec_no = selected+1;
		item.master.edit();
		item.edit();
		item.edit_record();
	}
	
	
	function on_edit_form_created(item) {
		
		//var container = item.edit_form.find('#step-tabs a');
		//task.init_tabs(container);
		
		item.edit_form.find('#step-tabs a').click(function (e) {
		  //e.preventDefault();
		  $(this).tab('show');
		});
	
		item.create_inputs(item.edit_form.find("#edit-main-left"), {
			fields: ['main_image']
		});
		item.create_inputs(item.edit_form.find("#edit-main-right"), {
			fields: ['step_number', 'description', 'step_type', 'operator', 'wafers', 'planned_date', 'important', 'done']
		});
		item.create_inputs(item.edit_form.find("#edit-comments"), {
			fields: ['comments', 'comments_after'] 
		});
		item.create_inputs(item.edit_form.find("#edit-room"), {
			fields: ['room', 'room_comments']
		});
		item.create_inputs(item.edit_form.find("#edit-timing"), {
			fields: ['operator_start_time', 'operator_end_time', 'equipment_start_time', 'equipment_end_time',
					'operator_full_log', 'equipment_full_log']
			/*fields: ['operator_start_time', 'operator_end_time', 'equipment_start_time', 'equipment_end_time']*/
		});
		item.create_inputs(item.edit_form.find("#edit-attachments"), {
			fields: ['attachment_1', 'attachment_2'] 
		});
		if (!item.is_new()) {
			{
				let st = task.step_type.copy();
				st.set_where({id: item.step_type.value});
				st.open();
				let step = task.item_by_ID(st.step_type.value).copy();
				//console.log(item.step_rec_id.value);
				step.set_where({id: item.step_rec_id.value});
				step.open();
				//console.log(step);
				step.edit();
				step.create_inputs(item.edit_form.find('.edit-step'));
				step.on_field_changed = function(s) {
					let rec_id = item.step_rec_id.value;  
					item.step_rec_id.value = 0;
					item.step_rec_id.value = rec_id;
				};
			item.cur_step = step;
			}
		}
		else {
			console.log("Item is new");
			item.step_number.value = item.record_count();
			// keep a copy run name
			item.step_run_name.value = item.owner.run_name.value;
			console.log("Copied "+item.step_run_name.value);
		}
		
		var r = item.master.author.value;
		var u = task.users.copy();
		u.open({where:{id:r}})
		if (task.server('get_user_name') == u.name.value) {
			item.equipment_full_log.read_only = false;
			item.operator_full_log.read_only = false;
		}
	}
	
	
	var inverted = false;
	var order_changing = false;
	var wafers_list_to_expand = false;
	
	function change_order(item) {
		order_changing = true;
		try {
			//console.log("I'll re-order now, "+item.rec_count+" records.");
			var selected = item.rec_no;
			item.sort(['step_number']);
			var i=0;
			var inserted_number=0;
			var has_negative=false;
			item.each(function (x) {
				x.edit();
				if (i===0) {
					if (x.step_number.value<0) {
						x.step_number.value = -x.step_number.value;
						inserted_number = x.step_number.value;
						has_negative=true;
					}
					else {
						has_negative=false;
					}
				} else if ((i<inserted_number)&&(has_negative)) { x.step_number.value = i; } 
				else if (has_negative) { x.step_number.value = i+1;
				} else {
					x.step_number.value = i+1;
				}
				//console.log(x.step_number.value);
				i=i+1;
			});
			inverted = false;
			item.rec_no = selected;
		}
		finally {
			order_changing = false;
		}
	}
	
	function on_field_changed(field, lookup_item) {
		let item = field.owner;
		
		// let's expand the wafers field, calling a server side function
		if (field.field_name=='wafers') {
			wafers_list_to_expand = true;
		}
		
		if ((field.field_name === 'step_number')&&(!item.is_new()))
		{
			if ((!inverted)&(!order_changing)) {
				inverted = true;
				field.value = -field.value;
				//console.log("Inverted!");
			}
		}
		else if (field.field_name === 'step_type') {
			if (field.value) {
				let step = task.item_by_ID(lookup_item.step_type.value).copy();
				step.open({open_empty: true});
				step.append();
				step.create_inputs(item.edit_form.find('.edit-step'));
				item.room.value = lookup_item.room.value;
				item.cur_step = step;
			}
			else {
				item.edit_form.find('.edit-step').empty();
				item.cur_step = undefined;
			}
		}
		else if (field.field_name === 'operator_start_time') {
			if (field.owner.operator_start_time.value) {
				let dstring = item.server('get_datestring_d', [field.owner.operator_start_time.value]);
				field.owner.operator_full_log.value = field.owner.operator_full_log.value+'S'+
					dstring+'|';
			}
		}
		else if (field.field_name === 'operator_end_time') {
			if (field.owner.operator_end_time.value) {
				let dstring = item.server('get_datestring_d', [field.owner.operator_end_time.value]);
				field.owner.operator_full_log.value = field.owner.operator_full_log.value+'E'+
					dstring+'|';
			}
		}
		else if (field.field_name === 'equipment_start_time') {
			if (field.owner.equipment_start_time.value) {
				let dstring = item.server('get_datestring_d', [field.owner.equipment_start_time.value]);
				field.owner.equipment_full_log.value = field.owner.equipment_full_log.value+'S'+
					dstring+'|';
			}
		}
		else if (field.field_name === 'equipment_end_time') {
			if (field.owner.equipment_end_time.value) {
				let dstring = item.server('get_datestring_d', [field.owner.equipment_end_time.value]);
				field.owner.equipment_full_log.value = field.owner.equipment_full_log.value+'E'+
					dstring+'|';
			}
		}
	}
	
	
	function on_before_append(item) {
		item.owner.post();
		item.owner.apply();
		item.owner.edit();
	}
	
	
	
	function on_before_post(item) {
		if (item.cur_step && item.edit_form) {
			if (wafers_list_to_expand) {
				wafers_list_to_expand = false;
				//console.log("Expanding!");
				var result = item.server('expand_wafers_string', [item.wafers.value]);
				if (result!='error') {
					item.wafers.value = result;
				}
			}
			item.cur_step.post();
			item.cur_step.edit();
		}
	}
	
	
	function on_after_post(item) {
		if (!order_changing) {	
			if (item.edit_form) {
				let step = {};
				item.cur_step.each_field(function(f) {
					step[f.field_name] = f.value;
				});
				//change_order(item);		
				item.owner.post();
				item.owner.apply({step: step});
				item.owner.refresh_record();
				item.owner.edit();
			}
			else {
				change_order(item);
				item.owner.post();
				item.owner.apply();
				item.owner.edit();
				item.owner.steps.set_order_by(['step_number']);
				item.owner.steps.open();
			}
		}
	}
	
	function on_after_delete(item) {
		var selected = item.rec_no;
		change_order(item);
		item.owner.apply();
		item.owner.edit();
		item.owner.steps.set_order_by(['step_number']);
		item.owner.steps.open();
		if (item.rec_count>=selected) { item.rec_no = selected; }
		else if (item.rec_count) {item.rec_no = selected-1;}
	}
	
	
	function on_edit_form_shown(item) {
		item.edit_form.find('label.main_image').parent().parent().parent().removeClass('row-fluid well form-horizontal');
		//item.edit_form.find('label.main_image').parent().parent().parent().css('height', '100%');
		item.edit_form.find('label.main_image').remove();
		item.edit_form.find('input.step_number').remove();
		item.edit_form.find('label.step_number').empty();
		item.edit_form.find('label.step_number').append(item.step_run_name.value+" step "+item.step_number.value);
		item.edit_form.find('label.step_number').css('font-weight', 'bold');
		item.edit_form.find("#edit-main-left").width('38%');
		item.edit_form.find("#edit-main-right").width('58%');
		item.edit_form.find('input.important').css('color', 'red');
		item.edit_form.find('input.important').css('font-weight', 'bold');
		$('.main_image.dbinput').bind("contextmenu",function(e){
			ask_image_delete(item);
			return false;
		}); 
		/*
		if ((task.server('get_user_role') == 'Operators')&&(item.done.value==false)) {
			//console.log("It's operator!")
			task.message(
				'Please confirm if you are starting the execution of this step, or if you are just reading it.',
				{title: '<b>Confirm step execution</b>', margin: 0, text_center: true, buttons: {"Yes, starting step execution now!": YCB, "No, just reading the step.": undefined},
					center_buttons: true}
			);
			function YCB() { operator_starts_execution(item);}
		}*/
	}
	
	function operator_starts_execution(item) {
		console.log("-----------------------------------------")
		console.log("Inside callback, item is:")
		console.log(item)
		console.log("-----------------------------------------")
		item.done.value = true;
		item.operator_start_time.value = new Date();
		item.equipment_start_time.value = new Date();
		item.post();
		item.apply();
		item.edit();
		task.message(
				'OK, automatically flagged step as done and inserted operator/equipment start time.<p style="color:red"><b>Please remember to set operator end time when step execution is finished.</b></p>',
				{title: '<b>Please note</b>', margin: 0, text_center: false, buttons: {"OK": undefined},
					center_buttons: true}
			);
	}
	
	
	function ask_image_delete(item) {
		yes_no(item, "Delete image?", yes_pressed, no_pressed); 
	}
	
	function no_pressed(item) {
		return;
	}
	
	function yes_pressed(item) {
		item.main_image.value="";	
	}
	
	function yes_no(item, mess, yesCallback, noCallback) {
		var buttons = {
			Yes: yCB,
			No: nCB,
		};
		item.message(mess, {buttons: buttons, margin: "20px",
			text_center: true, width: 500, center_buttons: true});
		function yCB() { yesCallback(item);}
		function nCB() { noCallback(item); }
	}
	this.on_view_form_created = on_view_form_created;
	this.abort_copy = abort_copy;
	this.copy_blocks_pressed = copy_blocks_pressed;
	this.toggle_thumbs = toggle_thumbs;
	this.split_step = split_step;
	this.on_edit_form_created = on_edit_form_created;
	this.change_order = change_order;
	this.on_field_changed = on_field_changed;
	this.on_before_append = on_before_append;
	this.on_before_post = on_before_post;
	this.on_after_post = on_after_post;
	this.on_after_delete = on_after_delete;
	this.on_edit_form_shown = on_edit_form_shown;
	this.operator_starts_execution = operator_starts_execution;
	this.ask_image_delete = ask_image_delete;
	this.no_pressed = no_pressed;
	this.yes_pressed = yes_pressed;
	this.yes_no = yes_no;
}

task.events.events14 = new Events14();

function Events16() { // CleanRoom.authentication.users 

	function on_field_get_text(field) {
		var item = field.owner;
		if (field.field_name === 'password') {
			if (item.id.value || field.value) {
				return '**********';
			}
		}
	}
	this.on_field_get_text = on_field_get_text;
}

task.events.events16 = new Events16();

function Events18() { // CleanRoom.reports.run_report_sheet 

	function on_before_print_report(report) {
		//report.id.value = report.task.run.id.value;
		//console.log(report.id.value);
		report.extension = 'ods';
	}
	this.on_before_print_report = on_before_print_report;
}

task.events.events18 = new Events18();

function Events23() { // CleanRoom.catalogs.step_type 

	function on_view_form_created(item) {
		if (item.lookup_field) {
			item.view_form.find('.form-footer').hide(); 
			item.view_options.title = 'Please select step type (doubleclick to select / ESC to exit)';
		}
	}
	
	function update_field_order(item) {
	// to update the field order for the step types, call this function from the browser console with:
	// task.catalogs.step_type.update_field_order(task)
		var field_order_string="";
		var step_types=item.task.catalogs.step_type.copy();
		step_types.open();
		step_types.each(function t(cat) {
			console.log(cat);
			//console.log(cat.id.value);
			cat.edit();
			var ID=cat.step_type.value;
			console.log(ID);
			//console.log(task.item_by_ID(ID));
			let step = task.item_by_ID(ID).copy();
			step.open();
			console.log(step);
			field_order_string="";
			step.edit_options.tabs.forEach(function t(tab) {
				tab.bands.forEach(function b(band) {
					band.fields.forEach(function f(field) {
						field_order_string+=field+", ";
					});
				});
			});
			console.log(field_order_string);
			cat.field_order.value = field_order_string;
			cat.post();
			cat.apply();
		});
		return;
	}
	
	
	
	function on_after_apply(item) {
		update_field_order(item);
	}
	this.on_view_form_created = on_view_form_created;
	this.update_field_order = update_field_order;
	this.on_after_apply = on_after_apply;
}

task.events.events23 = new Events23();

function Events53() { // CleanRoom.reports.week2 

	function on_before_print_report(report) {
		report.close_param_form();
	}
	
	function on_param_form_shown(report) {
		let weekn=getWeekNumber(new Date());
		report.week_number.value = weekn[1].trim();
		report.year_number.value = weekn[0].trim();
	}
	
	function getWeekNumber(d) {
		// Copy date so don't modify original
		d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		// Set to nearest Thursday: current date + 4 - current day number
		// Make Sunday's day number 7
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
		// Get first day of year
		var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
		// Calculate full weeks to nearest Thursday
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
		// Return array of year and week number
		return [d.getUTCFullYear().toString(), " "+weekNo.toString()];
	}
	this.on_before_print_report = on_before_print_report;
	this.on_param_form_shown = on_param_form_shown;
	this.getWeekNumber = getWeekNumber;
}

task.events.events53 = new Events53();

function Events55() { // CleanRoom.embedded.week_embedded 

	//var labeltext = "";
	var thisstep;
	var myrun, myitem;
	var day="NONE";
	var weekn="";
	var auto=false;
	var inserting=false;
	
	
	function on_view_form_shown(item) {
		// remove modal header
		$('.modal-header').remove();
	
		$("#changeweekbtn").bind("click", function(event) {
			weekn=$('#weekinput').val().split(',');
			load_snipplet(item);
		});
	
		$("#insertbtn").bind("click", function(event) {
			mytest(item);
		});
	
		// if no weeknumber specified, compile it with today's week
		if (!weekn) {
		  weekn=getWeekNumber(new Date());
		  $('#weekinput').val(weekn);
		}
		load_snipplet(item);
	}
	
	
	function on_edit_form_created(item) {
		// here we check in what state we are, and prepare the edit form with the
		// relevant field inputs only. 
		// if we are inserting, we ask for a run name to select the step from
		// if we are not inserting, we ask for a new date of a step which is already present
		if (inserting) {
			item.create_inputs(item.edit_form.find(".form-body"), {fields:['run', 'step_description']});
		} else {
			item.create_inputs(item.edit_form.find(".form-body"), {fields:['new_date']});
		}
	}
	
	
	function editStep(item, id) {
		// if the ID of the clicked item is an integer, it means that it is the ID
		// of a step, whose date neets to be changed!
		if (isNormalInteger(id)) {
			let stepid = parseInt(id);
			inserting=false;
			thisstep = item.task.details.steps.copy();
			thisstep.open({where: {id: stepid}});
			thisstep.edit();
			//labeltext = "Change date of step '"+thisstep.description.display_text+"'";
			item.append();
			item.new_date.value = thisstep.planned_date.value;
			item.create_edit_form();
		}
		// else, it's probably the format "DDDMMYYYY", which means the user has clicked
		// a day in the first column => he wants to place a step
		else {
			insertStep(item, id);
		}
	}
	
	
	function insertStep(item, id) {
		inserting = true;
		day=id;
		item.append();
		myrun=item.task.run.copy();
		//myrun=item.task.run.copy({handlers: false});
		myitem=item;
		// first we create an edit form, and having set the flag "inserting" to true
		// it means that we are inserting a step. the on_edit_form_created event will
		// look at the inserting flag and know that it needs to ask for a run, and
		// not for a date
		item.create_edit_form();
		//item.task.run.create_edit_form();
	}
	
	
	function on_field_changed(field, lookup_item) {
	   // we check if a field was changed, and if it was the "run" field
	   // if auto is true it means that the "run" field was automatically changed
	   // by the run edit form exit function. in this case we just exit
	   if (auto) { return; }
	   // if auto is false, it means that the "run" field was changed by the user,
	   // so we will go into auto mode and call the run edit form on the selected run!
	   if (field.field_name=='run') {
		   console.log("In here now...:");
		   auto = true;
		   console.log(field.value);
		   //myrun.open({where: {id: field.value}});
		   myrun.set_where({id: field.value});
		   myrun.open();
		   console.log(myrun.run_name.value);
		   //console.log(myrun);
		   myrun.steps.open();
		   console.log("Open steps success");
		   console.log(myrun.steps);
		   myrun.edit();
		   console.log("Run edit success");
		   //myrun.create_edit_form(myitem.view_form.find(".form-body"));
		   myrun.create_edit_form();
		   // we remove all the buttons we don't want to have on the run edit form.
		   // BTW, the missing buttons will tell the run edit form on_post event that
		   // we don't need to post anythinh, instead we want to get back here with
		   // the number of the selected step  :-)
		   myrun.edit_form.find("#new-btn").remove();
		   myrun.edit_form.find("#cancel-btn").remove();
		   myrun.edit_form.find("#new-btn").remove();
		   myrun.edit_form.find("#edit-btn").remove();
		   myrun.edit_form.find("#delete-btn").remove();
		   myrun.edit_form.find("#clone-btn").remove();
		   myrun.edit_form.find("#toggle-btn").remove();
		   myrun.edit_form.find("#ok-btn").text('Click to select step');
		   myitem.cancel();
		   myitem.close_edit_form(); 
		}
	}
	
	
	function on_before_post(item) {
		// the user has closed the edit form, which means we must do the work now!
		// if we are in inserting mode, we must insert the new step
		if (inserting) {
			inserting = false;
			auto = false;
			//console.log("ITS HERE!!! Run is "+item.run.value+ " and step is "+item.step_ID.value + " and day is "+day);
			// *********************** CODE HERE **********************
			var step_to_place = item.task.steps.copy();
			step_to_place.open({where: {id: item.step_ID.value}});
			step_to_place.edit();
			step_to_place.planned_date.value = stringToDate(day.substring(1));
			step_to_place.post();
			step_to_place.apply();
			day = "NONE";
			// ******************** END OF CODE HERE ******************
		// if we are not in inserting mode, we just want to change the date of a
		// step which is already in the week
		} else {
			thisstep.planned_date.value = item.new_date.value;
			thisstep.post();
			thisstep.apply();
			thisstep='';
		}
	}
	
	
	function getWeekNumber(d) {
		// Copy date so don't modify original
		d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
		// Set to nearest Thursday: current date + 4 - current day number
		// Make Sunday's day number 7
		d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
		// Get first day of year
		var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
		// Calculate full weeks to nearest Thursday
		var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
		// Return array of year and week number
		return [d.getUTCFullYear().toString(), " "+weekNo.toString()];
	}
	
	
	
	function on_after_apply(item) {
		//item.view($(".form-frame week_embedded view-form jam-form"));
		load_snipplet(item);
	}
	
	
	function on_view_form_created(item) {
		weekn="";
	}
	
	
	function isNormalInteger(str) {
		return /^\+?\d+$/.test(str);
	}
	
	
	function load_snipplet(item) {
		// generate week snipplet
		let url=item.server('generate_embedded_week', [weekn]);
		
		// load the week snipplet into the div and bind events
		$( "#placehold" ).load( url,  
		'f' + (Math.random()*1000000), function() {
			bindStuff(item) });
	}
	
	
	function bindStuff(item) {
		$("#placehold").find(".clickable").bind("click", function(event) { 
			editStep(item, event.target.id);
		});
	}
	
	
	function stringToDate(str1){
		// str1 format should be ddmmyyyy.
		var dt1   = parseInt(str1.substring(0,2));
		var mon1  = parseInt(str1.substring(2,4));
		var yr1   = parseInt(str1.substring(4,8));
		var date1 = new Date(yr1, mon1-1, dt1);
		return date1;
	}
	this.on_view_form_shown = on_view_form_shown;
	this.on_edit_form_created = on_edit_form_created;
	this.editStep = editStep;
	this.insertStep = insertStep;
	this.on_field_changed = on_field_changed;
	this.on_before_post = on_before_post;
	this.getWeekNumber = getWeekNumber;
	this.on_after_apply = on_after_apply;
	this.on_view_form_created = on_view_form_created;
	this.isNormalInteger = isNormalInteger;
	this.load_snipplet = load_snipplet;
	this.bindStuff = bindStuff;
	this.stringToDate = stringToDate;
}

task.events.events55 = new Events55();

function Events56() { // CleanRoom.authentication.change_password 

	function on_edit_form_created(item) {
		item.edit_form.find("#ok-btn")
			.off('click.task')
			.on('click', function() {
				change_password(item);
			});
		item.edit_form.find("#cancel-btn")
			.off('click.task')
			.on('click', function() {
				item.close_edit_form();
			});
	}
	
	function change_password(item) {
		item.post();
		item.server('change_password', [item.old_password.value, item.new_password.value], function(res) {
			if (res) {
				item.warning('Password has been changed. <br> The application will be reloaded.',
				  function() {
					  task.logout();
					  location.reload();
				  });
			}
			else {
				item.alert_error("Can't change the password.");
				item.edit();
			}
		});
	}
	
	function on_field_changed(field, lookup_item) {
		var item = field.owner;
		if (field.field_name === 'old_password') {
			item.server('check_old_password', [field.value], function(error) {
				if (error) {
					item.alert_error(error);
				}
			});
		}
	}
	
	function on_edit_form_close_query(item) {
		return true;
	}
	this.on_edit_form_created = on_edit_form_created;
	this.change_password = change_password;
	this.on_field_changed = on_field_changed;
	this.on_edit_form_close_query = on_edit_form_close_query;
}

task.events.events56 = new Events56();

function Events63() { // CleanRoom.utilities.copy_blocks 

	function on_view_form_shown(item) {
		var r=item.task.copy_blocks.copy()
		r.open();
		r.append();
		r.create_edit_form();
	}
	
	function on_before_post(item) {
		console.log("Selected to copy IDs "+ item.selection.value +" to run "+item.run.value+" at position "+item.position.value);
		//item.server('split_step', [id, run_id]);
		var result=item.server('copy_blocks', [item.selection.value, item.run.value, item.position.value]);
		if (result===0) {
			let msg = item.message('Copy: success.<br>This copy feature is experimental, please check carefully in the destination run that everything is OK, including step numbers.', {title: '', margin: 0, text_center: false, 
				buttons: {"OK": undefined} });
		} else {
			let msg = item.message('Copy failed, wrong target step number.', {title: 'Error', margin: 0, text_center: false, 
				buttons: {"OK": undefined} });
		}
	}
	this.on_view_form_shown = on_view_form_shown;
	this.on_before_post = on_before_post;
}

task.events.events63 = new Events63();

})(jQuery, task)