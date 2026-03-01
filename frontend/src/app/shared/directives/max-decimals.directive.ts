import { Directive, HostListener, Input } from '@angular/core';

@Directive({ 
  selector: 'input[type=number][maxDecimals]',
  standalone: true
})
export class MaxDecimalsDirective {
  @Input() maxDecimals = 2;

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.includes('.')) {
      const [integer, decimal] = value.split('.');
      if (decimal.length > this.maxDecimals) {
        input.value = `${integer}.${decimal.slice(0, this.maxDecimals)}`;
        input.dispatchEvent(new Event('input'));
      }
    }
  }
}