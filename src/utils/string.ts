import crypto from 'node:crypto';

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex"); // generate random salt
  const iterations = 100_000; // number of iterations
  const keylen = 64; // length of the derived key
  const digest = "sha512"; // hash algorithm

  const hash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString("hex");

  return {
    salt,
    hash,
    iterations,
    keylen,
    digest,
  };
}

export function verifyPassword(password: string, hashData: ReturnType<typeof hashPassword>) {
  const { salt, hash, iterations, keylen, digest } = hashData;
  const derivedHash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest).toString("hex");
  return derivedHash === hash;
}
