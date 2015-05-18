# Pool of Video - A searchable index of videos

A simple service to hold metadata for videos and make it searchable.

It is accessible via a website and via a REST based JSON API.

## Getting started

You will need node.js and mongodb installed.

A simple `npm install` and `npm start` should be enough to start the server.

By default it runs on port 3000, this is configurable via an environment variable (all of them are optional).

    PORT - To use a custom port (default: 3000)
    MONGODB - The Mongo DB to use (default: "mongodb://127.0.0.1/poolofvideo")
    SECRET - Used for session hashes. Ideally this should be unique per server.