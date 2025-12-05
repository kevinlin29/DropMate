#!/bin/bash

# Script to batch update Zustand imports to Redux in remaining files

FILES=(
  "src/screens/Profile.tsx"
  "src/screens/Settings.tsx"
  "src/screens/Tutorial.tsx"
  "src/screens/Map.tsx"
  "src/features/notifications/NotificationsGate.tsx"
  "src/hooks/useDriverLocationSimulator.ts"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."

  # Replace useAuth import
  sed -i "s|import { useAuth } from '@/stores/useAuth';|import { useAppSelector, useAppDispatch } from '@/store/hooks';|g" "$file"

  # Replace useUI import
  sed -i "s|import { useUI } from '@/stores/useUI';|import { useAppSelector, useAppDispatch } from '@/store/hooks';|g" "$file"

  # Replace useNotification import
  sed -i "s|import { useNotification } from '@/stores/useNotification';|import { useAppSelector, useAppDispatch } from '@/store/hooks';|g" "$file"

  # Replace useDriver import
  sed -i "s|import { useDriver } from '@/stores/useDriver';|import { useAppSelector, useAppDispatch } from '@/store/hooks';|g" "$file"
done

echo "Done! Now manually update the hook usages in each file."
