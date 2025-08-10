interface EmailDesign {
  subject: string;
  preheader?: string;
  template: 'modern' | 'classic' | 'minimal' | 'newsletter';
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
    };
  };
  layout: {
    width: number;
    padding: number;
    borderRadius: number;
  };
  header?: {
    logo?: string;
    title?: string;
    subtitle?: string;
  };
  footer?: {
    companyName: string;
    address?: string;
    unsubscribeLink: boolean;
  };
}

interface EmailContent {
  blocks: EmailBlock[];
}

interface EmailBlock {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'button' | 'divider' | 'spacer';
  content: {
    text?: string;
    html?: string;
    src?: string;
    alt?: string;
    url?: string;
    buttonText?: string;
    height?: number;
    alignment?: 'left' | 'center' | 'right';
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    padding?: number;
    margin?: number;
  };
  styles?: {
    [key: string]: any;
  };
}

export async function generateEmailHTML(design: EmailDesign, content: EmailContent): Promise<string> {
  const { colors, fonts, layout } = design;
  
  // Base styles
  const baseStyles = `
    <style>
      body { margin: 0; padding: 0; font-family: ${fonts.body}; background-color: #f4f4f4; }
      .email-container { max-width: ${layout.width}px; margin: 0 auto; background: ${colors.background}; border-radius: ${layout.borderRadius}px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .email-header { text-align: center; padding: 40px 20px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; }
      .email-content { padding: ${layout.padding}px; }
      .email-footer { text-align: center; padding: 20px; background: #f8f9fa; border-top: 1px solid #e9ecef; margin-top: 30px; }
      .logo { max-height: 60px; margin-bottom: 10px; }
      .header-title { margin: 0; font-family: ${fonts.heading}; font-size: ${fonts.size.heading}px; font-weight: 600; }
      .header-subtitle { margin: 5px 0 0; opacity: 0.9; }
      .content-block { margin-bottom: 20px; }
      .button { background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
      .divider { border: none; height: 1px; background: ${colors.secondary}; margin: 20px 0; }
      .spacer { height: 20px; }
      .footer-text { margin: 0; font-size: 14px; color: #6c757d; }
      .footer-address { margin: 5px 0; font-size: 12px; color: #6c757d; }
      .footer-unsubscribe { margin: 5px 0; font-size: 12px; }
      .footer-unsubscribe a { color: #6c757d; text-decoration: none; }
    </style>
  `;
  
  // Header HTML
  const headerHTML = design.header ? `
    <div class="email-header">
      ${design.header.logo ? `<img src="${design.header.logo}" alt="Logo" class="logo">` : ''}
      ${design.header.title ? `<h1 class="header-title">${design.header.title}</h1>` : ''}
      ${design.header.subtitle ? `<p class="header-subtitle">${design.header.subtitle}</p>` : ''}
    </div>
  ` : '';

  // Content HTML
  const contentHTML = content.blocks.map(block => {
    const { content: blockContent } = block;
    const styles = `
      text-align: ${blockContent.alignment || 'left'};
      font-size: ${blockContent.fontSize || 16}px;
      font-weight: ${blockContent.fontWeight || 'normal'};
      color: ${blockContent.color || colors.text};
      padding: ${blockContent.padding || 0}px;
      margin: ${blockContent.margin || 10}px 0;
      background-color: ${blockContent.backgroundColor || 'transparent'};
    `;

    switch (block.type) {
      case 'text':
        return `<div class="content-block" style="${styles}">${blockContent.html || blockContent.text || ''}</div>`;
      
      case 'image':
        return `<div class="content-block" style="${styles}">
          <img src="${blockContent.src}" alt="${blockContent.alt || ''}" style="max-width: 100%; height: auto;">
        </div>`;
      
      case 'video':
        return `<div class="content-block" style="${styles}">
          <video controls style="max-width: 100%; height: auto;">
            <source src="${blockContent.src}" type="video/mp4">
            Your email client doesn't support video playback.
          </video>
        </div>`;
      
      case 'audio':
        return `<div class="content-block" style="${styles}">
          <audio controls style="width: 100%;">
            <source src="${blockContent.src}" type="audio/mpeg">
            Your email client doesn't support audio playback.
          </audio>
        </div>`;
      
      case 'button':
        return `<div class="content-block" style="${styles}">
          <a href="${blockContent.url}" class="button" style="background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            ${blockContent.buttonText || 'Click Here'}
          </a>
        </div>`;
      
      case 'divider':
        return `<hr class="divider" style="border: none; height: 1px; background: ${colors.secondary}; margin: ${blockContent.margin || 20}px 0;">`;
      
      case 'spacer':
        return `<div class="spacer" style="height: ${blockContent.height || 20}px;"></div>`;
      
      default:
        return '';
    }
  }).join('');

  // Footer HTML
  const footerHTML = design.footer ? `
    <div class="email-footer">
      <p class="footer-text">${design.footer.companyName}</p>
      ${design.footer.address ? `<p class="footer-address">${design.footer.address}</p>` : ''}
      ${design.footer.unsubscribeLink ? `<p class="footer-unsubscribe"><a href="{unsubscribeUrl}">Unsubscribe</a></p>` : ''}
    </div>
  ` : '';

  // Complete HTML
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${design.subject}</title>
      ${baseStyles}
    </head>
    <body>
      ${design.preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${design.preheader}</div>` : ''}
      <div class="email-container">
        ${headerHTML}
        <div class="email-content">
          ${contentHTML}
        </div>
        ${footerHTML}
      </div>
    </body>
    </html>
  `;
}

export { generateEmailHTML as default };