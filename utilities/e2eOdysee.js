const puppeteer = require("puppeteer");
const { userName, password } = require("./cred");


class e2eOdysee {
    async startTest(domain, headlessStatus) {
        this.browser = await puppeteer.launch({ headless: headlessStatus });
        let page = await this.browser.newPage();
        page.setDefaultTimeout(1000 * 60 * 5);
        await page.setViewport({ width: 1920, height: 1080 })
        await page.goto(domain, { waitUntil: 'networkidle0' });
        return this.loginPage(page)
    }

    async loginPage(odyseePage) {
        async function login(userName, password) {
            await odyseePage.waitForSelector('input[id=username]', { visible: true });
            await odyseePage.type('input[id=username]', userName, { delay: 50 });
            await odyseePage.click('button.button--primary')
            await odyseePage.waitForSelector('input[id=password]');
            await odyseePage.type('input[id=password]', password, { delay: 50 });
            await odyseePage.waitForSelector('button.button--primary:not([disabled])', {visible: true})
            await odyseePage.click('button.button--primary');
            await odyseePage.waitFor(4000)
            // return this.mainPage(odyseePage);
        }
        return {
            goToLogin: async(domain) => {
                await odyseePage.goto(domain)
            },

            wait: async(msec) => {
                await odyseePage.waitFor(msec)
            },

            loginForValidation: async (userName, password) => {
                await login(userName, password)
            },

            loginForFurtherTesting: async(userName, password) => {
                await login(userName, password)
                return this.mainPage(odyseePage)
            },

            getLoginError: async () => {
                try {
                    await odyseePage.waitForSelector('.nag--error > .nag__message', {timeout: 3000})
                } catch(e) { return null }

                let err = await odyseePage.$eval('.nag--error > .nag__message', el => el.textContent)
                return err
                }
            }
        }
    async mainPage(odyseePage) {
        return {
            logout: async () => {
                await odyseePage.waitForSelector('button[aria-label="Your account"', {visible: true})
                await odyseePage.waitFor(2000)
                await odyseePage.click('button[aria-label="Your account"')
                await odyseePage.waitForSelector('div[role="menuitem"]', {visible: true})
                await odyseePage.waitFor(2000)
                await odyseePage.click('div[role="menuitem"]')
                try {
                    await odyseePage.waitForSelector('a.button--link[aria-label="Log In"]', {timeout: 3000})
                } catch(e) {return false}
                return true
            },
            search: async (searchTerm) => {
                await odyseePage.waitForSelector('input[placeholder=Search]');
                await odyseePage.click('input.wunderbar__input');
                await odyseePage.type('input.wunderbar__input', searchTerm, { delay: 100 });
                await odyseePage.keyboard.press('Enter');
                await odyseePage.waitForSelector('.media__thumb', {timeout: 10000})
                await odyseePage.waitFor(9000)
                await odyseePage.click('input.wunderbar__input');
                const inputValue = await odyseePage.$eval('input.wunderbar__input', el => el.value);
                for (let i = 0; i < inputValue.length; i++) {
                    await odyseePage.keyboard.press('Backspace');
                }
                return await odyseePage.evaluate((searchTerm) => {
                    return [...document.querySelectorAll('.claim-preview__title > span')].map(s => s.textContent).filter(str => !str.toLowerCase().includes(searchTerm.toLowerCase())).length == 0
                }, searchTerm)
            },
            goToSearchResult: async(index) => {
                let elems = await odyseePage.$$('.claim-preview__wrapper:not(.claim-preview__wrapper--channel)')
                await elems[index].click()
                await odyseePage.waitForSelector('.media__actions', {visible: true})
            },
            isVideoLiked: async() => {
                return await odyseePage.evaluate(() => document.querySelector('.icon--FireActive') != null)
            },
            likeVideo: async() => {
                await odyseePage.click('button[title="I like this"]')
                try {
                    await odyseePage.waitForSelector('.icon--FireActive', {timeout: 5000})
                } catch(e) {return false}
                return true
            },
            unlikeVideo: async() => {
                await odyseePage.click('button[title="I like this"]')
                await odyseePage.waitFor(3000)
            },
        }
    }

    async endTest() {
        await this.browser.close();
    }

}
module.exports = new e2eOdysee()
