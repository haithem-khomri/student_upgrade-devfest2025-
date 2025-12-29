# Testing Setup Guide

## Frontend Testing

### Framework
- **Jest** - Test runner
- **React Testing Library** - Component testing
- **@testing-library/jest-dom** - DOM matchers

### Configuration
- `jest.config.js` - Jest configuration with Next.js support
- `jest.setup.js` - Global test setup and mocks

### Running Tests
```bash
cd frontend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # With coverage
```

### Test Files
- `__tests__/lib/store/auth.test.ts` - Authentication store
- `__tests__/lib/api/chatbot.test.ts` - Chatbot API
- `__tests__/lib/api/study-decision.test.ts` - Study decision API
- `__tests__/lib/api/resources.test.ts` - Resources API

## Backend Testing

### Framework
- **pytest** - Test runner
- **pytest-asyncio** - Async test support
- **pytest-cov** - Coverage reporting
- **httpx** - HTTP client for testing

### Configuration
- `pytest.ini` - Pytest configuration
- `tests/conftest.py` - Test fixtures and setup

### Running Tests
```bash
cd backend
pytest tests/ -v              # Run all tests
pytest tests/ -v --cov=app   # With coverage
pytest tests/test_main.py    # Run specific file
```

### Test Files
- `tests/test_main.py` - Main API endpoints
- `tests/test_public_chat.py` - Public chat endpoints
- `tests/test_study_decision.py` - Study decision endpoints
- `tests/test_recommendations.py` - Recommendations endpoints

## Test Coverage

### Current Coverage
- **Frontend**: Core API clients and stores
- **Backend**: Main endpoints and public routes (~39% code coverage)

### Areas Covered
- ✅ Authentication flows
- ✅ API endpoint responses
- ✅ Error handling
- ✅ Data validation
- ✅ Public endpoints

## Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Frontend Tests
  run: cd frontend && npm test

- name: Run Backend Tests
  run: cd backend && pytest tests/ -v
```

