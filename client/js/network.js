// Thin network adapter. All game-changing requests go to the server.
export class Network {
  constructor() {
    this.socket = io({ transports:["websocket","polling"] });
    this.state = null; this.handlers = {};
    for (const event of ["joined","state","notice","hitConfirm","roundEnd","matchEnd"]) {
      this.socket.on(event, data => { if(event==="state") this.state=data; this.handlers[event]?.(data); });
    }
  }
  on(event, fn) { this.handlers[event]=fn; }
  join(data) { this.socket.emit("join",data); }
  input(data) { this.socket.emit("input",data); }
  fire() { this.socket.emit("fire",{}); }
  ability() { this.socket.emit("ability"); }
  jump() { this.socket.emit("jump"); }
  pickup(id) { this.socket.emit("pickup",id); }
  buy(id) { this.socket.emit("buy",id); }
}
