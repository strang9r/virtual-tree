import { VirtualTree } from "@components";
import { TTreeNode } from "@components/VirtualTree/types";
import { useMemo } from "react";

const dig = (path = "0", level = 15) => {
  const list: TTreeNode[] = [];
  for (let i = 0; i < 2; i += 1) {
    const key = `${path}-${i}`;
    const treeNode: TTreeNode = {
      label: key,
      id: key,
    };
    if (level > 0) {
      treeNode.children = dig(key, level - 1);
    }
    list.push(treeNode);
  }
  return list;
};

function App() {
  const data = useMemo(dig, []);
  return (
    <>
      {data.length}
      <div style={{ height: 500 }}>
        <VirtualTree data={data} />
      </div>
    </>
  );
}

export default App;
