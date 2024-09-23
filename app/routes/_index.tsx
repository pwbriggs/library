import { Button, Center, Group, Stack, Text } from "@mantine/core";
import { json, type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { auth } from "~/scripts/auth.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Home" }
    ];
};

export default function Index() {
    const data = useLoaderData<typeof loader>();
    return (
        <Center>
            <Stack>
                {data.user ?
                    <>
                        <Text size="xl" fw="bold">
                            Hello,{" "}
                            <Text
                                inherit
                                span
                                variant="gradient"
                                gradient={{ from: "cyan", to: "blue.9", deg: 45 }}
                            >
                                {data.user.preferredName}
                            </Text>!
                        </Text>
                        <Button component="a" href="/logout">Log out</Button>
                    </>
                    :
                    <>
                        <Text size="xl" fw="bold">Welcome to the library!</Text>
                        <Group>
                            <Button component="a" href="/login">Log in</Button>
                        </Group>
                    </>
                }
            </Stack>
        </Center>
    );
}

export async function loader({ request }: LoaderFunctionArgs) {
    return json({ user: await auth.isAuthenticated(request) });
}
