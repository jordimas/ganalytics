const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Mainloop = imports.mainloop;


let text, button, buttonText, box, timerid, visits, timer;

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
        buttonText = new St.Label({
                    text: "Loading...",
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


        button.set_child(icon);
        button.connect('button-press-event', this._showHello);

        timer = 1000
        timerid = Mainloop.timeout_add(timer, Lang.bind(this, this._update));
    }

    _update() {
        visits = ++visits;
        buttonText.set_text(visits.toString());
        return true;
    }

    enable() {
        Main.panel._rightBox.insert_child_at_index(box, 0);
    }

    disable() {
        Main.panel._rightBox.remove_child(box);
        Mainloop.source_remove(timerid);
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

