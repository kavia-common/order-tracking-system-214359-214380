#!/bin/bash
cd /home/kavia/workspace/code-generation/order-tracking-system-214359-214380/order_tracker_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

