const odysee = require('../utilities/e2eOdysee')
const timeout = 8000000
const { userName, password } = require('../utilities/cred')
const domain = 'https://odysee.com/$/signin'

describe(
    'E2E test as an end-user, perform the tests below:',
    () => {
        let loginPage;
        let mainPage;
        let searchResultPage;

        beforeAll(
            async () => {
                try {
                    loginPage = await odysee.startTest(domain, false)
                    // mainPage = await loginPage.login(userName, password)
                }
                catch (error) {
                    console.log(error);
                    throw error;
                }
            }, timeout
        );
         it("Page shows error when incorrect login data is entered",
             async () => {
                 await reporter.description("Test invalid logi attempt")
                 await reporter.startStep("Enter wrong phone number and password")
                 await loginPage.loginForValidation(userName, '1234')
                 await reporter.endStep()

                 await reporter.startStep("Check if page shows an error")
                 const loginError = await loginPage.getLoginError()
                 await reporter.endStep()
                
                 expect(loginError).toBeDefined()
                 expect(loginError).toBe("Incorrect email and/or password")
                 await loginPage.goToLogin(domain)

             }, timeout
         )

        it("Login succeeds with correct credentials",
            async () => {
                await reporter.description("Test valid login attempt")
                await reporter.startStep("Enter correct credentials")
                mainPage = await loginPage.loginForFurtherTesting(userName, password)
                await reporter.endStep()

                await reporter.startStep("Check if page shows an error")
                const loginError = await loginPage.getLoginError()
                await reporter.endStep()
                
                expect(loginError).toBe(null)
            }, timeout
        )

        it("Logout works", 
            async () => {
                expect(await mainPage.logout()).toBe(true)
                await loginPage.goToLogin(domain)
            }, timeout
        )

        it('Search works',
            async () => {
                await loginPage.loginForFurtherTesting(userName, password)
                expect(await mainPage.search('linux')).toBe(true)
                expect(await mainPage.search('Luke Smith')).toBe(true)
                await loginPage.wait(2000)
            }, timeout
        )

        it('Like works',
            async () => {
                const title = 'the linux experiment'
                await mainPage.search(title)
                await mainPage.goToSearchResult(0)
                await loginPage.wait(2000)
                if (await mainPage.isVideoLiked()) { await mainPage.unlikeVideo() }
                expect(await mainPage.isVideoLiked()).toBe(false)
                expect(await mainPage.likeVideo()).toBe(true)
                expect(await mainPage.isVideoLiked()).toBe(true)
            }, timeout
        ),

        afterAll(
            async () => {
                await odysee.endTest()
            }
        );
    }, timeout
);

