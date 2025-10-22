# QuickCommerce 🚀

A modern, mobile-responsive quick commerce application built with React, Vite, Tailwind CSS, and Supabase.

## Features ✨

### Core Features
- **User Authentication**: Secure signup/login with Supabase Auth
- **Product Catalog**: Browse products by category with search and filter
- **Shopping Cart**: Add, remove, and manage cart items with persistent storage
- **Checkout Process**: Complete orders with delivery address and payment options
- **Order Tracking**: View order history and status
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Modern UI**: Beautiful interface with Lucide icons and smooth animations
- **Performance Optimized**: Code splitting, lazy loading, and efficient state management

### 🆕 New Native Features (Quick Commerce Optimized)
- **❤️ Wishlist System**: Save favorite products with animated heart button
- **👁️ Quick View Modal**: View product details instantly without page navigation
- **🔔 Toast Notifications**: Beautiful feedback system (success, error, warning, info)
- **💬 Live Chat Bubble**: Instant support with WhatsApp, Call, and Email quick actions
- **📱 PWA Install Banner**: One-tap installation for native app experience
- **⏰ Flash Sale Timer**: Real-time countdown for limited offers
- **🎤 Voice Search**: Search products using voice commands
- **📍 Geolocation**: High-accuracy location detection for delivery
- **📜 Recently Viewed**: Track browsing history automatically
- **🔢 App Badge Counter**: Cart count on app icon (PWA)
- **⚡ Haptic Feedback**: Vibration feedback on all interactions
- **🔄 Pull to Refresh**: Native-style refresh gesture
- **👆 Swipe Gestures**: Swipe right to go back (mobile)
- **🎨 30+ Animations**: Smooth transitions, hover effects, and micro-interactions
- **💾 Offline Mode**: Network status detection and graceful degradation
- **📊 Performance Monitoring**: Page load time tracking

## Tech Stack 💻

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth, Database)
- **Icons**: Lucide React
- **Routing**: React Router v6

## Getting Started 🚀

### Prerequisites

- Node.js 16+ and npm
- A Supabase account (free tier works fine)

### Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd quickcommerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Supabase**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to be ready (takes ~2 minutes)
   - Go to Project Settings > API
   - Copy your project URL and anon/public key

4. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Set up the database**:
   - Go to your Supabase project dashboard
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy the entire contents of `database.sql` file
   - Paste it into the SQL editor and click "Run"
   - This will create all tables, policies, and sample data

6. **Start the development server**:
   ```bash
   npm run dev
   ```

7. **Open your browser**:
   Navigate to `http://localhost:3000`

## Project Structure 📁

```
quickcommerce/
├── public/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── BottomNav.jsx   # Mobile bottom navigation
│   │   ├── Layout.jsx      # Main layout wrapper
│   │   ├── LoadingScreen.jsx
│   │   ├── Navbar.jsx      # Top navigation bar
│   │   └── ProductCard.jsx # Product display card
│   ├── lib/
│   │   └── supabase.js     # Supabase client setup
│   ├── pages/              # Page components
│   │   ├── Cart.jsx        # Shopping cart page
│   │   ├── Checkout.jsx    # Checkout process
│   │   ├── Home.jsx        # Homepage
│   │   ├── Login.jsx       # Login page
│   │   ├── Orders.jsx      # Order history
│   │   ├── ProductDetail.jsx
│   │   ├── Products.jsx    # Product listing
│   │   ├── Profile.jsx     # User profile
│   │   └── Signup.jsx      # Registration page
│   ├── store/              # State management
│   │   ├── authStore.js    # Authentication state
│   │   └── cartStore.js    # Shopping cart state
│   ├── App.jsx             # Main app component
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── database.sql            # Database schema
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Key Features Explained 🔍

### Authentication
- Secure user registration and login
- Password-protected routes
- User profile management
- Session persistence

### Shopping Experience
- Browse products by category
- Search products by name
- Add/remove items from cart
- Quantity management
- Cart persistence across sessions

### Order Management
- Secure checkout process
- Delivery address collection
- Multiple payment options
- Order history tracking
- Real-time order status

### Mobile Optimization
- Touch-friendly interface
- Bottom navigation for easy access
- Responsive grid layouts
- Optimized images
- Fast loading times

## Database Schema 📊

The application uses 4 main tables:
- **categories**: Product categories
- **products**: Product information
- **orders**: Customer orders
- **order_items**: Individual items in orders

Row Level Security (RLS) is enabled for data protection.

## Performance Optimizations ⚡

- Code splitting with Vite
- Lazy loading of routes
- Optimized bundle size
- Efficient state management with Zustand
- Image optimization
- CSS purging with Tailwind

## Customization 🎨

### Colors
Edit `tailwind.config.js` to change the primary color scheme:
```javascript
colors: {
  primary: {
    // Your color palette
  }
}
```

### Sample Data
Modify `database.sql` to add your own products and categories.

## Deployment 🌐

### Build for production:
```bash
npm run build
```

### Deploy to Vercel, Netlify, or any static hosting:
```bash
# The build folder will be in ./dist
```

### Environment Variables:
Make sure to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform.

## Troubleshooting 🔧

### Database errors
- Ensure you've run the `database.sql` file in Supabase
- Check that RLS policies are enabled
- Verify your Supabase credentials in `.env`

### Authentication issues
- Clear browser cache and cookies
- Check Supabase Auth settings
- Ensure email confirmation is disabled (or configure email provider)

### Build errors
- Delete `node_modules` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`

## Future Enhancements 🚀

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Admin dashboard
- [ ] Multi-language support
- [ ] Dark mode

## License 📄

MIT License - feel free to use this project for personal or commercial purposes.

## Support 💬

For issues or questions, please check the code comments or create an issue in the repository.

---

Built with ❤️ using React and Supabase

