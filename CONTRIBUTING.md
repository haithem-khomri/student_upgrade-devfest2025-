# Contributing Guide

Thank you for your interest in contributing to the AI-Powered Student Productivity Platform!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/devfest2025.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "feat: your feature description"`
7. Push: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Code Style

### Frontend (TypeScript/React)
- Use TypeScript for all new files
- Follow ESLint rules
- Use functional components with hooks
- Write tests for new components

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints
- Write docstrings for functions
- Write tests for new endpoints

## Security

**IMPORTANT**: Never commit:
- API keys or secrets
- Database credentials
- `.env` files
- Personal information

Always use `.env.example` files as templates.

## Testing

Before submitting a PR:
- Run frontend tests: `cd frontend && npm test`
- Run backend tests: `cd backend && pytest`
- Test manually in development mode

## Commit Messages

Use conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation
- `style:` for formatting
- `refactor:` for code refactoring
- `test:` for tests
- `chore:` for maintenance

Example: `feat: add mood detection to dashboard`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md if applicable
5. Request review from maintainers

Thank you for contributing! 🎉

