/**
 * Stripe Utilities for Cloudflare Workers
 * Uses Stripe REST API directly (no Node.js SDK) for Workers compatibility
 */

const STRIPE_API_BASE = 'https://api.stripe.com/v1';

interface StripeEnv {
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET?: string;
    STRIPE_SUCCESS_URL?: string;
    STRIPE_CANCEL_URL?: string;
}

interface CheckoutSessionResponse {
    id: string;
    url: string;
}

interface StripeEvent {
    id: string;
    type: string;
    data: {
        object: Record<string, unknown>;
    };
}

/**
 * Make a request to Stripe API
 */
async function stripeRequest<T>(
    env: StripeEnv,
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: Record<string, unknown>
): Promise<T> {
    const headers: HeadersInit = {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Convert body to URL-encoded format (Stripe requires this)
    let encodedBody: string | undefined;
    if (body) {
        const params = new URLSearchParams();
        flattenObject(body, '', params);
        encodedBody = params.toString();
    }

    const response = await fetch(`${STRIPE_API_BASE}${endpoint}`, {
        method,
        headers,
        body: encodedBody,
    });

    const data = await response.json() as T & { error?: { message: string } };

    if (!response.ok) {
        throw new Error(data.error?.message || 'Stripe API error');
    }

    return data;
}

/**
 * Flatten nested object for URL encoding (Stripe requires this format)
 * e.g., { line_items: [{ price: 'abc' }] } -> line_items[0][price]=abc
 */
function flattenObject(
    obj: Record<string, unknown>,
    prefix: string,
    params: URLSearchParams
): void {
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}[${key}]` : key;

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                    flattenObject(item as Record<string, unknown>, `${newKey}[${index}]`, params);
                } else {
                    params.append(`${newKey}[${index}]`, String(item));
                }
            });
        } else if (typeof value === 'object' && value !== null) {
            flattenObject(value as Record<string, unknown>, newKey, params);
        } else if (value !== undefined && value !== null) {
            params.append(newKey, String(value));
        }
    }
}

/**
 * Create a Stripe Checkout Session for purchasing Pines
 */
export async function createCheckoutSession(
    env: StripeEnv,
    options: {
        packageId: string;
        packageName: string;
        pineCount: number;
        totalPrice: number; // in dollars
        clientId: string;
        clientEmail?: string;
    }
): Promise<CheckoutSessionResponse> {
    const successUrl = env.STRIPE_SUCCESS_URL || 'http://localhost:5173/client/wallet?success=true';
    const cancelUrl = env.STRIPE_CANCEL_URL || 'http://localhost:5173/client/wallet?canceled=true';

    const session = await stripeRequest<CheckoutSessionResponse>(env, '/checkout/sessions', 'POST', {
        mode: 'payment',
        success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        customer_email: options.clientEmail,
        client_reference_id: options.clientId,
        metadata: {
            package_id: options.packageId,
            pine_count: options.pineCount.toString(),
            client_id: options.clientId,
        },
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: Math.round(options.totalPrice * 100), // Convert to cents
                    product_data: {
                        name: `${options.pineCount} Pines - ${options.packageName}`,
                        description: `MotionPine Credits for video editing services`,
                    },
                },
                quantity: 1,
            },
        ],
    });

    return session;
}

/**
 * Verify Stripe webhook signature
 * Uses Web Crypto API for HMAC verification (Workers compatible)
 */
export async function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): Promise<boolean> {
    const parts = signature.split(',').reduce((acc, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const timestamp = parts['t'];
    const expectedSignature = parts['v1'];

    if (!timestamp || !expectedSignature) {
        return false;
    }

    // Check timestamp is within 5 minutes
    const timestampSeconds = parseInt(timestamp, 10);
    const currentSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(currentSeconds - timestampSeconds) > 300) {
        return false;
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(signedPayload)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return computedSignature === expectedSignature;
}

/**
 * Parse webhook event after signature verification
 */
export function parseWebhookEvent(payload: string): StripeEvent {
    return JSON.parse(payload) as StripeEvent;
}

/**
 * Retrieve checkout session details
 */
export async function getCheckoutSession(
    env: StripeEnv,
    sessionId: string
): Promise<Record<string, unknown>> {
    return stripeRequest(env, `/checkout/sessions/${sessionId}`, 'GET');
}
