$.fn.daterange = (function(options) {
	const DATE_FORMAT = 'YYYY-MM-DD';
	const MONTH_FORMAT = 'YYYY-MM';
	const TITLE_FORMAT = 'MMM.YYYY';

	const WEEKDAYS = ['sun','mon','tue','wed','thu','fri','sat'];
	const PRESET_RANGES = {
		'this_week': (till)=>moment(till).weekday(this._options.weekStart).format(DATE_FORMAT),
		'this_month': (till)=>moment(till).date(1).format(DATE_FORMAT),
		'this_year': (till)=>moment(till).dayOfYear(1).format(DATE_FORMAT),
		'7_days': (till)=>moment(till).add(-7, 'day').format(DATE_FORMAT),
		'4_weeks': (till)=>moment(till).add(-4, 'week').format(DATE_FORMAT),
		'30_days': (till)=>moment(till).add(-30, 'day').format(DATE_FORMAT),
		'3_months': (till)=>moment(till).add(-3, 'month').format(DATE_FORMAT),
		'12_weeks': (till)=>moment(till).add(-12, 'week').format(DATE_FORMAT),
		'90_days': (till)=>moment(till).add(-90, 'day').format(DATE_FORMAT),
		'a_year': (till)=>moment(till).add(-1, 'year').format(DATE_FORMAT),
	};
	const _TODAY = moment().format(DATE_FORMAT);

	const EVENTS = {
		ON_REDRAW: 'bs.daterange.redraw.on',
		ON_SELECT: 'bs.daterange.selected.on',
	}

	const DEFAULT_OPTIONS = {
		calendar: '2019-02',
		ranged: {
			from: null,
			till: _TODAY,
		},
		selected: _TODAY,
		focused: 'from',
		moveMonth: true,
		moveYear: true,
		titleFormat: TITLE_FORMAT,
		weekStart: 0,
		presets: [
			/* { 
				- title: label name,
				- desc: short description,
				- range: function(till :string) => return from :string
			}*/
			{ title: '이번달', desc: '월초 ~ 현재', range: PRESET_RANGES['this_month'] },
			{ title: '일 개월', desc: '30일', range: PRESET_RANGES['30_days'] },
			{ title: '분기', desc: '3개월 (1/4년)', range: PRESET_RANGES['3_months'] },
			{ title: '올해', desc: '연초 ~ 현재', range: PRESET_RANGES['this_year'] },
			{ title: '일 년', desc: '1년', range: PRESET_RANGES['a_year'] },
		],
	}; 
	
	this.__preset_ranges = PRESET_RANGES;

	this._options = Object.assign(DEFAULT_OPTIONS, this[0].dataset, options);

	this._onClickControlHandlers = [
		{cls: 'bs-daterange-control', fn: function(ctrl) {
			let unit = ctrl.classList.contains('bs-daterange-year') ? 'year' : 'month';
    		let direction = ctrl.classList.contains('bs-daterange-prev') ? -1 : 1;

    		this._options.calendar = moment(this._options.calendar)
    			.add(unit, direction)
    			.format(MONTH_FORMAT);
		}},
		{cls: 'bs-daterange-cellbody', fn: function(ctrl) {
			if(this._options.focused) {
    			this._options.ranged[this._options.focused] = ctrl.dataset.date;
    			this._options.focused = null;
    		}
    		this._options.selected = ctrl.dataset.date;
		}},
		{cls: 'bs-daterange-period', skipRedraw: true, fn: function(ctrl) {
			this._options.selected = null;
    		this._options.focused = ctrl.name;
    		if(ctrl.value) {
    			this._options.calendar = moment(ctrl.value).format(MONTH_FORMAT);
    			this._drawControls();
    		}
		}},
		{attr: 'preset-idx', fn: function(ctrl) {
			if(!this._options.ranged.till)
    			this._options.ranged.till = moment().format(DATE_FORMAT);
    		let pidx = parseInt(ctrl.getAttribute('preset-idx'));
    		this._options.ranged.from = this._options.presets[pidx].range(this._options.ranged.till);
    		this._options.selected = this._options.ranged.from;
    		this._options.focused = null;
    		this._options.presets[pidx].selected = true;
		}},
		{cls: 'dropdown-toggle', skipRedraw: true, fn: function(ctrl) {
			let menu = $(ctrl.parentElement).find('.dropdown-menu').toggleClass('show');
		}},
		{cls: 'bs-daterange-selector-submit', fn: function(ctrl) {
			let period = {};
			this._selector.find('input.bs-daterange-period').each(function(idx, input) {
				period[input.getAttribute('name')] = input.value;
			});
			
			this.value = period;
			this.data(period);
			this.attr(period);

			if(this.hasClass('dropdown-menu') && this.hasClass('show')) {
				this.removeClass('show');
			}

			if(this._options.onSelected) {
				this._options.onSelected(this);
			}
			this.trigger(EVENTS.ON_SELECT, [period, this]);
		}}
	];
	

	let _onClickControl = function(ev) {
		let ctrl = ev.target.tagName != 'I' ? ev.target : ev.target.parentElement;
		let doRedraw = false;
		// on click title control
		this._onClickControlHandlers.forEach((function(handle) {
			if((handle.cls && ctrl.classList.contains(handle.cls))
			|| (handle.attr && ctrl.hasAttribute(handle.attr))) {
				let handlerFn = handle.fn.bind(this);
				handlerFn(ctrl);
				if(!handle.skipRedraw)
					doRedraw = true;
			} 
		}).bind(this));
    	
    	if(doRedraw)
    		this._drawControls();
    	ev.preventDefault();
    	ev.stopPropagation();
	}

	this._drawControlsCalendar = function() {
		this._calendar = this.find('.bs-daterange-calendar');
		this._calendar.append(`<div class="input-group">
			<div class="input-group-prepend">
				<button class="btn bs-daterange-control bs-daterange-prev bs-daterange-year"><i class="fas fa-angle-double-left"></i></button>
				<button class="btn bs-daterange-control bs-daterange-prev bs-daterange-month"><i class="fas fa-angle-left"></i></button>
			</div>
			<input class="form-control bs-daterange-calendar-month" type="text" value="${moment(this._options.calendar).format(this._options.titleFormat)}" disabled>
			<div class="input-group-append">
				<button class="btn bs-daterange-control bs-daterange-next bs-daterange-month"><i class="fas fa-angle-right"></i></button>
				<button class="btn bs-daterange-control bs-daterange-next bs-daterange-year"><i class="fas fa-angle-double-right"></i></button>
			</div>
		</div>
		<table class="bs-daterange-calendar-table"></table>`);

		let tbl = $(this._calendar).find('table.bs-daterange-calendar-table');
		tbl.append(`<thead><tr></tr></thead><tbody></tbody>`);
		let thead = tbl.find('thead>tr');
		WEEKDAYS.forEach((function(wd, widx, wdays){
			let wi = (widx+this._options.weekStart) % 7;
			wd = wdays[wi];
			thead.append(`<th class="bs-daterange-celltitle weekday-${wd}">${wd}</th>`);
		}).bind(this));
		let tblBody = $(tbl).find('tbody');
		let _dbase = moment(this._options.calendar);
	    let dcursor = Object.assign(_dbase, {});
	    dcursor.date(1);
	    dcursor.add('day', this._options.weekStart-dcursor.weekday());
	    dcursor.hour(0);dcursor.minute(0);dcursor.second(0);dcursor.millisecond(2);
		let the_month = dcursor.format(MONTH_FORMAT);

		let range_from = this._options.ranged && this._options.ranged.from ? moment(this._options.ranged.from) : null;
		let range_till = this._options.ranged && this._options.ranged.till ? moment(this._options.ranged.till) : null;
		let inRange = null;
		if(range_from && range_till) {
			range_from.hour(0);range_from.minute(0);range_from.second(0);range_from.millisecond(0);
			range_till.hour(23);range_till.minute(59);range_till.second(59);range_till.millisecond(999);
		}

	    do {
	    	let row = tblBody.append('<tr></tr>');
	    	WEEKDAYS.forEach((function(wd, widx, wdays) {
	    		let wi = (widx+this._options.weekStart) % 7;
				wd = wdays[wi];

				// month class
				let wc = 'bs-daterange-the-month';
				the_month = dcursor.format(MONTH_FORMAT);
				let the_day = dcursor.format(DATE_FORMAT);
				if(the_month!=this._options.calendar) {
					wc = dcursor.isBefore(_dbase) ? 'bs-daterange-prev-month' : 'bs-daterange-next-month';
				}
				// selected class
				if(this._options.selected == the_day)
					wc += ' selected';
				// focused class
				if(this._options.focused == the_day) 
					wc += ' focused';
				if(range_from && range_from.isBefore(dcursor) && range_till.isAfter(dcursor))
					wc += ' in-range';
				
				row.append(`<td class="bs-daterange-cellbody weekday-${wd} ${wc}" data-date="${dcursor.format(DATE_FORMAT)}">
					${dcursor.date()}
				</td>`);
	    		dcursor.add('day', 1);
	    	}).bind(this));
	    } while(the_month==this._options.calendar);

	    // setup ranged from/till
	    if(range_from && range_till) {
		    this.find(`td[data-date="${range_from.format(DATE_FORMAT)}"]`).addClass('period-from');
		    	// .html(`<span class="period-from">${range_from.date()}</span>`);
		    this.find(`td[data-date="${range_till.format(DATE_FORMAT)}"]`).addClass('period-till');
		    	// .html(`<span class="period-till">${range_till.date()}</span>`);
	    }

	    this.trigger(EVENTS.ON_REDRAW, [this]);
	}

	this._drawControlsSelector = function() {
		this._selector = this.find('.bs-daterange-selector');

		this._selector.html(`<div class="input-group bs-daterange-selector-group b-1">
			<div class="input-group-prepend">
				<span class="input-group-text"><i class="fas fa-calendar-alt"></i></span>
			</div>
			<input class="form-control bs-daterange-period bs-daterange-from" placeholder="${DATE_FORMAT}" name="from" value="${this._options.ranged.from || ''}" readonly>
			<span class="input-group-text">-</span>
	    	<input class="form-control bs-daterange-period bs-daterange-till" placeholder="${DATE_FORMAT}" name="till" value="${this._options.ranged.till || ''}" readonly>
	    	<div class="input-group-append">
	    		<button class="btn btn-primary bs-daterange-selector-submit"><i class="fas fa-check"></i></button>
	    	</div>
		</div>`);
		
	    let presets = this._options.presets.map(
	    	(ps, idx)=>`<a href="#" class="dropdown-item bs-daterange-preset-item"  preset-idx=${idx}>
      			${ps.title} <small preset-idx=${idx}>${ps.desc}</small>
    		</a>`) || [];

	    if(0<presets.length) {
	    	let _grp = this._selector.find('div.input-group.bs-daterange-selector-group .input-group-prepend');
	    	_grp.html(`
	    		<button type="button" class="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
	    		<div class="dropdown-menu">${presets.join('\n')}</div>
	    	</div>`);
	    }
	    if(this._options.focused) {
	    	this._selector.find(`input[name="${this._options.focused}"]`).addClass('focused');
	    }	    
	}

	this._drawControls = function(initializing) {
		this.html(`<div class="bs-daterange-wrapper bs-daterange-selector"></div>
			<div class="bs-daterange-wrapper bs-daterange-calendar"></div>`);

		this._drawControlsCalendar();
		this._drawControlsSelector();

		if(initializing) {
		    this.click(_onClickControl.bind(this));    	
	    }
	}

	this._drawControls(true);
	// (_drawControls.bind(this))();
});

$('.daterange').ready(function(){
	$('.daterange').each(function(idx, el) { $(el).daterange(); });
});