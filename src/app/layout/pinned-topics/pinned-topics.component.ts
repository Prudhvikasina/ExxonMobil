import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { lastValueFrom } from 'rxjs';
import { TopicserviceService } from 'src/app/dashboard/services/topicservice.service';
import { DocumentGeneratorComponent } from 'src/app/common/document-generator/document-generator.component';
@Component({
  selector: 'app-pinned-topics',
  templateUrl: './pinned-topics.component.html',
  styleUrls: ['./pinned-topics.component.scss']
})
export class PinnedTopicsComponent {
  @Input()
  userId!: number;
  @Input() pinnedTopics: any[] = [];
  @Output() pinnedTopicSelected = new EventEmitter<{topicName: string, topicId: number}>();
  @Output() topicUnpinned = new EventEmitter<any>();
  
  @ViewChild('documentGenerator') documentGenerator!: DocumentGeneratorComponent;

  isCollapsedPinned: boolean = false;
  isEditing: boolean = false;
  editedTopicId: number | null = null;
  selectedTopic: any = null;
  topicName: string = "";
  constructor(private topicservice: TopicserviceService) {}

  toggleCollapsePinned() {
    this.isCollapsedPinned = !this.isCollapsedPinned;
  }

  unpinTopic(topic: any) {
    this.topicservice.isPinned(this.userId, topic.TopicId, false);
    this.topicUnpinned.emit(topic);
  }

  showOverlayPanel(event: Event, overlayPanel: OverlayPanel, topic: any) {
    this.selectedTopic = { ...topic };
    overlayPanel.toggle(event);
  }

  async saveTopic(topicId: number, TopicName: string): Promise<void> {
    try {
      const formData = {
        "TopicId": topicId,
        "TopicName": TopicName,
        "IsFeature": true,
        "addUsers": []  // Add your user logic here
      };

      await this.topicservice.editTopicForm(formData, this.userId.toString());
      
      // Reset editing state
      this.isEditing = false;
      this.editedTopicId = null;
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  }

  enableEditing(topicId: number): void {
    this.isEditing = true;
    this.editedTopicId = topicId;
  }

  calltoggle(topicName: string, topicId: number) {
    this.pinnedTopicSelected.emit({ topicName, topicId });
  }

  exportToPdf(topicName: string, topicId: number, event: Event) {
    this.selectedTopic = topicId;
    this.topicName = topicName;

    // Trigger the PDF generation immediately

    // Trigger the PDF generation immediately

    // Trigger the PDF generation immediately
    console.log('word', topicId, topicName, this.userId)
    // Trigger the PDF generation immediately
    this.documentGenerator.generateDocument('pdf', topicId, topicName, this.userId);

  }


  async archiveTopicSidebar(TopicName: string, TopicId: number): Promise<void> {
    try {
      await lastValueFrom(this.topicservice.updateIsArchived(TopicId, this.userId, true));
      this.pinnedTopics = this.pinnedTopics.filter(topic => topic.TopicId !== TopicId);
    } catch (error) {
      console.error('Error archiving topic:', error);
    }
  }

  async deleteTopicSidebar(TopicName: string, TopicId: number): Promise<void> {
    try {
      await lastValueFrom(this.topicservice.updateIsDeleted(TopicId, this.userId, true));
      this.pinnedTopics = this.pinnedTopics.filter(topic => topic.TopicId !== TopicId);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  }
}
