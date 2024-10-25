import {
    all,
} from "./predicates.mjs";

export function getPage(content, query) {
    let {
        sort,
        page = 1,
        per_page = 10,
        filter = {}
    } = query;

    if (typeof per_page === 'string') {
        per_page = Number.parseInt(per_page);
    }
    if (typeof page === 'string') {
        page = Number.parseInt(page);
    }

    let result = {
        content,
        page,
        total: content.length,
        count: content.length,
        page_count: 0,
        ...query
    };

    let filterPredicates = [];
    for (let key in filter) {
        let fieldFilter = filter[key];
        let predicates = [];
        let predicate;

        if (fieldFilter.contains !== undefined) {
            let includes = x => {
                if (typeof x === 'string') {
                    return x.includes(fieldFilter.contains);
                } else if (Number.isInteger(x)) {
                    return x === fieldFilter.contains;
                }
            }
            predicates.push(includes);
        }

        if (fieldFilter.min !== undefined) {
            let min = x => x >= fieldFilter.min;
            predicates.push(min);
        }

        if (fieldFilter.max !== undefined) {
            let max = x => x <= fieldFilter.max;
            predicates.push(max);
        }

        predicate = x => all(...predicates)(x[key]);
        filterPredicates.push(predicate);
    }

    if (filterPredicates.length) {
        let predicate = all(...filterPredicates);
        content = content.filter(predicate);
    }

    if (content.length === 0) {
        result.content = content;
        return result;
    }

    page--;

    let total = content.length;
    if (sort) {
        let sortInfo = sort.split(' ');
        let direction = sortInfo[1];
        let field = sortInfo[0];
        let ascending = true;
        if (direction === 'desc') {
            ascending = false;
        }

        let comparator;
        if (content[0][field] instanceof Date) {
            comparator = (a, b) => a[field].getTime() - b[field].getTime();
        } else if (typeof content[0][field] === 'string') {
            comparator = (a, b) => a[field].localeCompare(b[field]);
        } else {
            comparator = (a, b) => a[field] - b[field];
        }

        if (ascending) {
            content = content.sort((a, b) => comparator(a, b));
        } else {
            content = content.sort((a, b) => comparator(b, a));
        }
    }

    let first = page * per_page;
    let last = first + per_page;

    content = content.slice(first, last);
    let count = content.length;
    let page_count = Math.ceil(total / per_page);

    result = {
        content,
        page: page + 1,
        per_page,
        total,
        count,
        sort,
        page_count,
        filter
    };

    return result;
}

export const cartesian =
    (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));