import { ButtonHTMLAttributes, DetailedHTMLProps, Dispatch, HTMLAttributes, ReactNode, SetStateAction } from "react";

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
    wrapperProps?: DetailedHTMLProps<
        HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    >;
};

export type TTreeProps = { data?: TTreeNode[]; expandAll?: boolean };

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
}