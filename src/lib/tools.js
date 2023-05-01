const Sort = require('./Sort');
const axios = require('axios');
const Decimal = require('decimal.js');
const scheduler = require('node-schedule');
const { performance } = require('perf_hooks');

const log = require('./logger')();

// const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports.init = async () => {
	log.info('Initialize tools module ...');
};

const getPrices = async (
    page = 1,
    rows = 10,
    fiat = "INR",
    tradeType = "BUY",
    asset = "USDT",
    payTypes = ["IMPS"]
) => {

    const baseObj = {
        page,
        rows,
        publisherType: null,
        asset,
        tradeType,
        fiat,
        payTypes,
    };

    try {
        const res = await axios.post(`https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search`, baseObj);
        if (res.status === 200) {
            return res.data;
        }
    } catch (e) {
        log.error(e);
    }

    return null;
}

module.exports.getPrices = getPrices;

module.exports.getFinalPrice = async (amount) => {
    let page = 0;
    let rows = 10;
    let fiat = "INR";
    let tradeType = "BUY";
    let asset = "USDT";
    let payTypes = ["IMPS"];

    let loop = true;

    let sum = 0;
    let usdt = 0;
    while (loop) {
        page++;

        const prices = await getPrices(page, rows, fiat, tradeType, asset, payTypes);

        if (!prices || !prices.data) {
            log.warn('Not found');
            loop = false;
            return null;
        }

        for (const p of prices?.data || []) {
            const {
                price,
                tradableQuantity
            } = p.adv;

            const quantity = Decimal.mul(price, tradableQuantity).toString();
            sum = new Decimal(sum).add(quantity).toString();
            const diff = Decimal.sub(sum, amount).toNumber();
            usdt = new Decimal(usdt).add(tradableQuantity).toString();

            log.info(`${page}. ${prices.data.length} ${sum} ${amount} ${diff}`);

            if (diff > 0) {
                const diffUsdt = new Decimal(diff).div(price).toString();
                usdt = new Decimal(usdt).sub(diffUsdt).toString();

                const finalPrice = Decimal.div(amount, usdt).toNumber();
                return finalPrice;
            }
        }
    }

    return null;
}
