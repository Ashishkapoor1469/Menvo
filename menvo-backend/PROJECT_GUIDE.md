# Menvo Project Guide

Menvo is a powerful backend application designed for **Restaurant and Menu Management**. It allows restaurant owners to create digital menus, organize them into categories, and manage menu items with ease.

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **PostgreSQL** database
- **Prisma CLI** (`npm install -g prisma`)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in a `.env` file (refer to `.env.test` for required fields like `DATABASE_URL` and `JWT_SECRET`).
4. Push the database schema:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run start:dev
   ```

---

## 🛠️ Technology Stack
- **Framework**: [NestJS](https://nestjs.com/) (v11)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (Passport.js)
- **Validation**: Class-validator & Joi
- **Language**: TypeScript

---

## 🔌 API Documentation

The API is versioned and prefixed. The base URL is:
`http://localhost:3000/menvo/v1`

### 1. Authentication (`/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and receive JWT token | No |

### 2. Restaurant (`/restraunt`)
*Note: The endpoint uses the spelling `restraunt`.*

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/restraunt/register` | Register a new restaurant for the user | Yes (JWT) |
| `GET` | `/restraunt/restaurant-greet` | Test protected route | Yes (JWT) |

### 3. Categories (`/:slug/category`)
*Note: `:slug` refers to the restaurant's unique slug.*

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/:slug/category/create` | Create a new category in a restaurant | Yes (JWT) |
| `PATCH` | `/:slug/category/update/:id` | Update an existing category by ID | Yes (JWT) |
| `GET` | `/:slug/category/categories` | Get all categories for a restaurant | No |
| `GET` | `/:slug/category/greet` | Public test route | No |

### 4. Menu Items (`/menu`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/menu/create` | Add a new menu item to a category | Yes (JWT) |

---

## 📊 Data Model (Prisma)

- **User**: Stores owner details (email, name, password).
- **Restaurant**: Owned by a User. Has a unique `slug`, name, and bio.
- **Category**: Belongs to a Restaurant. Used to group items (e.g., "Starters", "Main Course").
- **MenuItem**: Belongs to a Category. Includes name, description, price, and availability.

---

## 💡 Frontend Integration Tips

1. **Authentication**: Store the JWT token received from `/auth/login` in `localStorage` or a secure cookie. Include it in the `Authorization` header as `Bearer <token>` for protected routes.
2. **Slug-based Routing**: Use the restaurant `slug` (e.g., `my-cafe`) to fetch categories and menus for a specific restaurant landing page.
3. **Validation**: The backend uses strict validation. Ensure your DTOs match the expected JSON structure (refer to `src/**/dtos/*.dto.ts`).
