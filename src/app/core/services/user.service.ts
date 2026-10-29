import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../app.config';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

/**
 * Handles user retrieval, profile updates
 * and user presence information.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  authService = inject(AuthService);

  /**
   * Retrieves a user by id.
   */
  async getUser(uid: string) {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  /**
   * Returns all users as a
   * realtime data stream.
   */
  getAllUsersRealtime(): Observable<User[]> {
    const ref = collection(db, 'users');
    return new Observable((subscriber) => {
      return onSnapshot(ref, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];

        subscriber.next(users);
      });
    });
  }

  /**
   * Returns all users belonging to the "Entwicklerteam" channel.
   * Used to build the default workspace team when creating a channel.
   */
  getEntwicklerteamUsersRealtime() {
    const q = query(collection(db, 'channels'), where('name', '==', 'Entwicklerteam'));
    return new Observable<User[]>((subscriber) => {
      onSnapshot(q, async (snap) => {
        const members = snap.empty ? [] : ((snap.docs[0].data()['members'] as string[]) ?? []);
        const users = await Promise.all(
          members.map((id) => getDoc(doc(db, 'users', id)).then((s) => s.data() as User)),
        );
        subscriber.next(users);
      });
    });
  }

  /**
   * Updates a user's current presence status.
   */
  async updateStatus(uid: string, status: 'online' | 'offline' | 'away') {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { status });
  }

  /**
   * Updates user profile information.
   */
  async updateLastActive(uid: string) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { lastActive: Date.now() });
  }

  /**
   * Updates user profile information.
   */
  async updateUserName(uid: string, data: Partial<User>) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
  }
}
