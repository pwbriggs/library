import { createCookieSessionStorage } from "@remix-run/node";
import cryptoRandomString from "crypto-random-string";

// TODO replace this with better session storage

let cookieSecret = process.env.COOKIE_SECRET;

if (!cookieSecret) {
    if (process.env.NODE_ENV === "production") {
        console.error(
            "Please specify a COOKIE_SECRET in production. For now, we have set a random one: this \
            breaks all existing sessions and will continue doing so until you set a COOKIE_SECRET.",
        );
        cookieSecret = cryptoRandomString({ length: 32, type: "base64" });
    } else {
        cookieSecret = "d3v3l0p";
    }
}

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "library_session", // use any name you want here
        sameSite: "strict",
        path: "/",
        httpOnly: true,
        secrets: [cookieSecret],
        secure: process.env.NODE_ENV === "production", // enable this in prod only
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
