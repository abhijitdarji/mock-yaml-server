import { faker } from '@faker-js/faker';

const resolveFakerValue = (module, input, options) => {

    let fn;
    if (module.indexOf('.') > -1) {
        const [category, type] = module.split('.');
        fn = faker[category][type];
    }
    else {
        fn = faker[module];
    }

    if (typeof fn !== 'function') {
        throw new Error(`Invalid faker module: ${module}`);
    }

    return input ? fn(input, options) : fn(options);
}

const generateMockData = (schema) => {

    const mockData = {};

    const generateValue = (property) => {
        const { type, properties, items, count, input, options } = property;

        switch (type) {
            case 'array':
                const itemsArr = Array.isArray(items) ? items : [items];
                let returnArray = [];
                for (const item of itemsArr) {
                    let arrCount = item.count || count || 1;

                    if (item.type) {
                        returnArray.push(Array.from({ length: arrCount }, () => generateValue(item)));
                    } else if (item.properties) {

                        returnArray.push(Array.from({ length: arrCount }, () => Object.keys(item.properties).reduce((acc, propertyName) => {
                            acc[propertyName] = generateValue(item.properties[propertyName]);
                            return acc;
                        }, {})));
                    } else {
                        returnArray.push([]);
                    }
                }
                return returnArray.flat();
            case 'json':

                if (input && typeof input === 'object') {
                    return input;
                }

                return input ? JSON.parse(input) : {};
            case 'compose':

                if (!Array.isArray(input)) return '';

                return input.map((item) => {
                    const { type, input, options } = item;

                    if (!type && !input && !options) return item;

                    return resolveFakerValue(type, input, options);
                }).join('');

            case 'eval':

                if (!input) return '';

                return eval(input);

            case 'object':
                return Object.keys(properties).reduce((acc, propertyName) => {
                    acc[propertyName] = generateValue(properties[propertyName]);
                    return acc;
                }, {});

            default:
                return resolveFakerValue(type, input, options);
        }
    };

    for (const propName in schema.properties) {
        mockData[propName] = generateValue(schema.properties[propName]);
    }

    return mockData;
}

export { generateMockData };