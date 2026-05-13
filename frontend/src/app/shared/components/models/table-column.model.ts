export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'viewIcon' | 'deleteIcon' | 'boolean' | 'currency' | 
  'inputPercent' | 'inputAmount' | 'inputQuantity';
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}