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

/**
 * Handles message creation, realtime data access, reactions and thread management.
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  /**
   * Creates a new message.
   */
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

  /**
   * Updates the text of an existing message.
   */
  async updateMessage(messageId: string, text: string) {
    const ref = doc(db, 'messages', messageId);
    await updateDoc(ref, { text });
  }

  /**
   * Returns messages for the active conversation as a realtime data stream
   * for Current Channel, Current DM or Self Chat
   */
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

  /**
   * Returns all messages stored in Firestore (chat, DM, self-chat, threads) as a realtime stream.
   * Used for global search functionality.
   */
  getAllMessages(): Observable<Message[]> {
    const messagesQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    return new Observable((subscriber) => {
      return onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Message);
        subscriber.next(messages);
      });
    });
  }

  /**
   * Returns a single message as a realtime data stream.
   * Used when updates for a specific
   * message need to be tracked.
   */
  getMessageByIdRealtime(messageId: string): Observable<Message> {
    const ref = doc(db, 'messages', messageId);
    return new Observable((subscriber) => {
      return onSnapshot(ref, (snapshot) => {
        if (snapshot.exists()) {
          subscriber.next(snapshot.data() as Message);
        }
      });
    });
  }

  /**
   * Adds a reaction to a message.
   * Creates a new reaction or adds the user to an existing one.
   */
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

  /**
   * Removes a user's reaction from a message.
   */
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

  // THREAD METHODS

  /**
   * Returns thread replies for a
   * specific message as a realtime stream.
   */
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

  /**
   * Creates a new thread reply.
   */
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

  /**
   * Updates the text of a thread reply.
   */
  async updateThread(threadId: string, text: string) {
    const ref = doc(db, 'threads', threadId);
    await updateDoc(ref, { text });
  }

  /**
   * Adds a reaction to a thread reply.
   *
   * Creates a new reaction or adds the user to an existing one.
   */
  async addThreadReaction(threadId: string, emoji: string, userId: string) {
    const ref = doc(db, 'threads', threadId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const thread = snapshot.data() as Thread;
    const reactions = [...(thread.reactions ?? [])];
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

  /**
   * Removes a user's reaction from a thread reply.
   */
  async removeThreadReaction(threadId: string, emoji: string, userId: string) {
    const ref = doc(db, 'threads', threadId);
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return;
    const thread = snapshot.data() as Thread;
    const updatedReactions = (thread.reactions ?? []).map((reaction) => {
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

  /**
   * Returns realtime statistics for a thread.
   *
   * Used to display the reply count and latest reply information beneath a parent message.
   */
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
