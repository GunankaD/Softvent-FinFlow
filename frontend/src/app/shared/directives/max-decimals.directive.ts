import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'input[maxDecimals]',
  standalone: true
})
export class MaxDecimalsDirective {

  @Input() maxDecimals: number = 2;

  // KEYBOARD INPUT CONTROL
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Allow control keys
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    if (allowedKeys.includes(event.key)) return;

    // Allow Ctrl/Cmd shortcuts
    if ((event.ctrlKey || event.metaKey) &&
        ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase())) return;

    const val = input.value;
    const selStart = input.selectionStart ?? val.length;
    const selEnd = input.selectionEnd ?? val.length;

    // Allow digits
    if (event.key >= '0' && event.key <= '9') {
      const next = val.slice(0, selStart) + event.key + val.slice(selEnd);
      const dotIdx = next.indexOf('.');

      if (dotIdx !== -1 && next.length - dotIdx - 1 > this.maxDecimals) {
        event.preventDefault();
      }
      return;
    }

    // Allow single dot
    if (event.key === '.') {
      if (val.includes('.') &&
          !(selStart <= val.indexOf('.') && selEnd > val.indexOf('.'))) {
        event.preventDefault();
      }
      return;
    }

    // Allow negative sign only at start
    // if (event.key === '-') {
    //   if (selStart !== 0 || val.includes('-')) {
    //     event.preventDefault();
    //   }
    //   return;
    // }

    // Block everything else
    event.preventDefault();
  }

  // PASTE HANDLING
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pasted = event.clipboardData?.getData('text') ?? '';
    const num = parseFloat(pasted);

    if (isNaN(num)) return;

    const factor = Math.pow(10, this.maxDecimals);
    const clamped = Math.round(num * factor) / factor;

    const input = event.target as HTMLInputElement;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? input.value.length;

    input.value =
      input.value.slice(0, start) +
      String(clamped) +
      input.value.slice(end);

    input.dispatchEvent(new Event('input'));
  }
}