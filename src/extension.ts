// This method is called when your extension is deactivated
// export function deactivate() {}
import * as _ from "lodash";
import * as changeCase from "change-case";
import { mkdirp } from 'mkdirp';
import * as path from "path";

// import * as vscode from 'vscode';
import { existsSync, lstatSync, writeFile, appendFile } from "fs";
import {
	commands,
	ExtensionContext,
	InputBoxOptions,
	OpenDialogOptions,
	QuickPickOptions,
	Uri,
	window,
  } from "vscode";

export function activate (context: ExtensionContext) {

	commands.registerCommand('onyxsio.feature', async (uri: Uri) => {
		go(uri);
	});

	commands.registerCommand('onyxsio.core', async (uri: Uri) => {
		core(uri);
	});
  
}

export async function go (uri: Uri) {
  // Show feature prompt
  let featureName = await promptForFeatureName();

  // Abort if name is not valid
  if (!isNameValid(featureName)) {
    window.showErrorMessage("The name must not be empty");
    return;
  }
  featureName = `${featureName}`;

  let targetDirectory = "";
  try {
    targetDirectory = await getTargetDirectory(uri);
  } catch (error) {
    window.showErrorMessage('error.message $error');
  }

 

  const pascalCaseFeatureName = changeCase.pascalCase(
    featureName.toLowerCase()
  );
  try {
    await generateFeatureArchitecture(
      `${featureName}`,
      targetDirectory
    );
    window.showInformationMessage(
      `Successfully Generated ${pascalCaseFeatureName} Feature`
    );
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
}
// 
// 
// 
export async function core (uri: Uri) {
	// Abort if name is not valid
	
	let targetDirectory = "";
  try {
    targetDirectory = await getTargetDirectory(uri);
  } catch (error) {
    window.showErrorMessage('error.message $error');
  }
  try {
    await generateCoreArchitecture(targetDirectory);
    
  } catch (error) {
    window.showErrorMessage(
      `Error:
        ${error instanceof Error ? error.message : JSON.stringify(error)}`
    );
  }
}
export async function generateCoreArchitecture (targetDirectory: string) {

	
	// Create the features directory if its does not exist yet
	const coreDirectoryPath = getCoreDirectoryPath(targetDirectory);
	//
		if (!existsSync(coreDirectoryPath)) {
		await createDirectories(coreDirectoryPath, [
			"Network",
			"Routes",
			"Theme",
			"Utility",
			"Usecases",
			"Error",
			]);	
			window.showInformationMessage(`Successfully Generated Core Folder.`);
		}
		else{
			window.showErrorMessage(`Error: Already Generated Core Folder!.`);
			return;
		}
	
  }
  //ck2u5mlpoqgohu6hfdbkrqralb7n2mborcfyh76sgz2acyav3ava
  
  export function getCoreDirectoryPath (currentDirectory: string): string {
	// Split the path
	const splitPath = currentDirectory.split(path.sep);
	// Remove trailing \
	if (splitPath[splitPath.length - 1] === "") {
	  splitPath.pop();
	}
	// Rebuild path
	const result = splitPath.join(path.sep);
  
	// If already return the current directory if not, return the current directory with the /features append to it
	return  path.join(result, "Core");
  }
 
///
// 
// 

export function isNameValid (featureName: string | undefined): boolean {
  // Check if feature name exists
  if (!featureName) {
    return false;
  }
  // Check if feature name is null or white space
  if (_.isNil(featureName) || featureName.trim() === "") {
    return false;
  }

  // Return true if feature name is valid
  return true;
}

export async function getTargetDirectory (uri: Uri): Promise<string> {
  let targetDirectory;
  if (_.isNil(_.get(uri, "fsPath")) || !lstatSync(uri.fsPath).isDirectory()) {
    targetDirectory = await promptForTargetDirectory();
    if (_.isNil(targetDirectory)) {
      throw Error("Please select a valid directory");
    }
  } else {
    targetDirectory = uri.fsPath;
  }

  return targetDirectory;
}

export async function promptForTargetDirectory (): Promise<string | undefined> {
  const options: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select a folder to create the feature in",
    canSelectFolders: true,
  };

  return window.showOpenDialog(options).then((uri) => {
    if (_.isNil(uri) || _.isEmpty(uri)) {
      return undefined;
    }
    return uri[0].fsPath;
  });
}

export function promptForFeatureName (): Thenable<string | undefined> {
  const blocNamePromptOptions: InputBoxOptions = {
    prompt: "Feature Name",
    placeHolder: "Home, Auth etc..",
  };
  return window.showInputBox(blocNamePromptOptions);
}

// export async function promptForUseEquatable (): Promise<boolean> {
//   const useEquatablePromptValues: string[] = ["no (default)", "yes (advanced)"];
//   const useEquatablePromptOptions: QuickPickOptions = {
//     placeHolder:
//       "Do you want to use the Equatable Package in bloc to override equality comparisons?",
//     canPickMany: false,
//   };

//   const answer = await window.showQuickPick(
//     useEquatablePromptValues,
//     useEquatablePromptOptions
//   );

//   return answer === "yes (advanced)";
// }

export async function generateFeatureArchitecture (
  featureName: string,
  targetDirectory: string
  
) {
  // Create the features directory if its does not exist yet
  const featuresDirectoryPath = getFeaturesDirectoryPath(targetDirectory);
  if (!existsSync(featuresDirectoryPath)) {
    await createDirectory(featuresDirectoryPath);
  }

  // Create the feature directory
  const featureDirectoryPath = path.join(featuresDirectoryPath, featureName);
  await createDirectory(featureDirectoryPath);

  // Create the data layer
  const dataDirectoryPath = path.join(featureDirectoryPath, "Data");
  await createDirectories(dataDirectoryPath, [
    "Sources",
    "Models",
    "Repositories",
	"Usecases",
  ]);

//   // Create the domain layer
//   const domainDirectoryPath = path.join(featureDirectoryPath, "domain");
//   await createDirectories(domainDirectoryPath, [
//     "entities",
//     "repositories",
//     "usecases",
//   ]);

  // Create the presentation layer
  const presentationDirectoryPath = path.join(
    featureDirectoryPath,
    "Presentation"
  );
  await createDirectories(presentationDirectoryPath, [
    "StateManagement",
    "Pages",
    "Widgets",
  ]);

  
}

export function getFeaturesDirectoryPath (currentDirectory: string): string {
  // Split the path
  const splitPath = currentDirectory.split(path.sep);

  // Remove trailing \
  if (splitPath[splitPath.length - 1] === "") {
    splitPath.pop();
  }

  // Rebuild path
  const result = splitPath.join(path.sep);

  // Determines whether we're already in the features directory or not
  const isDirectoryAlreadyFeatures =
    splitPath[splitPath.length - 1] === "Features";

  // If already return the current directory if not, return the current directory with the /features append to it
  return isDirectoryAlreadyFeatures ? result : path.join(result, "Features");
}

export async function createDirectories (
  targetDirectory: string,
  childDirectories: string[]
): Promise<void> {
  // Create the parent directory
  await createDirectory(targetDirectory);
  // Creat the children
  childDirectories.map(
    async (directory) =>
      await createDirectory(path.join(targetDirectory, directory))
  );
}

function createDirectory (targetDirectory: string): Promise<void> {
  return new Promise((resolve, reject) => {
   
	mkdirp(targetDirectory).then((valid)=>resolve()).catch((error) =>reject(error));
  });
}
