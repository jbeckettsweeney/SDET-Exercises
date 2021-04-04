// spec.js

//page classes
class pageLanding {
    /* find the registration button
        - previously selected <a> tag, but this was not interactable
        - currently selects <h2> within <a>, which IS interactable (thank you Mitch!) */
    getRegButton() {
        return browser.driver.findElement(by.xpath('//a[contains(@href, "http://www.way2automation.com/angularjs-protractor/registeration")]//h2'));
    }

    //find webtables button
    getTableButton() {
        return browser.driver.findElement(by.xpath('//a[contains(@href, "http://www.way2automation.com/angularjs-protractor/webtables")]//h2'));
    }
}
class pageRegistration {
    //form fields
    getUser1() {
        return element(by.model('Auth.user.name'));
    }
    getPass() {
        return element(by.model('Auth.user.password'));
    }
    getUser2() {
        return element(by.model('model[options.key]'));
    }
    getButton() {
        return element(by.xpath('//button'));
    }

    //success
    getHome() {
        return element(by.xpath('//h1[text()="Home"]'));
    }
    getLogout() {
        return element(by.xpath('//a[text()="Logout"]'));
    }

    //fail
    getFail() {
        return element(by.xpath('//div[text()="Username or password is incorrect"]'));
    }
}
class pageTable {
    //rows
    getAllRows() {
        return element(by.css('tbody')).all(by.repeater('dataRow in displayedCollection'));
    }

    //columns
    getAllColumns() {
        return this.getAllRows().all(by.repeater('column in columns'));
    }

    //x button at the end of specified row
    getIndexRowButton(index) {
        return this.getAllRows().get(index).all(by.repeater('column in columns')).last().element(by.css('button'));
    }
    //confirmation button after clicking above x button
    getConfirmationButton() {
        return element(by.xpath('//button[text()="OK"]'));
    }
}

describe('Schedulicity SDET Exercise', function () {
    //instantiate page classes
    let land = new pageLanding();
    let reg = new pageRegistration();
    let tab = new pageTable();

    //at the beginning of each test, turn off waiting, then load
    beforeEach(function () {
        browser.waitForAngularEnabled(false);
        browser.get('http://www.way2automation.com/protractor-angularjs-practice-website.html');
    });

    it('should allow valid registration', function () {
        //grab and click the registration button
        land.getRegButton().click();

        //checks for new tabs, then switches to second available tab
        browser.getAllWindowHandles().then(function (handles) {
            //close first tab, then enter second tab
            browser.driver.close();
            browser.switchTo().window(handles[1]).then(function () {
                //reenable waiting since this page is angular
                browser.waitForAngularEnabled(true);

                //send each form field their respective info, then submit
                reg.getUser1().sendKeys('angular');
                reg.getPass().sendKeys('password');
                reg.getUser2().sendKeys('angular');
                reg.getButton().click();

                //find and verify login page
                expect(reg.getHome().getText()).toContain('Home');

                //log out so next test can attempt and fail to log in
                reg.getLogout().click();
            });
        });
    });

    //redundant comments not included, refer to above
    it('should not allow invalid registration', function () {
        land.getRegButton().click();

        browser.getAllWindowHandles().then(function (handles) {
            browser.driver.close();
            browser.switchTo().window(handles[1]).then(function () {
                browser.waitForAngularEnabled(true);

                reg.getUser1().sendKeys('angular');
                //sends incorrect password
                reg.getPass().sendKeys('password1');
                reg.getUser2().sendKeys('angular');
                reg.getButton().click();

                //find and verify failure message
                expect(reg.getFail().getText()).toContain('incorrect');
            });
        });
    });

    it('should handle table management', function () {
        land.getTableButton().click();

        browser.getAllWindowHandles().then(function (handles) {
            browser.driver.close();
            browser.switchTo().window(handles[1]).then(function () {
                browser.waitForAngularEnabled(true);

                /* set verification variables
                    - if row is anything but -1, that row needs to be deleted
                    - if after deleting, 'admin' is found, success is switched to false */
                var row = -1;
                var success = true;

                //get a list of all text for each table element
                tab.getAllColumns().getText().then(function (text) {
                    //for all usernames among all table elements
                    for (let i = 2; i < text.length; i += 11) {
                        //if the username is 'admin', mark that row
                        if (text[i] === 'admin') {
                            row = (i - (i % 11)) / 11;
                        }
                    }

                }).then(function () {
                    //if row has been changed, delete corresponding row
                    if (row != -1) {
                        tab.getIndexRowButton(row).click().then(function () {
                            tab.getConfirmationButton().click();
                        });
                    }
                }).then(function () {
                    //search through all usernames again, looking for 'admin'
                    tab.getAllColumns().getText().then(function (text) {
                        for (let i = 2; i < text.length; i += 11) {
                            //if found, set success to false
                            if (text[i] === 'admin') {
                                success = false;
                            }
                        }
                    });
                }).then(function () {
                    //verification: if it found admin again, throw an error
                    if (!success) {
                        throw new Error('admin found');
                    }
                });
            });
        });
    });
});