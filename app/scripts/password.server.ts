import { Credential } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getNewCredential } from "~/scripts/auth.server";

export type UsernamePasswordCredJson = {
    hash: string;
}

export type UsernamePasswordCred = Credential & { json: UsernamePasswordCredJson }

export function createUsernamePasswordCredential(title: string, password: string) {
    return getNewCredential<UsernamePasswordCredJson>(
        title,
        "USERNAME_PASSWORD",
        { hash: bcrypt.hashSync(password) }
    );
}

export async function loginUsernamePassword(credentials: UsernamePasswordCred[], password: string) {
    if (credentials.length == 0) {
        throw Error("noPasswords");
    }
    for (const credential of credentials) {
        if (bcrypt.compareSync(password, credential.json.hash)) {
            return;
        }
    }
    throw Error("badPassword");
}
