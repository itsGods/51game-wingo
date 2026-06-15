import { tokenParent } from "./elements.js";
import { getLastResult } from "./gameEngine.js";

export function colorTokens() {
    const parentDiv = tokenParent;
    const num = getLastResult();

    if (num === null || num === undefined || !parentDiv) return;

    const newDiv = document.createElement('div');
    newDiv.setAttribute("data-v-3e4c6499", "");
    newDiv.classList.add(`n${num}`);

    parentDiv.insertBefore(newDiv, parentDiv.firstChild);

    // Keep only the last 4 tokens visible
    while (parentDiv.children.length > 4) {
        parentDiv.removeChild(parentDiv.lastElementChild);
    }
}
