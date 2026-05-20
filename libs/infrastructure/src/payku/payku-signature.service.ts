import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { PaykuConfig } from './interfaces/payku-config.interface';

@Injectable()
export class PaykuSignatureService {
  constructor(
    @Inject('PAYKU_CONFIG') private readonly config: PaykuConfig,
  ) {}

  /**
   * Generate HMAC-SHA256 signature for Payku API requests.
   *
   * Algorithm (from Payku docs):
   * 1. URL-encode the request path
   * 2. Sort body keys alphabetically
   * 3. Exclude keys whose values are objects or arrays
   * 4. Format as URL params: key=encodeURIComponent(value) joined with '&'
   * 5. Concatenate: encodedPath + '&' + urlParams
   * 6. HMAC-SHA256 with private token as key
   */
  sign(requestPath: string, body: Record<string, unknown>): string {
    const encodedPath = encodeURIComponent(requestPath);

    const sortedKeys = Object.keys(body).sort();
    const filteredParams: Record<string, string> = {};

    for (const key of sortedKeys) {
      const value = body[key];
      if (
        typeof value !== 'object' ||
        value === null
      ) {
        filteredParams[key] = String(value);
      }
    }

    const urlParams = new URLSearchParams(filteredParams).toString();
    const concat = encodedPath + '&' + urlParams;

    return crypto
      .createHmac('sha256', this.config.privateToken)
      .update(concat)
      .digest('hex');
  }
}
