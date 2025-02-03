import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ChathistoryService } from '../chathistory.service';
interface FilterDates {
  dateValue: string;
  code: string;
}

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss']
})
export class ActivityComponent implements OnInit{
  @Output() close = new EventEmitter<void>();
  // @Input() topicsdata!: any;
  @Input() topicsdata!: any;
  // Emit an event to notify the parent to close the component
  closeActivity(): void {

    // Restore the current topic data via ChatService
    const { TopicId, TopicName } = this.topicsdata;
    this.chatService.setTopic(TopicId, TopicName);
    this.close.emit(); // Notify parent component to close the activity.
  }
  isCollapsedShowdetails: boolean = true; // Initially collapsed
  isCollapsedShowdetails1: boolean = true;
  isCollapsedShowdetails2: boolean = true;
  toggleDetails(): void {
    this.isCollapsedShowdetails = !this.isCollapsedShowdetails;
  }
  toggleDetails1(): void {
    this.isCollapsedShowdetails1 = !this.isCollapsedShowdetails1;
  }
  toggleDetails2(): void {
    this.isCollapsedShowdetails2 = !this.isCollapsedShowdetails2;
  }
  prompts = [
    {
      title: 'How to create a relay on the refinfin filling?',
      category: 'Data Structures and Algorithms',
      createdBy: 'SR',
      time: '22/09/2023',
      details: 'This is where you can add more detailed information about the prompt.',
      isCollapsed: true,
    },
    {
      title: 'How to create a relay on the refinfin filling?',
      category: 'Data Structures and Algorithms',
      createdBy: 'SR',
      time: '22/09/2023',
      details: 'This is where you can add more detailed information about the prompt.',
      isCollapsed: true,
    },
    // Add more items here as needed
  ];
  inputValue: string = '';
  extraVal: any[] = [];
  // topicsdataToday: any[] = [];
  // topicsdataYesderday: any[] = [];
  // topicsdatePrevios: any[] = [];
  searchedTopicValueActivity: any[] = [];
  datesValue: FilterDates[] | [] = [];
  numValue: number = 0;
  filterTopicsValue: any[] = []
  topicIdActivity :number = 0;
  topicNameActivity : string = "";

  selectedDatesValue: FilterDates | undefined;


  @Output() variableEmitter = new EventEmitter<number>();
  @Output() searchTopicsActivity: EventEmitter<string> = new EventEmitter();
  @Output() topicIdActityData = new EventEmitter<{ topicIdVal: number, topicNameVal: string }>();
  @Output() topicNameActivityData = new EventEmitter<string>();


  // @Input() topicsdata: string[] = [];
  @Input() topicsdataToday: any[] = [];
  @Input() topicsdataYesderday: any[] = [];
  @Input() topicsdatePrevios: any[] = [];
  @Input() filteredActivityValue: any[] = [];
  // datePipe: any;
  
constructor( private datePipe: DatePipe,private router: Router,private chatService: ChathistoryService){

}

  // searchTopicsActivity(event: any) {
  //   // inputValue
  //   const selectedDate = event.target.value;
  //   // if(this.topicsdata.length>0){
  //   // this.extraVal = this.topicsdata.filter((tpc:any)=>(tpc.TopicName.includes(selectedDate)))
  //   this.extraVal = this.topicsdata.filter((tpc: any) =>
  //     tpc.TopicName.toLowerCase().replace(/\s+/g, ' ').trim().includes(selectedDate.toLowerCase().replace(/\s+/g, ' ').trim())
  //   )
  //   // console.log(this.extraVal);
  //   this.searchedTopicValueActivity.push(this.extraVal)
  //   // console.log(this.searchedTopicValueActivity);
  //   // }

  // }

  

  ngOnInit() {
    this.datesValue = [
        { dateValue: 'last 7 days', code: '7' },
        { dateValue: 'last 15 days', code: '15' },
        { dateValue: 'last 30 days', code: '30' },
        { dateValue: 'last 60 days', code: '60' },
        { dateValue: 'last 180 days', code: '180' }
    ];
}

// onDateChange(event: any): void {
    // console.log('Selected Date Value:', this.selectedDatesValue?.dateValue); 
    // console.log('Selected Code:', this.selectedDatesValue?.code);           
    // this.numValue = Number(this.selectedDatesValue?.code);
    // console.log(this.topicsdata)
    // this.getDateValue(this.numValue)
  // }

  onDateChange(event:any):void {
    

    this.numValue = Number(this.selectedDatesValue?.code);
    // console.log(this.filteredActivityValue);

    this.variableEmitter.emit(this.numValue); 

  }


  sendMessageToParent(event:any) {
    this.searchTopicsActivity.emit(event); // Emit event with a message
  }
  calltoggleActivity(topicName:string,TopicId:number){
    console.log(topicName);
    console.log(TopicId);
    this.topicIdActivity = TopicId;
    this.topicNameActivity = topicName;

    const sendDataActivityTopic = {
      topicIdVal : this.topicIdActivity,
      topicNameVal :this.topicNameActivity
    }

    this.topicIdActityData.emit(sendDataActivityTopic);
    this.topicNameActivityData.emit(this.topicNameActivity)
  }
  navigateToChatbox(topicName: string, topicId: number): void {
    // Navigate to the ChatboxComponent with the topicId as a route parameter
    this.router.navigate(['/chatbox', topicId]);
  }
}
