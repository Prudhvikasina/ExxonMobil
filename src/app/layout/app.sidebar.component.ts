import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild,OnInit } from '@angular/core';
import { AppMenuProfileComponent } from './app.menuprofile.component';
import { LayoutService } from './service/app.layout.service';import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServicesService } from './service/topics/services.service';
;

@Component({
    selector: 'app-sidebar',
    templateUrl: './app.sidebar.component.html'
})
export class AppSidebarComponent implements OnDestroy, OnInit {

    public addtopicform!:FormGroup

    timeout: any = null;

    @ViewChild(AppMenuProfileComponent) menuProfile!: AppMenuProfileComponent;

    @ViewChild('menuContainer') menuContainer!: ElementRef;
    countries!: any;
    visible: boolean = false;
    createtopicvisible:boolean = false
    topicsdata:any
    selectedCountries!: any;

    constructor(public layoutService: LayoutService, public el: ElementRef,private fb:FormBuilder,private topicservice: ServicesService) {}

        ngOnInit(): void {
            this.addtopicforminput();
            this.gettopicslistdata();
        }

    resetOverlay() {
        if(this.layoutService.state.overlayMenuActive) {
            this.layoutService.state.overlayMenuActive = false;
        }
    }

    get menuProfilePosition(): string {
        return this.layoutService.config.menuProfilePosition;
    }

    

    onMouseEnter() {
        if (!this.layoutService.state.anchored) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            this.layoutService.state.sidebarActive = true;
        }
    }
    

    onMouseLeave() {
        if (!this.layoutService.state.anchored) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => this.layoutService.state.sidebarActive = false, 300);
            }
        }
    }

    anchor() {
        this.layoutService.state.anchored = !this.layoutService.state.anchored;
    }

    ngOnDestroy() {
        this.resetOverlay();
    }


    

    showDialog() {
        this.visible = true;
    }

    confirm2(event: Event) {
    }

    // Add Topics Sections start

    showcreatetopicsDialog(){this.createtopicvisible = true}
    closeaddtopic(){this.createtopicvisible = false}
    addtopicforminput(){
        this.addtopicform = this.fb.group({
            topicname:['',Validators.required],
            claimtype:['',Validators.required],
            vendorname:[''],
            audityear:['',Validators.required],
            region:[''],
            categoryclaim:[''],
            departmentno:[''],
            vendorno:[''],
            itemnumber:[''],
            feature:[''],

        })
         // Dropdown list data start
        this.countries = [
            { name: 'Australia', code: 'AU' },
            { name: 'Brazil', code: 'BR' },
            { name: 'China', code: 'CN' },
            { name: 'Egypt', code: 'EG' },
            { name: 'France', code: 'FR' },
            { name: 'Germany', code: 'DE' },
            { name: 'India', code: 'IN' },
            { name: 'Japan', code: 'JP' },
            { name: 'Spain', code: 'ES' },
            { name: 'United States', code: 'US' }
        ];

       

        // Dropdown list data end
    }

    addtopicformsubmit(){
        if(this.addtopicform.valid){

        this.topicservice.addtopic(this.addtopicform.value).subscribe((res)=>{
            this.createtopicvisible = false;
            this.addtopicform.reset();
        })

        }else{
            console.log("error")
        }
    }
    // Add Topics Sections end


    // Get Topics List start
    gettopicslistdata(){
     this.topicservice.gettopiclist().subscribe((res)=>{
        this.topicsdata = res;
        console.log(this.topicsdata)
     })
    }


     // Get Topics List end




    
}
