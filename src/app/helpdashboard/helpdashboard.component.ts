import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-helpdashboard',
  templateUrl: './helpdashboard.component.html',
  styleUrls: ['./helpdashboard.component.scss']
})
export class HelpdashboardComponent {
  @Output() closeHelpDashboard = new EventEmitter<void>(); // Event to notify parent

  closeDashboard(): void {
    this.closeHelpDashboard.emit(); // Emit the event
  }
 helpdashboarddata = [
{
  id:1,
  ticketId: '091878AW',
  title:'Login Issue',
  Status:'Reopened',
  Priority:'High',
  CreatedBy:'Alex Morris',
  Time:'09/11/2024 11:00 am'
},
{
  id:2,
  ticketId: '091878AW',
  title:'The chat is glitching',
  Status:'Closed',
  Priority:'',
  CreatedBy:'Alex Morris',
  Time:'09/11/2024 11:00 am'
},
{
  id:3,
  ticketId: '091878AW',
  title:"New Chat isn't Working",
  Status:'In-Progress',
  Priority:'',
  CreatedBy:'Alex Morris',
  Time:'09/11/2024 11:00 am'
},
{
  id:4,
  ticketId: '091878AW',
  title:'Login Issue',
  Status:'New',
  Priority:'High',
  CreatedBy:'Alex Morris',
  Time:'09/11/2024 11:00 am'
},
{
  id:5,
  ticketId: '091878AW',
  title:'Login Issue',
  Status:'New',
  Priority:'',
  CreatedBy:'Alex Morris',
  Time:'09/11/2024 11:00 am'
},
 ]
}
