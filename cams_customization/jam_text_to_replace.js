        show_date_picker: function() {
            var self = this,
                format;
            if (this.field.data_type === consts.DATE) {
                format = locale.D_FMT;
            } else if (this.field.data_type === consts.DATETIME) {
                format = locale.D_T_FMT;
            }

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
        },
