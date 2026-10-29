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

/**
 * Handles channel creation, updates, and member management.
 * Keeps channel data synchronized with Firestore in realtime.
 */
@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  /**
   * Checks whether a channel name
   * is already being used.
   */
  async isChannelNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const q = query(collection(db, 'channels'), where('name', '==', name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return false;
    if (excludeId && snapshot.docs[0].id === excludeId) {
      return false;
    }
    return true;
  }

  /**
   * Creates a new channel and stores
   * it in Firestore.
   */
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

  /**
   * Returns all channels as a realtime stream.
   */
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

  /**
   * Returns a single channel as a
   * realtime stream.
   */
  fetchChannelById(channelId: string): Observable<Channel> {
    const ref = doc(db, 'channels', channelId);
    return new Observable((subscriber) => {
      return onSnapshot(ref, (snapshot) => {
        const channel = {
          id: snapshot.id,
          ...snapshot.data(),
        } as Channel;
        subscriber.next(channel);
      });
    });
  }

  /**
   * Adds a user to a channel.
   */
  async addMember(channelId: string, user: User) {
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { members: arrayUnion(user.id) });
  }

  /**
   * Removes a user from a channel.
   */
  async removeMember(channelId: string, user: User) {
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { members: arrayRemove(user.id) });
  }

  /**
   * Updates channel information after
   * validating that the channel name
   * is still unique.
   */
  async updateChannelData(channelId: string, newName: string, newDescription: string) {
    const taken = await this.isChannelNameTaken(newName, channelId);
    if (taken) {
      throw new Error('Channel name already exists!');
    }
    const ref = doc(db, 'channels', channelId);
    await updateDoc(ref, { name: newName, description: newDescription });
  }
}
