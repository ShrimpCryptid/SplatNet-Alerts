import { GEAR_ABILITIES, GEAR_BRANDS } from "../constants";

/**
 * Helper function for auto-generating the ability, gear, and brand image imports. 
 */
export function printIconImportCode(items: string[]) {
	let importStatements = "";
	let exportStatement = "export const placeholder = new Map(Object.entries({\n";

	for (var item of items) {
		let formattedFileName = "'./" + item.replace(/ /g, "_").toLowerCase() + ".png'";
		let importName = item.substring(0, 1).toLowerCase() + item.substring(1);
		importName = importName.replace(/\(| |\)|-/g, "");
		importStatements += "\nimport " + importName + " from " + formattedFileName;
		exportStatement += `\n\t'${item}': ${importName},`;
	}

	console.log(`${importStatements}\n\n${exportStatement}\n}));`);
}

printIconImportCode(GEAR_ABILITIES);
printIconImportCode(GEAR_BRANDS);
