import { genOtp } from "~/scripts/otp.server";
import { prisma } from "~/scripts/prisma.server";
import bcrypt from "bcryptjs";

let showAppSetup: boolean = false;
let appSetupCodeHash: string;

declare global {
    var showAppSetup: boolean;
    var appSetupCodeHash: string;
}

export async function bootstrapAccount() {
    // if (!await prisma.user.findFirst({
    //     where: { isAdmin: true }
    // })) {
    //     console.warn("> No admins found. Initializing setup flow.");
    //     showAppSetup = true;
    //     const otp = genOtp();
    //     appSetupCodeHash = bcrypt.hashSync(otp)
    //     console.warn("> Please open the website, and enter the following code when prompted:")
    //     console.warn("> " + otp);
    // } else {
    //     console.log("Admin account found.");
    //     showAppSetup = false;
    // }
    showAppSetup = false;
}

export function checkOtp(given: string) {
    return bcrypt.compareSync(given, appSetupCodeHash);
}

export { showAppSetup };
