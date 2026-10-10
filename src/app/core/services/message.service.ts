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
} from 'firebase/firestore';
import { db } from '../../app.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  async createMessage(message: Omit<Message, 'id' | 'createdAt'>) {
    const ref = doc(collection(db, 'messages'));
    const newMessage: Message = {
      ...message,
      id: ref.id,
      createdAt: new Date(),
    };
    await setDoc(ref, newMessage);
    return newMessage;
  }

  async updateMessage(messageId: string, text: string) {
    const ref = doc(collection(db, 'messages', messageId));
    await updateDoc(ref, { text });
  }

  getMessages(targetType: 'dm' | 'channel' | 'self', targetId: string): Observable<Message[]> {
    const messageQuery = query(
      collection(db, 'messages'),
      where('targetType', '==', targetType),
      where('targetId', '==', targetId),
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

  //for later
  getThreadMessages() {}
  replyToThread() {}
  getThreadCount() {}
}
