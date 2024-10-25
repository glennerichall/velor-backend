import {
    convertBackDate,
    convertDate
} from "../utils/conversion.mjs";
import {
    subDays,
    subHours,
    subMinutes,
    subMonths,
    subYears
} from "date-fns";
import {differenceInMinutes} from "date-fns/differenceInMinutes";

import {setupTestContext} from "../test/setupTestContext.mjs";

const {
    expect,
    test
} = setupTestContext();

test.describe('conversion', () => {
    test('should convert minutes', () => {
        for (let i = 1; i <= 5; i++) {
            let date = convertDate(i);
            let minus = subMinutes(new Date(), 10 * i);
            expect(differenceInMinutes(date, minus)).to.eq(0);
        }
    })

    test('should convert back minutes', () => {
        for (let i = 1; i <= 5; i++) {
            let date = convertDate(i);
            let k = convertBackDate(date);
            expect(k).to.eq(i);
        }
    })

    test('should convert hours', () => {
        for (let i = convertDate._1_HOUR, j = 1; i <= convertDate._23_HOURS; i++, j++) {
            let date = convertDate(i);
            let minus = subHours(new Date(), j);
            expect(differenceInMinutes(date, minus)).to.eq(0);
        }
    })

    test('should convert back hours', () => {
        for (let i = convertDate._1_HOUR, j = 1; i <= convertDate._23_HOURS; i++, j++) {
            let date = convertDate(i);
            let k = convertBackDate(date);
            expect(k).to.eq(i);
        }
    })

    test('should convert days', () => {
        for (let i = convertDate._1_DAY, j = 1; i <= convertDate._30_DAYS; i++, j++) {
            let date = convertDate(i);
            let minus = subDays(new Date(), j);
            expect(differenceInMinutes(date, minus)).to.eq(0);
        }
    })

    test('should convert back days', () => {
        for (let i = convertDate._1_DAY, j = 1; i <= convertDate._30_DAYS; i++, j++) {
            let date = convertDate(i);
            let k = convertBackDate(date);
            expect(k).to.eq(i);
        }
    })

    test('should convert months', () => {
        for (let i = convertDate._1_MONTH, j = 1; i <= convertDate._11_MONTH; i++, j++) {
            let date = convertDate(i);
            let minus = subMonths(new Date(), j);
            expect(differenceInMinutes(date, minus)).to.eq(0);
        }
    })

    test('should convert back months', () => {
        for (let i = convertDate._1_MONTH; i <= convertDate._11_MONTH; i++) {
            let date = convertDate(i);
            let k = convertBackDate(date);
            expect(k).to.eq(i);
        }
    })

    test('should convert years', () => {
        for (let i = convertDate._1_YEAR, j = 1; i <= convertDate._1_YEAR + 3; i++, j++) {
            let date = convertDate(i);
            let minus = subYears(new Date(), j);
            expect(differenceInMinutes(date, minus)).to.eq(0);
        }
    })

    test('should convert back years', () => {
        for (let i = convertDate._1_YEAR, j = 1; i <= convertDate._1_YEAR + 3; i++, j++) {
            let date = convertDate(i);
            let k = convertBackDate(date);
            expect(k).to.eq(i);
        }
    })


})