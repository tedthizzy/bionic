# Bionic Reading for VS Code

**Bionic Reading** is a Visual Studio Code extension that emphasizes parts of words to enhance readability.

## Features

- **Emphasizes Parts of Words**: Boldens the first few characters of each word.
- **Configurable Settings**: Customize the bolding percentage and enable/disable the extension.
- **Keyword Exclusions**: Excludes common keywords, methods, and properties from bolding.
- **Handles Comments and Quotes**: Excludes text within comments and quotes from bolding.

## Installation

1. Install the extension from the VS Code Marketplace.
2. Reload VS Code to activate the extension.

## Usage

Open a file in VS Code to see the Bionic Reading emphasis applied automatically.

## Settings

Configure the extension via the settings UI or `settings.json`:

- **Percentage of Word to Bold** (`bionic-reading.percentageOfWord`): Default is `0.5`.
- **Enable/Disable Extension** (`bionic-reading.enabled`): Default is `true`.

### Example Settings in `settings.json`

```json
{
    "bionic-reading.percentageOfWord": 0.5,
    "bionic-reading.enabled": true
}
