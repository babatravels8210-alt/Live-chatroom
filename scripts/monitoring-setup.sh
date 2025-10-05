#!/bin/bash

# Monitoring and Logging Setup Script for Live Chatroom

echo "🔧 Setting up Monitoring and Logging..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Install Prometheus
install_prometheus() {
    echo -e "${YELLOW}Installing Prometheus...${NC}"
    
    # Create prometheus user
    useradd --no-create-home --shell /bin/false prometheus
    
    # Create directories
    mkdir -p /etc/prometheus
    mkdir -p /var/lib/prometheus
    
    # Download Prometheus
    cd /tmp
    wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz
    tar -xvf prometheus-2.45.0.linux-amd64.tar.gz
    
    # Copy binaries
    cp prometheus-2.45.0.linux-amd64/prometheus /usr/local/bin/
    cp prometheus-2.45.0.linux-amd64/promtool /usr/local/bin/
    
    # Copy config files
    cp -r prometheus-2.45.0.linux-amd64/consoles /etc/prometheus
    cp -r prometheus-2.45.0.linux-amd64/console_libraries /etc/prometheus
    
    # Set ownership
    chown -R prometheus:prometheus /etc/prometheus
    chown -R prometheus:prometheus /var/lib/prometheus
    chown prometheus:prometheus /usr/local/bin/prometheus
    chown prometheus:prometheus /usr/local/bin/promtool
    
    # Create Prometheus config
    cat > /etc/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
  
  - job_name: 'node_exporter'
    static_configs:
      - targets: ['localhost:9100']
  
  - job_name: 'live-chatroom'
    static_configs:
      - targets: ['localhost:12000']
EOF
    
    # Create systemd service
    cat > /etc/systemd/system/prometheus.service <<EOF
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF
    
    # Start Prometheus
    systemctl daemon-reload
    systemctl start prometheus
    systemctl enable prometheus
    
    echo -e "${GREEN}✓ Prometheus installed and started${NC}"
}

# Install Node Exporter
install_node_exporter() {
    echo -e "${YELLOW}Installing Node Exporter...${NC}"
    
    # Create node_exporter user
    useradd --no-create-home --shell /bin/false node_exporter
    
    # Download Node Exporter
    cd /tmp
    wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
    tar -xvf node_exporter-1.6.1.linux-amd64.tar.gz
    
    # Copy binary
    cp node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
    chown node_exporter:node_exporter /usr/local/bin/node_exporter
    
    # Create systemd service
    cat > /etc/systemd/system/node_exporter.service <<EOF
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF
    
    # Start Node Exporter
    systemctl daemon-reload
    systemctl start node_exporter
    systemctl enable node_exporter
    
    echo -e "${GREEN}✓ Node Exporter installed and started${NC}"
}

# Install Grafana
install_grafana() {
    echo -e "${YELLOW}Installing Grafana...${NC}"
    
    # Add Grafana repository
    apt-get install -y software-properties-common
    add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
    wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
    
    # Install Grafana
    apt-get update
    apt-get install -y grafana
    
    # Start Grafana
    systemctl daemon-reload
    systemctl start grafana-server
    systemctl enable grafana-server
    
    echo -e "${GREEN}✓ Grafana installed and started${NC}"
    echo -e "${YELLOW}Access Grafana at: http://localhost:3000${NC}"
    echo -e "${YELLOW}Default credentials: admin/admin${NC}"
}

# Install Loki for log aggregation
install_loki() {
    echo -e "${YELLOW}Installing Loki...${NC}"
    
    # Create loki user
    useradd --no-create-home --shell /bin/false loki
    
    # Create directories
    mkdir -p /etc/loki
    mkdir -p /var/lib/loki
    
    # Download Loki
    cd /tmp
    wget https://github.com/grafana/loki/releases/download/v2.9.0/loki-linux-amd64.zip
    unzip loki-linux-amd64.zip
    
    # Copy binary
    cp loki-linux-amd64 /usr/local/bin/loki
    chown loki:loki /usr/local/bin/loki
    
    # Create Loki config
    cat > /etc/loki/loki-config.yml <<EOF
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-05-15
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /var/lib/loki/index
  filesystem:
    directory: /var/lib/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
EOF
    
    # Set ownership
    chown -R loki:loki /etc/loki
    chown -R loki:loki /var/lib/loki
    
    # Create systemd service
    cat > /etc/systemd/system/loki.service <<EOF
[Unit]
Description=Loki
Wants=network-online.target
After=network-online.target

[Service]
User=loki
Group=loki
Type=simple
ExecStart=/usr/local/bin/loki -config.file=/etc/loki/loki-config.yml

[Install]
WantedBy=multi-user.target
EOF
    
    # Start Loki
    systemctl daemon-reload
    systemctl start loki
    systemctl enable loki
    
    echo -e "${GREEN}✓ Loki installed and started${NC}"
}

# Install Promtail for log shipping
install_promtail() {
    echo -e "${YELLOW}Installing Promtail...${NC}"
    
    # Create promtail user
    useradd --no-create-home --shell /bin/false promtail
    
    # Create directories
    mkdir -p /etc/promtail
    
    # Download Promtail
    cd /tmp
    wget https://github.com/grafana/loki/releases/download/v2.9.0/promtail-linux-amd64.zip
    unzip promtail-linux-amd64.zip
    
    # Copy binary
    cp promtail-linux-amd64 /usr/local/bin/promtail
    chown promtail:promtail /usr/local/bin/promtail
    
    # Create Promtail config
    cat > /etc/promtail/promtail-config.yml <<EOF
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://localhost:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log
  
  - job_name: live-chatroom
    static_configs:
      - targets:
          - localhost
        labels:
          job: live-chatroom
          __path__: /var/www/Live-chatroom/logs/*.log
EOF
    
    # Set ownership
    chown -R promtail:promtail /etc/promtail
    
    # Create systemd service
    cat > /etc/systemd/system/promtail.service <<EOF
[Unit]
Description=Promtail
Wants=network-online.target
After=network-online.target

[Service]
User=promtail
Group=promtail
Type=simple
ExecStart=/usr/local/bin/promtail -config.file=/etc/promtail/promtail-config.yml

[Install]
WantedBy=multi-user.target
EOF
    
    # Start Promtail
    systemctl daemon-reload
    systemctl start promtail
    systemctl enable promtail
    
    echo -e "${GREEN}✓ Promtail installed and started${NC}"
}

# Setup log rotation
setup_log_rotation() {
    echo -e "${YELLOW}Setting up log rotation...${NC}"
    
    cat > /etc/logrotate.d/live-chatroom <<EOF
/var/www/Live-chatroom/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deployer deployer
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
    
    echo -e "${GREEN}✓ Log rotation configured${NC}"
}

# Main installation
main() {
    echo -e "${GREEN}Starting monitoring setup...${NC}"
    
    # Update system
    apt-get update
    
    # Install dependencies
    apt-get install -y wget curl unzip
    
    # Install components
    install_prometheus
    install_node_exporter
    install_grafana
    install_loki
    install_promtail
    setup_log_rotation
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Monitoring setup completed!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Access URLs:${NC}"
    echo -e "Prometheus: http://localhost:9090"
    echo -e "Grafana: http://localhost:3000 (admin/admin)"
    echo -e "Node Exporter: http://localhost:9100/metrics"
    echo -e "Loki: http://localhost:3100"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Login to Grafana"
    echo "2. Add Prometheus as data source"
    echo "3. Add Loki as data source"
    echo "4. Import dashboards"
    echo ""
}

# Run main function
main