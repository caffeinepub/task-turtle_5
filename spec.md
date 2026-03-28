# Task Turtle

## Current State
New project — empty backend (main.mo scaffold) and no frontend code.

## Requested Changes (Diff)

### Add
- Full hyper-local task marketplace with two roles: Customer and Tasker (same user account)
- Landing page: hero, how-it-works, use cases, popular categories, CTA
- Auth: phone/email login using Authorization component
- Customer Dashboard: post a task (title, description, location, amount, tip), active task tracker
- Tasker Dashboard: nearby tasks list, accept/reject, earnings wallet, task history
- Live Task Screen: status timeline (Posted → Accepted → In Progress → OTP → Complete), OTP generation/verification
- Wallet page: balance, earnings history, platform fee breakdown
- Backend: User profiles with location, Tasks CRUD, OTP generation and verification, payment escrow simulation, smart matching (nearest tasker logic based on stored locations), wallet balances
- Stripe integration for upfront payment (escrow simulation)
- Role toggle: user can switch between Customer mode and Tasker mode

### Modify
- None (new project)

### Remove
- None

## Implementation Plan
1. Motoko backend: User stable store (name, phone, location lat/lng, walletBalance, rating, isAvailable), Task stable store (title, description, amount, tip, status, customerId, taskerId, storeLocation, customerLocation), OTP store (taskId → otp, verified), Payment store (escrow amounts)
2. Backend methods: createUser, updateUserLocation, getUserProfile, postTask, getNearbyTasks, acceptTask, generateOTP, verifyOTP, completeTask, getMyTasks, getWalletBalance, withdrawEarnings
3. Authorization component for login/roles
4. Stripe component for payment
5. Frontend pages: Landing, Auth, Customer Dashboard, Tasker Dashboard, Live Task Screen, Wallet
6. Green + Black Blinkit-style glossy UI with rounded cards, smooth animations
