export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'viewIcon' | 'deleteIcon' | 'boolean' | 'currency' | 'input';
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}