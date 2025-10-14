import nacl from "tweetnacl";
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from "tweetnacl-util";

const secretKey = import.meta.env.VITE_ENCRYPTION_KEY;

if (!secretKey) {
  throw new Error("VITE_ENCRYPTION_KEY is not defined");
}

const secretKeyBytes = decodeBase64(secretKey);

export const encryptData = (data: string) => {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const dataBytes = decodeUTF8(data);
  const box = nacl.secretbox(dataBytes, nonce, secretKeyBytes);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  return encodeBase64(fullMessage);
};

export const decryptData = (encryptedData: string) => {
  const dataWithNonce = decodeBase64(encryptedData);
  const nonce = dataWithNonce.slice(0, nacl.secretbox.nonceLength);
  const message = dataWithNonce.slice(
    nacl.secretbox.nonceLength,
    dataWithNonce.length
  );

  const decrypted = nacl.secretbox.open(message, nonce, secretKeyBytes);

  if (!decrypted) {
    throw new Error("Failed to decrypt data");
  }

  return encodeUTF8(decrypted);
};

export const generateSecretKey = () => {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return encodeBase64(key);
};