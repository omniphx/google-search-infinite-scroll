export const runtime = 'edge';

export type GoogleSearchResult = {
  cacheId: string;
  displayLink: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  htmlSnippet: string;
  htmlTitle: string;
  kind: string;
  link: string;
  pagemap: object;
  snippet: string;
  title: string;
};

export type PaginatedResult = {
  count: number;
  cx: string;
  inputEncoding: string;
  outputEncoding: string;
  safe: string;
  searchTerms: string;
  startIndex: number;
  title: string;
  totalResults: string;
}

export type GoogleSearchResults = {
  context: {
    title: string;
  };
  items: GoogleSearchResult[];
  kind: string;
  searchInformation: {
    formattedSearchTime: string;
    formattedTotalResults: string;
    searchTime: number;
    totalResults: string;
  };
  queries: {
    nextPage: PaginatedResult[];
    previousPage?: PaginatedResult[];
    request: PaginatedResult[];
  };
  url: {
    template: string;
    type: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const start = searchParams.get('start')

    const response = await fetch(`https://customsearch.googleapis.com/customsearch/v1?key=${process.env.GOOLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${query}&y=1${start ? `&start=${start}` : ''}`);

    return response;
  } catch (error: any) {
    console.error(error);

    return new Response(JSON.stringify(error), {
      status: 400,
      headers: {
        'content-type': 'application/json',
      },
    });
  }
}
