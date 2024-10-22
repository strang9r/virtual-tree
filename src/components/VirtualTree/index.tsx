"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  AutoSizer,
  Grid,
  GridCellRenderer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
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
        "w-5 h-5 leading-[100%] text-center box-border border flex-shrink-0",
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
        paddingLeft: `${toRem(level * 20 + (hasChilren ? 0 : 2))}rem`,
        ...wrapperProps?.style,
      }}
      className="flex"
    >
      {hasChilren && <TreeButton onClick={toggle} expand={expand} />}
      <span
        className={clsx(
          "hover:bg-blue-200 rounded-sm px-1",
          hasChilren ? "ml-0.5" : "ml-5"
        )}
      >
        {label}
      </span>
    </div>
  );
};

const VirtualTree = (props: TTreeProps) => {
  const { data: propsData, expandAll, ...rest } = props;
  const [data, setData] = useState<TTreeNode[]>([]);
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultWidth: 100,
        fixedHeight: true,
        keyMapper: (rowIndex) => {
          return data[rowIndex].id;
        },
      }),
    [data]
  );
  const { flatDeep, setIndex } = useTreeFlat(expandAll);

  const value = useMemo(() => {
    return { data, setData, propsData: props };
  }, [data]);

  const renderData = useMemo(() => {
    return data.filter((item) => item.show);
  }, [data]);

  const rowRenderer: GridCellRenderer = ({ rowIndex, key, style, parent }) => {
    const item = renderData[rowIndex];
    // return <TreeNode {...item} wrapperProps={{ style }} key={key} />;

    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={rowIndex}
      >
        <div
          style={{
            ...style,
            height: 24,
            whiteSpace: "nowrap",
          }}
        >
          <TreeNode {...item} />
        </div>
      </CellMeasurer>
    );
  };

  useEffect(() => {
    setIndex(0);
    setData(flatDeep(propsData));
  }, [propsData]);

  return (
    <TreeProvider value={value}>
      <AutoSizer>
        {({ width, height }) => (
          <Grid
            {...rest}
            height={height}
            width={width}
            columnCount={1}
            rowCount={renderData.length}
            rowHeight={rest.rowHeight ?? 24}
            cellRenderer={rest.rowRenderer ?? rowRenderer}
            deferredMeasurementCache={cache}
            columnWidth={cache.columnWidth}
            overscanColumnCount={0}
            overscanRowCount={2}
          />
        )}
      </AutoSizer>
    </TreeProvider>
  );
};

export default VirtualTree;
