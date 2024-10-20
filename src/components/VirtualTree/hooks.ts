import { useMemo } from "react";
import { TTreeNode } from "./types";

export const useTreeFlat = (initialExpand?: boolean) => {
  return useMemo(() => {
    let index = 0;
    const setIdx = (v: number) => {
      index = v;
    };
    const fd = (
      items: TTreeNode[] = [],
      parentId?: string,
      level = 0,
      result: TTreeNode[] = []
    ) => {
      for (const item of items) {
        const { children, ...rest } = item;
        const childrenLength = children?.length;

        rest.index = index++;
        rest.childrenLength = childrenLength;
        rest.level = level;
        rest.show = initialExpand ?? !level;

        if (parentId) {
          rest.parentId = parentId;
        }

        result.push(rest);

        if (childrenLength) {
          rest.expand = initialExpand ?? false;
          fd(children, rest.id as string, level + 1, result);
        }
      }
      return result;
    };

    return {
      flatDeep: fd,
      setIndex: setIdx,
    };
  }, []);
};
