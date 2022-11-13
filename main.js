import {DateTime} from "luxon";
import client from "./config.js";

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function isUnknownError(logMessage, response, knownStatusCodes) {
	if (!knownStatusCodes.includes(response.resp.statusCode)) {
		console.error(logMessage);
		console.error(response);
		await sleep(10000);
		return true;
	}
	return false;
}

function isListUnknownError(logMessage, response) {
	return isUnknownError(logMessage, response, [200, 429, 500, 502]);
}

function isSingleUnknownError(logMessage, response) {
	return isUnknownError(logMessage, response, [200, 404, 429, 500, 502]);
}

async function handleRateLimit(headers, useFulLRateLimit) {
	if (useFulLRateLimit && (headers['x-ratelimit-remaining'] || 0) === 0) return;
	else if ((headers['x-ratelimit-remaining'] || 0) >= headers['x-ratelimit-limit'] / 2) return;
	const now = DateTime.utc();
	const reset = DateTime.fromISO(headers['x-ratelimit-reset']);
	const sleepMs = reset.diff(now, "milliseconds", {conversionAccuracy: 'longterm'});
	await sleep(sleepMs);
}

async function handleFavourites() {
	while (true) {
		const favourites = await client.get(`favourites`);
		await handleRateLimit(favourites.resp.headers);

		if (await isListUnknownError('Unknown error in listing favourites', favourites))
			break;
		if (favourites.resp.statusCode === 200 && favourites.data.length === 0) {
			console.log('Done with favourites!');
			break;
		}

		if (favourites.resp.statusCode === 200)
			for (const status of favourites.data) {
				const unfavourite = await client.post(`statuses/${status.id}/unfavourite`, {});
				await handleRateLimit(unfavourite.resp.headers);
				if (await isSingleUnknownError('Unknown error in removing favourite', unfavourite))
					break;
			}
	}
}

async function handleStatuses(accountId) {
	while (true) {
		const statuses = await client.get(`accounts/${accountId}/statuses`);

		if (await isListUnknownError('Unknown error in listing statuses', statuses))
			break;
		if (statuses.resp.statusCode === 200 && statuses.data.length === 0) {
			console.log('Done with statuses!');
			break;
		}
		await handleRateLimit(statuses.resp.headers);

		if (statuses.resp.statusCode === 200)
			for (const status of statuses.data) {
				const deleteOrUnreblog = await status.reblog == null ?
					client.delete(`statuses/${status.id}`, {}) :
					client.post(`statuses/${status.reblog.id}/unreblog`, {});
				if (await isSingleUnknownError('Unknown error in deleting status', deleteOrUnreblog))
					break;
				await handleRateLimit(deleteOrUnreblog.resp.headers, true);
			}
	}
}

async function main() {
	let verifyCredentials = await client.get('accounts/verify_credentials', {});
	if (verifyCredentials.resp.statusCode !== 200) {
		console.error(verifyCredentials);
		process.exit(1);
	}
	handleFavourites().finally();
	handleStatuses(verifyCredentials.data.id).finally();
}

main().finally();
