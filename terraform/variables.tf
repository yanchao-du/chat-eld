variable "aws_region" {
  description = "AWS region to deploy into. ap-southeast-1 = Singapore."
  type        = string
  default     = "ap-southeast-1"
}

variable "aws_profile" {
  description = "AWS CLI profile name (your SSO profile from `aws configure sso`)."
  type        = string
  default     = "default"
}

variable "instance_type" {
  description = "EC2 instance type. t3.small (2GB RAM) recommended — t3.micro OOMs during NanoClaw Docker build."
  type        = string
  default     = "t3.small"
}

variable "key_pair_name" {
  description = "Name of the EC2 key pair to use for SSH access. Must already exist in your AWS account."
  type        = string
}

variable "my_ip" {
  description = "Your public IP in CIDR notation (e.g. 1.2.3.4/32). Used to restrict SSH access."
  type        = string
}

variable "project_name" {
  description = "Tag prefix applied to all resources. Useful for cost tracking."
  type        = string
  default     = "nanoclaw-poc"
}

variable "volume_size_gb" {
  description = "Root EBS volume size in GB. Free tier allows up to 30 GB."
  type        = number
  default     = 20
}
