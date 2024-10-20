"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import { List, ListRowRenderer } from "react-virtualized";
import type {
  TTreeButtonProps,
  TTreeNode,
  TTreeNodeProps,
  TTreeProps,
} from "./types";
import { TreeProvider, useTreeContext } from "./context";
import { useTreeFlat } from "./hooks";
import { cloneArray, clsx } from "@utils";

const expandNode = (data: TTreeNode[], index: number) => {
  const node = data[index];
  let len = node.childrenLength!;
  let i = index + 1;
  while (len) {
    const cr = data[i++];
    if (cr.parentId === node.id) {
      cr.show = true;
      --len;
    }
  }
};

const colapseNode = (data: TTreeNode[], index: number) => {
  const node = data[index];
  let len = node.childrenLength!;
  let i = index + 1;
  while (len) {
    const cr = data[i++];
    if (cr.parentId === node.id) {
      --len;
      cr.show = false;
      cr.childrenLength && (cr.expand = false);

      colapseNode(data, cr.index!);
    }
  }
};

const toRem = (px: number) => {
  return (1 / 16) * px;
};

const TreeButton = (props: TTreeButtonProps) => {
  const { className, expand, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "w-5 h-5 leading-[100%] text-center box-border border",
        className
      )}
    >
      {expand ? "-" : "+"}
    </button>
  );
};

const TreeNode = ({
  level = 0,
  label,
  childrenLength,
  expand,
  index = 0,
  wrapperProps,
}: TTreeNodeProps) => {
  const { data, setData } = useTreeContext();
  const hasChilren = !!childrenLength;

  const toggle = (e: MouseEvent) => {
    e.stopPropagation();
    e.stopPropagation();

    const nExpand = !expand;
    data[index].expand = nExpand;
    nExpand ? expandNode(data, index) : colapseNode(data, index);
    setData(cloneArray(data));
  };

  return (
    <div
      {...wrapperProps}
      style={{
        marginLeft: `${toRem(level * 20 + (hasChilren ? 0 : 2))}rem`,
        ...wrapperProps?.style,
      }}
    >
      {hasChilren && <TreeButton onClick={toggle} expand={expand} />}
      <span
        className={clsx(
          "hover:bg-blue-200 rounded-sm px-0.5",
          hasChilren ? "ml-0.5" : "ml-5"
        )}
      >
        {label}
      </span>
    </div>
  );
};

const VirtualTree = (props: TTreeProps) => {
  const [data, setData] = useState<TTreeNode[]>([]);

  const { flatDeep, setIndex } = useTreeFlat(props.expandAll);

  const value = useMemo(() => {
    return { data, setData, propsData: props };
  }, [data]);

  const renderData = useMemo(() => {
    return data.filter((item) => item.show);
  }, [data]);

  const rowRenderer: ListRowRenderer = ({ index, key, style }) => {
    const item = renderData[index];
    return <TreeNode {...item} wrapperProps={{ style }} key={key} />;
  };

  useEffect(() => {
    setIndex(0);
    setData(flatDeep(props.data));
  }, [props.data]);

  return (
    <TreeProvider value={value}>
      {/* <TransitionGroup component={Fragment}> */}
      <List
        height={300}
        width={500}
        rowCount={renderData.length}
        rowHeight={24}
        rowRenderer={rowRenderer}
      />
      {/* </TransitionGroup> */}
    </TreeProvider>
  );
};

export default VirtualTree;
