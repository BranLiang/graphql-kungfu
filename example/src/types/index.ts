import * as path from "path";
import { fileLoader, mergeTypes } from "merge-graphql-schemas";

const typeArray = fileLoader(path.join(__dirname, "./"));
const typesMerged = mergeTypes(typeArray, { all: true });

export default typesMerged;