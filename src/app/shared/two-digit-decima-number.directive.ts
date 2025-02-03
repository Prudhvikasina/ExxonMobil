import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  @Input() allowNegative: boolean = true;

  constructor(private el: ElementRef, private currencyPipe: CurrencyPipe
  ) {

  }

 
  checkMinusSymbol(values) {
    var str='';
   // var allowNegative = false;
    for (var i = 0; i < values.length; i++) {

      if (i > 0 && values[i] == "-") {
       // allowNegative = true;
      } else {
        str += values[i];
      }
    }

    return str;

  }
  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    // on blur, add currency formatting

  
    var getValue=this.checkMinusSymbol(value);

    this.el.nativeElement.value = this.currencyPipe.transform(getValue, ' ').replace(/\s/g, "");

    console.log("onBlur :" + this.el.nativeElement.value)
  }


  @HostListener('input', ['$event']) onInput(event: any): void {
    const input = this.el.nativeElement;
    let value = input.value.replace(/[^0-9.-]/g, '');

    //console.log("this.allowNegative :" + this.allowNegative)
    if (!this.allowNegative) {
      value = value.replace(/-/g, '');
    }

    const parts = value.split('.');
    if (parts[1] && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2); // Enforce two decimal places
    }

    value = parts.join('.');

    input.value = value;
  }
}