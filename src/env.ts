/**
 * Whether the Allure integration should be a no-op. Set `ALLURE_ENABLED=false` (or `0`)
 * to run rstest without any Allure side effects, e.g. for fast local development while
 * keeping the report only on CI.
 */
export const isAllureDisabled = (): boolean => {
  const value = process.env.ALLURE_ENABLED;
  if (value === undefined || value === '') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '0' || normalized === 'false';
};