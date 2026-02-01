/**
 * Utility to copy text to the clipboard.
 * Uses a fallback method for environments where navigator.clipboard might be restricted.
 */
export const copyToClipboard = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Ensure the textarea is not visible
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  
  textArea.focus();
  textArea.select();
  
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  
  document.body.removeChild(textArea);
  return success;
};