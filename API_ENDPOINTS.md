# Wedsy Bidding API Endpoints

This document contains all the cURL endpoints used in the bidding section of the Wedsy application.

## Base Configuration

- **Base URL**: `http://localhost:8090`
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer Token required for all endpoints

## Authentication

All endpoints require a JWT token in the authorization header:
```bash
-H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Bidding Endpoints

### 1. Get Bidding Data
Get specific bidding details by ID.

```bash
curl -X GET "http://localhost:8090/order?source=Bidding&biddingId=YOUR_BIDDING_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Bidding Pending Count
Get the count of pending bidding requests.

```bash
curl -X GET "http://localhost:8090/order?source=Bidding&stats=Pending" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Personal Package Pending Count
Get the count of pending personal package requests.

```bash
curl -X GET "http://localhost:8090/order?source=Personal-Package&stats=Pending" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Accept Bidding Bid
Accept a specific bidding bid (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_BIDDING_ID/accept-bidding-bid" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "bid": 7500,
    "vendor_notes": "Will be able to do hairstyling complimentary with this"
  }'
```

### 5. Reject Bidding Bid
Reject a specific bidding bid (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_BIDDING_ID/reject-bidding-bid" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Get All Bidding Bids (Vendor View)
Get all bidding bids for the vendor.

```bash
curl -X GET "http://localhost:8090/order?source=Bidding" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Get Package Requests
Get all package requests (both Wedsy and Personal packages).

```bash
curl -X GET "http://localhost:8090/order?source=Packages" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration Endpoints

### 8. Get Booking Amount Configuration
Get the booking amount configuration for calculations.

```bash
curl -X GET "http://localhost:8090/config?code=MUA-BookingAmount" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 9. Get Taxation Configuration
Get the taxation configuration.

```bash
curl -X GET "http://localhost:8090/config?code=MUA-Taxation" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Dashboard Endpoints

### 10. Get Vendor Upcoming Events
Get upcoming events for the vendor dashboard.

```bash
curl -X GET "http://localhost:8090/order?source=upcoming-events" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 11. Get Vendor Revenue
Get revenue data for the vendor dashboard.

```bash
curl -X GET "http://localhost:8090/order?source=revenue" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 12. Get Vendor Stats
Get statistics for the vendor dashboard (leads, confirmed bookings).

```bash
curl -X GET "http://localhost:8090/order?source=stats" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 13. Get Vendor Follow-ups
Get follow-up data (chats and calls) for the vendor dashboard.

```bash
curl -X GET "http://localhost:8090/order?source=follow-ups" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 14. Get Vendor Ongoing Order
Get the ongoing order for the vendor dashboard.

```bash
curl -X GET "http://localhost:8090/order?source=ongoing-order" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## User Bidding Endpoints

### 15. Create New Bidding (User)
Create a new bidding request.

```bash
curl -X POST "http://localhost:8090/bidding" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "events": [
      {
        "eventName": "Day 1",
        "date": "2023-05-18",
        "location": "Taj west end MG road",
        "peoples": [
          {
            "noOfPeople": "2",
            "makeupStyle": "Groom makeup",
            "preferredLook": "North Indian",
            "addOns": "Saree draping, Hairstyling, Lashes"
          }
        ],
        "notes": ["Do it properly"]
      }
    ],
    "requirements": "Special requirements here"
  }'
```

### 16. Get Specific Bidding Details
Get details of a specific bidding.

```bash
curl -X GET "http://localhost:8090/bidding/YOUR_BIDDING_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 17. Update Bidding (User)
Update an existing bidding request.

```bash
curl -X PUT "http://localhost:8090/bidding/YOUR_BIDDING_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "events": [...],
    "requirements": "Updated requirements"
  }'
```

### 18. User View Bidding Bid
Mark a bidding bid as viewed by the user.

```bash
curl -X POST "http://localhost:8090/bidding/YOUR_BIDDING_ID/view/YOUR_BID_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 19. User Accept Bidding Bid
Accept a bidding bid (User action).

```bash
curl -X POST "http://localhost:8090/bidding/YOUR_BIDDING_ID/accept/YOUR_BID_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 20. User Reject Bidding Bid
Reject a bidding bid (User action).

```bash
curl -X POST "http://localhost:8090/bidding/YOUR_BIDDING_ID/reject/YOUR_BID_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Admin Endpoints

### 21. Create Bidding Bids for Existing (Admin)
Create bidding bids for an existing bidding request.

```bash
curl -X POST "http://localhost:8090/bidding/YOUR_BIDDING_ID/create-bids" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Package Endpoints

### 22. Accept Wedsy Package Booking
Accept a Wedsy package booking (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_ORDER_ID/accept-wedsy-package-booking" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 23. Reject Wedsy Package Booking
Reject a Wedsy package booking (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_ORDER_ID/reject-wedsy-package-booking" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 24. Accept Personal Package Booking
Accept a personal package booking (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_ORDER_ID/accept-personal-package-booking" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 25. Reject Personal Package Booking
Reject a personal package booking (Vendor action).

```bash
curl -X POST "http://localhost:8090/order/YOUR_ORDER_ID/reject-personal-package-booking" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Order Endpoints

### 26. Create Order
Create a new order.

```bash
curl -X POST "http://localhost:8090/order" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "source": "Bidding",
    "vendor": "VENDOR_ID",
    "events": [...],
    "bid": 7500
  }'
```

### 27. Get Order
Get a specific order by ID.

```bash
curl -X GET "http://localhost:8090/order/YOUR_ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

### 28. Mark Order as Completed
Mark an order as completed.

```bash
curl -X POST "http://localhost:8090/order/YOUR_ORDER_ID/complete" \
  -H "Content-Type: application/json" \
  -H "authorization: Bearer YOUR_JWT_TOKEN"
```

## Usage Notes

1. **Replace Placeholders**: 
   - `YOUR_JWT_TOKEN` with actual JWT token from login
   - `YOUR_BIDDING_ID` with actual bidding ID
   - `YOUR_BID_ID` with actual bid ID
   - `YOUR_ORDER_ID` with actual order ID
   - `VENDOR_ID` with actual vendor ID

2. **Server Configuration**:
   - Default port: 8090
   - Configurable via PORT environment variable
   - CORS enabled for all origins

3. **Authentication**:
   - All endpoints require JWT token
   - Vendor endpoints require `CheckVendorLogin` middleware
   - User endpoints require `CheckLogin` middleware
   - Admin endpoints require `CheckAdminLogin` middleware

4. **Error Handling**:
   - 400: Bad Request (Incomplete Data)
   - 401: Unauthorized (Invalid Token)
   - 404: Not Found
   - 500: Internal Server Error

5. **Response Format**:
   - Success: `{ "message": "success", "data": {...} }`
   - Error: `{ "message": "error", "error": "error details" }`

## Testing

To test these endpoints, you can use tools like:
- Postman
- Insomnia
- curl command line
- Any HTTP client

Make sure to:
1. Start the server on port 8090
2. Get a valid JWT token by logging in
3. Replace all placeholder values with actual IDs
4. Check the response for success/error messages
