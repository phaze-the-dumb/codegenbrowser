class Win{
    constructor(title, width = 350){
        this.div = document.createElement('div');
        this.header = document.createElement('div');
        this.content = document.createElement('div');
        this.closeBtn = document.createElement('div');
        this.yeeted = false;

        this.closeBtn.style.position = 'absolute';
        this.closeBtn.style.top = '7px';
        this.closeBtn.style.cursor = 'pointer';
        this.closeBtn.style.userSelect = 'none';
        this.closeBtn.style.right = '10px';
        this.closeBtn.innerHTML = 'X';

        this.closeBtn.onclick = () => this.yeet();

        this.div.classList.add('window');
        this.header.classList.add('window-draggable');
        this.content.classList.add('window-content');

        dragElement(this.div, this.header);

        this.div.appendChild(this.header);
        this.div.appendChild(this.content);
        this.div.appendChild(this.closeBtn);
        document.body.appendChild(this.div);

        this.header.innerHTML = title;
        this.div.style.width = width + 'px';
    }
    setTitle(title){
        this.header.innerHTML = title;
    }
    yeet(){
        this.div.style.opacity = '0';
        this.yeeted = true;
        
        setTimeout(() => {
            this.div.remove();
            this.header.remove();
            this.content.remove();
        }, 250);
    }
}