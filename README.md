# Mastodon interaction deleter

This tool deletes all favourites, boosts and statuses made on the account it is used on, using the [Mastodon API](https://docs.joinmastodon.org/client/intro/).
This is useful if you want to clear your profile, but want to keep using it in the future.

## Caveats

Deletions might not federate to other servers very well. Some deletions might be missed or delayed, which means your posts
can stay visible on other instances long after you ran this tool.

## Install dependencies

- install [NodeJS](https://nodejs.org), preferably the latest **LTS** version of it.
- install [yarn](https://yarnpkg.com).
- Run: <br><br>

```bash
yarn
```

## Create a Mastodon application and get the access token

> You can do this from the settings in Mastodon. There's a 'Development' section. Give the application at least read and write permissions.

## Add config options
Create a file `config.local.js` file in the same directory as this `README.md` with the following content:
```js
export const MASTODON_BASE_URL = 'https://example.mastodon.tld';
export const MASTODON_ACCESS_TOKEN = 'INSERT_ACCESS_TOKEN_HERE';
```

This file is then imported using config.js, which initializes the API access when you run the tool.

- `MASTODON_BASE_URL` is the URL for the instance you're on.
- `MASTODON_ACCESS_TOKEN` is the access token from the previous step

## Run the tool

```bash
yarn start
```

Be aware that it might take a long time to finish, as it has to honor [API rate limits](https://docs.joinmastodon.org/api/rate-limits/).
This means that your statuses (boosts and posts) will be deleted with a maximum of 30 statuses per 5 minutes on a standard Mastodon instance.
For any other API access (listing favourites and statuses, unfavouriting), it will use about half of your rate limit at most, to prevent losing API access entirely.