# ── Terraform state (optional but recommended) ────────────────────────────────
# Store state in S3 so multiple machines / CI can share it.
# Uncomment and fill in your bucket + DynamoDB table names if desired.
# To create them: run `terraform apply` once without this block first,
# then add it and run `terraform init -migrate-state`.
#
# terraform {
#   backend "s3" {
#     bucket         = "your-tfstate-bucket"
#     key            = "nanoclaw-poc/terraform.tfstate"
#     region         = "ap-southeast-1"
#     profile        = "your-sso-profile"
#     dynamodb_table = "your-tfstate-lock-table"
#     encrypt        = true
#   }
# }
