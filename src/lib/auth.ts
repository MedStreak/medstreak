import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { GoogleAuthProvider, OAuthProvider, deleteUser, signInWithCredential, signOut } from 'firebase/auth';
import { Platform } from 'react-native';
import { getFirebase } from './firebase';

let configured = false;
function configureGoogle() {
  if (configured) return;
  GoogleSignin.configure({
    // "Web client ID" from Google Cloud / Firebase Auth > Google provider. Required to get an ID token.
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  configured = true;
}

export const appleSignInAvailable = Platform.OS === 'ios';

export async function signInWithGoogle(): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error('Chat is not configured');
  configureGoogle();
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  if (res.type !== 'success' || !res.data.idToken) return; // cancelled
  await signInWithCredential(fb.auth, GoogleAuthProvider.credential(res.data.idToken));
}

export async function signInWithApple(): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error('Chat is not configured');
  const rawNonce = Crypto.randomUUID();
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const apple = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
    if (!apple.identityToken) throw new Error('No identity token from Apple');
    const credential = new OAuthProvider('apple.com').credential({ idToken: apple.identityToken, rawNonce });
    await signInWithCredential(fb.auth, credential);
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return;
    throw e;
  }
}

export async function signOutUser(): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  try {
    configureGoogle();
    await GoogleSignin.signOut();
  } catch {}
  await signOut(fb.auth);
}

/** In-app account deletion (required by App Store rules). May need a fresh sign-in first. */
export async function deleteAccount(): Promise<'deleted' | 'needs-recent-login'> {
  const fb = getFirebase();
  if (!fb?.auth.currentUser) return 'deleted';
  try {
    await deleteUser(fb.auth.currentUser);
    return 'deleted';
  } catch (e) {
    if ((e as { code?: string }).code === 'auth/requires-recent-login') return 'needs-recent-login';
    throw e;
  }
}
