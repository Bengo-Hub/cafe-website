# Contributing to Urban Loft Cafe Website

Thank you for your interest in contributing to the Urban Loft Cafe website!

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cafe-website
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

## Code Standards

### TypeScript
- Use TypeScript for all files
- Define proper interfaces and types
- Avoid `any` type
- Export types from `src/types/`

### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props

### Naming Conventions
- Components: PascalCase (`MenuItemCard.tsx`)
- Files: kebab-case (`menu-utils.ts`)
- Functions: camelCase (`fetchMenuItems`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Keep responsive breakpoints consistent
- Use custom colors from theme

### File Organization
```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components
│   └── features/    # Feature-specific components
├── lib/             # Utilities
├── hooks/           # Custom hooks
├── types/           # TypeScript types
└── config/          # Configuration
```

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Commit Messages
Follow conventional commits:
```
feat: add menu filtering functionality
fix: resolve login redirect issue
docs: update README with new env variables
style: format code with prettier
refactor: extract menu card logic
test: add tests for menu filtering
chore: update dependencies
```

### Pull Request Process
1. Create a branch from `develop`
2. Make your changes
3. Write/update tests
4. Run linter: `pnpm lint`
5. Run tests: `pnpm test`
6. Create pull request to `develop`
7. Request review from team
8. Address feedback
9. Merge after approval

## Testing

### Unit Tests
```bash
pnpm test
```

Write tests for:
- Utility functions
- Custom hooks
- Complex components
- Business logic

### E2E Tests
```bash
pnpm test:e2e
```

Cover critical user flows:
- Menu browsing
- Form submissions
- Authentication
- Order tracking

### Manual Testing
- Test on Chrome, Firefox, Safari
- Test on mobile devices (iOS, Android)
- Test offline mode (PWA)
- Test different screen sizes

## Code Review Guidelines

When reviewing code:
- Check for TypeScript errors
- Verify tests are included
- Ensure code follows standards
- Check for accessibility issues
- Verify responsive design
- Test on mobile devices

## Documentation

- Update README for new features
- Add JSDoc comments for complex functions
- Update sprint docs when completing tasks
- Document API integrations

## Common Tasks

### Adding a New Page
1. Create route in `src/app/`
2. Create component file
3. Add to navigation (if needed)
4. Add SEO meta tags
5. Test responsiveness
6. Update documentation

### Adding a Component
1. Create component file in appropriate directory
2. Define TypeScript prop types
3. Implement component
4. Add to index exports
5. Write unit tests
6. Document usage (if complex)

### Integrating a Service
1. Add service URL to config
2. Create API client function
3. Define response types
4. Implement error handling
5. Add loading states
6. Test integration
7. Update documentation

## BengoBox Standards

Follow the broader BengoBox guidelines:
- Use ASCII characters in code
- Add comments only for non-obvious logic
- Follow microservice patterns
- Use shared libraries where applicable
- Maintain clean folder structure
- Avoid code duplication

## Questions?

- Check existing documentation first
- Ask in team chat
- Create an issue for bugs
- Request features via pull requests

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
