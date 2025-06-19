import { searchWikipedia, getWikipediaPage } from '../wikipedia';

// モック用のaxios
jest.mock('axios');

describe('Wikipedia API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchWikipedia', () => {
    it('検索結果を正しく返す', async () => {
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          query: {
            search: [
              {
                title: 'テスト記事',
                snippet: 'テスト用の記事です',
                pageid: 123
              }
            ]
          }
        }
      });

      const results = await searchWikipedia('テスト', 'ja');
      
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('テスト記事');
      expect(results[0].snippet).toBe('テスト用の記事です');
      expect(results[0].pageid).toBe(123);
    });

    it('検索結果がない場合は空配列を返す', async () => {
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          query: {
            search: []
          }
        }
      });

      const results = await searchWikipedia('存在しない記事', 'ja');
      
      expect(results).toHaveLength(0);
    });
  });

  describe('getWikipediaPage', () => {
    it('記事データを正しく返す', async () => {
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          query: {
            pages: {
              '123': {
                title: 'テスト記事',
                revisions: [{
                  slots: {
                    main: {
                      '*': '==概要==\nテスト用の記事です。'
                    }
                  }
                }],
                links: [{ title: '関連記事' }]
              }
            }
          }
        }
      });

      const page = await getWikipediaPage('テスト記事', 'ja');
      
      expect(page).not.toBeNull();
      expect(page?.title).toBe('テスト記事');
      expect(page?.content).toContain('概要');
      expect(page?.links).toHaveLength(1);
    });

    it('存在しない記事の場合はnullを返す', async () => {
      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue({
        data: {
          query: {
            pages: {
              '-1': {
                title: '存在しない記事',
                missing: true
              }
            }
          }
        }
      });

      const page = await getWikipediaPage('存在しない記事', 'ja');
      
      expect(page).toBeNull();
    });
  });
});