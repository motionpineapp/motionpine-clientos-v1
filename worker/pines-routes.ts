import { Hono } from "hono";
import { ok, bad, notFound, Env } from './core-utils';
import * as db from './db';

export function pinesRoutes(app: Hono<{ Bindings: Env }>) {

    // ========================================================================
    // SERVICE TYPES (Public - for clients to see available services)
    // ========================================================================

    // List all active service types
    app.get('/api/services', async (c) => {
        try {
            const services = await db.listServiceTypes(c.env.DB, true);
            return ok(c, services);
        } catch (error) {
            console.error('Error listing services:', error);
            return bad(c, 'Failed to fetch services');
        }
    });

    // Get service by ID
    app.get('/api/services/:id', async (c) => {
        try {
            const service = await db.getServiceTypeById(c.env.DB, c.req.param('id'));
            if (!service) {
                return notFound(c, 'Service type not found');
            }
            return ok(c, service);
        } catch (error) {
            console.error('Error getting service:', error);
            return bad(c, 'Failed to fetch service');
        }
    });

    // ========================================================================
    // PINE PACKAGES (Public - for clients to see purchase options)
    // ========================================================================

    // List all active pine packages
    app.get('/api/pine-packages', async (c) => {
        try {
            const packages = await db.listPinePackages(c.env.DB, true);
            return ok(c, packages);
        } catch (error) {
            console.error('Error listing packages:', error);
            return bad(c, 'Failed to fetch packages');
        }
    });

    // Get package by ID
    app.get('/api/pine-packages/:id', async (c) => {
        try {
            const pkg = await db.getPinePackageById(c.env.DB, c.req.param('id'));
            if (!pkg) {
                return notFound(c, 'Package not found');
            }
            return ok(c, pkg);
        } catch (error) {
            console.error('Error getting package:', error);
            return bad(c, 'Failed to fetch package');
        }
    });

    // ========================================================================
    // ADMIN: SERVICE TYPES MANAGEMENT
    // ========================================================================

    // List all service types (including inactive) - Admin only
    app.get('/api/admin/services', async (c) => {
        try {
            const services = await db.listServiceTypes(c.env.DB, false);
            return ok(c, services);
        } catch (error) {
            console.error('Error listing all services:', error);
            return bad(c, 'Failed to fetch services');
        }
    });

    // Create new service type - Admin only
    app.post('/api/admin/services', async (c) => {
        try {
            const data = await c.req.json();
            const service = await db.createServiceType(c.env.DB, {
                name: data.name,
                description: data.description,
                pineCost: data.pineCost,
                category: data.category,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? 0
            });
            return ok(c, service);
        } catch (error) {
            console.error('Error creating service:', error);
            return bad(c, 'Failed to create service');
        }
    });

    // Update service type - Admin only
    app.put('/api/admin/services/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const updates = await c.req.json();
            await db.updateServiceType(c.env.DB, id, updates);
            const updated = await db.getServiceTypeById(c.env.DB, id);
            return ok(c, updated);
        } catch (error) {
            console.error('Error updating service:', error);
            return bad(c, 'Failed to update service');
        }
    });

    // ========================================================================
    // ADMIN: PINE PACKAGES MANAGEMENT
    // ========================================================================

    // List all packages (including inactive) - Admin only
    app.get('/api/admin/pine-packages', async (c) => {
        try {
            const packages = await db.listPinePackages(c.env.DB, false);
            return ok(c, packages);
        } catch (error) {
            console.error('Error listing all packages:', error);
            return bad(c, 'Failed to fetch packages');
        }
    });

    // Update package - Admin only
    app.put('/api/admin/pine-packages/:id', async (c) => {
        try {
            const id = c.req.param('id');
            const updates = await c.req.json();
            await db.updatePinePackage(c.env.DB, id, updates);
            const updated = await db.getPinePackageById(c.env.DB, id);
            return ok(c, updated);
        } catch (error) {
            console.error('Error updating package:', error);
            return bad(c, 'Failed to update package');
        }
    });

    // ========================================================================
    // ADMIN: CLIENT PINE MANAGEMENT
    // ========================================================================

    // Add pines to client - Admin only
    app.post('/api/admin/clients/:clientId/pines', async (c) => {
        try {
            const clientId = c.req.param('clientId');
            const { amount, type, description, notes } = await c.req.json();

            if (!amount || !type) {
                return bad(c, 'Amount and type are required');
            }

            // For purchases, amount should be positive. For deductions, negative.
            const finalAmount = type === 'purchase' || type === 'refund'
                ? Math.abs(amount)
                : -Math.abs(amount);

            const transaction = await db.createPineTransaction(c.env.DB, {
                clientId,
                type,
                amount: finalAmount,
                description: description || `Admin ${type}`,
                date: new Date().toISOString(),
                notes
            });

            const newBalance = await db.getClientBalance(c.env.DB, clientId);

            return ok(c, { transaction, balance: newBalance });
        } catch (error) {
            console.error('Error adding pines:', error);
            return bad(c, 'Failed to add pines');
        }
    });

    // Get client pine history - Admin only
    app.get('/api/admin/clients/:clientId/pines/history', async (c) => {
        try {
            const clientId = c.req.param('clientId');
            const transactions = await db.getTransactionsByClientId(c.env.DB, clientId);
            const balance = await db.getClientBalance(c.env.DB, clientId);
            return ok(c, { transactions, balance });
        } catch (error) {
            console.error('Error getting pine history:', error);
            return bad(c, 'Failed to fetch pine history');
        }
    });

    // ========================================================================
    // STRIPE CHECKOUT (Client purchasing pines)
    // ========================================================================

    // Create checkout session for purchasing pines
    app.post('/api/pines/checkout', async (c) => {
        try {
            const { packageId, clientId, clientEmail } = await c.req.json();

            if (!packageId || !clientId) {
                return bad(c, 'Package ID and Client ID are required');
            }

            // Check if Stripe is configured
            if (!c.env.STRIPE_SECRET_KEY) {
                return bad(c, 'Stripe is not configured');
            }

            // Get the package details
            const pkg = await db.getPinePackageById(c.env.DB, packageId);
            if (!pkg) {
                return notFound(c, 'Package not found');
            }

            if (!pkg.isActive) {
                return bad(c, 'This package is no longer available');
            }

            // Import stripe utils dynamically
            const { createCheckoutSession } = await import('./stripe-utils');

            const session = await createCheckoutSession(
                {
                    STRIPE_SECRET_KEY: c.env.STRIPE_SECRET_KEY,
                    STRIPE_SUCCESS_URL: c.env.STRIPE_SUCCESS_URL,
                    STRIPE_CANCEL_URL: c.env.STRIPE_CANCEL_URL,
                },
                {
                    packageId: pkg.id,
                    packageName: pkg.name,
                    pineCount: pkg.pineCount,
                    totalPrice: pkg.totalPrice,
                    clientId,
                    clientEmail,
                }
            );

            return ok(c, { checkoutUrl: session.url, sessionId: session.id });
        } catch (error) {
            console.error('Error creating checkout session:', error);
            return bad(c, 'Failed to create checkout session');
        }
    });

    // Stripe webhook handler
    app.post('/api/pines/webhook', async (c) => {
        try {
            // Check if Stripe is configured
            if (!c.env.STRIPE_SECRET_KEY || !c.env.STRIPE_WEBHOOK_SECRET) {
                console.error('Stripe not configured for webhooks');
                return c.json({ error: 'Webhook not configured' }, 500);
            }

            const signature = c.req.header('stripe-signature');
            if (!signature) {
                return c.json({ error: 'Missing signature' }, 400);
            }

            const payload = await c.req.text();

            // Import stripe utils
            const { verifyWebhookSignature, parseWebhookEvent } = await import('./stripe-utils');

            // Verify signature
            const isValid = await verifyWebhookSignature(
                payload,
                signature,
                c.env.STRIPE_WEBHOOK_SECRET
            );

            if (!isValid) {
                console.error('Invalid webhook signature');
                return c.json({ error: 'Invalid signature' }, 400);
            }

            // Parse the event
            const event = parseWebhookEvent(payload);

            // Handle checkout.session.completed
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object as {
                    id: string;
                    client_reference_id: string;
                    metadata: {
                        package_id: string;
                        pine_count: string;
                        client_id: string;
                    };
                    payment_intent: string;
                };

                const clientId = session.client_reference_id || session.metadata.client_id;
                const pineCount = parseInt(session.metadata.pine_count, 10);
                const packageId = session.metadata.package_id;

                if (!clientId || !pineCount) {
                    console.error('Missing clientId or pineCount in webhook');
                    return c.json({ error: 'Invalid session data' }, 400);
                }

                // Get package for description
                const pkg = await db.getPinePackageById(c.env.DB, packageId);

                // Create pine transaction
                await db.createPineTransaction(c.env.DB, {
                    clientId,
                    type: 'purchase',
                    amount: pineCount,
                    description: `Purchased ${pineCount} Pines - ${pkg?.name || 'Package'}`,
                    date: new Date().toISOString(),
                    stripePaymentId: session.payment_intent || session.id,
                    notes: `Stripe Checkout Session: ${session.id}`,
                });

                console.log(`✅ Added ${pineCount} pines to client ${clientId}`);
            }

            // Return success to Stripe
            return c.json({ received: true });
        } catch (error) {
            console.error('Webhook error:', error);
            return c.json({ error: 'Webhook handler failed' }, 500);
        }
    });

    // ========================================================================
    // BATCH PROJECT CREATION (Deducts pines on submit)
    // ========================================================================

    interface BatchProjectInput {
        serviceTypeId: string;
        title: string;
        brief?: string;
        referenceLinks?: string;
    }

    app.post('/api/projects/batch', async (c) => {
        try {
            const { clientId, projects } = await c.req.json<{
                clientId: string;
                projects: BatchProjectInput[];
            }>();

            if (!clientId || !projects || !Array.isArray(projects) || projects.length === 0) {
                return bad(c, 'Client ID and at least one project are required');
            }

            // Get client info
            const client = await c.env.DB.prepare(
                'SELECT id, name, company FROM clients WHERE id = ?'
            ).bind(clientId).first<{ id: string; name: string; company: string }>();

            if (!client) {
                return notFound(c, 'Client not found');
            }

            // Validate all service types and calculate total pines
            const serviceTypes = await db.listServiceTypes(c.env.DB, true);
            const serviceMap = new Map(serviceTypes.map(s => [s.id, s]));

            let totalPines = 0;
            const validatedProjects: Array<BatchProjectInput & { pineCost: number; serviceName: string }> = [];

            for (const project of projects) {
                if (!project.serviceTypeId || !project.title) {
                    return bad(c, 'Each project must have serviceTypeId and title');
                }

                const service = serviceMap.get(project.serviceTypeId);
                if (!service) {
                    return bad(c, `Invalid service type: ${project.serviceTypeId}`);
                }

                totalPines += service.pineCost;
                validatedProjects.push({
                    ...project,
                    pineCost: service.pineCost,
                    serviceName: service.name
                });
            }

            // Check client balance
            const balance = await db.getClientBalance(c.env.DB, clientId);
            if (balance < totalPines) {
                return bad(c, `Insufficient pines. Need ${totalPines}, have ${balance}`);
            }

            // Create projects and deduct pines
            const createdProjects = [];
            const now = new Date().toISOString();

            for (const project of validatedProjects) {
                const projectId = crypto.randomUUID();

                // Create project with pines info
                await c.env.DB.prepare(`
                    INSERT INTO projects (id, title, client_id, client_name, status, created_at, service_type_id, pines_charged, brief, reference_links)
                    VALUES (?, ?, ?, ?, 'todo', ?, ?, ?, ?, ?)
                `).bind(
                    projectId,
                    project.title,
                    clientId,
                    client.name,
                    now,
                    project.serviceTypeId,
                    project.pineCost,
                    project.brief || null,
                    project.referenceLinks || null
                ).run();

                // Create pine transaction for this project
                await db.createPineTransaction(c.env.DB, {
                    clientId,
                    type: 'usage',
                    amount: -project.pineCost,
                    description: `${project.serviceName}: ${project.title}`,
                    date: now,
                    projectId
                });

                createdProjects.push({
                    id: projectId,
                    title: project.title,
                    serviceTypeId: project.serviceTypeId,
                    serviceName: project.serviceName,
                    pinesCharged: project.pineCost
                });
            }

            const newBalance = await db.getClientBalance(c.env.DB, clientId);

            return ok(c, {
                projects: createdProjects,
                totalPinesDeducted: totalPines,
                newBalance
            });
        } catch (error) {
            console.error('Batch project error:', error);
            return bad(c, 'Failed to create projects');
        }
    });
}
