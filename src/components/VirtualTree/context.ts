import { useContext, createContext } from "react";
import type { TTreeContext } from "./types";

const treeContext = createContext<TTreeContext>({
    data: [],
    setData: () => { },
    propsData: {},
});
export const TreeProvider = treeContext.Provider;
export const useTreeContext = () => useContext(treeContext);
