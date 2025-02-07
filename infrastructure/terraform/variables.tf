variable "aws_region" {
  description = "The AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "ami_id" {
  description = "The AMI ID for the EC2 instance"
  type        = string
}

variable "instance_type" {
  description = "The instance type for the EC2 instance"
  type        = string
  default     = "t2.micro"
}

variable "dynamodb_table_name" {
  description = "The name of the DynamoDB table"
  type        = string
  default     = "NickBadges"
}

variable "iam_role_name" {
  description = "The name of the IAM role"
  type        = string
  default     = "EC2Role"
}

variable "iam_policy_name" {
  description = "The name of the IAM policy"
  type        = string
  default     = "EC2Policy"
}

variable "iam_instance_profile_name" {
  description = "The name of the IAM instance profile"
  type        = string
  default     = "EC2InstanceProfile"
}

variable "dynamodb_table_nick_streaks" {
  description = "The name of the DynamoDB table for Nick8Streaks"
  type        = string
  default     = "Nick8Streaks"
}

variable "dynamodb_table_food_log_counts" {
  description = "The name of the DynamoDB table for FoodLogCounts"
  type        = string
  default     = "FoodLogCounts"
}

variable "dynamodb_table_food_entries" {
  description = "The name of the DynamoDB table for FoodEntries"
  type        = string
  default     = "FoodEntries"
}
