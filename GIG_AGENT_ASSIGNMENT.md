# Gig-Agent Assignment Feature

## Overview
This feature allows users to assign agents to gigs by clicking the "Match" button in the matching dashboard. When a match is confirmed, it creates a gig-agent assignment in the backend and sends an email notification to the agent.

## How it works

### 1. Match Selection
- Users can select a gig from the dashboard
- The system displays matching agents based on skills, languages, and availability
- Users can click on any match to view detailed comparison

### 2. Assignment Process
- Click the "Match" button in the results table or "Confirm Match" in the modal
- The system calls the `/api/gig-agents` endpoint with:
  ```json
  {
    "agentId": "680b63026204b8b9ba9f13ea",
    "gigId": "685c0110614ab3e834e5174b"
  }
  ```

### 3. Backend Response
The API returns a response with:
- Assignment confirmation message
- Gig-agent object with match details
- Email sent status
- Match score

### 4. User Feedback
- Success message shows assignment confirmation and email status
- Error message if assignment fails
- Loading state during API call
- Modal automatically closes after successful assignment

## API Endpoint

**URL:** `https://api-matching.harx.ai/api/gig-agents`
**Method:** POST
**Content-Type:** application/json

### Request Body
```json
{
  "agentId": "string",
  "gigId": "string"
}
```

### Response
```json
{
  "message": "Assignation créée avec succès",
  "gigAgent": {
    "matchDetails": {
      "languageMatch": { ... },
      "skillsMatch": { ... },
      "scheduleMatch": { ... }
    },
    "_id": "string",
    "agentId": { ... },
    "gigId": { ... },
    "status": "pending",
    "matchScore": 0,
    "emailSent": true,
    "agentResponse": "pending"
  },
  "emailSent": true,
  "matchScore": 0
}
```

## Environment Variables

Add this to your `.env` file:
```
VITE_MATCHING_API_URL=https://api-matching.harx.ai/api
```

## Database Model

The gig-agent assignment is stored in MongoDB with the following schema:
- `agentId`: Reference to Agent model
- `gigId`: Reference to Gig model
- `status`: Assignment status (pending, accepted, rejected, completed, cancelled)
- `matchScore`: Matching score (0-1)
- `matchDetails`: Detailed matching analysis
- `emailSent`: Whether notification email was sent
- `agentResponse`: Agent's response status

## Features

- **Real-time feedback**: Loading states and success/error messages
- **Email notifications**: Automatic email sending to assigned agents
- **Match analysis**: Detailed comparison of skills, languages, and availability
- **Status tracking**: Track assignment status and agent responses
- **Duplicate prevention**: Unique constraint on agentId + gigId combination

## Usage

1. Navigate to the matching dashboard
2. Select a gig from the list
3. Review matching agents
4. Click "Match" on any agent
5. Review detailed comparison in the modal
6. Click "Confirm Match" to assign the agent
7. Wait for confirmation message
8. Modal closes automatically after successful assignment 