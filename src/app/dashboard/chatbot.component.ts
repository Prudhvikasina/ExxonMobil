import { Component, ElementRef, OnInit, ViewChild, NgZone } from '@angular/core';
import { TopicserviceService } from './services/topicservice.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { MsalService } from '@azure/msal-angular';
import { Message } from 'primeng/api';
import { HotToastService } from '@ngneat/hot-toast';
import { C, co } from '@fullcalendar/core/internal-common';
import { NotificationServiceService } from './services/notification-service.service';
import { Observable, Subscription, firstValueFrom, lastValueFrom } from 'rxjs';
import { Location, DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { HttpResponse } from '@angular/common/http';
import { ChatboxComponent } from '../chatbox/chatbox.component';
import { ActivityComponent } from '../activity/activity.component';
import { environment } from 'src/environments/environment';
import { AuthenticationResult } from '@azure/msal-browser';
import { DocumentGeneratorComponent } from '../common/document-generator/document-generator.component';
import { Router } from '@angular/router';
import { Renderer2 } from '@angular/core';
import { ChathistoryService } from '../chathistory.service';
import { PinnedTopicsComponent } from '../layout/pinned-topics/pinned-topics.component';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';


export interface TopicResponse {
  answer: string;
  questions_ui: string[];
}

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

interface StarRating {
  TopicquestionanwserId: number;
  ratings: number[];
}

interface Topic {
  TopicId: number;
  TopicName: string;
  username?: string;
  email?: string;
}


@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],

})
export class ChatbotComponent implements OnInit {
  [x: string]: any;
  shareOptionsFilter: any = "6";
  sortRatingsPage: any = "TopicName";
  // @ViewChild('chatList') chatList!: ElementRef;
  items: { isLiked: boolean; liked: boolean; disLiked: boolean; disliked: boolean }[] = [];
  scheduledQuery: boolean = false
  activeTabIndex: number = 0;
  messages: Message[] | undefined;
  topicDetails: any;
  topicDetailsnew: any[] = [];
  yearRange: number[] = [];
  disLiked: any;
  invalidFromField: boolean = false;
  selectedTopicId: any;
  sortChatByOrder: string = "Latest";
  pagedGoldLayerTablesDataList: any[] = [];
  isSelectedDropdownDisabled: boolean = true
  userId: any;
  userRoleReader: boolean = false
  subscription: any;
  removeUsers: any = {};
  removedUsersList: any[] = []
  location: any = Location
  UserDetails: any = {};
  firsttime: boolean = true;
  notificationTotalCount: number = 0;
  images: any = []
  editpopupview: boolean = false;
  SharedPopup:boolean = false;
  topicsdataNew: Topic[] = []; // Define topicsdata as an array of Topic
  // visible = false;
  topicsdataToday: any[] = [];
  topicsdataYesderday: any[] = [];
  topicsdatePrevios: any[] = [];
  selectedTopic: any = null;
  isDarkMode = false;
  isToggled: boolean = false;
  
  reRenderTopics = false;
  topicName: string = "";
  receiveDateParamFromChild: number = 0;
  pinnedTopics: Topic[] = [];
  isCollapsed = true;
  isCollapsedPinned = true;

  inputText: string = ''; // To store the input value
  chips: string[] = [];  // Array to store chip values
  // @ViewChild('documentGenerator') documentGenerator!: DocumentGeneratorComponent;

updateNotificationCount(count: number) {
  this.notificationTotalCount = count;
}

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.showAllTopics = false;
  }

  toggleCollapsePinned(){
    console.log(this.pinnedTopics)
    this.isCollapsedPinned = !this.isCollapsedPinned;
  }
  ngAfterViewInit() {
    // AfterViewInit lifecycle hook ensures the component is ready
    // if (!this.documentGenerator) {
    //   console.error('DocumentGeneratorComponent not initialized');
    // }
  }
  @ViewChild('documentGenerator') documentGenerator!: DocumentGeneratorComponent

  //  Pinned Topics Component starts here 
  @ViewChild(PinnedTopicsComponent) pinnedTopicsComponent!: PinnedTopicsComponent;
  onPinnedTopicSelected(event: {topicName: string, topicId: number}) {
    this.topicIdnew = event.topicId;
    this.topicName = event.topicName;
    this.new_chat = true;
    this.chatboxComponent.toggleDisplaysTopicname(event.topicName, event.topicId);
  }

  onTopicUnpinned(topic: any) {
    this.pinnedTopics = this.pinnedTopics.filter(t => t.TopicId !== topic.TopicId);
    this.topicsdata = [topic, ...this.topicsdata];
  }

    //  Pinned Topics Component ends here 
  exportToPdf(topicName: string, topicId: number, event: Event) {
    this.selectedTopicId = topicId;
    this.topicName = topicName;

    // Trigger the PDF generation immediately
    console.log('word', topicId, topicName, this.userId)
    // Trigger the PDF generation immediately
    this.documentGenerator.generateDocument('pdf', topicId, topicName, this.userId);

  }

  
  exportToWord(topicName: string, topicId: number, event: Event) {
    this.selectedTopicId = topicId;
    this.selectedTopicName = topicName;

    // Trigger the Word generation immediately
    // Trigger the Word generation immediately
    // this['documentGenerator'].generateDocument('word');
    console.log('word', topicId, topicName, this.userId)
    this.documentGenerator.generateDocument('word', topicId, topicName, this.userId);
  }


  // Method in the overlay panel to handle pinning
  handlePin(topic: any) {
    this.pinTopic(topic);
    
    // Optional: Close overlay panel
    // You might need to inject OverlayPanel service or use a reference
  }

  // Method to unpin a topic
  pinTopic(topic: any) {
    // Check if the topic is already pinned
    const isPinned = this.pinnedTopics.some(pinnedTopic => pinnedTopic.TopicId === topic.TopicId);
  
    if (!isPinned) {
      // Add to pinned topics
      this.pinnedTopics.push(topic);
      this.topicservice.isPinned(this.userId,topic.TopicId,!isPinned)
  
      // Remove from the original topics list (Recent tab)
      this.topicsdata = this.topicsdata.filter((t: { TopicId: any }) => t.TopicId !== topic.TopicId);
    }
  }
  
  
  unpinTopic(topic: any) {
    // Remove from pinned topics
    this.pinnedTopics = this.pinnedTopics.filter(t => t.TopicId !== topic.TopicId);
    // Add back to the original topics list (Recent tab)
    // Add it to the beginning or end based on your preference
    this.topicsdata = [topic, ...this.topicsdata]; // Add to the beginning
    this.topicservice.isPinned(this.userId,topic.TopicId,false);
    // Or: this.topicsdata.push(topic); // Add to the end
  }
  
  showOverlayPanel(event: Event, overlayPanel: OverlayPanel, topic: any) {
    this.selectedTopic = { ...topic }; // Copy the data of the clicked topic
    overlayPanel.toggle(event); // Show the overlay panel at the clicked position
  }

  showOverlayPanelNew(event: Event, overlayPanel: OverlayPanel) {
    // overlayPanel.toggle(event); // Show the overlay panel at the clicked position
  }

  showOverlayPanelDowload(event: Event, overlayPanelDownload: OverlayPanel, topicsdata: any): void {
    overlayPanelDownload.toggle(event); // Toggle visibility of the panel
  }

  saveTopicData() {
    // Implement saving logic here, e.g., updating the topicsdata array
    const index = this.topicsdataNew.findIndex(t => t.TopicId === this.selectedTopic.TopicId);
    if (index !== -1) {
      this.topicsdata[index] = { ...this.selectedTopic };
    }
  }


  goToAddUserTab() {
    this.activeTabIndex = 2; // Index of the "Add User" tab
  }
  goToFilterTab() {
    this.activeTabIndex = 1; // Index of the "Filter" tab
  }
  // AddtopicObject!:topicList;
  currentPage: number = 1;
  pageSize: number = 6;
  public addtopicform!: FormGroup
  sidebarVisible: boolean = false;
  topicsdata: any;
  visible: boolean = false;
  createtopicvisible: boolean = false;
  AnswerDisplayDialog: boolean = false;
  createtopicvisible1: boolean = false;
  createtopicvisible2: boolean = false;
  settingspagevisible: boolean = false;
  filtermainvisible: boolean = false;
  ManageSettingsvisible: boolean = false;
  TopiclistSettingsvisible: boolean = false;
  TopicnameExits: boolean = false;
  claimcategory: any;
  languages: any[] = [
    { name: 'English', code: 'en', id: 1 },
    { name: 'Spanish', code: 'es', id: 2 },
    { name: 'French', code: 'fr', id: 3 },
    // Add more languages as needed
  ];
  regionName: any;
  isactivity = false;
  isHelpDashboard = false;
  DepartmentNumber: any;
  // ItemNumber: any;
  Itemnumber: any;
  VendorIds: any;
  vendorname1Options: any;
  selecttopic: any;
  ComparisonTopicsSelect: any
  ClaimType: any
  customwidth: boolean = true
  addtopicsdasearchdatafilter: any
  answer: any;
  topiccarddata: any
  questiondata: any;
  dropdownOpen: boolean = false;
  searchValue: string = ""
  vendornameOptions: any = [];
  filterValue: any
  vendorName: any;
  deptnumber: any;
  vendorname: any;
  secondVisible: boolean = true;

  Previewsdisplay: boolean = false;
  showSuccessMessage: boolean = false;
  searchTerm: string = '';

  filteredTopics: any[] = []; // Array to store filtered topics
  totalRecords: number = 5;
  first: number = 0;
  topicIdnew: any;
  topicIdForEditFilter: any;
  topicArrayForEdit: any[] = [];
  extraVal: any[] = [];
  rows: number = 6;
  settingsRows: number = 25;
  updateValue: any;
  selectedLanguage: string = ""
  private refreshTopicsList: Subscription | undefined;
  topicsDataLandingpage: any[] = [];
  selectedTopicIdForUserRoleID: any
  sortOptions: any[] = [
    { label: 'High to Low ..', value: '1' },
    { label: 'Low to High ..', value: '-1' }
  ];
  visibleHelp: boolean = false;
  isEditMode: boolean = false;
  selectedSortOption: string = '';
  dialogHeader: string = "Add Chat Name";
  selectedTopicName: string | undefined;
  inputTouched: boolean = false;
  itemSelected: boolean = false;
  userRoles: any[] = [];
  accessList: any[] = [];
  topicListForsettings: any[] = [];
  searchTextTopicList: string = '';
  filteredTopicList: any[] = [];
  pageNumber: number = 1;
  // pageSize: number = 10;
  searchInputnew: string = '';
  searchResults: any[] = [];
  suggestedQuestion: any[] = ["what is your name?", "wha is your age?", "where are u from?", "what is your ****",];
  datesearch: any;
  chatsearchText: any;
  usersearch: any;
  liveQuestions: any[] = [];
  starRatings: StarRating[] = [];
  isLiked: boolean = false;
  liveHistoryData: any[] = [];
  isLoading: boolean = false;
  isExpanded: boolean = true;
  isExpandednew: boolean = false;
  liked: boolean = false;
  disliked: boolean = false;
  formSubmitted: boolean = false;
  DisplayQuestions: any;
  selectedClaimCategory: any;
  UserdataSave: any[] = [];
  selectedUsers: any[] = [];
  addingUsers: any[] = [];
  userDetails: any = {};
  userIdNotifications: any;
  isTopicDisabled: boolean = true;
  topicListViewing: any = '1';
  topicDetailsToDisplay: any[] = [];
  new_chat: boolean = false;

  acceptSuccess = false;
  acceptError = false;
  declineSuccess = false;
  declineError = false;
  notifications: any[] = [];
  notificationSharedTotalCount: number = 0;
  notificationsSharedToMe: any[] = [];
  notificationsSharedByMe: any[] = [];
  isdisplay = false;
  backgroundColor = false;
  showAllTopics = false; // To toggle between view more and view less

  isModalOpen = false;
  ingredient!: string;
  visibleLogout: boolean = false;
  visibleActivity: boolean = false;
  isSearchActive = false;
  sidebarBackgroundColor: string = '#f0f4f9';
  sidebarBackgroundColorClose: string = '#1e1f20';
  chatMessagesFromChild: any[] = [];
  searchedTopicValueActivity: any[] = [];
  inputValue: string = '';
  chatMessage: string = '';
  chatMessageArray: any[] = [];
  filteredActivityValue : any[] = [];
  visibleHelpCreate: boolean = false;
  updateActivityDate : any;
  notificationsdata:any = [];
  notificationsdatabyme:any = [];
  

  editPinnedPopupView: boolean = false;
  activePinnedTabIndex: number = 0;
  pinnedLanguages: any[] = [];
  selectedPinnedLanguage: string = '';
  searchPinnedInput: string = '';
  pinnedSearchResults: any[] = [];
  selectedPinnedUsers: any[] = [];
  isPinnedSelectedDropdownDisabled: boolean = false;
  invalidPinnedFromField: boolean = false;
  topicArrayForPinnedEdit: any[] = [];
  receiveChatMessages(messages: any[]) {
    this.chatMessagesFromChild = messages;
    // console.log("Received chat messages from child:", this.chatMessagesFromChild);
  }

  showDialogLogout() {
    this.visibleLogout = true;
  }
 
  


  cancelHelp(): void {
    this.visibleHelp = false; // Closes the dialog
  }
  showDialogHelp(op: any) {
    console.log("newdialog");
    this.visibleHelp = true;
    console.log(this.visibleHelp);

    // Close the overlay panel
    op.hide();
}


  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  isDialogVisible: boolean = false;

  toggleDialog() {
    this.isDialogVisible = !this.isDialogVisible;
  }

  closeDialog() {
    this.isDialogVisible = false;
  }
  navigateToUpdateUserTab() {
    this.activeTabIndex = 1; // Set to the "Update User" tab index
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    console.log("Received chat messages from child:", this.chatMessagesFromChild);
  }

  updateChat(TopicId:any) {

    console.log(this.suggestions,this.shareTopicId)
    
    this.SharedPopup = false;
    
    this.topicservice.addNotification(this.userId,this.suggestionsselected,this.shareTopicId)


  }

  async getNotifications(){
    const payload = {
      showAll: true,
      pageSize: 10,
      pageNumber: 1,
      sortBy: 'FirstName',
      sortOrder: 'ASC'
    };

    const response = await this.topicservice.getNotifications(payload, this.userId)
    console.log(response)

    this.notificationsdata = response

    this.notificationsdatabyme = await this.topicservice.getNotificationssharedbyme(payload,this.userId)
    console.log(this.notificationsdatabyme)
  
    
  }

  toggleChanged() {
    const body = document.body;
    const sidebar = document.querySelector('.p-sidebar-left') as HTMLElement;
    const sidebarCLose = document.querySelector('.closed-sidebar') as HTMLElement;
    const viewMore = document.querySelector('.view-more-toggle') as HTMLElement;
    const iconContainerOpen = document.querySelector('.icon-container_open') as HTMLElement;
    // const iconContainerButton = document.querySelectorAll('.icon-button_open') as NodeListOf<HTMLElement>;
    const iconContainerButtons = document.querySelectorAll('.icon-button_open');
    const customInput = document.querySelector('.customeinput') as HTMLElement;
    const topicname = document.querySelectorAll('.topic_name')
    const settingsOverlay = document.querySelector('.settings_overlay') as HTMLElement;
    const settingsOverlayList = document.querySelectorAll('.settings_overlay');
    const newChatIcon = document.querySelector('.fa-pen-to-square') as HTMLElement;
    // const enterBtn = document.querySelector('.Spinner-icon"') as HTMLElement
    const topic = document.querySelectorAll('.topic');
    const topicViewMOre = document.querySelectorAll('.topic_view_more');

    if (this.showAllTopics === true) {

      topicViewMOre.forEach((tpcV) => {
        const tpV = tpcV as HTMLElement;
        if (this.isToggled) {
          tpV.style.color = 'white'
        } else {
          tpV.style.color = '#495057'
        }
      })
    }


    //  const closedSidebar = document.querySelector('.closed-sidebar') as HTMLElement;

    console.log("view more called")

    iconContainerButtons.forEach((button) => {
      const iconButton = button as HTMLElement;
      // Now you can access properties on `iconButton`
      // e.g., iconButton.style.backgroundColor = 'red';
      if (this.isToggled) {
        iconButton.style.backgroundColor = '#1e1f20';
        iconButton.style.color = 'white';


      } else {
        iconButton.style.backgroundColor = '#f0f4f9';
        iconButton.style.color = 'black';
      }

      settingsOverlayList.forEach((list) => {
        const overlayList = list as HTMLElement;
        if (this.isToggled) {
          overlayList.style.removeProperty('hover');
        } else {

        }
      })

      console.log(topic)
      topic.forEach((tpc) => {
        const tp = tpc as HTMLElement
        if (this.isToggled) {
          tp.style.color = 'white';
          tp.classList.add('dark-mode-hover');
          tp.classList.remove('light-mode-hover');
        } else {
          tp.style.color = '#495057';
          tp.classList.add('light-mode-hover');
          tp.classList.remove('dark-mode-hover');
        }
      })



    });
    if (this.isToggled) {
      // Dark mode: dark background, light text
      body.style.backgroundColor = '#121212';
      body.style.color = '#e3e3e3';
      viewMore.style.backgroundColor = '#1e1f20';
      iconContainerOpen.style.backgroundColor = '#1e1f20'
      // iconContainerButton.style.backgroundColor = '#333333'
      customInput.style.backgroundColor = '#343a40';
      settingsOverlay.style.backgroundColor = '#1e1f20'
      settingsOverlay.style.color = 'white'
      newChatIcon.style.color = 'white'

      if (sidebar) {
        sidebar.style.backgroundColor = '#1e1f20'; // Set dark color for sidebar
      }
      if (sidebarCLose) {
        sidebarCLose.style.backgroundColor = '#1e1f20'
      }
    } else {
      // Light mode: light background, dark text
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#495057';
      viewMore.style.backgroundColor = '#f0f4f9';
      iconContainerOpen.style.backgroundColor = '#f0f4f9'
      customInput.style.backgroundColor = '#e9ecef'
      settingsOverlay.style.backgroundColor = '#f0f4f9'
      settingsOverlay.style.color = 'black'
      newChatIcon.style.color = 'black'
      if (sidebar) {
        sidebar.style.backgroundColor = '#f0f4f9'; // Set light color for sidebar
      }
      if (sidebarCLose) {
        sidebarCLose.style.backgroundColor = '#f0f4f9'; // Set light color for sidebar
      }
    }
  }

  topicDisabled(list: any): boolean {
    if (!list || !list.userRoles) {
      return false;
    }
    if (this.topicListViewing === '5') {
      return false
    } else {
      const matchingRole = list.userRoles.some((role: any) => role.userId === this.userId);
      return matchingRole;
    }

  }

  getTrimmedAliasName(): string {
    const maxLength = 15; // Set your max length here
    console.log(this.AliasName);
    return this.AliasName.length > maxLength
      ? this.AliasName.substring(0, maxLength) + '...'
      : this.AliasName;
  }

  getTrimmedShortAliasName(): string {
    const maxLength = 15; // Set your max length here
    let firstChar = this.AliasShortName.split(' ');
    let newArr = firstChar.map((arr)=>(arr.charAt(0)).toUpperCase());
    let newStr = newArr.join('');
    // return this.AliasShortName.length > maxLength 
    //   ? this.AliasShortName.substring(0, maxLength) + '...' 
    //   : this.AliasShortName;

    return newStr;
  }

  toggleView() {
    this.showAllTopics = !this.showAllTopics;
  }


  async fetchNotifications() {
    if (!this.userId) return;

    try {
      const response: any = await this.topicservice.getAllNotifications(this.userId, 1, 100, 1, 'FirstName', 'ASC');
      this.notificationsSharedByMe = response;
      this.notifications = response.map((notification: any) => ({ ...notification, isVisible: true }));

      if (response.length === 0) {
        this.notificationTotalCount = 0;
      } else {
        this.notificationTotalCount = response[0]["TotalCount"];
      }
 console.log(this.notifications);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }

  async acceptNotification(notification: any, index: any) {
    console.log(notification);
    if (!this.userId) return;

    try {
      await this.topicservice.updateNotificationStatus(this.userId, notification.TopicId, true, notification.TopicNotificationId);
      this.notificationsSharedToMe.splice(index, 1);
      
      await this.fetchNotifications(); // Make sure this is an async function
      await this.fetchNotificationsSharedToMe(); // Make sure this is an async function
      this.sharedService.triggerRefreshTopicsList();
    } catch (error) {
      this.acceptError = true;
      this.acceptSuccess = false;
      console.error('Error accepting notification:', error);
    }
  }

  async declineNotification(notification: any, index: any) {
    if (!this.userId) return;

    try {
      await this.topicservice.updateNotificationStatus(this.userId, notification.TopicId, false, notification.TopicNotificationId);
      this.notificationsSharedToMe.splice(index, 1);
      
      await this.fetchNotifications(); // Make sure this is an async function
      await this.fetchNotificationsSharedToMe(); // Make sure this is an async function
      this.sharedService.triggerRefreshTopicsList();
    } catch (error) {
      this.declineError = true;
      this.declineSuccess = false;
      console.error('Error declining notification:', error);
    }
  }

  async declineNotificationClose(notificationId: any, index: any) {
    if (!this.userId) return;

    try {
      await this.topicservice.updateNotificationStatusByMe(this.userId, notificationId.TopicId, true, notificationId.TopicNotificationId);
      this.notificationsSharedByMe.splice(index, 1);
      
      await this.fetchNotifications(); // Make sure this is an async function
    } catch (error) {
      this.declineSuccess = false;
      console.error('Error closing notification decline:', error);
    }
  }

  async fetchNotificationsSharedToMe() {
    if (!this.userId) return;

    try {
      const response: any = await this.topicservice.getAllNotificationsSharedToMe(this.userId, 1, 100, 1, 'FirstName', 'ASC');
      this.notificationsSharedToMe = response;
      this.notificationSharedTotalCount = response.length === 0 ? 0 : response[0]["TotalCount"];
    } catch (error) {
      console.error('Error fetching notifications shared to me:', error);
    }
  }

  toggleVisibility(index: number) {
    this.notifications[index].isVisible = !this.notifications[index].isVisible;
  }

  saveFile1(data: Blob, name: string) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name; // Filename from the response headers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  saveFile2(data: Blob, name: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name; // Filename from the response headers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }



  saveFile3(data: Blob, name: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name; // Filename from the response headers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  
  // Export to Excel Method
  async exportToExcel(TopicName: string, TopicId: number): Promise<void> {
    console.log(TopicName, TopicId);

    // Get the observable
    const observable = await this.topicservice.downloadFileExcel(this.userId, TopicId, TopicName);

    // Subscribe to the observable
    observable.subscribe(
      (response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]
          : `${TopicName}.xlsx`;

        if (response.body instanceof Blob) {
          this.saveFile3(response.body, filename); // Function to save the file
        } else {
          console.error('Response body is not of type Blob.');
          // Handle the case where the response body is not a Blob
        }
      },
      (error) => {
        console.error('Error downloading Excel file:', error);
         // Display error message
      }
    );
  }

  async getLanguages(TopicId: number, UserId: number) {
    try {
      // Call the API to get languages
      const response = await this.topicservice.getLanguages(UserId, TopicId);

      // Check if response data is available
      if (response && Array.isArray(response)) {
        // Update this.languages with the language data from the response
        this.languages = response.map(language => ({
          LanguageID: language.LanguageID,
          LanguageName: language.LanguageName
        }));

        console.log("Updated languages:", this.languages);
      } else {
        console.log("No languages found.");
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
    }
  }
  editTopicPinned(topic: Topic) {
    if (topic && topic.TopicId) {
      console.log('Edit', this.userId, topic.TopicName, topic.TopicId);
      
      // Call method to get languages before editing
      this.getLanguages(topic.TopicId, this.userId);
      
      // Additional edit logic
      // Additional edit logic
      this.editpopupview = true
      this['openEditModal'](topic);
    } else {
      console.error('Invalid topic data for editing');
    }
  }

  sendInvite(topic: Topic) {
    if (topic && topic.TopicId) {
      console.log('Send Invite', this.userId, topic.TopicName, topic.TopicId);
      
      // Implement your send invite logic here
      // Implement your send invite logic here
      this.editpopupview = true
      this['openInviteModal'](topic);
    } else {
      console.error('Invalid topic data for sending invite');
    }
  }

  editTopicSidebar(TopicName: string, TopicId: number): void {
    console.log('Edit', this.userId,TopicName,TopicId)
    this.getLanguages(TopicId, this.userId)

  }

  async getPinnedLanguages(TopicId: number, UserId: number) {
    try {
      const response = await this.topicservice.getLanguages(UserId, TopicId);
      if (response && Array.isArray(response)) {
        this.pinnedLanguages = response.map(language => ({
          LanguageID: language.LanguageID,
          LanguageName: language.LanguageName
        }));
        console.log("Updated pinned languages:", this.pinnedLanguages);
      }
    } catch (error) {
      console.error("Error fetching pinned languages:", error);
    }
  }

  editPinnedTopic(pinnedTopic: any) {
    if (pinnedTopic && pinnedTopic.TopicId) {
      console.log('Edit Pinned Topic', this.userId, pinnedTopic.TopicName, pinnedTopic.TopicId);
      this.getPinnedLanguages(pinnedTopic.TopicId, this.userId);
      this.editPinnedPopupView = true;
      this.topicArrayForPinnedEdit = [pinnedTopic];
    } else {
      console.error('Invalid pinned topic data for editing');
    }
  }

  navigateToPinnedUpdateUserTab() {
    this.activePinnedTabIndex = 1;
  }

  searchPinnedUsers() {
    // Implement your search logic here
    this.pinnedSearchResults = []; // Populate with search results
  }

  togglePinnedUserSelection(user: any) {
    const index = this.selectedPinnedUsers.findIndex(u => u.UserId === user.UserId);
    if (index === -1) {
      this.selectedPinnedUsers.push(user);
    }
  }

  removePinnedUser(user: any) {
    const index = this.selectedPinnedUsers.findIndex(u => u.UserId === user.UserId);
    if (index !== -1 && user.EmailAddress !== this.AliasName) {
      this.selectedPinnedUsers.splice(index, 1);
    }
  }

  handlePinnedRoleChange(userId: number, target: any) {
    // Implement role change logic
  }

  updatePinnedChat(topicId: number) {
    // Implement update logic
    if (this.validatePinnedForm()) {
      // Perform update operations
      this.editPinnedPopupView = false;
    }
  }

  validatePinnedForm(): boolean {
    // Add your validation logic
    return true;
  }

  closePinnedEditDialog() {
    this.editPinnedPopupView = false;
    this.resetPinnedForm();
  }

  resetPinnedForm() {
    this.selectedPinnedLanguage = '';
    this.searchPinnedInput = '';
    this.pinnedSearchResults = [];
    this.selectedPinnedUsers = [];
    this.invalidPinnedFromField = false;
  }
  async archiveTopicSidebar(TopicName: string, TopicId: number): Promise<void> {
    console.log('Archive Chat');

    try {
      const response = await lastValueFrom(this.topicservice.updateIsArchived(TopicId, this.userId, true));
      console.log('Topic archived successfully:', response);
    } catch (error) {
      console.error('Error archiving topic:', error);
    }
  }

  async deleteTopicSidebar(TopicName: string, TopicId: number): Promise<void> {
    console.log('Delete Chat');
    this.reRenderTopics = !this.reRenderTopics;
    try {
      const response = await lastValueFrom(this.topicservice.updateIsDeleted(TopicId, this.userId, true));
      console.log('Topic deleted successfully:', response);
      let newTopicsDataAfterDelete = this.topicsdata.filter((topic: any) => (topic.TopicId !== TopicId));
      this.topicsdata = newTopicsDataAfterDelete;
    } catch (error) {
      console.error('Error deleting topic:', error);
    }

  }

  toggleUserSelection(user: any) {
    console.log(user)
    if (user.hasOwnProperty('UserRoleId')) {

      user.selected = true;

      this.selectedUsers.push(this.userDetails);
      // Remove duplicates based on UserId
      this.selectedUsers = this.removeDuplicateUsers(this.selectedUsers);
      this.cdRef.detectChanges();
      this.userDetails = {};
      this.userDetails.userId = user.UserId;
      this.userDetails.RoleId = user.UserRoleId;
      this.userDetails.EmailAddress = user.EmailAddress;
      this.addingUsers.push(this.userDetails);

      console.log(this.addingUsers)


    } else {
      
    }

  }


  removeDuplicateUsers(users: Array<any>) {
    const uniqueUsersMap = new Map();

    users.forEach(user => {
      const userId = user.userId || user.UserId;
      if (!uniqueUsersMap.has(userId)) {
        uniqueUsersMap.set(userId, user);
      }
    });

    return Array.from(uniqueUsersMap.values());
  }
  roleId() {
    return 3
  }
  removeUser(user: any) {
    const index = this.selectedUsers.findIndex(selectedUser => selectedUser === user);
    user.selected = false;
    if (index !== -1) {
      user.selected = false;
      this.selectedUsers.splice(index, 1);
      this.addingUsers.splice(index, 1);
    }
    if (this.dialogHeader === 'Update Topic') {
      this.removeUsers = {};
      if (user.userId) {
        this.removeUsers.userId = user.userId;
      } else if (user.UserId) {
        this.removeUsers.userId = user.UserId;
      }
      if (user.UserRoleId) {
        this.removeUsers.RoleId = user.UserRoleId;
      } else if (user.RoleId) {
        this.removeUsers.RoleId = user.RoleId;
      }
      this.removeUsers.EmailAddress = user.EmailAddress;
      this.removedUsersList.push(this.removeUsers);
    }

  }
  onPageChange(event: PageEvent) {
    this.first = event.first;
    this.rows = event.rows;
    this.pageNumber = event.page + 1;
    // this.getTopicsDataLandingpage('', this.sortRatingsPage, 'Asc', this.userId);


  }
  onPageChangeSettings(event: PageEvent) {
    this.pageNumber = event.page + 1
    this.settingsRows = event.rows;
    this.getTopicListForSettings();
  }

  onSearchChange() {
    this.getTopicListForSettings();
  }

  capitalizeFirstLetter(name: string): string {
    if (!name) return '';
    const parts = name.split('.');
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    }

    return name
  }



  get AliasName(): string {
    if (this.authService.instance.getActiveAccount() !== null) {
      const activeAccount = this.authService.instance.getActiveAccount();
      if (activeAccount !== null) {
        const email = activeAccount.username;
        // if(this.checkingemail(activeAccount.username)){
        // console.log(activeAccount)
        // }
        const parts = email.split('@');
        if (parts.length > 0) {
          return parts[0];
        }
      }
    }
    return 'DefaultAliasName';
  }

  get AliasShortName(): string {
    if (this.authService.instance.getActiveAccount() !== null) {
      const activeAccount = this.authService.instance.getActiveAccount();
      if (activeAccount !== null) {
        const name = activeAccount?.name;
        return String(name)
      }
    }

    return 'DefaultAliasName';
  }


  getInitials(aliasName: string): string {
    const parts = aliasName.split('.');
    let initials = '';
    parts.forEach(part => {
      initials += part.charAt(0).toUpperCase();
    });
    return initials;
  }
  checkLoggedMessageSender(senderName: any) {

    if (senderName.toLowerCase() === this.AliasName.toLowerCase()) {
      return 'You'
    } else if (senderName === "Copilot") {
      return "Assistant"
    } else return senderName.split('.')[0]

  }
  logout() {
    this.authService.logout();
    localStorage.clear()
  }
  
  filterTopics() {
    this.filteredTopicList = this.topicListForsettings.filter(topic => {
      return topic.topicName.toLowerCase().includes(this.searchTextTopicList.toLowerCase());
    });
  }
  private async getAccessToken(): Promise<string | null> {
    try {
      const result: AuthenticationResult = await this.authService.instance.acquireTokenSilent({
        scopes: [environment.scope] // Using the configured Adminscope here
      });

      // console.log(result);
      return result.accessToken;
    } catch (error) {
      console.log("Silent token acquisition failed. Falling back to interactive login.", error);
      return null;
    }
  }
  UserDetailsLogin(): boolean {
    const activeAccount = this.authService.instance.getActiveAccount();


    if (activeAccount != null) {
      // console.log(activeAccount, activeAccount.username, activeAccount.name);
      this.getAccessToken();

      this.userDetails = {
        email: activeAccount.username,
        name: activeAccount.name
      };

      // console.log(this.userDetails);
      return true;
    }

    return false;
  }

  async addLoggedUser(): Promise<void> {
    const name = this.AliasName.split('.')[0];

    if (this.UserDetailsLogin()) {
      if (this.firsttime === true) {
        // console.log(this.userDetails);

        // Check if userDetails is correctly set before using it
        if (this.userDetails && this.userDetails.name && this.userDetails.email) {
          try {
            // const response = await this.topicservice.addUser(this.userDetails.name, this.userDetails.email);
            // response.subscribe((response: any) => {
            //     console.log(response);
            //     if (response.message === 'success') {
            //       this.firsttime = false;
            //   }
            // })

          } catch (error) {
            console.error('Error adding user:', error);
          }
        } else {
          console.error('User details are missing.');
        }
      }
    }

    try {
        const res = await lastValueFrom(this.topicservice.searchUsers(this.userDetails.email));
      
        this.userId = res[0].UserId;      
      // this.userId = res[0].UserId;

      const aliasIncluded = this.selectedUsers.some((user: any) => {
        return user.Username === this.AliasName;
      });

      if (!aliasIncluded) {
        this.selectedUsers.push({
          "userId": res[0].UserId,
          "Username": this.AliasName,
          "EmailAddress": res[0].EmailAddress,
          "selected": true
        });
      }

      // console.log(this.addingUsers);

      const included = this.addingUsers.some((user: any) => {
        return user.userId === res[0].UserId;
      });

      if (!included) {
        this.userDetails = {};
        this.userDetails.userId = res[0].UserId;
        this.userDetails.RoleId = 1;
        this.userDetails.EmailAddress = res[0].EmailAddress;
        this.addingUsers.push(this.userDetails);
        // console.log(this.addingUsers);
      }




    } catch (error) {
      console.error('Error searching users:', error);
    }
  }


  suggestions: any[] = []; // Store users from the API
  showSuggestions: boolean = false;

  suggestionsselected: any = [];

  async onInputChange(event: Event): Promise<void> {
    const input = (event.target as HTMLInputElement).value;
    console.log(input)
    // Split input into words and check the count
    const words = input.trim().split(/\s+/);
    
    if (words[0].length >= 3) {
      console.log(words)
      try {
        const res = await lastValueFrom(this.topicservice.searchUsers(words[0]));
        this.suggestions = res; // Assuming the API returns a list of users
        this.showSuggestions = true;
        console.log(res)
      } catch (error) {
        console.error('Error fetching users:', error);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }

  addChipFromSuggestion(user: any): void {
    const chip = `${user.EmailAddress}`;
    if (!this.chips.includes(chip)) {
      this.chips.push(chip);
      this.suggestionsselected.push(user)

    }
    this.inputText = '';
    this.showSuggestions = false;
  }

  addChip(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.inputText.trim()) {
      this.chips.push(this.inputText.trim());
      
      this.inputText = '';
    }
  }

  removeChip(index: number): void {

    const value = this.chips[index];


    this.chips.splice(index, 1);

    this.suggestionsselected = this.suggestionsselected.filter((user:any) => {  user.EmailAddress != value })
  }

  saveSelectedUsers() {
    const selectedUsers = this.searchResults.filter(user => user.selected);

  }

  
  backbutton() {
    this.isExpanded = false;
    this.Previewsdisplay = true;
    this.secondVisible = false;
    this.location.back();
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  constructor(private topicservice: TopicserviceService, private fb: FormBuilder, private authService: MsalService, private sharedService: NotificationServiceService,
    private toastService: HotToastService, private datePipe: DatePipe, private ngZone: NgZone, private cdRef: ChangeDetectorRef, private router: Router, private renderer: Renderer2
  ,private chatService: ChathistoryService) {
    this.pagedGoldLayerTablesDataList = []
  }


  searchInput(value: string) {
    if (value.length >= 3) {
      this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, value);
    } else {
      // Clear the topicsdata when the input length is less than 3 characters
      this.topicsdata = [];
    }
    if (value.length >= 3) {

      // this.topicservice.searchTopicsList(value).pipe(

      // ).subscribe((res: any) => {
      //   this.topicsdata = res.topics;
      // });
      debounceTime(300), // Wait for 300 milliseconds after the last keystroke
        distinctUntilChanged() // Only emit if the value has changed
      this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, value);

    } else if (value === '') {
      this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, "");

    }
  }
  searchTopicListSettings(value: any) {
    this.getTopicListForSettings()

  }

  async ngOnInit(): Promise<void> {
   
    const currentYear = new Date().getFullYear();
    const startYear = 1900; // Adjust start year as needed

    this.yearRange = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);

    this.addtopicform = new FormGroup({
      TopicName: new FormControl(),
      IsFeature: new FormControl(),
      languagedropdown: new FormControl(),
    });

    this.queryform = this.fb.group({
      selectedTopic: new FormControl(''),
      inputquery: ['', Validators.required]  // Define selectedTopic here
    });

    const themePreference = localStorage.getItem('darkMode');
    if (themePreference === 'enabled') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }

    try {
      await this.getAccessToken()
      // Await the asynchronous addLoggedUser method
      await this.addLoggedUser();

      // console.log(this.initForm());

      // Initialize other methods after addLoggedUser
      this.initForm();
      this.sidebaractivate();
      // this.getTopicsDataLandingpage('', this.sortRatingsPage, 'Asc', 1);
      this.getAccessListData();
      // this.fetchLiveHistory();
      // this.fetchTopicDetails(); // Call fetchTopicDetails here
      // this.carddatasection();
      // this.cahtform();

      // Reinitialize query form if needed
      this.queryform = this.fb.group({
        inputquery: ['', Validators.required],
      });

      // Subscribe to refreshTopicsList from sharedService
      this.refreshTopicsList = this.sharedService.refreshTopicsList$.subscribe(() => {
        this.sidebaractivate();
      });

      // Load topics lazily
      this.loadTopicsLazy({ first: 0, rows: 10 });

      // Get user roles
      this.getUserRoles();

      // Display success message
      this.messages = [{ severity: 'success', summary: 'Success', detail: 'Message Content' }];
    } catch (error) {
      console.error('Error during initialization:', error);
      // Optionally display an error message to the user
    }
    this.getNotifications();
  }


  async getUserRoles(): Promise<void> {
    try {
      // Get the observable first
      const rolesObservable = await this.topicservice.getUserRoles();

      // Await the response from the observable using lastValueFrom
      const roles: any[] = await lastValueFrom(rolesObservable);
      this.userRoles = roles;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      // Optionally, you can handle the error further, like showing a notification to the user
    }
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('darkMode', 'enabled');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('darkMode', 'disabled');
    }
  }

  cahtform() {
    throw new Error('Method not implemented.');
  }
  loadTopicsLazy(event: any) {
    const pageNumber = event.first / event.rows + 1;
    const pageSize = event.rows;
    // this.gettopicslistdata(this.shareOptionsFilter, pageSize, pageNumber, 'CreatedOn', 'Desc', this.userId, "")

  }
  fromValidation() {
    console.log('topic', this.addtopicform)
    if (this.addtopicform.valid) {
      this.invalidFromField = false
    } else {
      this.invalidFromField = true
    }
  }
  
  async submitForm(): Promise<void> {
    this.fromValidation(); // Validate the form

    // Check if the dialog header is for updating a topic
    if (this.dialogHeader === 'Update Topic') {
      if (this.addtopicform.valid) {
        // Handle the update logic here
        // Example: await this.handleUpdateTopic();
      }
    } else {
      // This block handles adding a new topic
      if (this.addtopicform.valid) {
        const formData = {
          "TopicName": this.addtopicform.value.TopicName,
          "languagedropdown": this.addtopicform.value.languagedropdown.id,
          "IsFeature": true,
          "addUsers": this.addingUsers,
        };

        this.formSubmitted = true;
        console.log(formData);

        try {
          // Call the service method to add topic with formData
          const response = await this.topicservice.addtopic(formData, this.userId);

          // Log the response
          console.log(response);
          this.selectedUsers = [];
          this.addingUsers = [this.addingUsers[0]];
          this.invalidFromField = false;
          this.createtopicvisible = false;
          this.TopicnameExits = response.result;

          // Fetch the updated topics list
          await this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, "");
          this.sharedService.triggerFetchNotifications();
          
          this.addtopicform.reset();
          this.resetOptions();
          this.topicIdnew = response.TopicId;

          // Call addLoggedUser and ensure it's async
          await this.addLoggedUser();
          this.calltoggle(formData.TopicName, response.TopicId);

          // location.reload(); // Reloading the page might not be necessary
        } catch (error) {
          this.invalidFromField = false;
          console.error('Error adding topic:', error);
        }
      }

      if (this.isEditMode) {
        // Handle update logic (if needed)
      } else {
        // Handle submit logic if it's not in edit mode
      }
    }
  }



  async filterShardeOPtions(value: any) {
    this.shareOptionsFilter = value.target.value;
    this.topicListViewing = value.target.value;
    await this.gettopicslistdata(value.target.value, 100, 1, 'CreatedOn', 'Desc', this.userId, "");

  }

  // card data view model start

  // sidebar start from here

  sidebarslidingVisible() {
    if (this.sidebarVisible === false) {
      this.customwidth = true;
      // this.isExpandednew =true;
    } else {
      this.customwidth = false
    }
  }

  sidebaractivate() {
    this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, "");
   
    this.addtopicforminput();
  }
  showDialogedit() {
    this.editpopupview = true
  }
  SharedDialog(){
    this.SharedPopup = true

  }

  SharedDialog1(TopicId:number){
    this.SharedPopup = true
    this.shareTopicId =  TopicId
    
  }
  ischartbox = true;

  showActivity() {
   
    this.visibleActivity = !this.visibleActivity;
  }
  openActivity() {
    if(this.isHelpDashboard){
      this.isHelpDashboard = false;
    }
    this.isactivity = !this.isactivity;
  }
  closeActivity(): void {
    this.isactivity = false;
  }
  openHelpDashboard(op: any) {
    this.isHelpDashboard = !this.isHelpDashboard;

    // Close the overlay panel
    op.hide();
}
  onCloseHelpDashboard(): void {
    this.isHelpDashboard = false; // Hide HelpDashboard
      // Ensure the chatbox component updates
  if (this.topicIdnew) {
    this.chatService.setTopic(this.topicIdnew, this.topicName);
  }
  }
  closeaddtopic() {
    this.searchResults = [];
    this.UserdataSave = [];
    this.searchInputnew = "";
    this.searchUsers();
    this.createtopicvisible = false,
      this.activeTabIndex = 0;
    this.onHideDialog();
    this.addtopicform.reset()
    this.cancelEdit()
    this.dialogHeader = 'Add Topic'
    this.invalidFromField = false,
      this.resetOptions();
    this.removedUsersList = []

  }
  resetOptions() {
    // this.Itemnumber = []
    this.claimcategory = []
    this.vendorname = []
    this.VendorIds = []
    this.deptnumber = []
    this.ClaimType = []
    this.regionName = []
    this.selectedUsers = []
    this.addLoggedUser();
    this.removedUsersList = []
  }
  onHideDialog() {
    this.searchResults = [];
    this.UserdataSave = [];
    this.selectedUsers = []
    this.addLoggedUser()
    this.searchInputnew = "";
    // this.searchUsers();
    this.createtopicvisible = false,
      this.activeTabIndex = 0;
    this.addtopicform.reset()
    this.dialogHeader = 'Add Topic';
    this.removedUsersList = []
    this.invalidFromField = false
    this.cancelEdit()
    this.resetOptions()
  }
  closeaddtopic1() { this.createtopicvisible1 = false }
  closeadduser1() { this.createtopicvisible2 = false }
  showcreatetopicsDialog1() { this.createtopicvisible1 = true }
  showcreatetopicsDialog2() { this.createtopicvisible2 = true }
  settingspage() { this.settingspagevisible = true }
  filtermain() { this.filtermainvisible = true }
  ManageSettings() { this.ManageSettingsvisible = true, this.settingspagevisible = true };
  closeAccesslist1() { this.ManageSettingsvisible = false, this.settingspagevisible = true };
  Mainsettingsclose() { this.settingspagevisible = false };
  TopicListCancel() { this.TopiclistSettingsvisible = false, this.settingspagevisible = true }
  TopiclistSettings() { this.TopiclistSettingsvisible = true, this.settingspagevisible = true, this.getTopicListForSettings() }
  // get topic list



  async gettopicslistdata(requestIds: number, pageSize: number, pageNumber: number, sortBy: string, sortOrder: string, userId: number, searchValue: string) {
    try {
      const res: any = await this.topicservice.getTopicList(requestIds, sortBy, sortOrder, userId, searchValue);
      this.topicsdata = res;
  
      // Filter data based on date
      this.topicsdataToday = this.topicsdata?.filter((todayData: any) =>
        todayData.CreatedOn?.slice(0, 10) === this.getCurrentTime2()
      );
      this.topicsdataYesderday = this.topicsdata?.filter((yester: any) =>
        yester?.CreatedOn?.slice(0, 10) === this.getCurrentTime3()
      );
      this.topicsdatePrevios = this.topicsdata?.filter((prev: any) =>
        prev?.CreatedOn?.slice(0, 10) !== this.getCurrentTime2() && prev?.CreatedOn?.slice(0, 10) !== this.getCurrentTime3()
      );
  
      console.log("testing");
  
      // Filter pinned topics and remove duplicates
      this.topicsdata?.forEach((data: any) => {
        if (data.isPinned) {
          const alreadyPinned = this.pinnedTopics.some((pinned: any) => pinned.TopicId === data.TopicId);
          if (!alreadyPinned) {
            this.pinnedTopics.push(data);
          }
  
          // Remove from the original topics list (Recent tab)
          this.topicsdata = this.topicsdata.filter((t: { TopicId: any }) => t.TopicId !== data.TopicId);
        }
      });
  
      return this.topicsdata; // Return the data if needed
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error; // Rethrow the error if needed
    }
  }
  
  customFilterFunctionLang(event: any) {
    // Implement custom filtering logic if needed
    // Example for language filtering:
    const filteredOptions = this.languages.filter((language) =>
      language.name.toLowerCase().includes(event.target.value.toLowerCase())
    );
    return filteredOptions;
  }


  addtopicforminput() {
    this.addtopicform = this.fb.group({
      TopicName: ['', [Validators.required, Validators.minLength(3)]],

      // vendorname1:[''],
      // selecttopic: [0, Validators.required],

      languagedropdown: ['', Validators.required],

      // ItemNumber: [0,],

      // IsFeature: [Validators.required],
      addUsers: [
        {
          "userId": 1,
          "RoleId": 1
        }]
    })

    this.dropdowndata();

  }

  editTopic(event: Event) {
    // this.topicservice.getUserRolesLeftNav(this.topicIdnew, this.userId).subscribe((res: any) => {
    this.fetchTopicDetails();
    this.dialogHeader = "Update Topic";

    this.isEditMode = true;
  }
  cancelEdit() {
    this.isEditMode = false;
    this.invalidFromField = false
    // Additional logic if needed
  }

  isEditing: boolean = false;   // Tracks whether editing is active
  editedTopicId: number | null = null;  // Tracks the topic being edited

  // This function will be called when you click on the topic to start editing
  enableEditing(topicId: number): void {
    this.isEditing = true;
    this.editedTopicId = topicId;
  }

  // Modified saveTopic to update both pinned and recent topics
  async saveTopic(topicId: number, TopicName: string): Promise<void> {
    try {
      const formData = {
        "TopicId": topicId,
        "TopicName": TopicName,
        "IsFeature": true,
        "addUsers": this.addingUsers,
      };

      // Call the service method to edit the topic
      const response = await this.topicservice.editTopicForm(formData, this.userId);

      // Update both pinnedTopics and topicsdata arrays
      this.updateTopicNameInArrays(topicId, TopicName);

      // Reset editing state
      this.isEditing = false;
      this.editedTopicId = null;

      // Reset other states as needed
      this.createtopicvisible = false;
      this.dialogHeader = 'Add Topic';
      this.addtopicform.reset();
      this.resetOptions();
      this.selectedUsers = [];
      await this.addLoggedUser();
      this.searchInputnew = "";
      this.invalidFromField = false;
    } catch (error) {
      console.error('Error updating topic:', error);
      this.invalidFromField = false;
    }
  }

  // New helper method to update topic name in both arrays
  private updateTopicNameInArrays(topicId: number, newName: string): void {
    // Update in pinnedTopics array
    const pinnedIndex = this.pinnedTopics.findIndex(topic => topic.TopicId === topicId);
    if (pinnedIndex !== -1) {
      this.pinnedTopics[pinnedIndex].TopicName = newName;
    }

    // Update in topicsdata array
    const recentIndex = this.topicsdata.findIndex((topic: { TopicId: number; }) => topic.TopicId === topicId);
    if (recentIndex !== -1) {
      this.topicsdata[recentIndex].TopicName = newName;
    }
  }

  updateTopic(updatedData: any) {
    this.topicsdata = updatedData;
    // console.log('Parent topicData updated:', this.topicsdata);
  }


  searchTopicsActivity(event: any) {
    // Get the search input value
    const selectedDate = event.target.value;
    this.searchValue = selectedDate; // Store the search term for use in date filter
    // console.log('Search Value:', selectedDate);
  
    // Apply search filter on the entire data or date-filtered data
    const filteredByDate = this.topicsdata.filter((tpc: { CreatedOn: number }) =>
      tpc.CreatedOn >= this.updateActivityDate
    );
    
    if (selectedDate && selectedDate.trim()) {
      this.filteredActivityValue = filteredByDate.filter((tpc: any) =>
        tpc.TopicName.toLowerCase().replace(/\s+/g, ' ').trim().includes(
          selectedDate.toLowerCase().replace(/\s+/g, ' ').trim()
        )
      );
    } else {
      this.filteredActivityValue = filteredByDate; // No search value, use date-filtered data
    }
    // console.log('Combined Filter Result (After Search):', this.filteredActivityValue);
  }

  searchChat(event: any) {

    const dataVal = event.target.value;
    // console.log(dataVal);
    this.chatMessageArray = this.chatMessagesFromChild.filter((msg) => (
      msg.text.toLowerCase().replace(/\s+/g, ' ').trim().includes(dataVal.toLowerCase().replace(/\s+/g, ' ').trim())
    ));

    // console.log(this.chatMessageArray);
    return this.chatMessageArray;
  }


  async fetchTopicDetails(): Promise<void> {
    this.addingUsers = [];
    this.selectedUsers = [];

    try {
      let data = await this.topicservice.getTopicDetails(this.userId, this.topicIdnew);

      // Reset selected users and adding users
      this.selectedUsers = [];
      this.addingUsers = [];
      console.log(data);

      let dataKey = Object.keys(data)[0];
      data = data[dataKey];
      console.log(data);

      // Store topic details
      this.topicDetailsnew = data;

      // Run the following code in Angular's NgZone
      this.ngZone.run(() => {
        setTimeout(() => {
          this.addtopicform.patchValue({
            TopicName: data.TopicName.TopicName,
            IsFeature: data.IsFeature === true,
          });
          console.log(data);

          // Log to check the transformed users
          console.log('Transformed selectedUsers:', this.selectedUsers);

          // Toggle user selection based on the updated users array
          for (const user of this.selectedUsers) {
            this.toggleUserSelection(user);
          }

          console.log('Final selectedUsers after toggle:', this.selectedUsers);

          // Transform the data and assign it to topicDetailsToDisplay
          this.topicDetailsToDisplay = [
            {
              TopicName: data.TopicName,
            },
          ];
        }, 2000);

        // Sort the yearRange array to ensure the years are in ascending order
        this.yearRange.sort((a, b) => a - b);
      });
    } catch (error: any) {
      console.error('Error fetching topic details:', error);
    }
  }

  dropdowndata() {
    this.ComparisonTopicsSelect = [
      { name: 'Vendor Information', code: 'PCI' },
      { name: 'Vendor Information Claim', code: 'NCCL' },
      { name: 'Vendor Information Group', code: 'THC' },
      { name: 'Vendor Information Collection', code: 'THC' },
    ]


  }
  

  @ViewChild('chatcontainer') chatContainerViewChild!: ElementRef;
  // chatMessages: { question: string, answer: string }[] = [];
  queryform!: FormGroup;
  question: string = ''; // Declare and initialize the question variable
  askdata: string | undefined; // Update to match the type of 'answer'
  adddata = false;
  // spindisplay = false;

  chatMessages: any[] = [];
  spindisplay: boolean = false;


  // chatbox section start

  // @ViewChild('chatcontainer') chatContainerViewChild!: ElementRef;

  // chatMessages: any[] = [];

  initForm(): void {
    this.queryform = this.fb.group({
      inputquery: ['', Validators.required],
      selectedTopic: ['', Validators.required],
      pdfInputField: ['', Validators.required]
    });



  }

  onChatKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      const message = (<HTMLInputElement>event.currentTarget).value;
      const lastMessage = this.chatMessages[this.chatMessages.length - 1];
      if (lastMessage.from) {
        this.chatMessages.push({ messages: [message] });
      }
      else {
        lastMessage.messages.push(message);
      }

      if (message.match(/primeng|primereact|primefaces|primevue/i)) {
        this.chatMessages.push({ from: 'Ioni Bowcher', url: 'assets/demo/images/avatar/ionibowcher.png', messages: ['Always bet on Prime!'] });
      }

      (<HTMLInputElement>event.currentTarget).value = '';

      const el = this.chatContainerViewChild.nativeElement;
      setTimeout(() => {
        el.scroll({
          top: el.scrollHeight,
          behavior: 'smooth'
        });
      }, 1);
    }
  }

  // Helper function to display an error message
  showErrorMessage(message: string) {
    // You can use a UI library like Toastr or SweetAlert to display the error message
    console.error(message);
    // Example using Toastr:
    // this.toastr.error(message, 'Error');
  }


  getCurrentTime(): string {
    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(currentDate, 'MM/dd/yy, h:mm a');
    console.log(formattedDate);
    return formattedDate || '';
  }

  getCurrentTime2(): any {
    const formattedDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    return formattedDate;
  }
  getCurrentTime3(): any {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedYesterday = this.datePipe.transform(yesterday, 'yyyy-MM-dd');
    return formattedYesterday;
  }

  getDateValue(dateParam:number): any {
    const today = new Date();
    const dateValue = new Date(today);
    dateValue.setDate(today.getDate() - dateParam);
    const formattedDateValue = this.datePipe.transform(dateValue, 'yyyy-MM-dd');
    return formattedDateValue;
  }


  updateVariable(variable: number) {
    // Update the parent variable
    this.receiveDateParamFromChild = variable; 
    // console.log('Variable received from child:', variable);
  
    // Filter by date
    this.updateActivityDate = this.getDateValue(variable);
    // console.log(this.updateActivityDate);
    const filteredByDate = this.topicsdata.filter((tpc: { CreatedOn: number }) =>
      tpc.CreatedOn >= this.updateActivityDate
    );
    // console.log('Filtered by Date:', filteredByDate);
  
    // Combine with the search filter if search value exists
    if (this.searchValue && this.searchValue.trim()) {
      this.filteredActivityValue = filteredByDate.filter((tpc: any) =>
        tpc.TopicName.toLowerCase().replace(/\s+/g, ' ').trim().includes(
          this.searchValue.toLowerCase().replace(/\s+/g, ' ').trim()
        )
      );
    } else {
      this.filteredActivityValue = filteredByDate; // No search value, only filter by date
    }
    // console.log('Combined Filter Result:', this.filteredActivityValue);
  }

  



  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarslidingVisible()
    console.log(this.isToggled);
    if (this.isToggled) {
      this.isToggled = false;
      this.toggleChanged();
    }
    this.isCollapsed = true;
    this.isCollapsedPinned = true;
    // this.isToggled = true;
    this.showAllTopics = false;
    // Additional logic to toggle sidebar visibility
  }

shareTopicId:number = 0

  assigningTopic(TopicId: any) {
    // console.log(TopicId);
    this.topicIdnew = TopicId;
    this.shareTopicId = TopicId
  }

  filterById(topic_id: Number) {
    console.log(topic_id);
    this.topicArrayForEdit = this.topicsdata.filter(
      (tpc: any) => tpc.TopicId === topic_id
    );
  }



  async updateTopicList() {
    // Define parameters
    const requestIds = 1;
    const sortBy = 'CreatedOn';
    const sortOrder = 'Desc';
    const userId = this.userId;
    const searchValue = ''; // Example search text

    try {
      // Fetch the updated topic list using the service method
      const response = await firstValueFrom(
        await this.topicservice.getTopicList(requestIds, sortBy, sortOrder, userId, searchValue)
      );
      console.log(response);
      // Handle the response data as needed
    } catch (error) {
      console.error('Error getting updated topic list:', error);
      // Handle the error if needed
    }
  }

  onDropdownChange(event: any) {
    const selectedValue = event.target?.value; // Safely access value property
    if (selectedValue) {
      // Check if a dropdown item is selected
      this.itemSelected = selectedValue !== 'Select';
    }
  }


  // Method to check if the selected topic is valid
  isTopicSelected(): boolean {
    const selectedTopic = this.queryform.get('selectedTopic')?.value;
    return selectedTopic !== 'Select' && selectedTopic !== null;
  }
  toggleButtonState(event: Event) {

  }

  refreshQuestion(messageId: any) {
    this.queryform.patchValue({ inputquery: messageId });
    this.calladdQuery()
  }



  async getAccessListData(): Promise<void> {
    try {
      // Fetch the access list data using the service
      const data = await lastValueFrom(await this.topicservice.getAccessList(this.userId));
      this.accessList = data;
    } catch (error) {
      console.log('Error fetching access list:', error);
      // Optionally show a toast notification here
    }
  }

  async getTopicListForSettings(): Promise<void> {
    const searchText = this.searchTextTopicList;
    const pageSize = this.settingsRows;
    const pageNumber = 1;
    const sortBy = 'TopicId';
    const sortOrder = 'Desc';

    try {
      // Fetch the topic list data using the service
      const data = await this.topicservice.getTopicListForSettings(
        searchText,
        pageSize,
        pageNumber,
        sortBy,
        sortOrder,
        this.userId
      );

      // Check if data has topics property
      if (data.topics) {
        this.topicListForsettings = data.topics;
      } else {
        console.error('No topics found in the response:', data);
      }

      this.filteredTopicList = this.topicListForsettings; // Initially set to unfiltered list
    } catch (error) {
      console.error('Error fetching topic list:', error);
      // Optionally show a toast notification here
    }
  }
  getStarIcons(rating: number): string {
    let starIcons = '';
    for (let i = 0; i < rating; i++) {
      starIcons += '<i class="fa fa-star" aria-hidden="true"></i>';
    }
    return starIcons;
  }


  handleRoleChange(user: any, roleId: any) {
    const userIndex = this.searchResults.findIndex(u => u.UserId === user);
    const selectedRoleId = Number(roleId.value);
    if (userIndex !== -1) {
      this.searchResults[userIndex].UserRoleId = selectedRoleId;
    }

  }
  async searchUsers(): Promise<void> {
    // Check if the search input is not empty
    if (this.searchInputnew.trim() !== '') {
      try {
        // Fetch search results using the service
        const data: any = await lastValueFrom(this.topicservice.searchUsers(this.searchInputnew, this.userId));

        console.log(data)
        this.searchResults = data; // Assuming the API returns an array of users

        // Combine with existing UserdataSave
        for (let elem of this.UserdataSave) {
          this.searchResults.push(elem);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        // Optionally show a toast notification here
      }
    }

    // Optional: You can still add the AliasName to searchResults if needed
    // this.searchResults.push({"Username": this.AliasName});
  }

  async fetchLiveQuestions(topicId: any): Promise<void> {
    // Assuming UserId and TopicId are fixed, you can modify this as needed
    const UserId = this.userId;
    const TopicId = topicId;
    const pageSize = 10;
    const pageNumber = 1;
    const sortBy = 'Question';
    const sortOrder = 'Desc';
    const TopicquestionanwserId = 1;

    // Clear search parameters
    this.datesearch = "";
    this.chatsearchText = '';
    this.usersearch = '';

    try {
      // Fetch live questions using the service
      const data = await this.topicservice.getLiveQuestions(
        UserId,
        TopicId,
        this.datesearch,
        this.chatsearchText,
        this.usersearch,
        pageSize,
        pageNumber,
        sortBy,
        sortOrder
        
      );

      // Update 'liveQuestions' with the fetched data
      console.log(data);
      this.liveQuestions = data; // Adjust if your API returns questions in a different property
    } catch (error) {
      console.error('Error fetching live questions:', error);
      // Optionally show a toast notification here
    }
  }

  // Async Function to Get Featured Topics
  async getFeaturedTopics(): Promise<void> {
    const userId = this.userId;
    let sortOption: string;

    if (this.selectedSortOption === '1') {
      this.sortRatingsPage = "Rating High To Low";
      sortOption = 'High To Low';
    } else if (this.selectedSortOption === '-1') {
      this.sortRatingsPage = "Rating Low To High";
      sortOption = 'Low To High';
    } else {
      this.sortRatingsPage = "Rating High to Low";
      sortOption = 'High To Low';
    }

    try {
      // Call the service method to get featured topics and convert the Observable to a Promise
      const data = await this.topicservice.getFeaturedTopicList(sortOption, userId);

    } catch (error) {
      console.error('Error fetching featured topic list:', error);
    }
  }


  async SuggestionQuestions(topicId: any): Promise<void> {
    try {
      // Call the service method to get frequently asked questions
      const data = await this.topicservice.FrequentlyAskedQuestions(topicId);
      data.subscribe(res => {

        this.liveQuestions = res;

      })

    }

    catch (error: any) {
      console.error('Error fetching suggested questions:', error);
    }
  }



  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.pageSize;
    const endIndex = Math.min(
      startIndex + this.pageSize - 1,
      this.filteredTopics.length - 1
    );
    console.log(this.filteredTopics)
    this.pagedGoldLayerTablesDataList = this.filteredTopics.slice(
      startIndex,
      endIndex + 1
    );

    // this.getTopicsDataLandingpage('', this.sortRatingsPage, 'Asc', 1);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredTopics.length / this.pageSize);
  }

  get pages(): number[] {
    const totalPages = this.totalPages;
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  @ViewChild(ChatboxComponent) chatboxComponent!: ChatboxComponent;
  @ViewChild(ActivityComponent) activityComponent!: ActivityComponent;

  @ViewChild('op5') overlayPanel!: OverlayPanel;

  showOverlay(event: MouseEvent) {
    this.overlayPanel.show(event);
  }


  adjustOverlayPosition() {
    // Adjust the position of the overlay to be to the right of the target
    const overlayElement = document.querySelector('.p-overlaypanel') as HTMLElement;
    if (overlayElement) {
      if(this.sidebarVisible){
        overlayElement.style.left = `${overlayElement.offsetLeft + 240}px`; // Adjust this value as needed

      }else{
        overlayElement.style.left = `${overlayElement.offsetLeft + 10}px`; // Adjust this value as needed
        overlayElement.style.top = `${overlayElement.offsetTop - overlayElement.offsetHeight + 75}px`;
      }
    }
  }
  topicId = '123'; // Example topic ID
  // Example sort order

  // ngAfterViewInit() {
  //   // Safe to access child component here
  // }

  idFromActivity:number = 0;
  nameFromActivity:string='';

  topicIdActityDataHandle(data: { topicIdVal: number, topicNameVal:string }){
      this.idFromActivity = data.topicIdVal;
      this.nameFromActivity = data.topicNameVal;
      // console.log(this.idFromActivity);
      // console.log(this.nameFromActivity);

      this.chatboxComponent.toggleDisplaysTopicname(this.nameFromActivity, this.idFromActivity)
      
  }
  topicNameActivityDataHandle(data:string){
    this.nameFromActivity = data;
    
  }

 topicshareid:number = 0;



handleActivityClose(): void {
  // Close the activity view and show the chatbox
  this.isactivity = false;
  this.isHelpDashboard = false;

  // Ensure the chatbox component updates
  if (this.topicIdnew) {
    this.chatService.setTopic(this.topicIdnew, this.topicName);
  }
}

  calltoggle(topicName: string, topicId: number) {
    this.topicIdnew = topicId;
    this.topicName = topicName;

    this.topicshareid = topicId

    if(this.isactivity){
      this.isactivity = true;
    }
    if(this.isHelpDashboard){
      this.isHelpDashboard = true;
    }

    this.new_chat = true;

    // console.log(topicName, topicId)
    this.chatboxComponent.toggleDisplaysTopicname(topicName, topicId);
  }

  calladdQuery() {

    this.chatboxComponent.addqueryhere()

  }

  callnewchat() {
    this.new_chat = false;
    // console.log("clicked new chat btn")
    this.chatboxComponent.startNewChat()
    
  }

  callnewchaticon() {
    this.new_chat = true;
  }
}



