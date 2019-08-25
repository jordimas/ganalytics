const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup


let text, button, box, timer1id, visits, timer2id;

const GAnalytics = class GAnalytics
{

    _hideHello() {
        Main.uiGroup.remove_actor(text);
        text = null;
    }

    _showHello() {
        if (!text) {
            text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
            Main.uiGroup.add_actor(text);
        }

        text.opacity = 255;

        let monitor = Main.layoutManager.primaryMonitor;

        text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                          monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

        Tweener.addTween(text,
                         { opacity: 0,
                           time: 2, 
                           transition: 'easeOutQuad',
                           onComplete: this._hideHello });

    }

    constructor() {
        visits = 0;
    }

    _update1() {
        visits = ++visits;
        this._buttonText.set_text(visits.toString());
        return true;
    }

    _update2() {

        global.log("Updated catalanitzador stats");

        let params = {};
        let _httpSession = new Soup.Session();
        let url = 'https://www.softcatala.org/catalanitzador/response.php';
        let message = Soup.form_request_new_from_hash('GET', url, params);

        _httpSession.queue_message(message, Lang.bind(this,
           function (_httpSession, message) {
             if (message.status_code !== 200)
               return;

             let txt = message.response_body.data;
             this._buttonText2.set_text("Cat: " + txt);
           })
        );
        return true;
    }

    _update3() {

        global.log("Updated TM stats");

        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth() + 1;
        let yyyy = today.getFullYear();
        let _date = yyyy + '-' + mm + '-' + dd;

        let params = {
            date : _date
        };

        let _httpSession = new Soup.Session();
        let url = 'https://www.softcatala.org/recursos/tm/api/stats';
        let message = Soup.form_request_new_from_hash('GET', url, params);

        _httpSession.queue_message(message, Lang.bind(this,
           function (_httpSession, message) {
             global.log("Request done: " + message.status_code);
             let txt2 = message.response_body.data;
             global.log(txt2);
            
             if (message.status_code !== 200)
               return;

             var myRegexp = new RegExp('"searches": "([0-9]*)"');
             var match = myRegexp.exec(message.response_body.data);
             this._buttonText3.set_text("TM: " + match[1]);
           })
        );
        return true;
    }


    enable() {

        this._buttonText = new St.Label({
                    style_class: 'label',
                    text: "Button1",
                    y_align: Clutter.ActorAlign.CENTER
                });

        this._buttonText2 = new St.Label({
                    style_class: 'label',
                    text: "Button2",
                    y_align: Clutter.ActorAlign.CENTER
                });

        this._buttonText3 = new St.Label({
                    style_class: 'label',
                    text: "Button3",
                    y_align: Clutter.ActorAlign.CENTER
                });

        button = new St.Bin({ style_class: 'panel-button',
                              reactive: true,
                              can_focus: true,
                              x_fill: true,
                              y_fill: false,
                              track_hover: true });

        let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                                 style_class: 'system-status-icon' });

        box = new St.BoxLayout({ style_class: 'panel-launcher-box'});
        box.add(button);
        box.add(this._buttonText);
        box.add(this._buttonText2);
        box.add(this._buttonText3);

        button.set_child(icon);
        button.connect('button-press-event', this._showHello);
        Main.panel._rightBox.insert_child_at_index(box, 0);

        this._update1();
        this._update2();
        this._update3();

        let timer1 = 1000
        this._timer1id = Mainloop.timeout_add(timer1, Lang.bind(this, this._update1));

        let timer2 = 1000 * 60 * 15
        this._timer2id = Mainloop.timeout_add(timer2, Lang.bind(this, this._update2));

        let timer3 = 1000 * 60 * 15
        this._timer3id = Mainloop.timeout_add(timer3, Lang.bind(this, this._update3));

    }

    disable() {
        Main.panel._rightBox.remove_child(box);
        Mainloop.source_remove(this._timer1id);
        Mainloop.source_remove(this._timer2id);
        Mainloop.source_remove(this._timer3id);
    }
};

let _instance;

function init() {
    _instance = new GAnalytics();
    return _instance;
}

function enable() {
   _instance.enable();
}

function disable() {
   _instance.disable();
}

