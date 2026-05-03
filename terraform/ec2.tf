# ── Data sources ─────────────────────────────────────────────────────────────

# Latest Ubuntu 24.04 LTS AMI (Canonical official, arm64 + x86_64 covered)
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

# ── Networking ────────────────────────────────────────────────────────────────

# Use the default VPC — no need to create a custom one for a POC
resource "aws_vpc" "nanoclaw" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name    = "${var.project_name}-vpc"
    Project = var.project_name
  }
}

resource "aws_internet_gateway" "nanoclaw" {
  vpc_id = aws_vpc.nanoclaw.id

  tags = {
    Name    = "${var.project_name}-igw"
    Project = var.project_name
  }
}

resource "aws_subnet" "nanoclaw" {
  vpc_id                  = aws_vpc.nanoclaw.id
  cidr_block              = "10.42.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name    = "${var.project_name}-public-subnet"
    Project = var.project_name
  }
}

resource "aws_route_table" "nanoclaw" {
  vpc_id = aws_vpc.nanoclaw.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.nanoclaw.id
  }

  tags = {
    Name    = "${var.project_name}-rt"
    Project = var.project_name
  }
}

resource "aws_route_table_association" "nanoclaw" {
  subnet_id      = aws_subnet.nanoclaw.id
  route_table_id = aws_route_table.nanoclaw.id
}

# ── Security group ────────────────────────────────────────────────────────────

resource "aws_security_group" "nanoclaw" {
  name        = "${var.project_name}-sg"
  description = "NanoClaw POC: SSH from your IP only. All outbound allowed (WhatsApp, Claude API)."
  vpc_id      = aws_vpc.nanoclaw.id

  ingress {
    description = "SSH from operator IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  ingress {
    description = "Webapp (Next.js) — public"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound — NanoClaw connects OUT to WhatsApp/Claude API
  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

# ── EC2 instance ──────────────────────────────────────────────────────────────

resource "aws_instance" "nanoclaw" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = aws_subnet.nanoclaw.id
  vpc_security_group_ids = [aws_security_group.nanoclaw.id]

  # Auto-install all prerequisites on first boot
  user_data = templatefile("${path.module}/userdata.sh.tpl", {
    project_name = var.project_name
  })

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.volume_size_gb
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name    = "${var.project_name}-root"
      Project = var.project_name
    }
  }

  tags = {
    Name    = var.project_name
    Project = var.project_name
  }

  lifecycle {
    # Prevent accidental destroy of the instance (must explicitly target)
    prevent_destroy = false
    # Ignore AMI changes after initial deploy — avoid forced replacement
    ignore_changes = [ami, user_data]
  }
}

# ── Elastic IP ────────────────────────────────────────────────────────────────
# Static IP so WhatsApp pairing survives stop/start cycles

resource "aws_eip" "nanoclaw" {
  instance = aws_instance.nanoclaw.id
  domain   = "vpc"

  tags = {
    Name    = "${var.project_name}-eip"
    Project = var.project_name
  }
}
