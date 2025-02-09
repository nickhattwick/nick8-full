provider "aws" {
  region = var.aws_region
}

resource "aws_instance" "server" {
  ami                  = var.ami_id
  instance_type        = var.instance_type
  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name

  tags = {
    Name = "ServerInstance"
  }
}

resource "aws_dynamodb_table" "nick_badges" {
  name           = "NickBadges"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "UserEmail"

  attribute {
    name = "UserEmail"
    type = "S"
  }

  tags = {
    Name = "NickBadgesTable"
  }
}

resource "aws_dynamodb_table" "nick_streaks" {
  name           = "Nick8Streaks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "UserEmail"

  attribute {
    name = "UserEmail"
    type = "S"
  }

  tags = {
    Name = "NickStreaksTable"
  }
}

resource "aws_dynamodb_table" "food_log_counts" {
  name           = "FoodLogCounts"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "UserEmail"

  attribute {
    name = "UserEmail"
    type = "S"
  }

  tags = {
    Name = "FoodLogCountsTable"
  }
}

resource "aws_dynamodb_table" "food_entries" {
  name           = "FoodEntries"
  billing_mode   = "PROVISIONED"
  hash_key       = "EntryId"

  attribute {
    name = "EntryId"
    type = "S"
  }

  attribute {
    name = "UserEmail"
    type = "S"
  }

  attribute {
    name = "Timestamp"
    type = "S"
  }

  global_secondary_index {
    name            = "UserEmail-Timestamp-index"
    hash_key        = "UserEmail"
    range_key       = "Timestamp"
    projection_type = "ALL"
    write_capacity  = 5
    read_capacity   = 5
  }

  tags = {
    Name = "FoodEntriesTable"
  }
}

resource "aws_iam_role" "ec2_role" {
  name = var.iam_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_policy" {
  name   = var.iam_policy_name
  role   = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Effect   = "Allow"
        "Resource": [
          "arn:aws:dynamodb:us-east-1:118228647830:table/UserWorkouts",
          "arn:aws:dynamodb:us-east-1:118228647830:table/UserExercises",
          "arn:aws:dynamodb:us-east-1:118228647830:table/FoodEntries",
          "arn:aws:dynamodb:us-east-1:118228647830:table/FoodEntries/index/*",
          "arn:aws:dynamodb:us-east-1:118228647830:table/Nick8Streaks",
          "arn:aws:dynamodb:us-east-1:118228647830:table/NickBadges",
          "arn:aws:dynamodb:us-east-1:118228647830:table/FoodLogCounts"
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = var.iam_instance_profile_name
  role = aws_iam_role.ec2_role.name
}
