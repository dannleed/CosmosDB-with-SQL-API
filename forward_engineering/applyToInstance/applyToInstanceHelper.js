const { StoredProcedure, UserDefinedFunction, Trigger } = require('../../reverse_engineering/node_modules/@azure/cosmos');
const setUpDocumentClient = require('../../reverse_engineering/helpers/setUpDocumentClient');

const applyToInstanceHelper = (_) => ({
	setUpDocumentClient(connectionInfo) {
		return setUpDocumentClient(connectionInfo);
	},

	createStoredProcs(storedProcs, containerInstance) {
		return storedProcs.reduce(async (next, proc) => {
			await next;

			try {
				return await containerInstance.scripts.storedProcedures.create(proc);
			} catch (error) {
				if (error.code !== 409) {
					throw error;
				}
				const result = new StoredProcedure(containerInstance, proc.id, containerInstance.clientContext);

				return await result.replace(proc);
			}
		}, Promise.resolve());
	},

	createUDFs(udfs, containerInstance) {
		return udfs.reduce(async (next, udf) => {
			await next;

			try {
				return await containerInstance.scripts.userDefinedFunctions.create(udf);
			} catch (error) {
				if (error.code !== 409) {
					throw error;
				}
				const result = new UserDefinedFunction(containerInstance, udf.id, containerInstance.clientContext);

				return await result.replace(udf);
			}
		}, Promise.resolve());
	},

	createTriggers(triggers, containerInstance) {
		return triggers.reduce(async (next, trigger) => {
			await next;

			try {
				return await containerInstance.scripts.triggers.create(trigger);
			} catch (error) {
				if (error.code !== 409) {
					throw error;
				}
				const result = new Trigger(containerInstance, trigger.id, containerInstance.clientContext);

				return await result.replace(trigger);
			}
		}, Promise.resolve());
	},

	getTTL(containerData) {
		switch (containerData.TTL) {
			case 'On (no default)':
				return -1;
			case 'On':
				return _.parseInt(TTLseconds) || 0;
			default:
				return -1;
		}
	},
});

module.exports = applyToInstanceHelper;