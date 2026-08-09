import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { User } from '../interfaces/user.interface';
import { doc, setDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { db } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = getAuth();

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

  async loginUser(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logoutUser() {
    await this.auth.signOut();
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;
    const uid = user.uid;
    const newUser: User = {
      id: uid,
      name: user.displayName || '',
      email: user.email || '',
      avatarUrl: user.photoURL || '',
      provider: 'google',
      createdAt: Date.now(),
      lastActive: Date.now(),
      status: 'online',
    };

    await setDoc(doc(db, 'users', uid), newUser, { merge: true });
  }
}
