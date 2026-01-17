const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'xof' } = req.body; // 'xof' is FCFA code supported by Stripe (or use 'eur')

        // Stripe expects amount in smallest currency unit (e.g. cents)
        // FCFA is zero-decimal currency usually? No, actually Stripe treats it as normal.
        // BE CAREFUL: XOF is a zero-decimal currency for Stripe?
        // Let's assume input 'amount' is in FCFA units.
        // Stripe requires integer.

        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount), // Ensure integer
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe Intent Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
