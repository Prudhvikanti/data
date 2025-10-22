#!/bin/bash

echo "🔧 Fixing Database Schema - Phone Column Issue"
echo "=============================================="

echo "📋 This script will fix the missing phone column in the orders table"
echo "📋 Run the SQL files in your Supabase SQL Editor:"
echo ""
echo "1. First run: FIX_PHONE_COLUMN.sql"
echo "2. Then run: COMPLETE_DATABASE_FIX.sql"
echo ""
echo "🚀 After running the SQL fixes, your order creation will work!"
echo ""
echo "📱 The phone column will be added to the orders table"
echo "📱 All existing orders will be updated with default phone numbers"
echo "📱 New orders will require a phone number"
echo ""
echo "✅ Ready to fix the database!"
