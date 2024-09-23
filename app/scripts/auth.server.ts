import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/scripts/session.server";
import { prisma } from "~/scripts/prisma.server";

import { FormStrategy } from "remix-auth-form";
import { loginUsernamePassword, UsernamePasswordCred } from "~/scripts/password.server";
import { CredentialType, User, Prisma } from "@prisma/client";

export const auth = new Authenticator<User>(sessionStorage);

auth.use(
    new FormStrategy(async ({ form }) => {
        const username = String(form.get("username"));
        const password = String(form.get("password"));
        console.log("Username & pass login")
        const user = await getUserWithCredentialsOrThrow<UsernamePasswordCred>(username, "USERNAME_PASSWORD");
        await loginUsernamePassword(user.credentials, password); // Throws on error
        return user;
    }),
    "usernamePassword",
);

async function getUserWithCredentialsOrThrow<CredType>(username: string, credentialType: CredentialType) {
    let user;
    try {
        user = await prisma.user.findUniqueOrThrow({
            where: { loginName: username },
            include: {
                credentials: {
                    where: { type: credentialType }
                }
            }
        })
    } catch {
        throw Error("badUsername")
    }
    return user as User & { credentials: CredType[] };
}

// sorry, crazy typescript stuff here.
export function getNewCredential<CredJson extends Prisma.JsonObject>(
    title: string,
    type: CredentialType,
    json: CredJson,
): Prisma.CredentialCreateInput {
    return { title, type, json };
}

export async function addCredential(user: User, cred: Prisma.CredentialCreateInput, actor?: User) {
    await prisma.user.update({
        where: { id: user.id },
        data: {
            credentials: { create: cred }
        }
    })
}
