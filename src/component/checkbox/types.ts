export interface IFsCheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface IFsCheckboxEmitter{
  (e: 'change', checked: boolean): void
}
