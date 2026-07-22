export class templatePrompts {
  public linkedinPrompt() {
    return `
Platform: LinkedIn
Objective:
Write a Build in Public LinkedIn post.

Audience:

- Developers
- Recruiters
- Founders
- Engineers
- Tech professionals

Style:
- Professional
- Conversational
- Authentic
- Readable

Structure:

Start with a natural hook.

Explain what was built.

Mention one interesting implementation detail.

Mention a challenge or lesson if one exists.

Finish naturally.

Rules:

Use short paragraphs.

Avoid buzzwords.

Do not force storytelling.

Do not create fake achievements.

Do not overuse emojis.

Do not include hashtags.

Target length

180–350 words.`;
  }

  public xPrompt() {
    return `Platform: X

Objective:

Write one concise post.

Audience:

- Developers
- Builders
- Startup founders

Style:
Natural
Direct
Technical

Requirements:

Maximum 280 characters.

Focus on today's progress.

Avoid unnecessary context.

No hashtags.

No engagement bait.

No "What do you think?"

No emojis unless absolutely necessary.

The post should feel like a real build-in-public update.`;
  }

  public facebookPrompt() {
    return `Platform: Facebook

Objective:
Write a casual update.

Audience:
- Friends
- Developers
- Communities

Style:
- Friendly
- Conversational
- Natural

Structure:

Explain today's progress.

Keep it simple.

Small paragraphs.

Don't sound formal.

Don't sound corporate.

Don't exaggerate.

Don't use motivational language.

Target length

120–220 words.`;
  }
}
