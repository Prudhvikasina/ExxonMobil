import { Component, OnInit } from '@angular/core';
import {  Router} from "@angular/router";

@Component({
  selector: 'app-loadsite.selection',
  templateUrl: './loadsite.selection.component.html',
  styleUrls: ['./loadsite.selection.component.scss']
})
export class LoadsiteSelectionComponent {
  siteSelection:any;
  siteDDFilter: any[]=['Icy straight point','Hunatotem'];
  constructor(private router:Router) { }

  ngOnInit(): void {
  }
  siteClick()
  {
    this.router.navigate(['/']);
  }
}