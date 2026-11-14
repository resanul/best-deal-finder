/**
 * Bangladeshi Physical Tech & Electronics Price Comparison Platform
 * Stealth Throttling, Browser Header Emulation, Domain Concurrency & Backoff Engine
 * 
 * Location: src/scraper/stealth.ts
 */

import { StealthFetchResult } from './types';

/**
 * Generates realistic modern desktop Google Chrome headers for Windows 10/11,
 * including full Chromium Client Hints (Sec-Ch-Ua, Sec-Fetch-*).
 */
export function generateStealthHeaders(domain: string, referer?: string): Record<string, string> {
  const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
  const ref = referer || `https://${cleanDomain}/`;

  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
    'Accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,bn;q=0.8',
    'Sec-Ch-Ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    'Referer': ref,
  };
}

/**
 * Calculates a randomized jitter delay strictly within [minDelayMs, maxDelayMs].
 * Handles zero/negative inputs and identical bounds deterministically.
 */
export function calculateJitterDelay(
  minDelayMs: number,
  maxDelayMs: number,
  rng: () => number = Math.random
): number {
  const min = Math.max(0, minDelayMs);
  const max = Math.max(0, maxDelayMs);
  if (min >= max) return min;
  return Math.round(min + rng() * (max - min));
}

/**
 * Asynchronously sleeps for a randomized jitter duration.
 */
export async function randomDelay(
  minMs = 1500,
  maxMs = 4500
): Promise<number> {
  const delay = calculateJitterDelay(minMs, maxMs);
  if (delay > 0) {
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return delay;
}

/**
 * Computes exponential backoff interval scaled by retry attempt with optional jitter.
 * delay = initialDelayMs * 2^attempt + jitterMs
 */
export function calculateBackoffDelay(
  initialDelayMs: number,
  attempt: number,
  jitterMs = 0
): number {
  return Math.round(initialDelayMs * Math.pow(2, attempt) + jitterMs);
}

/**
 * Detects whether an HTTP response is a Cloudflare Challenge / Turnstile gate.
 */
export function detectCloudflareChallenge(
  headers: Record<string, string> | Headers,
  body: string
): boolean {
  // Check headers (case-insensitive)
  if (headers instanceof Headers) {
    if (headers.get('cf-mitigated') === 'challenge') return true;
  } else {
    for (const [key, value] of Object.entries(headers)) {
      if (key.toLowerCase() === 'cf-mitigated' && value.toLowerCase().includes('challenge')) {
        return true;
      }
    }
  }

  // Check HTML body for Turnstile / Challenge markers
  if (
    /cf-turnstile|cf_chl_prog|challenges\.cloudflare\.com|Cloudflare Ray ID/i.test(
      body
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Per-Domain Concurrency Queue Limiter.
 * Guarantees that outgoing requests to the exact same host domain are strictly serialized
 * (concurrency = 1 per host), while requests to distinct hosts execute concurrently.
 */
export class DomainConcurrencyLimiter {
  private hostQueues = new Map<string, Promise<void>>();

  /**
   * Acquires a serialized lock for the specified host domain.
   * Returns a release callback function that MUST be invoked when the request finishes.
   */
  async acquire(domain: string): Promise<() => void> {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');
    const currentQueue = this.hostQueues.get(cleanDomain) || Promise.resolve();

    let releaseCallback: () => void;
    const nextQueue = new Promise<void>(resolve => {
      releaseCallback = resolve;
    });

    this.hostQueues.set(cleanDomain, nextQueue);

    await currentQueue;

    return () => {
      releaseCallback();
      // Clean up queue if no further tasks are queued
      if (this.hostQueues.get(cleanDomain) === nextQueue) {
        this.hostQueues.delete(cleanDomain);
      }
    };
  }

  /**
   * Returns current number of active domain queues.
   */
  getActiveQueuesCount(): number {
    return this.hostQueues.size;
  }
}

// Global concurrency singleton for the scraping process
export const defaultDomainLimiter = new DomainConcurrencyLimiter();

export interface StealthFetchOptions {
  stealth?: boolean;
  minDelayMs?: number;
  maxDelayMs?: number;
  maxRetries?: number;
  timeoutMs?: number;
  limiter?: DomainConcurrencyLimiter;
}

/**
 * Executes an HTTP GET request with full stealth protection:
 * - Domain-level concurrency serialization (1 request per host at a time)
 * - Randomized human jitter delay before dispatch
 * - Modern Chrome Client Hints headers
 * - Exponential backoff retry on transient 429/503 errors
 * - Cloudflare challenge detection with graceful abort
 */
export async function fetchWithStealth(
  url: string,
  options: StealthFetchOptions = {}
): Promise<StealthFetchResult> {
  const {
    stealth = true,
    minDelayMs = 1500,
    maxDelayMs = 4500,
    maxRetries = 3,
    timeoutMs = 15000,
    limiter = defaultDomainLimiter,
  } = options;

  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    throw new Error(`Invalid URL provided to fetchWithStealth: ${url}`);
  }

  const domain = urlObj.hostname;
  const releaseLock = await limiter.acquire(domain);

  let totalDelayApplied = 0;
  let retries = 0;

  try {
    // 1. Apply human-like jitter before dispatching if stealth enabled
    if (stealth) {
      const delay = await randomDelay(minDelayMs, maxDelayMs);
      totalDelayApplied += delay;
    }

    const headers = generateStealthHeaders(domain);

    while (true) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const body = await response.text();
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((v, k) => {
          responseHeaders[k.toLowerCase()] = v;
        });

        const isChallenge = detectCloudflareChallenge(responseHeaders, body);

        // If Cloudflare challenge detected, return immediately without retrying
        if (isChallenge) {
          return {
            ok: false,
            status: response.status,
            statusText: response.statusText,
            url,
            html: body,
            headers: responseHeaders,
            isChallenge: true,
            retries,
            delayAppliedMs: totalDelayApplied,
          };
        }

        // Check if rate limited (429) or service unavailable (503)
        if ((response.status === 429 || response.status === 503) && retries < maxRetries) {
          retries++;
          // Parse Retry-After if available, else exponential backoff
          const retryAfterSec = parseInt(responseHeaders['retry-after'] || '0', 10);
          const backoff = retryAfterSec > 0
            ? retryAfterSec * 1000
            : calculateBackoffDelay(1000, retries, Math.random() * 500);

          totalDelayApplied += backoff;
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }

        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          url,
          html: body,
          headers: responseHeaders,
          isChallenge: false,
          retries,
          delayAppliedMs: totalDelayApplied,
        };
      } catch (err: unknown) {
        if (retries < maxRetries) {
          retries++;
          const backoff = calculateBackoffDelay(1000, retries, Math.random() * 500);
          totalDelayApplied += backoff;
          await new Promise(r => setTimeout(r, backoff));
          continue;
        }
        throw err;
      }
    }
  } finally {
    releaseLock();
  }
}
