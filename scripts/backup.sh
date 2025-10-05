#!/bin/bash

# Backup Script for Live Chatroom Application
# This script creates backups of database, files, and configurations

# Configuration
BACKUP_DIR="/var/backups/live-chatroom"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7
APP_DIR="/var/www/Live-chatroom"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory
mkdir -p $BACKUP_DIR

echo -e "${GREEN}Starting backup process...${NC}"

# Backup MongoDB
backup_mongodb() {
    echo -e "${YELLOW}Backing up MongoDB...${NC}"
    
    MONGO_BACKUP_DIR="$BACKUP_DIR/mongodb_$DATE"
    mkdir -p $MONGO_BACKUP_DIR
    
    # Load environment variables
    if [ -f "$APP_DIR/.env" ]; then
        export $(cat $APP_DIR/.env | grep DB_URI | xargs)
    fi
    
    # Create MongoDB dump
    mongodump --uri="$DB_URI" --out="$MONGO_BACKUP_DIR"
    
    # Compress backup
    tar -czf "$BACKUP_DIR/mongodb_$DATE.tar.gz" -C "$BACKUP_DIR" "mongodb_$DATE"
    rm -rf "$MONGO_BACKUP_DIR"
    
    echo -e "${GREEN}✓ MongoDB backup completed${NC}"
}

# Backup application files
backup_files() {
    echo -e "${YELLOW}Backing up application files...${NC}"
    
    FILES_BACKUP_DIR="$BACKUP_DIR/files_$DATE"
    mkdir -p $FILES_BACKUP_DIR
    
    # Backup uploads and important files
    if [ -d "$APP_DIR/uploads" ]; then
        cp -r "$APP_DIR/uploads" "$FILES_BACKUP_DIR/"
    fi
    
    if [ -d "$APP_DIR/logs" ]; then
        cp -r "$APP_DIR/logs" "$FILES_BACKUP_DIR/"
    fi
    
    # Backup configuration files
    cp "$APP_DIR/.env" "$FILES_BACKUP_DIR/" 2>/dev/null || true
    cp "$APP_DIR/package.json" "$FILES_BACKUP_DIR/"
    
    # Compress backup
    tar -czf "$BACKUP_DIR/files_$DATE.tar.gz" -C "$BACKUP_DIR" "files_$DATE"
    rm -rf "$FILES_BACKUP_DIR"
    
    echo -e "${GREEN}✓ Files backup completed${NC}"
}

# Backup PM2 configuration
backup_pm2() {
    echo -e "${YELLOW}Backing up PM2 configuration...${NC}"
    
    pm2 save
    cp ~/.pm2/dump.pm2 "$BACKUP_DIR/pm2_$DATE.json" 2>/dev/null || true
    
    echo -e "${GREEN}✓ PM2 backup completed${NC}"
}

# Clean old backups
cleanup_old_backups() {
    echo -e "${YELLOW}Cleaning up old backups...${NC}"
    
    find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    find $BACKUP_DIR -type f -name "*.json" -mtime +$RETENTION_DAYS -delete
    
    echo -e "${GREEN}✓ Old backups cleaned${NC}"
}

# Upload to cloud (optional)
upload_to_cloud() {
    echo -e "${YELLOW}Uploading to cloud storage...${NC}"
    
    # Example: Upload to AWS S3
    # aws s3 cp "$BACKUP_DIR/mongodb_$DATE.tar.gz" s3://your-bucket/backups/
    # aws s3 cp "$BACKUP_DIR/files_$DATE.tar.gz" s3://your-bucket/backups/
    
    # Example: Upload to Google Cloud Storage
    # gsutil cp "$BACKUP_DIR/mongodb_$DATE.tar.gz" gs://your-bucket/backups/
    # gsutil cp "$BACKUP_DIR/files_$DATE.tar.gz" gs://your-bucket/backups/
    
    echo -e "${YELLOW}Cloud upload skipped (configure as needed)${NC}"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Example: Send email notification
    # echo "$message" | mail -s "Backup $status" admin@example.com
    
    # Example: Send Slack notification
    # curl -X POST -H 'Content-type: application/json' \
    #   --data "{&quot;text&quot;:&quot;Backup $status: $message&quot;}" \
    #   YOUR_SLACK_WEBHOOK_URL
    
    echo -e "${GREEN}Notification: $status - $message${NC}"
}

# Main backup process
main() {
    START_TIME=$(date +%s)
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Live Chatroom Backup${NC}"
    echo -e "${GREEN}Date: $(date)${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # Run backups
    backup_mongodb
    backup_files
    backup_pm2
    cleanup_old_backups
    upload_to_cloud
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Backup completed successfully!${NC}"
    echo -e "${GREEN}Duration: ${DURATION}s${NC}"
    echo -e "${GREEN}Location: $BACKUP_DIR${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    send_notification "Success" "Backup completed in ${DURATION}s"
}

# Error handling
trap 'echo -e "${RED}Backup failed!${NC}"; send_notification "Failed" "Backup process encountered an error"; exit 1' ERR

# Run main function
main