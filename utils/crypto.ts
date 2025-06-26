import { SHA256, enc } from 'crypto-js';
import { randomBytes } from 'crypto';
import { authConfig } from '../config/auth.config';

export class CryptoUtil {
  static generateSalt(length: number = authConfig.password.saltLength): string {
    return randomBytes(length).toString('hex');
  }

  static hashPassword(password: string, salt: string): string {
    return SHA256(password + salt).toString(enc.Hex);
  }

  static verifyPassword(password: string, salt: string, hash: string): boolean {
    const computedHash = this.hashPassword(password, salt);
    return computedHash === hash;
  }
} 