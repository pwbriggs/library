import {
    Button,
    Center,
    List,
    Paper,
    PinInput,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import type { ActionFunctionArgs, TypedResponse } from "@remix-run/node";
import {
    Form,
    json,
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { CollectUserInfo } from "~/routes/staff.create-user";
import {
    type CreateUserErrors,
    createUserFromForm,
} from "~/scripts/create-user.server";
import { prisma } from "~/scripts/prisma.server";
import { checkOtp, genOtp } from "~/scripts/otp.server";

enum AppSetupState {
    PendingUnlock = 0,
    OtpError = 1,
    CreateUser = 2,
}

export default function Status() {
    const { isSetUp } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const [inputOtp, setInputOtp] = useState("");
    const submit = useSubmit();
    const nav = useNavigation();
    return isSetUp ? (
        <Paper bg="green.1" p="lg" m="sm" radius="md">
            <Title c="green.9">Library is set up</Title>
            <Text my="md">The system is set up and running!</Text>
            <Button component="a" href="/">
                Home page
            </Button>
        </Paper>
    ) : (
        <Center>
            <Stack>
                {actionData?.state !== AppSetupState.CreateUser && (
                    <Paper bg="red.1" p="lg" m="sm" radius="md">
                        <Title c="red.9">Library is not set up</Title>
                        <Text my="md">
                            Please contact a librarian to help resolve this
                            issue.
                        </Text>
                    </Paper>
                )}
                <Paper withBorder shadow="md" p="lg" m="sm" radius="md">
                    <Text size="sm">
                        <strong>Admins:</strong> Please enter one-time code
                        found in server console to enter setup menu:
                    </Text>
                    <PinInput
                        mt="sm"
                        type={/^[CDEHKMPRTUWXY012458]$/i}
                        length={6}
                        value={inputOtp}
                        error={actionData?.state === AppSetupState.OtpError}
                        disabled={nav.state !== "idle"}
                        onChange={(newOtp) => setInputOtp(newOtp.toUpperCase())}
                        onComplete={(value) =>
                            submit({ otp: value }, { method: "post" })
                        }
                    />
                    {actionData?.state === AppSetupState.CreateUser && (
                        <>
                            <Text my="md">
                                <b>Welcome to your library server!</b>{" "}
                                We&apos;re showing this setup screen because we
                                did not find any existing admin accounts. Go
                                ahead and create one now:
                            </Text>
                            <Form method="post">
                                <CollectUserInfo errors={actionData?.errors} />
                                <input
                                    type="hidden"
                                    name="otp"
                                    value={inputOtp}
                                />
                                <Button
                                    mt="sm"
                                    type="submit"
                                    rightSection={<IconChevronRight />}
                                >
                                    Create admin account
                                </Button>
                                {!!actionData?.errors?.global.length && (
                                    <>
                                        <Text fw="bold">
                                            Unexpected error
                                            {actionData?.errors.global
                                                .length !== 1 && "s"}{" "}
                                            while creating user
                                        </Text>
                                        <details>
                                            <List size="sm">
                                                {actionData?.errors.global.map(
                                                    (message) => (
                                                        <List.Item
                                                            key={message}
                                                        >
                                                            {message}
                                                        </List.Item>
                                                    ),
                                                )}
                                            </List>
                                        </details>
                                    </>
                                )}
                            </Form>
                        </>
                    )}
                </Paper>
            </Stack>
        </Center>
    );
}

let setupOtpHash: string;

export async function loader() {
    if (
        !(await prisma.user.findFirst({
            where: { isAdmin: true },
        }))
    ) {
        console.warn("> No admins found. Initializing setup flow.");
        if (!setupOtpHash) {
            const { otp, hash } = genOtp();
            setupOtpHash = hash;
            console.warn(
                `> Please open the website, and enter the following code when prompted: ${otp}`,
            );
        } else {
            console.warn("> Setup menu unlock code already specified above.");
        }
        return json({ isSetUp: false });
    }
    console.log("Admin account found.");
    return json({ isSetUp: true });
}

export async function action({
    request,
}: ActionFunctionArgs): Promise<
    TypedResponse<{ state: AppSetupState; errors?: CreateUserErrors }>
> {
    const formData = await request.formData();
    const otp = formData.get("otp");
    if (typeof otp === "string" && checkOtp(otp, setupOtpHash)) {
        if (typeof formData.get("username") === "string") {
            // If the user might be on the second stage
            const { hasErrors, errors } = await createUserFromForm(
                formData,
                request,
                true,
            );
            if (hasErrors) {
                return json({
                    state: AppSetupState.CreateUser,
                    errors: errors,
                });
            }
            return redirect("/");
        }
        return json({ state: AppSetupState.CreateUser });
    }
    return json({ state: AppSetupState.OtpError });
}
