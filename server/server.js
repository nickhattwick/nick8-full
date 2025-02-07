const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const AWS = require('aws-sdk');
const path = require('path');
const jwt = require('jsonwebtoken'); // Added for token generation
require('dotenv').config();
const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

// Passport configuration for Google OAuth
require('./passport-setup');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(
  cors({
    origin: '*', // Allow all origins for development; specify allowed origins in production
    credentials: true, // Allow session cookie from browser to pass through
  })
);

// Session setup for Express
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Secret used to sign the session ID cookie, store in .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());

// Authentication Middleware using JWT
function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log('Authorization header missing');
    return res.status(401).send('Authorization header missing');
  }

  const token = authHeader.split(' ')[1]; // Assuming 'Bearer TOKEN'

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Invalid token');
      return res.status(401).send('Invalid token');
    }
    req.user = decoded; // Attach user info to the request
    next();
  });
}

// Define Google Auth Routes

// Web application routes
app.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

app.get(
  '/api/auth/google/redirect',
  passport.authenticate('google'),
  (req, res, next) => {
    req.logIn(req.user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`${process.env.REACT_APP_CLIENT_URL}/dashboard`);
    });
  }
);

// Mobile application routes
app.get(
  '/api/auth/google/mobile',
  passport.authenticate('googleMobile', {
    scope: ['profile', 'email'],
  })
);

app.get(
  '/api/auth/google/redirect/mobile',
  passport.authenticate('googleMobile'),
  (req, res, next) => {
    req.logIn(req.user, (err) => {
      if (err) {
        return next(err);
      }

      // Generate a JWT token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.emails[0].value },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Redirect to your app using the custom scheme
      const redirectUri = `nk8://home?token=${encodeURIComponent(token)}`;
      return res.redirect(redirectUri);
    });
  }
);

// Get User Badges (Protected Route)
app.get('/api/user/badges', isAuthenticated, async (req, res) => {
  const email = req.user.email;

  const params = {
    TableName: 'NickBadges',
    Key: { UserEmail: email },
  };

  try {
    const data = await dynamoDb.get(params).promise();
    if (data.Item && data.Item.Badges) {
      res.json({ badges: data.Item.Badges });
    } else {
      // Return an empty list if no badges are found
      res.json({ badges: [] });
    }
  } catch (error) {
    console.error('Error getting user badges:', error);
    res.status(500).json({ error: 'Error getting user badges' });
  }
});

// Add Badge to User (Protected Route)
app.post('/api/user/add-badge', isAuthenticated, async (req, res) => {
  const { badge } = req.body;
  const email = req.user.email;

  // Get existing badges
  const getParams = {
    TableName: 'NickBadges',
    Key: { UserEmail: email },
  };

  try {
    const data = await dynamoDb.get(getParams).promise();

    // Check if badges exist, otherwise initialize with an empty list
    const existingBadges = data.Item && data.Item.Badges ? data.Item.Badges : [];

    // Add the new badge
    if (!existingBadges.includes(badge)) {
      existingBadges.push(badge);

      const updateParams = {
        TableName: 'NickBadges',
        Key: { UserEmail: email },
        UpdateExpression: 'SET Badges = :badges',
        ExpressionAttributeValues: { ':badges': existingBadges },
        ReturnValues: 'UPDATED_NEW',
      };

      await dynamoDb.update(updateParams).promise();
      res.json({ message: 'Badge added successfully', badges: existingBadges });
    } else {
      res.json({ message: 'Badge already exists', badges: existingBadges });
    }
  } catch (error) {
    console.error('Error adding badge:', error);
    res.status(500).json({ error: 'Error adding badge' });
  }
});

// Get User Streak (Protected Route)
app.get('/api/user/streak', isAuthenticated, async (req, res) => {
  const email = req.user.email;

  const params = {
    TableName: 'Nick8Streaks',
    Key: { UserEmail: email },
  };

  try {
    const data = await dynamoDb.get(params).promise();
    if (data.Item) {
      res.json({
        streak: data.Item.Streak || 0,
        lastUpdated: data.Item.LastUpdated || null,
      });
    } else {
      // Return streak of 0 if not found
      res.json({ streak: 0, lastUpdated: null });
    }
  } catch (error) {
    console.error('Error getting user streak:', error);
    res.status(500).json({ error: 'Error getting user streak' });
  }
});

// Update User Streak (Protected Route)
app.post('/api/user/update-streak', isAuthenticated, async (req, res) => {
  const { streak } = req.body;
  const email = req.user.email;

  // Get the current streak data
  const getParams = {
    TableName: 'Nick8Streaks',
    Key: { UserEmail: email },
  };

  try {
    const data = await dynamoDb.get(getParams).promise();
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const lastUpdated = data.Item?.LastUpdated?.split('T')[0]; // Last updated date in YYYY-MM-DD format

    if (lastUpdated === today) {
      // Prevent multiple updates on the same day
      return res.status(400).json({ message: 'Streak already updated today' });
    }

    const updateParams = {
      TableName: 'Nick8Streaks',
      Key: { UserEmail: email },
      UpdateExpression: 'SET Streak = :streak, LastUpdated = :now',
      ExpressionAttributeValues: {
        ':streak': streak,
        ':now': now.toISOString(),
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const updatedData = await dynamoDb.update(updateParams).promise();
    res.json({
      message: 'Streak updated successfully',
      streak: updatedData.Attributes.Streak,
      lastUpdated: updatedData.Attributes.LastUpdated,
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    res.status(500).json({ error: 'Error updating streak' });
  }
});

app.get('/api/user/log-count', isAuthenticated, async (req, res) => {
  const email = req.user.email;

  const params = {
    TableName: 'FoodLogCounts',
    Key: { UserEmail: email },
  };

  try {
    const result = await dynamoDb.get(params).promise();

    if (result.Item) {
      res.json({ totalLogs: result.Item.TotalLogs });
    } else {
      // Return 0 if no logs are found
      res.json({ totalLogs: 0 });
    }
  } catch (error) {
    console.error('Error fetching log count:', error);
    res.status(500).json({ error: 'Error fetching log count' });
  }
});

app.post('/api/user/increment-log-count', isAuthenticated, async (req, res) => {
  const email = req.user.email;

  const params = {
    TableName: 'FoodLogCounts',
    Key: { UserEmail: email },
    UpdateExpression: 'SET TotalLogs = if_not_exists(TotalLogs, :start) + :inc',
    ExpressionAttributeValues: {
      ':start': 0,
      ':inc': 1,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    const result = await dynamoDb.update(params).promise();
    res.json({ message: 'Log count incremented', totalLogs: result.Attributes.TotalLogs });
  } catch (error) {
    console.error('Error incrementing log count:', error);
    res.status(500).json({ error: 'Error incrementing log count' });
  }
});

// Fetch all food entries for the user with timeframe adjustment (Protected Route)
app.get('/api/food-entries/:timeframe', isAuthenticated, async (req, res) => {
  const { timeframe } = req.params;
  const { offset = 0, date, weekStart, weekEnd } = req.query; // Include weekStart and weekEnd from query params
  const email = req.user.email;

  console.log('timeframe:', timeframe);
  console.log('offset:', offset);
  console.log('weekStart:', weekStart);
  console.log('weekEnd:', weekEnd);

  try {
    let data;

    if (timeframe === 'weekly' && weekStart && weekEnd) {
      data = await getWeeklyData(email, weekStart, weekEnd);
      console.log(data);
    } else if (timeframe === 'monthly') {
      data = await getMonthlyData(email, parseInt(offset)); // Pass the offset to the function
      console.log(data);
    } else if (timeframe === 'daily') {
      data = await getDailyData(email, date); // Handle daily data retrieval
      console.log(data);
    } else {
      res
        .status(400)
        .json({ error: 'Invalid timeframe or missing weekStart/weekEnd' });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ error: 'Error fetching food entries' });
  }
});

// Function to get daily data
const getDailyData = async (email, date) => {
  const startOfDay = new Date(date).setHours(0, 0, 0, 0);
  const endOfDay = new Date(date).setHours(23, 59, 59, 999);

  const params = {
    TableName: 'FoodEntries',
    IndexName: 'UserEmail-Timestamp-index',
    KeyConditionExpression: 'UserEmail = :email AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#ts': 'Timestamp',
    },
    ExpressionAttributeValues: {
      ':email': email,
      ':start': new Date(startOfDay).toISOString(),
      ':end': new Date(endOfDay).toISOString(),
    },
  };

  const result = await dynamoDb.query(params).promise();
  return result.Items;
};

const getWeeklyData = async (email, weekStart, weekEnd) => {
  const startOfWeek = new Date(weekStart);
  const endOfWeek = new Date(weekEnd);
  endOfWeek.setDate(endOfWeek.getDate() + 1);

  const params = {
    TableName: 'FoodEntries',
    IndexName: 'UserEmail-Timestamp-index',
    KeyConditionExpression: 'UserEmail = :email AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#ts': 'Timestamp',
    },
    ExpressionAttributeValues: {
      ':email': email,
      ':start': startOfWeek.toISOString(),
      ':end': endOfWeek.toISOString(),
    },
  };

  const result = await dynamoDb.query(params).promise();
  const items = result.Items;

  // Group entries by day
  const groupedData = items.reduce((acc, item) => {
    const date = item.Timestamp.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      };
    }
    acc[date].calories += item.NutritionFacts.calories || 0;
    acc[date].protein += item.NutritionFacts.protein || 0;
    acc[date].carbs += item.NutritionFacts.totalCarbohydrate || 0;
    acc[date].fats += item.NutritionFacts.totalFat || 0;

    return acc;
  }, {});

  return Object.values(groupedData);
};

// Function to get monthly data with offset
const getMonthlyData = async (email, offset = 0) => {
  const now = new Date();

  // Use offset to calculate the target month and year
  const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1); // Adjust for offset

  const startOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    1
  ); // First day of target month
  const endOfMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0
  ); // Last day of target month

  // Log the calculated dates for debugging
  console.log(
    `Fetching data for: Start of month: ${startOfMonth.toISOString()}, End of month: ${endOfMonth.toISOString()}`
  );

  const params = {
    TableName: 'FoodEntries',
    IndexName: 'UserEmail-Timestamp-index',
    KeyConditionExpression: 'UserEmail = :email AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#ts': 'Timestamp',
    },
    ExpressionAttributeValues: {
      ':email': email,
      ':start': startOfMonth.toISOString(),
      ':end': endOfMonth.toISOString(),
    },
  };

  const result = await dynamoDb.query(params).promise();
  const items = result.Items;

  // Group entries by day
  const groupedData = items.reduce((acc, item) => {
    const date = item.Timestamp.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        date,
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      };
    }
    acc[date].calories += item.NutritionFacts.calories || 0;
    acc[date].protein += item.NutritionFacts.protein || 0;
    acc[date].carbs += item.NutritionFacts.totalCarbohydrate || 0;
    acc[date].fats += item.NutritionFacts.totalFat || 0;

    return acc;
  }, {});

  return Object.values(groupedData);
};

// Log a new food entry (Protected Route)
app.post('/api/log-food', isAuthenticated, async (req, res) => {
  const data = req.body;

  const params = {
    TableName: 'FoodEntries',
    Item: {
      EntryId: `${req.user.email}-${Date.now()}`, // Generate unique EntryId
      UserEmail: req.user.email,
      Timestamp: new Date().toISOString(),
      FoodName: data.foodName,
      Ingredients: data.ingredients || [],
      NutritionFacts: data.nutritionFacts || {},
    },
  };

  try {
    await dynamoDb.put(params).promise();
    res.json({ message: 'Food entry logged successfully' });
  } catch (error) {
    console.error('Error logging food entry:', error);
    res.status(500).json({ error: 'Error logging food entry' });
  }
});

// Fetch food data from DynamoDB for the last day, week, or month
const getFoodData = async (email, timeframe) => {
  const now = new Date();
  let startDate;

  if (timeframe === 'weekly') {
    startDate = new Date(now.setDate(now.getDate() - 7)).toISOString();
  } else if (timeframe === 'monthly') {
    startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
  } else {
    // daily
    startDate = new Date(now.setDate(now.getDate() - 1)).toISOString();
  }

  const params = {
    TableName: 'FoodEntries',
    IndexName: 'UserEmail-Timestamp-index', // Use the GSI
    KeyConditionExpression: 'UserEmail = :email AND #ts BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#ts': 'Timestamp',
    },
    ExpressionAttributeValues: {
      ':email': email,
      ':start': startDate,
      ':end': new Date().toISOString(),
    },
  };

  try {
    const data = await dynamoDb.query(params).promise();
    return data.Items;
  } catch (err) {
    console.error(
      'Unable to read items. Error JSON:',
      JSON.stringify(err, null, 2)
    );
  }
};

// Test route for the server (Publicly accessible)
app.get('/api', (req, res) => {
  res.send('Server is running!');
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
