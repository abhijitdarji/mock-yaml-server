import lodash from 'lodash';
import { v4 as uuid } from 'uuid';
import { LowSync } from 'lowdb';

export class LowSyncWithLodash extends LowSync {
    constructor(adapter, data) {
        super(adapter, data);
        this.chain = lodash.chain(this).get('data');
    }

    ensureSelectorsForAllResources(data) {
        Object.keys(data).forEach((key) => {
            if (Array.isArray(data[key])) {
                data[key].forEach((item) => {
                    this.ensureSelectors(item, key);
                });
            }
        });
    }

    ensureSelectors(data, resource) {
        if (!data.hasOwnProperty('id')) {

            // get the last id in the array
            const lastId = lodash.chain(this.data)
                .get(resource)
                .map('id')
                .max()
                .value();

            data.id = lastId ? lastId + 1 : 1;
        }

        if (!data.hasOwnProperty('uuid')) data.uuid = uuid();

        return data;
    }

    write() {
        const data = this.data;
        this.ensureSelectorsForAllResources(data);
        super.write(data);
    }

    getItemById(arrayKey, id) {
        const array = this.data[arrayKey];

        if (Array.isArray(array)) {
            return array.find((item) => item.id === id);
        }

        return null;
    }

    updateItemById(arrayKey, id, updatedItem) {
        const array = this.data[arrayKey];

        if (Array.isArray(array)) {
            const index = array.findIndex((item) => item.id === id);

            if (index !== -1) {
                array[index] = { ...updatedItem, id };
                this.write();
                return true;
            }
        }

        return false;
    }

    deleteItemById(arrayKey, id) {
        const array = this.data[arrayKey];

        if (Array.isArray(array)) {
            const index = array.findIndex((item) => item.id === id);

            if (index !== -1) {
                array.splice(index, 1);
                this.write();
                return true;
            }
        }

        return false;
    }
}