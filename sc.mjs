import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium', args:['--no-sandbox'] });
const p = await b.newPage({ viewport:{width:900,height:340}, deviceScaleFactor:2 });
await p.goto('file:///home/claude/icons/compare.html');
await p.waitForTimeout(700);
await p.screenshot({ path:'/home/claude/icons/compare.png' });
await b.close();
