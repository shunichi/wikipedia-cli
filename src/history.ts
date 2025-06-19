import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface HistoryEntry {
  action: string;
  query: string;
  lang: string;
  timestamp: string;
}

const getHistoryFilePath = (): string => {
  const configDir = path.join(os.homedir(), '.config', 'wiki');
  return path.join(configDir, 'history.json');
};

const ensureConfigDir = async (): Promise<void> => {
  const configDir = path.dirname(getHistoryFilePath());
  try {
    await fs.access(configDir);
  } catch {
    await fs.mkdir(configDir, { recursive: true });
  }
};

export async function saveHistory(
  action: string,
  query: string,
  lang: string
): Promise<void> {
  try {
    await ensureConfigDir();
    const historyPath = getHistoryFilePath();
    
    let history: HistoryEntry[] = [];
    try {
      const data = await fs.readFile(historyPath, 'utf-8');
      history = JSON.parse(data);
    } catch {
      // ファイルが存在しない場合は空の配列から開始
    }

    const entry: HistoryEntry = {
      action,
      query,
      lang,
      timestamp: new Date().toISOString()
    };

    history.push(entry);

    // 履歴を最大100件に制限
    if (history.length > 100) {
      history = history.slice(-100);
    }

    await fs.writeFile(historyPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.warn('履歴保存に失敗しました:', error instanceof Error ? error.message : error);
  }
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const historyPath = getHistoryFilePath();
    const data = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}