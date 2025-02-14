import { auth } from "~/scripts/auth.server";
import { createUsernamePasswordCredential } from "~/scripts/auth/password.server";
import { prisma } from "~/scripts/prisma.server";

export type UserInfo = {
    givenName: string;
    familyName: string;
    fullName: string;
    preferredName: string;
    username: string;
    password: string;
    accountType: "normal" | "librarian" | "admin";
};

export type CreateUserErrors = {
    global: string[];
    fields: { [fieldName in keyof UserInfo]: string };
};

// enum AuthMode {
//     Session,
//     SetupOtp,
// }

export async function createUserFromForm(
    formData: FormData,
    requestForAuth: Request,
    setupOverride?: boolean,
) {
    let hasErrors = false;
    const errors = {
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
    } as CreateUserErrors;
    function addError(location: keyof UserInfo | "global", message: string) {
        if (location === "global") {
            errors.global.push(message);
        } else {
            errors.fields[location] = errors.fields[location] || message;
        }
        hasErrors = true;
    }

    // ## Check data presence ##
    const formFields = {} as Partial<UserInfo>;
    for (const untypedFieldName in errors.fields) {
        const fieldName = untypedFieldName as keyof UserInfo;
        const field = formData.get(fieldName);

        if (fieldName === "accountType") {
            // Special handling for more restricted value, & special logic for setupOverride.
            const accountTypeField = field?.toString();

            if (setupOverride) {
                formFields.accountType = "admin";
                continue;
            }

            if (
                accountTypeField === "normal" ||
                accountTypeField === "librarian" ||
                accountTypeField === "admin"
            ) {
                formFields.accountType = accountTypeField;
            } else {
                addError(
                    "global",
                    `Server: got unexpected value ${accountTypeField} for account type.`,
                );
            }
            continue;
        }

        if (typeof field !== "string") {
            addError(
                "global",
                `Server: got unexpected type ${typeof field} for ${fieldName}.`,
            );
            continue;
        }
        if (field.length === 0) {
            addError(fieldName, "This field is required.");
            continue;
        }

        formFields[fieldName] = field;
    }

    if (hasErrors) {
        return { hasErrors, errors };
    }

    // At this point, we've assembled a complete userInfo object! Update re-assign with stricter types.
    const userInfo = formFields as UserInfo;

    if (userInfo.username.length < 4) {
        addError("username", "Must be at least 4 characters.");
    }

    if (hasErrors) {
        return { hasErrors, errors };
    }

    // ## Check actor permissions ##
    // let authMode: AuthMode; log this?
    const actor = await auth.isAuthenticated(requestForAuth);
    if (
        actor?.isLibrarian &&
        (userInfo.accountType === "normal" || actor.isAdmin)
    ) {
        // authMode = AuthMode.Session;
    } else if (setupOverride) {
        // authMode = AuthMode.SetupOtp;
    } else {
        return { hasErrors: true, errors };
    }

    // ## Check availability ##
    if (
        (await prisma.user.findFirst({
            where: { loginName: userInfo.username },
        })) != null
    ) {
        addError("username", "Username already taken.");
    }

    if (hasErrors) {
        return { hasErrors, errors };
    }

    // ## Woo hoo! Create the user now! ##
    // TODO definitely log this action.
    // TODO implement tokens or something; the user shouldn't be setting a password now.
    const newCredential = createUsernamePasswordCredential(
        "Initial password",
        userInfo.password,
    );

    await prisma.user.create({
        data: {
            givenName: userInfo.givenName,
            familyName: userInfo.familyName,
            fullName: userInfo.fullName,
            preferredName: userInfo.preferredName,
            loginName: userInfo.username,
            isAdmin: userInfo.accountType === "admin",
            isLibrarian:
                userInfo.accountType === "admin" ||
                userInfo.accountType === "librarian",
            credentials: {
                create: [newCredential],
            },
        },
    });

    return { hasErrors: false, username: userInfo.username };
}
