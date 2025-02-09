terraform {
  backend "s3" {
    bucket         = "nick8-terraform-state-bucket"
    key            = "path/to/your/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "nick8-terraform-lock-table"
    encrypt        = true
  }
}