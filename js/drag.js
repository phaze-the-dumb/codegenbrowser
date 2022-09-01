let zIndexCount = 10;

let dragElement = (elmnt, header) => {
    let dragMouseDown = (e) => {
        elmnt.style.zIndex = zIndexCount + 1;
        zIndexCount++;

        e = e || window.event;
        e.preventDefault();

        pos3 = e.clientX;
        pos4 = e.clientY;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
  
    let elementDrag = (e) => {
        e = e || window.event;
        e.preventDefault();

        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
  
    let closeDragElement = () => {
        document.onmouseup = null;
        document.onmousemove = null;
    }

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (header) {
        header.onmousedown = dragMouseDown;
        elmnt.onmousedown = () => {
            elmnt.style.zIndex = zIndexCount + 1;
            zIndexCount++;
        }
    } else {
        elmnt.onmousedown = dragMouseDown;
    }
}