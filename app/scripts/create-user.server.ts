import { prisma } from "~/scripts/prisma.server";
import { createUsernamePasswordCredential } from "~/scripts/password.server";
import { checkOtp } from "./setup.server";
import { auth } from "./auth.server";

export type UserInfo = {
    givenName: string,
    familyName: string,
    fullName: string,
    preferredName: string,
    username: string,
    password: string,
    accountType: "normal" | "librarian" | "admin",
}

export type CreateUserErrors = {
    global: string[],
    fields: { [fieldName in keyof UserInfo]: string },
}

// enum AuthMode {
//     Session,
//     SetupOtp,
// }

export async function createUserFromForm(formData: FormData, requestForAuth: Request, setupOverride?: boolean) {
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
        if (location == "global") {
            errors.global.push(message);
        } else {
            errors.fields[location] = errors.fields[location] || message;
        }
        hasErrors = true;
    }

    // ## Check data presence ##
    const formFields = Object.keys(errors.fields).reduce((accumulator, untypedFieldName) => {
        // Looks like the DT typings can't do this this automatically yet, or I don't fully understand Object.keys().
        const fieldName = untypedFieldName as keyof UserInfo;

        if (setupOverride && fieldName == "accountType") {
            return { ...accumulator, accountType: "admin" } as Partial<UserInfo>;
        }

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
    }, {} as Partial<UserInfo>);

    if (hasErrors) {
        return { hasErrors, errors }
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
        return { hasErrors, errors };
    }

    // ## Check actor permissions ##
    // let authMode: AuthMode; log this?
    const otp = formData.get("otp");
    const actor = await auth.isAuthenticated(requestForAuth);
    if (actor && actor.isLibrarian && (userInfo.accountType == "normal" || actor.isAdmin)) {
        // authMode = AuthMode.Session;
    } else if (setupOverride && typeof otp === "string" && checkOtp(otp)) {
        // authMode = AuthMode.SetupOtp;
    } else {
        return { hasErrors: true, errors }
    }

    // ## Check availibility ##
    if (await prisma.user.findFirst({
        where: { loginName: userInfo.username }
    }) != null) {
        addError("username", "Username already taken.");
    }

    if (hasErrors) {
        return { hasErrors, errors };
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

    return { hasErrors: false, username: userInfo.username };
}
