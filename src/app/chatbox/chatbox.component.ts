// chatbox.component.ts
// import { Component, OnInit,Input, ViewChild,NgZone } from '@angular/core';
import { Component, ElementRef, OnInit, ViewChild, NgZone, Input, EventEmitter, Output, AfterViewInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormControlName } from '@angular/forms';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { MsalService } from '@azure/msal-angular';
// import { Message } from 'primeng/api';
import { HotToastService } from '@ngneat/hot-toast';
import { DatePipe } from '@angular/common';
import { C } from '@fullcalendar/core/internal-common';
import { NotificationServiceService } from '../dashboard/services/notification-service.service';
import { Observable, Subscription, firstValueFrom, lastValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { HttpResponse } from '@angular/common/http';
import { TopicserviceService } from '../dashboard/services/topicservice.service';
// import { ImportsModule } from './imports';
import { MessageService } from 'primeng/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentGeneratorComponent } from '../common/document-generator/document-generator.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { MicrophoneServiceService } from './microphone-service.service';
import { SideMenuServiceService } from '../side-menu-service.service';
import { ChathistoryService } from '../chathistory.service';
export interface TopicResponse {
  answer: string;
  questions_ui: string[];
  // Define other properties as needed
}
// import {topicList} from './Model/topic-response.model'
declare var MathJax: any;
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
  TopicId: number;      // Replace 'number' with 'string' if TopicId is a string
  TopicName: string;
  username?: string;    // Add any other properties if needed
  email?: string;
}

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss'],
  // imports: [ImportsModule],
  providers: [MessageService]

})
export class ChatboxComponent implements OnInit, AfterViewInit {

  chatHistory: any[] = [];
  transcribedText: string = '';  // Variable to hold the transcribed text
  isButtonVisible: boolean = false; // Whether the submit button is visible
  isListening: boolean = false;  // To keep track of the microphone state
  isSideMenuOpen = true;
  isEditing: boolean = false; // Tracks whether editing mode is active
  editedTopicName: string = ''; // Temporary holder for the new topic name
  
  hoveredRating: number = 0; // Track hovered star rating

  @Input() selectedTopicName: string = '';
  startEditing(currentTopicName: string): void {
    this.isEditing = true;
    this.editedTopicName = currentTopicName; // Initialize the input with the current name
  }

  // Save the new topic name and call the API
  async saveTopicName(): Promise<void> {
    if (this.editedTopicName.trim() && this.selectedTopicId) {
      // Call the saveTopic API to update the topic name
      await this.saveTopic(this.selectedTopicId, this.editedTopicName);

      // Update the UI to reflect the new topic name
      this.selectedTopicName = this.editedTopicName;
    }
    this.isEditing = false; // Exit editing mode
  }

  // Cancel editing without saving changes
  cancelEditing(): void {
    this.isEditing = false; // Exit editing mode
  }

  // Save topic via API
  async saveTopic(topicId: number, TopicName: string): Promise<void> {
    this.isEditing = false;

    const formData = {
      "TopicId": topicId,
      "TopicName": TopicName,
      "IsFeature": true,
      "addUsers": this.addingUsers,
    };

    console.log("Saving topic:", formData);

    try {
      // Convert userId to a string before passing it to the service method
      const response = await this.topicservice.editTopicForm(formData, this.userId.toString());

      // Handle successful response
      // this.toastService.success('Topic Updated Successfully');

      // Fetch updated topics list
      await this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, "");

      // Reset form and state
      // this.cancelEdit();
      this.createtopicvisible = false;
      this.dialogHeader = 'Add Topic';
      this.addtopicform.reset();
      // this.resetOptions();
      this.selectedUsers = [];

      // await this.addLoggedUser();

      this.searchInputnew = "";
      this.invalidFromField = false;
    } catch (error) {
      this.invalidFromField = false;
      console.error('Error updating topic:', error);

      // Optionally show an error toast
      this.toastService.error('Error updating topic');

    }
  }

  submitForm() {
    if (this.transcribedText && this.transcribedText.trim() !== '') {
      this.addqueryhere(); // Call the submit function
    }
  }



  toggleRecording(): void {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  startListening(): void {
    this.microphoneService.startListening();
    this.isListening = true;
  }

  stopListening(): void {
    this.microphoneService.stopListening();
    this.isListening = false;
  }

  toggleEnterButton(): void {
    this.isButtonVisible = this.transcribedText.trim().length > 0;
  }

  @Output() greetEvent = new EventEmitter<void>();


  shareOptionsFilter: any = "6";
  sortRatingsPage: any = "TopicName";
  @ViewChild('chatSection') chatList!: ElementRef;
  items: { isLiked: boolean; liked: boolean; disLiked: boolean; disliked: boolean }[] = [];
  scheduledQuery: boolean = false
  activeTabIndex: number = 0;
  messages: any[] | undefined;
  topicDetails: any;
  topicDetailsnew: any[] = [];
  yearRange: number[] = [];
  disLiked: any;
  invalidFromField: boolean = false;
  selectedTopicId: any;
  sortChatByOrder: string = "Latest";
  pagedGoldLayerTablesDataList: any[] = [];
  isSelectedDropdownDisabled: boolean = true
  animation: boolean = false

  userRoleReader: boolean = false
  subscription: any;
  removeUsers: any = {};
  removedUsersList: any[] = []
  location: any = Location
  UserDetails: any = {};
  firsttime: boolean = true;
  notificationTotalCount: number = 0;
  images: any = []
  topicName: string = " "
  speakerId: number = 0;
  sources: any = [];

  isAnyChecked = false;


  @Input() chatMessageFilter: any[] = [];

  constructor(private microphoneService: MicrophoneServiceService, private messageService: MessageService, private topicservice: TopicserviceService, private authService: MsalService, private toastService: HotToastService, private fb: FormBuilder, private elRef: ElementRef
    , private sideMenuService: SideMenuServiceService,private chatService: ChathistoryService) {
    this.pagedGoldLayerTablesDataList = []
    this.microphoneService.getTranscript().subscribe((transcript: string) => {
      this.transcribedText = transcript;
      this.queryform.patchValue({ inputquery: transcript }); // Update the form control value
    });

  }

  processMessage(text: string): string[] {
    // Splits by line breaks and identifies LaTeX or tables for separate processing
    return text.split('\n').map(line => {
      if (line.includes('<table>')) {
        return line; // Return table HTML as is
      } else if (line.includes('$$')) {
        return this.convertLatexToHtml(line); // Process LaTeX
      }
      return line;
    });
  }

  convertLatexToHtml(latex: string): string {
    // Replace $$...$$ with span elements for MathJax to pick up
    return latex.replace(/\$\$(.*?)\$\$/g, '<span>\\($1\\)</span>');
  }

  @Input() topicsdata: any;  // Receive data from the parent
  @Output() topicUpdated = new EventEmitter<string>();  // Send updates to the parent



  async ngOnInit(): Promise<void> {
    const currentYear = new Date().getFullYear();
    const startYear = 1900; // Adjust start year as needed
    // this.speechService.connect();

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

    try {
    
      // Reinitialize query form if needed
      this.queryform = this.fb.group({
        inputquery: ['', Validators.required],
      });


      // Display success message
      this.messages = [{ severity: 'success', summary: 'Success', detail: 'Message Content' }];
      this.startTypingAlias();
    } catch (error) {
      console.error('Error during initialization:', error);
      // Optionally display an error message to the user
    }
    this.sideMenuService.isSideMenuOpen$.subscribe((isOpen) => {
      if (isOpen) {
        this.isSideMenuOpen = true;
      } else {
      this.isSideMenuOpen = !this.isSideMenuOpen;
      }
    });

  
    this.chatService.currentTopicId$.subscribe((topicId) => {
      if (topicId) {
        this.topicId = topicId;
        this.loadChatHistory(); // Load chat history for the updated topic
      }
    });
    
  }
  loadChatHistory(): void {
    if (this.topicId) {
      this.fetchLiveHistory(this.topicId, this.sortChatByOrder);
    } else {
      console.error('TopicId is not defined.');
    }
  
  }


  @ViewChild('chatcontainer') chatContainerViewChild!: ElementRef;


  // chatMessages: { question: string, answer: string }[] = [];
  queryform!: FormGroup;
  question: string = ''; // Declare and initialize the question variable
  askdata: string | undefined; // Update to match the type of 'answer'
  adddata = false;



  topicsdataNew: Topic[] = []; // Define topicsdata as an array of Topic
  // visible = false;
  selectedTopic: any = null;

  // AddtopicObject!:topicList;
  currentPage: number = 1;
  pageSize: number = 6;
  public addtopicform!: FormGroup

  @Input() topicId!: number;
  @Input() userId!: number;
  @Input() new_chat!: boolean;
  // @Input() isToggled : boolean;
  @Input() trimmedAlias!: string;

  // sidebarVisible: boolean = false;
  @Input() sidebarVisible!: boolean;
  // topicsdata: any;
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
  rows: number = 6;
  settingsRows: number = 25;
  updateValue: any;
  // private refreshTopicsList: Subscription | undefined;
  topicsDataLandingpage: any[] = [];
  selectedTopicIdForUserRoleID: any
  sortOptions: any[] = [
    { label: 'High to Low ..', value: '1' },
    { label: 'Low to High ..', value: '-1' }
  ];
  isEditMode: boolean = false;
  selectedSortOption: string = '';
  dialogHeader: string = "Add Chat Name";
  // selectedTopicName: string | undefined;
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
  // new_chat:boolean = true;
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
  isLoadingMessage: boolean = false;
  userInput: string = '';
  // isButtonVisible: boolean = false;

  chatMessages: any[] = [];
  spindisplay: boolean = false;
  displayedAliasName: string = ''; // This will hold the animated name
  typingSpeed: number = 200; // Speed of typing in milliseconds
  showMessages: boolean = false;



  @Output() chatMessagesChange = new EventEmitter<any[]>();

  startTypingAlias() {
    const name = this.capitalizeFirstLetter(this.AliasName); // Get the alias name
    let index = 0;
    this.displayedAliasName = ''; // Reset displayed name

 // this.isSideMenuOpen = false;
    const interval = setInterval(() => {
      if (index < name.length) {
        this.displayedAliasName += name.charAt(index); // Append next character
        index++;
      } else {
        clearInterval(interval); // Stop typing when done
        this.showMessages = true; // Set to true if you want to show messages afterward
      }
    }, this.typingSpeed);
  }


  getCurrentTime(): string {
    const currentDate = new Date();
    const datePipe = new DatePipe('en-US');
    const formattedDate = datePipe.transform(currentDate, 'MM/dd/yy, h:mm a');
    return formattedDate || '';
  }


  checknamelength(name: string) {

    const maxLength = 1; // Set your max length here
    return name.length > maxLength
      ? name.substring(0, maxLength).toUpperCase()
      : name;

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
  displayQuestion(question: string) {

    navigator.clipboard.writeText(question).then(

    );
  }
  refreshQuestion(messageId: any) {
    this.queryform.patchValue({ inputquery: messageId });
    this.addqueryhere()
  }
  Regerateclick(messageId: any, question: string) {
    this.queryform.patchValue({ inputquery: question });
    this.addqueryhere(messageId, true); // Pass messageId and regeneration flag
  }


  AnswerFullscreen(text: any) {
    this.AnswerDisplayDialog = true
    this.DisplayQuestions = text;
  }

  showContrast() {
    this.messageService.add({ severity: 'info', detail: 'Copy to clipboard' });
  }

  @ViewChild('chatSectionList') chatSectionList!: ElementRef;

  ngAfterViewInit() {
    if (this.chatSectionList) {
      const chatContent = this.chatSectionList.nativeElement as HTMLElement;
      // console.log('Chat content element found:', chatContent);
      // Now you can use chatContent here or in other methods like downloadChatAsPDF
    }
  }


  @ViewChild('documentGenerator') documentGenerator!: DocumentGeneratorComponent


  downloadChatAsPDF(TopicquestionanwserId: number) {
    // const chatContent = this.chatSectionList.nativeElement;s
    //  console.log(this.topicId, this.userId,TopicquestionanwserId)
    this.documentGenerator.generateDocumentchatlevel(this.topicId, this.userId, TopicquestionanwserId, " chat");

  }

  async updateLike(questionAnswerId: number, isLiked: boolean): Promise<void> {
    const userId = this.userId; // Assuming the userId is fixed
    const topicId = this.topicIdnew; // Assuming the topicId is fixed
    const TopicquestionanswerId = questionAnswerId; // Assuming the topicQuestionAnswerId is fixed

    // console.log(this.chatMessages);
    let liker = -1;

    this.chatMessages.forEach((chat: any) => {
      if (chat['TopicquestionanwserId'] === TopicquestionanswerId) {
        if (chat.isLiked === true) {
          isLiked = false;
          liker = -1;
          chat.isLiked = false;
          chat.isDisliked = false;
        } else {
          liker = 1;
          chat.isLiked = true;
          chat.isDisliked = false;
        }
      }
    });

    try {
      // Call the service method to update liking status
      const response = await this.topicservice.updateLikingStatus(userId, topicId, TopicquestionanswerId, liker);

      // Handle response if needed
      // this.fetchLiveHistory(this.selectedTopicId, this.sortChatByOrder);
    } catch (error) {
      // Handle error if any
      console.error('Error updating like status:', error);
    }
  }

  async updateDisLike(questionAnswerId: number, isLiked: boolean): Promise<void> {
    const userId = this.userId; // Assuming the userId is fixed
    const topicId = this.topicIdnew; // Assuming the topicId is fixed
    const TopicquestionanswerId = questionAnswerId; // Assuming the topicQuestionAnswerId is fixed

    // console.log(this.chatMessages);
    let liker = -1;

    this.chatMessages.forEach((chat: any) => {
      // console.log('at chat dislike', questionAnswerId, chat['TopicquestionanwserId']);
      if (chat['TopicquestionanwserId'] === TopicquestionanswerId) {
        // console.log("At disliked");
        if (chat.isDisliked === true) {
          liker = -1;
          chat.isDisliked = false;
          chat.isLiked = false;
        } else {
          liker = 0;
          chat.isDisliked = true;
          chat.isLiked = false;
        }
      }
    });

    try {
      // Call the service method to update disliking status
      const response = await this.topicservice.updateDisLikingStatus(userId, topicId, TopicquestionanswerId, liker);

      // Handle response if needed
      // this.fetchLiveHistory(this.selectedTopicId, this.sortChatByOrder);
    } catch (error) {
      // Handle error if any
      console.error('Error updating dislike status:', error);
    }
  }





  // Download files //
  async downloadFile(questionAnswerId: any): Promise<void> {
    const userId = this.userId; // Assuming the userId is fixed
    const topicId = this.topicIdnew; // Assuming the topicId is fixed
    const topicQuestionAnswerId = questionAnswerId; // Assuming the topicQuestionAnswerId is fixed

    try {
      // Call the service method to trigger file download
      const blob = await this.topicservice.downloadFile(userId, topicId, topicQuestionAnswerId);
      this.saveFile(blob); // Function to save the file
    } catch (error) {
      console.error('Error downloading file:', error);
      this.toastService.error('Failed to download file'); // Display error message
    }
  }


  // Function to save the file
  saveFile(data: Blob) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export_1_10.xlsx'; // Filename from the response headers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }


  async updateStarRating(index: number, rating: number, questionAnswerId: any): Promise<void> {
    // Find the starRatings entry corresponding to the questionAnswerId
    const starRatingEntry = this.starRatings.find(entry => entry.TopicquestionanwserId === questionAnswerId);

    // If the entry is found, update its ratings array
    if (starRatingEntry) {
      starRatingEntry.ratings.fill(0, index + 1); // Reset the stars after the clicked star
      starRatingEntry.ratings.fill(1, 0, index + 1); // Set the clicked star and preceding stars to 1
    } else {
      // If the entry is not found, create a new entry and push it to the starRatings array
      this.starRatings.push({
        TopicquestionanwserId: questionAnswerId,
        ratings: Array(5).fill(0).fill(1, 0, index + 1) // Fill the new ratings array with stars up to the clicked index
      });
    }

    const userId = this.userId; // Assuming UserId is hardcoded to 1
    const topicId = this.topicIdnew; // Assuming TopicId is hardcoded to 4
    const topicQuestionAnswerId = questionAnswerId; // Assuming TopicquestionanwserId is hardcoded to 14
    const isRated = true; // Assuming isRated value
    const newRating = index + 1; // Rating value based on star index

    try {
      // Call the service method to insert or update rating
      const response = await this.topicservice.insertUpdateRating(userId, topicId, topicQuestionAnswerId, isRated, newRating);

      // Handle success response if needed
      // console.log('Rating updated successfully:', response);
    } catch (error) {
      // Handle error response if needed
      console.error('Error updating rating:', error);
    }
  }


  getStarRating(TopicquestionanwserId: number, noOfRatings: number): number[] {
    const rating = this.starRatings.find(r => r.TopicquestionanwserId === TopicquestionanwserId);
    if (rating) {
      return rating.ratings;
    }

    const starRatings = new Array(5).fill(0);
    for (let i = 0; i < noOfRatings; i++) {
      starRatings[i] = 1;
    }
    return starRatings;
  }
  starColor(index: number): string {
    const ratings = this.starRatings[index]?.ratings; // Access the ratings array at the specified index
    return ratings && ratings.includes(1) ? '#f59f00' : ''; // Return 'black' if the star is filled, otherwise ''
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

  // ngAfterViewChecked(): void {
  //   this.scrollToBottom();
  //   console.log(this.chatList)
  // }

  scrollToBottom(): void {
    try {
      // console.log("FirstTime")

      // console.log(this.chatList)
      setTimeout(() => {
        // console.log("hello",this.chatList.nativeElement.scrollTop,this.chatList.nativeElement.scrollHeight)
        this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.scrollHeight;
        //  console.log(this.chatList.nativeElement.scrollTop)

      }, 0);

    } catch (err) {
      console.error('Scroll error:', err);
    }
  }


  // scrollToBottom(): void {
  //   try {
  //     console.log(this.chatList)
  //     if(this.chatList){
  //       console.log(this.chatList)
  //       this.chatList.nativeElement.scrollTop = this.chatList.nativeElement.scrollHeight;
  //       console.log(this.chatList.nativeElement.scrollTop ,this.chatList.nativeElement.scrollHeight)

  //     }

  //   } catch (err) {
  //     console.error(err);
  //   }
  // }
  capitalizeFirstLetter(name: string): string {
    if (!name) return '';
    const parts = name.split('.');
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    }

    return name
  }

  getInitials(aliasName: string): string {
    const parts = aliasName.split('.');
    let initials = '';
    parts.forEach(part => {
      initials += part.charAt(0).toUpperCase();
    });
    return initials;
  }

  updateParentTopic() {
    this.topicUpdated.emit(this.topicsdata);
  }

  async gettopicslistdata(requestIds: number, pageSize: number, pageNumber: number, sortBy: string, sortOrder: string, userId: number, searchValue: string) {
    // console.log(this.isLoadingMessage);

    try {
      const res: any = await this.topicservice.getTopicList(requestIds, sortBy, sortOrder, userId, searchValue);


      this.topicsdata = res;
      this.updateParentTopic()



      this.isLoadingMessage = false;
      // console.log(res)
      return this.topicsdata; // Return the data if needed
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error; // Rethrow the error if needed
    }
  }
  checkLoggedMessageSender(senderName: any) {

    if (senderName.toLowerCase() === this.AliasName.toLowerCase()) {
      return 'You'
    } else if (senderName === "Copilot") {
      return "Assistant"
    } else return senderName.split('.')[0]

  }

  onBlur() {
    if (!this.transcribedText || this.transcribedText.trim() === '') {
      this.transcribedText = ''; // Reset the text
    }
  }

  startNewChat() {
    // Logic to start a new chat
    // console.log('New chat started');
    this.selectedTopicName = ""
    this.chatMessages = [];
    this.topicIdnew = undefined;
    this.new_chat = false;
    this.startTypingAlias();

  }

  async addqueryhere(regeneratedFromId: number = 0, isRegenerated: boolean = false): Promise<void> {
    this.animation = true;
    this.queryform.get('inputquery')?.valueChanges.subscribe((value: any) => {
      // console.log('inputquery updated:', value);
      // You can handle other logic here, like enabling/disabling buttons, etc.
    });

    if (this.topicIdnew === undefined) {
      this.topicIdnew = -1;
    }

    // console.log(this.topicIdnew);

    if (this.queryform.valid) {
      // console.log(this.queryform);

      const questionPayload = {
        "UserId": this.userId,
        "TopicId": this.topicIdnew,
        "question": this.queryform.value.inputquery,
        "QuestionType": "SQL Based Search",
        "ClaimNumber": this.queryform.value.pdfInputField,
        "DataSource": "SQL",
        "regeneratedFromId": regeneratedFromId, // Use the passed messageId
        "isRegenerated": isRegenerated
      };

      const question = this.queryform.value.inputquery;
      this.queryform.reset();
      this.chatMessages.push({
        sender: 'You',
        text: question,
        time: this.getCurrentTime(),
        aliasName: this.getInitials(this.AliasName)
      });


      this.isdisplay = true;

      try {
        this.scrollToBottom();
        // if(this.userId == undefined){
        //   // this.topicservice.searchUsers()
        // }
        // Call the service method to insert the question, awaiting the response
        const response = await this.topicservice.insertAskLiveQuestions(questionPayload);
        this.animation = false
        this.topicIdnew = response.TopicId;
        const answer = response.answer.message;
        console.log(response.answer.img)
        if (response.answer?.img && Object.keys(response.answer.img).length > 0) {
          this.chatMessages.push({
            sender: 'Copilot',
            text: answer,
            time: this.getCurrentTime(),
            isLiked: null,
            isDisliked: null,
            starRatings: 0,
            TopicquestionanwserId: response.TopicquestionAnswerId[response.TopicquestionAnswerId.length - 1].TopicquestionanwserId,
            images: response.answer.img ? response.answer.img : {},
            reference: response?.answer?.reference,
            Questionmultiple: question
          });
        } else {
          this.chatMessages.push({
            sender: 'Copilot',
            text: answer,
            time: this.getCurrentTime(),
            isLiked: null,
            isDisliked: null,
            starRatings: 0,
            TopicquestionanwserId: response.TopicquestionAnswerId[response.TopicquestionAnswerId.length - 1].TopicquestionanwserId,
            reference: response?.answer?.reference,
            Questionmultiple: question
          });
        }






        // Fetch the updated topics list
        await this.gettopicslistdata(this.shareOptionsFilter, 100, 1, 'CreatedOn', 'Desc', this.userId, "");
        this.scrollToBottom();
        this.spindisplay = false;
        this.questiondata = response;
        this.adddata = true;
        this.new_chat = true;
      } catch (error) {
        this.spindisplay = false;
        console.error('Error inserting live question:', error);
        this.animation = false
        // Display an error message to the user
        this.toastService.error('An error occurred while inserting the live question. Please try again later.');
      }

      this.scrollToBottom();
      this.greetEvent.emit();


    }
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
      // console.log(data);
      this.liveQuestions = data; // Adjust if your API returns questions in a different property
    } catch (error) {
      console.error('Error fetching live questions:', error);
      // Optionally show a toast notification here
    }
  }



  async fetchLiveHistory(topicIdnew: any, sortByDatevalue: any): Promise<void> {
    const userId = this.userId;
    const topicId = topicIdnew;
    const pageSize = 10;
    const pageNumber = 1;
    const sortbydate = sortByDatevalue;
    // console.log(this.isLoadingMessage);
    this.isLoadingMessage = false;

    try {
      // Call the service method to get live history
      const response = await lastValueFrom(this.topicservice.getLiveHistory(userId, topicId, pageSize, pageNumber, sortbydate));

      // console.log(response);
      // Clear existing messages to avoid duplicates
      this.chatMessages = [];
      console.log(response)

      response.forEach((items: any) => {
        // Construct the sender name
        const senderName = `${items.FirstName}.${items.LastName}`;

        // Add the question message
        this.chatMessages.push({
          sender: senderName,
          text: items.Question,
          time: items.CreatedOn,
          aliasName: items.AliasName,
          TopicquestionanwserId: items.TopicquestionanwserId,
        });

        // Add the answer message
        this.chatMessages.push({
          sender: 'Copilot',
          text: items.Answer,
          time: items.CreatedOn,
          TopicquestionanwserId: items.TopicquestionanwserId,
          isLiked: items.IsLiked === 1,
          isDisliked: items.IsLiked === 0, // Set to true only if explicitly disliked
          starRatings: items.Rating,
          images: items.img ? items.img : {},
          reference: items.reference,
          Questionmultiple: items.Question
          // images: items.images if len(item.images) > 0 else []
        });


      });

      this.scrollToBottom();

      // Fetch additional data if there are no messages
      // if (this.chatMessages.length === 0) {
      //     await this.fetchLiveQuestions(topicIdnew);
      //     // await this.SuggestionQuestions(topicId);
      // }
      // console.log(this.chatMessages);
      this.chatMessagesChange.emit(this.chatMessages);
    } catch (error) {
      console.error('Error fetching live history:', error);
    }
  }



  onSelectItem() {

    const selectedValue = 'SQL based Search';




    this.queryform.get('selectedTopic')?.setValue(selectedValue);
    this.selectedTopic = selectedValue; // Update selecttopics
    this.itemSelected = true; // Set the flag to indicate an item is selected


    // Reset values of other form controls when changing topic
    this.queryform.get('sqlDropdown')?.reset();
    this.queryform.get('pdfInputField')?.reset();



  }

  toggleInputTouched() {
    this.inputTouched = true;

    // console.log(this.queryform)
  }




  show() {
    this.isdisplay = true;
    this.backgroundColor = true;
  }

  toggleDisplaysTopicname(topicName: string, topicId: any) {
    // console.log(topicName,topicId)
    this.topicIdnew = topicId
    this.isExpanded = true;
    this.chatMessages = []
    this.queryform = this.fb.group({
      selectedTopic: new FormControl(''),
      inputquery: ['', Validators.required]  // Define selectedTopic here
    });
    this.queryform.get('inputquery')?.setValue('');

    this.new_chat = true;
    this.Previewsdisplay = false;
    this.selectedTopicName = topicName;
    this.selectedTopicId = topicId
    this.sortChatByOrder = "Latest"
    // console.log(topicId)
    // this.scrollToBottom();
    this.fetchLiveHistory(topicId, this.sortChatByOrder);

  }
  @ViewChild(ChatMessageComponent) chatMessageComponent!: ChatMessageComponent;
  speaker: boolean = false;

  onSpeakerIconClick(id: number): void {

    const copilotMessage = this.chatMessages.find(
      (msg) => msg.TopicquestionanwserId === id && msg.sender === 'Copilot'
    );

    if (!copilotMessage) {
      console.warn(`No Copilot message found for ID: ${id}`);
      return;
    }

    const text = copilotMessage.text;

    if (!text || text.trim().length === 0) {
      console.warn('Message text is empty or invalid.');
      return;
    }

    console.log(`Text to speak: ${text}`);

    if (!this.speaker) {
      this.speaker = true;
      if (this.chatMessageComponent) {
        this.chatMessageComponent.speakMessage(text); // Pass the text to the child component's method
      }
    } else {
      this.speaker = false;
      if (this.chatMessageComponent) {
        this.chatMessageComponent.stopSpeech(); // Stop any ongoing speech
      }
    }


    // onDoubleIconClick():void {

    //   if (this.chatMessageComponent) {
    //     this.chatMessageComponent.stopSpeech(); // Call the speakMessage method of the child
    //   }

  }

  //  Rating star code 
  rateMessage(messageId: number, rating: number) {
    // Call your service to update the rating in the backend
    console.log("Rating for message ID:", messageId, "is:", rating);
  }

  onCheckboxChange() {
    this.isAnyChecked = this.sources.some((source:any) => source.checked);
  }
  @ViewChild('op6') overlayPanel!: OverlayPanel;
  showOverlayPanel(event: Event, overlayPanel: OverlayPanel, ) {
   
    overlayPanel.toggle(event); // Show the overlay panel at the clicked position
  }
  async removeCheckedSources(): Promise<void> {
    this.animation = true; // Show loading animation
    this.isAnyChecked = false; // Reset checked state

    // Remove last assistant message
    let lastMessage = await this.chatMessages[this.chatMessages.length - 1];
    this.chatMessages.pop(); // Assuming last message is the assistant's response

    // Filter references and sources
   
    console.log(lastMessage)
    const filteredReferences = lastMessage?.reference.filter((data: any) =>
        this.sources.some(
            (source: any) => !source.checked && source.meta === data.filepath
        )
    );

    console.log(filteredReferences)

    // Prepare payload for regenerating the question
    const questionPayload = {
        UserId: this.userId,
        references: filteredReferences,
        TopicId: this.topicId,
        TopicquestionanswerId: lastMessage.TopicquestionanwserId,
        question: lastMessage.Questionmultiple,
        QuestionType: "SQL Based Search",
        ClaimNumber: 123,
        DataSource: "SQL",
        regeneratedFromId: 0,
        isRegenerated: 1, // Set this flag to indicate regeneration
    };

    // Filter out checked sources from the UI
    // this.sources = this.sources.filter((source: any) => !source.checked);

    // Close the off-canvas menu
    const offcanvasElement = document.getElementById("rightSidenav");
    if (offcanvasElement) {
        offcanvasElement.classList.remove("show");
    }

    try {
        const response = await this.topicservice.updateAskLiveQuestions(questionPayload);
        this.animation = false; // Hide loading animation
        // Update sources and chat messages with the new response
        const newAnswer = response.answer.message;

        // Check if there are images or references in the response
        if (response.answer?.img && Object.keys(response.answer.img).length > 0) {
            this.chatMessages.push({
                sender: 'Copilot',
                text: newAnswer,
                time: this.getCurrentTime(),
                isLiked: null,
                isDisliked: null,
                starRatings: 0,
                TopicquestionanwserId: response.TopicquestionAnswerId[response.TopicquestionAnswerId.length - 1].TopicquestionanwserId,
                images: response.answer.img,
                reference: response.answer.reference,
                Questionmultiple: lastMessage.Questionmultiple,
            });
        } else {
            this.chatMessages.push({
                sender: 'Copilot',
                text: newAnswer,
                time: this.getCurrentTime(),
                isLiked: null,
                isDisliked: null,
                starRatings: 0,
                TopicquestionanwserId: response.TopicquestionAnswerId[response.TopicquestionAnswerId.length - 1].TopicquestionanwserId,
                reference: response.answer.reference,
                Questionmultiple: lastMessage.Questionmultiple,
            });
        }

        // Update sources UI
        if (response.answer.reference) {
            const map = new Map();
            response.answer.reference.forEach((ref: any) => {
                if (!map.has(ref.filepath)) {
                    map.set(ref.filepath, {
                        title: `${map.size + 1}. ${ref.title}`,
                        meta: ref.filepath,
                        description: ref.content,
                        checked: false,
                    });
                }
            });
            this.sources = Array.from(map.values());
        }
    } catch (error) {
        console.error("Error regenerating the question:", error);
        this.toastService.error(
            "An error occurred while regenerating the question. Please try again."
        );
    } 
}
}