export type ConfirmButtonColor = 'blue' | 'green' | 'red';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmColor?: ConfirmButtonColor;
  confirmButtonText: string;
}
