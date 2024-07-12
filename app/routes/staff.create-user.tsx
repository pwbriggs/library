import { Center, TextInput, Group, Text, Button, Box, Fieldset, Checkbox, SegmentedControl, PasswordInput, List, ThemeIcon } from "@mantine/core";
import { IconArrowBackUp, IconChevronRight, IconExclamationCircle } from "@tabler/icons-react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, MetaFunction, redirect, useActionData } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/scripts/prisma.server";
import { createUsernamePasswordCredential } from "~/scripts/password.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Create user" }
    ];
};

type UserInfo = {
    givenName: string,
    familyName: string,
    fullName: string,
    preferredName: string,
    username: string,
    password: string,
    accountType: "normal" | "librarian" | "admin",
}

export default function Screen() {
    const actionData = useActionData<typeof action>();
    const [userInfo, setUserInfo] = useState<UserInfo>({
        givenName: "",
        familyName: "",
        fullName: "",
        preferredName: "",
        username: "",
        password: "",
        accountType: "normal",
    }); // Note that state will be out of date for fields with autoFields on
    const [autoFields, setAutoFields] = useState({ fullName: true, preferredName: true, username: true });
    const [scriptPrompts, setScriptPrompts] = useState(false);
    const script = {
        givenName: "(\"What's your full name?\" & context\u2014incl. middle names)",
        familyName: "(\"So your [last]? name is...?\")",
        fullName: "(Edit from default based on earlier response)",
        preferredName: "(Confirm default with \"And we should call you...?\")",
        username: "(Prefer autofilled for consistency)"
    }
    function suggestUsername(user: typeof userInfo): string {
        let suggestion = user.givenName && user.givenName.trim()[0] + user.familyName.replaceAll(/[^\w_]+/g, "");
        if (suggestion.length < 4) {
            const concat = user.givenName.replaceAll(/[^\w_]+/g, "") + user.familyName.replaceAll(/[^\w_]+/g, "");
            suggestion = concat;
        }
        if (suggestion.length > 9) {
            const initialized = (
                user.givenName.replaceAll(/[^\w_]+/g, " ")
                    .split(" ")[0]
                + user.familyName.replaceAll(/[^\w_]+/g, " ")
                    .split(" ")
                    .reduce((accumulator, segment) => accumulator + segment[0], "")
            );
            console.log(initialized);
            if (initialized.length < suggestion.length) {
                suggestion = initialized;
            }
        }
        return suggestion.toLowerCase();
    }
    return (
        <Center>
            <Box miw="min(70%, 40rem)">
                <Text component="h1" fw="bold" size="lg" mb="md">Create user account</Text>
                <Text fs="italic">Note: temporarily available without actor authentication.</Text>
                <Checkbox
                    label="Show script prompts"
                    checked={scriptPrompts}
                    onChange={(e) => setScriptPrompts(e.currentTarget.checked)}
                    mb="sm"
                />
                <Form method="post">
                    <Fieldset legend="Name">
                        <Group align="start">
                            <TextInput
                                flex={1}
                                label={`Given ${scriptPrompts ? script.givenName : ""}`.trimEnd()}
                                name="givenName"
                                autoComplete="off"
                                required
                                onChange={e => setUserInfo({ ...userInfo, givenName: e.currentTarget.value })}
                                value={userInfo.givenName}
                                error={actionData?.errors?.fields.givenName}
                            />
                            <TextInput
                                label={`Family ${scriptPrompts ? script.familyName : ""}`.trimEnd()}
                                name="familyName"
                                autoComplete="off"
                                required
                                onChange={e => setUserInfo({ ...userInfo, familyName: e.currentTarget.value })}
                                value={userInfo.familyName}
                                error={actionData?.errors?.fields.familyName}
                            />
                        </Group>
                        <Group align="end">
                            <TextInput
                                flex={1}
                                label={`Full ${scriptPrompts ? script.fullName : ""}`.trimEnd()}
                                name="fullName"
                                autoComplete="off"
                                required
                                onChange={(e) => {
                                    setUserInfo({ ...userInfo, fullName: e.currentTarget.value });
                                    setAutoFields({ ...autoFields, fullName: false });
                                }}
                                value={autoFields.fullName ? `${userInfo.givenName} ${userInfo.familyName}`.trim() : userInfo.fullName}
                                error={actionData?.errors?.fields.fullName}
                            />
                            {!autoFields.fullName &&
                                <Button
                                    variant="subtle"
                                    color="grey"
                                    px="xs"
                                    leftSection={<IconArrowBackUp />}
                                    onClick={() => setAutoFields({ ...autoFields, fullName: true })}
                                >
                                    Default
                                </Button>
                            }
                        </Group>
                        <Group align="end">
                            <TextInput
                                flex={1}
                                label={`Preferred ${scriptPrompts ? script.preferredName : ""}`.trimEnd()}
                                name="preferredName"
                                autoComplete="off"
                                required
                                onChange={(e) => {
                                    setUserInfo({ ...userInfo, preferredName: e.currentTarget.value });
                                    setAutoFields({ ...autoFields, preferredName: false });
                                }}
                                value={autoFields.preferredName ? userInfo.givenName.split(" ")[0] : userInfo.preferredName}
                                error={actionData?.errors?.fields.preferredName}
                            />
                            {!autoFields.preferredName &&
                                <Button
                                    variant="subtle"
                                    color="grey"
                                    px="xs"
                                    leftSection={<IconArrowBackUp />}
                                    onClick={() => setAutoFields({ ...autoFields, preferredName: true })}
                                >
                                    Default
                                </Button>
                            }
                        </Group>
                    </Fieldset>
                    <Fieldset legend="Login information">
                        <Group align="end">
                            <TextInput
                                flex={1}
                                label={`Username ${scriptPrompts ? script.username : ""}`.trimEnd()}
                                name="username"
                                autoComplete="off"
                                required
                                onChange={(e) => {
                                    setUserInfo({ ...userInfo, username: e.currentTarget.value });
                                    setAutoFields({ ...autoFields, username: false });
                                }}
                                value={autoFields.username ? suggestUsername(userInfo) : userInfo.username}
                                error={actionData?.errors?.fields.username}
                            />
                            {!autoFields.username &&
                                <Button
                                    variant="subtle"
                                    color="grey"
                                    px="xs"
                                    leftSection={<IconArrowBackUp />}
                                    onClick={() => setAutoFields({ ...autoFields, username: true })}
                                >
                                    Default
                                </Button>
                            }
                        </Group>
                        <PasswordInput
                            label="Password"
                            name="password"
                            autoComplete="off"
                            required
                            onChange={e => setUserInfo({ ...userInfo, password: e.currentTarget.value })}
                            value={userInfo.password}
                            error={actionData?.errors?.fields.password}
                        />
                    </Fieldset>
                    <details>
                        <summary>Change account type</summary>
                        <Fieldset legend="Account type">
                            <SegmentedControl
                                value={userInfo.accountType}
                                onChange={(accountType) => {
                                    if (accountType == "normal" || accountType == "librarian" || accountType == "admin") {
                                        setUserInfo({ ...userInfo, accountType });
                                    } else {
                                        console.warn(`Not setting unknown account type "${accountType}"`)
                                    }
                                }}
                                data={[
                                    { label: "Patron", value: "normal" },
                                    { label: "Librarian", value: "librarian" },
                                    { label: "Admin", value: "admin" },
                                ]}
                            />
                            {userInfo.accountType != "normal" &&
                                <Text fw="bold">Are you sure? Is this account for a staff member?</Text>
                            }
                            <input
                                type="hidden"
                                name="accountType"
                                value={userInfo.accountType}
                            />
                        </Fieldset>
                    </details>
                    <Button mt="sm" type="submit" rightSection={<IconChevronRight />}>
                        Create{userInfo.accountType != "normal" && " staff"} account
                    </Button>
                    {actionData?.errors && actionData.errors.global.length > 0 && <>
                        <Text fw="bold">
                            Unexpected error{actionData.errors.global.length != 1 && "s"} while creating user
                        </Text>
                        <details>
                            <List size="sm">
                                {actionData.errors.global.map(message => <List.Item>{message}</List.Item>)}
                            </List>
                        </details>
                        <Text fs="italic">Please reload the page and try again, or contact your IT administrator.</Text>
                    </>}
                </Form>
            </Box>
        </Center>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    let hasErrors = false;
    let errors = {
        global: [],
        fields: {
            givenName: "",
            familyName: "",
            fullName: "",
            preferredName: "",
            username: "",
            password: "",
            accountType: "",
        },
    } as {
        global: string[],
        fields: { [fieldName in keyof UserInfo]: string }
    };
    function addError(location: keyof UserInfo | "global", message: string) {
        if (location == "global") {
            errors.global.push(message);
        } else {
            errors.fields[location] = errors.fields[location] || message;
        }
        hasErrors = true;
    }

    // ## Check data presence ##
    const formData = await request.formData();

    const formFields = Object.keys(errors.fields).reduce((accumulator, untypedFieldName) => {
        // Looks like the DT typings can't do this this automatically yet, or I don't fully understand Object.keys().
        const fieldName = untypedFieldName as keyof UserInfo;

        const field = formData.get(fieldName);
        if (typeof field != "string") {
            addError("global", `Server: got unexpected type ${typeof field} for ${fieldName}.`);
            return accumulator;
        }
        if (field.length == 0) {
            addError(fieldName, "This field is required.")
            return accumulator;
        }
        return { ...accumulator, [fieldName]: field };
    }, {} as { [fieldName in keyof UserInfo]?: string });

    if (hasErrors) {
        return json({ errors });
    }

    // ## Check basic requirements ##
    if (!(
        formFields.accountType == "normal" ||
        formFields.accountType == "librarian" ||
        formFields.accountType == "admin"
    )) {
        addError("global", `Server: got unexpected value ${formFields.accountType} for account type.`);
    }
    // At this point, we've assembled a complete userInfo object! Update re-assign with stricter types.
    const userInfo = formFields as UserInfo;

    if (userInfo.username.length < 4) {
        addError("username", "Must be at least 4 characters.");
    }

    if (hasErrors) {
        return json({ errors });
    }

    // ## Check actor permissions ##
    // Check actor session again here?
    // We need to check if actor is admin if trying to create a librarian / admin type.

    // ## Check availibility ##
    if (await prisma.user.findFirst({
        where: { loginName: userInfo.username }
    }) != null) {
        addError("username", "Username already taken.");
    }

    if (hasErrors) {
        return json({ errors });
    }

    // ## Woo hoo! Create the user now! ##
    // TODO definitiely log this action.
    // TODO implement tokens or something; the user shouldn't be setting a password now.
    const newCredential = createUsernamePasswordCredential("Initial password", userInfo.password)

    await prisma.user.create({
        data: {
            givenName: userInfo.givenName,
            familyName: userInfo.familyName,
            fullName: userInfo.fullName,
            preferredName: userInfo.preferredName,
            loginName: userInfo.username,
            isAdmin: userInfo.accountType == "admin",
            isLibrarian: userInfo.accountType == "admin" || userInfo.accountType == "librarian",
            credentials: {
                create: [
                    newCredential
                ]
            }
        }
    });

    return redirect(`/staff/users/${userInfo.username}`);
}

export async function loader({ request }: LoaderFunctionArgs) {
    // Do librarian check here
    return null;
}
