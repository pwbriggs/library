import { Box, Typography } from "@mui/joy";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
    Links,
    LiveReload,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
} from "@remix-run/react";

export const links: LinksFunction = () => [
    ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body style={{ margin: 0, padding: 0, overflowWrap: "break-word" }}>
                <Box sx={{
                    bgcolor: 'danger.100',
                    padding: "1rem 2rem",
                    marginBottom: 2,
                    textAlign: "center"
                }}>
                    <Typography level="body-lg">
                        <Typography fontWeight="bold">
                            ⚠️ Site under construction 🏗️
                        </Typography>{" "}
                        We&apos;re still in the initial early development stage. All pages on this
                        site are{" "}
                        <Typography fontWeight="bold">tests only.</Typography>
                    </Typography>
                </Box>
                <Outlet />
                <ScrollRestoration />
                <Scripts />
                <LiveReload />
            </body>
        </html>
    );
}
