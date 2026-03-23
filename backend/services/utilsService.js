exports.applyWhere = (items, where = {}) => {
    const entries = Object.entries(where);
    if (!entries.length) return items;

    return items.filter((item) => {
        return entries.every(([key, value]) => {
        if (value === null || value === undefined) {
            return item[key] == null;
        }

        if (Array.isArray(value)) {
            return value.includes(item[key]);
        }

        return item[key] === value;
        });
    });
};

exports.applyAttributes = (items, attributes) => {
    if (!Array.isArray(attributes) || !attributes.length) return items;
    return items.map((item) => {
        const picked = {};
        attributes.forEach((attr) => {
        if (Object.prototype.hasOwnProperty.call(item, attr)) {
            picked[attr] = item[attr];
        }
        });
        return picked;
    });
};