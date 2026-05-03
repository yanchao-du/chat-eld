output "vpc_id" {
  description = "Dedicated VPC created for this project."
  value       = aws_vpc.nanoclaw.id
}

output "instance_id" {
  description = "EC2 instance ID — use this to start/stop via AWS CLI."
  value       = aws_instance.nanoclaw.id
}

output "public_ip" {
  description = "Static Elastic IP. Use this for SSH and share as the WhatsApp bot number's host."
  value       = aws_eip.nanoclaw.public_ip
}

output "ssh_command" {
  description = "Ready-to-run SSH command. Replace path to your .pem file."
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ubuntu@${aws_eip.nanoclaw.public_ip}"
}

output "instance_state" {
  description = "Current EC2 instance state."
  value       = aws_instance.nanoclaw.instance_state
}

output "webapp_url" {
  description = "ELD mock webapp URL — open in browser after setup is complete."
  value       = "http://${aws_eip.nanoclaw.public_ip}:3001"
}

output "ami_id" {
  description = "Ubuntu 24.04 AMI used."
  value       = data.aws_ami.ubuntu.id
}
