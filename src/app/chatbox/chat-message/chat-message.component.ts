import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  OnInit,
  ViewEncapsulation,Renderer2, OnDestroy
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SideMenuServiceService } from 'src/app/side-menu-service.service';
@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ChatMessageComponent implements AfterViewInit {
  @Input() message: string = '';
  @Input() images: { [key: string]: string } = {};
  @Input() Id: number = 0;
  @Input() apiResponse: any = null; // Full API response for this specific message
  // isCollapsedPinned = true;
  isCollapsedPinned1 = true;
  formattedMessage: SafeHtml = '';
  isSideMenuOpen: boolean = false;
  selectedDocContent: SafeHtml | null = null;
  isCollapsedPinned: boolean[] = [];
  @Input() references: { doc: string, title: string, filepath: string, content: string }[] = [];
// Updated reference to hold documents
  // isSideMenuOpen = false;

  uniqueDocReferences: { doc: string, title: string, filepath: string, content: string }[] = [];
  

  selectedDocContents: SafeHtml[] = []; // Changed to support multiple documents
  selectedDocTitles: string[] = [];
  selectedDocFilePaths: string[] = [];
  
  // private outsideClickListener: (() => void) | undefined;
  constructor(
    private elRef: ElementRef, 
    private sanitizer: DomSanitizer,
    private sideMenuService: SideMenuServiceService,
    private renderer: Renderer2,
  ) {
    this.isCollapsedPinned = new Array(this.selectedDocContents.length).fill(true);
  }

  // openSideMenu() {
  //   this.isSideMenuOpen = true;
  //   this.sideMenuService.toggleSideMenu(this.isSideMenuOpen);
  // }

  // // Close the side menu
  // closeSideMenu() {
  //   this.isSideMenuOpen = false;
  //   this.sideMenuService.toggleSideMenu(this.isSideMenuOpen);
  // }

openSideMenu(): void {
  // Toggle the side menu state

  
  console.log("open",this.isSideMenuOpen)
  if (this.isSideMenuOpen) {
     // New functionality
    this.isSideMenuOpen = false;
    this.deactivateAllLinks();
    this.sideMenuService.toggleSideMenu(!this.isSideMenuOpen);
  } else {
    this.isSideMenuOpen = true;
    
    this.sideMenuService.toggleSideMenu(!this.isSideMenuOpen); // Old functionality
  }
  
}

closeSideMenu(): void {
  
  console.log("closeside",this.isSideMenuOpen)
  this.selectedDocContent = null; // Clear the selected document content (new functionality)
  this.deactivateAllLinks();  
  this.isSideMenuOpen = true;   // Deactivate all links (new functionality)
  this.sideMenuService.toggleSideMenu(this.isSideMenuOpen); // Old functionality
  console.log("closeside",this.isSideMenuOpen)
  this.isSideMenuOpen = false;
  this.selectedDocContents = [];
  this.selectedDocTitles = [];
  this.selectedDocFilePaths = [];
  
}



ngOnInit() {


  // Modify message to show single link for multiple doc references
  this.formattedMessage = this.sanitizer.bypassSecurityTrustHtml(
    this.message
      .replace(/```html/g, "") // Remove all occurrences of "```html"
      .replace(/```/g, "")     // Remove all occurrences of "```"
      .replace(/\[doc(\d+)\]\[doc(\d+)\]/g, (match, docId1, docId2) => {
        // Replace all occurrences of double doc references
        return `<a class="doc-link" href="javascript:void(0)" data-doc-ids="${docId1},${docId2}">
                  <i class="fa fa-link" aria-hidden="true"></i>
                </a>`;
      })
      .replace(/\[doc(\d+)\]/g, (match, docId) => {
        // Replace all occurrences of single doc references
        return `<a class="doc-link" href="javascript:void(0)" data-doc-ids="${docId}">
                  <i class="fa fa-link" aria-hidden="true"></i>
                </a>`;
      })
  );
  
  

  // Delegate event handling for document links
  this.elRef.nativeElement.addEventListener('click', (event: Event) => {
    const target = event.target as HTMLElement;
    const docLink = target.closest('.doc-link') as HTMLElement;

    if (docLink) {
      event.preventDefault();

      // Get the clicked document IDs
      const docIds = docLink.getAttribute('data-doc-ids')?.split(',') || [];
      if (docIds.length) {
        this.toggleBackgroundColor(docLink);
        this.handleLinkClick(docIds);
      }
    }
  
  });

  // this.attachOutsideClickListener();

  // Add outside click listener
  // this.outsideClickListener = this.renderer.listen('document', 'click', (event) => {
    
  //   const target = event.target as HTMLElement;
  //   if (!this.elRef.nativeElement.contains(target)) {
  //     console.log("testing")
  //     this.closeSideMenu();
  //   }
  // });
    // Extract unique document references from the message
  this.extractUniqueDocReferences();
}

// private attachOutsideClickListener(): void {
//   if (!this.outsideClickListener) {
//     this.outsideClickListener = this.renderer.listen('document', 'click', (event) => {
//       const target = event.target as HTMLElement;
//       if (!this.elRef.nativeElement.contains(target)) {
//         console.log('Outside click detected');
//         this.closeSideMenu();
//       }
//     });
//     console.log('Listener attached');
//   }
// }



ngOnDestroy(): void {
  // Clean up listener
  // if (this.outsideClickListener) {
  //   this.outsideClickListener(); // Detaches the event listener
  //   console.log('Listener removed');
  // }
}
  private extractUniqueDocReferences() {
    const docIds = new Set<string>();
    const uniqueDocs: { doc: string, title: string, filepath: string, content: string }[] = [];

    // Extract doc IDs from the message
    const docMatches = this.message.match(/\[doc(\d+)\]/g) || [];
    docMatches.forEach(match => {
      const docId = match.match(/\[doc(\d+)\]/)?.[1];
      if (docId && !docIds.has(docId)) {
        docIds.add(docId);
        const doc = this.references.find(ref => ref.doc === `doc${docId}`);
        if (doc) {
          uniqueDocs.push(doc);
        }
      }
    });

    this.uniqueDocReferences = uniqueDocs;
  }


  toggleBackgroundColor(link: HTMLElement): void {
    // Remove the active class from all links
    const allLinks = this.elRef.nativeElement.querySelectorAll('.doc-link');
    allLinks.forEach((l: HTMLElement) => l.classList.remove('active')); // Deactivate all links

    // Add the active class to the clicked link
    link.classList.add('active');
      // Deactivate all links first
      this.deactivateAllLinks();
    
      // Activate the clicked link
      link.classList.add('active');
  }

 
  getFormattedImageSrc(imageData: string): string {
    if (!imageData) {
      return '';
    }
    // Check if the image already includes the prefix
    return imageData.startsWith('data:image/webp;base64,')
      ? imageData
      : `data:image/webp;base64,${imageData}`;
  }

  // Handle image loading errors
  handleImageError(event: Event, key: string): void {
    // Remove the image from the images object if it fails to load
    delete this.images[key];
  }


  ngAfterViewInit() {
    this.renderMathJax();
    
  }

  toggleCollapsePinned(index: number):void {
    // this.isCollapsedPinned = !this.isCollapsedPinned;
     this.isCollapsedPinned[index] = !this.isCollapsedPinned[index];
    
  }

  toggleCollapsePinned1() {
    this.isCollapsedPinned1 = !this.isCollapsedPinned1;
  }

  private renderMathJax() {
    if ((window as any)['MathJax']) {
      (window as any)['MathJax']
        .typesetPromise([this.elRef.nativeElement])
        .catch((err: any) => console.error('MathJax rendering error:', err));
    }
  }

  

  // Utility method to get object keys (for *ngFor on images)
  objectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Text-to-speech logic (optional)
  speakMessage(text: string): void {
    if (!text || text.trim().length === 0) {
      console.warn('Message text is empty');
      return;
    }

    const speech = new SpeechSynthesisUtterance(text.trim());
    speech.lang = 'en-US'; // Set the language
    window.speechSynthesis.speak(speech);
  }

  stopSpeech(): void {
    window.speechSynthesis.cancel(); // Stops any ongoing speech
  }

  selectedDocTitle:string = ""
  selectedDocFilePath:string = ""
  
  
  extractPlainText(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.textContent || '';
  }
  handleLinkClick(docIds: string[]): void {
    console.log("hello")
    // Reset selected documents
    this.selectedDocContents = [];
    this.selectedDocTitles = [];
    this.selectedDocFilePaths = [];

    // Find and process documents for all clicked doc IDs
    docIds.forEach(docId => {
      const document = this.references.find((ref: any) => ref.doc === `doc${docId}`);

      if (document) {
        // Sanitize and add document content
        const sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.extractPlainText(document.content));
        this.selectedDocContents.push(sanitizedContent);

        // Add title and file path
        this.selectedDocTitles.push(document.title);
        this.selectedDocFilePaths.push(document.filepath);
      }
    });

    // Open side menu
    this.openSideMenu();
    
  }
  
  deactivateAllLinks(): void {
    const allLinks = this.elRef.nativeElement.querySelectorAll('.doc-link');
    allLinks.forEach((link: HTMLElement) => link.classList.remove('active')); // Remove 'active' class from all links
  }
 
}
