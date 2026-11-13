import { Linking } from 'react-native';

/** Public legal pages. Update here if they move to a different address. */
export const PRIVACY_POLICY_URL = 'https://claude.ai/artifact/KtPgEj8rRn4b3bR6CvbJdE';
export const TERMS_URL = 'https://claude.ai/artifact/FGeeFQgSZhMKnRUDfjydGB';

export function openPrivacyPolicy() {
  Linking.openURL(PRIVACY_POLICY_URL).catch(() => {});
}
export function openTerms() {
  Linking.openURL(TERMS_URL).catch(() => {});
}
