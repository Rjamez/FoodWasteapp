# Food Waste Reduction App

# Problem Statement

Food waste is a significant global issue, and people may struggle to manage their food consumption and reduce waste effectively. There's a lack of easy-to-use platforms that help users track food expiry dates, manage leftovers, and plan meals efficiently.

# Solution

The Food Waste Reduction App allows users to track the expiration dates of their food items, receive reminders to use them before they spoil, and share or donate excess food. This app aims to reduce food waste and promote sustainable food practices.

# User Stories

User Registration/Login: As a user, I want to create an account so that my food tracking data is saved.Acceptance Criteria: I can register with an email and password and verify my account.

Add/Update/Delete Food Item: As a user, I want to add food items to my list with expiry dates.Acceptance Criteria: I can input food names, expiry dates, and quantities.

Track Expiry: As a user, I want to receive notifications for items nearing expiry.Acceptance Criteria: I get a reminder 1-2 days before the food expires.

Manage Items: As a user, I want to mark food items as used or thrown away.Acceptance Criteria: I can remove expired or used-up items from my list.

# Admin Stories

Manage Users: As an admin, I want to manage user accounts to ensure data accuracy.Acceptance Criteria: I can view, block, or remove users from the platform.

# Models

User Model: user_id (PK), name, email (unique), password, is_verified
FoodItem Model: food_id (PK), name, quantity, expiry_date, user (ForeignKey to User)
Donation Model: donation_id (PK), food_item (ForeignKey to FoodItem), user (ForeignKey to User), donation_date

# Model Relationships

A User can have multiple FoodItems.
A FoodItem can be marked for Donation by a User.

Here is the Github Repository link:<https://github.com/Rjamez/FoodWasteapp>
Here is the link to the Google slides:<<https://docs.google.com/presentation/d> 1kM1oQ1T5gaHpJ45ygl652zr5QJB0TEw1TXxbdfazRjw/edit#slide=id.p>
Here is the link to the video recording presentation:<https://drive.google.com/file/d/1Z1DvCqEmWa81LZhanoHwoRlMrowzI7oC/view?usp=drive_link>
