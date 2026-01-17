# 💰 TRYMYDAY Backend API
Wallet System

## 🚀 Quick Start

### Backend Server
```bash
cd backend
node server.js
```
Server runs on: `http://localhost:3001`

### Frontend
```bash
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 📱 Features

### ✅ User Features
- View wallet balance
- Pay with wallet (no credit card needed)
- Transaction history
- Real-time balance updates

### ✅ Admin Features
- Credit user wallets
- View all user balances
- Transaction monitoring
- Revenue statistics

---

## 🔗 Important URLs

- **User Wallet**: http://localhost:5173/profile/wallet
- **Checkout**: http://localhost:5173/checkout
- **Admin Wallet**: http://localhost:5173/admin/wallet
- **API Health**: http://localhost:3001/api/health

---

## 🧪 Quick Test

1. **Start Backend** (if not running):
   ```bash
   cd backend
   node server.js
   ```

2. **Go to Admin Panel**:
   - Visit: http://localhost:5173/admin/wallet
   - Credit a user with 500 TL

3. **Make a Purchase**:
   - Add items to cart
   - Go to checkout
   - Select "Payer avec mon wallet"
   - Complete order

4. **Check Balance**:
   - Visit: http://localhost:5173/profile/wallet
   - See updated balance and transaction

---

## 📊 API Examples

### Get Balance
```bash
curl "http://localhost:3001/api/wallet/balance?email=test@example.com"
```

### Credit User (Admin)
```bash
curl -X POST http://localhost:3001/api/admin/wallet/credit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":100,"description":"Bonus"}'
```

### Pay with Wallet
```bash
curl -X POST http://localhost:3001/api/wallet/pay \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":50,"orderId":"order_123"}'
```

---

## 🎯 How It Works

1. **Admin credits user wallet** → User receives balance
2. **User shops** → Adds items to cart
3. **Checkout** → Selects wallet payment
4. **Payment processed** → Balance deducted
5. **Order confirmed** → Transaction recorded

---

## 📁 File Structure

```
backend/
├── server.js              # Express server
├── routes/
│   ├── wallet.js         # User wallet API
│   └── admin.js          # Admin API
└── data/
    └── users.json        # User database

src/
├── context/
│   └── WalletContext.jsx # Wallet state management
├── pages/
│   ├── Wallet.jsx        # User wallet page
│   ├── Checkout.jsx      # Checkout with wallet
│   └── admin/
│       └── AdminWalletManagement.jsx
```

---

## ✨ Next Steps

- ✅ System is ready to use!
- Test wallet payments
- Explore admin features
- Customize as needed

**Enjoy! 🎉**
