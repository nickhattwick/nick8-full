output "ec2_instance_id" {
  description = "The ID of the EC2 instance"
  value       = aws_instance.server.id
}

output "ec2_instance_public_ip" {
  description = "The public IP of the EC2 instance"
  value       = aws_instance.server.public_ip
}

output "dynamodb_table_arn" {
  description = "The ARN of the DynamoDB table"
  value       = aws_dynamodb_table.nick_badges.arn
}

output "dynamodb_table_nick_streaks_arn" {
  description = "The ARN of the Nick8Streaks DynamoDB table"
  value       = aws_dynamodb_table.nick_streaks.arn
}

output "dynamodb_table_food_log_counts_arn" {
  description = "The ARN of the FoodLogCounts DynamoDB table"
  value       = aws_dynamodb_table.food_log_counts.arn
}

output "dynamodb_table_food_entries_arn" {
  description = "The ARN of the FoodEntries DynamoDB table"
  value       = aws_dynamodb_table.food_entries.arn
}

output "iam_role_arn" {
  description = "The ARN of the IAM role"
  value       = aws_iam_role.ec2_role.arn
}

output "iam_policy_arn" {
  description = "The ARN of the IAM policy"
  value       = aws_iam_role_policy.ec2_policy.arn
}

output "ec2_instance_with_iam_id" {
  description = "The ID of the EC2 instance with IAM role"
  value       = aws_instance.server_with_iam.id
}

output "ec2_instance_with_iam_public_ip" {
  description = "The public IP of the EC2 instance with IAM role"
  value       = aws_instance.server_with_iam.public_ip
}

output "iam_instance_profile_arn" {
  description = "The ARN of the IAM instance profile"
  value       = aws_iam_instance_profile.ec2_instance_profile.arn
}
