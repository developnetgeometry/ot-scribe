# E2E Tests - Holiday Management System

## Overview

This directory contains end-to-end tests for the OTMS Holiday Management System (Story 7.3). Tests are written using Playwright and cover all acceptance criteria and user workflows.

## Test Coverage

### Story 7.3: Manual Holiday Override System

**Acceptance Criteria Covered:**

1. **AC1 - Holiday List Display**
   - Display current year holidays
   - Edit and delete actions visible for override holidays
   - Override indicators displayed correctly

2. **AC2 - Add Holiday Form**
   - Form opens with all required fields
   - Date picker, name input, type select, description
   - Form validation works correctly
   - Successfully creates new holidays

3. **AC3 - Audit Trail** (Verified in database/service tests)

4. **AC4 - Override Precedence**
   - Override badges displayed for manual holidays
   - Scraped holidays show without override indicator

5. **AC5 - Bulk Import**
   - Bulk import dialog opens correctly
   - Template download available
   - CSV upload area functional
   - Validation and progress indicators

6. **AC6 - Delete Confirmation**
   - Confirmation dialog shown before deletion
   - Warning for emergency holidays
   - Cancel functionality works
   - Deletion completes successfully

7. **AC7 - Notification Integration** (Verified in service tests)

## Test Files

- `holiday-management.spec.ts` - Main E2E test suite with 15+ test scenarios

## Running Tests

### Run all E2E tests (headless)
```bash
npm run test:e2e
```

### Run with UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run with visible browser (headed mode)
```bash
npm run test:e2e:headed
```

### View test report
```bash
npm run test:e2e:report
```

## Test Scenarios

### 1. Holiday List Display
- ✅ Displays current year holidays
- ✅ Shows edit/delete actions for overrides
- ✅ Displays override indicators
- ✅ Year navigation works correctly

### 2. Add Holiday Workflow
- ✅ Opens add dialog correctly
- ✅ Has all required form fields
- ✅ Validates required fields
- ✅ Successfully creates holidays

### 3. Edit Holiday Workflow
- ✅ Prevents editing scraped holidays
- ✅ Allows editing override holidays
- ✅ Date field disabled during edit

### 4. Delete Workflow
- ✅ Shows confirmation dialog
- ✅ Warning for emergency holidays
- ✅ Cancel works correctly

### 5. Bulk Import Workflow
- ✅ Opens bulk import dialog
- ✅ Template download available
- ✅ File upload area exists
- ✅ CSV file validation

### 6. Edge Cases
- ✅ Empty state when no holidays
- ✅ Company state not configured error

## Prerequisites

Before running tests, ensure:

1. **Development server is configured** (or will auto-start)
2. **Test data** - Tests create temporary data during execution
3. **Authentication** - Tests assume authentication or mock setup

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Parallel execution enabled
- Screenshots on failure
- Trace on first retry

## CI/CD Integration

Tests are configured to:
- Run in CI with retries (2 attempts)
- Generate HTML reports
- Capture screenshots on failure
- Run in headless mode on CI

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Add API mocking for isolated tests
- [ ] Add performance testing
- [ ] Add accessibility (a11y) tests
- [ ] Add mobile viewport tests

## Troubleshooting

### Tests failing locally?
1. Ensure dev server is running: `npm run dev`
2. Check browser installation: `npx playwright install`
3. Clear test data between runs
4. Check console for errors

### Timeout issues?
- Increase timeout in `playwright.config.ts`
- Check network latency
- Verify server startup time

## Best Practices

1. **Test Independence** - Each test should be independent
2. **Clean State** - Tests should not depend on previous test data
3. **Descriptive Names** - Test names clearly describe what is being tested
4. **Assertions** - Use explicit assertions with meaningful messages
5. **Selectors** - Use role-based selectors when possible for accessibility

## Maintenance

When updating the Holiday Management UI:
1. Review affected test scenarios
2. Update selectors if needed
3. Add new tests for new features
4. Run full test suite before committing

## Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Story 7.3 Specification](../docs/stories/7-3-manual-holiday-override-system.md)
- [Architecture Documentation](../docs/architecture.md)
