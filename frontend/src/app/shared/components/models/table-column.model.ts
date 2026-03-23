export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'icon' | 'boolean' | 'currency';
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}