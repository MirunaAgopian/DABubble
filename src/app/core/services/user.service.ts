import { Injectable } from '@angular/core';
import { collection, doc, getDoc, getDocs, updateDoc} from 'firebase/firestore';
import { db } from '../../app.config'; 
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  async getUser(uid: string){
    const ref = doc(db, 'users', uid);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() : null;
  }

  async getAllUsers(){
    const ref = collection(db, 'users');
    const snapshot = await getDocs(ref);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  }

  async updateStatus(uid: string, status: 'online' | 'offline' | 'away'){
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {status});
  }

  async updateLastActive(uid:string){
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, {lastActive: Date.now()});
  }

  async updateUserName(uid:string, data: Partial<User>){
    const ref = doc(db, 'users', uid);
    await updateDoc(ref, data);
  }
}
