const Decimal = require('decimal.js');
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

module.exports.apply = (array, sortBy, sortType) => {
    const comparator = getComparator(sortType, sortBy);
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    if (sortBy === 'vol24hxrp' && sortType === 'desc') {
        let idx = 1;
        const res = stabilizedThis.map((el) => {
            el[0].id = idx++;
            return el[0];
        });
        return res;
    } else {
        return stabilizedThis.map((el) => el[0]);
    }
}

function comparePair(a, b) {
    if (b.curr1.value < a.curr1.value) {
        return -1;
    }
    if (b.curr1.value > a.curr1.value) {
        return 1;
    }
    return 0;
}

module.exports.pairs = (pairs, sortType) => {
    const comparator = sortType === 'desc' ? (a, b) => comparePair(a, b) : (a, b) => -comparePair(a, b);

    const stabilizedThis = pairs.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    let idx = 1;
    const res = stabilizedThis.map((el) => {
        el[0].id = idx++;
        return el[0];
    });
    return res;
    //return stabilizedThis.map((el) => el[0]);
}

function compareTrustLine(a, b) {
    if (b.balance < a.balance) {
        return -1;
    }

    if (b.balance > a.balance) {
        return 1;
    }
    return 0;
}

module.exports.trustlines = (lines, wallets, sortType) => {
    const comparator = sortType === 'desc' ? (a, b) => compareTrustLine(a, b) : (a, b) => -compareTrustLine(a, b);

    const stabilizedThis = lines.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    let idx = 1;
    let totalSupply = '0';
    let circulatingSupply = '0';

    const sortList = stabilizedThis.map((el) => {
        el[0].id = idx++;
        const address = el[0].account;
        totalSupply = Decimal.add(totalSupply, el[0].balance).toString();

        if (wallets.includes(address)) {

        } else {
            circulatingSupply = Decimal.add(circulatingSupply, el[0].balance).toString();
        }
        return el[0];
    });
    return {sortList, totalSupply, circulatingSupply};

    // return stabilizedThis.map((el) => el[0]);
}