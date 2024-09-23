import { createCookieSessionStorage } from "@remix-run/node";

// TODO replace this with better session storage

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "library_session", // use any name you want here
        sameSite: "strict",
        path: "/",
        //***httpOnly: true,
        secrets: ["s3cr3t"], // replace this with an actual secret
        secure: process.env.NODE_ENV === "production", // enable this in prod only
    },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
