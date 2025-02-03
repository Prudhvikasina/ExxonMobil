import { Component, Input, OnInit } from '@angular/core';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx'; // Import docx library
import { TopicserviceService } from '../../dashboard/services/topicservice.service';
import { lastValueFrom } from 'rxjs';
import * as fs from 'file-saver';
import { jsPDF } from 'jspdf';
import { marked } from 'marked'
import * as pdfLib from 'pdf-lib';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'app-document-generator',
  templateUrl: './document-generator.component.html',
  styleUrls: ['./document-generator.component.scss']
})
export class DocumentGeneratorComponent implements OnInit {
  chatMessages: any[] = [];
  @Input() userId: number = 1;
  @Input() topicId: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageNumber: number = 1;
  @Input() sortbydate: string = "LATEST";
  @Input() topicName: string = '';
  @Input() type: string = 'PDF';

  constructor(private topicservice: TopicserviceService) {}

  async ngOnInit(): Promise<void> {}

 



  private async fetchLiveHistory(): Promise<void> {
    const response = await lastValueFrom(this.topicservice.getLiveHistory(
      this.userId,
      this.topicId,
      this.pageSize,
      this.pageNumber,
      this.sortbydate
    ));

    this.chatMessages = response.map((item: any) => {
      const senderName = `${item.FirstName}.${item.LastName}`;

      const imageArray = item.img
          ? Object.values(item.img) // Extract all dictionary values
          : [];
      return [
        {
          sender: senderName,
          text: item.Question,
          time: item.CreatedOn,
          aliasName: item.AliasName,
          images: imageArray,
          TopicquestionanwserId: item.TopicquestionanwserId,
          Question:true

        },
        {
          sender: 'Copilot',
          text: this.processText(item.Answer),
          time: item.CreatedOn,
          TopicquestionanwserId: item.TopicquestionanwserId,
          images: imageArray,
          Question:false
        }
      ];
    }).flat();
  }

  private async fetchLiveHistory1(TopicquestionanwserId: number): Promise<void> {
    const response = await lastValueFrom(this.topicservice.getLiveHistory(
      this.userId,
      this.topicId,
      this.pageSize,
      this.pageNumber,
      this.sortbydate
    ));
  
    // Process the response
    this.chatMessages = response
      .filter((item: any) => item.TopicquestionanwserId === TopicquestionanwserId)
      .map((item: any) => {
        const senderName = `${item.FirstName}.${item.LastName}`;
  
        // Convert the images dictionary into an array of base64 strings
        const imageArray = item.img
          ? Object.values(item.img) // Extract all dictionary values
          : [];

  
        return [
          {
            sender: senderName,
            text: item.Question,
            time: item.CreatedOn,
            aliasName: item.AliasName,
            images: imageArray, // Use the processed image array
            TopicquestionanwserId: item.TopicquestionanwserId,
            Question:true
          },
          {
            sender: 'Copilot',
            text: this.processText(item.Answer),
            time: item.CreatedOn,
            TopicquestionanwserId: item.TopicquestionanwserId,
            images: imageArray, // Use the processed image array
            Question:false
          }
        ];
      })
      .flat(); 
      console.log(this.chatMessages)// Flatten to get a single array of messages
  }
  
  private processText(message: string): string {
   

    // Process and transform input message to handle formatting and LaTeX rendering
    const processedMessage = message
        // Bold formatting using double asterisks
        .replace(/\*\*(.*?)\*\*\:/g, '$1:')
        
        // Special text formatting for hyphen-prefixed lines
        .replace(/-(.+?):/g, '$1:')
        
        // Render LaTeX math content
        // .replace(/\$(.+?)\$/g, (match, p1) => `<span class="latex">$${p1}$</span>`)
        
        // Hyperlinks to documents
        // .replace(/\[doc(\d+)\]/g, (match, docId) => {
        //     return `<a href="/documents/${docId}" target="_blank">Document ${docId}</a>`;
        // })
        
        // Block code snippets, stripping out "```html" for clean rendering
        .replace(/```html([\s\S]*?)```/g, '$1');

    return  processedMessage;
}


  private async base64ToBuffer(base64: string): Promise<Uint8Array | null> {
    try {
      const response = await fetch(`data:image/png;base64,${base64}`);
      const blob = await response.blob();
      return new Uint8Array(await blob.arrayBuffer());
    } catch (error) {
      console.error("Error converting base64 to buffer:", error);
      return null;
    }
  }

  async generateWord(topic_name:string) {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(topic_name)],
            }),
            ...await this.createParagraphsWithImages(),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    
      fs.saveAs(blob, `${topic_name}.docx`);
      

    
    
  }

  private async createParagraphsWithImages() {
    const paragraphs = [];
    const addedImages = new Set();  // Set to keep track of added images
    for (const message of this.chatMessages) {
      // Add sender and message text
      paragraphs.push(new Paragraph({
        children: [new TextRun(`${message.sender}: ${message.text}`)],
      }));

      // Add images (if any), but ensure no duplicates
      for (const imageSrc of message.images) {
        if (!addedImages.has(imageSrc)) {
          const imageBuffer = await this.base64ToBuffer(imageSrc);
          if (imageBuffer) {
            paragraphs.push(new Paragraph({
              children: [new ImageRun({ data: imageBuffer, transformation: { width: 500, height: 500 }, type: 'png' })],
            }));
            addedImages.add(imageSrc);  // Track the added image to prevent duplicates
          } else {
            console.warn("Skipping invalid image.");
          }
        }
      }
    }
    return paragraphs;
  }

  // private stripHtml(html: string): string {
  //   const tmp = document.createElement('div');
  //   tmp.innerHTML = html;
  //   return tmp.textContent || tmp.innerText || '';
  // }

  // async generatePDF(topicName: string): Promise<void> {
  //   try {
  //     const pdfDoc = await PDFDocument.create();
  //     let page = pdfDoc.addPage([600, 800]); // Define a page size
  //     let yPosition = 750; // Starting y-position for content
  //     const margin = 50; // Left margin
  
  //     // Title Section
  //     page.drawText(topicName, {
  //       x: margin,
  //       y: yPosition,
  //       size: 18,
  //       color: pdfLib.rgb(0, 0.53, 0.8),
  //     });
  //     yPosition -= 40; // Add spacing below the title
  
  //     // Loop through chat messages
  //     for (const message of this.chatMessages) {
  //       // Extract and handle table and text separately
  //       let messageText = message.text;
  
  //       // If the message contains a table, we need to extract the table part
  //       if (messageText.includes('<table>')) {
  //         const tableHtml = this.extractTable(messageText);
  //         const tableData = this.parseHtmlTable(tableHtml);
  //         this.renderTableToPdf(page, tableData, yPosition, margin);
  //         // Adjust yPosition after the table
  //         yPosition -= (tableData.length * 20) + 20;
  //         // Remove the table portion from the messageText
  //         messageText = messageText.replace(tableHtml, '');
  //       }
  
  //       // Handle the remaining regular message text
  //       const textLines = this.splitTextIntoLines(messageText, 500); // Ensure text fits within the page width
  
  //       for (const line of textLines) {
  //         // Check if there's enough space for text, otherwise create a new page
  //         if (yPosition < 50) {
  //           page = pdfDoc.addPage([600, 800]);
  //           yPosition = 750;
  //         }
  //         page.drawText(line, {
  //           x: margin,
  //           y: yPosition,
  //           size: 12,
  //           color: pdfLib.rgb(0, 0, 0),
  //         });
  //         yPosition -= 20; // Line spacing
  //       }
  
  //       // Add Images if Present
  //       for (const imageSrc of message.images) {
  //         const imageBuffer = await this.base64ToBuffer(imageSrc);
  //         if (imageBuffer) {
  //           const image = await pdfDoc.embedPng(imageBuffer);
  //           const { width, height } = image.scale(0.25); // Adjust image size
  
  //           // Ensure image fits, otherwise create a new page
  //           if (yPosition - height < 50) {
  //             page = pdfDoc.addPage([600, 800]);
  //             yPosition = 750;
  //           }
  
  //           page.drawImage(image, {
  //             x: margin,
  //             y: yPosition - height,
  //             width,
  //             height,
  //           });
  //           yPosition -= height + 20; // Add space below the image
  //         } else {
  //           console.warn("Skipping invalid image.");
  //         }
  //       }
  
  //       yPosition -= 10; // Add spacing between messages
  //     }
  
  //     // Save and Download the PDF
  //     const pdfBytes = await pdfDoc.save();
  //     const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  //     fs.saveAs(pdfBlob, `${topicName}.pdf`);
  //   } catch (error) {
  //     console.error("Error generating PDF:", error);
  //   }
  // }
  
  // // Helper method to extract the table from the HTML message
  // private extractTable(html: string): string {
  //   const tableStartIndex = html.indexOf('<table>');
  //   const tableEndIndex = html.indexOf('</table>') + 8; // Add 8 to include </table> tag
  //   return html.slice(tableStartIndex, tableEndIndex);
  // }
  
  // // Helper method to parse the HTML table
  // private parseHtmlTable(html: string): string[][] {
  //   const tableData: string[][] = [];
  //   const rows = html.match(/<tr>(.*?)<\/tr>/g); // Match all <tr> elements
  
  //   if (rows) {
  //     rows.forEach((row) => {
  //       const cells = row.match(/<td>(.*?)<\/td>/g); // Match all <td> elements inside the row
  //       if (cells) {
  //         const rowData = cells.map((cell) => {
  //           return cell.replace(/<td>|<\/td>/g, '').trim(); // Remove <td> tags and trim the text
  //         });
  //         tableData.push(rowData);
  //       }
  //     });
  //   }
  
  //   return tableData;
  // }
  
  // // Helper method to render the parsed table data to PDF
  // private renderTableToPdf(page: pdfLib.PDFPage, tableData: string[][], yPosition: number, margin: number) {
  //   const columnWidth = 100;
  //   const rowHeight = 20;
  
  //   // Draw the table header
  //   const headers = tableData[0];
  //   headers?.forEach((header, colIndex) => {
  //     page.drawText(header, {
  //       x: margin + colIndex * columnWidth,
  //       y: yPosition,
  //       size: 12,
  //       color: pdfLib.rgb(0, 0, 0),
  //     });
  //   });
  //   yPosition -= rowHeight;
  
  //   // Draw the table rows
  //   tableData?.slice(1)?.forEach((row) => {
  //     row?.forEach((cell, colIndex) => {
  //       page.drawText(cell, {
  //         x: margin + colIndex * columnWidth,
  //         y: yPosition,
  //         size: 10,
  //         color: pdfLib.rgb(0, 0, 0),
  //       });
  //     });
  //     yPosition -= rowHeight;
  //   });
  // }
  
  // // Helper method to split the text into lines based on max width
  // private splitTextIntoLines(text: string, maxWidth: number): string[] {
  //   const words = text?.split(" ");
  //   const lines: string[] = [];
  //   let currentLine = "";
  
  //   words?.forEach((word) => {
  //     const testLine = currentLine ? `${currentLine} ${word}` : word;
  //     // Estimate text width (adjust based on font size and type)
  //     const testLineWidth = testLine.length * 6; // Approx. 6px per character
  //     if (testLineWidth > maxWidth) {
  //       lines.push(currentLine);
  //       currentLine = word;
  //     } else {
  //       currentLine = testLine;
  //     }
  //   });
  
  //   if (currentLine) {
  //     lines.push(currentLine);
  //   }
  
  //   return lines;
  // }
  async generateDocument(type: string, topicId: number, topicName: string, userId: number) {
    this.topicId = topicId;
    this.topicName = topicName;
    this.userId = userId;
    await this.fetchLiveHistory();
    console.log(this.chatMessages)
    

    if (type.toLowerCase() === 'pdf') {
      await this.openInNewPopupAsPDF(topicName)
      // await this.openAndDownloadPDF(topicName)
      // await this.openInNewTabAsPDF1(topicName)
      // await this.generatePDF(topicName)
    }else {
      await this.generateWord(topicName);
    }
  }
  async generateDocumentchatlevel( topicId: number, userId: number,TopicquestionanwserId:number,topicName:string) {
   try{
    this.topicId = topicId;
    this.topicName = topicName
    this.userId = userId;
    await this.fetchLiveHistory1(TopicquestionanwserId);
    console.log()
   
    // console.log(this.chatMessages)
    
    
    
      // await this.generatePDF(topicName)
        await this.openInNewPopupAsPDF(this.topicName)
      
    
  }
  catch(e){
    console.error(e)

  }




}

async openInNewPopupAsPDF(topicName: string): Promise<void> {
  try {
    // Create the base HTML structure with MathJax integration
    const newPopupContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${topicName}</title>
        <script type="text/javascript" id="MathJax-script" async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
        </script>
        <script>
        window.MathJax = {
            tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            svg: { fontCache: 'global' }
        };
        </script>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            color: #007acc;
            text-align: center;
          }
          .message {
            margin-bottom: 20px;
            padding: 10px;
            border-radius: 8px;
          }
          .heading {
            color:#007acc;
          }
          .question {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .headinganswer {
            color: #007acc;
          }
          .answer {
            margin-bottom: 20px;
          }
          .chat-image {
            display: block;
            margin: 10px auto;
            max-width: 80%;
            height: auto;
          }

          /* Table Styles */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>${topicName}</h1>
        <div id="content"></div>
        
        <script>
          window.onload = async function() {
            // Wait for MathJax to finish rendering all equations
            await MathJax.typesetPromise();

             window.onafterprint = function() {
              window.close(); // Close the popup window after print or cancel
            };

            // Wait for 1 second before triggering the print dialog
            setTimeout(() => {
              window.print(); // This will trigger the print dialog in Chrome
            }, 1000); // 1000ms = 1 second
          };
        </script>
      </body>
      </html>
    `;

    // Open a new popup window with specified dimensions
    const popupWindow = window.open('', '', 'width=800,height=600,resizable,scrollbars');
    if (!popupWindow) {
      console.error("Failed to open a popup window. Check popup blockers.");
      return;
    }

    // Inject content dynamically
    const doc = popupWindow.document;
    doc.open();
    doc.write(newPopupContent);
    doc.close();

    // Add messages to the content
    const contentDiv = doc.getElementById('content');
    if (contentDiv) {
      for (const message of this.chatMessages) {
        const messageDiv = doc.createElement('div');
        messageDiv.className = 'message';

        // Check if the message is a question or an answer
        if (message.Question) {
          messageDiv.classList.add('question');
          messageDiv.innerHTML = `<strong class="heading">Question:</strong> ${message.text}`;
        } else {
          messageDiv.classList.add('answer');
          
          // Convert Markdown if present
          const convertedHtml = marked(message.text);
          messageDiv.innerHTML = `<strong class="headinganswer">Answer:</strong> ${convertedHtml}`;
        }

        // Add images (if any)
        if (message.images && message.images.length > 0) {
          for (const imageUrl of message.images) {
            console.log(message)
            let imgSrc = this.getFormattedImageSrc(imageUrl); // Use the new method

            const img = doc.createElement('img');
            img.src = imgSrc;
            img.alt = 'Chat image';
            img.className = 'chat-image';
            messageDiv.appendChild(img);
          }
        }

        // Check if the message has HTML table syntax
        // if (message.text.includes('<table>')) {
        //   const tableDiv = doc.createElement('div');
        //   tableDiv.className = 'table-container';
        //   tableDiv.innerHTML = message.text; // Directly insert the table HTML
        //   messageDiv.appendChild(tableDiv);
        // }

        contentDiv.appendChild(messageDiv);
      }
    }

    console.log(`Rendered content for topic: "${topicName}" in a popup window.`);
  } catch (error) {
    console.error("Error opening popup as PDF:", error);
  }
}

// Ensure the image source has the correct base64 prefix
getFormattedImageSrc(imageData: string): string {
  if (!imageData) {
    return '';
  }
  // Check if the image already includes the base64 prefix
  return imageData.startsWith('data:image/webp;base64,') 
    ? imageData 
    : `data:image/webp;base64,${imageData}`;
}

// async openInNewPopupAsPDF(topicName: string): Promise<void> {
//   try {
//     // Create the base HTML structure with MathJax integration
//     const newPopupContent = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <title>${topicName}</title>
//         <script type="text/javascript" id="MathJax-script" async
//           src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
//         </script>
//         <script>
//         window.MathJax = {
//             tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
//             svg: { fontCache: 'global' }
//         };
//         </script>
//         <style>
//           body {
//             font-family: Arial, sans-serif;
//             margin: 20px;
//           }
//           h1 {
//             color: #007acc;
//             text-align: center;
//           }
//           .message {
//             margin-bottom: 20px;
//             padding: 10px;
//             border-radius: 8px;
//           }
//           .heading {
//             color:#007acc;
//           }
//           .question {
//             font-weight: bold;
//             margin-bottom: 10px;
//           }
//           .headinganswer {
//             color: #007acc;
//           }
//           .answer {
//             margin-bottom: 20px;
//           }
//           .chat-image {
//             display: block;
//             margin: 10px auto;
//             max-width: 80%;
//             height: auto;
//           }

//           /* Table Styles */
//           table {
//             width: 100%;
//             border-collapse: collapse;
//             margin-bottom: 20px;
//           }
//           th, td {
//             padding: 10px;
//             border: 1px solid #ddd;
//             text-align: left;
//           }
//           th {
//             background-color: #f2f2f2;
//           }
//         </style>
//       </head>
//       <body>
//         <h1>${topicName}</h1>
//         <div id="content"></div>
        

//         <script>
//           window.onload = async function() {
//             // Wait for MathJax to finish rendering all equations
//             await MathJax.typesetPromise();

//              window.onafterprint = function() {
//               window.close(); // Close the popup window after print or cancel
//             };

//             // Wait for 1 second before triggering the print dialog
//             setTimeout(() => {
//               window.print(); // This will trigger the print dialog in Chrome
//             }, 1000); // 1000ms = 1 second


//           };
//         </script>
//       </body>
//       </html>
//     `;

//     // Open a new popup window with specified dimensions
//     const popupWindow = window.open('', '', 'width=800,height=600,resizable,scrollbars');
//     if (!popupWindow) {
//       console.error("Failed to open a popup window. Check popup blockers.");
//       return;
//     }

//     // Inject content dynamically
//     const doc = popupWindow.document;
//     doc.open();
//     doc.write(newPopupContent);
//     doc.close();

//     // Add messages to the content
//     const contentDiv = doc.getElementById('content');
//     if (contentDiv) {
//       for (const message of this.chatMessages) {
//         const messageDiv = doc.createElement('div');
//         messageDiv.className = 'message';

//         // Check if the message is a question or an answer
//         if (message.Question) {
//           messageDiv.classList.add('question');
//           messageDiv.innerHTML = `<strong class="heading">Question:</strong> ${message.text}`;
//         } else {
//           messageDiv.classList.add('answer');
          
//           // Convert Markdown if present
//           const convertedHtml = marked(message.text);
//           messageDiv.innerHTML = `<strong class="headinganswer">Answer:</strong> ${convertedHtml}`;
//         }

//         // Add images (if any)
//         if (message.images.length > 0) {
//           for (const imageUrl of message.images) {
//             const img = doc.createElement('img');
//             img.src = imageUrl;
//             img.alt = 'Chat image';
//             img.className = 'chat-image';
//             messageDiv.appendChild(img);
//           }
//         }

//         // Check if the message has HTML table syntax
//         if (message.text.includes('<table>')) {
//           const tableDiv = doc.createElement('div');
//           tableDiv.className = 'table-container';
//           tableDiv.innerHTML = message.text; // Directly insert the table HTML
//           messageDiv.appendChild(tableDiv);
//         }

//         contentDiv.appendChild(messageDiv);
//       }
//     }

//     console.log(`Rendered content for topic: "${topicName}" in a popup window.`);
//   } catch (error) {
//     console.error('Error rendering content in a popup window:', error);
//   }
// }

async openAndDownloadPDF(topicName: string): Promise<void> {
  try {
    // Create the base HTML structure with MathJax integration
    const newTabContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${topicName}</title>
        <script type="text/javascript" id="MathJax-script" async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js">
        </script>
        <script>
        window.MathJax = {
            tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
            svg: { fontCache: 'global' }
        };
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js"></script>
       <style>
  body {
    font-family: Arial, sans-serif;
    margin: 20px;
    max-width: 800px; /* Adjust width for your needs */
    overflow-x: hidden; /* Prevent horizontal scrollbars */
    word-wrap: break-word; /* Allow long words to break */
  }
  h1 {
    color: #007acc;
    text-align: center;
  }
  .message {
    margin-bottom: 20px;
    padding: 10px;
    border-radius: 8px;
  }
  .heading {
    color: #007acc;
  }
  .question {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .headinganswer {
    color: #007acc;
  }
  .answer {
    margin-bottom: 20px;
    word-wrap: break-word; /* Handle LaTeX or long content gracefully */
  }
  .chat-image {
    display: block;
    margin: 10px auto;
    max-width: 100%; /* Ensure images fit within container */
    height: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th, td {
    padding: 10px;
    border: 1px solid #ddd;
    text-align: left;
    word-wrap: break-word; /* Ensure table cells don't overflow */
  }
  th {
    background-color: #f2f2f2;
  }
</style>

      </head>
      <body>
        <h1>${topicName}</h1>
        <div id="content"></div>

        <script>
          async function generatePDF() {
            const content = document.getElementById('content');
            if (!content) return;

            // Convert content to PDF

           

            const opt = {
              margin: 1,
              filename: '${topicName}.pdf',
              html2canvas: { scale: 2 },
              jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };

             // Wait for MathJax to render equations
            html2pdf().set(opt).from(content).save(); // Trigger PDF download
          }

          // Wait for the page to fully load and render
          window.onload = generatePDF;
        </script>
      </body>
      </html>
    `;

    // Open a new tab
    const newTab = window.open();
    if (!newTab) {
      console.error("Failed to open a new tab. Check popup blockers.");
      return;
    }

    // Inject content dynamically
    const doc = newTab.document;
    doc.open();
    doc.write(newTabContent);
    doc.close();

    // Add messages to the content
    const contentDiv = doc.getElementById('content');
    if (contentDiv) {
      for (const message of this.chatMessages) {
        const messageDiv = doc.createElement('div');
        messageDiv.className = 'message';

        // Check if the message is a question or an answer
        if (message.Question) {
          messageDiv.classList.add('question');
          messageDiv.innerHTML = `<strong class="heading">Question:</strong> ${message.text}`;
        } else {
          messageDiv.classList.add('answer');
          
          // Convert Markdown if present
          const convertedHtml = marked(message.text);
          messageDiv.innerHTML = `<strong class="headinganswer">Answer:</strong> ${convertedHtml}`;
        }

        // Add images (if any)
        if (message.images.length > 0) {
          for (const imageUrl of message.images) {
            const img = doc.createElement('img');
            img.src = imageUrl;
            img.alt = 'Chat image';
            img.className = 'chat-image';
            messageDiv.appendChild(img);
          }
        }

        // Check if the message has HTML table syntax
        if (message.text.includes('<table>')) {
          const tableDiv = doc.createElement('div');
          tableDiv.className = 'table-container';
          tableDiv.innerHTML = message.text; // Directly insert the table HTML
          messageDiv.appendChild(tableDiv);
        }

        contentDiv.appendChild(messageDiv);
      }
    }

    console.log(`Rendered content for topic: "${topicName}" in a new tab and triggered PDF download.`);
  } catch (error) {
    console.error('Error rendering content in a new tab:', error);
  }
}



}




