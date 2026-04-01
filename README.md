# Titanbay Private Markets API

A RESTful backend service for managing private market funds, investors, and investments. Built with Express.js, TypeScript, Prisma ORM, and PostgreSQL.

## Overview

This API provides endpoints for:
- **Fund Management**: Create, list, update, and retrieve private equity funds
- **Investor Management**: Manage investor profiles and relationships
- **Investment Tracking**: Record and track investor commitments to funds

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js v5.x
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Custom validation utilities
- **Development**: ts-node-dev for hot-reloading

## Setup & Installation

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ running locally or accessible
- Git

### Installation Steps

1. **Clone and navigate to the repository:**
   ```bash
   cd titanbay-test
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cat > .env << EOF
   DATABASE_URL="postgresql://prisma:prisma@localhost:5432/titanbay"
   PORT=3000
   NODE_ENV=development
   EOF
   ```

   Ensure PostgreSQL is running and the database exists:
   ```bash
   createdb titanbay
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

5. **Seed sample data (optional):**
   ```bash
   npm run seed
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

   Server will run at `http://localhost:3000`

7. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Server status check

### Funds

#### List all funds
```http
GET /funds
```
Response (200 OK):
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Titanbay Growth Fund I",
    "vintage_year": 2024,
    "target_size_usd": 250000000.00,
    "status": "Fundraising",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

#### Create a fund
```http
POST /funds
Content-Type: application/json

{
  "name": "Titanbay Growth Fund II",
  "vintage_year": 2025,
  "target_size_usd": 500000000.00,
  "status": "Fundraising"
}
```
Response (201 Created):
```json
{
  "id": "223e4567-e89b-12d3-a456-426614174001",
  "name": "Titanbay Growth Fund II",
  "vintage_year": 2025,
  "target_size_usd": 500000000.00,
  "status": "Fundraising",
  "created_at": "2024-09-22T14:20:00Z"
}
```

#### Get a specific fund
```http
GET /funds/{id}
```

#### Update a fund
```http
PUT /funds
Content-Type: application/json

{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Titanbay Growth Fund I",
  "vintage_year": 2024,
  "target_size_usd": 300000000.00,
  "status": "Investing"
}
```

### Investors

#### List all investors
```http
GET /investors
```

#### Create an investor
```http
POST /investors
Content-Type: application/json

{
  "name": "CalPERS",
  "investor_type": "Institution",
  "email": "privateequity@calpers.ca.gov"
}
```
Valid investor_type values: `Individual`, `Institution`, `FamilyOffice`

#### Get a specific investor
```http
GET /investors/{id}
```

#### Update an investor
```http
PUT /investors
Content-Type: application/json

{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Updated Name",
  "investor_type": "Institution",
  "email": "new@example.com"
}
```

### Investments

#### List investments for a fund
```http
GET /funds/{fund_id}/investments
```
Response (200 OK):
```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440004",
    "investor_id": "770e8400-e29b-41d4-a716-446655440002",
    "fund_id": "550e8400-e29b-41d4-a716-446655440000",
    "amount_usd": 50000000.00,
    "investment_date": "2024-03-15"
  }
]
```

#### Create an investment
```http
POST /funds/{fund_id}/investments
Content-Type: application/json

{
  "investor_id": "880e8400-e29b-41d4-a716-446655440003",
  "amount_usd": 75000000.00,
  "investment_date": "2024-09-22"
}
```
Response (201 Created):
```json
{
  "id": "aa0e8400-e29b-41d4-a716-446655440005",
  "investor_id": "880e8400-e29b-41d4-a716-446655440003",
  "fund_id": "550e8400-e29b-41d4-a716-446655440000",
  "amount_usd": 75000000.00,
  "investment_date": "2024-09-22"
}
```

## Error Handling

All errors follow a consistent JSON response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2024-09-22T14:20:00Z"
  }
}
```

### Common Error Codes

| Status | Code | Meaning |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Input validation failed |
| 400 | INVALID_ID | Invalid UUID format |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists (e.g., duplicate email) |
| 500 | ERROR | Internal server error |

## Data Model

### Fund
- `id` (UUID): Unique identifier
- `name` (string): Fund name
- `vintage_year` (integer): Year established (≥1980)
- `target_size_usd` (decimal): Target fund size
- `status` (enum): Fundraising | Investing | Closed
- `created_at` (datetime): Creation timestamp

### Investor
- `id` (UUID): Unique identifier
- `name` (string): Investor name
- `investor_type` (enum): Individual | Institution | FamilyOffice
- `email` (string): Valid email address (unique)
- `created_at` (datetime): Creation timestamp

### Investment
- `id` (UUID): Unique identifier
- `investor_id` (UUID): Reference to investor
- `fund_id` (UUID): Reference to fund
- `amount_usd` (decimal): Investment amount
- `investment_date` (date): Date of investment
- Constraint: Each investor can invest in a fund only once

## Design Decisions & Assumptions

1. **UUID-based IDs**: Chosen over incremental integers for better distributed system compatibility and privacy.

2. **Database Constraints**: 
   - Unique email constraint on investors for data integrity
   - Unique (investor_id, fund_id) constraint to prevent duplicate investments
   - Cascading deletes when funds or investors are deleted

3. **Decimal Type for Amounts**: Used Prisma's Decimal type for precise financial calculations, avoiding floating-point precision issues.

4. **Investment Date as Date Only**: Stored as DATE type (not TIMESTAMP) as per specification, matching typical fund accounting practices.

5. **Error Codes**: Implemented custom error tracking for better API debugging and client-side handling.

6. **Stateless Design**: Server designed to be stateless for horizontal scalability; all state in PostgreSQL.

## How AI Was Used

This project was developed using GitHub Copilot and other AI assistance tools to accelerate the development process:

- **Schema Generation**: AI helped design the Prisma schema with proper relationships and constraints
- **Boilerplate Code**: Express route handlers with error handling were generated and refined
- **Validation Logic**: Input validation utilities were scaffolded and customized
- **Error Handling**: Consistent error response patterns were generated and standardized
- **API Response Formatting**: Transforming Prisma Decimal types to JSON-safe formats

The AI tools helped focus development on architectural decisions and business logic rather than repetitive boilerplate, enabling rapid delivery of a well-structured, maintainable codebase.

## Development Notes

- The application validates all inputs before database operations
- All monetary amounts are stored as DECIMAL(15,2) for precision
- Dates are stored in ISO 8601 format and returned as date-only strings for investments
- The API server gracefully shuts down on SIGINT/SIGTERM signals, closing database connections

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
psql -U prisma -d titanbay -c "SELECT 1"

# Reset migration state if needed
npx prisma migrate reset
```

### Port Already in Use
```bash
# Change PORT in .env or kill the process using port 3000
lsof -i :3000
kill -9 <PID>
```

## License

ISC
