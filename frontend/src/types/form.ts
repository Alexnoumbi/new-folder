export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required?: boolean;
  xs?: number;
  md?: number;
  options?: Array<{ value: string; label: string }>;  // Updated to match component expectations
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  rows?: number;
}

export interface FormProps {
  title?: string;
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}
