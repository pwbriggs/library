import {
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useActionData,
    useLoaderData,
} from "@remix-run/react";

import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

import { serverOnly$ } from "vite-env-only/macros";
import { bootstrapAccount, checkOtp, showAppSetup } from "~/scripts/setup.server";
import { AppSetup, AppSetupState } from "~/scripts/setup";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { CreateUserErrors, createUserFromForm } from "~/scripts/create-user.server";

await serverOnly$(bootstrapAccount());

export default function App() {
    const loaderData = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <Meta />
                <Links />
                <ColorSchemeScript />
            </head>
            <body style={{ margin: 0, padding: 0, overflowWrap: "break-word" }}>
                <MantineProvider>
                    {
                        loaderData.showAppSetup ?
                            <AppSetup state={actionData?.status || AppSetupState.Pending} errors={actionData?.errors} />
                            :
                            <Outlet />
                    }
                </MantineProvider>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}


export async function loader() {
    return json({ showAppSetup });
}

export async function action({ request }: ActionFunctionArgs): Promise<{status: AppSetupState, errors?: CreateUserErrors}> {
    const formData = await request.formData();
    const otp = formData.get("otp");
    if (typeof otp == "string" && checkOtp(otp)) {
        if (typeof formData.get("username") == "string") { // If the user might be on the second stage
            const { hasErrors, errors } = await createUserFromForm(formData, request, true);
            if (hasErrors) {
                return json({ status: AppSetupState.CreateUser, errors: errors });
            }
            bootstrapAccount();
            return redirect(`/`);
        }
        return json({ status: AppSetupState.CreateUser });
    } else {
        return json({ status: AppSetupState.OtpError });
    }
}
