# EnergyCalculator Development Guide

## Before you start
Do not make any changes until you are 95% confident in what you need to build. Ask me follow-up questions until you reach that confidence level.

## Project Structure
This application consists of two projects:

- **Backend** (.NET 10 API)
  - Absolute: `/Users/craiglister/Storage/Repositories/EnergyCalculator/Backend`
  - Relative from project root: `Backend/`

- **Frontend** (React + Vite)
  - Absolute: `/Users/craiglister/Storage/Repositories/EnergyCalculator/Frontend`
  - Relative from project root: `Frontend/`

**Each has its own git repository.**

For frontend development, we want **small components** that are testable and reusable and manageable when needed. We don't want large files.


## Application Architecture

### Backend Layers
The backend is split into layers (in order of dependency, from highest to lowest). For **visual ordering in the IDE**, we prefix project folders and `.csproj` filenames with numbers, but **namespaces remain clean** (without numbers):

1. **API Layer** - `01.{ApplicationName}.API/` folder, `01.{ApplicationName}.API.csproj` file
   - Namespace: `{ApplicationName}.API`
   - Controllers that handle HTTP requests/responses

2. **Service Layer** - `02.{ApplicationName}.Service/` folder, `02.{ApplicationName}.Service.csproj` file
   - Namespace: `{ApplicationName}.Service`
   - Orchestrates business operations (often a pass-through layer)

3. **Logic Layer** - `03.{ApplicationName}.Logic/` folder, `03.{ApplicationName}.Logic.csproj` file
   - Namespace: `{ApplicationName}.Logic`
   - Contains testable business logic (this is where MOST unit tests reside)

4. **Data Layer** - `04.{ApplicationName}.Data/` folder, `04.{ApplicationName}.Data.csproj` file
   - Namespace: `{ApplicationName}.Data`
   - Handles database access via Entity Framework

**SharedLib** - `09.{ApplicationName}.SharedLib/` folder, `09.{ApplicationName}.SharedLib.csproj` file
   - Namespace: `{ApplicationName}.SharedLib`
   - Contains: DTOs, Enums, constants
   - **NO EF ENTITIES** - EF entities must be contained within the Data layer.
   - **NO LOGIC** - only data structures, never business logic

**UnitTests** - `90.{ApplicationName}.UnitTests/` folder, `90.{ApplicationName}.UnitTests.csproj` file
   - Namespace: `{ApplicationName}.UnitTests`
   - Test projects for the layers above

### Backend Project Organization
Each backend project (API, Service, Logic, Data) must strictly follow this folder structure for its code:
- `/Interfaces` - Contains all interface definitions.
- `/Concrete` - Contains all class implementations.
- `/Mappers` - (Data layer only) Contains extension methods for translating between EF Entities and DTOs.
- `/Entities` - (Data layer only) Contains EF Core entity models.

### Testing Scope
- **Unit Tests** cover the **Logic and Service layers only** (where there is testable logic).
- The Service layer is often a pass-through, so most unit tests target the Logic layer.
- We seek to avoid logic in the API and Data layers (keep them thin).
- Extension methods with logic should also be tested in the Logic layer.
- **100% line coverage** means we test all logic paths: happy paths, unhappy paths, and edge cases for every conditional branch.

## Things to remember
1. **State how you are going to achieve the task** I ask and get confirmation via Yes/No that I agree with the plan. If I don't, suggest different options to solve the issue.
2. **Give me updates** now and again for long running tasks so I know how you're progressing
3. **Validate your work** before you complete the task and explain to me how you validated it
4. When doing Frontend changes (React, Vite etc), before you tell me you're complete, **ensure you can do a full build and that all lint issues are resolved.**
5. When you complete a Backend change, ensure that the solution builds and that all the Unit Tests run successfully.
6. **All Logic changes and additions** need to have unit test coverage and the unit test must pass prior to telling me the task is complete.
7. We prefer constant or enums over magic numbers. We want readable, maintainable code.
8. We use excellent coding standards and impliment DRY (Do Not Repeat Yourself) to minimize code duplication.
9. We use the latest version of .NET and React. We use the latest version of all libraries and packages. 
10. **NO references to Entity Framework in the Logic or Service layers or SharedLib.** Data is sent to, and returned from the data access layer via DTOs or method properties only.
11. API Endpoints **ALWAYS return OK(result)**. The result will have the IsSuccess and HttpCode (As Response Code). We don't return BadRequest, or anything. The only time we don't return Ok is if there was an unhandled server error, or via the [Authorize] being violated.
12. NEVER manipulate EF Migration files manually. Always use `dotnet ef migrations add` and `dotnet ef migrations remove`.
13. NEVER manually modify the contents of a migration file. EF will generate them, and if we need to make changes, we will use `dotnet ef migrations remove` and then `dotnet ef migrations add` again.
14. If you are asked to remove a migration, you must remove both the migration file itself and the snapshot file. 
15. **NO REFERENCES TO entityframework IN THE SERVICE LAYER.** I can't say this any clearer. This layer should only contain our business logic. Our logic should be completely independent of our data access layer, our logic does not care about entities, it only cares about results or results that can be passed through to the api to be converted into responses.
16. We do not want different PUT and POST for Create and Update methods. We prefer a single flow for both. So we use Save as a POST, and the logic and whether or not it's a create and update is handled in the logic with the Id being null or not. So we have a single Save method that handles both Create and Update logic.

## Working Directory Management

### IMPORTANT: Each Bash command runs in a FRESH shell
- `cd` does NOT persist between Bash tool calls
- Each command is independent and starts from the current working directory of the session

### Always use absolute paths or full command chains
**NEVER do this:**
```bash
cd SomeFolder
dotnet build
```

**ALWAYS do this:**
```bash
cd /full/path/to/SomeFolder && dotnet build
```
or
```bash
dotnet build --project /full/path/to/SomeFolder/Project.csproj
```

### Project structure reminder

**All commands must explicitly reference which project they target using absolute paths.**

## API Design Standards

### RESTful Principles
- Use **plural nouns** for resource names (e.g., `/api/users`, `/api/teams`, `/api/playbooks`).
- Use appropriate HTTP verbs:
  - `GET /api/users` - Get list (with optional pagination)
  - `GET /api/users/{id}` - Get single item by ID
  - `POST /api/users` - Create new item
  - `PUT /api/users/{id}` - Update entire item
  - `PATCH /api/users/{id}` - Partial update
  - `DELETE /api/users/{id}` - Delete item
- **NEVER use verbs in the endpoint path** (e.g., `api/getuser`, `api/createuser` are incorrect).
- We do **NOT use API versioning** at this time.
- All endpoints must be properly documented with XML comments.

### Request/Response Pattern
- API endpoints should use **Request objects** when there are **multiple parameters** or **complex parameter binding** needs (e.g., pagination, filtering, optional query strings).
- For simple endpoints (single route parameter, no parameters, or a single optional query parameter), use primitive parameters directly without a Request wrapper.
- **Never create empty Request classes** (with no properties) or Request classes with a single property that could be a primitive parameter.
- Examples:
  - ✅ `GET /api/users/{id}` → `GetUser(Guid id)`
  - ✅ `GET /api/user` (no params) → `GetUsers()`
  - ✅ `GET /api/user?page=1&size=50` → `GetUsers([FromQuery] GetUsersRequest request)` (multiple params)
  - ✅ `GET /api/user?includeArchived=true` → `GetUsers([FromQuery] bool includeArchived)` (single optional - primitive OK)
- All endpoints return a **Response** object wrapped in `BaseResponse<T>`.
- Response types for list/get operations that support pagination should include `PaginationBase` (a standard class with fields like `PageNumber`, `PageSize`, `TotalCount`, `TotalPages`).
- BaseResponse allows for future extensibility (e.g., adding warnings, metadata).

### Logging
All API endpoints will log:
- The endpoint name
- Duration in milliseconds
- Use `Information` level for successful requests, `Error` for failures
- Example log structure: `"GET /api/user executed in {duration}ms"`

## Frontend Rules

1. **Never use a modal** in the frontend. All screen have their own pages.
2. **Always do a lint check** on the front end before saying it's done and before we commit
3. We use a `features` folder for each feature in the frontend, organized by **UI route/page** (e.g., `features/login/`, `features/dashboard/`, `features/users/`). Each feature folder should have its own `components` folder for components specific to that feature.
4. We use a `components` folder for shared components used across multiple features.
5. We use a `services` folder for API services used across multiple features.
6. We use a `store` folder for state management used across multiple features.
7. We use a `types` folder for type definitions used across multiple features.
8. We avoid using abbreviations for naming variables, such as `CancellationToken ct`. Instead, we use `CancellationToken cancellationToken`'. Exceptions would be common things like `Id id`.
9. We use **PascalCase** for all method and class names.
10. We use **camelCase** for all variable names.
11. We use **PascalCase** for all property names.


## Backend Rules

0. **NO EF Entities outside the Data Layer**:
   - **CRITICAL ARCHITECTURAL RULE**: `using AccuTipping.Data.Entities;` is **ONLY** allowed in the Data layer (`04.AccuTipping.Data`).
   - The **Service layer**, **Logic layer**, and **API layer** must **NEVER** import or use EF entities directly.
   - All communication between layers happens via **DTOs only**. DTOs are defined in SharedLib.
   - Exception: The Logic layer may read entity properties through repository interface methods (read-only inspection), but must **NEVER** create or modify entities directly.
   - Rationale: This maintains clean architectural separation and makes the codebase testable, maintainable, and independent of database implementation details.

1. **All dates** are stored as UTC in the database and displayed in the user's timezone in the frontend.
2. **Reference Data** and other seeded data is ONLY seeded by the EF .HasData. No ad-hoc queries.OnlyList<LookupDto>`).
3. **Primary Key Exposure**:
   - Tables in any schema **EXCEPT** the `ref` schema are **transactional tables**.
   - We **NEVER expose the primary key** of transactional tables outside the Data layer.
   - We only expose `ExternalId` (a GUID) to upper layers.
   - Outside the Data layer, reference `ExternalId` as `Id` (type `Guid`). The Data layer maps it back to `ExternalId`.
   - Method names should **NOT** mention `ExternalId`. Use `GetUserByIdAsync`, **NOT** `GetUserByExternalIdAsync`.
4. **Reference Data** (from `ref` schema):
   - Reference tables are exposed via **LookupDto**, which contains: `Id` (int), `Name` (string), `MetaData` (string, optional).
   - When a DTO has a foreign key to a reference table (e.g., UserDto has `GenderId` → Gender table), the DTO property should be the full `LookupDto` (e.g., `Gender: LookupDto`), not just the ID.
   - This provides both the ID and the displayable description in one object.
5. **All API methods are async** - use `async`/`await` and return `Task<T>`.
6. **All API endpoints will accept a Request type object** and **respond with a Response type object** using `BaseResponse<T>` (see API Design Standards above). We **NEVER** return an object directly.
7. **Database Migrations**:
   - **Always use EF CLI tools** (`dotnet ef migrations add`, `dotnet ef database update`).
   - **NEVER edit or manually create migration files** - they are generated automatically by EF.
   - **Migration workflow**:
     - Generate migrations **after** the feature code is complete and has been tested locally.
     - Do **NOT** run `database update` automatically on application startup.
     - After feature validation, **instruct the developer**: "There is a database update ready to be sent to the database via `ef database update`."
     - The developer is responsible for executing the update against the target database.
     - Always commit the generated migration files to git.
8. **Always make sure the solution builds** before saying it's done and before we commit.
9. **Always use absolute paths** when referencing files in the backend (e.g., `/full/path/to/file.cs`).
10. Treat **warnings as errors** - fix all warnings by writing proper code, not by suppressing them.
11. All .NET solutions make use of **Serilog** for logging. No other logging frameworks are used (OpenTelemetry logging is NOT used).
12. Extensive logging with appropriate levels:
    - `Debug` - arbitrary/debugging information
    - `Information` - business logic operations (successful operations, key milestones)
    - `Warning` - potential issues that don't cause failure (e.g., fallback behavior, invalid input that's handled)
    - `Error` - actual errors that cause operation failure
    - `Critical` - critical system failures
13. By default, **log to the console**. Additional sinks (files, databases, etc.) are configured via `appsettings.json`.
14. We don't use abriviations for naming variables, For example `CancellationToken ct`. Instead, we use `CancellationToken cancellationToken`'. Exceptions would be common things like `Id id`. Another example of **wrong** is `_wlRepository.UpdateAsync` and should be `_workLocationRepository.UpdateAsync`.

## Testing Guidelines

- We currently perform **unit testing only** (no integration tests or E2E tests at this time).
- Unit tests target the **Logic and Service layers** where testable logic exists. (See Application Architecture above for detailed layer explanation.)
- **100% line coverage** means we test all logic paths:
  - Happy paths (expected successful outcomes)
  - Unhappy paths (expected failures, error conditions)
  - Edge cases (boundary conditions, nulls, empty inputs, max/min values)
- Test data can use fixtures, factories, or the **Arrange-Act-Assert (AAA)** pattern.
- **All tests must pass** before a task is marked complete.
- When writing tests for extension methods, place them in the appropriate test project following the same coverage principles.
- When we have a failing unit test, we don't just edit the unit AAAs to make it work. We first validate the reason for the failure and our first instunct is to see what changed to cause the failing test. If it's a genuine coding issue such as, we added a new paramter to a method, then we fix the test. 
