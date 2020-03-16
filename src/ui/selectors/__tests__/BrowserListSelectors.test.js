import * as s from '../BrowserListSelectors';

describe('BrowserListSeelctors', () => {
    describe('getCurrentState', () => {
        it('returns last item in browserList history', () => {
            const state = {
                browserList: {
                    history: [{ id: 'one' }, { id: 'two' }]
                }
            };

            const res = s.getCurrentState(state);

            expect(res).toMatchObject({
                id: 'two'
            });
        });
    });

    describe('getSearching', () => {
        it('returns false if search term is falsy', () => {
            const state = {
                browserList: {
                    searchTerm: null,
                    history: [{}]
                }
            };

            const res = s.getSearching(state);

            expect(res).toBe(false);
        });

        it('returns true if search term is set', () => {
            const state = {
                browserList: {
                    searchTerm: 'search',
                    history: [
                        {
                            mode: 'artists'
                        }
                    ]
                }
            };

            const res = s.getSearching(state);

            expect(res).toBe(true);
        });

        it('returns false if search term is set but sub item browsed', () => {
            const state = {
                browserList: {
                    searchTerm: 'search',
                    history: [
                        {
                            mode: 'artists'
                        },
                        {}
                    ]
                }
            };

            const res = s.getSearching(state);

            expect(res).toBe(false);
        });
    });
});
