import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
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
  const { style, children, ...restProps } = wrapperProps ?? {};
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
      {...restProps}
      style={{
        paddingLeft: `${toRem(level * 20 + (hasChilren ? 0 : 2))}rem`,
        ...style,
      }}
      className="flex items-center"
    >
      {hasChilren && <TreeButton onClick={toggle} expand={expand} />}
      {children ?? (
        <span
          className={clsx(
            "hover:bg-blue-200 dark:hover:bg-blue-900 rounded-sm px-1 leading-normal",
            hasChilren ? "ml-0.5" : "ml-5"
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

const VirtualTree = (props: TTreeProps) => {
  const { data: propsData, expandAll, ...restProps } = props;
  const [data, setData] = useState<TTreeNode[]>([]);
  const cache = useMemo(
    () =>
      new CellMeasurerCache({
        keyMapper: (rowIndex) => {
          return data[rowIndex]?.id;
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

  const rowRenderer: GridCellRenderer = useCallback(
    (rowProps) => {
      const { rowIndex, key, style, parent } = rowProps;
      const item = renderData[rowIndex];
      return (
        <CellMeasurer
          cache={cache}
          columnIndex={0}
          key={key}
          parent={parent}
          rowIndex={rowIndex}
        >
          <TreeNode
            {...item}
            wrapperProps={{
              style: {
                ...style,
                whiteSpace: "nowrap",
              },
              children: restProps.rowRenderer?.(item, rowProps),
            }}
          />
        </CellMeasurer>
      );
    },
    [renderData]
  );

  useEffect(() => {
    setIndex(0);
    setData(flatDeep(propsData));
  }, [propsData]);

  return (
    <TreeProvider value={value}>
      <AutoSizer>
        {({ width, height }) => (
          <Grid
            {...restProps}
            height={height}
            width={width}
            columnCount={1}
            rowCount={renderData.length}
            cellRenderer={rowRenderer}
            deferredMeasurementCache={cache}
            columnWidth={cache.columnWidth}
            rowHeight={cache.rowHeight}
            overscanColumnCount={0}
            overscanRowCount={2}
          />
        )}
      </AutoSizer>
    </TreeProvider>
  );
};

export default VirtualTree;
