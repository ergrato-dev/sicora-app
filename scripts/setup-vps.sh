#!/bin/bash
# =============================================================================
# SICORA - VPS Setup Script for Ubuntu 22.04
# Hostinger KVM1 (4GB RAM, 1 vCPU, 50GB NVMe)
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# =============================================================================
# Configuration
# =============================================================================
DOMAIN="${DOMAIN:-sicora.example.com}"
EMAIL="${EMAIL:-admin@example.com}"
APP_DIR="/opt/sicora"
GITHUB_REPO="https://github.com/ergrato-dev/sicora-app.git"

# =============================================================================
# Pre-flight checks
# =============================================================================
log_info "Starting SICORA VPS Setup..."

if [[ $EUID -ne 0 ]]; then
   log_error "This script must be run as root (use sudo)"
   exit 1
fi

# =============================================================================
# 1. System Update
# =============================================================================
log_info "Updating system packages..."
apt-get update && apt-get upgrade -y
apt-get install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    ufw \
    fail2ban \
    unzip \
    ca-certificates \
    gnupg \
    lsb-release

log_success "System packages updated"

# =============================================================================
# 2. Create sicora user
# =============================================================================
log_info "Creating sicora user..."
if ! id "sicora" &>/dev/null; then
    useradd -m -s /bin/bash sicora
    usermod -aG sudo sicora
    log_success "User sicora created"
else
    log_warning "User sicora already exists"
fi

# =============================================================================
# 3. Install Docker
# =============================================================================
log_info "Installing Docker..."

# Remove old versions
apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

# Add the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add sicora user to docker group
usermod -aG docker sicora

# Enable and start Docker
systemctl enable docker
systemctl start docker

log_success "Docker installed: $(docker --version)"

# =============================================================================
# 4. Configure Firewall (UFW)
# =============================================================================
log_info "Configuring firewall..."

ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

log_success "Firewall configured (SSH, HTTP, HTTPS allowed)"

# =============================================================================
# 5. Configure Fail2ban
# =============================================================================
log_info "Configuring Fail2ban..."

cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
ignoreip = 127.0.0.1/8

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400
EOF

systemctl enable fail2ban
systemctl restart fail2ban

log_success "Fail2ban configured"

# =============================================================================
# 6. Setup Application Directory
# =============================================================================
log_info "Setting up application directory..."

mkdir -p $APP_DIR
chown sicora:sicora $APP_DIR

log_success "Application directory created: $APP_DIR"

# =============================================================================
# 7. Create environment file template
# =============================================================================
log_info "Creating environment template..."

cat > $APP_DIR/.env.template << 'EOF'
# =============================================================================
# SICORA Production Environment Variables
# Copy this to .env and fill in your values
# =============================================================================

# PostgreSQL
POSTGRES_DB=sicora_prod
POSTGRES_USER=sicora
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# JWT Secret (generate with: openssl rand -hex 32)
JWT_SECRET=CHANGE_ME_GENERATE_SECURE_SECRET

# Domain
DOMAIN=sicora.example.com
EMAIL=admin@example.com

# Environment
ENVIRONMENT=production
EOF

chown sicora:sicora $APP_DIR/.env.template

log_success "Environment template created"

# =============================================================================
# 8. Install Certbot for SSL
# =============================================================================
log_info "Installing Certbot for SSL..."

apt-get install -y certbot

log_success "Certbot installed"

# =============================================================================
# 9. Create deployment script
# =============================================================================
log_info "Creating deployment script..."

cat > $APP_DIR/deploy.sh << 'EOF'
#!/bin/bash
# SICORA Deployment Script

set -e

APP_DIR="/opt/sicora"
cd $APP_DIR

echo "🚀 Starting SICORA deployment..."

# Pull latest code
if [ -d "sicora-app" ]; then
    cd sicora-app
    git pull origin main
else
    git clone https://github.com/ergrato-dev/sicora-app.git
    cd sicora-app
fi

# Copy environment file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Please create one from .env.template"
    exit 1
fi

# Build and start services
echo "🔨 Building containers..."
docker compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
echo "📊 Check status with: docker compose -f docker-compose.prod.yml ps"
EOF

chmod +x $APP_DIR/deploy.sh
chown sicora:sicora $APP_DIR/deploy.sh

log_success "Deployment script created"

# =============================================================================
# 10. Create SSL setup script
# =============================================================================
log_info "Creating SSL setup script..."

cat > $APP_DIR/setup-ssl.sh << 'EOF'
#!/bin/bash
# Setup SSL with Let's Encrypt

if [ -z "$1" ]; then
    echo "Usage: ./setup-ssl.sh your-domain.com your-email@example.com"
    exit 1
fi

DOMAIN=$1
EMAIL=${2:-admin@$DOMAIN}

# Stop nginx temporarily
docker compose -f /opt/sicora/sicora-app/docker-compose.prod.yml stop frontend 2>/dev/null || true

# Get certificate
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# Create nginx SSL config
mkdir -p /opt/sicora/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /opt/sicora/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /opt/sicora/ssl/

echo "✅ SSL certificate obtained for $DOMAIN"
echo "📝 Update nginx.conf to use SSL and restart frontend"
EOF

chmod +x $APP_DIR/setup-ssl.sh
chown sicora:sicora $APP_DIR/setup-ssl.sh

log_success "SSL setup script created"

# =============================================================================
# 11. System optimizations
# =============================================================================
log_info "Applying system optimizations..."

# Increase file limits
cat >> /etc/security/limits.conf << 'EOF'
* soft nofile 65536
* hard nofile 65536
EOF

# Optimize sysctl for Docker
cat > /etc/sysctl.d/99-sicora.conf << 'EOF'
# Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1

# Memory optimizations
vm.swappiness = 10
vm.dirty_ratio = 60
vm.dirty_background_ratio = 2
EOF

sysctl -p /etc/sysctl.d/99-sicora.conf

log_success "System optimizations applied"

# =============================================================================
# 12. Setup automatic updates
# =============================================================================
log_info "Configuring automatic security updates..."

apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

log_success "Automatic security updates enabled"

# =============================================================================
# Final Summary
# =============================================================================
echo ""
echo "============================================================================="
echo -e "${GREEN}✅ SICORA VPS Setup Complete!${NC}"
echo "============================================================================="
echo ""
echo "📋 Next steps:"
echo "   1. Switch to sicora user:  su - sicora"
echo "   2. Clone the repository:   cd /opt/sicora && git clone $GITHUB_REPO"
echo "   3. Create .env file:       cp .env.template sicora-app/.env"
echo "   4. Edit .env with your values"
echo "   5. Deploy:                 ./deploy.sh"
echo "   6. Setup SSL:              sudo ./setup-ssl.sh your-domain.com your@email.com"
echo ""
echo "📊 Useful commands:"
echo "   - View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "   - Check status:  docker compose -f docker-compose.prod.yml ps"
echo "   - Restart:       docker compose -f docker-compose.prod.yml restart"
echo ""
echo "🔐 Security reminder:"
echo "   - Change default passwords in .env"
echo "   - Generate JWT_SECRET: openssl rand -hex 32"
echo "   - Consider changing SSH port"
echo ""
log_success "Setup completed successfully!"
