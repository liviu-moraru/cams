        show_date_picker: function() {
            var self = this,
                format,
                include_time;				// SZ 20200325 ADD LINE AND MOVE SEMICOLON
            if (this.field.data_type === consts.DATE) {
                format = locale.D_FMT;
                include_time = false;		// SZ 20200325 ADD LINE AND MOVE SEMICOLON
            } else if (this.field.data_type === consts.DATETIME) {
                format = locale.D_T_FMT;
                include_time = true;		// SZ 20200325 ADD LINE
            }
			// SZ 20200325 START NEW BLOCK **********************
            if (include_time) {
                this.$input.datetimepicker({
                    format: "dd/mm/yyyy hh:ii",
                    autoclose: true,
                    todayBtn: true,
                    datetime: this.field.value
                })
                .on('changeDate', function(e) {
                    self.field.value = e.date;
                    self.$input.datetimepicker('hide');
                });
                this.$input.datetimepicker('show');
                this.datepicker_shown = true;
            }
            else { 
			// ********************** SZ 20200325 END NEW BLOCK
            this.$input.datepicker(
                {
                    weekStart: parseInt(language.week_start, 10),
                    format: format,
                    daysMin: language.days_min.slice(1, -1).split(','),
                    months: language.months.slice(1, -1).split(','),
                    monthsShort: language.months_short.slice(1, -1).split(','),
                    date: this.field.value
                })
                .on('show', function(e) {
                    if (e.target === self.$input.get(0)) {
                        e.stopPropagation();
                        self.$input.datepicker().attr('data-weekStart', 1);
                    }
                })
                .on('hide hidden shown', function(e) {
                    if (e.target === self.$input.get(0)) {
                        e.stopPropagation()
                    }
                })
                .on('changeDate', function(e) {
                    self.field.value = e.date;
                    self.$input.datepicker('hide');
                });
            this.$input.datepicker('show');
            this.datepicker_shown = true;
            } // SZ 20200325 ADD CLOSING PARENTHESIS
        },

