import { inject, Injectable } from '@angular/core';
import { collection, doc, getDoc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../app.config';
import { User } from '../interfaces/user.interface';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  authService = inject(AuthService);
  async getUser(uid: string) {
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  //this function is an observale and automatically subscribes to changes-not an async promise
  getAllUsersRealtime(): Observable<User[]> {
    const ref = collection(db, 'users');
    return new Observable((subscriber) => {
      return onSnapshot(ref, (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
        const currentUserId = this.authService.getCurrentUserId();
        users.sort((a, b) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return a.name.localeCompare(b.name);
        });
        subscriber.next(users);
      });
    });
  }

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

  async updateStatus(uid: string, status: 'online' | 'offline' | 'away') {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { status });
  }

  async updateLastActive(uid: string) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, { lastActive: Date.now() });
  }

  async updateUserName(uid: string, data: Partial<User>) {
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
  }
}
