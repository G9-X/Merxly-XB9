import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  
  console.log("Page loaded");
  
  // Wait for the button
  await page.waitForSelector('button[title="Open Assistant"]', { timeout: 5000 }).catch(e => console.log("Button not found"));
  
  const button = await page.$('button[title="Open Assistant"]');
  if (button) {
    console.log("Button found, clicking...");
    await button.click();
    
    // Wait for aui-modal-content to be visible
    await new Promise(r => setTimeout(r, 1000));
    
    const content = await page.$('.aui-modal-content');
    if (content) {
      const isVisible = await content.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.opacity !== '0';
      });
      console.log("Modal content exists. Is visible:", isVisible);
    } else {
      console.log("Modal content not found in DOM");
    }
  } else {
    // maybe title is something else
    const anyBtn = await page.$('button');
    console.log("Any button exists?", !!anyBtn);
  }
  
  await browser.close();
})();
