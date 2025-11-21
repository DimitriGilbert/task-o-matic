import inquirer from "inquirer";

/**
 * Reusable inquirer prompt configurations for workflow
 */

export function confirmPrompt(
  message: string,
  defaultValue = true
): Promise<boolean> {
  return inquirer
    .prompt([
      {
        type: "confirm",
        name: "confirmed",
        message,
        default: defaultValue,
      },
    ])
    .then((answers) => answers.confirmed);
}

export function selectPrompt<T = string>(
  message: string,
  choices: Array<{ name: string; value: T } | T>
): Promise<T> {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "selected",
        message,
        choices,
      },
    ])
    .then((answers) => answers.selected);
}

export function multiSelectPrompt<T = string>(
  message: string,
  choices: Array<{ name: string; value: T; checked?: boolean } | T>
): Promise<T[]> {
  return inquirer
    .prompt([
      {
        type: "checkbox",
        name: "selected",
        message,
        choices,
      },
    ])
    .then((answers) => answers.selected);
}

export function textInputPrompt(
  message: string,
  defaultValue?: string,
  validate?: (input: string) => boolean | string
): Promise<string> {
  return inquirer
    .prompt([
      {
        type: "input",
        name: "text",
        message,
        default: defaultValue,
        validate,
      },
    ])
    .then((answers) => answers.text);
}

export function editorPrompt(
  message: string,
  defaultValue?: string
): Promise<string> {
  return inquirer
    .prompt([
      {
        type: "editor",
        name: "content",
        message,
        default: defaultValue,
      },
    ])
    .then((answers) => answers.content);
}

export function passwordPrompt(message: string): Promise<string> {
  return inquirer
    .prompt([
      {
        type: "password",
        name: "password",
        message,
        mask: "*",
      },
    ])
    .then((answers) => answers.password);
}
