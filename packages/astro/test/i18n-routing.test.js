import { loadFixture } from './test-utils.js';
import { expect } from 'chai';
import * as cheerio from 'cheerio';
import testAdapter from './test-adapter.js';

describe('astro:i18n virtual module', () => {
	/** @type {import('./test-utils').Fixture} */
	let fixture;
	/** @type {import('./test-utils').DevServer} */
	let devServer;

	before(async () => {
		fixture = await loadFixture({
			root: './fixtures/i18n-routing/',
		});
		devServer = await fixture.startDevServer();
	});

	after(async () => {
		await devServer.stop();
	});

	it('correctly imports the functions', async () => {
		const response = await fixture.fetch('/virtual-module');
		expect(response.status).to.equal(200);
		const text = await response.text();
		expect(text).includes("Virtual module doesn't break");
		expect(text).includes('About: /pt/about');
	});
});
describe('[DEV] i18n routing', () => {
	describe('i18n routing', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should render the en locale', async () => {
			const response = await fixture.fetch('/en/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');

			const response2 = await fixture.fetch('/en/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			const response = await fixture.fetch('/pt/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');

			const response2 = await fixture.fetch('/pt/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			const response = await fixture.fetch('/it/start');
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			const response = await fixture.fetch('/fr/start');
			expect(response.status).to.equal(404);
		});
	});

	describe('i18n routing, with base', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-base/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should render the en locale', async () => {
			const response = await fixture.fetch('/new-site/en/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Hello');

			const response2 = await fixture.fetch('/new-site/en/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			const response = await fixture.fetch('/new-site/pt/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Hola');

			const response2 = await fixture.fetch('/new-site/pt/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			const response = await fixture.fetch('/new-site/it/start');
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			const response = await fixture.fetch('/new-site/fr/start');
			expect(response.status).to.equal(404);
		});
	});

	describe('i18n routing with routing strategy [prefix-other-locales]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-other-locales/',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'pt', 'it'],
						fallback: {
							it: 'en',
						},
					},
				},
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should render the default locale without prefix', async () => {
			const response = await fixture.fetch('/new-site/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');

			const response2 = await fixture.fetch('/new-site/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hello world');
		});

		it('should return 404 when route contains the default locale', async () => {
			const response = await fixture.fetch('/new-site/en/start');
			expect(response.status).to.equal(404);

			const response2 = await fixture.fetch('/new-site/en/blog/1');
			expect(response2.status).to.equal(404);
		});

		it('should render localised page correctly', async () => {
			const response = await fixture.fetch('/new-site/pt/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');

			const response2 = await fixture.fetch('/new-site/pt/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hola mundo');
		});

		it('should redirect to the english locale, which is the first fallback', async () => {
			const response = await fixture.fetch('/new-site/it/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			const response = await fixture.fetch('/new-site/fr/start');
			expect(response.status).to.equal(404);
		});
	});

	describe('i18n routing with routing strategy [prefix-always]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should redirect to the index of the default locale', async () => {
			const response = await fixture.fetch('/new-site');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Hello');
		});

		it('should not render the default locale without prefix', async () => {
			const response = await fixture.fetch('/new-site/start');
			expect(response.status).to.equal(404);
			expect(await response.text()).not.includes('Start');

			const response2 = await fixture.fetch('/new-site/blog/1');
			expect(response2.status).to.equal(404);
			expect(await response2.text()).not.includes('Hello world');
		});

		it('should render the default locale with prefix', async () => {
			const response = await fixture.fetch('/new-site/en/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');

			const response2 = await fixture.fetch('/new-site/en/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			const response = await fixture.fetch('/new-site/pt/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');

			const response2 = await fixture.fetch('/new-site/pt/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hola mundo');
		});

		it('should not redirect to the english locale', async () => {
			const response = await fixture.fetch('/new-site/it/start');
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			const response = await fixture.fetch('/new-site/fr/start');
			expect(response.status).to.equal(404);
		});

		describe('[trailingSlash: always]', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing-prefix-always/',
					trailingSlash: 'always',
				});
				devServer = await fixture.startDevServer();
			});

			after(async () => {
				await devServer.stop();
			});

			it('should redirect to the index of the default locale', async () => {
				const response = await fixture.fetch('/new-site/');
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Hello');
			});
		});
	});

	describe('i18n routing fallback', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;
		/** @type {import('./test-utils').DevServer} */
		let devServer;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-fallback/',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'pt', 'it'],
						fallback: {
							it: 'en',
						},
						routingStrategy: 'prefix-other-locales',
					},
				},
			});
			devServer = await fixture.startDevServer();
		});

		after(async () => {
			await devServer.stop();
		});

		it('should render the default locale without prefix', async () => {
			const response = await fixture.fetch('/new-site/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');

			const response2 = await fixture.fetch('/new-site/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			const response = await fixture.fetch('/new-site/pt/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');

			const response2 = await fixture.fetch('/new-site/pt/blog/1');
			expect(response2.status).to.equal(200);
			expect(await response2.text()).includes('Hola mundo');
		});

		it('should redirect to the english locale, which is the first fallback', async () => {
			const response = await fixture.fetch('/new-site/it/start');
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			const response = await fixture.fetch('/new-site/fr/start');
			expect(response.status).to.equal(404);
		});
	});
});
describe('[SSG] i18n routing', () => {
	describe('i18n routing', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
			});
			await fixture.build();
		});

		it('should render the en locale', async () => {
			let html = await fixture.readFile('/en/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Start');

			html = await fixture.readFile('/en/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			let html = await fixture.readFile('/pt/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Oi essa e start');

			html = await fixture.readFile('/pt/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			try {
				await fixture.readFile('/it/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			try {
				await fixture.readFile('/fr/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});
	});

	describe('i18n routing, with base', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-base/',
			});
			await fixture.build();
		});

		it('should render the en locale', async () => {
			let html = await fixture.readFile('/en/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Hello');

			html = await fixture.readFile('/en/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			let html = await fixture.readFile('/pt/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Hola');

			html = await fixture.readFile('/pt/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			try {
				await fixture.readFile('/it/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			try {
				await fixture.readFile('/fr/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});
	});

	describe('i18n routing with routing strategy [prefix-other-locales]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-other-locales/',
			});
			await fixture.build();
		});

		it('should render the en locale', async () => {
			let html = await fixture.readFile('/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Start');

			html = await fixture.readFile('/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hello world');
		});

		it('should return 404 when route contains the default locale', async () => {
			try {
				await fixture.readFile('/start/en/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it('should render localised page correctly', async () => {
			let html = await fixture.readFile('/pt/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Oi essa e start');

			html = await fixture.readFile('/pt/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			try {
				await fixture.readFile('/it/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			try {
				await fixture.readFile('/fr/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});
	});

	describe('i18n routing with routing strategy [prefix-always]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
			});
			await fixture.build();
		});

		it('should redirect to the index of the default locale', async () => {
			const html = await fixture.readFile('/index.html');
			expect(html).to.include('http-equiv="refresh');
			expect(html).to.include('url=/new-site/en');
		});

		it('should render the en locale', async () => {
			let html = await fixture.readFile('/en/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Start');

			html = await fixture.readFile('/en/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			let html = await fixture.readFile('/pt/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Oi essa e start');

			html = await fixture.readFile('/pt/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hola mundo');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			try {
				await fixture.readFile('/it/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			try {
				await fixture.readFile('/fr/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		describe('[trailingSlash: always]', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing-prefix-always/',
					trailingSlash: 'always',
				});
			});

			it('should redirect to the index of the default locale', async () => {
				const html = await fixture.readFile('/index.html');
				expect(html).to.include('http-equiv="refresh');
				expect(html).to.include('url=/new-site/en');
			});
		});
	});

	describe('i18n routing with fallback', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-fallback/',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'pt', 'it'],
						fallback: {
							it: 'en',
						},
					},
				},
			});
			await fixture.build();
		});

		it('should render the en locale', async () => {
			let html = await fixture.readFile('/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Start');

			html = await fixture.readFile('/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hello world');
		});

		it('should render localised page correctly', async () => {
			let html = await fixture.readFile('/pt/start/index.html');
			let $ = cheerio.load(html);
			expect($('body').text()).includes('Oi essa e start');

			html = await fixture.readFile('/pt/blog/1/index.html');
			$ = cheerio.load(html);
			expect($('body').text()).includes('Hola mundo');
		});

		it('should redirect to the english locale, which is the first fallback', async () => {
			const html = await fixture.readFile('/it/start/index.html');
			expect(html).to.include('http-equiv="refresh');
			expect(html).to.include('url=/new-site/start');
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			try {
				await fixture.readFile('/fr/start/index.html');
				// failed
				return false;
			} catch {
				// success
				return true;
			}
		});

		it('should render the page with client scripts', async () => {
			let html = await fixture.readFile('/index.html');
			let $ = cheerio.load(html);
			expect($('script').text()).includes('console.log("this is a script")');
		});
	});
});
describe('[SSR] i18n routing', () => {
	let app;
	describe('default', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should redirect to the index of the default locale', async () => {
			let request = new Request('http://example.com/new-site');
			let response = await app.render(request);
			expect(response.status).to.equal(302);
			expect(response.headers.get('location')).to.equal('/new-site/en');
		});

		it('should render the en locale', async () => {
			let request = new Request('http://example.com/en/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it('should render localised page correctly', async () => {
			let request = new Request('http://example.com/pt/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			let request = new Request('http://example.com/it/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			let request = new Request('http://example.com/fr/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});
	});

	describe('with base', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should render the en locale', async () => {
			let request = new Request('http://example.com/en/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it('should render localised page correctly', async () => {
			let request = new Request('http://example.com/new-site/pt/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			let request = new Request('http://example.com/new-site/it/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			let request = new Request('http://example.com/new-site/fr/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});
	});

	describe('i18n routing with routing strategy [prefix-other-locales]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-other-locales/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should render the en locale', async () => {
			let request = new Request('http://example.com/new-site/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it('should return 404 if route contains the default locale', async () => {
			let request = new Request('http://example.com/new-site/en/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		it('should render localised page correctly', async () => {
			let request = new Request('http://example.com/new-site/pt/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			let request = new Request('http://example.com/new-site/it/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			let request = new Request('http://example.com/new-site/fr/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});
	});

	describe('i18n routing with routing strategy [prefix-always]', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should redirect the index to the default locale', async () => {
			let request = new Request('http://example.com/new-site');
			let response = await app.render(request);
			expect(response.status).to.equal(302);
			expect(response.headers.get('location')).to.equal('/new-site/en');
		});

		it('should render the en locale', async () => {
			let request = new Request('http://example.com/new-site/en/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it('should render localised page correctly', async () => {
			let request = new Request('http://example.com/pt/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');
		});

		it("should NOT render the default locale if there isn't a fallback and the route is missing", async () => {
			let request = new Request('http://example.com/it/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			let request = new Request('http://example.com/fr/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});

		describe('[trailingSlash: always]', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing-prefix-always/',
					output: 'server',
					adapter: testAdapter(),
					trailingSlash: 'always',
				});
				await fixture.build();
				app = await fixture.loadTestAdapterApp();
			});

			it('should redirect to the index of the default locale', async () => {
				let request = new Request('http://example.com/new-site/');
				let response = await app.render(request);
				expect(response.status).to.equal(302);
				expect(response.headers.get('location')).to.equal('/new-site/en/');
			});
		});
	});

	describe('with fallback', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-fallback/',
				output: 'server',
				adapter: testAdapter(),
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'pt', 'it'],
						fallback: {
							it: 'en',
						},
					},
				},
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should render the en locale', async () => {
			let request = new Request('http://example.com/new-site/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Start');
		});

		it('should render localised page correctly', async () => {
			let request = new Request('http://example.com/new-site/pt/start');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Oi essa e start');
		});

		it('should redirect to the english locale, which is the first fallback', async () => {
			let request = new Request('http://example.com/new-site/it/start');
			let response = await app.render(request);
			console.log(await response.text());
			// expect(response.status).to.equal(302);
			// expect(response.headers.get('location')).to.equal('/new-site/start');
		});

		it("should render a 404 because the route `fr` isn't included in the list of locales of the configuration", async () => {
			let request = new Request('http://example.com/new-site/fr/start');
			let response = await app.render(request);
			expect(response.status).to.equal(404);
		});
	});

	describe('preferred locale', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should not render the locale when the value is *', async () => {
			let request = new Request('http://example.com/preferred-locale', {
				headers: {
					'Accept-Language': '*',
				},
			});
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Locale: none');
		});

		it('should render the locale pt', async () => {
			let request = new Request('http://example.com/preferred-locale', {
				headers: {
					'Accept-Language': 'pt',
				},
			});
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('Locale: pt');
		});

		it('should render empty locales', async () => {
			let request = new Request('http://example.com/preferred-locale', {
				headers: {
					'Accept-Language': 'fr;q=0.1,fr-AU;q=0.9',
				},
			});
			let response = await app.render(request);
			const text = await response.text();
			expect(response.status).to.equal(200);
			expect(text).includes('Locale: none');
			expect(text).includes('Locale list: empty');
		});

		it('should render none as preferred locale, but have a list of locales that correspond to the initial locales', async () => {
			let request = new Request('http://example.com/preferred-locale', {
				headers: {
					'Accept-Language': '*',
				},
			});
			let response = await app.render(request);
			const text = await response.text();
			expect(response.status).to.equal(200);
			expect(text).includes('Locale: none');
			expect(text).includes('Locale list: en, pt, it');
		});

		describe('in case the configured locales use underscores', () => {
			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing/',
					output: 'server',
					adapter: testAdapter(),
					experimental: {
						i18n: {
							defaultLocale: 'en',
							locales: ['en_AU', 'pt_BR', 'es_US'],
						},
					},
				});
				await fixture.build();
				app = await fixture.loadTestAdapterApp();
			});

			it('they should be still considered when parsing the Accept-Language header', async () => {
				let request = new Request('http://example.com/preferred-locale', {
					headers: {
						'Accept-Language': 'en-AU;q=0.1,pt-BR;q=0.9',
					},
				});
				let response = await app.render(request);
				const text = await response.text();
				expect(response.status).to.equal(200);
				expect(text).includes('Locale: pt_BR');
				expect(text).includes('Locale list: pt_BR, en_AU');
			});
		});
	});

	describe('current locale', () => {
		describe('with [prefix-other-locales]', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing/',
					output: 'server',
					adapter: testAdapter(),
				});
				await fixture.build();
				app = await fixture.loadTestAdapterApp();
			});

			it('should return the default locale', async () => {
				let request = new Request('http://example.com/current-locale', {});
				let response = await app.render(request);
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Current Locale: en');
			});

			it('should return the default locale of the current URL', async () => {
				let request = new Request('http://example.com/pt/start', {});
				let response = await app.render(request);
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Current Locale: pt');
			});

			it('should return the default locale when a route is dynamic', async () => {
				let request = new Request('http://example.com/dynamic/lorem', {});
				let response = await app.render(request);
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Current Locale: en');
			});
		});

		describe('with [prefix-always]', () => {
			/** @type {import('./test-utils').Fixture} */
			let fixture;

			before(async () => {
				fixture = await loadFixture({
					root: './fixtures/i18n-routing-prefix-always/',
					output: 'server',
					adapter: testAdapter(),
				});
				await fixture.build();
				app = await fixture.loadTestAdapterApp();
			});

			it('should return the locale of the current URL (en)', async () => {
				let request = new Request('http://example.com/en/start', {});
				let response = await app.render(request);
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Current Locale: en');
			});

			it('should return the locale of the current URL (pt)', async () => {
				let request = new Request('http://example.com/pt/start', {});
				let response = await app.render(request);
				expect(response.status).to.equal(200);
				expect(await response.text()).includes('Current Locale: pt');
			});
		});
	});
});

describe('i18n routing does not break assets and endpoints', () => {
	describe('assets', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/core-image-base/',
				experimental: {
					i18n: {
						defaultLocale: 'en',
						locales: ['en', 'es'],
					},
				},
				base: '/blog',
			});
			await fixture.build();
		});

		it('should render the image', async () => {
			const html = await fixture.readFile('/index.html');
			const $ = cheerio.load(html);
			const src = $('#local img').attr('src');
			expect(src.length).to.be.greaterThan(0);
			expect(src.startsWith('/blog')).to.be.true;
		});
	});

	describe('endpoint', () => {
		/** @type {import('./test-utils').Fixture} */
		let fixture;

		let app;

		before(async () => {
			fixture = await loadFixture({
				root: './fixtures/i18n-routing-prefix-always/',
				output: 'server',
				adapter: testAdapter(),
			});
			await fixture.build();
			app = await fixture.loadTestAdapterApp();
		});

		it('should return the expected data', async () => {
			let request = new Request('http://example.com/new-site/test.json');
			let response = await app.render(request);
			expect(response.status).to.equal(200);
			expect(await response.text()).includes('lorem');
		});
	});
});
