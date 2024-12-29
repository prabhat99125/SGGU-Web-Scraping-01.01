const puppeteer = require("puppeteer");
const collegeName = require("./collegeName");
const studeNo = require("./studeNO");
const resultGet = require("./resultGet");
console.log(collegeName(50));
let setNo = 1744;
let spdId = 2022002020;
let tryCount = 0;
const upDown = true; //true down and false up

let students = 50000;
const AcademicYear = '2023-2024';
const degree = "B.Com. Semester - 4 (April - 2024)";

(async () => {
    await studeNo.updateOne(
        { _id: "676f5be8c5f9d73c8eb965d5" },
        { $set: { DbSeatNO: 1697, DbSPDID: 2022001969 } },
        { upsert: true }
    )
    const browser = await puppeteer.launch({
        headless: false,

        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Path to your Chrome
        defaultViewport: null,
        slowMo: true,
        args: ["--start-maximized"]
    });
    try {
        const [page] = await browser.pages();
        page.setDefaultTimeout(60000);
        await page.goto("https://sggu.gipl.in/Welcome.aspx");

        // Click on "View Student Result"
        await page.waitForSelector("[title='Click Here to View Student result']", { visible: true });
        await page.click("[title='Click Here to View Student result']");

        // Select Academic Year
        await page.waitForSelector("#rcmbAcademicYear_Arrow", { visible: true });
        await page.click("#rcmbAcademicYear_Arrow");

        await page.waitForSelector('.rcbList');
        await page.evaluate((AcademicYear) => {
            const listItem = Array.from(document.querySelectorAll('.rcbList .rcbItem')).find(
                item => item.textContent.trim() === AcademicYear
            );
            if (listItem) listItem.click();
            else throw new Error(`Academic year "${AcademicYear}" not found`);
        }, AcademicYear);

        // Select Exam Degree
        await page.waitForSelector("#rcmbEaxm_Arrow", { visible: true });
        await page.click("#rcmbEaxm_Arrow");

        await page.waitForSelector('.rcbList');
        await page.evaluate((degree) => {
            const listItem = Array.from(document.querySelectorAll('.rcbList .rcbItem')).find(
                item => item.textContent.trim() === degree
            );
            if (listItem) listItem.click();
            else throw new Error(`Degree "${degree}" not found`);
        }, degree);

        // Enter Seat Number and SPDID
        await page.type("#txtSeatNo_text", String(setNo));
        await page.type("#rtxtSPDID_text", String(spdId));
        await page.click("#ibtnSubmit");

        // Perform Submission for Multiple Entries
        const performSubmission = async (seatNo, spdIdLocal) => {
            await page.waitForSelector("#lblStudentName", { visible: true });

            // Clear and enter new Seat Number
            await page.click("#txtSeatNo_text", { clickCount: 3 }); // Select all
            await page.keyboard.press('Backspace');
            await page.type("#txtSeatNo_text", seatNo);

            // Clear and enter new SPDID
            await page.click("#rtxtSPDID_text", { clickCount: 3 }); // Select all
            await page.keyboard.press('Backspace');
            await page.type("#rtxtSPDID_text", spdIdLocal);

            await page.click("#ibtnSubmit");
            await page.waitForSelector("#lblSPDIDValue", { visible: true });

            const textToCheck = "Student SPDID do not Match";
            const doesTextExist = await page.evaluate((text) => {
                return document.body.textContent.includes(text);
            }, textToCheck);

            if (doesTextExist) {
                if (upDown) {
                    setNo--
                } else {
                    setNo++
                }
                // spdId++
                tryCount++;
                console.log("error:", tryCount, seatNo, spdIdLocal)
                if (tryCount >= 10) {
                    if (upDown) {
                        setNo++
                        spdId = spdId - 10;
                    } else {
                        setNo--
                        spdId = spdId + 10;
                    }
                    // setNo--
                    // spdId = spdId - 10;
                    tryCount = 0
                    console.log(tryCount, setNo, spdId);

                }
            } else {
                const html = await page.content();
                await resultGet(html, seatNo);
                tryCount = 0;
                console.log("Done", seatNo, spdIdLocal)
            }
            if (upDown) {
                await studeNo.updateOne(
                    { _id: "676f5be8c5f9d73c8eb965d5" },
                    { $set: { DbSeatNO: setNo + 1, DbSPDID: spdId + 1 } },
                    { upsert: true }
                )
            } else {
                await studeNo.updateOne(
                    { _id: "676f5be8c5f9d73c8eb965d5" },
                    { $set: { DbSeatNO: setNo - 1, DbSPDID: spdId - 1 } },
                    { upsert: true }
                )
            }
        };

        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i <= students; i++) {
            const DBSTUDETNS = await studeNo.findOne({ _id: "676f5be8c5f9d73c8eb965d5" });
            setNo = DBSTUDETNS.DbSeatNO;
            spdId = DBSTUDETNS.DbSPDID;
            await performSubmission(String(setNo), String(spdId));
            // if (upDown) {
            //     setNo++;
            //     spdId++;
            //     console.log(setNo, spdId);
            // } else {
            //     setNo--;
            //     spdId--;
            // }

            await delay(500); // Wait 0.5 second between submissions
        }

        console.log("All submissions complete.");
    } catch (error) {
        console.error("Error occurred:", error.message);
    } finally {
        await browser.close();
    }
})();
