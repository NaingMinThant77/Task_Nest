#!/bin/sh

# Run migrations/push
npx prisma db push

# Run seed
npx prisma db seed

# Start the application
exec node dist/src/main.js