import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";

import { ColorSchemeScript, MantineProvider, Box } from '@mantine/core';
import '@mantine/core/styles.css';

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
                <ColorSchemeScript />
            </head>
            <body style={{ margin: 0, padding: 0, overflowWrap: "break-word" }}>
                <MantineProvider>
                    <Outlet />
                </MantineProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
