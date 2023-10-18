![modar](https://cdn.discordapp.com/attachments/856213034716758036/1158702564141973534/IMG_3414.JPG?ex=651d355a&is=651be3da&hm=89d37764da8debf72db294ea8fc268e650301a76912d7966280fa016eced23c8&)

## Requirements
1. Node 18
2. npm
3. Turso account and database
4. Upstash redis account and database
5. osu! account.

## Initializing Turso
1. Login with your Turso account with the Turso CLI
2. Make a new database if you haven't made one
3. Run `cat database/migrate.sqlite.sql | turso db shell {your_database_name}` to migrate
4. **You may need to clear the database tables beforehand if you have made one before.**

## Initializing Upstash redis
1. Login
2. Make a database
3. Fill in the blanks in `.env`.

## Installation
1. git clone this
2. Run `npm install`
3. Duplicate `.env.example` and rename to `.env`
4. Fill the `.env` file
5. Make sure you have osu OAuth application that has callback on `/api/auth/callback/osu`
6. Run `npm run dev`
7. Open your web browser and go to `http://localhost:3000`
8. Press `Ctrl + C` in terminal to kill the web.