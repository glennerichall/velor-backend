import {addMinutes} from "date-fns/addMinutes";
import {addHours} from "date-fns/addHours";
import {addDays} from "date-fns/addDays";
import {addMonths} from "date-fns/addMonths";
import {addYears} from "date-fns/addYears";
import {differenceInMinutes} from "date-fns/differenceInMinutes";
import {differenceInHours} from "date-fns/differenceInHours";
import {differenceInDays} from "date-fns/differenceInDays";
import {differenceInMonths} from "date-fns/differenceInMonths";
import {differenceInYears} from "date-fns/differenceInYears";
import {getDaysInMonth} from "date-fns/getDaysInMonth";

const numberOfHoursInDay = 24;
const numberOfDaysInMoth = getDaysInMonth(addMonths(new Date(), -1));
const numberOfMonthsInYear = 12;

const lbMinutes = 1;                                  // 1    10 minutes
const ubMinutes = 5;                                  // 5    50 minutes
const lbHours = ubMinutes + 1;                        // 6    1  hour
const ubHours = lbHours + numberOfHoursInDay - 2;     // 28   23 hours
const lbDays = ubHours + 1;                           // 29   1  day
const ubDays = lbDays + numberOfDaysInMoth - 2;       //      27, 29, 30 days
const lbMonths = ubDays + 1;                          //      1  month
const ubMonths = lbMonths + numberOfMonthsInYear - 2; //      11 months

export function convertDate(value) {
    let now = new Date();

    if (value <= ubMinutes) {           // 10 to 50 minutes
        return addMinutes(now, -value * 10);
    } else if (value <= ubHours) {      // 1 to 23 hours
        return addHours(now, -(value - ubMinutes));
    } else if (value <= ubDays) {      // 1 to 30 days
        return addDays(now, -(value - ubHours));
    } else if (value <= ubMonths) {      // 1 to 12 months
        return addMonths(now, -(value - ubDays));
    } else {
        return addYears(now, -(value - ubMonths));
    }
}

convertDate._10_MIN = lbMinutes;
convertDate._50_MIN = ubMinutes;
convertDate._1_HOUR = lbHours;
convertDate._23_HOURS = ubHours;
convertDate._1_DAY = lbDays;
convertDate._30_DAYS = ubDays;
convertDate._1_MONTH = lbMonths;
convertDate._11_MONTH = ubMonths;
convertDate._1_YEAR = ubMonths + 1;

export function convertBackDate(date) {
    let now = new Date();
    let value;
    if (differenceInMinutes(now, date) <= 50) {
        value = Math.floor(differenceInMinutes(now, date) / 10);
    } else if (differenceInHours(now, date) <= 23) {
        value = differenceInHours(now, date) + ubMinutes;
    } else if (differenceInDays(now, date) <= 30) {
        value = differenceInDays(now, date) + ubHours;
    } else if (differenceInMonths(now, date) <= 11) {
        value = differenceInMonths(now, date) + ubDays;
    } else {
        value = differenceInYears(now, date) + ubMonths;
    }

    return value;
}

export const convertSize = value => {
    let n = Math.floor(value / 10);
    let b = value - n * 10 + 1;
    value = b * 10 ** n;
    return value;
}

export const convertBackSize = value => {
    let lob_10_v = Math.log10(value);
    let n = Math.floor(lob_10_v);
    let b = Math.floor(10 ** (lob_10_v - n));
    return 10 * n + (b - 1);
}