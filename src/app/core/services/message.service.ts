import { Injectable } from '@angular/core';
import { Message } from '../interfaces/message.interface';
import {
  collection,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../app.config';
import { Observable } from 'rxjs';
import { Thread } from '../interfaces/thread.interface';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  async createMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    const ref = doc(collection(db, 'messages'));
    const newMessage: Message = {
      ...message,
      id: ref.id,
      createdAt: Date.now(),
    };
    await setDoc(ref, newMessage);
    return newMessage;
  }

  async updateMessage(messageId: string, text: string) {
    const ref = doc(db, 'messages', messageId);
    await updateDoc(ref, { text });
  }

  getMessages(targetType: 'dm' | 'channel' | 'self', targetId: string): Observable<Message[]> {
    const messageQuery = query(
      collection(db, 'messages'),
      where('targetType', '==', targetType),
      where('targetId', '==', targetId),
      orderBy('createdAt', 'asc'),
    );

    return new Observable((subscriber) => {
      return onSnapshot(messageQuery, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ ...doc.data() })) as Message[];
        subscriber.next(messages);
      });
    });
  }

  async addReaction(messageId: string, emoji: string, userId: string) {
    const ref = doc(db, 'messages', messageId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const message = snapshot.data() as Message;
    const reactions = [...(message.reactions ?? [])];
    const existingReaction = reactions.find((reaction) => reaction.emoji === emoji);

    if (existingReaction) {
      if (!existingReaction.userIds.includes(userId)) {
        existingReaction.userIds.push(userId);
      }
    } else {
      reactions.push({
        emoji,
        userIds: [userId],
      });
    }
    await updateDoc(ref, { reactions });
  }

  async removeReaction(messageId: string, emoji: string, userId: string) {
    const ref = doc(db, 'messages', messageId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const message = snapshot.data() as Message;
    const updatedReactions = (message.reactions ?? []).map((reaction) => {
      if (reaction.emoji !== emoji) {
        return reaction;
      }
      return {
        ...reaction,
        userIds: reaction.userIds.filter((id) => id !== userId),
      };
    });
    const reactions = updatedReactions.filter((reaction) => reaction.userIds.length > 0);
    await updateDoc(ref, { reactions });
  }

  // Thread methods
  getThreadsByMessageId(messageId: string): Observable<Thread[]> {
    const messageQuery = query(
      collection(db, 'threads'),
      where('parentMessageId', '==', messageId),
      orderBy('createdAt', 'asc'),
    );

    return new Observable((subscriber) => {
      return onSnapshot(messageQuery, (snapshot) => {
        const threads = snapshot.docs.map((doc) => ({ ...doc.data() })) as Thread[];
        subscriber.next(threads);
      });
    });
  }

  async createThread(thread: Omit<Thread, 'id' | 'createdAt'>) {
    const ref = doc(collection(db, 'threads'));
    const newThread: Thread = {
      ...thread,
      id: ref.id,
      createdAt: Date.now(),
    };
    await setDoc(ref, newThread);
    return newThread;
  }

  async updateThread(threadId: string, text: string) {
    const ref = doc(db, 'threads', threadId);
    await updateDoc(ref, { text });
  }

  async addThreadReaction() {}
  async removeThreadReaction() {}

  getThreadStats(messageId: string) {
    const threadQuery = query(
      collection(db, 'threads'),
      where('parentMessageId', '==', messageId),
      orderBy('createdAt', 'asc'),
    );
    return new Observable((subscriber) => {
      return onSnapshot(threadQuery, (snapshot) => {
        const threads = snapshot.docs.map((doc) => doc.data() as Thread);
        subscriber.next({
          replyCount: threads.length,
          lastReplyTimestamp: threads.length > 0 ? threads[threads.length - 1].createdAt : null,
        });
      });
    });
  }
}
