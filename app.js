const puppeteer = require("puppeteer");
// const ReadHtml = require("./htmlRead");

let setNo = 2441;
let spdId = 2022002955;
let students = 200;
const AcademicYear = '2022-2023';
const degree = "B.Com. Semester - 1 (December - 2022)";

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: true,
        args: ["--start-maximized"]
    });
    try {
        
    } catch (error) {
        console.log(error)
    }
    try {
        const [page] = await browser.pages();
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

            // const html = await page.content();
            // setNo = await ReadHtml(html, Number(seatNo));
            // console.log("Processed Seat No:", setNo);
        };

        const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        for (let i = 0; i <= students; i++) {
            await performSubmission(String(setNo), String(spdId));
            setNo++;
            spdId++;
            await delay(500); // Wait 0.5 second between submissions
        }

        console.log("All submissions complete.");
    } catch (error) {
        console.error("Error occurred:", error.message);
    } finally {
        await browser.close();
    }
})();
