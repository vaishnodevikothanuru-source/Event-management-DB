// MongoDB Initialization Script for Event Sphere Flexible Document Collections
db = db.getSiblingDB('eventsphere_mongo');

db.createCollection('ai_conversations');
db.createCollection('chat_messages');
db.createCollection('event_activity');
db.createCollection('dynamic_survey_responses');
db.createCollection('recommendation_history');
db.createCollection('notification_history');

db.ai_conversations.createIndex({ "eventId": 1, "userId": 1, "createdAt": -1 });
db.chat_messages.createIndex({ "eventId": 1, "senderId": 1, "receiverId": 1 });
db.event_activity.createIndex({ "eventId": 1, "timestamp": -1 });

print("Event Sphere MongoDB collections and indexes initialized successfully.");
