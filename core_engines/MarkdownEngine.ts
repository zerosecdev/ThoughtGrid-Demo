// core_engines/MarkdownEngine.ts

/**
 * THE TEXT TRANSFORMER
 * This class takes raw text from a user and converts it into safe HTML 
 * for the feed. It handles standard stuff like **bold** but also 
 * special ThoughtGrid features like custom colors and @mentions.
 */

export class MarkdownEngine {
  /**
   * parse:
   * The main loop that cleans and styles the text.
   */
  static parse(text: string | null | undefined): string {
    if (!text) return '';

    let html = text;
    const vault: Record<string, string> = {};
    let vaultId = 0;

    // --- 1. THE SECURITY SHIELD ---
    // We strip out any raw HTML tags. This prevents hackers from 
    // trying to inject their own scripts into our feed (XSS).
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    /**
     * --- 2. THE VAULT (PROTECTION) ---
     * Some blocks of text (like code snippets) shouldn't be touched by 
     * our other rules. We "Vault" them—replace them with a temporary ID 
     * so the rest of the script ignores them, and we put them back at the end.
     */
    
    // Protect code blocks (```text```)
    html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
      const id = `__CODE_BLOCK_${vaultId++}__`;
      vault[id] = `<pre class="tg-code-box"><code>${code.trim()}</code></pre>`;
      return id;
    });
    // Protect Shared Signal cards
    // Syntax: [Shared Post from @name](id)
    html = html.replace(/\[Shared Signal from @(.*?)\]\((.*?)\)/g, (_, author, postId) => {
      const id = `__SHARED_POST_${vaultId++}__`;
      vault[id] = `
        <div class="tg-share-card" onclick="window.router.setView('post-detail', '${postId}')">
          <div class="tg-share-label">Shared Signal</div>
          <p class="tg-share-author">Originally from @${author}</p>
        </div>`;
      return id;
    });

    /**
     * --- 3. SOCIAL & COLOR TRANSFORMS ---
     * This is where we handle the fun social features.
     */
    // Custom Color Injection
    // Syntax: [Colored Text](color:#hex)
    html = html.replace(/\[(.*?)\]\(color:(.*?)\)/g, (_, word, hex) => {
      return `<span style="color: ${hex.trim()} !important; font-weight: 800;">${word}</span>`;
    });
    // Neural Links (@Mentions)
    // Turns @username into a clickable link that jumps to their profile.
    html = html.replace(
      /(^|\s)@([a-zA-Z0-9_]+)/g, 
      `$1<a href="#" onclick="window.dispatchEvent(new CustomEvent('tg-profile', {detail: '$2'})); return false;" class="tg-mention">@$2</a>`
    );
    // Hashtags (#Topic)
    // Turns #topic into a clickable link that opens the search page.
    html = html.replace(
      /(^|\s)#([a-zA-Z0-9_]+)/g, 
      `$1<a href="#" onclick="window.dispatchEvent(new CustomEvent('tg-search', {detail: '$2'})); return false;" class="tg-hashtag">#$2</a>`
    );
    
    // Standard Styles
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="tg-bold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="tg-italic">$1</em>');
    // Handle new lines
    html = html.replace(/\n/g, '<br/>');

    /**
     * --- 4. REHYDRATION ---
     * Now we take the protected blocks out of the Vault and put 
     * them back into the final HTML.
     */
    Object.keys(vault).forEach(id => {
      html = html.replace(id, vault[id]);
    });

    return html;
  }
}
