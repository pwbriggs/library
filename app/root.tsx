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
                    <Box bg="yellow.2" p="sm" ta="center">
                        <b>
                            ⚠️ Site under construction 🏗️
                        </b> We&apos;re still in the initial early development stage. All pages on this
                        site are <strong>tests only.</strong>
                    </Box>
                    <Outlet />
                </MantineProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
