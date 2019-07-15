import { ContextParameters } from "graphql-yoga/dist/types";
import { makeContext } from "./context";

export const mockContext = () => makeContext({} as ContextParameters)
