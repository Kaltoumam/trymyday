const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

// Configure email transporter
console.log('--- Initializing Email Transporter ---');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '********' : 'MISSING');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
});

// Helper function to send credit notification email
async function sendCreditEmail(email, amount, newBalance) {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"TRYMYDAY" <Trymyday235@gmail.com>',
            to: email,
            subject: '💰 Votre avez reçu un virement sur votre compte TRYMYDAY !',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #ff9900 0%, #ff6600 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">TRYMYDAY</h1>
                    </div>
                    
                    <div style="padding: 40px 30px; background: white;">
                        <h2 style="color: #333; margin-top: 0; font-size: 22px;">Bonjour,</h2>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">
                           Votre venez de recevoir un virement sur votre compte TRYMYDAY.
                        </p>
                        
                        <div style="background-color: #fff9f0; border-left: 5px solid #ff9900; padding: 25px; margin: 30px 0; border-radius: 0 10px 10px 0;">
                            <table width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="padding-bottom: 10px; color: #888; font-size: 14px; text-transform: uppercase;">Montant ajouté</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 32px; font-weight: bold; color: #ff6600;">+ ${amount.toLocaleString()} FCFA</td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 20px; color: #888; font-size: 14px; text-transform: uppercase;">Nouveau solde total</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 20px; font-weight: 600; color: #333;">${newBalance.toLocaleString()} FCFA</td>
                                </tr>
                            </table>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">
                            Vous pouvez utiliser ce solde dès maintenant pour acheter des produits en un clic, sans bancaires.
                        </p>
                        
                        <div style="text-align: center; margin-top: 40px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/shop" 
                               style="background-color: #333; color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; display: inline-block; transition: background 0.3s;">
                                Faire mon shopping
                            </a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            &copy; 2025 TRYMYDAY. Tous droits réservés.<br>
                            Ceci est un message automatique, merci de ne pas y répondre.
                        </p>
                    </div>
                </div>
            `
        };

        console.log(`[DEBUG] Attempting mail to: <${email}>`);
        console.log('[DEBUG] Transporter Config - User:', process.env.SMTP_USER);

        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Mail error:', error.message);
        throw error;
    }
}

// Helper to send order emails
async function sendOrderEmail(order, status, note = '', oldBalance = null, newBalance = null) {
    try {
        const customerName = order.customerName || order.customer || 'Client';
        const currency = 'FCFA';

        const statusConfigs = {
            'Confirmée': {
                subject: `Order #${order.id} Confirmée - TRYMYDAY`,
                title: 'Merci pour votre commande !',
                message: `Votre commande #${order.id} a été reçue et est en attente de traitement.`
            },
            'En cours de préparation': {
                subject: `Order #${order.id} en préparation - TRYMYDAY`,
                title: 'Préparation en cours',
                message: `Bonne nouvelle ! Votre commande #${order.id} est en cours de préparation.`
            },
            'En route': {
                subject: `Order #${order.id} est en route ! - TRYMYDAY`,
                title: 'Commande expédiée',
                message: `Votre commande #${order.id} est en route ! Vous la recevrez bientôt.`
            },
            'Livrée': {
                subject: `Order #${order.id} Livrée - TRYMYDAY`,
                title: 'Commande livrée',
                message: `Votre commande #${order.id} a été livrée avec succès. Merci d'avoir choisi TRYMYDAY !`
            },
            'Annulée': {
                subject: `Order #${order.id} Annulée - TRYMYDAY`,
                title: 'Commande annulée',
                message: `Votre commande #${order.id} a été annulée.`
            },
            'Remboursée': {
                subject: `Commande #${order.id} Remboursée - TRYMYDAY`,
                title: 'Remboursement effectué',
                message: `Votre commande #${order.id} a été annulée et le remboursement a été effectué sur votre portefeuille.`
            }
        };

        const config = statusConfigs[status] || {
            subject: `Mise à jour de votre commande #${order.id} - TRYMYDAY`,
            title: 'Mise à jour de commande',
            message: `Le statut de votre commande #${order.id} a été mis à jour vers : ${status}.`
        };

        const mailOptions = {
            from: process.env.SMTP_FROM || '"TRYMYDAY" <Trymyday235@gmail.com>',
            to: order.email,
            subject: config.subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="background: linear-gradient(135deg, #ff9900 0%, #ff6600 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">TRYMYDAY</h1>
                    </div>
                    
                    <div style="padding: 40px 30px; background: white;">
                        <h2 style="color: #333; margin-top: 0; font-size: 22px;">${config.title}</h2>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">Bonjour ${customerName},</p>
                        <p style="color: #666; line-height: 1.6; font-size: 16px;">${config.message}</p>
                        
                        <div style="background-color: #fcfcfc; border: 1px solid #eee; padding: 20px; margin: 25px 0; border-radius: 10px;">
                            <h3 style="margin-top: 0; color: #333; font-size: 18px;">Détails de la commande</h3>
                            <p style="margin: 5px 0; color: #666;"><strong>ID:</strong> #${order.id}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Statut:</strong> ${status}</p>
                            <p style="margin: 5px 0; color: #666;"><strong>Montant Total:</strong> ${order.total} ${currency}</p>
                            ${note ? `<p style="margin: 15px 0 5px 0; color: #666; font-style: italic;"><strong>Note:</strong> ${note}</p>` : ''}
                        </div>

                        ${oldBalance !== null && newBalance !== null ? `
                        <div style="background-color: #fff9f0; border: 1px solid #ffcc80; padding: 20px; margin: 25px 0; border-radius: 10px;">
                            <h3 style="margin-top: 0; color: #e65100; font-size: 18px;">Mise à jour de votre portefeuille</h3>
                            <p style="margin: 5px 0; color: #666;"><strong>Ancien solde:</strong> ${oldBalance.toFixed(2)} ${currency}</p>
                            <p style="margin: 5px 0; font-size: 18px; color: #333;"><strong>Remboursement:</strong> <span style="color: #2e7d32;">+${parseFloat(order.total).toFixed(2)} ${currency}</span></p>
                            <p style="margin: 5px 0; color: #333; font-weight: bold; border-top: 1px solid #ffcc80; pt: 10px; margin-top: 10px;">Nouveau solde: ${newBalance.toFixed(2)} ${currency}</p>
                        </div>
                        ` : ''}

                        <div style="text-align: center; margin-top: 35px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile/wallet" style="background: #ff9900; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Voir mon portefeuille</a>
                        </div>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            &copy; 2025 TRYMYDAY. Tous droits réservés.<br>
                            Ceci est un message automatique, merci de ne pas y répondre.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Order email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending order email:', error);
        return false;
    }
}

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper function to read users
async function getUsers() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data).users;
    } catch (error) {
        return [];
    }
}

// Helper function to save users
async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// POST /api/admin/wallet/email-notification - Send email notification for wallet credit (detached from DB)
router.post('/wallet/email-notification', async (req, res) => {
    try {
        const { email, amount, newBalance, description } = req.body;

        console.log(`📧 Triggering wallet notification for ${email}`);

        if (!email || !amount) {
            return res.status(400).json({ success: false, message: 'Email and amount required' });
        }

        const success = await sendCreditEmail(email, amount, newBalance);

        if (success) {
            res.json({ success: true, message: 'Email sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } catch (error) {
        console.error('❌ Error sending wallet notification:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/wallet/credit - Credit user wallet (Admin only)
router.post('/wallet/credit', async (req, res) => {
    try {
        const { email, userId, amount, description } = req.body;

        if ((!email && !userId) || !amount) {
            return res.status(400).json({ success: false, message: 'Identifiant (Email ou ID) et montant requis' });
        }

        if (amount <= 0) {
            return res.status(400).json({ success: false, message: 'Amount must be positive' });
        }

        const users = await getUsers();
        let userIndex = -1;

        if (userId) {
            userIndex = users.findIndex(u => u.id === userId);
            if (userIndex === -1 && !email) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé avec cet ID' });
            }
        }

        if (userIndex === -1 && email) {
            userIndex = users.findIndex(u => u.email === email);
        }

        // Create user if doesn't exist
        if (userIndex === -1) {
            users.push({
                id: `user_${Date.now()}`,
                email: email,
                walletBalance: 0,
                transactions: []
            });
            userIndex = users.length - 1;
        }

        const user = users[userIndex];

        // Add amount
        user.walletBalance += amount;

        // Add transaction
        user.transactions.push({
            id: `tx_${Date.now()}`,
            type: 'credit',
            amount: amount,
            date: new Date().toISOString(),
            description: description || 'Admin credit',
            balanceAfter: user.walletBalance
        });

        users[userIndex] = user;
        await saveUsers(users);

        // Envoyer l'email de notification en arrière-plan (ne pas bloquer l'UI)
        sendCreditEmail(user.email, amount, user.walletBalance)
            .then(() => console.log(`[DEBUG] Email sent to ${user.email}`))
            .catch(err => console.error(`[DEBUG] Failed to send email to ${user.email}:`, err.message));

        res.json({
            success: true,
            message: 'Balance credited successfully',
            user: {
                email: user.email,
                newBalance: user.walletBalance
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/wallet/users - Get all users with balances
router.get('/wallet/users', async (req, res) => {
    try {
        const users = await getUsers();

        const userSummaries = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            joined: user.joined,
            walletBalance: user.walletBalance,
            transactionCount: user.transactions.length,
            lastTransaction: user.transactions.length > 0
                ? user.transactions[user.transactions.length - 1].date
                : null
        }));

        res.json({
            success: true,
            users: userSummaries,
            totalUsers: userSummaries.length,
            totalBalance: userSummaries.reduce((sum, u) => sum + u.walletBalance, 0)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/wallet/history - Get all wallet transactions
router.get('/wallet/history', async (req, res) => {
    try {
        const users = await getUsers();

        const allTransactions = [];
        users.forEach(user => {
            user.transactions.forEach(tx => {
                allTransactions.push({
                    ...tx,
                    userEmail: user.email
                });
            });
        });

        // Sort by date, most recent first
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            transactions: allTransactions,
            totalTransactions: allTransactions.length
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/admin/revenue - Get revenue statistics
router.get('/revenue', async (req, res) => {
    try {
        const users = await getUsers();

        let totalRevenue = 0;
        let totalOrders = 0;

        users.forEach(user => {
            user.transactions.forEach(tx => {
                if (tx.type === 'debit') {
                    totalRevenue += tx.amount;
                    totalOrders++;
                }
            });
        });

        res.json({
            success: true,
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/order-email - Send order status email
router.post('/order-email', async (req, res) => {
    try {
        const { order, status, note } = req.body;
        console.log(`📩 Triggering email for Order #${order?.id}, Status: ${status}`);

        if (!order || !order.email) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        const success = await sendOrderEmail(order, status, note);

        if (success) {
            res.json({ success: true, message: 'Email sent' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/admin/order-refund - Process refund for cancelled order
router.post('/order-refund', async (req, res) => {
    try {
        const { order, note } = req.body;
        console.log(`💰 Processing refund for Order #${order?.id}`);

        if (!order || !order.email || !order.total) {
            return res.status(400).json({ success: false, message: 'Invalid order data for refund' });
        }

        const users = await getUsers();
        let userIndex = users.findIndex(u => u.email === order.email);

        if (userIndex === -1) {
            return res.status(404).json({ success: false, message: 'Customer not found in wallet system' });
        }

        const user = users[userIndex];
        const refundAmount = parseFloat(order.total);
        const oldBalance = user.walletBalance || 0;

        // Update balance
        user.walletBalance += refundAmount;

        // Add transaction
        user.transactions.push({
            id: `refund_${Date.now()}`,
            type: 'credit',
            amount: refundAmount,
            date: new Date().toISOString(),
            description: `Remboursement Commande #${order.id}`,
            balanceAfter: user.walletBalance
        });

        users[userIndex] = user;
        await saveUsers(users);

        // Send enhanced email with balance info
        console.log(`📩 Sending refund email to ${user.email}`);
        await sendOrderEmail(order, 'Remboursée', note, oldBalance, user.walletBalance);

        res.json({
            success: true,
            message: 'Refund processed and email sent',
            newBalance: user.walletBalance
        });
    } catch (error) {
        console.error('❌ Refund error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
