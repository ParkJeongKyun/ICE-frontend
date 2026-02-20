import fs from 'fs';
import path from 'path';

/**
 * Read a list of markdown files from public/locales/{locale}/markdown and return a map.
 * Synchronous by design (used inside server components during render).
 */
export function getMarkdownData(locale: string, files: string[]) {
  const markdownData: { [key: string]: string } = {};

  files.forEach((fname) => {
    try {
      const filePath = path.join(
        process.cwd(),
        'public',
        'locales',
        locale,
        'markdown',
        `${fname}.md`
      );
      markdownData[fname] = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      // if file missing or read fails, return empty string to avoid runtime errors
      markdownData[fname] = '';
    }
  });

  return markdownData;
}
