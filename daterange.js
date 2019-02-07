import $ from 'jquery';
import Popper from 'popper.js';
import Util from 'bootstrap/dist/util';
import Dropdown from 'bootstrap/dist/dropdown';

const SELECTOR_BASE = 'dropdown-menu';
const SELECTOR_PICKER = 'daterange';
const SELECTOR_MENU = `.${SELECTOR_BASE}.${SELECTOR_PICKER}`;

class DateRange {
	static _buildDateRangeCtrl(menuParent) {
		console.log(menuParent);
	}
}

$(SELECTOR_MENU).ready(()=>{
	// build calendar
	$(SELECTOR_MENU).each((idx, menu) => {
		return DateRange._buildDateRangeCtrl(menu);
	});
});


export default DateRange;