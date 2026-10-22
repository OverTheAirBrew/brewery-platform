'use strict';
import { pbkdf2, randomBytes } from 'crypto';

const PASSWORD_LENGTH = 256;
const SALT_LENGTH = 64;
const ITERATIONS = 10000;
const DIGEST = 'sha256';
const BYTE_TO_STRING_ENCODING = 'hex'; // this could be base64, for instance

export const generateHashPassword = (
  password: string,
): Promise<{ salt: string; hash: string }> => {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(SALT_LENGTH).toString(BYTE_TO_STRING_ENCODING);

    pbkdf2(
      password,
      salt,
      ITERATIONS,
      PASSWORD_LENGTH,
      DIGEST,
      (error: any, hash: Buffer<ArrayBuffer>) => {
        if (error) {
          reject(error);
        } else {
          resolve({ salt, hash: hash.toString(BYTE_TO_STRING_ENCODING) });
        }
      },
    );
  });
};

export const verifyPassword = function (
  persistedPassword: { salt: string; hash: string },
  passwordAttempt: string,
) {
  return new Promise((resolve, reject) => {
    pbkdf2(
      passwordAttempt,
      persistedPassword.salt,
      ITERATIONS,
      PASSWORD_LENGTH,
      DIGEST,
      (error: any, hash: Buffer<ArrayBuffer>) => {
        if (error) {
          reject(error);
        } else {
          resolve(
            persistedPassword.hash === hash.toString(BYTE_TO_STRING_ENCODING),
          );
        }
      },
    );
  });
};
