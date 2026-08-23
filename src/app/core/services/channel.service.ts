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
} from 'firebase/firestore';
import { db } from '../../app.config';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  async createChannel(
    name: string,
    currentUserId: string,
    currentUserName: string,
    description?: string,
  ) {
    try {
      const q = query(collection(db, 'channels'), where('name', '==', name));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        throw new Error('Channel name already exists!');
      }
      const channelRef = doc(collection(db, 'channels'));
      const newChannel: Channel = {
        id: channelRef.id,
        name,
        description,
        createdAt: Date.now(),
        createdBy: currentUserId,
        creatorName: currentUserName,
        members: [currentUserId],
      };
      await setDoc(channelRef, newChannel);
    } catch (error) {
      console.error(error);
    }
  }

  fetchChannels(): Observable<Channel[]> {
    const ref = collection(db, 'channels');

    return new Observable((subscriber) => {
      return onSnapshot(ref, (snapshot) => {
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
    try {
      const q = query(collection(db, 'channels'), where('name', '==', newName));
      const snapshot = await getDocs(q);
      if (!snapshot.empty && snapshot.docs[0].id !== channelId) {
        throw new Error('Channel name already exists!');
      }
      const ref = doc(db, 'channels', channelId);
      await updateDoc(ref, { name: newName, description: newDescription });
    } catch (error) {
      console.error(error);
    }
  }
}
