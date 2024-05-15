export type NodeKey = string | number;

export interface IFsTreeProps {
  data: ITreeItem[];
  keyField?: string;
  labelField?: string;
  childrenField?: string;
  defaultExpandKeys?: NodeKey[];
  selectable?: boolean;
  multipleSelect?: boolean;
  defaultCheckedKeys?: NodeKey[];
  showCheckbox?: boolean;
}

export interface IFsTreeEmitter {
  (e: 'onSelectNodes', nodes: ITreeNode[]): void;
  (e: 'onCheckChange', node: ITreeItem, checked: boolean): void;
}

export interface ITreeItem {
  key?: NodeKey;
  name?: NodeKey;
  children?: ITreeItem[];
  isLeaf?: boolean,
  isChecked: boolean,
  isHalfChecked: boolean,
  fileNum: number,
  [key: string]: any;
}

export interface ITreeNode extends Required<ITreeItem> {
  level: number;
  parentKey: NodeKey | null;
  children: ITreeNode[];
  rawNode: ITreeItem;
}

export interface IFsTreeNodeProps {
  node: ITreeNode;
  isExpanded: boolean;
  // isSelected: boolean;
  showCheckbox: boolean;
}

export interface IFsTreeNodeEmitter {
  (e: "toggleExpanded", node: ITreeNode): void;
  (e: "selectNode", node: ITreeNode): void;
  (e: "onCheck", node: ITreeNode): void;
}
