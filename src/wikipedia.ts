import axios from 'axios';

export interface WikipediaSearchResult {
  title: string;
  snippet?: string;
  pageid: number;
}

export interface WikipediaPage {
  title: string;
  content?: string;
  extract?: string;
  links?: Array<{ title: string }>;
  originalTitle?: string; // リダイレクト元のタイトル
  redirected?: boolean; // リダイレクトされたかどうか
}

const getWikipediaBaseUrl = (lang: string): string => {
  return `https://${lang}.wikipedia.org/w/api.php`;
};

export async function searchWikipedia(
  query: string,
  lang: string = 'ja'
): Promise<WikipediaSearchResult[]> {
  const baseUrl = getWikipediaBaseUrl(lang);
  
  try {
    const response = await axios.get(baseUrl, {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: query,
        srlimit: 10,
        srprop: 'snippet',
        origin: '*'
      }
    });

    if (response.data.query && response.data.query.search) {
      return response.data.query.search.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        pageid: item.pageid
      }));
    }

    return [];
  } catch (error) {
    throw new Error(`Wikipedia検索エラー: ${error instanceof Error ? error.message : error}`);
  }
}

export async function getWikipediaPage(
  title: string,
  lang: string = 'ja'
): Promise<WikipediaPage | null> {
  const baseUrl = getWikipediaBaseUrl(lang);
  
  try {
    // ページの基本情報とコンテンツを取得（リダイレクト自動追従）
    const [contentResponse, extractResponse] = await Promise.all([
      // フルコンテンツ取得
      axios.get(baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          titles: title,
          prop: 'revisions|links',
          rvprop: 'content',
          rvslots: 'main',
          pllimit: 50,
          redirects: 1, // リダイレクト自動追従
          origin: '*'
        }
      }),
      // 要約取得
      axios.get(baseUrl, {
        params: {
          action: 'query',
          format: 'json',
          titles: title,
          prop: 'extracts',
          exintro: true,
          explaintext: true,
          exsectionformat: 'plain',
          exsentences: 3, // 最初の3文のみ取得
          redirects: 1, // リダイレクト自動追従
          origin: '*'
        }
      })
    ]);

    const pages = contentResponse.data.query?.pages;
    const extractPages = extractResponse.data.query?.pages;
    const redirects = contentResponse.data.query?.redirects;
    
    if (!pages || !extractPages) {
      return null;
    }

    const pageId = Object.keys(pages)[0];
    const extractPageId = Object.keys(extractPages)[0];
    
    if (pageId === '-1' || extractPageId === '-1') {
      return null;
    }

    const page = pages[pageId];
    const extractPage = extractPages[extractPageId];
    
    // リダイレクト情報を取得
    let originalTitle = title;
    let redirected = false;
    if (redirects && redirects.length > 0) {
      redirected = true;
      originalTitle = redirects[0].from;
    }
    
    let content = '';
    if (page.revisions && page.revisions[0] && page.revisions[0].slots && page.revisions[0].slots.main) {
      content = page.revisions[0].slots.main['*'];
      // MediaWiki記法を簡単なテキストに変換
      content = content
        // InfoBoxなどのテンプレートを除去
        .replace(/\{\{[^{}]*\}\}/g, '')
        .replace(/\{\{[^{}]*\{\{[^{}]*\}\}[^{}]*\}\}/g, '')
        // セクションヘッダー
        .replace(/={2,}\s*(.+?)\s*={2,}/g, '\n\n$1\n' + '─'.repeat(20) + '\n')
        // リンク
        .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
        .replace(/\[\[([^\]|]+)\]\]/g, '$1')
        .replace(/\[([^\s]+)\s+([^\]]+)\]/g, '$2 ($1)')
        // フォーマット
        .replace(/'''([^']+)'''/g, '$1')
        .replace(/''([^']+)''/g, '$1')
        // ファイル参照
        .replace(/\[\[ファイル:[^\]]+\]\]/g, '')
        .replace(/\[\[File:[^\]]+\]\]/g, '')
        .replace(/\[\[画像:[^\]]+\]\]/g, '')
        // その他のマークアップ
        .replace(/<[^>]*>/g, '')
        .replace(/\|[^=\n]*=/g, '')
        .replace(/^\|.*/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    }

    const links = page.links ? page.links.map((link: any) => ({ title: link.title })) : [];

    return {
      title: page.title,
      content,
      extract: extractPage.extract,
      links,
      originalTitle: redirected ? originalTitle : undefined,
      redirected
    };
  } catch (error) {
    throw new Error(`Wikipedia記事取得エラー: ${error instanceof Error ? error.message : error}`);
  }
}

export async function getRandomPage(lang: string = 'ja'): Promise<WikipediaPage | null> {
  const baseUrl = getWikipediaBaseUrl(lang);
  
  try {
    // ランダムページタイトルを取得
    const randomResponse = await axios.get(baseUrl, {
      params: {
        action: 'query',
        format: 'json',
        list: 'random',
        rnnamespace: 0,
        rnlimit: 1,
        origin: '*'
      }
    });

    if (!randomResponse.data.query?.random?.[0]) {
      return null;
    }

    const randomTitle = randomResponse.data.query.random[0].title;
    return await getWikipediaPage(randomTitle, lang);
  } catch (error) {
    throw new Error(`ランダム記事取得エラー: ${error instanceof Error ? error.message : error}`);
  }
}