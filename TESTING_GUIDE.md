# Comprehensive Testing Guide

## Overview

This project includes comprehensive test coverage for both frontend and backend components, with a focus on face recognition features, API endpoints, and user interactions.

## Test Structure

### Backend Tests (`backend/tests/`)

#### Test Files
- `test_main.py` - Main API endpoints
- `test_public_chat.py` - Public chat endpoints
- `test_study_decision.py` - Study decision endpoints
- `test_recommendations.py` - Recommendations endpoints
- `test_face_recognition.py` - Face recognition endpoints (NEW)

#### Running Backend Tests
```bash
cd backend
pytest tests/ -v                    # Run all tests
pytest tests/test_face_recognition.py -v  # Run face recognition tests
pytest tests/ -v --cov=app         # With coverage
pytest tests/ -v --cov=app --cov-report=html  # HTML coverage report
```

### Frontend Tests (`frontend/__tests__/`)

#### Test Files
- `lib/store/auth.test.ts` - Authentication store
- `lib/api/chatbot.test.ts` - Chatbot API
- `lib/api/study-decision.test.ts` - Study decision API
- `lib/api/resources.test.ts` - Resources API
- `features/face-recognition/api.test.ts` - Face recognition API (NEW)
- `features/face-recognition/useCamera.test.ts` - Camera hook (NEW)

#### Running Frontend Tests
```bash
cd frontend
npm test                              # Run all tests
npm test -- --watch                   # Watch mode
npm test -- --coverage                # With coverage
npm test -- features/face-recognition # Run specific tests
```

## Test Coverage

### Backend Coverage

#### Face Recognition Tests (`test_face_recognition.py`)
- ✅ Face status endpoint (with/without auth)
- ✅ Face detection endpoint
- ✅ Face analysis endpoint
- ✅ Face registration endpoint
- ✅ Face verification endpoint
- ✅ MongoDB connection handling
- ✅ Error handling
- ✅ Service layer tests

**Coverage Areas:**
- Authentication requirements
- Input validation
- Error responses
- MongoDB integration
- Service layer functionality

### Frontend Coverage

#### Face Recognition API Tests (`api.test.ts`)
- ✅ `getFaceStatus()` - Status fetching
- ✅ `detectFaces()` - Face detection
- ✅ `analyzeFace()` - Emotion analysis
- ✅ `registerFace()` - Face registration
- ✅ `verifyFace()` - Face verification
- ✅ Error handling
- ✅ Base64 image conversion

#### Camera Hook Tests (`useCamera.test.ts`)
- ✅ Initial state
- ✅ Camera start/stop
- ✅ Error handling
- ✅ Cleanup on unmount
- ✅ Video ready state
- ✅ Image capture

**Coverage Areas:**
- API calls and responses
- Error handling
- State management
- Hook lifecycle
- Browser API mocking

## Writing New Tests

### Backend Test Template

```python
def test_feature_name(sync_client, mock_user):
    """Test description"""
    with patch('module.function', return_value=mock_value):
        response = sync_client.post(
            "/api/endpoint",
            json={"data": "value"},
            headers={"Authorization": "Bearer token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "expected_field" in data
```

### Frontend Test Template

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', async () => {
    // Test implementation
    expect(result).toBe(expected);
  });
});
```

## Mocking

### Backend Mocking
- MongoDB connections
- External API calls
- File operations
- Authentication

### Frontend Mocking
- Fetch API calls
- Browser APIs (MediaDevices, localStorage)
- React hooks
- External dependencies

## Continuous Integration

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

See `.github/workflows/ci.yml` for CI configuration.

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mocking**: Mock external dependencies
5. **Coverage**: Aim for >80% code coverage
6. **Speed**: Keep tests fast (<1s per test)
7. **Clarity**: Write readable, maintainable tests

## Running Tests Locally

### Full Test Suite
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

### Specific Test Files
```bash
# Backend
pytest tests/test_face_recognition.py -v

# Frontend
npm test -- features/face-recognition
```

### With Coverage
```bash
# Backend
pytest tests/ -v --cov=app --cov-report=html
# Open htmlcov/index.html

# Frontend
npm test -- --coverage
# Check coverage/ directory
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure test paths are correct
2. **Mock Issues**: Verify mock setup matches actual code
3. **Async Issues**: Use `pytest-asyncio` for async tests
4. **Database Issues**: Use test database, not production
5. **Environment Variables**: Set required env vars for tests

### Debugging Tests

```bash
# Backend - verbose output
pytest tests/ -v -s

# Frontend - watch mode
npm test -- --watch

# Single test
pytest tests/test_file.py::test_function -v
npm test -- -t "test name"
```

## Test Data

- Use fixtures for reusable test data
- Keep test data minimal and focused
- Clean up test data after tests
- Use factories for complex objects

## Performance Testing

For performance-critical features:
- Measure response times
- Test with large datasets
- Check memory usage
- Monitor API rate limits

## Security Testing

- Test authentication requirements
- Verify authorization checks
- Test input validation
- Check for SQL injection
- Verify XSS protection

## Next Steps

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests
- [ ] Add load testing
- [ ] Add security testing
- [ ] Increase coverage to >90%




