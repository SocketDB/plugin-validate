import AJV, { JSONSchemaType } from 'ajv';
import { unwrap } from 'socketdb/dist/node';
import type { ServerPlugin } from 'socketdb/dist/server';
import { createStore } from 'socketdb/dist/store';
import { mergeDiff } from 'socketdb/dist/utils';

export default function <DataType>(
	schema: JSONSchemaType<DataType>
): ServerPlugin {
	const ajv = new AJV();
	const validate = ajv.compile(schema);
	return {
		name: 'schema',
		hooks: {
			'server:update': ({ data }, { api }) => {
				const storedData = api.get('');
				mergeDiff(data, storedData);
				if (!validate(unwrap(storedData)))
					throw {
						name: 'invalid',
						message: 'Data is invalid.',
						errors: validate.errors,
					};
			},
			'server:delete': ({ path }, { api }) => {
				const tmpStore = createStore();
				tmpStore.put(api.get(''));
				tmpStore.del(path);
				if (!validate(unwrap(tmpStore.get()))) {
					throw {
						name: 'invalid',
						message: 'Data is invalid.',
						errors: validate.errors,
					};
				}
			},
		},
	};
}

export type { JSONSchemaType };


