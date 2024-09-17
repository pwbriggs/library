import { Title, Text, Center, Stack, Paper, PinInput, Button, List } from "@mantine/core";
import { Form, useSubmit } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { CollectUserInfo } from "~/routes/staff.create-user";
import { CreateUserErrors } from "./create-user.server";

export enum AppSetupState {
    Pending,
    OtpError,
    CreateUser,
}

export function AppSetup({ state, errors }: { state: AppSetupState, errors: CreateUserErrors | undefined }) {
    const [inputOtp, setInputOtp] = useState("");
    const submit = useSubmit();
    return (
        <Center>
            <Stack>
                <Paper bg="red.1" c="red.9" p="lg" m="sm" radius="md">
                    <Title>Library setup</Title>
                    <Text>
                        Sorry, this app isn&apos;t set up yet! Please contact your librarian to help resolve this issue.
                    </Text>
                </Paper>
                <details style={{ marginInlineStart: "1rem" }}>
                    <summary><Text span size="sm">Admin login</Text></summary>
                    <Text size="sm">Please enter one-time code found in server console:</Text>
                    <PinInput
                        mt="sm"
                        type={/^[CDEHKMPRTUWXY012458]$/i}
                        length={6}
                        value={inputOtp}
                        error={state == AppSetupState.OtpError}
                        onChange={(newOtp) => setInputOtp(newOtp.toUpperCase())}
                        onComplete={(value) => submit(
                            { otp: value },
                            { method: "post" }
                        )}
                    />
                </details>
                {state == AppSetupState.CreateUser &&
                    <>
                        <Text>
                            Welcome to your library server! We&apos;re showing this setup screen
                            because we did not find any existing admin accounts. Go ahead and create
                            one now:
                        </Text>
                        <Form method="post">
                            <CollectUserInfo errors={errors} />
                            <input
                                type="hidden"
                                name="otp"
                                value={inputOtp}
                            />
                            <Button mt="sm" type="submit" rightSection={<IconChevronRight />}>
                                Create admin account
                            </Button>
                            {errors && errors.global.length > 0 && <>
                                <Text fw="bold">
                                    Unexpected error{errors.global.length != 1 && "s"} while creating user
                                </Text>
                                <details>
                                    <List size="sm">
                                        {errors.global.map(message => <List.Item key={message}>{message}</List.Item>)}
                                    </List>
                                </details>
                            </>}
                        </Form>
                    </>
                }
            </Stack>
        </Center>
    );
}
