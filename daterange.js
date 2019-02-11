$.fn.daterange = (function(options) {
	const DEFAULT_OPTIONS = {
		calendar: '2019-02',
		ranged: {
			from: null,
			till: null,
		},
		selected: null,
		moveMonth: true,
		moveYear: true,
		titleFormat: 'YYYY.MMM',
		weekStart: 0,
		presets: [],
	}; 
	const WEEKDAYS = ['sun','mon','tue','wed','thu','fri','sat'];
	// console.log(this, options);

	this._options = Object.assign(DEFAULT_OPTIONS, this[0].dataset, options);
	// console.log(this._options);
	

	let _onClickControl = function(ev) {
		let ctrl = ev.target.tagName != 'I' ? ev.target : ev.target.parentElement;
		// on click title control
    	if(ctrl.classList.contains('bs-daterange-control')) {
    		let unit = ctrl.classList.contains('bs-daterange-year') ? 'year' : 'month';
    		let direction = ctrl.classList.contains('bs-daterange-prev') ? -1 : 1;

    		this._options.calendar = moment(this._options.calendar)
    			.add(unit, direction)
    			.format('YYYY-MM');
    		this._drawControls();
    	}

    	// on click calendar
    	if(ctrl.classList.contains('bs-daterange-cellbody')) {
    		console.log(ctrl.dataset.date);
    		this._options.selected = ctrl.dataset.date;
    		this._drawControls();
    	}
    	ev.preventDefault();
    	ev.stopPropagation();
	}

	this._drawControls = function(initializing) {
		this.html(`<div class="bs-daterange-wrapper bs-daterange-calendar"></div><div class="bs-daterange-wrapper bs-daterange-selector"></div>`);
		this._calendar = this.find('.bs-daterange-calendar');
		this._selector = this.find('.bs-daterange-selector');
		this._calendar.append(`<div class="input-group">
			<div class="input-group-prepend">
				<button class="btn bs-daterange-control bs-daterange-prev bs-daterange-year"><i class="fas fa-angle-double-left"></i></button>
				<button class="btn bs-daterange-control bs-daterange-prev bs-daterange-month"><i class="fas fa-angle-left"></i></button>
			</div>
			<span class="input-group-text bs-daterange-calendar-month">${moment(this._options.calendar).format(this._options.titleFormat)}</span>
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
		let the_month = dcursor.format('YYYY-MM');

	    do {
	    	let row = tblBody.append('<tr></tr>');
	    	WEEKDAYS.forEach((function(wd, widx, wdays) {
	    		let wi = (widx+this._options.weekStart) % 7;
				wd = wdays[wi];

				// month class
				let wc = 'bs-daterange-the-month';
				the_month = dcursor.format('YYYY-MM');
				let the_day = dcursor.format('YYYY-MM-DD');
				if(the_month!=this._options.calendar) {
					wc = dcursor.isBefore(_dbase) ? 'bs-daterange-prev-month' : 'bs-daterange-next-month';
				}
				let sc = this._options.selected == the_day ? 'selected' : '';
				let fc = this._options.focused == the_day ? 'focused': '';

				row.append(`<td class="bs-daterange-cellbody weekday-${wd} ${wc} ${sc} ${fc}" data-date="${dcursor.format('YYYY-MM-DD')}">${dcursor.date()}</td>`);
	    		dcursor.add('day', 1);
	    	}).bind(this));
	    } while(the_month==this._options.calendar)

	    this._selector.append(`<div class="bs-daterange-controls">
	    	<div class="input-group">
	    		<input class="form-control bs-daterange-period bs-daterange-from" type="date" readonly>
	    		<span class="input-text"> - </span>
	    		<input class="form-control bs-daterange-period bs-daterange-till" type="date" readonly>
	    	</div>
	    	<ul class="dropdown-menu bs-daterange-presets"></ul>
	    </div>`);

	    if(initializing) {
		    this.click(_onClickControl.bind(this));    	
	    }
	}

	this._drawControls(true);
	// (_drawControls.bind(this))();
});

$('.daterange').ready(function(){
	$('.daterange').each(function(idx, el) { console.log(el); $(el).daterange(); });
});