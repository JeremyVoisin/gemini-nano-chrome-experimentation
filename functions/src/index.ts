/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { convert } from 'html-to-text';


// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


// const axios = require('axios');

export const loadWebsiteContent = onRequest(async (request, response) => {
    const { url } = request.query;
    if (!url) {
        response.status(400).send("No URL provided.");
    }

    try {
        const data = await fetch(url as string);
        const html = await data.text();
        const text = convert(html, {baseElements: {selectors: ['main']}, selectors: [{selector: 'a', format: 'skip'}]});
        response.status(200).send(text);
    } catch (error) {
        logger.error("Error loading website content:", { error });
        response.status(500).send("Error loading website content.");
    }
})