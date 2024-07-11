# Contributing to [Project Name]

Thank you for considering contributing to Shortcut Assistant! Here are some guidelines and best practices to follow.

## Code Style and Conventions

Opening any one file in the codebase may reveal code conforming to different styles. This is reflective
of the project's history and the introduction of new patterns mid-development. To maintain consistency,
all future code should follow the guidelines outlined below, and when modifying existing code, try to
update it to match these guidelines.

### Export Default Placement

To maintain consistency, `export default` should be placed at the end of the file. 

**Example:**

```typescript
// Incorrect
export default function myFunction(): void {
  // function code
}

// Correct
function myFunction(): void {
  // function code
}

export default myFunction;
```

## Project Structure

To keep the project organized, please follow the directory structure guidelines for different types of scripts.

### Service Workers

Service worker scripts should be placed under the relevant feature's `service-worker` directory.

**Example:**
```
<relevant-feature>/
  service-worker/
    service-worker.js
```

Note that a feature may, and most likely should, have multiple service worker files. They can be named
according to their purpose, e.g. `service-worker/cache.js`, `service-worker/register.js`, etc.

If a feature is not complex enough to warrant a separate directory, the service worker file can be
placed directly under the feature's root directory.

### Content Scripts

Content scripts should be placed under the relevant feature's `content-scripts` directory.

**Example:**
```
<relevant-feature>/
  content-scripts/
    content-script.js
```
If a feature is not complex enough to warrant a separate directory, the content-scripts file can be
placed directly under the feature's root directory.


## Best Practices

- Follow the existing code style and conventions, referring to more recent code for guidance.
- Write clear and concise commit messages.
- Ensure your changes are well-documented.

## Contribution Process

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Write your code and add tests if applicable.
4. Run `yarn test` to ensure all tests pass and `yarn lint` to ensure your code follows most style guidelines.
4. Submit a pull request to the `develop` branch.
