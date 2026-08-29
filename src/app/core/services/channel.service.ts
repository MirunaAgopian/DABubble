import { Injectable } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  getDocs,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../app.config';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  async isChannelNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const q = query(collection(db, 'channels'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) {
      return false;
    }
    return true;
  }

  async createChannel(
    name: string,
    currentUserId: string,
    currentUserName: string,
    members: string[],
    description?: string,
  ) {
    const channelRef = doc(collection(db, 'channels'));
    const newChannel: Channel = {
      id: channelRef.id,
      name,
      description,
      createdAt: Date.now(),
      createdBy: currentUserId,
      creatorName: currentUserName,
      members,
    };
    await setDoc(channelRef, newChannel);
  }

  fetchChannels(): Observable<Channel[]> {
    const ref = collection(db, 'channels');
    const q = query(ref, orderBy('name', 'asc'));
    return new Observable((subscriber) => {
      return onSnapshot(q, (snapshot) => {
        const channels = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Channel[];
        subscriber.next(channels);
      });
    });
  }

  async addMember(channelId: string, user: User) {
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { members: arrayUnion(user.id) });
  }

  async removeMember(channelId: string, user: User) {
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { members: arrayRemove(user.id) });
  }

  async updateChannelData(channelId: string, newName: string, newDescription: string) {
    const taken = await this.isChannelNameTaken(newName, channelId);
    if (taken) {
      throw new Error('Channel name already exists!');
    }
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { name: newName, description: newDescription });
  }
}
