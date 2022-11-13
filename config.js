// See an error for the config.local.js? See README.
import {MASTODON_ACCESS_TOKEN, MASTODON_BASE_URL} from './config.local.js';
import Mastodon from "mastodon-api";

const client = new Mastodon({
	access_token: MASTODON_ACCESS_TOKEN,
	timeout_ms: 60 * 1000,
	api_url: MASTODON_BASE_URL + "/api/v1/"
});

export default client;