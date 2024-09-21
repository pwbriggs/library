import { Center, Paper, TextInput, Image, Group, Text, Button, PasswordInput, CheckIcon, CloseIcon } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconChevronRight } from "@tabler/icons-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, MetaFunction, useLoaderData } from "@remix-run/react";
import { auth } from "~/scripts/auth.server";
import { commitSession, getSession } from "~/scripts/session.server";
import logo from "~/assets/img/logo.svg";
import { getNextUrl } from "~/scripts/urls.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Login" }
    ];
};

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function Screen() {
    const data = useLoaderData<typeof loader>();
    let errors = { username: "", password: "" };
    switch (data.error?.message) {
        case "badUsername":
            errors.username = "User not found"
            break;
        case "noPasswords":
            errors.username = "Password login is not set up for this user"
            break;
        case "badPassword":
            errors.password = "Incorrect password"
            break;
        case undefined:
            break;
        default:
            errors.password = "Unknown login error, please contact a librarian"
    }
    return (
        <Center>
            <Paper m="md" miw="min(40%, 25rem)" p="lg" shadow="lg" withBorder radius="md">
                <Group mb="sm">
                    <Image w="1.5em" h="1.5em" src={logo} alt="app logo" />
                    <Text>Log in</Text>
                </Group>
                <Form method="post">
                    <TextInput
                        label="Username"
                        name="username"
                        autoComplete="username"
                        required
                        error={errors.username}
                    />
                    <PasswordInput
                        label="Password"
                        name="password"
                        autoComplete="current-password"
                        required
                        error={errors.password}
                    />
                    <Button mt="sm" type="submit" rightSection={<IconChevronRight />}>Log in</Button>
                </Form>
            </Paper>
        </Center>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    // TODO log this action
    return await auth.authenticate("usernamePassword", request, {
        successRedirect: getNextUrl(request),
        failureRedirect: request.url,
    });
}

export async function loader({ request }: LoaderFunctionArgs) {
    // If the user is already authenticated redirect to next url directly
    await auth.isAuthenticated(request, {
        successRedirect: getNextUrl(request),
    });
    let session = await getSession(request.headers.get("cookie"));
    let error = session.get(auth.sessionErrorKey);
    return json({ error }, {
        headers: {
            'Set-Cookie': await commitSession(session) // You must commit the session whenever you read a flash
        }
    });
}
