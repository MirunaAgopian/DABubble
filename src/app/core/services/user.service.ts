import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, updateDoc} from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  firestore = inject(Firestore);

  async getUser(uid: string){
    const ref = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async getAllUsers(){
    const ref = collection(this.firestore, 'users');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  async updateStatus(uid: string, status: 'online' | 'offline' | 'away'){
    const ref = doc(this.firestore, 'users', uid);
    await updateDoc(ref, {status});
  }

  async updateLastActive(uid:string){
    const ref = doc(this.firestore, 'users', uid);
    await updateDoc(ref, {lastActive: Date.now()});
  }
}
