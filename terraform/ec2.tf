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
data "aws_vpc" "default" {
  default = true
}

# ── Security group ────────────────────────────────────────────────────────────

resource "aws_security_group" "nanoclaw" {
  name        = "${var.project_name}-sg"
  description = "NanoClaw POC: SSH from your IP only. All outbound allowed (WhatsApp, Claude API)."
  vpc_id      = data.aws_vpc.default.id

  # SSH — your IP only
  ingress {
    description = "SSH from operator IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
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
