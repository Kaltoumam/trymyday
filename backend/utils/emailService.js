const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
});

async function sendEmail(options) {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || '"TRYMYDAY" <Trymyday235@gmail.com>',
            ...options
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error.message);
        return false;
    }
}

const emailTemplates = {
    orderStatus: (order, status, note = '', oldBalance = null, newBalance = null) => {
        const customerName = order.customerName || order.customer || 'Client';
        const currency = 'FCFA';

        const statusConfigs = {
            'En attente': {
                subject: `Commande #${order.id} reçue - TRYMYDAY`,
                title: 'Merci pour votre commande !',
                message: `Votre commande #${order.id} a été reçue et est en attente de traitement.`
            },
            'Confirmée': {
                subject: `Commande #${order.id} Confirmée - TRYMYDAY`,
                title: 'Commande Confirmée',
                message: `Votre commande #${order.id} a été confirmée.`
            },
            'En cours de préparation': {
                subject: `Commande #${order.id} en préparation - TRYMYDAY`,
                title: 'Préparation en cours',
                message: `Votre commande #${order.id} est en cours de préparation.`
            },
            'En route': {
                subject: `Commande #${order.id} est en route ! - TRYMYDAY`,
                title: 'Commande expédiée',
                message: `Votre commande #${order.id} est en route !`
            },
            'Livrée': {
                subject: `Commande #${order.id} Livrée - TRYMYDAY`,
                title: 'Commande livrée',
                message: `Votre commande #${order.id} a été livrée avec succès.`
            },
            'Annulée': {
                subject: `Commande #${order.id} Annulée - TRYMYDAY`,
                title: 'Commande annulée',
                message: `Votre commande #${order.id} a été annulée.`
            },
            'Remboursée': {
                subject: `Commande #${order.id} Remboursée - TRYMYDAY`,
                title: 'Remboursement effectué',
                message: `Votre commande #${order.id} a été annulée et remboursée.`
            }
        };

        const config = statusConfigs[status] || {
            subject: `Mise à jour Commande #${order.id} - TRYMYDAY`,
            title: 'Mise à jour de commande',
            message: `Le statut de votre commande #${order.id} a été mis à jour vers : ${status}.`
        };

        return {
            to: order.email,
            subject: config.subject,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ff9900 0%, #ff6600 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">TRYMYDAY</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2>${config.title}</h2>
                        <p>Bonjour ${customerName},</p>
                        <p>${config.message}</p>
                        <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p><strong>ID:</strong> #${order.id}</p>
                            <p><strong>Statut:</strong> ${status}</p>
                            <p><strong>Total:</strong> ${order.total.toLocaleString()} ${currency}</p>
                            ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
                        </div>
                        ${newBalance !== null ? `
                            <div style="background: #fff9ed; border: 1px solid #ffcc80; padding: 20px; border-radius: 10px;">
                                <p><strong>Nouveau solde portefeuille:</strong> ${newBalance.toLocaleString()} ${currency}</p>
                            </div>
                        ` : ''}
                    </div>
                    <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                        &copy; 2025 TRYMYDAY. Message automatique.
                    </div>
                </div>
            `
        };
    },
    walletCredit: (email, amount, newBalance) => {
        return {
            to: email,
            subject: '💰 Crédit reçu sur votre compte TRYMYDAY !',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
                    <div style="background: #ff9900; padding: 30px; text-align: center; color: white;">
                        <h1>TRYMYDAY</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2>Bonne nouvelle !</h2>
                        <p>Votre compte a été crédité de <strong>${amount.toLocaleString()} FCFA</strong>.</p>
                        <p><strong>Nouveau solde:</strong> ${newBalance.toLocaleString()} FCFA</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://trymyday.com/shop" style="background: #333; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px;">Faire mon shopping</a>
                        </div>
                    </div>
                    <div style="background: #f1f1f1; padding: 20px; text-align: center;">
                        &copy; 2025 TRYMYDAY.
                    </div>
                </div>
            `
        };
    },
    welcome: (user) => {
        return {
            to: user.email,
            subject: 'Bienvenue chez TRY MY DAY ! 🚀',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 15px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #ff9900 0%, #ff6600 100%); padding: 30px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px;">TRYMYDAY</h1>
                    </div>
                    <div style="padding: 40px 30px;">
                        <h2>Bienvenue ${user.name} !</h2>
                        <p>Nous sommes ravis de vous compter parmi nos clients.</p>
                        <p>Votre compte a été créé avec succès. Vous pouvez maintenant :</p>
                        <ul>
                            <li>Explorer nos collections</li>
                            <li>Gérer votre portefeuille</li>
                            <li>Passer vos commandes en un clic</li>
                        </ul>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://trymyday.com/shop" style="background: #ff9900; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">Commencer mon shopping</a>
                        </div>
                    </div>
                    <div style="background: #f1f1f1; padding: 20px; text-align: center; font-size: 12px; color: #888;">
                        &copy; 2025 TRYMYDAY.
                    </div>
                </div>
            `
        };
    }
};

module.exports = { sendEmail, emailTemplates };
