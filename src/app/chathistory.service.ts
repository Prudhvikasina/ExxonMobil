import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChathistoryService {
  private currentTopicId = new BehaviorSubject<number | null>(null);
  private currentTopicName = new BehaviorSubject<string | null>(null);

  // Observables for components to subscribe
  currentTopicId$ = this.currentTopicId.asObservable();
  currentTopicName$ = this.currentTopicName.asObservable();

  setTopic(topicId: number, topicName: string): void {
    this.currentTopicId.next(topicId);
    this.currentTopicName.next(topicName);
  }

  clearTopic(): void {
    this.currentTopicId.next(null);
    this.currentTopicName.next(null);
  }
  constructor() { }
}

