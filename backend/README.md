# Backend

## Technical Stack

TypeScript, Node.js, Express.js, PostgreSQL

## Features

- CRUD APIs for duties. Also an api for delete all duties that is useful for e2e testings.
- Validation for duties input.
  - Name of duties can't be empty and too long.
- Automatically trim input values for duties to remove unnecessary whitespace.

### Utilities for Error Handling

1. By default, `express` can't handle errors thrown from async request handler. So defined [RouteService](./src/route/route.ts) to handle it.
2. Defined [RouteErrorHandler](./src/route/util.ts) to handle error and return the desired response to client.

## Testing strategy

This project includes unit tests that don't involve external dependencies and integration tests that involve PostgreSQL. See [Useful Commands](#useful-commands) for how to run them.

### Explanation for `createNull` or `createTestInstance` convention

In this project, some classes have creation methods like `<ClassName>.create...`, `<ClassName>.createNull...` or `<ClassName>.createTestInstance` respectively. They are patterns learnt from [Testing Without Mocks: A Pattern Language](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks) by James Shore.

`create...` is the creation method for production code.

`createNull...` is the creation method that can be used in testing side to support parameterless instantiation and provide some fake implementation for some external dependencies to enhance testability and maintainability of unit test test cases. It creates a “Nulled” instance that disables all external communication, but behaves normally in every other respect.

`createTestInstance` is the creation method of entity or value objects in testing side that support parameterized instantiation. It is not expected to be called in production code while `createNull...` might be used in production code when building a prototype.

See [Nullable](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks#nullables) and [Parameterless Instantiation](https://www.jamesshore.com/v2/projects/nullables/testing-without-mocks#instantiation) for more details.

## Local Development

See [Setup in root README](../README.md#setup) for how to setup.

### Useful Commands

#### `make dev-with-db`

This command starts the backend server in development mode along with a local PostgreSQL database running inside a Docker container.

#### `make run-db-and-integration-test`

Run integration tests involving PostgreSQL after initiating a local database in a Docker container.

#### `make clean-db`

Fully reset and clean the local PostgreSQL Docker image. Noted that some setting of image can't be reset if simply using `docker compose down` but this command can.

#### `yarn test:watch`

Run unit tests in watch mode. Noted that this excludes integration tests.

See [package.json](./package.json) for more details and different commands.
