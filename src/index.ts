#!/usr/bin/env node

import { Command } from 'commander';
import { searchWikipedia, getWikipediaPage, getRandomPage, getWikipediaUrl } from './wikipedia';
import { saveHistory, getHistory } from './history';

const program = new Command();

program
  .name('wiki')
  .description('Wikipedia検索CLIツール')
  .version('1.0.0');

program
  .command('search')
  .description('Wikipedia記事を検索')
  .argument('<query>', '検索キーワード')
  .option('-l, --lang <lang>', '言語設定 (ja/en)', 'ja')
  .option('-s, --summary', '要約のみ表示')
  .action(async (query: string, options) => {
    try {
      const results = await searchWikipedia(query, options.lang);
      if (results.length === 0) {
        console.log('検索結果が見つかりませんでした。');
        return;
      }

      console.log(`検索結果: "${query}"`);
      console.log('─'.repeat(50));
      
      results.slice(0, 10).forEach((result, index) => {
        console.log(`${index + 1}. ${result.title}`);
        console.log(`   URL: ${getWikipediaUrl(result.title, options.lang)}`);
        if (result.snippet) {
          console.log(`   ${result.snippet.replace(/<[^>]*>/g, '')}`);
        }
        console.log();
      });

      await saveHistory('search', query, options.lang);
    } catch (error) {
      console.error('検索エラー:', error instanceof Error ? error.message : error);
    }
  });

program
  .command('show')
  .description('Wikipedia記事を表示')
  .argument('<title>', '記事タイトル')
  .option('-l, --lang <lang>', '言語設定 (ja/en)', 'ja')
  .option('-s, --summary', '要約のみ表示')
  .option('--section <section>', '特定セクションを表示')
  .option('--links', 'リンクを表示')
  .action(async (title: string, options) => {
    try {
      const page = await getWikipediaPage(title, options.lang);
      if (!page) {
        console.log('記事が見つかりませんでした。');
        return;
      }

      if (page.redirected && page.originalTitle) {
        console.log(`"${page.originalTitle}" から "${page.title}" にリダイレクトされました`);
        console.log();
      }
      
      console.log(`記事: ${page.title}`);
      console.log(`URL: ${getWikipediaUrl(page.title, options.lang)}`);
      console.log('═'.repeat(50));
      
      if (options.summary) {
        if (page.extract) {
          console.log('【要約】');
          console.log(page.extract);
        } else {
          console.log('要約が利用できません。');
        }
      } else if (page.content) {
        if (options.section) {
          const sections = page.content.split(/^={2,}\s*(.+?)\s*={2,}$/gm);
          const sectionIndex = sections.findIndex(section => 
            section.toLowerCase().includes(options.section.toLowerCase())
          );
          if (sectionIndex > 0) {
            console.log(sections[sectionIndex + 1] || 'セクションが見つかりませんでした。');
          } else {
            console.log('指定されたセクションが見つかりませんでした。');
          }
        } else {
          console.log(page.content);
        }
      }

      if (options.links && page.links) {
        console.log('\n関連リンク:');
        console.log('─'.repeat(20));
        page.links.slice(0, 10).forEach(link => {
          console.log(`• ${link.title}`);
        });
      }

      await saveHistory('show', title, options.lang);
    } catch (error) {
      console.error('記事取得エラー:', error instanceof Error ? error.message : error);
    }
  });

program
  .command('random')
  .description('ランダムな記事を表示')
  .option('-l, --lang <lang>', '言語設定 (ja/en)', 'ja')
  .action(async (options) => {
    try {
      const page = await getRandomPage(options.lang);
      if (!page) {
        console.log('ランダム記事を取得できませんでした。');
        return;
      }

      console.log(`ランダム記事: ${page.title}`);
      console.log(`URL: ${getWikipediaUrl(page.title, options.lang)}`);
      console.log('═'.repeat(50));
      
      if (page.extract) {
        console.log(page.extract);
      }

      await saveHistory('random', page.title, options.lang);
    } catch (error) {
      console.error('ランダム記事取得エラー:', error instanceof Error ? error.message : error);
    }
  });

program
  .command('history')
  .description('検索履歴を表示')
  .action(async () => {
    try {
      const history = await getHistory();
      if (history.length === 0) {
        console.log('履歴がありません。');
        return;
      }

      console.log('検索履歴:');
      console.log('─'.repeat(30));
      
      history.slice(-20).reverse().forEach((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleString('ja-JP');
        console.log(`${index + 1}. [${entry.action}] ${entry.query} (${entry.lang}) - ${date}`);
      });
    } catch (error) {
      console.error('履歴取得エラー:', error instanceof Error ? error.message : error);
    }
  });

program.parse();