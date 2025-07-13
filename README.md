# Todo List API (Backend)

This is the backend service for a full-stack Todo application. It is a RESTful API built with Node.js, Express, and PostgreSQL that handles all data management and business logic for tasks.

## Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **Environment Variables**: `dotenv`

## API Endpoints

| Method | Endpoint         | Description                   |
| :----- | :--------------- | :---------------------------- |
| `GET`  | `/todos`         | Fetches all todo items.       |
| `POST` | `/todos`         | Creates a new todo item.      |
| `PUT`  | `/todos/:id`     | Updates a todo item entirely. |
| `PATCH`| `/todos/:id`     | Partially updates a todo item.|
| `DELETE`| `/todos/:id`    | Deletes a todo item.          |

## Local Setup

1.  **Clone the repository.**
2.  **Navigate to the directory:**
    ```bash
    cd todo-api
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
    -   Create a `.env` file in the root directory.
    -   Add your PostgreSQL connection details (`DB_USER`, `DB_HOST`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`).
5.  **Run the server:**
    ```bash
    npm run dev
    ```
The API will be running on `http://localhost:3002`.