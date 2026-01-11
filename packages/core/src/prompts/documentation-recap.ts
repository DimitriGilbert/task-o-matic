export const DOCUMENTATION_RECAP_PROMPT = `Create a concise recap of the documentation fetched for these libraries:

Libraries:
{LIBRARIES_LIST}

Documentation Contents:
{DOCUMENTATION_CONTENTS}

Please provide a 2-3 sentence summary of what documentation is available and how it relates to the task.`;

export const DOCUMENTATION_RECAP_SYSTEM_PROMPT = `You are a technical writer who creates concise summaries of documentation collections.`;
