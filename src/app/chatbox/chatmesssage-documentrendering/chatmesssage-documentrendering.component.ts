import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-chatmesssage-documentrendering',
  templateUrl: './chatmesssage-documentrendering.component.html',
  styleUrls: ['./chatmesssage-documentrendering.component.scss']
})
export class ChatmesssageDocumentrenderingComponent implements AfterViewInit {
  @Input() docContent: SafeHtml | null = null;

  constructor(private elRef: ElementRef) {}

  ngAfterViewInit() {
    this.renderMathJax();
  }
  

  closeDocument(): void {
    this.docContent = null; // Hide the document container when closed
  }

  private renderMathJax() {
    if ((window as any)['MathJax']) {
      (window as any)['MathJax']
        .typesetPromise([this.elRef.nativeElement])
        .catch((err: any) => console.error('MathJax rendering error:', err));
    }
  }
}
