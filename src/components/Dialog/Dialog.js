export default class Dialog extends webcore.component.builder {
  static tag = 'dialog';

  create(){
    this.template('<dialog><div><header></header><main><p></p></main><footer></footer></div></dialog>')
    .styles("/src/components/Dialog/Dialog.css")
    .mode("closed")
  }

  onCreated(){
    this.state.opened = false;
    this.state.loaded = false;
    this.state.confirm = false;
    this.resolve = null;

    this.element = {
      dialog: this.querySelector('dialog'),
      main: this.querySelector('main'),
      header: this.querySelector('header'),
      content: this.querySelector('p'),
    };

    const label = document.createElement("label");
    const span = document.createElement("span");
    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "prompt");
    input.setAttribute("autocomplete", "off");
    input.setAttribute("title", "请输入");
    label.append(span);
    label.append(document.createElement("br"));
    label.append(input);
    this.element.title = span;
    this.element.input = input;
    this.element.label = label;

    const footer = this.querySelector('footer');
    this.element.footer = footer;

    this.button = Object.pure();
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
  }


  onBeforeMount(){
    this.element.dialog.onkeydown = (event)=>{
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


  // 私有方法
  #switch(state){
    if (!this.state.confirm && state){
      this.element.main.replaceChildren(this.element.label);
      this.state.confirm = true;
    } else if (this.state.confirm && !state) {
      this.element.main.replaceChildren(this.element.content);
      this.state.confirm = false;
    }
  }
  #load(message){
    this.element.content.textContent = message;
    this.element.title.textContent = message;
    this.element.input.value = '';
    if (!this.state.loaded){
      document.body.append(this);
      this.state.loaded = true;
    }
    this.element.dialog.showModal();
    this.state.opened = true;
  }

  // 公共方法
  close(value){
    this.element.input.blur();
    this.element.dialog.close();
    this.state.opened = false;
    if (this.resolve){
      this.resolve(value);
      this.resolve = null;
    }
    return value;
  }

  alert(message){
    this.button.cancel.classList.add("none");
    this.#switch(false);
    this.#load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }

  prompt(message){
    this.button.cancel.classList.remove("none");
    this.#switch(false);
    this.#load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }

  confirm(message = "请输入"){
    this.button.cancel.classList.remove("none");
    this.#switch(true);
    this.#load(message);
    return new Promise((resolve)=>{
      this.resolve = resolve;
    });
  }
}
