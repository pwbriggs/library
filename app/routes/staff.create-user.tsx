import {
    Box,
    Button,
    Center,
    Checkbox,
    Fieldset,
    Group,
    List,
    PasswordInput,
    SegmentedControl,
    Text,
    TextInput,
} from "@mantine/core";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
    Form,
    type MetaFunction,
    json,
    redirect,
    useActionData,
    useLoaderData,
} from "@remix-run/react";
import { IconArrowBackUp, IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { auth } from "~/scripts/auth.server";
import {
    type CreateUserErrors,
    type UserInfo,
    createUserFromForm,
} from "~/scripts/create-user.server";

export const meta: MetaFunction = () => {
    return [{ title: "Create user" }];
};

enum AccountType {
    Normal = "normal",
    Librarian = "librarian",
    Admin = "admin",
}

export default function CreateUser() {
    const actionData = useActionData<typeof action>();
    const { actor } = useLoaderData<typeof loader>();
    const [accountType, setAccountType] = useState(AccountType.Normal);
    const [scriptPrompts, setScriptPrompts] = useState(false);
    return (
        <Center>
            <Box miw="min(70%, 40rem)">
                <Text component="h1" fw="bold" size="lg" mb="md">
                    Create user account
                </Text>
                <Checkbox
                    label="Show script prompts"
                    checked={scriptPrompts}
                    onChange={(e) => setScriptPrompts(e.currentTarget.checked)}
                    mb="sm"
                />
                <Form method="post">
                    <CollectUserInfo
                        errors={actionData?.errors}
                        scriptPrompts={scriptPrompts}
                    />
                    <details>
                        <summary>Change account type</summary>
                        <Fieldset legend="Account type">
                            {!actor?.isAdmin && (
                                <Text fs="italic" c="red">
                                    This option is only available to admins.
                                </Text>
                            )}
                            <SegmentedControl
                                value={accountType}
                                onChange={(accountType) => {
                                    setAccountType(accountType as AccountType);
                                }}
                                data={[
                                    { label: "Patron", value: "normal" },
                                    { label: "Librarian", value: "librarian" },
                                    { label: "Admin", value: "admin" },
                                ]}
                                disabled={!actor?.isAdmin}
                                my="sm"
                            />
                            {accountType !== AccountType.Normal && (
                                <Text fw="bold" c="red">
                                    Are you sure? Is this account for a staff
                                    member?
                                </Text>
                            )}
                            <input
                                type="hidden"
                                name="accountType"
                                value={accountType}
                            />
                        </Fieldset>
                    </details>
                    <Button
                        mt="sm"
                        type="submit"
                        rightSection={<IconChevronRight />}
                        color={
                            accountType !== AccountType.Normal
                                ? "red"
                                : undefined
                        }
                    >
                        Create{accountType !== AccountType.Normal && " staff"}{" "}
                        account
                    </Button>
                    {actionData?.errors &&
                        actionData.errors.global.length > 0 && (
                            <>
                                <Text fw="bold">
                                    Unexpected error
                                    {actionData.errors.global.length !== 1 &&
                                        "s"}{" "}
                                    while creating user
                                </Text>
                                <details>
                                    <List size="sm">
                                        {actionData.errors.global.map(
                                            (message) => (
                                                <List.Item key={message}>
                                                    {message}
                                                </List.Item>
                                            ),
                                        )}
                                    </List>
                                </details>
                                <Text fs="italic">
                                    Please reload the page and try again, or
                                    contact your IT administrator.
                                </Text>
                            </>
                        )}
                </Form>
            </Box>
        </Center>
    );
}

export function CollectUserInfo({
    scriptPrompts,
    errors,
}: { scriptPrompts?: boolean; errors?: CreateUserErrors }) {
    const [userInfo, setUserInfo] = useState<UserInfo>({
        givenName: "",
        familyName: "",
        fullName: "",
        preferredName: "",
        username: "",
        password: "",
        accountType: "normal",
    }); // Note that state will be out of date for fields with autoFields on
    const [autoFields, setAutoFields] = useState({
        fullName: true,
        preferredName: true,
        username: true,
    });

    const script = {
        givenName:
            '("What\'s your full name?" & context\u2014incl. middle names)',
        familyName: '("So your [last]? name is...?")',
        fullName: "(Edit from default based on earlier response)",
        preferredName: '(Confirm default with "And we should call you...?")',
        username: "(Prefer autofilled for consistency)",
    };

    function suggestUsername(user: UserInfo): string {
        // Simple algorithm for suggesting short usernames
        let suggestion =
            user.givenName &&
            user.givenName.trim()[0] +
                user.familyName.replaceAll(/[^\w_]+/g, "");
        if (suggestion.length < 4) {
            const concat =
                user.givenName.replaceAll(/[^\w_]+/g, "") +
                user.familyName.replaceAll(/[^\w_]+/g, "");
            suggestion = concat;
        }
        if (suggestion.length > 9) {
            const initialized =
                user.givenName.replaceAll(/[^\w_]+/g, " ").split(" ")[0] +
                user.familyName
                    .replaceAll(/[^\w_]+/g, " ")
                    .split(" ")
                    .reduce(
                        (accumulator, segment) => accumulator + segment[0],
                        "",
                    );
            if (initialized.length < suggestion.length) {
                suggestion = initialized;
            }
        }
        return suggestion.toLowerCase();
    }

    return (
        <>
            <Fieldset legend="Name">
                <Group align="start">
                    <TextInput
                        flex={1}
                        label={`Given ${scriptPrompts ? script.givenName : ""}`.trimEnd()}
                        name="givenName"
                        autoComplete="off"
                        required
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                givenName: e.currentTarget.value,
                            })
                        }
                        value={userInfo.givenName}
                        error={errors?.fields.givenName}
                    />
                    <TextInput
                        flex={scriptPrompts ? undefined : 1}
                        label={`Family ${scriptPrompts ? script.familyName : ""}`.trimEnd()}
                        name="familyName"
                        autoComplete="off"
                        required
                        onChange={(e) =>
                            setUserInfo({
                                ...userInfo,
                                familyName: e.currentTarget.value,
                            })
                        }
                        value={userInfo.familyName}
                        error={errors?.fields.familyName}
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
                            setUserInfo({
                                ...userInfo,
                                fullName: e.currentTarget.value,
                            });
                            setAutoFields({ ...autoFields, fullName: false });
                        }}
                        value={
                            autoFields.fullName
                                ? `${userInfo.givenName} ${userInfo.familyName}`.trim()
                                : userInfo.fullName
                        }
                        error={errors?.fields.fullName}
                    />
                    {!autoFields.fullName && (
                        <Button
                            variant="subtle"
                            color="grey"
                            px="xs"
                            leftSection={<IconArrowBackUp />}
                            onClick={() =>
                                setAutoFields({ ...autoFields, fullName: true })
                            }
                        >
                            Default
                        </Button>
                    )}
                </Group>
                <Group align="end">
                    <TextInput
                        flex={1}
                        label={`Preferred ${scriptPrompts ? script.preferredName : ""}`.trimEnd()}
                        name="preferredName"
                        autoComplete="off"
                        required
                        onChange={(e) => {
                            setUserInfo({
                                ...userInfo,
                                preferredName: e.currentTarget.value,
                            });
                            setAutoFields({
                                ...autoFields,
                                preferredName: false,
                            });
                        }}
                        value={
                            autoFields.preferredName
                                ? userInfo.givenName.split(" ")[0]
                                : userInfo.preferredName
                        }
                        error={errors?.fields.preferredName}
                    />
                    {!autoFields.preferredName && (
                        <Button
                            variant="subtle"
                            color="grey"
                            px="xs"
                            leftSection={<IconArrowBackUp />}
                            onClick={() =>
                                setAutoFields({
                                    ...autoFields,
                                    preferredName: true,
                                })
                            }
                        >
                            Default
                        </Button>
                    )}
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
                            setUserInfo({
                                ...userInfo,
                                username: e.currentTarget.value,
                            });
                            setAutoFields({ ...autoFields, username: false });
                        }}
                        value={
                            autoFields.username
                                ? suggestUsername(userInfo)
                                : userInfo.username
                        }
                        error={errors?.fields.username}
                    />
                    {!autoFields.username && (
                        <Button
                            variant="subtle"
                            color="grey"
                            px="xs"
                            leftSection={<IconArrowBackUp />}
                            onClick={() =>
                                setAutoFields({ ...autoFields, username: true })
                            }
                        >
                            Default
                        </Button>
                    )}
                </Group>
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="off"
                    required
                    onChange={(e) =>
                        setUserInfo({
                            ...userInfo,
                            password: e.currentTarget.value,
                        })
                    }
                    value={userInfo.password}
                    error={errors?.fields.password}
                />
            </Fieldset>
        </>
    );
}

export async function action({ request }: ActionFunctionArgs) {
    const { hasErrors, errors, username } = await createUserFromForm(
        await request.formData(),
        request,
    );
    if (hasErrors) {
        return json({ errors });
    }
    return redirect(`/staff/users/${username}`);
}

export async function loader({ request }: LoaderFunctionArgs) {
    return json({ actor: await auth.isAuthenticated(request) });
}
