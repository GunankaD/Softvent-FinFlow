export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'icon' | 'boolean';
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}