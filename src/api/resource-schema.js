import Joi from 'joi';
import { faker } from '@faker-js/faker';

// extend joi with a custom type
const custom = Joi.extend({
    type: 'faker',
    base: Joi.string(),
    messages: {
        'faker.type': '{{#label}} must be a valid faker type'
    },
    validate(value, helpers) {
        if (!['array', 'json', 'compose', 'eval', 'object'].includes(value) && !validateFakerType(value)) {
            return { value, errors: helpers.error('faker.type') };
        }
    }
});

const schema = custom.object({
    resource: custom.string().required(),
    headers: custom.array().optional(),
    cookies: custom.array().optional(),
    seed: custom.number().optional(),
    properties: custom.object().pattern(/^/, custom.object({
        type: custom.faker().required(),
        properties: custom.object().optional(),
        input: custom.any().optional(),
        options: custom.object().optional(),
        items: custom.any().optional(),
        count: custom.number().optional()
    })).required()
});

const validateSchema = (data) => {
    return schema.validate(data);
}

const validateFakerType = (type) => {

    if (type.indexOf('.') > -1) {
        const [category, sub] = type.split('.');
        return Object.keys(faker[category]).includes(sub);
    }

    return Object.keys(faker).includes(type);
}


export { validateSchema };