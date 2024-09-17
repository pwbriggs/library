import cryptoRandomString from 'crypto-random-string';

export function genOtp() {
    return cryptoRandomString({ length: 6, type: 'distinguishable' });
}
