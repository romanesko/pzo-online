import type {Route} from "@/types/routes/records/+types/page";
import puppeteer from "puppeteer";
import {repo} from "@/database/repo";
import type {ScheduleItemCombined} from "@/models";
import {transliterate} from "@/lib/transliterate";
import {lpad} from "@/lib/lpad";


function processTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
    return data.hasOwnProperty(key) ? data[key] : '';
  });
}

const defaultReplacer = '________________'

const monthFormatter = (date:Date)=>{
  const  m = date.getMonth()
  return ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][m]
}


async function prepareData(data: ScheduleItemCombined){

  const client = await repo.clients.getById(data.booking!.clientId)


  const office = data.offices!
  if(!office) {
    throw new Error('Office not found')
  }

  if(!client) {
    throw new Error('Client not found')
  }

  const today = new Date()
  const contractDate = new Date()

  let clientFullName = client.lastName + ' ' + client.firstName
  let clientFIO = client.lastName + ' ' + client.firstName?.charAt(0) + '.'
  if(client.middleName) {
    clientFullName += ' ' + client.middleName
    clientFIO += ' ' + client.middleName?.charAt(0)
  }


  return {
    contractNum: office.lastContractNumber,
    contractDay: contractDate.getDate(),
    contractMonthNum: contractDate.getMonth() + 1,
    contractMonth: monthFormatter(contractDate),
    contractYear: contractDate.getFullYear(),
    todayDay: today.getDate(),
    todayMonth: monthFormatter(today),
    todayYear: today.getFullYear(),
    signatory: office.signatory || defaultReplacer,
    signatoryGenitive: office.signatoryGenitive || defaultReplacer,
    signatoryStatus: office.signatoryStatus || defaultReplacer,
    signatoryStatusGenitive: office.signatoryStatusGenitive || defaultReplacer,
    attorneyNumber: office.attorneyNumber || defaultReplacer,
    officeName: office.name || defaultReplacer,
    address: office.address || defaultReplacer,
    actualAddress: office.actualAddress || defaultReplacer,
    licenceNumber: office.licenceNumber || defaultReplacer,
    legalEntity: office.legalEntity || defaultReplacer,
    credentials: office.credentials || defaultReplacer,
    clientFullName: clientFullName || defaultReplacer,
    clientPhone: client.phoneNumber || defaultReplacer,
    clientPassportNumber: client.passportNumber || defaultReplacer,
    clientPassportIssuedBy: client.passportIssuedBy || defaultReplacer,
    clientPassportIssuedAt: client.passportIssuedAt || '«___» ___________ _____ г',
    clientFIO: clientFIO || defaultReplacer,
  }
}



export async function action({request, params}: Route.ActionArgs) {

  let bookingId = params.id
  if (!bookingId) {
    throw new Error('bookingId is required')
  }


  const d = await repo.booking.getComposed(+bookingId)
  const service = await repo.services.getById(d.booking!.serviceId)

  const data = await prepareData(d)

  const pages = []

  for(const docId of service.documents) {
    const doc = await repo.documents.getById(docId)
    const content = processTemplate(doc.content,data)
    // console.log(docId)
    pages.push(content)
  }

  await repo.offices.updateLastContractNumber(d.offices!.id).catch(console.error)

  // const pdfBuffer = await generatePDF({pages: pages.slice(1,2)})

  // const filePath = path.join(process.cwd(), "output.pdf");
  // const pdfBuffer = fs.readFileSync(filePath);

  const pdfBuffer = await generatePDF({pages})

  const safeFio = transliterate(data.clientFIO.replace(/[^a-zA-Zа-яА-Я]/g, ''));
  // console.log(data.clientFIO, safeFio)

  let filename  = `${data.contractYear}-${lpad(data.contractMonthNum,2)}-${lpad(data.contractDay,2)}_${safeFio}.pdf`;
  console.log('filename', filename)
  // filename = 'document.pdf'

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });

}


async function generatePDF({pages}: { pages: string[] }) {
  console.log('trying to launch browser')

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-features=Vulkan',
      '--use-gl=swiftshader'
    ],
    // executablePath: '/usr/bin/chromium',  // Ensure Puppeteer uses system Chromium
  });

  console.log('browser ready')

  const page = await browser.newPage();

  console.log('page created')
  const htmlContent = `<html><head><style>
  body { padding: 20px; }
  @media print {
    .page, .page-break { break-after: page; }
    .page { margin-top: 10px; font-size: 10pt; }
}
</style></head><body>${pages.map(page => `<div class="page">${page}</div>`).join('')}</body></html>`;


  // Set content and generate PDF
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({format: "A4"});

  // const filePath = path.join(process.cwd(), "output2.pdf");
  // await fs.writeFileSync(filePath, pdfBuffer);

  // console.log("PDF saved to", filePath);

  console.log('pdf generated')
  // Close browser
  await browser.close();

  console.log('browser closed')

  // const pdfBuffer2 = fs.readFileSync(filePath);

  // console.log('pdf generated with size of', pdfBuffer2.length)

  return pdfBuffer

}
