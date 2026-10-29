import { Injectable } from '@angular/core';
import { DmConversation } from '../interfaces/dm.interface';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../app.config';

/**
 * Handles the creation and retrieval
 * of direct message conversations.
 */
@Injectable({
  providedIn: 'root',
})
export class DmConversationService {
  /**
   * Returns an existing direct message conversation or creates a new one.
   *  Ensures that only one conversation exists for the same pair of users.
   */
  async getOrCreateDM(userId1: string, userId2: string): Promise<DmConversation> {
    const memberIds = [userId1, userId2].sort();
    const conversationKey = memberIds.join('_');
    const conversationQuery = query(
      collection(db, 'DMConversations'),
      where('conversationKey', '==', conversationKey),
    );
    const snapshot = await getDocs(conversationQuery);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as DmConversation;
    }
    const ref = doc(collection(db, 'DMConversations'));
    const newConversation: DmConversation = {
      id: ref.id,
      conversationKey,
      memberIds,
      createdAt: Date.now(),
      lastMessageAt: Date.now(),
    };
    await setDoc(ref, newConversation);
    return newConversation;
  }

  /**
   * Retrieves a direct message conversation by id.
   */
  async getConversationById(conversationId: string): Promise<DmConversation | null> {
    const snapshot = await getDoc(doc(db, 'DMConversations', conversationId));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as DmConversation;
  }
}
