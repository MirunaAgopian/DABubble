import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { User } from '../interfaces/user.interface';
import { doc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db, auth } from '../../app.config';

/**
 * Handles user authentication and account access.
 *
 * Provides registration, login, logout, Google sign-in,
 * and password reset functionality.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = auth;

  /**
   * Creates a new user account and stores
   * the user profile in Firestore.
   */
  async registerUser(name: string, email: string, password: string, avatarUrl: string) {
    const userCredentials = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = userCredentials.user.uid;
    const newUser: User = {
      id: uid,
      name,
      email,
      avatarUrl,
      provider: 'password',
      createdAt: Date.now(),
      lastActive: Date.now(),
      status: 'online',
    };
    await setDoc(doc(db, 'users', uid), newUser);
  }

  /**
   * Signs in an existing user using
   * email and password credentials.
   */
  async loginUser(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential;
    } catch (error) {
      console.error('LOGIN ERROR:', error);
      throw error;
    }
  }

  /**
   * Authenticates a user through
   * Google Sign-In and creates or updates
   * the user profile.
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;
    const uid = user.uid;
    const newUser: User = {
      id: uid,
      name: user.displayName || '',
      email: user.email || '',
      avatarUrl: user.photoURL || '/assets/img/avatars/default_user.png',
      provider: 'google',
      createdAt: Date.now(),
      lastActive: Date.now(),
      status: 'online',
    };

    await setDoc(doc(db, 'users', uid), newUser, { merge: true });
  }

  /**
   * Signs out the currently authenticated user.
   */
  async logoutUser() {
    await this.auth.signOut();
  }

  /**
   * Sends a password reset link
   * to the specified email address.
   */
  sendResetPasswordLink(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  /**
   * Returns the id of the currently
   * authenticated user.
   */
  getCurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }
}
