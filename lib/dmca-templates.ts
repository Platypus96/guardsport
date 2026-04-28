export interface DMCAData {
  recipient: string
  subject: string
  body: string
}

export function getDMCATemplate(
  assetTitle: string, 
  assetUrl: string, 
  violationUrls: string[], 
  platform: string
): DMCAData {
  
  // Suggest the correct copyright email based on the platform
  let recipient = ''
  if (platform.toLowerCase() === 'youtube') recipient = 'copyright@youtube.com'
  else if (platform.toLowerCase() === 'twitter') recipient = 'copyright@twitter.com'
  else if (platform.toLowerCase() === 'reddit') recipient = 'legal@reddit.com'
  else if (platform.toLowerCase() === 'telegram') recipient = 'dmca@telegram.org'
  else if (platform.toLowerCase() === 'facebook') recipient = 'ip@fb.com'
  else if (platform.toLowerCase() === 'tiktok') recipient = 'copyright@tiktok.com'

  const subject = `Notice of Copyright Infringement - ${assetTitle}`

  const urlsText = violationUrls.map(url => `- ${url}`).join('\n')

  const body = `To whom it may concern,

This is a Notice of Copyright Infringement pursuant to the Digital Millennium Copyright Act (DMCA).

I am the copyright owner (or authorized to act on behalf of the copyright owner) of the following original content:
Title: ${assetTitle}
Original Source: ${assetUrl}

I have a good faith belief that the following URLs contain unauthorized reproductions of the copyrighted work:
${urlsText}

These reproductions are not authorized by the copyright owner, its agent, or the law.

I request that you immediately disable access to or remove the infringing material from your platform.

Under penalty of perjury, I state that the information in this notification is accurate and that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.

Sincerely,

[Your Name/Company]
[Your Contact Information]`

  return { recipient, subject, body }
}
