export default class Dialog extends webcore.component.builder() {
  static tag = 'dialog';
  constructor(){
    super();
    this.hook();
    this.event();
  }
  create(){
    this.template('<dialog><div><header></header><div class="main"><p></p></div><footer></footer></div></dialog>')
    .styles(
`:host{
  contain: content;
  font-size: inherit;
  color: inherit;
}
dialog {
  box-sizing: border-box;
  outline: none;
  padding: 0;
  color: inherit;
  border-width: 0;
  border-style: none;
  box-shadow: 0px 4px 15px 2px rgba(46,46,46,0.52);
}
dialog::backdrop {background-color: rgba(0,0,0,0.55);}
dialog > div {
  box-sizing: border-box;
  padding-block: 1em;
  max-height: 75dvh;
  display: flex;
  flex-direction: column;
}
.main {
  box-sizing: border-box;
  padding-inline: 1.35em;
  flex: auto;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
p {
  box-sizing: border-box;
  margin: 0;
  margin-top: 0.5em;
  min-height: 4em;
}
label {
  box-sizing: border-box;
  display: block;
  margin-block: 0.35em;
}
input {
  box-sizing: border-box;
  outline: none;
  margin-top: 0.5em;
  width: 100%;
  font-size: 1rem;
  padding: 0.6em;
  white-space: nowrap;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(204, 204, 204);
  border-radius: 0.22em;
}
input:focus{border-color: rgb(110, 168, 246);}
footer {
  box-sizing: border-box;
  margin-top: 1.2em;
  padding-inline: 1.2em;
  flex: none;
  display: flex;
  column-gap: 1em;
}
button {
  box-sizing: border-box;
  outline: none;
  appearance: none;
  font-size: inherit;
  padding-inline: 1.5em;
  line-height: 2em;
  border: none;
  border-radius: 0.2em;
}
button.none {display: none;}
button[value="true"] {color: white;background-color: rgb(64, 112, 202);}
button[value="false"] {color: black;background-color: rgb(223, 223, 223);}
@media all and (orientation: landscape) {
  dialog {
    min-width: 30.5em;
    max-width: 32%;
    border-radius: 0.25em;
  }
  footer {justify-content: flex-end;}
}
@media all and (orientation: portrait) {
  dialog {width: 80%;border-radius: 0.35em;}
  footer {justify-content: center;}
}
@media (hover: hover) and (pointer: fine) {
  button[value="true"]:hover{background-color: rgb(60, 99, 172);}
  button[value="false"]:hover {background-color: rgb(206, 206, 206);}
}
@media (hover: none) and (pointer: coarse) {
  button[value="true"]:active{background-color: rgb(60, 99, 172);}
  button[value="false"]:active {background-color: rgb(206, 206, 206);}
}`);
  }

  hook(){
    this.state.opened = false;
    this.state.loaded = false;
    this.state.confirm = false;
    this.resolve = null;

    this.element.main = this.querySelector('.main');
    this.element.header = this.querySelector('header');
    this.element.content = this.querySelector('p');

    const label = document.createElement("label");
    const span = document.createElement("span");
    const br = document.createElement("br");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "prompt");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("title", "请输入");
    label.append(span);
    label.append(br);
    label.append(input);
    this.element.title = span;
    this.element.input = input;
    this.element.label = label;

    const footer = this.querySelector('footer');
    this.element.footer = footer;

    this.button = Object.create(null);
    const cancel = document.createElement("button");
    cancel.setAttribute("type", "button");
    cancel.setAttribute("value", "false");
    cancel.textContent = "取消";
    footer.append(cancel);
    this.button.cancel = cancel;

    const confirm = document.createElement("button");
    confirm.setAttribute("type", "button");
    confirm.setAttribute("value", "true");
    confirm.textContent = "确认";
    footer.append(confirm);
    this.button.confirm = confirm;

    this.event();
  }


  event(){
    this.root.onkeydown = (event)=>{
      if (this.state.opened && event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        this.close(false);
      }
    };
    this.button.confirm.onclick = ()=>{
      if (this.state.confirm){
        this.close(this.element.input.value);
      } else {
        this.close(true);
      }
    };
    this.button.cancel.onclick = ()=>{this.close(false);};
  }


  // 公共方法
  close(value){
    this.element.input.blur();
    this.root.close();
    this.state.opened = false;
    if (this.resolve){
      this.resolve(value);
      this.resolve = null;
    }
    return value;
  }

  switch(state){
    if (!this.state.confirm && state){
      this.element.main.replaceChildren(this.element.label);
      this.state.confirm = true;
    } else if (this.state.confirm && !state) {
      this.element.main.replaceChildren(this.element.content);
      this.state.confirm = false;
    }
  }

  load(message){
    this.element.content.textContent = message;
    this.element.title.textContent = message;
    this.element.input.value = '';
    if (!this.state.loaded){
      document.body.append(this);
      this.state.loaded = true;
    }
    this.root.showModal();
    this.state.opened = true;
  }

  alert(message){
    this.button.cancel.classList.add("none");
    this.switch(false);
    this.load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }

  prompt(message){
    this.button.cancel.classList.remove("none");
    this.switch(false);
    this.load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }

  confirm(message = "请输入"){
    this.button.cancel.classList.remove("none");
    this.switch(true);
    this.load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }
}
