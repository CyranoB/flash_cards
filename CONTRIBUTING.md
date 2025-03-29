# Contributing to SmartDeck

Thank you for your interest in contributing to SmartDeck! We welcome contributions from the community and are excited to work together to improve this AI-powered study companion. This guide will help you get started with contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Additional Resources](#additional-resources)

## Getting Started

To start contributing to SmartDeck, follow these steps to set up your development environment:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/flash_cards.git
   cd flash_cards
   ```

2. **Install Dependencies**:
   We recommend using `pnpm` as the package manager, as indicated by the `pnpm-lock.yaml` file. However, you can also use `npm` or `yarn`.
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add the necessary environment variables. At a minimum, you will need an OpenAI API key. If you are using Clerk for authentication, include those keys as well.
   ```env
   OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key  # Optional
   CLERK_SECRET_KEY=your_clerk_secret_key  # Optional
   ```

4. **Run the Development Server**:
   Start the development server to ensure everything is set up correctly.
   ```bash
   pnpm dev
   # or
   npm run dev
   # or
   yarn dev
   ```
   Open `http://localhost:3000` in your browser to verify the application is running.

## Development Workflow

To ensure a smooth development process, follow these steps when working on new features or bug fixes:

1. **Create a Feature Branch**:
   - Use a descriptive name for your branch, such as `feature/add-new-study-mode` or `bugfix/fix-flashcard-display`.
   - Branch off from the `main` branch.
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Keep Your Branch Up to Date**:
   - Regularly pull changes from the `main` branch to avoid conflicts.
   ```bash
   git pull origin main
   ```

3. **Write Clear Commit Messages**:
   - Use the present tense ("Add feature" not "Added feature").
   - Include a brief description of the changes.
   - Reference any related issues (e.g., "Fixes #123").

4. **Push Your Changes**:
   - Push your branch to the remote repository.
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

To maintain consistency and quality across the codebase, adhere to the following standards:

- **TypeScript**:
  - Use TypeScript with strict mode enabled.
  - Define types for all components, functions, and variables where applicable.
  - Avoid using `any` unless absolutely necessary.

- **Naming Conventions**:
  - Use camelCase for variable and function names.
  - Use PascalCase for component names and types.
  - Use descriptive names that convey the purpose of the variable or function.

- **Styling**:
  - Use Tailwind CSS for all styling.
  - Avoid inline styles unless necessary.
  - Follow the existing structure and class naming conventions.

- **Code Formatting**:
  - Use Prettier for code formatting.
  - Run `pnpm lint` or `npm run lint` to check for linting errors.
  - Ensure your code is properly indented and easy to read.

- **Component Structure**:
  - Keep components small and focused on a single responsibility.
  - Use functional components with hooks.
  - Extract reusable logic into custom hooks where possible.

## Testing

Testing is crucial to ensure the stability and reliability of SmartDeck. Follow these guidelines for testing:

1. **Write Unit Tests**:
   - Use Jest or the testing framework specified in the project.
   - Write tests for new features and bug fixes.
   - Ensure tests cover both happy paths and edge cases.

2. **Run Tests**:
   - Before submitting changes, run the test suite to ensure all tests pass.
   ```bash
   pnpm test
   # or
   npm run test
   # or
   yarn test
   ```

3. **Test Coverage**:
   - Aim for high test coverage, especially for critical components and functions.
   - Use coverage reports to identify areas that need more testing.

## Submitting Changes

When you are ready to submit your changes, follow these steps:

1. **Create a Pull Request**:
   - Open a pull request (PR) against the `main` branch.
   - Use a clear and descriptive title for your PR.
   - Include a detailed description of the changes, including:
     - What was changed and why.
     - How to test the changes.
     - Any relevant screenshots or logs.

2. **Reference Issues**:
   - If your PR addresses an existing issue, reference it in the description (e.g., "Fixes #123").

3. **Ensure Reviewability**:
   - Make sure your PR is concise and focused on a single feature or fix.
   - Avoid including unrelated changes.
   - Ensure all tests pass and the code is linted.

4. **Respond to Feedback**:
   - Be open to feedback and make necessary adjustments.
   - Engage in discussions with reviewers to clarify any questions.

## Additional Resources

For more information and resources, refer to the following:

- **Project Documentation**: Check the `docs` directory for detailed documentation on the project's architecture, API, and more.
- **Code of Conduct**: We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please read it to understand the expected behavior in our community.
- **GitHub Issues**: Browse existing issues to see what needs attention or to report new bugs or features.
