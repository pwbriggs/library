import cryptoRandomString from 'crypto-random-string';
import bcrypt from "bcryptjs";

export function genOtp() {
    const otp = cryptoRandomString({ length: 6, type: 'distinguishable' });
    const hash = bcrypt.hashSync(otp);
    return { otp, hash };
}

export function checkOtp(given: string, hash: string) {
    return bcrypt.compareSync(given, hash);
}
