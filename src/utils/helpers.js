module.exports = {
    formatPrice: (price) => {
        return parseFloat(price).toFixed(2);
    },
    json: (context) => {
        return JSON.stringify(context);
    },
    eq: (a, b) => {
        return a === b;
    },
    multiply: (a, b) => {
        return a * b;
    }
};