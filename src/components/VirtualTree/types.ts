import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  Dispatch,
  HTMLAttributes,
  ReactNode,
  SetStateAction,
} from "react";
import { GridCellRenderer, GridProps } from "react-virtualized";

export type TTreeNode = {
  id: string | number;
  label: ReactNode;
  parentId?: string | number;
  children?: TTreeNode[];
  childrenLength?: number;
  level?: number;
  expand?: boolean;
  index?: number;
  show?: boolean;
};

export type TTreeNodeProps = TTreeNode & {
  initialExpand?: boolean;
  rowRenderer?: GridCellRenderer;
  wrapperProps?: DetailedHTMLProps<
    HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >;
};

export type TTreeProps = {
  data?: TTreeNode[];
  expandAll?: boolean;
} & Omit<GridProps, "rowCount">;

export type TTreeContext = {
  data: TTreeNode[];
  setData: Dispatch<SetStateAction<TTreeNode[]>>;
  propsData: TTreeProps;
};

export type TTreeButtonProps = DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  expand?: boolean;
};
