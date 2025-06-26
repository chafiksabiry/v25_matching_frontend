# New Matching Endpoints Integration

This document describes the integration of the new matching endpoints into the HARX Smart Matching System frontend.

## New Endpoints

The following endpoints have been integrated:

### 1. Find Agents for Gig
- **Endpoint**: `POST /gigs/find-agents-for-gig`
- **Purpose**: Find matching agents for a specific gig
- **Request Body**:
  ```json
  {
    "gigId": "685c0110614ab3e834e5174b",
    "weights": {
      "experience": 0.15,
      "skills": 0.2,
      "industry": 0.15,
      "language": 0.1,
      "availability": 0.1,
      "timezone": 0.05,
      "performance": 0.2,
      "region": 0.05
    }
  }
  ```
- **Response**: Returns a `MatchResponse` object with matches and statistics

### 2. Find Gigs for Agent
- **Endpoint**: `POST /gigs/find-gigs-for-agent`
- **Purpose**: Find matching gigs for a specific agent
- **Request Body**:
  ```json
  {
    "agentId": "680b63026204b8b9ba9f13ea",
    "weights": {
      "experience": 0.15,
      "skills": 0.2,
      "industry": 0.15,
      "language": 0.1,
      "availability": 0.1,
      "timezone": 0.05,
      "performance": 0.2,
      "region": 0.05
    }
  }
  ```
- **Response**: Returns an array of matches

## Frontend Changes

### API Integration (`src/api/index.ts`)

1. **Updated `findMatchesForGig` function**:
   - Now uses `POST /gigs/find-agents-for-gig`
   - Includes proper error handling and data validation
   - Returns a `MatchResponse` object

2. **Updated `findGigsForRep` function**:
   - Now uses `POST /gigs/find-gigs-for-agent`
   - Handles different response structures
   - Returns an array of matches

3. **Updated `generateOptimalMatches` function**:
   - Implemented client-side matching logic as fallback
   - Uses basic scoring algorithm when backend endpoint is not available

### Type Definitions (`src/types/index.ts`)

1. **Enhanced `Match` interface**:
   - Added more flexible `agentInfo` structure
   - Made detailed matching properties optional
   - Added support for different data structures

2. **Updated `MatchResponse` interface**:
   - Made statistics properties optional
   - Improved compatibility with different response formats

### Component Updates (`src/components/MatchingDashboard.tsx`)

1. **Improved error handling**:
   - Better handling of different response structures
   - Graceful fallbacks when data is missing

2. **Enhanced data display**:
   - Shows basic agent information when detailed matching data is unavailable
   - More resilient to different data structures

3. **Fixed response handling**:
   - Properly handles arrays vs objects in responses
   - Better console logging for debugging

## Testing

A test file `test_new_endpoints.js` has been created to verify the endpoints are working correctly:

```bash
node test_new_endpoints.js
```

This will test:
- Finding agents for a gig
- Finding gigs for an agent
- Retrieving all gigs

## Environment Configuration

Make sure your environment variables are set correctly:

```env
VITE_API_URL=http://localhost:5011/api
VITE_API_URL_GIGS=https://api-gigsmanual.harx.ai/api
```

## Usage

The frontend now automatically uses the new endpoints:

1. **When selecting a gig**: The system calls `find-agents-for-gig` to find matching agents
2. **When selecting an agent**: The system calls `find-gigs-for-agent` to find matching gigs
3. **For optimal matching**: Uses client-side logic as fallback

## Data Structure Compatibility

The system is designed to handle different response structures:

- **Detailed matching data**: When available, shows comprehensive skill and language matching
- **Basic agent data**: When detailed matching is not available, shows basic agent information
- **Fallback handling**: Gracefully handles missing or incomplete data

## Error Handling

The system includes comprehensive error handling:

- Network errors are caught and displayed to users
- Invalid response structures are logged and handled gracefully
- Missing data is handled with appropriate fallbacks
- Console logging helps with debugging

## Future Improvements

1. **Backend optimization**: The `generateOptimalMatches` function could be moved to the backend
2. **Caching**: Implement caching for frequently requested matches
3. **Real-time updates**: Add WebSocket support for real-time match updates
4. **Advanced filtering**: Add more sophisticated filtering options

## Troubleshooting

If you encounter issues:

1. Check the browser console for error messages
2. Verify the API endpoints are accessible
3. Ensure the environment variables are set correctly
4. Run the test file to verify endpoint functionality
5. Check the network tab in browser dev tools for API calls 