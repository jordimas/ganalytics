const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Soup = imports.gi.Soup


let text, button, buttonText, buttonText2, box, timer1id, visits, timer1, timer2id, timer2;

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
        buttonText.set_text(visits.toString());
        return true;
    }

    _update2() {

        log("_update2");
        return true;
    }


    enable() {

        buttonText = new St.Label({
                    style_class: 'label',
                    text: "Button1",
                    y_align: Clutter.ActorAlign.CENTER
                });

        buttonText2 = new St.Label({
                    style_class: 'label',
                    text: "Button2",
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
        box.add(buttonText);
        box.add(buttonText2);

        button.set_child(icon);
        button.connect('button-press-event', this._showHello);
        Main.panel._rightBox.insert_child_at_index(box, 0);


        timer1 = 1000
        timer1id = Mainloop.timeout_add(timer1, Lang.bind(this, this._update1));
        timer2 = 1000
        timer2id = Mainloop.timeout_add(timer1, Lang.bind(this, this._update2));

    }

    disable() {
        Main.panel._rightBox.remove_child(box);
        Mainloop.source_remove(timer1id);
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

